package com.sprint.tms_backend.controller;

import com.sprint.tms_backend.model.UserNotification;
import com.sprint.tms_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotification>> list(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> unread(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", service.countUnread(userId)));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> readAll(@PathVariable Long userId) {
        service.markAllRead(userId);
        return ResponseEntity.ok("OK");
    }
}