package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.DTO.StreakInfoDTO;
import com.sprint.tms_backend.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streak")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    @PostMapping("/touch")
    public ResponseEntity<StreakInfoDTO> touch(@RequestParam Long userId) {
        return ResponseEntity.ok(streakService.touchStreak(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<StreakInfoDTO> get(@PathVariable Long userId) {
        return ResponseEntity.ok(streakService.getStreak(userId));
    }
}