package com.sprint.tms_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {
    @Id
    private String settingKey;

    @Column(nullable = false)
    private String settingValue;

    private String label;
    private String description;
    private String category;
}