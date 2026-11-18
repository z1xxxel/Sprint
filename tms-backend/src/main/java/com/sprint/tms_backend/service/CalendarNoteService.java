package com.sprint.tms_backend.service;

import com.sprint.tms_backend.DTO.CalendarNoteDTO;
import com.sprint.tms_backend.DTO.CreateNoteRequest;
import com.sprint.tms_backend.model.CalendarNote;
import com.sprint.tms_backend.repository.CalendarNoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarNoteService {

    private final CalendarNoteRepository repo;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    public List<CalendarNoteDTO> getUserNotes(Long userId) {
        return repo.findByUserIdOrderByNoteTimeAsc(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public CalendarNoteDTO create(Long userId, CreateNoteRequest req) {
        if (req.title() == null || req.title().trim().isEmpty()) {
            throw new RuntimeException("Заголовок заметки обязателен");
        }
        if (req.noteTime() == null) {
            throw new RuntimeException("Укажите время заметки");
        }
        CalendarNote note = new CalendarNote();
        note.setUserId(userId);
        note.setTitle(req.title().trim());
        note.setText(req.text());
        note.setNoteTime(req.noteTime());
        note.setRemindMinutesBefore(req.remindMinutesBefore());
        note.setReminderSent(false);
        note.setToastShown(false);
        return mapToDto(repo.save(note));
    }

    @Transactional
    public CalendarNoteDTO update(Long noteId, Long userId, CreateNoteRequest req) {
        CalendarNote note = repo.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Заметка не найдена"));
        if (!note.getUserId().equals(userId)) {
            throw new SecurityException("Нельзя редактировать чужую заметку");
        }
        note.setTitle(req.title().trim());
        note.setText(req.text());
        note.setNoteTime(req.noteTime());
        note.setRemindMinutesBefore(req.remindMinutesBefore());
        // сброс — при редактировании снова ждём напоминание
        note.setReminderSent(false);
        note.setToastShown(false);
        return mapToDto(repo.save(note));
    }

    @Transactional
    public void delete(Long noteId, Long userId) {
        CalendarNote note = repo.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Заметка не найдена"));
        if (!note.getUserId().equals(userId)) {
            throw new SecurityException("Нельзя удалить чужую заметку");
        }
        repo.delete(note);
    }

    /** Заметки, по которым нужно показать toast на клиенте (напоминание уже сгенерировано) */
    @Transactional(readOnly = true)
    public List<CalendarNoteDTO> getPendingToasts(Long userId) {
        return repo.findByUserIdAndReminderSentTrueAndToastShownFalse(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    /** Отметить, что toast показан */
    @Transactional
    public void markToastShown(Long noteId, Long userId) {
        CalendarNote note = repo.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Заметка не найдена"));
        if (!note.getUserId().equals(userId)) {
            throw new SecurityException("Нельзя менять чужую заметку");
        }
        note.setToastShown(true);
        repo.save(note);
    }

    /** Каждые 30 сек — генерируем напоминания (уведомление в bell) */
    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<CalendarNote> pending = repo.findByReminderSentFalseAndRemindMinutesBeforeIsNotNull();
        for (CalendarNote note : pending) {
            LocalDateTime remindAt = note.getNoteTime().minusMinutes(note.getRemindMinutesBefore());
            if (!now.isBefore(remindAt) && now.isBefore(note.getNoteTime().plusHours(1))) {
                try {
                    String timeStr = note.getNoteTime().format(TIME_FMT);
                    String msg = "Напоминание о заметке «" + note.getTitle() + "» в " + timeStr;
                    if (note.getText() != null && !note.getText().isBlank()) {
                        msg += ". " + note.getText();
                    }
                    notificationService.notifyUser(
                            note.getUserId(),
                            "SYSTEM",
                            "Напоминание",
                            msg,
                            note.getId()
                    );
                    note.setReminderSent(true);
                    note.setToastShown(false);
                    repo.save(note);
                    log.info("Напоминание отправлено: userId={} noteId={} title={}",
                            note.getUserId(), note.getId(), note.getTitle());
                } catch (Exception e) {
                    log.error("Не удалось отправить напоминание для заметки {}", note.getId(), e);
                }
            }
        }
    }

    private CalendarNoteDTO mapToDto(CalendarNote n) {
        return new CalendarNoteDTO(
                n.getId(),
                n.getTitle(),
                n.getText(),
                n.getNoteTime(),
                n.getRemindMinutesBefore(),
                n.getCreatedAt()
        );
    }
}