package com.sprint.tms_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_write_offs")
@Data
public class StockWriteOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 20)
    private String reason;

    private Long recipientId;
    private String recipientName;

    @Column(nullable = false)
    private Long actorId;
    @Column(nullable = false)
    private String actorName;

    @Column(length = 500)
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;
}