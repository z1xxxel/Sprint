package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.DTO.CreateSurveyRequest;
import com.sprint.tms_backend.DTO.SubmitSurveyRequest;
import com.sprint.tms_backend.DTO.SurveyStatsResponseDTO;
import com.sprint.tms_backend.DTO.SurveyUserResponseDTO;
import com.sprint.tms_backend.model.Survey;
import com.sprint.tms_backend.model.SurveyResponse;
import com.sprint.tms_backend.model.SurveyTemplate;
import com.sprint.tms_backend.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    public ResponseEntity<Survey> createSurvey(@RequestBody CreateSurveyRequest request) {
        return new ResponseEntity<>(surveyService.createSurvey(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Survey>> getAllSurveys(
            @RequestParam(required = false) Boolean isActive) {

        if (isActive != null) {
            return ResponseEntity.ok(surveyService.getSurveysByStatus(isActive));
        }
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<String> submitSurvey(
            @PathVariable Long id,
            @RequestBody SubmitSurveyRequest request) {
        surveyService.submitSurvey(id, request);
        return ResponseEntity.ok("Спасибо за прохождение опроса!");
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<SurveyResponse>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getSurveyResults(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSurvey(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        surveyService.deleteSurvey(id, actorId);
        return ResponseEntity.ok("Опрос успешно удален");
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<SurveyStatsResponseDTO> getSurveyStats(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        return ResponseEntity.ok(surveyService.getSurveyStats(id, actorId));
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<List<SurveyUserResponseDTO>> getDetailedResponses(
            @PathVariable Long id,
            @RequestParam Long actorId) {
        return ResponseEntity.ok(surveyService.getDetailedResponses(id, actorId));
    }

    @PostMapping("/{id}/save-as-template")
    public ResponseEntity<SurveyTemplate> saveAsTemplate(
            @PathVariable Long id,
            @RequestParam Long actorId,
            @RequestParam String templateName) {
        return ResponseEntity.ok(surveyService.saveAsTemplate(id, actorId, templateName));
    }
}