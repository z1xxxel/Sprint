package com.sprint.tms_backend.DTO;

public record ReviewRequest(
        Long userId,
        Integer rating,
        String comment
) {}