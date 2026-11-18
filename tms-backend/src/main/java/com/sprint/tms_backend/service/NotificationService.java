package com.sprint.tms_backend.service;

import com.sprint.tms_backend.model.UserNotification;
import com.sprint.tms_backend.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserNotificationRepository repo;

    @Transactional
    public void notifyUser(Long userId, String type, String title, String message, Long relatedId) {
        UserNotification n = new UserNotification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRelatedId(relatedId);
        repo.save(n);
    }

    @Transactional(readOnly = true)
    public List<UserNotification> getUserNotifications(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        repo.markAllReadByUserId(userId);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        UserNotification n = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Уведомление не найдено"));
        if (!n.getUserId().equals(userId)) {
            throw new SecurityException("Это не ваше уведомление");
        }
        n.setIsRead(true);
        repo.save(n);
    }
}