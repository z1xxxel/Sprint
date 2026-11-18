package com.sprint.tms_backend.DTO;

import java.time.LocalDateTime;

public record CalendarNoteDTO(
        Long id,
        String title,
        String text,
        LocalDateTime noteTime,
        Integer remindMinutesBefore,
        LocalDateTime createdAt
) {}