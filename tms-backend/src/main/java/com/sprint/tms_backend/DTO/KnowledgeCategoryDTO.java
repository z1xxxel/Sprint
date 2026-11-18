package com.sprint.tms_backend.DTO;

public record KnowledgeCategoryDTO(
        Long id,
        String name,
        String description,
        Integer sortOrder,
        long articleCount
) {}