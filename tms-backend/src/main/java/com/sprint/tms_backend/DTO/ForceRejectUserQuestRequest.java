package com.sprint.tms_backend.DTO;

public record ForceRejectUserQuestRequest(
        Long actorId,
        Boolean applyPenalty,
        String reason
) {}