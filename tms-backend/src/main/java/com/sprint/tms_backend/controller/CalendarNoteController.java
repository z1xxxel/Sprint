package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.DTO.CalendarNoteDTO;
import com.sprint.tms_backend.DTO.CreateNoteRequest;
import com.sprint.tms_backend.service.CalendarNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class CalendarNoteController {

    private final CalendarNoteService service;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CalendarNoteDTO>> list(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUserNotes(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<CalendarNoteDTO> create(
            @PathVariable Long userId,
            @RequestBody CreateNoteRequest req) {
        return ResponseEntity.ok(service.create(userId, req));
    }

    @PutMapping("/{noteId}/user/{userId}")
    public ResponseEntity<CalendarNoteDTO> update(
            @PathVariable Long noteId,
            @PathVariable Long userId,
            @RequestBody CreateNoteRequest req) {
        return ResponseEntity.ok(service.update(noteId, userId, req));
    }

    @DeleteMapping("/{noteId}/user/{userId}")
    public ResponseEntity<String> delete(
            @PathVariable Long noteId,
            @PathVariable Long userId) {
        service.delete(noteId, userId);
        return ResponseEntity.ok("Заметка удалена");
    }

    /** Заметки, по которым нужно показать toast (напоминание уже сгенерировано) */
    @GetMapping("/user/{userId}/pending-toasts")
    public ResponseEntity<List<CalendarNoteDTO>> pendingToasts(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getPendingToasts(userId));
    }

    /** Отметить, что toast уже показан на клиенте */
    @PutMapping("/{noteId}/user/{userId}/toast-shown")
    public ResponseEntity<String> markToastShown(
            @PathVariable Long noteId,
            @PathVariable Long userId) {
        service.markToastShown(noteId, userId);
        return ResponseEntity.ok("OK");
    }
}