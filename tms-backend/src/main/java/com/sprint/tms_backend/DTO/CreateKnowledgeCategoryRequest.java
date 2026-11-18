package com.sprint.tms_backend.DTO;

public record CreateKnowledgeCategoryRequest(
        Long actorId,
        String name,
        String description,
        Integer sortOrder
) {}