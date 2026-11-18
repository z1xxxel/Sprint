package com.sprint.tms_backend.repository;

import com.sprint.tms_backend.model.CalendarNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarNoteRepository extends JpaRepository<CalendarNote, Long> {
    List<CalendarNote> findByUserIdOrderByNoteTimeAsc(Long userId);
    List<CalendarNote> findByReminderSentFalseAndRemindMinutesBeforeIsNotNull();

    /** Заметки, напоминания по которым уже сгенерированы, но клиент их ещё не показывал как toast */
    List<CalendarNote> findByUserIdAndReminderSentTrueAndToastShownFalse(Long userId);
}