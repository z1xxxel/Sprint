package com.sprint.tms_backend.config;

import com.sprint.tms_backend.model.*;
import com.sprint.tms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AchievementRepository achievementRepository;
    private final SystemSettingRepository settingRepository;
    private final QuestRepository questRepository;
    private final EventRepository eventRepository;
    private final NewsRepository newsRepository;
    private final TreasuryRepository treasuryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedSettings();
        seedTreasury();

        if (userRepository.count() > 0) {
            log.info("База данных уже содержит пользователей. Пропускаем инициализацию.");
            seedAchievements();
            return;
        }

        // --- 1. Отделы ---
        Department backend = createDepartment("Backend Team", "Серверная разработка");
        Department frontend = createDepartment("Frontend Team", "Клиентская разработка");
        Department qa = createDepartment("QA Team", "Тестирование и качество");
        Department support = createDepartment("Support Team", "Техническая поддержка");
        Department sales = createDepartment("Sales Team", "Отдел продаж");

        // --- 2. Пользователи (из дампа: id 1-9, 20) ---
        User admin = createUser("Сергей Админов", "admin@tms.local", "qwer", UserRole.ADMIN,
                48547.40, 11.0, 1600.0, null,
                "/uploads/6cea5f05-59ea-4eb6-b02f-bdb6bf983ee1.jpg");
        User hr = createUser("Ольга HR", "hr@tms.local", "123", UserRole.HR,
                18000.00, 2.0, 150.0, null, null);
        User mgrBack = createUser("Иван Бэкендов", "mgr_back@tms.local", "123", UserRole.MANAGER,
                5600.00, 0.0, 51.0, backend, null);
        User mgrFront = createUser("Анна Фронтендова", "mgr_front@tms.local", "123", UserRole.MANAGER,
                4200.00, 1.0, 60.0, frontend, null);
        User empBack = createUser("Петр Кодеров", "emp_back@tms.local", "123", UserRole.EMPLOYEE,
                8600.00, 0.0, 1600.0, qa, null);
        User empFront = createUser("Мария Верстальщикова", "emp_front@tms.local", "123", UserRole.EMPLOYEE,
                3027.00, 0.0, 60.0, frontend, null);
        User empQa = createUser("Алексей Тестировщиков", "emp_qa@tms.local", "123", UserRole.EMPLOYEE,
                1950.00, 0.0, 20.0, qa, null);
        User supportUser = createUser("Дмитрий Хелперов", "support@tms.local", "qwerty", UserRole.SUPPORT,
                1339.00, 3.0, 50.0, support, null);
        User empSales = createUser("Елена Продажникова", "emp_sales@tms.local", "123", UserRole.EMPLOYEE,
                3350.00, 0.0, 8.0, sales, null);
        User regularUser = createUser("Обычный пользователь", "qweewq@tms.local", "qwer", UserRole.EMPLOYEE,
                6650.00, 6.0, 27.5, null, null);

        // --- 3. Категории (из дампа: id 13-20) ---
        Category textiles = createCategory("Текстиль", "Одежда с корпоративной символикой.", 1,
                "/uploads/b039090b-3422-47ad-885f-3cc2d835512e.png");
        Category gadgets = createCategory("Гаджеты", "Брендированные гаджеты", 2,
                "/uploads/afc5dcbe-55f4-450b-ac63-1ce3cfbfe94a.webp");
        Category accessories = createCategory("Аксессуары", "", 3,
                "/uploads/aa75cd38-be6b-4eb6-8316-5465aa0e5b1e.jpg");
        Category mugs = createCategory("Кружки и термокружки", "", 4,
                "/uploads/683551b7-9979-4a8b-94a9-0eaf0619fa72.png");
        Category leisure = createCategory("Отдых", "", 5,
                "/uploads/9e722cb4-f3ec-4fc6-838c-b47a8377f300.webp");
        Category testCat = createCategory("Тест", "Тест", 6,
                "/uploads/1d32ede6-9f90-4192-bc07-f1c481fad521.png");
        Category cat19 = createCategory("Категория", "", 7,
                "/uploads/bb258781-27d5-402d-9261-1c8303b7829b.png");
        Category cat20 = createCategory("Тест1", "Тест", 8,
                "/uploads/80cc2d2e-5a8a-4f6c-816f-b685afa9b524.png");

        // --- 4. Товары (из дампа: id 31-56, только активные) ---
        // Текстиль с вариантами
        createProduct("Футболка", "Футболка с логотипом компании", 1400.00, 67, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый",
                "/uploads/afcb7e7e-f555-4eab-bb28-7a6bb97cb56e.png");
        createProduct("Футболка", "Футболка с логотипом сервиса", 1500.00, 41, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный",
                "/uploads/de2e3d1c-4cfa-4ae5-a757-58119fa8c7f9.webp");
        createProduct("Худи", "Худи с маленьким логотипом", 3500.00, 51, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный",
                "/uploads/0f088a22-fbc9-42c4-b639-f15e95cdbf8e.png");
        createProduct("Худи", "Худи с принтом на всю грудь", 4000.00, 47, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый",
                "/uploads/563cdfff-e949-49df-91fb-0c963891f234.png");
        createProduct("Свитшот", "Свитшот с логотипом сервиса", 2500.00, 18, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный",
                "/uploads/d72883a9-3d59-4bd9-af4b-f3567cd0b6d3.png");

        // Текстиль без вариантов
        createProduct("Шопер", "Шопер с логотипом сервиса", 800.00, 12, textiles,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/b9e40d9f-8def-4d07-ade0-1ea3388d97c7.png");
        createProduct("Бейсболка", "Бейсболка с логотипом сервиса", 600.00, 15, textiles,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/531b81e2-0b2b-4a15-9996-48e4fb5cd3da.png");

        // Гаджеты
        createProduct("Повербанк", "Повербанк на 10000 мАч", 3000.00, 7, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/1d0f3941-f853-422f-bef9-f0eca7371565.png");
        createProduct("Беспроводная зарядка", "Беспроводная зарядка", 2500.00, 5, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/2a0b166d-3159-4234-8b24-23c520e62214.png");
        createProduct("USB-флешка", "Брендированная флешка на 128гб", 900.00, 20, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/ee448ce2-95b0-4fc1-abfe-efdc4bde7717.png");
        createProduct("Мышка", "Компьютерная мышь", 1800.00, 31, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/6821ab30-fcea-469b-ac53-52fa746ad582.webp");
        createProduct("Клавиатура", "Брендированная клавиатура", 2500.00, 4, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/53f87134-4371-481c-bf97-1ff66683064b.png");
        createProduct("Наушники", "Наушники брендированные", 3000.00, 4, gadgets,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/ac088799-af43-4cd5-8622-b20155fcd104.png");

        // Аксессуары
        createProduct("Значок", "Значки случайные", 50.00, 85, accessories,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/463b5b60-c623-4d45-9362-a5442d7df8f2.png");
        createProduct("Ручка", "Ручка брендированная", 100.00, 56, accessories,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/0aa647be-a0a4-4c97-9977-f64e62f63826.png");
        createProduct("Блокнот", "Блокнот", 250.00, 33, accessories,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/a3cc449f-aa94-4b43-aa06-cbfcf2447e46.png");

        // Кружки
        createProduct("Термокружка", "Термокружка брендированная", 1200.00, 13, mugs,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/7ce3ab4c-5568-4fe4-b072-6ce35ec84169.png");
        createProduct("Термобутылка", "Термобутылка брендированная", 1000.00, 18, mugs,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/b9ec56f3-51c3-4c07-86f5-198d6b411f5d.png");
        createProduct("Кружка", "Брендированная кружка", 900.00, 1, mugs,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/dd8bf683-ebf0-49e3-abed-150593d2ae9a.png");
        createProduct("Бутылка спортивная", "Спортивная бутылка брендированная", 600.00, 7, mugs,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/62fde5b0-aee3-4c6b-95c6-ce977f443901.png");

        // Отдых
        createProduct("Отгул", "Отгул на 1 день", 6000.00, 999, leisure,
                ProductType.PERK, false, null, null,
                "/uploads/d8669752-8259-4a03-9a17-fb501c87f2fb.webp");
        createProduct("Сертификат в аквапарк", "Сертификат на поход в аквапарк", 4000.00, 999, leisure,
                ProductType.PERK, false, null, null,
                "/uploads/61fe1e64-a689-40ac-af2e-37d2e804ad30.png");
        createProduct("Сертификат на посещение катка", "Сертификат на посещение катка", 1500.00, 120, leisure,
                ProductType.PHYSICAL, false, null, null,
                "/uploads/04deefc3-8adc-420d-a369-23a4125e2b9f.png");

        // Тестовые (с вариантами)
        createProduct("Товар 1", "Описание тестового товара", 552.00, 20, testCat,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый",
                "/uploads/32dad408-d85f-4264-ab76-1bff86416f65.png");
        createProduct("Название", "123", 1000.00, 27, textiles,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый",
                "/uploads/c39d3873-406a-471b-b620-e8ccd75e1324.png");
        createProduct("ТЕст", "Тест", 1000.00, 20, cat20,
                ProductType.PHYSICAL, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый",
                "/uploads/412bea7a-0a33-4b21-9248-8b9e7bf48f4d.png");

        // --- 5. Квесты (из дампа) ---
        createQuest("Прочитать книгу", "Прочитать книгу по программированию", 200.00,
                "Все сотрудники", 2, hr, null, false, null, null);
        createQuest("Пробежать 10 км", "Спортивный челлендж", 300.00,
                "Все сотрудники", 2, hr, null, false, null, null);
        createQuest("Помочь коллеге", "Помочь с задачами другому отделу", 100.00,
                "Все сотрудники", 3, hr, null, false, null, null);
        createQuest("Пройти курс по Java", "Просмотреть 10 лекций и сдать тест", 1000.00,
                "Все сотрудники", 4, hr, 2.0, false, null, null);
        createQuest("Организовать митап", "Провести внутренний митап по обмену опытом", 2000.00,
                "Все сотрудники", 5, hr, 5.0, false, null, null);
        createQuest("Написать статью в блог", "Статья на 3000+ символов", 800.00,
                "Все сотрудники", 6, hr, 1.0, false, null, null);
        createQuest("Пройди опрос", "Обязательный опрос по вовлеченности", 500.00,
                "Все сотрудники", 7, hr, 0.0, true, 100.0, 1.0);
        createQuest("Утренняя зарядка", "5 дней подряд делать зарядку", 300.00,
                "Все сотрудники", 8, hr, 1.5, false, null, null);
        createQuest("Помощь новичку", "Онбординг нового сотрудника", 1500.00,
                "Все сотрудники", 9, hr, 3.0, false, null, null);

        // --- 6. События ---
        createEvent("IT Meetup", "IT", "Обсуждаем архитектуру", "Москва", hr, EventStatus.ASSIGNED);
        createEvent("Коммуникация", "Soft Skills", "Как общаться", "Онлайн", hr, EventStatus.ASSIGNED);
        createEvent("Забег", "Sport", "Бежим 5 км", "Парк", hr, EventStatus.ASSIGNED);
        createEvent("Воркшоп по архитектуре", "Обучение", "Разбираем микросервисы", "Онлайн", hr, EventStatus.ASSIGNED);
        createEvent("Пятничный покер", "Тимбилдинг", "Играем в покер в офисе", "Офис, 4 этаж", admin, EventStatus.ASSIGNED);
        createEvent("Тест мероприятие 1", "Тест категория 1", "Описание", "Тест место 1", admin, EventStatus.NEW);

        // --- 7. Новости (из дампа) ---
        createNews("Запуск платформы ПУЛЬС!",
                "Ура! Мы запустили нашу платформу вовлеченности ПУЛЬС. Теперь вы можете получать монеты за активность и тратить их в магазине.",
                true, hr, "/uploads/72d0bc5d-673a-4d09-b6ef-6493c9b73777.jpg");
        createNews("Итоги квартала", "Мы отлично поработали в этом квартале!",
                false, admin, null);
        createNews("Новогодний корпоратив",
                "Встречаемся 25 декабря в 18:00 в ресторане \"Прага\". Будет весело!",
                false, hr, "https://example.com/cover3.jpg");
        createNews("Тест 1", "Тест описание, Тест описание, Тест описание...",
                true, admin, "/uploads/b4f1fafe-dbbd-4154-bda2-e57618c23b1e.jpg");

        // --- 8. Ачивки ---
        seedAchievements();

        log.info("✅ Тестовые данные успешно добавлены ({} пользователей, {} товаров, {} квестов).",
                userRepository.count(), productRepository.count(), questRepository.count());
    }

    // ==========================================
    // === SEED МЕТОДЫ ===
    // ==========================================

    private void seedTreasury() {
        if (treasuryRepository.count() == 0) {
            Treasury t = new Treasury();
            t.setId(1L);
            t.setBalance(new BigDecimal("26178.00"));
            treasuryRepository.save(t);
        }
    }

    private void seedSettings() {
        createSettingIfNotExists("limit.peer.daily-per-recipient", "1000", "Лимит на коллегу",
                "Максимум монет, которое можно перевести одному коллеге за день", "Переводы");
        createSettingIfNotExists("limit.peer.daily-total", "1000", "Общий лимит переводов",
                "Максимум монет, которое можно перевести всем коллегам за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-per-subordinate", "2000", "Лимит бонусов на сотрудника",
                "Максимум монет, которое менеджер может начислить одному сотруднику за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-total", "5000", "Общий лимит бонусов менеджера",
                "Максимум монет, которое менеджер может начислить всем сотрудникам за день", "Переводы");
        createSettingIfNotExists("economy.monthly-earn-limit", "10000", "Месячный лимит заработка",
                "Максимум монет, которое сотрудник может заработать за месяц", "Экономика");
        createSettingIfNotExists("limit.quest.max-reward", "5000", "Макс. награда за квест",
                "Максимальное количество монет, которое можно назначить за один квест", "Экономика");
        createSettingIfNotExists("limit.event.max-reward", "2000", "Макс. награда за событие",
                "Максимальное количество монет, которое можно назначить за одно событие", "Экономика");
        createSettingIfNotExists("economy.treasury.auto-refill-amount", "50000", "Автопополнение казны (сумма)",
                "На сколько монет пополняется казна 1-го числа каждого месяца", "Экономика");
        createSettingIfNotExists("economy.treasury.threshold", "1000", "Автопополнение казны (порог)",
                "Если баланс казны опускается ниже этого числа, сработает автопополнение", "Экономика");
    }

    private void seedAchievements() {
        upsertAchievement("EVENT_JOINER_5", "Участник I", "Посетил 5 событий",
                AchievementType.AUTOMATIC, 5, 1, "EVENT_JOINER", new BigDecimal("50.00"));
        upsertAchievement("EVENT_JOINER_10", "Участник II", "Посетил 10 событий",
                AchievementType.AUTOMATIC, 10, 2, "EVENT_JOINER", new BigDecimal("100.00"));
        upsertAchievement("EVENT_JOINER_20", "Участник III", "Посетил 20 событий",
                AchievementType.AUTOMATIC, 20, 3, "EVENT_JOINER", new BigDecimal("200.00"));
        upsertAchievement("SEASON_CHAMPION", "Чемпион сезона", "1 место в общем рейтинге",
                AchievementType.AUTOMATIC, 1, 1, "SEASON", new BigDecimal("0"));
        upsertAchievement("SEASON_TOP_3", "Лидер сезона", "Топ-3 в общем рейтинге",
                AchievementType.AUTOMATIC, 1, 2, "SEASON", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_1", "Гордость отдела I", "1 место в своем подразделении",
                AchievementType.AUTOMATIC, 1, 1, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_2", "Лучший в отделе II", "Занял 2 место по рейтингу внутри отдела",
                AchievementType.AUTOMATIC, 2, 2, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_3", "Лучший в отделе III", "Занял 3 место по рейтингу внутри отдела",
                AchievementType.AUTOMATIC, 3, 3, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("BEST_EMPLOYEE", "Лучший сотрудник", "Особое достижение от руководства",
                AchievementType.MANUAL, null, 1, "BEST_EMPLOYEE", new BigDecimal("500.00"));
        upsertAchievement("HELPER", "Помощник", "Активно помогает коллегам",
                AchievementType.MANUAL, null, 1, "HELPER", new BigDecimal("300.00"));
        upsertAchievement("MENTOR", "Наставник", "Обучает и поддерживает новых сотрудников",
                AchievementType.MANUAL, null, 1, "MENTOR", new BigDecimal("500.00"));
        upsertAchievement("INNOVATOR", "Инноватор", "Предложил и внедрил полезную идею",
                AchievementType.MANUAL, null, 1, "INNOVATOR", new BigDecimal("500.00"));
    }

    // ==========================================
    // === ХЕЛПЕРЫ ===
    // ==========================================

    private void createSettingIfNotExists(String key, String value, String label, String desc, String category) {
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

    private void upsertAchievement(String code, String name, String description, AchievementType type,
                                   Integer requiredProgress, Integer level, String groupCode, BigDecimal rewardCoins) {
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
                    v.setSize(size);
                    v.setColor(color);
                    v.setStock((int) (Math.random() * 8) + 2); // 2–9 шт.
                    variantRepository.save(v);
                }
            }
        }

        return saved;
    }

    private void createQuest(String title, String description, double reward, String audience,
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
        questRepository.save(q);
    }

    private void createEvent(String name, String category, String description, String place,
                             User organizer, EventStatus status) {
        Event e = new Event();
        e.setNameEvent(name);
        e.setCategory(category);
        e.setDescription(description);
        e.setEventPlace(place);
        e.setFromTime(LocalDateTime.now().plusDays(3));
        e.setToTime(LocalDateTime.now().plusDays(3).plusHours(2));
        e.setOrganizer(organizer);
        e.setEventStatus(status);
        e.setPaidInCoins(false);
        e.setRewardsGranted(false);
        eventRepository.save(e);
    }

    private void createNews(String title, String content, boolean isPinned, User author, String coverUrl) {
        News n = new News();
        n.setTitle(title);
        n.setContent(content);
        n.setIsPinned(isPinned);
        n.setAuthor(author);
        n.setIsArchived(false);
        n.setViews(0);
        n.setCoverUrl(coverUrl);
        n.setExpiresAt(LocalDateTime.now().plusDays(30));
        newsRepository.save(n);
    }
}