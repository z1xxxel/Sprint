package com.sprint.tms_backend.repository;

import com.sprint.tms_backend.model.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, Long> {
    Optional<KnowledgeCategory> findByName(String name);
    boolean existsByName(String name);
    List<KnowledgeCategory> findAllByOrderBySortOrderAsc();
}