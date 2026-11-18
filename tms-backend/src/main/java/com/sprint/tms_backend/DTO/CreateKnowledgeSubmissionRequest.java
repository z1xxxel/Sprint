package com.sprint.tms_backend.DTO;

public record CreateKnowledgeSubmissionRequest(
        Long actorId,
        Long targetArticleId,
        String title,
        String content,
        Long categoryId,
        String commentFromAuthor
) {}