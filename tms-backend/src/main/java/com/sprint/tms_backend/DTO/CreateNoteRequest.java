package com.sprint.tms_backend.DTO;

import java.time.LocalDateTime;

public record CreateNoteRequest(
        String title,
        String text,
        LocalDateTime noteTime,
        Integer remindMinutesBefore
) {}