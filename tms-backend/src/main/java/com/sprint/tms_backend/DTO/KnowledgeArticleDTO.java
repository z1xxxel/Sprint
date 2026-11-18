package com.sprint.tms_backend.DTO;

import java.time.LocalDateTime;

public record KnowledgeArticleDTO(
        Long id,
        String title,
        String content,
        Long categoryId,
        String categoryName,
        Long authorId,
        String authorName,
        String publishedByName,
        LocalDateTime publishedAt,
        LocalDateTime updatedAt
) {}