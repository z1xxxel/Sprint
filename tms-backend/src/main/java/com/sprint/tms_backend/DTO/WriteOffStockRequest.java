package com.sprint.tms_backend.DTO;

public record WriteOffStockRequest(
        Integer quantity,
        String reason,
        Long recipientId,
        String comment
) {}