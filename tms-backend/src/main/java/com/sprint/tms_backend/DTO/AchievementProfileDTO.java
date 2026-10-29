package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AchievementProfileDTO(
        String groupCode,
        String name,
        String description,
        String iconUrl,
        boolean isEarned,
        List<LevelDetail> levels
) {
    public record LevelDetail(
            Integer level,
            String title,
            String condition,
            Integer requiredProgress,
            BigDecimal rewardCoins,
            boolean isEarned,
            LocalDateTime earnedAt
    ) {}
}