package com.sprint.tms_backend.repository;

import com.sprint.tms_backend.model.KnowledgeArticle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {

    @Override
    @EntityGraph(attributePaths = {"category", "author"})
    Optional<KnowledgeArticle> findById(Long id);

    @EntityGraph(attributePaths = {"category", "author"})
    List<KnowledgeArticle> findAllByOrderByPublishedAtDesc();

    @EntityGraph(attributePaths = {"category", "author"})
    List<KnowledgeArticle> findByCategoryIdOrderByPublishedAtDesc(Long categoryId);

    @Query("SELECT a FROM KnowledgeArticle a " +
            "WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')) " +
            "   OR LOWER(a.content) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')) " +
            "ORDER BY a.publishedAt DESC")
    @EntityGraph(attributePaths = {"category", "author"})
    List<KnowledgeArticle> searchByText(@Param("q") String q);

    @Query("SELECT a FROM KnowledgeArticle a " +
            "WHERE a.category.id = :categoryId " +
            "AND (LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')) " +
            "   OR LOWER(a.content) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))) " +
            "ORDER BY a.publishedAt DESC")
    @EntityGraph(attributePaths = {"category", "author"})
    List<KnowledgeArticle> searchByTextAndCategory(@Param("q") String q,
                                                   @Param("categoryId") Long categoryId);

    long countByCategoryId(Long categoryId);
}