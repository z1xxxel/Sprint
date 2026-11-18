package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;

public record ReviewKnowledgeSubmissionRequest(
        Long actorId,
        Boolean approve,
        BigDecimal rewardCoins,
        Double rewardRating,
        String rejectionReason
) {}