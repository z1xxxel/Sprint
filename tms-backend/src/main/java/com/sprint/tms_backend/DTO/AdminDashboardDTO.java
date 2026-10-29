package com.sprint.tms_backend.DTO;

import java.math.BigDecimal;

public record AdminDashboardDTO(
        long totalUsers,
        long totalProducts,
        BigDecimal totalCoinsInSystem,

        long pendingOrders,
        long pendingEvents,
        long pendingTickets,
        long pendingQuests
) {}