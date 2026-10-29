package com.sprint.tms_backend.service;

import com.sprint.tms_backend.model.SystemSetting;
import com.sprint.tms_backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository repository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public BigDecimal getDecimal(String key, BigDecimal defaultValue) {
        String val = cache.computeIfAbsent(key, k ->
                repository.findById(k).map(SystemSetting::getSettingValue).orElse(null)
        );
        if (val == null || val.trim().isEmpty()) return defaultValue;
        try {
            return new BigDecimal(val);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Transactional
    public void updateSetting(String key, String value) {
        SystemSetting setting = repository.findById(key)
                .orElseThrow(() -> new RuntimeException("Настройка не найдена"));
        setting.setSettingValue(value);
        repository.save(setting);
        cache.put(key, value);
    }

    public void clearCache() {
        cache.clear();
    }
}