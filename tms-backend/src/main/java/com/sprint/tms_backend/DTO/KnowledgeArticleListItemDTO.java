package com.sprint.tms_backend.DTO;

import java.time.LocalDateTime;

public record KnowledgeArticleListItemDTO(
        Long id,
        String title,
        String excerpt,
        Long categoryId,
        String categoryName,
        Long authorId,
        String authorName,
        LocalDateTime publishedAt
) {}