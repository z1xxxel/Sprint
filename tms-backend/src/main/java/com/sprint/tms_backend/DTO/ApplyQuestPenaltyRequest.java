package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;
import java.util.List;

public record ApplyQuestPenaltyRequest(
        Long actorId,
        List<Long> userIds,
        Boolean applyCoins,
        Boolean applyRating,
        BigDecimal coinsAmount,   // NEW
        Double ratingAmount,      // NEW
        String reason
) {}