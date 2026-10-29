package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;

public record PenaltyRequest(
        Long actorId,
        Long userId,
        BigDecimal coins,
        Double rating,
        String reason
) {}