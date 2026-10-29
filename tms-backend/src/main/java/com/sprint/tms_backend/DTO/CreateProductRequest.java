package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        List<String> images,
        Long categoryId,
        Boolean hasVariants,
        List<CreateProductVariantRequest> variants,
        Boolean isActive
) {}