package com.sprint.tms_backend.DTO;

import com.sprint.tms_backend.model.KnowledgeSubmissionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record KnowledgeSubmissionDTO(
        Long id,
        Long targetArticleId,
        String targetArticleTitle,
        String targetOriginalContent,
        String title,
        String content,
        Long categoryId,
        String categoryName,
        Long authorId,
        String authorName,
        String commentFromAuthor,
        KnowledgeSubmissionStatus status,
        BigDecimal rewardCoins,
        Double rewardRating,
        String rejectionReason,
        Long reviewedById,
        String reviewedByName,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {}