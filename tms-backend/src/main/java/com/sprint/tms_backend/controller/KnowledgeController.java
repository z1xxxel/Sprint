package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.DTO.*;
import com.sprint.tms_backend.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    // ==========================================
    // === КАТЕГОРИИ
    // ==========================================

    @GetMapping("/categories")
    public ResponseEntity<List<KnowledgeCategoryDTO>> listCategories() {
        return ResponseEntity.ok(knowledgeService.listCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<KnowledgeCategoryDTO> createCategory(
            @RequestBody CreateKnowledgeCategoryRequest req) {
        return new ResponseEntity<>(knowledgeService.createCategory(req), HttpStatus.CREATED);
    }

    // ==========================================
    // === СТАТЬИ
    // ==========================================

    @GetMapping("/articles")
    public ResponseEntity<List<KnowledgeArticleListItemDTO>> listArticles(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(knowledgeService.listArticles(query, categoryId));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<KnowledgeArticleDTO> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeService.getArticle(id));
    }

    // ==========================================
    // === ЗАЯВКИ
    // ==========================================

    @PostMapping("/submissions")
    public ResponseEntity<KnowledgeSubmissionDTO> createSubmission(
            @RequestBody CreateKnowledgeSubmissionRequest req) {
        return new ResponseEntity<>(knowledgeService.createSubmission(req), HttpStatus.CREATED);
    }

    @GetMapping("/submissions/my")
    public ResponseEntity<List<KnowledgeSubmissionDTO>> getMySubmissions(
            @RequestParam Long userId) {
        return ResponseEntity.ok(knowledgeService.getMySubmissions(userId));
    }

    @GetMapping("/submissions/pending")
    public ResponseEntity<List<KnowledgeSubmissionDTO>> getPendingSubmissions(
            @RequestParam Long actorId) {
        return ResponseEntity.ok(knowledgeService.getPendingSubmissions(actorId));
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<KnowledgeSubmissionDTO> getSubmissionDetails(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        return ResponseEntity.ok(knowledgeService.getSubmissionDetails(id, actorId));
    }

    @PostMapping("/submissions/{id}/review")
    public ResponseEntity<KnowledgeSubmissionDTO> reviewSubmission(
            @PathVariable Long id,
            @RequestBody ReviewKnowledgeSubmissionRequest req) {
        return ResponseEntity.ok(knowledgeService.reviewSubmission(id, req));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<String> deleteSubmission(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        knowledgeService.deleteSubmission(id, actorId);
        return ResponseEntity.ok("Заявка удалена");
    }
}