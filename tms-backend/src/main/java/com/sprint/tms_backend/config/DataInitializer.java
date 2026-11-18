package com.sprint.tms_backend.config;

import com.sprint.tms_backend.model.*;
import com.sprint.tms_backend.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductReviewRepository reviewRepository;
    private final FavoriteProductRepository favoriteRepository;
    private final DiscountRepository discountRepository;
    private final StockWriteOffRepository stockWriteOffRepository;
    private final ShopAuditLogRepository shopAuditLogRepository;
    private final OrderRepository orderRepository;

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    private final QuestRepository questRepository;
    private final UserQuestRepository userQuestRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final NewsRepository newsRepository;
    private final NewsRatingRepository newsRatingRepository;

    private final CoinTransactionRepository coinTxRepository;
    private final RatingTransactionRepository ratingTxRepository;
    private final TreasuryRepository treasuryRepository;
    private final TreasuryTransactionRepository treasuryTxRepository;
    private final SystemSettingRepository settingRepository;

    private final SeasonRepository seasonRepository;
    private final SeasonResultRepository seasonResultRepository;
    private final DepartmentResultRepository departmentResultRepository;
    private final DepartmentMemberResultRepository departmentMemberResultRepository;

    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyTemplateRepository surveyTemplateRepository;
    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final ChatRepository chatRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserNotificationRepository notificationRepository;
    private final CalendarNoteRepository noteRepository;

    private final KnowledgeCategoryRepository knowledgeCategoryRepository;
    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final KnowledgeSubmissionRepository knowledgeSubmissionRepository;

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        seedSettings();
        seedTreasury();
        seedKnowledgeCategories();

        if (userRepository.count() > 0) {
            log.info("База данных уже содержит пользователей. Пропускаем инициализацию.");
            seedAchievements();
            return;
        }

        // ==================================================
        // 1. ОТДЕЛЫ
        // ==================================================
        Department backend   = createDepartment("Backend Team",   "Серверная разработка");
        Department frontend  = createDepartment("Frontend Team",  "Клиентская разработка");
        Department qa        = createDepartment("QA Team",        "Тестирование и качество");
        Department support   = createDepartment("Support Team",   "Техническая поддержка");
        Department sales     = createDepartment("Sales Team",     "Отдел продаж");

        // ==================================================
        // 2. ПОЛЬЗОВАТЕЛИ
        // ==================================================
        User admin = createUser("Сергей Админов", "admin@tms.local", "123",
                UserRole.ADMIN, 48547.40, 11.0, 1600.0, null,
                "/uploads/6cea5f05-59ea-4eb6-b02f-bdb6bf983ee1.jpg");

        User hr = createUser("Ольга HR", "hr@tms.local", "123",
                UserRole.HR, 18000.00, 2.0, 150.0, null, null);

        User mgrBack = createUser("Иван Бэкендов", "mgr_back@tms.local", "123",
                UserRole.MANAGER, 5600.00, 0.0, 51.0, backend, null);

        User mgrFront = createUser("Анна Фронтендова", "mgr_front@tms.local", "123",
                UserRole.MANAGER, 4200.00, 1.0, 60.0, frontend, null);

        User empBack = createUser("Петр Кодеров", "emp_back@tms.local", "123",
                UserRole.EMPLOYEE, 8600.00, 0.0, 1600.0, backend, null);

        User empFront = createUser("Мария Верстальщикова", "emp_front@tms.local", "123",
                UserRole.EMPLOYEE, 3027.00, 0.0, 60.0, frontend, null);

        User empQa = createUser("Алексей Тестировщиков", "emp_qa@tms.local", "123",
                UserRole.EMPLOYEE, 1950.00, 0.0, 20.0, qa, null);

        User supportUser = createUser("Дмитрий Хелперов", "support@tms.local", "123",
                UserRole.SUPPORT, 1339.00, 3.0, 50.0, support, null);

        User empSales = createUser("Елена Продажникова", "emp_sales@tms.local", "123",
                UserRole.EMPLOYEE, 3350.00, 0.0, 8.0, sales, null);

        User organizer = createUser("Олег Организаторов", "org@tms.local", "123",
                UserRole.ORGANIZER, 2200.00, 0.0, 40.0, null, null);

        // ==================================================
        // 3. КАТЕГОРИИ И ТОВАРЫ (с картинками из базы)
        // ==================================================
        Category textiles    = createCategory("Текстиль", "Одежда с корпоративной символикой", 1,
                "/uploads/b039090b-3422-47ad-885f-3cc2d835512e.png");
        Category gadgets     = createCategory("Гаджеты", "Брендированные гаджеты", 2,
                "/uploads/afc5dcbe-55f4-450b-ac63-1ce3cfbfe94a.webp");
        Category accessories = createCategory("Аксессуары", "Полезные мелочи", 3,
                "/uploads/aa75cd38-be6b-4eb6-8316-5465aa0e5b1e.jpg");
        Category mugs        = createCategory("Кружки и термокружки", "Посуда с логотипом", 4,
                "/uploads/683551b7-9979-4a8b-94a9-0eaf0619fa72.png");
        Category leisure     = createCategory("Отдых", "Сертификаты и привилегии", 5,
                "/uploads/9e722cb4-f3ec-4fc6-838c-b47a8377f300.webp");

        Product tshirt = createProduct("Футболка классическая", "Хлопок 100%, логотип на груди",
                1400.00, 67, textiles, ProductType.PHYSICAL, true,
                "XS,S,M,L,XL,XXL", "Черный,Белый",
                "/uploads/afcb7e7e-f555-4eab-bb28-7a6bb97cb56e.png");

        Product tshirtAlt = createProduct("Футболка оверсайз", "Свободный крой, принт на спине",
                1500.00, 41, textiles, ProductType.PHYSICAL, true,
                "S,M,L,XL,XXL", "Черный",
                "/uploads/de2e3d1c-4cfa-4ae5-a757-58119fa8c7f9.webp");

        Product hoodie = createProduct("Худи", "Плотное худи с вышитым логотипом",
                3500.00, 51, textiles, ProductType.PHYSICAL, true,
                "S,M,L,XL,XXL", "Черный,Серый",
                "/uploads/0f088a22-fbc9-42c4-b639-f15e95cdbf8e.png");

        Product hoodiePrint = createProduct("Худи с принтом", "Худи с принтом на всю грудь",
                4000.00, 47, textiles, ProductType.PHYSICAL, true,
                "S,M,L,XL,XXL", "Черный,Белый",
                "/uploads/563cdfff-e949-49df-91fb-0c963891f234.png");

        Product sweatshirt = createProduct("Свитшот", "Тёплый свитшот на осень",
                2500.00, 18, textiles, ProductType.PHYSICAL, true,
                "M,L,XL", "Черный",
                "/uploads/d72883a9-3d59-4bd9-af4b-f3567cd0b6d3.png");

        Product shopper = createProduct("Шопер", "Эко-сумка с логотипом",
                800.00, 12, textiles, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/b9e40d9f-8def-4d07-ade0-1ea3388d97c7.png");

        Product cap = createProduct("Бейсболка", "Бейсболка с логотипом сервиса",
                600.00, 15, textiles, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/531b81e2-0b2b-4a15-9996-48e4fb5cd3da.png");

        Product powerbank = createProduct("Повербанк", "10 000 мАч, быстрая зарядка",
                3000.00, 7, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/1d0f3941-f853-422f-bef9-f0eca7371565.png");

        Product wireless = createProduct("Беспроводная зарядка", "Станция 15W",
                2500.00, 5, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/2a0b166d-3159-4234-8b24-23c520e62214.png");

        Product usb = createProduct("USB-флешка", "128 ГБ, металлический корпус",
                900.00, 20, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/ee448ce2-95b0-4fc1-abfe-efdc4bde7717.png");

        Product mouse = createProduct("Мышка", "Беспроводная, тихая",
                1800.00, 31, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/6821ab30-fcea-469b-ac53-52fa746ad582.webp");

        Product keyboard = createProduct("Клавиатура", "Механическая, брендированная",
                2500.00, 4, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/53f87134-4371-481c-bf97-1ff66683064b.png");

        Product headphones = createProduct("Наушники", "Bluetooth, накладные",
                3000.00, 4, gadgets, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/ac088799-af43-4cd5-8622-b20155fcd104.png");

        Product pin = createProduct("Значок", "Металлический значок с логотипом",
                50.00, 85, accessories, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/463b5b60-c623-4d45-9362-a5442d7df8f2.png");

        Product pen = createProduct("Ручка", "Стильная брендированная ручка",
                100.00, 56, accessories, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/0aa647be-a0a4-4c97-9977-f64e62f63826.png");

        Product notebook = createProduct("Блокнот", "А5, твёрдая обложка",
                250.00, 33, accessories, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/a3cc449f-aa94-4b43-aa06-cbfcf2447e46.png");

        Product thermomug = createProduct("Термокружка", "Держит тепло 6 часов",
                1200.00, 13, mugs, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/7ce3ab4c-5568-4fe4-b072-6ce35ec84169.png");

        Product thermobottle = createProduct("Термобутылка", "750 мл, нержавеющая сталь",
                1000.00, 18, mugs, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/b9ec56f3-51c3-4c07-86f5-198d6b411f5d.png");

        Product sportBottle = createProduct("Бутылка спортивная", "Спортивная бутылка брендированная",
                600.00, 7, mugs, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/62fde5b0-aee3-4c6b-95c6-ce977f443901.png");

        Product mug = createProduct("Кружка", "Керамическая кружка с логотипом",
                900.00, 1, mugs, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/dd8bf683-ebf0-49e3-abed-150593d2ae9a.png");

        Product dayOff = createProduct("Отгул", "Дополнительный выходной день",
                6000.00, 999, leisure, ProductType.PERK, false,
                null, null,
                "/uploads/d8669752-8259-4a03-9a17-fb501c87f2fb.webp");

        Product aquapark = createProduct("Сертификат в аквапарк", "На два лица",
                4000.00, 999, leisure, ProductType.PERK, false,
                null, null,
                "/uploads/61fe1e64-a689-40ac-af2e-37d2e804ad30.png");

        Product skating = createProduct("Сертификат на каток", "Один сеанс, прокат включён",
                1500.00, 120, leisure, ProductType.PHYSICAL, false,
                null, null,
                "/uploads/04deefc3-8adc-420d-a369-23a4125e2b9f.png");

        // ==================================================
        // 4. СКИДКИ, ОТЗЫВЫ, ИЗБРАННОЕ, СПИСАНИЯ
        // ==================================================
        createDiscount(hoodie, 20, 7);
        createDiscount(powerbank, 15, 5);
        createDiscount(aquapark, 25, 10);

        createReview(empBack, tshirt, 5, "Отличное качество, сидит идеально!");
        createReview(empFront, tshirt, 4, "Хорошая футболка, но маломерит.");
        createReview(empQa, hoodie, 5, "Тёплое, ношу каждый день.");
        createReview(empSales, thermomug, 5, "Держит тепло весь день.");
        createReview(mgrBack, powerbank, 4, "Заряжает телефон 3 раза, доволен.");

        createFavorite(admin, usb);
        createFavorite(admin, hoodie);
        createFavorite(empFront, sweatshirt);
        createFavorite(empQa, headphones);

        createWriteOff(powerbank, 2, "DAMAGED", admin, null, "Разбит при доставке");
        createWriteOff(pin, 5, "GIFT", hr, empBack, "Подарок на день рождения");

        // ==================================================
        // 5. КВЕСТЫ
        // ==================================================
        Quest q1 = createQuest("Прочитать книгу по программированию",
                "Прочитать книгу по программированию и оставить краткий отзыв.",
                200.00, "Все сотрудники", 30, hr, 1.0, false, null, null);
        Quest q2 = createQuest("Пробежать 10 км", "Спортивный челлендж: 10 км за раз",
                300.00, "Все сотрудники", 14, hr, 1.5, false, null, null);
        Quest q3 = createQuest("Помочь коллеге", "Помочь с задачами другому отделу",
                100.00, "Все сотрудники", 7, hr, 0.5, false, null, null);
        Quest q4 = createQuest("Пройти курс по Java", "Просмотреть 10 лекций и сдать тест",
                1000.00, "Все сотрудники", 21, hr, 2.0, false, null, null);
        Quest q5 = createQuest("Организовать митап", "Провести внутренний митап по обмену опытом",
                2000.00, "Все сотрудники", 45, hr, 5.0, false, null, null);
        Quest q6 = createQuest("Написать статью в блог", "Статья на 3000+ символов",
                800.00, "Все сотрудники", 10, hr, 1.0, false, null, null);
        Quest q7 = createQuest("Пройди опрос по вовлеченности",
                "Обязательный опрос раз в квартал",
                500.00, "Все сотрудники", 7, hr, 0.0, true, 100.0, 1.0);
        Quest q8 = createQuest("Утренняя зарядка",
                "5 дней подряд делать зарядку утром",
                300.00, "Все сотрудники", 8, hr, 1.5, false, null, null);
        Quest q9 = createQuest("Помощь новичку",
                "Онбординг нового сотрудника",
                1500.00, "Все сотрудники", 30, hr, 3.0, false, null, null);

        createUserQuest(empBack, q2, QuestProgressStatus.COMPLETED,
                LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(9), null);
        createUserQuest(empBack, q3, QuestProgressStatus.COMPLETED,
                LocalDateTime.now().minusDays(5), LocalDateTime.now().minusDays(4), null);
        createUserQuest(empFront, q2, QuestProgressStatus.PENDING_REVIEW,
                LocalDateTime.now().minusDays(3), LocalDateTime.now().minusDays(1), null);
        createUserQuest(empQa, q1, QuestProgressStatus.IN_PROGRESS,
                LocalDateTime.now().minusDays(2), null, null);
        createUserQuest(empSales, q6, QuestProgressStatus.REJECTED,
                LocalDateTime.now().minusDays(7), LocalDateTime.now().minusDays(5),
                "Недостаточно объёма, дополните и сдайте повторно");
        createUserQuest(empFront, q8, QuestProgressStatus.COMPLETED,
                LocalDateTime.now().minusDays(15), LocalDateTime.now().minusDays(14), null);

        awardQuest(q2, empBack);
        awardQuest(q3, empBack);
        awardQuest(q8, empFront);

        // ==================================================
        // 6. СОБЫТИЯ + УЧАСТНИКИ
        // ==================================================
        Event e1 = createEvent("IT Meetup", "IT",
                "Обсуждаем архитектуру микросервисов и делимся опытом",
                "Москва, офис 4 этаж", hr,
                EventStatus.COMPLETED, true, 100.00, 1.0, true);
        Event e2 = createEvent("Коммуникация", "Soft Skills",
                "Тренинг по эффективной коммуникации", "Онлайн", hr,
                EventStatus.COMPLETED, false, null, null, true);
        Event e3 = createEvent("Забег 5 км", "Sport",
                "Корпоративный забег в парке", "Парк Горького", organizer,
                EventStatus.COMPLETED, true, 50.00, 2.0, true);
        Event e4 = createEvent("Воркшоп по архитектуре", "Обучение",
                "Разбираем паттерны проектирования", "Онлайн", mgrBack,
                EventStatus.ASSIGNED, true, 500.00, 2.0, false);
        Event e5 = createEvent("Пятничный покер", "Тимбилдинг",
                "Играем в покер в офисе", "Офис, 4 этаж", hr,
                EventStatus.ASSIGNED, false, null, null, false);
        Event e6 = createEvent("Киновечер", "Развлечения",
                "Смотрим фильм вместе", "Переговорка А", organizer,
                EventStatus.NEW, false, null, null, false);
        Event e7 = createEvent("Новогодний корпоратив", "Тимбилдинг",
                "Отмечаем вместе!", "Ресторан «Прага»", hr,
                EventStatus.NEW, false, null, null, false);
        Event e8 = createEvent("Велопрогулка", "Sport",
                "Катаемся по набережной", "Сбор у офиса", organizer,
                EventStatus.ASSIGNED, true, 200.00, 1.0, false);

        addParticipant(e1, empBack);
        addParticipant(e1, empFront);
        addParticipant(e1, empQa);
        addParticipant(e2, empBack);
        addParticipant(e2, empFront);
        addParticipant(e3, empBack);
        addParticipant(e3, empSales);
        addParticipant(e4, empBack);
        addParticipant(e4, empFront);
        addParticipant(e5, empBack);
        addParticipant(e5, empFront);
        addParticipant(e5, empQa);
        addParticipant(e8, empBack);
        addParticipant(e8, empFront);

        awardEvent(e1, 100.00, 1.0, List.of(empBack, empFront, empQa));
        awardEvent(e3, 50.00, 2.0, List.of(empBack, empSales));

        // ==================================================
        // 7. НОВОСТИ (с обложками из базы)
        // ==================================================
        News n1 = createNews("Запуск платформы ПУЛЬС!",
                "Ура! Мы запустили нашу платформу вовлечённости ПУЛЬС. " +
                        "Теперь вы можете получать монеты за активность, благодарить коллег " +
                        "и тратить заработанное в магазине.",
                true, hr, "/uploads/72d0bc5d-673a-4d09-b6ef-6493c9b73777.jpg", 30);
        News n2 = createNews("Итоги квартала",
                "Мы отлично поработали в этом квартале! Ключевые результаты — в новой презентации на портале.",
                false, admin, null, 14);
        News n3 = createNews("Новогодний корпоратив",
                "Встречаемся 25 декабря в 18:00 в ресторане «Прага». Будет весело!\n" +
                        "Дресс-код — вечерний.",
                false, hr, "/uploads/754b23e0-4552-41f0-b42d-eef610fead33.jpg", 30);
        News n4 = createNews("Онбординг нового сотрудника",
                "Знакомьтесь: к нашей команде присоединился новый разработчик.\n" +
                        "Не забудьте поздравить и помочь с адаптацией.",
                false, hr, null, 30);
        News n5 = createNews("Важное объявление",
                "Завтра офис закрыт на санитарную обработку. Работаем из дома.",
                false, admin, "/uploads/a657c59f-5857-4f60-ab05-f200783a9f43.jpg", 2);

        createNewsRating(n1, empBack, 5);
        createNewsRating(n1, empFront, 4);
        createNewsRating(n1, empQa, 5);
        createNewsRating(n2, mgrBack, 4);
        createNewsRating(n3, empFront, 5);
        createNewsRating(n3, empSales, 5);

        // ==================================================
        // 8. АЧИВКИ
        // ==================================================
        seedAchievements();

        grantAchievementByCode(empBack, "EVENT_JOINER_5");
        grantAchievementByCode(empBack, "EVENT_JOINER_10");
        grantAchievementByCode(empFront, "EVENT_JOINER_5");
        grantAchievementByCode(empQa, "HELPER");
        grantAchievementByCode(empSales, "MENTOR");

        // ==================================================
        // 9. СЕЗОНЫ
        // ==================================================
        Season seasonClosed = createClosedSeason(
                "Q3 2026",
                LocalDateTime.now().minusMonths(4),
                LocalDateTime.now().minusMonths(1)
        );
        seedClosedSeasonResults(seasonClosed,
                List.of(empBack, empFront, empQa, empSales, mgrBack, mgrFront),
                List.of(backend, frontend, qa, support, sales));

        createActiveSeason("Q4 2026",
                LocalDateTime.now().minusMonths(1),
                LocalDateTime.now().plusMonths(2));

        // ==================================================
        // 10. ТРАНЗАКЦИИ
        // ==================================================
        createCoinTx(empBack, empFront, 50.00, CoinTransactionType.PEER_THANKS,
                "Спасибо за помощь с релизом!", ThanksTag.FOR_HELP, null, null);
        createCoinTx(mgrBack, empBack, 100.00, CoinTransactionType.PEER_THANKS,
                "Спасибо за оперативный фикс", ThanksTag.INITIATIVE, null, null);
        createCoinTx(empFront, empQa, 30.00, CoinTransactionType.PEER_THANKS,
                "За код-ревью", ThanksTag.FOR_HELP, null, null);
        createCoinTx(hr, empSales, 200.00, CoinTransactionType.PEER_THANKS,
                "За помощь в организации корпоратива", ThanksTag.GRATITUDE, null, null);

        createCoinTx(null, empBack, 500.00, CoinTransactionType.MANAGER_BONUS,
                "Квартальная премия", null, mgrBack.getId(), null);
        createCoinTx(null, empFront, 300.00, CoinTransactionType.MANAGER_BONUS,
                "Бонус за успешный релиз", null, mgrFront.getId(), null);
        createCoinTx(null, empQa, 200.00, CoinTransactionType.MANAGER_BONUS,
                "За качественное тестирование", null, mgrBack.getId(), null);

        createCoinTx(null, empBack, 5000.00, CoinTransactionType.SEASON_REWARD,
                "1 место в сезоне Q3 2026", null, null, null);
        createCoinTx(null, empFront, 2500.00, CoinTransactionType.SEASON_REWARD,
                "2 место в сезоне Q3 2026", null, null, null);
        createCoinTx(null, empQa, 1500.00, CoinTransactionType.SEASON_REWARD,
                "3 место в сезоне Q3 2026", null, null, null);

        createCoinTx(empQa, null, 100.00, CoinTransactionType.PENALTY,
                "Штраф за нарушение регламента", null, admin.getId(), null);

        createRatingTx(empBack, 5.0, "Награда за событие IT Meetup");
        createRatingTx(empBack, 3.0, "Награда за событие Забег 5 км");
        createRatingTx(empBack, 2.0, "Награда за квест Пройти курс по Java");
        createRatingTx(empBack, 2.0, "Награда за квест Помочь коллеге");
        createRatingTx(empBack, 1.5, "Награда за квест Утренняя зарядка");

        createRatingTx(empFront, 5.0, "Награда за событие IT Meetup");
        createRatingTx(empFront, 1.5, "Награда за квест Утренняя зарядка");
        createRatingTx(empFront, 2.0, "Награда за квест Пробежать 10 км");

        createRatingTx(empQa, 5.0, "Награда за событие IT Meetup");
        createRatingTx(empQa, 1.0, "Награда за квест Прочитать книгу");

        createRatingTx(empSales, 3.0, "Награда за событие Забег 5 км");
        createRatingTx(empSales, 1.0, "Награда за квест Написать статью");
        createRatingTx(empSales, -1.0, "Штраф за просроченный квест");

        // ==================================================
        // 11. ЗАКАЗЫ
        // ==================================================
        Order o1 = createOrder(admin, hoodie, null, 1, hoodie.getPrice(),
                OrderStatus.COMPLETED, "Выдано на ресепшене", null);
        Order o2 = createOrder(admin, usb, null, 2, usb.getPrice().multiply(BigDecimal.valueOf(2)),
                OrderStatus.COMPLETED, null, null);
        Order o3 = createOrder(empBack, thermomug, null, 1, thermomug.getPrice(),
                OrderStatus.COMPLETED, null, null);
        Order o4 = createOrder(empBack, dayOff, null, 1, dayOff.getPrice(),
                OrderStatus.PENDING, null, "Хочу взять в пятницу");
        Order o5 = createOrder(empFront, sweatshirt, null, 1, sweatshirt.getPrice(),
                OrderStatus.COMPLETED, null, null);
        Order o6 = createOrder(empQa, headphones, null, 1, headphones.getPrice(),
                OrderStatus.APPROVED, "Готов к выдаче", null);
        Order o7 = createOrder(empSales, aquapark, null, 2,
                aquapark.getPrice().multiply(BigDecimal.valueOf(2)),
                OrderStatus.COMPLETED, null, null);
        Order o8 = createOrder(empSales, pin, null, 5,
                pin.getPrice().multiply(BigDecimal.valueOf(5)),
                OrderStatus.COMPLETED, null, null);

        createPurchaseTx(o1);
        createPurchaseTx(o2);
        createPurchaseTx(o3);
        createPurchaseTx(o5);
        createPurchaseTx(o7);
        createPurchaseTx(o8);

        // ==================================================
        // 12. ОПРОСЫ + ОТВЕТЫ
        // ==================================================
        Survey s1 = createSurvey(hr, "Ежеквартальный опрос Q4",
                "Помогите нам стать лучше — ответьте на 3 вопроса",
                LocalDateTime.now().plusDays(14), 2.0, -1.0);
        SurveyQuestion sq1 = addSurveyQuestion(s1, "Оцените удовлетворённость работой",
                new String[][]{
                        {"1 - Очень плохо", "1"},
                        {"2 - Плохо", "2"},
                        {"3 - Нормально", "3"},
                        {"4 - Хорошо", "4"},
                        {"5 - Отлично", "5"}
                });
        SurveyQuestion sq2 = addSurveyQuestion(s1, "Оцените уровень коммуникации в команде",
                new String[][]{
                        {"1", "1"}, {"2", "2"}, {"3", "3"}, {"4", "4"}, {"5", "5"}
                });
        SurveyQuestion sq3 = addSurveyQuestion(s1, "Хотели бы больше корпоративных мероприятий?",
                new String[][]{
                        {"Да", "2"}, {"Скорее да", "1"}, {"Нет", "0"}
                });

        submitSurveyResponse(s1, sq1, sq1.getOptions().get(4), empBack);
        submitSurveyResponse(s1, sq2, sq2.getOptions().get(3), empBack);
        submitSurveyResponse(s1, sq3, sq3.getOptions().get(0), empBack);
        submitSurveyResponse(s1, sq1, sq1.getOptions().get(3), empFront);
        submitSurveyResponse(s1, sq2, sq2.getOptions().get(4), empFront);
        submitSurveyResponse(s1, sq3, sq3.getOptions().get(1), empFront);
        submitSurveyResponse(s1, sq1, sq1.getOptions().get(3), empQa);
        submitSurveyResponse(s1, sq2, sq2.getOptions().get(2), empQa);

        Survey s2 = createSurvey(hr, "Питание в офисе",
                "Короткий опрос про кофе и обеды",
                LocalDateTime.now().plusDays(7), 1.0, 0.0);
        SurveyQuestion sq4 = addSurveyQuestion(s2, "Что улучшить в кофе-поинте?",
                new String[][]{
                        {"Больше сортов", "1"},
                        {"Свежая выпечка", "1"},
                        {"Всё устраивает", "0"}
                });
        submitSurveyResponse(s2, sq4, sq4.getOptions().get(0), empBack);
        submitSurveyResponse(s2, sq4, sq4.getOptions().get(2), empFront);

        // ==================================================
        // 13. ШАБЛОНЫ ОПРОСОВ
        // ==================================================
        createSurveyTemplate(hr, "Шаблон: вовлечённость",
                "Стандартный опрос вовлечённости (5 вопросов)",
                new String[][]{
                        {"Оцените удовлетворённость работой", "1,2,3,4,5"},
                        {"Оцените отношения в команде", "1,2,3,4,5"},
                        {"Оцените рабочие процессы", "1,2,3,4,5"},
                        {"Оцените баланс работы и жизни", "1,2,3,4,5"},
                        {"Порекомендуете компанию другу?", "1,2,3,4,5"}
                });
        createSurveyTemplate(hr, "Шаблон: корпоративная культура",
                "Опрос о культуре и ценностях",
                new String[][]{
                        {"Насколько вам близки ценности компании?", "1,2,3,4,5"},
                        {"Чувствуете ли вы поддержку руководителя?", "1,2,3,4,5"},
                        {"Есть ли у вас возможность развиваться?", "1,2,3,4,5"}
                });

        // ==================================================
        // 14. ТИКЕТЫ ПОДДЕРЖКИ
        // ==================================================
        SupportTicket t1 = createTicket(empBack, "Не работает VPN",
                "Не могу подключиться к корпоративному VPN с домашнего ноутбука. " +
                        "Пишет «Ошибка аутентификации».", false);
        takeTicket(t1, supportUser);
        addTicketMessage(t1, supportUser, "Здравствуйте! Попробуйте переустановить клиент VPN.");
        addTicketMessage(t1, empBack, "Переустановил, но ошибка та же — скриншот прилагаю.");
        addTicketMessage(t1, supportUser, "Спасибо! Сбросил ваш сертификат — попробуйте снова.");
        completeTicket(t1);

        SupportTicket t2 = createTicket(empFront, "Как поменять аватар?",
                "Не нахожу, где сменить фото профиля.", false);
        takeTicket(t2, supportUser);
        addTicketMessage(t2, supportUser,
                "Зайдите в Профиль и нажмите на свой аватар — откроется выбор файла.");
        completeTicket(t2);

        SupportTicket t3 = createTicket(empQa, "Прошу принять квест",
                "Сдал квест «Пробежать 10 км», приложите подтверждение, пожалуйста.",
                true);

        SupportTicket t4 = createTicket(empSales, "Не начисляются монеты за событие",
                "Был на «IT Meetup», но монеты не пришли.", false);
        takeTicket(t4, supportUser);

        // ==================================================
        // 15. ЧАТЫ + СООБЩЕНИЯ
        // ==================================================
        Chat c1 = createChat(empBack, empFront);
        addChatMessage(c1, empBack, "Привет! Как дела с релизом?");
        addChatMessage(c1, empFront, "Привет! Почти всё готово, остался один баг.");
        addChatMessage(c1, empBack, "Если что — я на связи, помогу.");

        Chat c2 = createChat(admin, empBack);
        addChatMessage(c2, admin, "Привет! Как продвигается проект?");
        addChatMessage(c2, empBack, "Отлично, к концу недели будет готово.");

        Chat c3 = createChat(mgrBack, empBack);
        addChatMessage(c3, mgrBack, "Загляни в задачи — есть пара вопросов.");
        addChatMessage(c3, empBack, "Уже смотрю, отвечу через 15 минут.");

        // ==================================================
        // 16. УВЕДОМЛЕНИЯ
        // ==================================================
        notify(empBack, "BONUS", "Начислен бонус",
                "+500 монет от Ивана Бэкендова. Комментарий: Квартальная премия", null);
        notify(empBack, "REFUND", "Заказ одобрен",
                "Ваш заказ на «Худи» одобрен и готов к выдаче", o1.getId());
        notify(empFront, "SYSTEM", "Добро пожаловать в ПУЛЬС!",
                "Начните с раздела «Квесты» — там уже есть интересные задания для вас", null);
        notify(empFront, "BONUS", "Начислен бонус",
                "+300 монет от Анны Фронтендовой", null);
        notify(empQa, "PENALTY", "Наложен штраф",
                "−100 монет. Причина: нарушение регламента", null);
        notify(hr, "SYSTEM", "Новое событие на модерации",
                "Организатор Олег создал событие «Киновечер» — требуется ваше одобрение", e6.getId());
        notify(admin, "SYSTEM", "Есть заказы, ожидающие выдачи",
                "Проверьте раздел «Заказы» в панели управления", null);
        notify(supportUser, "SYSTEM", "Новое обращение в поддержку",
                "Поступило обращение от Алексея Тестировщикова", t3.getId());

        // ==================================================
        // 17. КАЛЕНДАРНЫЕ ЗАМЕТКИ
        // ==================================================
        createNote(empBack, "Позвонить клиенту", "Уточнить детали по контракту",
                LocalDateTime.now().plusHours(4), 30);
        createNote(empBack, "Дедлайн по проекту", "Сдать финальную версию",
                LocalDateTime.now().plusDays(2), 1440);
        createNote(empFront, "Созвон с командой", null,
                LocalDateTime.now().plusHours(2), 15);
        createNote(empQa, "Проверить релиз", "Прогнать тесты на прод-стенде",
                LocalDateTime.now().plusDays(1), 60);

        // ==================================================
        // 18. БАЗА ЗНАНИЙ
        // ==================================================
        KnowledgeCategory kcIT = knowledgeCategoryRepository.findByName("IT и разработка")
                .orElseThrow();
        KnowledgeCategory kcProc = knowledgeCategoryRepository.findByName("Процессы")
                .orElseThrow();
        KnowledgeCategory kcSafety = knowledgeCategoryRepository.findByName("Безопасность")
                .orElseThrow();

        KnowledgeArticle a1 = createKnowledgeArticle(
                "Как настроить VPN",
                "## Пошаговая инструкция\n\n" +
                        "1. Скачайте клиент с портала.\n" +
                        "2. Установите и запустите.\n" +
                        "3. Введите корпоративные учётные данные.\n" +
                        "4. Подключитесь к серверу `vpn.company.local`.\n\n" +
                        "Если что-то не работает — пишите в поддержку.",
                kcIT, empBack, hr);
        KnowledgeArticle a2 = createKnowledgeArticle(
                "Регламент согласования отпусков",
                "Заявление на отпуск подаётся не позднее чем за 14 дней. " +
                        "Согласование идёт через HR-портал.",
                kcProc, hr, hr);
        createKnowledgeArticle(
                "Как распознать фишинг",
                "Основные признаки фишингового письма:\n" +
                        "- Незнакомый отправитель\n" +
                        "- Срочность и угрозы\n" +
                        "- Странные ссылки\n" +
                        "- Вложения от неизвестных\n\n" +
                        "При подозрении — перешлите письмо в поддержку.",
                kcSafety, supportUser, hr);

        KnowledgeSubmission ks1 = new KnowledgeSubmission();
        ks1.setTitle("Гайд по работе с Jira");
        ks1.setContent("Пошаговое руководство по созданию задач, спринтов и досок в Jira. " +
                "Рассказываю про типы задач, workflow и автоматизации.");
        ks1.setCategory(kcProc);
        ks1.setAuthor(empQa);
        ks1.setCommentFromAuthor("Хочу поделиться опытом, накопленным за полгода.");
        ks1.setStatus(KnowledgeSubmissionStatus.PENDING);
        knowledgeSubmissionRepository.save(ks1);

        KnowledgeSubmission ks2 = new KnowledgeSubmission();
        ks2.setTargetArticleId(a1.getId());
        ks2.setOriginalContentSnapshot(a1.getContent());
        ks2.setTitle("Как настроить VPN (обновлено)");
        ks2.setContent(a1.getContent() +
                "\n\n### Обновление\n\nДобавлен раздел для macOS и Linux.");
        ks2.setCategory(kcIT);
        ks2.setAuthor(empFront);
        ks2.setCommentFromAuthor("Дополнил инструкцию для macOS.");
        ks2.setStatus(KnowledgeSubmissionStatus.PENDING);
        knowledgeSubmissionRepository.save(ks2);

        KnowledgeSubmission ks3 = new KnowledgeSubmission();
        ks3.setTitle("Чек-лист перед релизом");
        ks3.setContent("Перед релизом убедитесь, что:\n" +
                "- Все тесты прошли\n" +
                "- Обновлён CHANGELOG\n" +
                "- Пройдены код-ревью\n" +
                "- Есть план отката");
        ks3.setCategory(kcProc);
        ks3.setAuthor(empBack);
        ks3.setStatus(KnowledgeSubmissionStatus.APPROVED);
        ks3.setRewardCoins(new BigDecimal("300.00"));
        ks3.setRewardRating(2.0);
        ks3.setReviewedBy(hr);
        ks3.setReviewedAt(LocalDateTime.now().minusDays(3));
        knowledgeSubmissionRepository.save(ks3);

        log.info("✅ Тестовые данные успешно добавлены: " +
                        "{} пользователей, {} товаров, {} квестов, {} событий, " +
                        "{} заказов, {} опросов, {} тикетов, {} чатов, {} статей БЗ",
                userRepository.count(), productRepository.count(),
                questRepository.count(), eventRepository.count(),
                orderRepository.count(), surveyRepository.count(),
                ticketRepository.count(), chatRepository.count(),
                knowledgeArticleRepository.count());

        // ==================================================
        // 19. РАСШИРЕНИЕ ДАННЫХ
        // ==================================================
        extendTestData();
    }

    // ==================================================================
    // ============ SEED: SETTINGS, TREASURY, KNOWLEDGE CATEGORIES
    // ==================================================================

    private void seedSettings() {
        createSettingIfNotExists("limit.peer.daily-per-recipient", "1000",
                "Лимит на коллегу",
                "Максимум монет, которое можно перевести одному коллеге за день", "Переводы");
        createSettingIfNotExists("limit.peer.daily-total", "1000",
                "Общий лимит переводов",
                "Максимум монет, которое можно перевести всем коллегам за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-per-subordinate", "2000",
                "Лимит бонусов на сотрудника",
                "Максимум монет, которое менеджер может начислить одному сотруднику за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-total", "5000",
                "Общий лимит бонусов менеджера",
                "Максимум монет, которое менеджер может начислить всем сотрудникам за день", "Переводы");
        createSettingIfNotExists("economy.monthly-earn-limit", "10000",
                "Месячный лимит заработка",
                "Максимум монет, которое сотрудник может заработать за месяц", "Экономика");
        createSettingIfNotExists("limit.quest.max-reward", "5000",
                "Макс. награда за квест",
                "Максимальное количество монет, которое можно назначить за один квест", "Экономика");
        createSettingIfNotExists("limit.event.max-reward", "2000",
                "Макс. награда за событие",
                "Максимальное количество монет, которое можно назначить за одно событие", "Экономика");
        createSettingIfNotExists("economy.treasury.auto-refill-amount", "50000",
                "Автопополнение казны (сумма)",
                "На сколько монет пополняется казна 1-го числа каждого месяца", "Экономика");
        createSettingIfNotExists("economy.treasury.threshold", "1000",
                "Автопополнение казны (порог)",
                "Если баланс казны опускается ниже этого числа, сработает автопополнение", "Экономика");
    }

    private void seedTreasury() {
        if (treasuryRepository.count() == 0) {
            Treasury t = new Treasury();
            t.setId(1L);
            t.setBalance(new BigDecimal("150000.00"));
            treasuryRepository.save(t);

            TreasuryTransaction tx = new TreasuryTransaction();
            tx.setType(TreasuryTxType.FUND);
            tx.setAmount(new BigDecimal("150000.00"));
            tx.setDescription("Начальное наполнение казны");
            tx.setBalanceAfter(new BigDecimal("150000.00"));
            treasuryTxRepository.save(tx);
        }
    }

    private void seedKnowledgeCategories() {
        createKnowledgeCategoryIfMissing("IT и разработка",
                "Технические статьи, гайды по стеку, инструкции по окружению", 1);
        createKnowledgeCategoryIfMissing("Процессы",
                "Как устроены внутренние процессы, регламенты, согласования", 2);
        createKnowledgeCategoryIfMissing("HR и онбординг",
                "Адаптация новичков, отпуска, льготы, корпоративные правила", 3);
        createKnowledgeCategoryIfMissing("Безопасность",
                "Пароли, доступы, фишинг, работа с чувствительными данными", 4);
        createKnowledgeCategoryIfMissing("Инструменты",
                "Внутренние сервисы, настройка окружения, полезные команды", 5);
        createKnowledgeCategoryIfMissing("Лайфхаки",
                "Неочевидные приёмы, которые экономят время коллегам", 6);
    }

    private void seedAchievements() {
        upsertAchievement("EVENT_JOINER_5", "Участник I", "Посетил 5 событий",
                AchievementType.AUTOMATIC, 5, 1, "EVENT_JOINER", new BigDecimal("50.00"));
        upsertAchievement("EVENT_JOINER_10", "Участник II", "Посетил 10 событий",
                AchievementType.AUTOMATIC, 10, 2, "EVENT_JOINER", new BigDecimal("100.00"));
        upsertAchievement("EVENT_JOINER_20", "Участник III", "Посетил 20 событий",
                AchievementType.AUTOMATIC, 20, 3, "EVENT_JOINER", new BigDecimal("200.00"));
        upsertAchievement("SEASON_CHAMPION", "Чемпион сезона", "1 место в общем рейтинге",
                AchievementType.AUTOMATIC, 1, 1, "SEASON", BigDecimal.ZERO);
        upsertAchievement("SEASON_TOP_3", "Лидер сезона", "Топ-3 в общем рейтинге",
                AchievementType.AUTOMATIC, 1, 2, "SEASON", BigDecimal.ZERO);
        upsertAchievement("DEPT_TOP_1", "Гордость отдела I", "1 место в своём подразделении",
                AchievementType.AUTOMATIC, 1, 1, "DEPT_TOP", BigDecimal.ZERO);
        upsertAchievement("DEPT_TOP_2", "Лучший в отделе II", "2 место в отделе",
                AchievementType.AUTOMATIC, 2, 2, "DEPT_TOP", BigDecimal.ZERO);
        upsertAchievement("DEPT_TOP_3", "Лучший в отделе III", "3 место в отделе",
                AchievementType.AUTOMATIC, 3, 3, "DEPT_TOP", BigDecimal.ZERO);
        upsertAchievement("BEST_EMPLOYEE", "Лучший сотрудник", "Особое достижение от руководства",
                AchievementType.MANUAL, null, 1, "BEST_EMPLOYEE", new BigDecimal("500.00"));
        upsertAchievement("HELPER", "Помощник", "Активно помогает коллегам",
                AchievementType.MANUAL, null, 1, "HELPER", new BigDecimal("300.00"));
        upsertAchievement("MENTOR", "Наставник", "Обучает и поддерживает новых сотрудников",
                AchievementType.MANUAL, null, 1, "MENTOR", new BigDecimal("500.00"));
        upsertAchievement("INNOVATOR", "Инноватор", "Предложил и внедрил полезную идею",
                AchievementType.MANUAL, null, 1, "INNOVATOR", new BigDecimal("500.00"));
    }

    // ==================================================================
    // ============================ ХЕЛПЕРЫ
    // ==================================================================

    private void createSettingIfNotExists(String key, String value, String label,
                                          String desc, String category) {
        if (settingRepository.findById(key).isEmpty()) {
            SystemSetting s = new SystemSetting();
            s.setSettingKey(key);
            s.setSettingValue(value);
            s.setLabel(label);
            s.setDescription(desc);
            s.setCategory(category);
            settingRepository.save(s);
        }
    }

    private void createKnowledgeCategoryIfMissing(String name, String description, int sortOrder) {
        if (knowledgeCategoryRepository.existsByName(name)) return;
        KnowledgeCategory c = new KnowledgeCategory();
        c.setName(name);
        c.setDescription(description);
        c.setSortOrder(sortOrder);
        knowledgeCategoryRepository.save(c);
    }

    private void upsertAchievement(String code, String name, String description, AchievementType type,
                                   Integer requiredProgress, Integer level, String groupCode,
                                   BigDecimal rewardCoins) {
        if (achievementRepository.findByCode(code).isPresent()) return;
        Achievement a = new Achievement();
        a.setCode(code);
        a.setName(name);
        a.setDescription(description);
        a.setType(type);
        a.setRequiredProgress(requiredProgress);
        a.setLevel(level);
        a.setGroupCode(groupCode);
        a.setRewardCoins(rewardCoins);
        achievementRepository.save(a);
    }

    private Department createDepartment(String name, String description) {
        Department d = new Department();
        d.setName(name);
        d.setDescription(description);
        return departmentRepository.save(d);
    }

    private User createUser(String name, String email, String password, UserRole role,
                            double balance, double rating, double lifetime,
                            Department department, String avatarUrl) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        u.setBalance(BigDecimal.valueOf(balance));
        u.setRating(rating);
        u.setLifetimeRating(lifetime);
        u.setIsBlocked(false);
        u.setDepartment(department);
        u.setCurrentStreak(0);
        u.setLongestStreak(0);
        u.setLastStreakRewardAt(0);
        u.setAvatarUrl(avatarUrl);
        u.setMonthlyEarnedCoins(BigDecimal.ZERO);
        return userRepository.save(u);
    }

    private Category createCategory(String name, String description, int sortOrder, String imageUrl) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(description);
        c.setSortOrder(sortOrder);
        c.setImageUrl(imageUrl);
        return categoryRepository.save(c);
    }

    private Product createProduct(String name, String description, double price, int stock,
                                  Category category, ProductType type, boolean hasVariants,
                                  String sizesStr, String colorsStr, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(BigDecimal.valueOf(price));
        p.setStock(stock);
        p.setCategory(category);
        p.setType(type);
        p.setIsActive(true);
        p.setHasVariants(hasVariants);
        p.setImageUrl(imageUrl);
        p.setImages(new ArrayList<>());

        Product saved = productRepository.save(p);

        if (hasVariants && sizesStr != null && colorsStr != null) {
            String[] sizes = sizesStr.split(",");
            String[] colors = colorsStr.split(",");
            for (String color : colors) {
                for (String size : sizes) {
                    ProductVariant v = new ProductVariant();
                    v.setProduct(saved);
                    v.setSize(size.trim());
                    v.setColor(color.trim());
                    v.setStock(5 + (int) (Math.random() * 6));
                    variantRepository.save(v);
                }
            }
        }
        return saved;
    }

    private void createDiscount(Product product, int percent, int days) {
        Discount d = new Discount();
        d.setProduct(product);
        d.setPercent(percent);
        d.setValidFrom(LocalDateTime.now().minusDays(1));
        d.setValidTo(LocalDateTime.now().plusDays(days));
        d.setIsActive(true);
        discountRepository.save(d);
    }

    private void createReview(User user, Product product, int rating, String comment) {
        if (reviewRepository.findByUserIdAndProductId(user.getId(), product.getId()).isPresent()) return;
        ProductReview r = new ProductReview();
        r.setUser(user);
        r.setProduct(product);
        r.setRating(rating);
        r.setComment(comment);
        reviewRepository.save(r);
    }

    private void createFavorite(User user, Product product) {
        if (favoriteRepository.findByUserIdAndProductId(user.getId(), product.getId()).isPresent()) return;
        FavoriteProduct f = new FavoriteProduct();
        f.setUser(user);
        f.setProduct(product);
        favoriteRepository.save(f);
    }

    private void createWriteOff(Product product, int quantity, String reason,
                                User actor, User recipient, String comment) {
        StockWriteOff w = new StockWriteOff();
        w.setProduct(product);
        w.setQuantity(quantity);
        w.setReason(reason);
        w.setActorId(actor.getId());
        w.setActorName(actor.getName());
        if (recipient != null) {
            w.setRecipientId(recipient.getId());
            w.setRecipientName(recipient.getName());
        }
        w.setComment(comment);
        stockWriteOffRepository.save(w);

        ShopAuditLog auditLog = new ShopAuditLog();
        auditLog.setAction("STOCK_WRITTEN_OFF");
        auditLog.setActorId(actor.getId());
        auditLog.setActorName(actor.getName());
        auditLog.setProductId(product.getId());
        auditLog.setProductName(product.getName());
        auditLog.setQuantityDelta(-quantity);
        auditLog.setDetails("Списано " + quantity + " шт. Причина: " + reason
                + (recipient != null ? ". Получатель: " + recipient.getName() : ""));
        shopAuditLogRepository.save(auditLog);
    }

    private Quest createQuest(String title, String description, double reward, String audience,
                              int daysDeadline, User creator, Double rewardRating,
                              boolean isMandatory, Double penaltyCoins, Double penaltyRating) {
        Quest q = new Quest();
        q.setTitle(title);
        q.setDescription(description);
        q.setRewardCoins(BigDecimal.valueOf(reward));
        q.setRewardRating(rewardRating);
        q.setIsActive(true);
        q.setIsPublic(true);
        q.setIsMandatory(isMandatory);
        q.setPenaltyCoins(penaltyCoins != null ? BigDecimal.valueOf(penaltyCoins) : null);
        q.setPenaltyRating(penaltyRating);
        q.setAudienceDescription(audience);
        q.setDeadline(LocalDateTime.now().plusDays(daysDeadline));
        q.setCreator(creator);
        q.setIsRepeatable(false);
        return questRepository.save(q);
    }

    private UserQuest createUserQuest(User user, Quest quest, QuestProgressStatus status,
                                      LocalDateTime startedAt, LocalDateTime finishedAt,
                                      String adminComment) {
        UserQuest uq = new UserQuest();
        uq.setUser(user);
        uq.setQuest(quest);
        uq.setStatus(status);
        uq.setStartedAt(startedAt);
        if (status == QuestProgressStatus.PENDING_REVIEW
                || status == QuestProgressStatus.COMPLETED
                || status == QuestProgressStatus.REJECTED) {
            uq.setSubmittedAt(finishedAt);
        }
        if (status == QuestProgressStatus.COMPLETED) {
            uq.setCompletedAt(finishedAt);
        }
        uq.setAdminComment(adminComment);
        return userQuestRepository.save(uq);
    }

    private void awardQuest(Quest quest, User user) {
        createCoinTx(null, user, quest.getRewardCoins().doubleValue(),
                CoinTransactionType.QUEST_REWARD,
                "Награда за квест: " + quest.getTitle(), null, null, null);
        if (quest.getRewardRating() != null && quest.getRewardRating() > 0) {
            createRatingTx(user, quest.getRewardRating(),
                    "Награда за квест: " + quest.getTitle());
        }
    }

    private Event createEvent(String name, String category, String description, String place,
                              User organizer, EventStatus status, boolean paidInCoins,
                              Double rewardCoins, Double rewardRating, boolean rewardsGranted) {
        Event e = new Event();
        e.setNameEvent(name);
        e.setCategory(category);
        e.setDescription(description);
        e.setEventPlace(place);
        e.setFromTime(LocalDateTime.now().minusDays(7).plusHours(2));
        e.setToTime(LocalDateTime.now().minusDays(7).plusHours(4));
        e.setOrganizer(organizer);
        e.setEventStatus(status);
        e.setPaidInCoins(paidInCoins);
        e.setRewardCoins(rewardCoins != null ? BigDecimal.valueOf(rewardCoins) : null);
        e.setRewardRating(rewardRating);
        e.setRewardsGranted(rewardsGranted);
        return eventRepository.save(e);
    }

    private void addParticipant(Event event, User user) {
        if (participantRepository.existsByEventIdAndUserId(event.getId(), user.getId())) return;
        EventParticipant p = new EventParticipant();
        p.setEvent(event);
        p.setUser(user);
        participantRepository.save(p);
    }

    private void awardEvent(Event event, double coins, double rating, List<User> participants) {
        for (User u : participants) {
            createCoinTx(null, u, coins, CoinTransactionType.EVENT_REWARD,
                    "Награда за событие #" + event.getId() + ": " + event.getNameEvent(),
                    null, null, null);
            if (rating > 0) {
                createRatingTx(u, rating,
                        "Награда за событие #" + event.getId() + ": " + event.getNameEvent());
            }
        }
    }

    private News createNews(String title, String content, boolean pinned,
                            User author, String coverUrl, int expiresInDays) {
        News n = new News();
        n.setTitle(title);
        n.setContent(content);
        n.setIsPinned(pinned);
        n.setAuthor(author);
        n.setIsArchived(false);
        n.setViews(0);
        n.setCoverUrl(coverUrl);
        n.setExpiresAt(LocalDateTime.now().plusDays(expiresInDays));
        return newsRepository.save(n);
    }

    private void createNewsRating(News news, User user, int value) {
        if (newsRatingRepository.findByNewsIdAndUserId(news.getId(), user.getId()).isPresent()) return;
        NewsRating r = new NewsRating();
        r.setNewsId(news.getId());
        r.setUserId(user.getId());
        r.setValue(value);
        newsRatingRepository.save(r);
    }

    private void grantAchievementByCode(User user, String code) {
        Achievement a = achievementRepository.findByCode(code).orElse(null);
        if (a == null) return;
        if (userAchievementRepository.existsByUserIdAndAchievementId(user.getId(), a.getId())) return;
        UserAchievement ua = new UserAchievement();
        ua.setUser(user);
        ua.setAchievement(a);
        userAchievementRepository.save(ua);

        if (a.getRewardCoins() != null && a.getRewardCoins().compareTo(BigDecimal.ZERO) > 0) {
            createCoinTx(null, user, a.getRewardCoins().doubleValue(),
                    CoinTransactionType.ACHIEVEMENT,
                    "Награда за достижение: " + a.getName(), null, null, null);
        }
    }

    private Season createClosedSeason(String name, LocalDateTime start, LocalDateTime end) {
        Season s = new Season();
        s.setName(name);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setIsActive(false);
        s.setClosedAt(end.plusDays(1));
        return seasonRepository.save(s);
    }

    private Season createActiveSeason(String name, LocalDateTime start, LocalDateTime end) {
        Season s = new Season();
        s.setName(name);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setIsActive(true);
        return seasonRepository.save(s);
    }

    private void seedClosedSeasonResults(Season season, List<User> users, List<Department> depts) {
        String[] names = {users.get(0).getName(), users.get(1).getName(), users.get(2).getName()};
        double[] ratings = {150.0, 120.0, 90.0};
        BigDecimal[] rewards = {
                new BigDecimal("7000.00"),
                new BigDecimal("4000.00"),
                new BigDecimal("3000.00")
        };
        for (int i = 0; i < 3; i++) {
            SeasonResult sr = new SeasonResult();
            sr.setSeason(season);
            sr.setUserId(users.get(i).getId());
            sr.setUserName(names[i]);
            sr.setPlace(i + 1);
            sr.setFinalRating(ratings[i]);
            sr.setRewardCoins(rewards[i]);
            seasonResultRepository.save(sr);
        }

        String[] deptNames = {depts.get(0).getName(), depts.get(1).getName(),
                depts.get(2).getName(), depts.get(3).getName()};
        double[] deptRatings = {250.0, 180.0, 90.0, 60.0};
        int[] memberCounts = {2, 2, 1, 1};
        for (int i = 0; i < deptNames.length; i++) {
            DepartmentResult dr = new DepartmentResult();
            dr.setSeason(season);
            dr.setDepartmentId(depts.get(i).getId());
            dr.setDepartmentName(deptNames[i]);
            dr.setPlace(i + 1);
            dr.setTotalRating(deptRatings[i]);
            dr.setMemberCount(memberCounts[i]);
            dr.setRewardCoinsPerMember(
                    i == 0 ? new BigDecimal("500.00") : BigDecimal.ZERO);
            departmentResultRepository.save(dr);
        }

        DepartmentMemberResult dmr = new DepartmentMemberResult();
        dmr.setSeason(season);
        dmr.setDepartmentId(depts.get(0).getId());
        dmr.setUserId(users.get(0).getId());
        dmr.setUserName(users.get(0).getName());
        dmr.setPlaceInDepartment(1);
        dmr.setFinalRating(150.0);
        departmentMemberResultRepository.save(dmr);
    }

    private CoinTransaction createCoinTx(User from, User to, double amount,
                                         CoinTransactionType type, String comment,
                                         ThanksTag tag, Long _ignoredActorId,
                                         String _ignoredReason) {
        CoinTransaction tx = new CoinTransaction();
        tx.setFromUserId(from != null ? from.getId() : null);
        tx.setToUserId(to != null ? to.getId() : null);
        tx.setAmount(BigDecimal.valueOf(amount));
        tx.setType(type);
        tx.setComment(comment);
        tx.setTag(tag);
        tx.setIsCancelled(false);
        return coinTxRepository.save(tx);
    }

    private void createRatingTx(User user, double amount, String reason) {
        RatingTransaction rt = new RatingTransaction();
        rt.setUserId(user.getId());
        rt.setAmount(amount);
        rt.setReason(reason);
        ratingTxRepository.save(rt);
    }

    private Order createOrder(User user, Product product, ProductVariant variant,
                              int quantity, BigDecimal totalPrice, OrderStatus status,
                              String adminComment, String userComment) {
        Order o = new Order();
        o.setUser(user);
        o.setProduct(product);
        o.setVariant(variant);
        o.setQuantity(quantity);
        o.setTotalPrice(totalPrice);
        o.setStatus(status);
        o.setAdminComment(adminComment);
        o.setUserComment(userComment);
        return orderRepository.save(o);
    }

    private void createPurchaseTx(Order order) {
        createCoinTx(order.getUser(), null, order.getTotalPrice().doubleValue(),
                CoinTransactionType.PURCHASE,
                "Покупка: " + order.getProduct().getName()
                        + " (x" + order.getQuantity() + ")",
                null, null, null);
    }

    private Survey createSurvey(User creator, String title, String description,
                                LocalDateTime deadline, Double rewardRating, Double penaltyRating) {
        Survey s = new Survey();
        s.setTitle(title);
        s.setDescription(description);
        s.setDeadline(deadline);
        s.setIsActive(true);
        s.setCreator(creator);
        s.setRewardRating(rewardRating);
        s.setPenaltyRating(penaltyRating);
        return surveyRepository.save(s);
    }

    private SurveyQuestion addSurveyQuestion(Survey survey, String text, String[][] options) {
        SurveyQuestion q = new SurveyQuestion();
        q.setSurvey(survey);
        q.setText(text);
        em.persist(q);

        List<SurveyOption> opts = new ArrayList<>();
        for (String[] pair : options) {
            SurveyOption o = new SurveyOption();
            o.setQuestion(q);
            o.setText(pair[0]);
            o.setValue(Integer.parseInt(pair[1]));
            em.persist(o);
            opts.add(o);
        }
        q.setOptions(opts);

        em.flush();
        return q;
    }

    private void submitSurveyResponse(Survey survey, SurveyQuestion question,
                                      SurveyOption option, User user) {
        SurveyResponse r = new SurveyResponse();
        r.setSurvey(survey);
        r.setQuestion(question);
        r.setOption(option);
        r.setUser(user);
        em.persist(r);
    }

    private void createSurveyTemplate(User creator, String name, String description,
                                      String[][] questionSpecs) {
        if (surveyTemplateRepository.existsByName(name)) return;

        SurveyTemplate t = new SurveyTemplate();
        t.setName(name);
        t.setDescription(description);
        t.setCreator(creator);

        List<SurveyTemplateQuestion> questions = new ArrayList<>();
        for (String[] spec : questionSpecs) {
            SurveyTemplateQuestion q = new SurveyTemplateQuestion();
            q.setTemplate(t);
            q.setText(spec[0]);

            List<SurveyTemplateOption> options = new ArrayList<>();
            String[] values = spec[1].split(",");
            for (String v : values) {
                SurveyTemplateOption o = new SurveyTemplateOption();
                o.setQuestion(q);
                o.setText(v.trim());
                o.setValue(Integer.parseInt(v.trim()));
                options.add(o);
            }
            q.setOptions(options);
            questions.add(q);
        }
        t.setQuestions(questions);
        surveyTemplateRepository.save(t);
    }

    private SupportTicket createTicket(User creator, String topic, String description,
                                       boolean isQuestRequest) {
        SupportTicket t = new SupportTicket();
        t.setTopic(topic);
        t.setDescription(description);
        t.setCreator(creator);
        t.setStatus(TicketStatus.PENDING);
        t.setIsQuestRequest(isQuestRequest);
        return ticketRepository.save(t);
    }

    private void takeTicket(SupportTicket t, User support) {
        t.setAssignee(support);
        t.setStatus(TicketStatus.IN_PROGRESS);
        ticketRepository.save(t);
    }

    private void completeTicket(SupportTicket t) {
        t.setStatus(TicketStatus.COMPLETED);
        t.setClosedAt(LocalDateTime.now());
        ticketRepository.save(t);
    }

    private void addTicketMessage(SupportTicket t, User sender, String text) {
        TicketMessage m = new TicketMessage();
        m.setTicket(t);
        m.setSender(sender);
        m.setText(text);
        ticketMessageRepository.save(m);
    }

    private Chat createChat(User a, User b) {
        User p1 = a.getId() < b.getId() ? a : b;
        User p2 = a.getId() < b.getId() ? b : a;
        return chatRepository.findByParticipant1IdAndParticipant2Id(p1.getId(), p2.getId())
                .orElseGet(() -> {
                    Chat c = new Chat();
                    c.setParticipant1(p1);
                    c.setParticipant2(p2);
                    c.setLastMessageAt(LocalDateTime.now());
                    return chatRepository.save(c);
                });
    }

    private void addChatMessage(Chat chat, User sender, String text) {
        ChatMessage m = new ChatMessage();
        m.setChat(chat);
        m.setSender(sender);
        m.setText(text);
        chatMessageRepository.save(m);

        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);
    }

    private void notify(User user, String type, String title, String message, Long relatedId) {
        UserNotification n = new UserNotification();
        n.setUserId(user.getId());
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setRelatedId(relatedId);
        notificationRepository.save(n);
    }

    private void createNote(User user, String title, String text,
                            LocalDateTime time, Integer remindBefore) {
        CalendarNote n = new CalendarNote();
        n.setUserId(user.getId());
        n.setTitle(title);
        n.setText(text);
        n.setNoteTime(time);
        n.setRemindMinutesBefore(remindBefore);
        n.setReminderSent(false);
        n.setToastShown(false);
        noteRepository.save(n);
    }

    private KnowledgeArticle createKnowledgeArticle(String title, String content,
                                                    KnowledgeCategory category,
                                                    User author, User publishedBy) {
        KnowledgeArticle a = new KnowledgeArticle();
        a.setTitle(title);
        a.setContent(content);
        a.setCategory(category);
        a.setAuthor(author);
        a.setPublishedBy(publishedBy);
        return knowledgeArticleRepository.save(a);
    }

    // ==================================================================
    // ================= РАСШИРЕНИЕ ТЕСТОВЫХ ДАННЫХ =====================
    // ==================================================================

    private void extendTestData() {
        log.info("🔧 Расширяем тестовые данные...");

        User admin   = userRepository.findByEmail("admin@tms.local").orElse(null);
        User hr      = userRepository.findByEmail("hr@tms.local").orElse(null);
        User mgrBack = userRepository.findByEmail("mgr_back@tms.local").orElse(null);
        User mgrFront = userRepository.findByEmail("mgr_front@tms.local").orElse(null);
        User empBack = userRepository.findByEmail("emp_back@tms.local").orElse(null);
        User empFront = userRepository.findByEmail("emp_front@tms.local").orElse(null);
        User empQa   = userRepository.findByEmail("emp_qa@tms.local").orElse(null);
        User empSales = userRepository.findByEmail("emp_sales@tms.local").orElse(null);
        User support = userRepository.findByEmail("support@tms.local").orElse(null);
        User organiz = userRepository.findByEmail("org@tms.local").orElse(null);

        if (admin == null || hr == null) {
            log.warn("Базовые пользователи не найдены — пропускаем extendTestData()");
            return;
        }

        extendHistoricalSeasons(admin, empBack, empFront, empQa, empSales, mgrBack);
        extendProductGalleries();
        extendTransactionHistory(admin, hr, empBack, empFront, empQa, empSales, mgrBack);
        extendSurveys(hr, empBack, empFront, empQa, empSales, mgrBack);
        extendTickets(support, empBack, empFront, empQa, empSales, mgrBack);
        extendEventsAndQuests(hr, organiz, mgrBack);
        extendNews(hr, admin, empBack, empFront, empQa, empSales, mgrBack, support);
        extendShopAudit(admin, hr);

        log.info("✅ Расширение тестовых данных завершено");
    }

    private void extendHistoricalSeasons(User admin, User empBack, User empFront,
                                         User empQa, User empSales, User mgrBack) {
        boolean already = seasonRepository.findAll().stream()
                .anyMatch(s -> "Q2 2026".equals(s.getName()));
        if (already) return;

        List<User> pool = List.of(admin, empBack, empFront, empQa, empSales, mgrBack);

        createClosedSeasonWithResults("Q4 2025",
                LocalDateTime.of(2025, 10, 1, 0, 0),
                LocalDateTime.of(2025, 12, 31, 23, 59), pool);
        createClosedSeasonWithResults("Q1 2026",
                LocalDateTime.of(2026, 1, 1, 0, 0),
                LocalDateTime.of(2026, 3, 31, 23, 59), pool);
        createClosedSeasonWithResults("Q2 2026",
                LocalDateTime.of(2026, 4, 1, 0, 0),
                LocalDateTime.of(2026, 6, 30, 23, 59), pool);
    }

    private void createClosedSeasonWithResults(String name,
                                               LocalDateTime start,
                                               LocalDateTime end,
                                               List<User> users) {
        Season s = new Season();
        s.setName(name);
        s.setStartDate(start);
        s.setEndDate(end);
        s.setIsActive(false);
        s.setCreatedAt(start);
        s.setClosedAt(end.plusDays(1));
        Season saved = seasonRepository.save(s);

        BigDecimal[] rewards = {
                new BigDecimal("7000.00"),
                new BigDecimal("4000.00"),
                new BigDecimal("3000.00")
        };
        double[] finals = {145.5, 120.0, 88.5};

        for (int i = 0; i < 3 && i < users.size(); i++) {
            SeasonResult sr = new SeasonResult();
            sr.setSeason(saved);
            sr.setUserId(users.get(i).getId());
            sr.setUserName(users.get(i).getName());
            sr.setPlace(i + 1);
            sr.setFinalRating(finals[i]);
            sr.setRewardCoins(rewards[i]);
            sr.setCreatedAt(end.plusHours(1));
            seasonResultRepository.save(sr);
        }

        List<Department> depts = departmentRepository.findAll();
        if (depts.size() >= 3) {
            for (int i = 0; i < 3; i++) {
                DepartmentResult dr = new DepartmentResult();
                dr.setSeason(saved);
                dr.setDepartmentId(depts.get(i).getId());
                dr.setDepartmentName(depts.get(i).getName());
                dr.setPlace(i + 1);
                dr.setTotalRating(250.0 - i * 60.0);
                dr.setMemberCount(2);
                dr.setRewardCoinsPerMember(
                        i == 0 ? new BigDecimal("500.00") : BigDecimal.ZERO);
                dr.setCreatedAt(end.plusHours(2));
                departmentResultRepository.save(dr);
            }
        }
    }

    /**
     * Галереи товаров из product_images (маппинг по названиям из базы).
     * - product_id 31 «Футболка» → b4d2e778 → мой «Футболка классическая»
     * - product_id 34 «Худи с принтом» → dfca3e03 → мой «Худи с принтом»
     * - product_id 41 «Мышка» → a7cb9ef4 → мой «Мышка»
     * - product_id 50 «Кружка» → 56da81c3 → мой «Кружка»
     */
    private void extendProductGalleries() {
        boolean alreadyFilled = productRepository.findAll().stream()
                .anyMatch(p -> p.getImages() != null && !p.getImages().isEmpty());
        if (alreadyFilled) return;

        for (Product p : productRepository.findAll()) {
            if (p.getImages() == null) p.setImages(new ArrayList<>());
            switch (p.getName()) {
                case "Футболка классическая" ->
                        p.getImages().add("/uploads/b4d2e778-8329-44e2-9820-07a0775d5b3e.png");
                case "Худи с принтом" ->
                        p.getImages().add("/uploads/dfca3e03-a796-4d5f-9352-4f6a6b879fc7.png");
                case "Мышка" ->
                        p.getImages().add("/uploads/a7cb9ef4-3677-4df1-9d34-efbd91c45d03.webp");
                case "Кружка" ->
                        p.getImages().add("/uploads/56da81c3-5379-4e09-a915-015a8db8e424.png");
                default -> { /* без галереи */ }
            }
            productRepository.save(p);
        }
    }

    private void extendTransactionHistory(User admin, User hr,
                                          User empBack, User empFront,
                                          User empQa, User empSales,
                                          User mgrBack) {
        if (ratingTxRepository.count() > 50) return;

        LocalDateTime now = LocalDateTime.now();

        createRatingTxAt(empBack, 3.0, "Награда за событие «IT Meetup»",
                now.minusMonths(5).plusDays(2));
        createRatingTxAt(empFront, 3.0, "Награда за событие «IT Meetup»",
                now.minusMonths(5).plusDays(2));
        createRatingTxAt(empBack, 1.0, "Прохождение опроса вовлечённости",
                now.minusMonths(5).plusDays(10));

        createRatingTxAt(empQa, 2.0, "Награда за квест «Прочитать книгу»",
                now.minusMonths(4).plusDays(3));
        createRatingTxAt(empFront, 2.0, "Награда за квест «Пробежать 10 км»",
                now.minusMonths(4).plusDays(7));
        createRatingTxAt(empBack, 2.0, "Награда за событие «Забег 5 км»",
                now.minusMonths(4).plusDays(12));
        createRatingTxAt(empSales, 1.0, "Прохождение опроса вовлечённости",
                now.minusMonths(4).plusDays(15));

        createRatingTxAt(empBack, 1.5, "Награда за квест «Утренняя зарядка»",
                now.minusMonths(3).plusDays(1));
        createRatingTxAt(empFront, 1.5, "Награда за квест «Утренняя зарядка»",
                now.minusMonths(3).plusDays(1));
        createRatingTxAt(empQa, 1.0, "Награда за квест «Помочь коллеге»",
                now.minusMonths(3).plusDays(9));
        createRatingTxAt(empBack, 5.0, "Награда за квест «Организовать митап»",
                now.minusMonths(3).plusDays(18));
        createRatingTxAt(empSales, -1.0, "Штраф: нарушение регламента",
                now.minusMonths(3).plusDays(22));

        createRatingTxAt(empFront, 3.0, "Награда за квест «Помощь новичку»",
                now.minusMonths(2).plusDays(5));
        createRatingTxAt(empBack, 2.0, "Награда за событие «Воркшоп по архитектуре»",
                now.minusMonths(2).plusDays(11));
        createRatingTxAt(empQa, 1.0, "Прохождение опроса «Питание в офисе»",
                now.minusMonths(2).plusDays(16));
        createRatingTxAt(empBack, 1.0, "Streak 10 дней: бонус за серию",
                now.minusMonths(2).plusDays(20));

        createRatingTxAt(empBack, -50.0, "Сброс рейтинга после сезона Q3 2026",
                now.minusMonths(1).plusDays(2));
        createRatingTxAt(empFront, -30.0, "Сброс рейтинга после сезона Q3 2026",
                now.minusMonths(1).plusDays(2));
        createRatingTxAt(empQa, -20.0, "Сброс рейтинга после сезона Q3 2026",
                now.minusMonths(1).plusDays(2));
        createRatingTxAt(empSales, -10.0, "Сброс рейтинга после сезона Q3 2026",
                now.minusMonths(1).plusDays(2));

        createRatingTxAt(empBack, 2.0, "Награда за событие «Хакатон внутри компании»",
                now.minusDays(20));
        createRatingTxAt(empQa, 3.0, "Награда за событие «Хакатон внутри компании»",
                now.minusDays(20));
        createRatingTxAt(empFront, 2.0, "Награда за квест «Оставить 5 благодарностей»",
                now.minusDays(14));
        createRatingTxAt(empBack, 2.0, "Награда за квест «Посетить 3 события за месяц»",
                now.minusDays(10));
        createRatingTxAt(empSales, 1.0, "Прохождение опроса «Оценка онбординга»",
                now.minusDays(6));
        createRatingTxAt(empBack, 1.0, "Streak 5 дней подряд",
                now.minusDays(3));
        createRatingTxAt(empFront, 2.0, "Награда за статью в Базе знаний",
                now.minusDays(2));

        createCoinTxAt(empBack, empFront, 50.0, CoinTransactionType.PEER_THANKS,
                "Спасибо за помощь с релизом", ThanksTag.FOR_HELP,
                now.minusMonths(5).plusDays(3));
        createCoinTxAt(empFront, empQa, 30.0, CoinTransactionType.PEER_THANKS,
                "За качественное код-ревью", ThanksTag.FOR_HELP,
                now.minusMonths(4).plusDays(8));
        createCoinTxAt(empQa, empBack, 20.0, CoinTransactionType.PEER_THANKS,
                "Выручил с хотфиксом", ThanksTag.INITIATIVE,
                now.minusMonths(3).plusDays(5));
        createCoinTxAt(empSales, empFront, 40.0, CoinTransactionType.PEER_THANKS,
                "Помогла с презентацией для клиента", ThanksTag.MENTORING,
                now.minusMonths(2).plusDays(6));

        createCoinTxAt(mgrBack, empBack, 500.0, CoinTransactionType.MANAGER_BONUS,
                "Квартальная премия (Q1 2026)", null,
                now.minusMonths(4).plusDays(1));
        createCoinTxAt(mgrBack, empBack, 500.0, CoinTransactionType.MANAGER_BONUS,
                "Квартальная премия (Q2 2026)", null,
                now.minusMonths(2).plusDays(1));
        createCoinTxAt(mgrBack, empQa, 300.0, CoinTransactionType.MANAGER_BONUS,
                "За успешное тестирование релиза", null,
                now.minusMonths(1).plusDays(8));

        createCoinTxAt(null, empBack, 7000.0, CoinTransactionType.SEASON_REWARD,
                "1-е место в сезоне Q2 2026", null,
                now.minusMonths(4).plusDays(2));
        createCoinTxAt(null, empFront, 4000.0, CoinTransactionType.SEASON_REWARD,
                "2-е место в сезоне Q2 2026", null,
                now.minusMonths(4).plusDays(2));
        createCoinTxAt(null, empQa, 3000.0, CoinTransactionType.SEASON_REWARD,
                "3-е место в сезоне Q2 2026", null,
                now.minusMonths(4).plusDays(2));

        createCoinTxAt(empSales, null, 100.0, CoinTransactionType.PENALTY,
                "Штраф от HR. Причина: нарушение регламента", null,
                now.minusMonths(3).plusDays(22));

        createCoinTxAt(empBack, null, 1400.0, CoinTransactionType.PURCHASE,
                "Покупка: Футболка классическая (x1)", null,
                now.minusMonths(4).plusDays(15));
        createCoinTxAt(empFront, null, 2500.0, CoinTransactionType.PURCHASE,
                "Покупка: Свитшот (x1)", null,
                now.minusMonths(3).plusDays(4));
        createCoinTxAt(empQa, null, 900.0, CoinTransactionType.PURCHASE,
                "Покупка: USB-флешка (x1)", null,
                now.minusDays(18));
        createCoinTxAt(empSales, null, 3000.0, CoinTransactionType.PURCHASE,
                "Покупка: Сертификат в аквапарк (x1)", null,
                now.minusDays(8));

        createCoinTxAt(null, empQa, 900.0, CoinTransactionType.REFUND,
                "Возврат отменённой покупки", null,
                now.minusDays(17));
    }

    private void extendSurveys(User hr, User empBack, User empFront,
                               User empQa, User empSales, User mgrBack) {
        boolean already = surveyRepository.findAll().stream()
                .anyMatch(s -> "Оценка онбординга".equals(s.getTitle()));
        if (already) return;

        Survey s1 = new Survey();
        s1.setTitle("Оценка онбординга");
        s1.setDescription("Как прошёл ваш первый месяц в компании?");
        s1.setDeadline(LocalDateTime.now().minusDays(15));
        s1.setIsActive(false);
        s1.setCreator(hr);
        s1.setRewardRating(2.0);
        s1.setPenaltyRating(-1.0);
        surveyRepository.save(s1);

        SurveyQuestion q1 = addSurveyQuestion(s1,
                "Насколько понятным был процесс адаптации?",
                new String[][]{
                        {"Очень понятно", "5"},
                        {"Понятно", "4"},
                        {"Нейтрально", "3"},
                        {"Непонятно", "2"},
                        {"Совсем запутанно", "1"}
                });
        SurveyQuestion q2 = addSurveyQuestion(s1,
                "Помогал ли вам назначенный наставник?",
                new String[][]{
                        {"Да, постоянно", "5"},
                        {"Иногда", "3"},
                        {"Практически нет", "1"}
                });
        SurveyQuestion q3 = addSurveyQuestion(s1,
                "Хватало ли вам информации о процессах компании?",
                new String[][]{
                        {"Более чем достаточно", "5"},
                        {"Достаточно", "4"},
                        {"Хотелось бы больше", "2"}
                });

        submitSurveyResponse(s1, q1, q1.getOptions().get(1), empFront);
        submitSurveyResponse(s1, q2, q2.getOptions().get(0), empFront);
        submitSurveyResponse(s1, q3, q3.getOptions().get(1), empFront);

        submitSurveyResponse(s1, q1, q1.getOptions().get(2), empSales);
        submitSurveyResponse(s1, q2, q2.getOptions().get(1), empSales);
        submitSurveyResponse(s1, q3, q3.getOptions().get(2), empSales);

        submitSurveyResponse(s1, q1, q1.getOptions().get(1), empQa);
        submitSurveyResponse(s1, q2, q2.getOptions().get(0), empQa);

        Survey s2 = new Survey();
        s2.setTitle("Обратная связь по IT-инструментам");
        s2.setDescription("Оцените удобство рабочих инструментов");
        s2.setDeadline(LocalDateTime.now().plusDays(10));
        s2.setIsActive(true);
        s2.setCreator(hr);
        s2.setRewardRating(1.5);
        s2.setPenaltyRating(0.0);
        surveyRepository.save(s2);

        SurveyQuestion q4 = addSurveyQuestion(s2, "Оцените удобство Jira",
                new String[][]{{"1", "1"}, {"2", "2"}, {"3", "3"}, {"4", "4"}, {"5", "5"}});
        SurveyQuestion q5 = addSurveyQuestion(s2, "Оцените удобство Confluence",
                new String[][]{{"1", "1"}, {"2", "2"}, {"3", "3"}, {"4", "4"}, {"5", "5"}});
        SurveyQuestion q6 = addSurveyQuestion(s2, "Какого инструмента не хватает?",
                new String[][]{
                        {"Инструмент для 1:1 встреч", "1"},
                        {"Трекер целей OKR", "2"},
                        {"Платформа для обучения", "3"},
                        {"Всё устраивает", "0"}
                });

        submitSurveyResponse(s2, q4, q4.getOptions().get(3), empBack);
        submitSurveyResponse(s2, q5, q5.getOptions().get(3), empBack);
        submitSurveyResponse(s2, q6, q6.getOptions().get(1), empBack);

        submitSurveyResponse(s2, q4, q4.getOptions().get(2), empFront);
        submitSurveyResponse(s2, q5, q5.getOptions().get(2), empFront);
        submitSurveyResponse(s2, q6, q6.getOptions().get(2), empFront);

        submitSurveyResponse(s2, q4, q4.getOptions().get(4), mgrBack);
        submitSurveyResponse(s2, q5, q5.getOptions().get(3), mgrBack);
    }

    private void extendTickets(User support, User empBack, User empFront,
                               User empQa, User empSales, User mgrBack) {
        if (ticketRepository.count() > 6) return;

        SupportTicket t1 = createTicket(empFront,
                "Как запросить доступ к дашборду?",
                "Не вижу в меню раздела с аналитикой. Подскажите, как получить доступ.",
                false);
        takeTicket(t1, support);
        addTicketMessageAt(t1, support,
                "Здравствуйте! Дашборд появится после одобрения заявки от вашего руководителя.",
                LocalDateTime.now().minusDays(20).plusHours(1));
        addTicketMessageAt(t1, empFront,
                "Отлично, заявку отправила.",
                LocalDateTime.now().minusDays(20).plusHours(3));
        completeTicketAt(t1, LocalDateTime.now().minusDays(20).plusHours(5));
        t1.setRating(5);
        t1.setReviewComment("Спасибо, всё быстро!");
        ticketRepository.save(t1);

        SupportTicket t2 = createTicket(empSales,
                "Не открывается файл с прайсом",
                "При открытии вложения из письма — ошибка «Файл повреждён».",
                false);
        takeTicket(t2, support);
        addTicketMessageAt(t2, support,
                "Попробуйте скачать файл заново. Если ошибка повторится — пришлите скриншот.",
                LocalDateTime.now().minusDays(2).plusHours(1));
        addTicketMessageAt(t2, empSales,
                "Скачала заново — теперь всё открывается.",
                LocalDateTime.now().minusDays(2).plusHours(4));

        createTicket(empQa,
                "Проблема с тестовым стендом",
                "Тестовый стенд не отвечает с утра. Production работает.",
                false);

        SupportTicket t4 = createTicket(empBack,
                "Как поменять часовой пояс в календаре?",
                "Отображается UTC вместо моего локального времени.",
                false);
        takeTicket(t4, support);
        addTicketMessageAt(t4, support,
                "Зайдите в Профиль → Настройки → Часовой пояс.",
                LocalDateTime.now().minusDays(12).plusHours(1));
        completeTicketAt(t4, LocalDateTime.now().minusDays(12).plusHours(2));

        createTicket(empQa,
                "Прошу принять квест",
                "Выполнил «Пройти курс по Java», прикладываю сертификат.",
                true);
    }

    private void extendEventsAndQuests(User hr, User organiz, User mgrBack) {
        if (eventRepository.findAll().size() < 10) {
            createCustomEvent("Хакатон внутри компании", "IT",
                    "48-часовой хакатон с призами от компании",
                    "Москва, коворкинг «Точка кипения»",
                    hr, EventStatus.COMPLETED,
                    true, 300.00, 3.0,
                    LocalDateTime.now().minusDays(22),
                    LocalDateTime.now().minusDays(20));

            createCustomEvent("Мастер-класс по публичным выступлениям", "Soft Skills",
                    "Тренинг с профессиональным спикером",
                    "Онлайн (Zoom)",
                    hr, EventStatus.ASSIGNED,
                    false, null, null,
                    LocalDateTime.now().plusDays(5),
                    LocalDateTime.now().plusDays(5).plusHours(2));

            createCustomEvent("Спортивный день", "Sport",
                    "Весёлые старты и товарищеский матч по волейболу",
                    "Парк «Сокольники»",
                    organiz, EventStatus.ASSIGNED,
                    true, 150.00, 1.0,
                    LocalDateTime.now().plusDays(12),
                    LocalDateTime.now().plusDays(12).plusHours(4));
        }

        if (questRepository.findAll().size() < 12) {
            createQuest("Посетить 3 события за месяц",
                    "Примите участие в трёх корпоративных мероприятиях в течение месяца.",
                    500.00, "Все сотрудники", 30, hr, 3.0, false, null, null);

            createQuest("Оставить 5 благодарностей коллегам",
                    "Отметьте вклад пятерых коллег, отправив им благодарность.",
                    200.00, "Все сотрудники", 14, hr, 1.0, false, null, null);
        }
    }

    private void extendNews(User hr, User admin, User empBack, User empFront,
                            User empQa, User empSales, User mgrBack, User support) {

        if (newsRepository.findAll().stream()
                .noneMatch(n -> "Старая новость".equals(n.getTitle()))) {
            News archived = new News();
            archived.setTitle("Старая новость");
            archived.setContent("Эта новость уже неактуальна и находится в архиве.");
            archived.setAuthor(admin);
            archived.setIsPinned(false);
            archived.setIsArchived(true);
            archived.setArchivedAt(LocalDateTime.now().minusDays(40));
            archived.setExpiresAt(LocalDateTime.now().minusDays(35));
            archived.setViews(12);
            archived.setCreatedAt(LocalDateTime.now().minusDays(50));
            newsRepository.save(archived);
        }

        if (newsRepository.findAll().stream()
                .noneMatch(n -> "Обновление регламента".equals(n.getTitle()))) {
            News fresh = new News();
            fresh.setTitle("Обновление регламента согласования отпусков");
            fresh.setContent(
                    "Коллеги, обращаем внимание: обновлён регламент согласования отпусков.\n\n" +
                            "Что изменилось:\n" +
                            "- Минимальный срок подачи заявления — 14 дней\n" +
                            "- Согласование теперь проходит через HR-портал\n" +
                            "- В случае форс-мажора допускается согласование в течение 2 дней\n\n" +
                            "Вопросы — в HR или через поддержку.");
            fresh.setAuthor(hr);
            fresh.setIsPinned(true);
            fresh.setIsArchived(false);
            fresh.setViews(24);
            fresh.setExpiresAt(LocalDateTime.now().plusDays(30));
            newsRepository.save(fresh);
        }

        if (newsRepository.findAll().stream()
                .noneMatch(n -> "Итоги месяца".equals(n.getTitle()))) {
            News monthly = new News();
            monthly.setTitle("Итоги месяца");
            monthly.setContent(
                    "За прошедший месяц команда достигла отличных результатов:\n" +
                            "- Запущено 4 новых функции\n" +
                            "- Закрыто 42 задачи\n" +
                            "- Проведено 3 корпоративных мероприятия\n\n" +
                            "Спасибо всем за продуктивную работу!\n" +
                            "Отдельно отметим участников с самой высокой активностью в ПУЛЬС.");
            monthly.setAuthor(hr);
            monthly.setIsPinned(false);
            monthly.setIsArchived(false);
            monthly.setViews(0);
            monthly.setExpiresAt(LocalDateTime.now().plusDays(14));
            newsRepository.save(monthly);
        }

        for (News n : newsRepository.findAll()) {
            if (newsRatingRepository.countByNewsId(n.getId()) > 0) continue;
            createNewsRatingIfMissing(n, empBack, 5);
            createNewsRatingIfMissing(n, empFront, 4);
            createNewsRatingIfMissing(n, empQa, 5);
            createNewsRatingIfMissing(n, mgrBack, 4);
            createNewsRatingIfMissing(n, empSales, 5);
        }
    }

    private void extendShopAudit(User admin, User hr) {
        if (shopAuditLogRepository.count() > 5) return;

        LocalDateTime now = LocalDateTime.now();

        createAuditLog("PRODUCT_CREATED", admin, findProductByName("Футболка классическая"),
                null, "Создан товар: Футболка классическая", 67,
                now.minusMonths(3).plusDays(1));
        createAuditLog("PRODUCT_CREATED", admin, findProductByName("Худи"),
                null, "Создан товар: Худи", 51,
                now.minusMonths(3).plusDays(2));
        createAuditLog("PRODUCT_CREATED", admin, findProductByName("Повербанк"),
                null, "Создан товар: Повербанк", 7,
                now.minusMonths(2).plusDays(3));

        Product hoodie = findProductByName("Худи");
        createAuditLog("DISCOUNT_CREATED", admin, hoodie, null,
                "Скидка 20% на «Худи» до " + now.plusDays(5).toLocalDate(),
                null, now.minusDays(2));

        Product thermomug = findProductByName("Термокружка");
        createAuditLog("STOCK_WRITTEN_OFF", admin, thermomug, null,
                "Списано 2 шт. Причина: повреждение при транспортировке",
                -2, now.minusDays(15));

        Product usb = findProductByName("USB-флешка");
        createAuditLog("PRODUCT_RESTOCKED", admin, usb, null,
                "Пополнение: +10 шт. Новый остаток: 30 шт.",
                10, now.minusDays(10));

        Product tshirt = findProductByName("Футболка классическая");
        createAuditLog("PRODUCT_SOLD", admin, tshirt, null,
                "Покупка: 1 шт. Новый остаток: 66 шт.",
                -1, now.minusDays(9));
    }

    private Product findProductByName(String name) {
        return productRepository.findAll().stream()
                .filter(p -> name.equals(p.getName()))
                .findFirst().orElse(null);
    }

    // ==================================================================
    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ======================
    // ==================================================================

    private RatingTransaction createRatingTxAt(User user, double amount,
                                               String reason, LocalDateTime at) {
        RatingTransaction rt = new RatingTransaction();
        rt.setUserId(user.getId());
        rt.setAmount(amount);
        rt.setReason(reason);
        rt.setCreatedAt(at);
        return ratingTxRepository.save(rt);
    }

    private CoinTransaction createCoinTxAt(User from, User to, double amount,
                                           CoinTransactionType type, String comment,
                                           ThanksTag tag, LocalDateTime at) {
        CoinTransaction tx = new CoinTransaction();
        tx.setFromUserId(from != null ? from.getId() : null);
        tx.setToUserId(to != null ? to.getId() : null);
        tx.setAmount(BigDecimal.valueOf(amount));
        tx.setType(type);
        tx.setComment(comment);
        tx.setTag(tag);
        tx.setIsCancelled(false);
        tx.setCreatedAt(at);
        return coinTxRepository.save(tx);
    }

    private void addTicketMessageAt(SupportTicket t, User sender, String text, LocalDateTime at) {
        TicketMessage m = new TicketMessage();
        m.setTicket(t);
        m.setSender(sender);
        m.setText(text);
        m.setCreatedAt(at);
        ticketMessageRepository.save(m);
    }

    private void completeTicketAt(SupportTicket t, LocalDateTime at) {
        t.setStatus(TicketStatus.COMPLETED);
        t.setClosedAt(at);
        ticketRepository.save(t);
    }

    private void createCustomEvent(String name, String category, String desc, String place,
                                   User organizer, EventStatus status,
                                   boolean paidInCoins, Double coins, Double rating,
                                   LocalDateTime from, LocalDateTime to) {
        Event e = new Event();
        e.setNameEvent(name);
        e.setCategory(category);
        e.setDescription(desc);
        e.setEventPlace(place);
        e.setOrganizer(organizer);
        e.setFromTime(from);
        e.setToTime(to);
        e.setEventStatus(status);
        e.setPaidInCoins(paidInCoins);
        e.setRewardCoins(coins != null ? BigDecimal.valueOf(coins) : null);
        e.setRewardRating(rating);
        e.setRewardsGranted(status == EventStatus.COMPLETED && paidInCoins);
        eventRepository.save(e);
    }

    private void createNewsRatingIfMissing(News n, User user, int value) {
        if (newsRatingRepository.findByNewsIdAndUserId(n.getId(), user.getId()).isPresent()) return;
        NewsRating r = new NewsRating();
        r.setNewsId(n.getId());
        r.setUserId(user.getId());
        r.setValue(value);
        newsRatingRepository.save(r);
    }

    private void createAuditLog(String action, User actor, Product product,
                                Order order, String details, Integer delta,
                                LocalDateTime at) {
        ShopAuditLog auditLog = new ShopAuditLog();
        auditLog.setAction(action);
        auditLog.setActorId(actor.getId());
        auditLog.setActorName(actor.getName());
        if (product != null) {
            auditLog.setProductId(product.getId());
            auditLog.setProductName(product.getName());
        }
        if (order != null) auditLog.setOrderId(order.getId());
        auditLog.setDetails(details);
        auditLog.setQuantityDelta(delta);
        auditLog.setCreatedAt(at);
        shopAuditLogRepository.save(auditLog);
    }
}