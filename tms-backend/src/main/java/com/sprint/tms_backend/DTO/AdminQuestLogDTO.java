package com.sprint.tms_backend.DTO;

import com.sprint.tms_backend.model.QuestProgressStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminQuestLogDTO(
        Long userQuestId,
        Long questId,
        String questTitle,
        String questDescription,          // ← NEW
        Long userId,
        String userName,
        QuestProgressStatus status,
        BigDecimal rewardCoins,
        Double rewardRating,
        BigDecimal penaltyCoins,
        Double penaltyRating,
        LocalDateTime deadline,
        LocalDateTime deadlineOverride,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        LocalDateTime completedAt,
        String adminComment,
        String creatorName,
        LocalDateTime questCreatedAt
) {}