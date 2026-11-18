package com.sprint.tms_backend.repository;

import com.sprint.tms_backend.model.KnowledgeSubmission;
import com.sprint.tms_backend.model.KnowledgeSubmissionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeSubmissionRepository extends JpaRepository<KnowledgeSubmission, Long> {

    @EntityGraph(attributePaths = {"category", "author", "reviewedBy"})
    List<KnowledgeSubmission> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @EntityGraph(attributePaths = {"category", "author"})
    List<KnowledgeSubmission> findByStatusOrderByCreatedAtAsc(KnowledgeSubmissionStatus status);

    @EntityGraph(attributePaths = {"category", "author", "reviewedBy"})
    List<KnowledgeSubmission> findByStatusAndAuthorIdOrderByCreatedAtDesc(
            KnowledgeSubmissionStatus status, Long authorId);

    long countByStatus(KnowledgeSubmissionStatus status);
}