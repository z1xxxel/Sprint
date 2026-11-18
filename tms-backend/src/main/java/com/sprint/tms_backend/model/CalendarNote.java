package com.sprint.tms_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_notes", indexes = {
        @Index(name = "idx_note_user", columnList = "userId"),
        @Index(name = "idx_note_time", columnList = "noteTime")
})
@Data
public class CalendarNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String text;

    @Column(nullable = false)
    private LocalDateTime noteTime;

    private Integer remindMinutesBefore;

    @Column(nullable = false)
    private Boolean reminderSent = false;

    /** true → toast уже показан на клиенте, повторно не показываем */
    @Column(nullable = false)
    private Boolean toastShown = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}