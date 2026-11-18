package com.sprint.tms_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_submissions", indexes = {
        @Index(name = "idx_kb_sub_status", columnList = "status"),
        @Index(name = "idx_kb_sub_author", columnList = "author_id")
})
@Data
public class KnowledgeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_article_id")
    private Long targetArticleId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 20000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KnowledgeCategory category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department"})
    private User author;

    @Column(name = "original_content_snapshot", length = 20000)
    private String originalContentSnapshot;

    @Column(name = "comment_from_author", length = 500)
    private String commentFromAuthor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KnowledgeSubmissionStatus status = KnowledgeSubmissionStatus.PENDING;

    @Column(name = "reward_coins", precision = 19, scale = 2)
    private BigDecimal rewardCoins;

    @Column(name = "reward_rating")
    private Double rewardRating;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "department"})
    private User reviewedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}