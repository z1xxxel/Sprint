package com.sprint.tms_backend.service;

import com.sprint.tms_backend.model.EventStatus;
import com.sprint.tms_backend.model.Treasury;
import com.sprint.tms_backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventSchedulerService {

    private final EventRepository eventRepository;
    private final EventRewardService rewardService;
    private final SurveyService surveyService;
    private final SeasonService seasonService;
    private final TreasuryService treasuryService;
    private final SettingsService settingsService; // <-- ДОБАВЛЕНО

    // Раз в 30 секунд проверяем события
    @Scheduled(fixedRate = 30_000)
    public void completeExpiredEvents() {
        List<Long> ids = eventRepository.findIdsToComplete(
                EventStatus.ASSIGNED, LocalDateTime.now());

        if (!ids.isEmpty()) {
            log.info("Найдено {} событий для завершения", ids.size());
        }

        for (Long id : ids) {
            try {
                rewardService.completeAndAward(id);
            } catch (Exception e) {
                log.error("Не удалось завершить событие {}", id, e);
            }
        }
    }

    // Раз в 5 минут проверяем просроченные опросы
    @Scheduled(fixedRate = 300_000)
    public void checkExpiredSurveys() {
        try {
            surveyService.applyPenaltiesForExpiredSurveys();
        } catch (Exception e) {
            log.error("Ошибка при начислении штрафов за опросы", e);
        }
    }

    // Раз в час проверяем истекшие сезоны
    @Scheduled(fixedRate = 3_600_000)
    public void checkExpiredSeasons() {
        try {
            seasonService.closeExpiredSeasons();
        } catch (Exception e) {
            log.error("Ошибка при закрытии сезонов", e);
        }
    }

    // Запускается 1-го числа каждого месяца в 00:00
    @Scheduled(cron = "0 0 0 1 * *")
    public void refillTreasuryMonthly() {
        log.info("Запуск проверки ежемесячного пополнения Казны...");

        Treasury current = treasuryService.getTreasury();

        // Берем порог и сумму из настроек (если настройки нет, используем значения по умолчанию)
        BigDecimal threshold = settingsService.getDecimal("economy.treasury.threshold", new BigDecimal("1000"));
        BigDecimal refillAmount = settingsService.getDecimal("economy.treasury.auto-refill-amount", new BigDecimal("50000"));

        // Если баланс ниже порога — пополняем
        if (current.getBalance().compareTo(threshold) < 0) {
            treasuryService.fundTreasury(refillAmount);
            log.info("Казна автоматически пополнена на {} монет (баланс был ниже {})", refillAmount, threshold);
        } else {
            log.info("Автопополнение не требуется. Баланс казны: {} (порог: {})", current.getBalance(), threshold);
        }
    }
}