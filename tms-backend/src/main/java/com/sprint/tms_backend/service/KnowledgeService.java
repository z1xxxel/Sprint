package com.sprint.tms_backend.service;

import com.sprint.tms_backend.DTO.*;
import com.sprint.tms_backend.model.*;
import com.sprint.tms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeCategoryRepository categoryRepository;
    private final KnowledgeArticleRepository articleRepository;
    private final KnowledgeSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final CoinTransactionRepository coinTxRepository;
    private final RatingTransactionRepository ratingTxRepository;
    private final TreasuryService treasuryService;
    private final EconomyLimitService economyLimitService;
    private final NotificationService notificationService;

    // ==========================================
    // === КАТЕГОРИИ
    // ==========================================

    @Transactional(readOnly = true)
    public List<KnowledgeCategoryDTO> listCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(c -> new KnowledgeCategoryDTO(
                        c.getId(),
                        c.getName(),
                        c.getDescription(),
                        c.getSortOrder(),
                        articleRepository.countByCategoryId(c.getId())
                ))
                .toList();
    }

    @Transactional
    public KnowledgeCategoryDTO createCategory(CreateKnowledgeCategoryRequest req) {
        User actor = userRepository.findById(req.actorId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        if (!actor.getRole().has(Permission.KNOWLEDGE_MANAGE)) {
            throw new SecurityException("Нет прав на управление категориями базы знаний");
        }
        if (req.name() == null || req.name().trim().isEmpty()) {
            throw new RuntimeException("Название категории обязательно");
        }
        if (categoryRepository.existsByName(req.name().trim())) {
            throw new RuntimeException("Категория с таким названием уже существует");
        }
        KnowledgeCategory c = new KnowledgeCategory();
        c.setName(req.name().trim());
        c.setDescription(req.description());
        c.setSortOrder(req.sortOrder() != null ? req.sortOrder() : 0);
        KnowledgeCategory saved = categoryRepository.save(c);
        return new KnowledgeCategoryDTO(
                saved.getId(), saved.getName(), saved.getDescription(),
                saved.getSortOrder(), 0);
    }

    // ==========================================
    // === СТАТЬИ (ОПУБЛИКОВАННЫЕ)
    // ==========================================

    @Transactional(readOnly = true)
    public List<KnowledgeArticleListItemDTO> listArticles(String query, Long categoryId) {
        String q = (query == null || query.trim().isEmpty()) ? null : query.trim();

        List<KnowledgeArticle> articles;
        if (q == null && categoryId == null) {
            articles = articleRepository.findAllByOrderByPublishedAtDesc();
        } else if (q == null) {
            articles = articleRepository.findByCategoryIdOrderByPublishedAtDesc(categoryId);
        } else if (categoryId == null) {
            articles = articleRepository.searchByText(q);
        } else {
            articles = articleRepository.searchByTextAndCategory(q, categoryId);
        }

        return articles.stream()
                .map(a -> new KnowledgeArticleListItemDTO(
                        a.getId(),
                        a.getTitle(),
                        makeExcerpt(a.getContent()),
                        a.getCategory().getId(),
                        a.getCategory().getName(),
                        a.getAuthor().getId(),
                        a.getAuthor().getName(),
                        a.getPublishedAt()
                ))
                .toList();
    }

    private String makeExcerpt(String content) {
        if (content == null) return "";
        String flat = content.replaceAll("\\s+", " ").trim();
        return flat.length() > 200 ? flat.substring(0, 200) + "…" : flat;
    }

    @Transactional(readOnly = true)
    public KnowledgeArticleDTO getArticle(Long id) {
        KnowledgeArticle a = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Статья не найдена"));
        return new KnowledgeArticleDTO(
                a.getId(),
                a.getTitle(),
                a.getContent(),
                a.getCategory().getId(),
                a.getCategory().getName(),
                a.getAuthor().getId(),
                a.getAuthor().getName(),
                a.getPublishedBy() != null ? a.getPublishedBy().getName() : null,
                a.getPublishedAt(),
                a.getUpdatedAt()
        );
    }

    // ==========================================
    // === ЗАЯВКИ
    // ==========================================

    @Transactional
    public KnowledgeSubmissionDTO createSubmission(CreateKnowledgeSubmissionRequest req) {
        User author = userRepository.findById(req.actorId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (req.title() == null || req.title().trim().isEmpty()) {
            throw new RuntimeException("Заголовок обязателен");
        }
        if (req.content() == null || req.content().trim().length() < 20) {
            throw new RuntimeException("Содержание должно быть не короче 20 символов");
        }

        KnowledgeCategory category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new RuntimeException("Категория не найдена"));

        String originalSnapshot = null;
        if (req.targetArticleId() != null) {
            var article = articleRepository.findById(req.targetArticleId())
                    .orElseThrow(() -> new RuntimeException(
                            "Статья для правки не найдена (возможно, её удалили)"));
            originalSnapshot = article.getContent();
        }

        KnowledgeSubmission s = new KnowledgeSubmission();
        s.setTargetArticleId(req.targetArticleId());
        s.setTitle(req.title().trim());
        s.setContent(req.content().trim());
        s.setOriginalContentSnapshot(originalSnapshot);
        s.setCategory(category);
        s.setAuthor(author);
        s.setCommentFromAuthor(req.commentFromAuthor());
        s.setStatus(KnowledgeSubmissionStatus.PENDING);
        KnowledgeSubmission saved = submissionRepository.save(s);

        // Уведомление всем, кто может одобрять
        try {
            List<User> approvers = userRepository.findAll().stream()
                    .filter(u -> u.getRole().has(Permission.KNOWLEDGE_MANAGE))
                    .filter(u -> !u.getId().equals(author.getId()))
                    .toList();

            String msg = (req.targetArticleId() == null ? "Новая статья" : "Правка статьи")
                    + " на модерации: «" + saved.getTitle() + "» от " + author.getName();

            for (User u : approvers) {
                notificationService.notifyUser(
                        u.getId(),
                        "KNOWLEDGE",
                        "База знаний",
                        msg,
                        saved.getId()
                );
            }
        } catch (Exception ignored) {}

        return mapSubmission(saved, true);

    }

    @Transactional(readOnly = true)
    public List<KnowledgeSubmissionDTO> getMySubmissions(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Пользователь не найден");
        }
        return submissionRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> mapSubmission(s, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<KnowledgeSubmissionDTO> getPendingSubmissions(Long actorId) {
        checkManageRights(actorId);
        return submissionRepository
                .findByStatusOrderByCreatedAtAsc(KnowledgeSubmissionStatus.PENDING)
                .stream()
                .map(s -> mapSubmission(s, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public KnowledgeSubmissionDTO getSubmissionDetails(Long id, Long actorId) {
        KnowledgeSubmission s = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        boolean isAuthor = s.getAuthor().getId().equals(actorId);
        boolean canManage = actor.getRole().has(Permission.KNOWLEDGE_MANAGE);

        if (!isAuthor && !canManage) {
            throw new SecurityException("Нет доступа к этой заявке");
        }

        return mapSubmission(s, canManage);
    }

    @Transactional
    public KnowledgeSubmissionDTO reviewSubmission(Long id, ReviewKnowledgeSubmissionRequest req) {
        User actor = userRepository.findById(req.actorId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        if (!actor.getRole().has(Permission.KNOWLEDGE_MANAGE)) {
            throw new SecurityException("Нет прав на модерацию базы знаний");
        }

        KnowledgeSubmission s = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
        if (s.getStatus() != KnowledgeSubmissionStatus.PENDING) {
            throw new RuntimeException("Эта заявка уже рассмотрена");
        }

        if (Boolean.TRUE.equals(req.approve())) {
            approveSubmission(s, actor, req);
        } else {
            rejectSubmission(s, actor, req);
        }

        return mapSubmission(s, true);
    }

    private void approveSubmission(KnowledgeSubmission s, User actor,
                                   ReviewKnowledgeSubmissionRequest req) {
        BigDecimal rewardCoins = req.rewardCoins() != null ? req.rewardCoins() : BigDecimal.ZERO;
        Double rewardRating = req.rewardRating() != null ? req.rewardRating() : 0.0;

        if (rewardCoins.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Сумма монет не может быть отрицательной");
        }
        if (rewardRating < 0) {
            throw new RuntimeException("Рейтинг не может быть отрицательным");
        }

        // 1. Публикуем/обновляем статью
        if (s.getTargetArticleId() == null) {
            KnowledgeArticle article = new KnowledgeArticle();
            article.setTitle(s.getTitle());
            article.setContent(s.getContent());
            article.setCategory(s.getCategory());
            article.setAuthor(s.getAuthor());
            article.setPublishedBy(actor);
            articleRepository.save(article);
        } else {
            KnowledgeArticle article = articleRepository.findById(s.getTargetArticleId())
                    .orElseThrow(() -> new RuntimeException(
                            "Статья для правки не найдена (возможно, её удалили)"));
            article.setTitle(s.getTitle());
            article.setContent(s.getContent());
            article.setCategory(s.getCategory());
            article.setPublishedBy(actor);
            articleRepository.save(article);
        }

        // 2. Начисляем награду
        if (rewardCoins.compareTo(BigDecimal.ZERO) > 0) {
            treasuryService.withdraw(rewardCoins);
            User author = s.getAuthor();

            economyLimitService.checkMonthlyLimit(author, rewardCoins);

            BigDecimal cur = author.getBalance() != null ? author.getBalance() : BigDecimal.ZERO;
            author.setBalance(cur.add(rewardCoins));
            userRepository.save(author);

            CoinTransaction tx = new CoinTransaction();
            tx.setFromUserId(null);
            tx.setToUserId(author.getId());
            tx.setAmount(rewardCoins);
            tx.setType(CoinTransactionType.KNOWLEDGE_REWARD);
            tx.setComment((s.getTargetArticleId() == null ? "Статья в Базе знаний: " : "Правка статьи: ")
                    + s.getTitle());
            coinTxRepository.save(tx);
        }

        if (rewardRating > 0) {
            User author = s.getAuthor();
            double cur = author.getRating() != null ? author.getRating() : 0.0;
            author.setRating(cur + rewardRating);
            userRepository.save(author);

            RatingTransaction rt = new RatingTransaction();
            rt.setUserId(author.getId());
            rt.setAmount(rewardRating);
            rt.setReason((s.getTargetArticleId() == null ? "Статья в Базе знаний: " : "Правка статьи: ")
                    + s.getTitle());
            ratingTxRepository.save(rt);
        }

        // 3. Обновляем заявку
        s.setStatus(KnowledgeSubmissionStatus.APPROVED);
        s.setRewardCoins(rewardCoins);
        s.setRewardRating(rewardRating);
        s.setReviewedBy(actor);
        s.setReviewedAt(LocalDateTime.now());
        submissionRepository.save(s);

        // 4. Уведомление
        try {
            StringBuilder msg = new StringBuilder();
            msg.append(s.getTargetArticleId() == null ? "Статья одобрена: " : "Правка одобрена: ");
            msg.append(s.getTitle());
            if (rewardCoins.compareTo(BigDecimal.ZERO) > 0) {
                msg.append(". +").append(rewardCoins.stripTrailingZeros().toPlainString()).append(" монет");
            }
            if (rewardRating > 0) {
                msg.append(", +").append(rewardRating).append(" рейтинга");
            }
            notificationService.notifyUser(
                    s.getAuthor().getId(),
                    "SYSTEM",
                    "База знаний",
                    msg.toString(),
                    null
            );
        } catch (Exception ignored) {}
    }

    private void rejectSubmission(KnowledgeSubmission s, User actor,
                                  ReviewKnowledgeSubmissionRequest req) {
        if (req.rejectionReason() == null || req.rejectionReason().trim().isEmpty()) {
            throw new RuntimeException("Укажите причину отклонения");
        }
        s.setStatus(KnowledgeSubmissionStatus.REJECTED);
        s.setRejectionReason(req.rejectionReason().trim());
        s.setReviewedBy(actor);
        s.setReviewedAt(LocalDateTime.now());
        submissionRepository.save(s);

        try {
            notificationService.notifyUser(
                    s.getAuthor().getId(),
                    "SYSTEM",
                    "Заявка в Базе знаний отклонена",
                    (s.getTargetArticleId() == null ? "Статья «" : "Правка «")
                            + s.getTitle() + "»: " + req.rejectionReason().trim(),
                    null
            );
        } catch (Exception ignored) {}
    }

    @Transactional
    public void deleteSubmission(Long id, Long actorId) {
        KnowledgeSubmission s = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        boolean isAuthor = s.getAuthor().getId().equals(actorId);
        boolean canManage = actor.getRole().has(Permission.KNOWLEDGE_MANAGE);

        if (!isAuthor && !canManage) {
            throw new SecurityException("Нет доступа");
        }
        if (isAuthor && s.getStatus() != KnowledgeSubmissionStatus.PENDING) {
            throw new RuntimeException("Можно удалять только заявки на модерации");
        }
        submissionRepository.delete(s);
    }

    // ==========================================
    // === MAPPERS
    // ==========================================

    private KnowledgeSubmissionDTO mapSubmission(KnowledgeSubmission s, boolean includeOriginal) {
        String targetTitle = null;
        String originalContent = null;

        if (s.getTargetArticleId() != null) {
            var articleOpt = articleRepository.findById(s.getTargetArticleId());
            if (articleOpt.isPresent()) {
                targetTitle = articleOpt.get().getTitle();
            } else {
                targetTitle = "(статья удалена)";
            }
            if (includeOriginal) {
                // Используем снимок на момент создания заявки — честный diff
                originalContent = s.getOriginalContentSnapshot() != null
                        ? s.getOriginalContentSnapshot()
                        : (articleOpt.isPresent() ? articleOpt.get().getContent() : null);
            }
        }

        return new KnowledgeSubmissionDTO(
                s.getId(),
                s.getTargetArticleId(),
                targetTitle,
                originalContent,
                s.getTitle(),
                s.getContent(),
                s.getCategory().getId(),
                s.getCategory().getName(),
                s.getAuthor().getId(),
                s.getAuthor().getName(),
                s.getCommentFromAuthor(),
                s.getStatus(),
                s.getRewardCoins(),
                s.getRewardRating(),
                s.getRejectionReason(),
                s.getReviewedBy() != null ? s.getReviewedBy().getId() : null,
                s.getReviewedBy() != null ? s.getReviewedBy().getName() : null,
                s.getCreatedAt(),
                s.getReviewedAt()
        );
    }

    private void checkManageRights(Long actorId) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        if (!actor.getRole().has(Permission.KNOWLEDGE_MANAGE)) {
            throw new SecurityException("Нет прав на модерацию базы знаний");
        }
    }
}