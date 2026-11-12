package com.sprint.tms_backend.config;

import com.sprint.tms_backend.model.*;
import com.sprint.tms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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

        // --- 2. Пользователи ---
        User admin = createUser("Сергей Админов", "admin@tms.local", "qwer", UserRole.ADMIN, 48547.40, 11.0, 1600.0, null);
        User hr = createUser("Ольга HR", "hr@tms.local", "123", UserRole.HR, 18000.00, 2.0, 150.0, null);
        User mgrBack = createUser("Иван Бэкендов", "mgr_back@tms.local", "123", UserRole.MANAGER, 5600.00, 0.0, 51.0, backend);
        User mgrFront = createUser("Анна Фронтендова", "mgr_front@tms.local", "123", UserRole.MANAGER, 4200.00, 1.0, 60.0, frontend);
        User supportUser = createUser("Дмитрий Хелперов", "support@tms.local", "qwerty", UserRole.SUPPORT, 1339.00, 3.0, 50.0, support);
        User empBack = createUser("Петр Кодеров", "emp_back@tms.local", "123", UserRole.EMPLOYEE, 8600.00, 0.0, 1600.0, qa);
        User empFront = createUser("Мария Верстальщикова", "emp_front@tms.local", "123", UserRole.EMPLOYEE, 3027.00, 0.0, 60.0, frontend);
        User empQa = createUser("Алексей Тестировщиков", "emp_qa@tms.local", "123", UserRole.EMPLOYEE, 1950.00, 0.0, 20.0, qa);
        User empSales = createUser("Елена Продажникова", "emp_sales@tms.local", "123", UserRole.EMPLOYEE, 3350.00, 0.0, 8.0, sales);
        User regularUser = createUser("Обычный пользователь", "qweewq@tms.local", "qwer", UserRole.EMPLOYEE, 6650.00, 6.0, 27.5, null);

        // --- 3. Категории ---
        Category textiles = createCategory("Текстиль", "Одежда с корпоративной символикой.", 1);
        Category gadgets = createCategory("Гаджеты", "Брендированные гаджеты", 2);
        Category accessories = createCategory("Аксессуары", "Полезные мелочи", 3);
        Category mugs = createCategory("Кружки и термокружки", "Посуда", 4);
        Category leisure = createCategory("Отдых", "Впечатления и отдых", 5);
        Category testCat = createCategory("Тест", "Тестовая категория", 6);

        // --- 4. Товары ---
        // Текстиль (с размерами)
        createProduct("Футболка", "Футболка с логотипом компании", 1400.00, 67, textiles, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый");
        createProduct("Футболка", "Футболка с логотипом сервиса", 1500.00, 41, textiles, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный");
        createProduct("Худи", "Худи с маленьким логотипом", 3500.00, 51, textiles, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный");
        createProduct("Худи", "Худи с принтом на всю грудь", 4000.00, 47, textiles, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый");
        createProduct("Свитшот", "Свитшот с логотипом сервиса", 2500.00, 18, textiles, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный");

        // Текстиль (без размеров)
        createProduct("Шопер", "Шопер с логотипом сервиса", 800.00, 12, textiles, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Бейсболка", "Бейсболка с логотипом сервиса", 600.00, 15, textiles, ProductType.PHYSICAL, false, false, null, null);

        // Гаджеты
        createProduct("Повербанк", "Повербанк на 10000 мАч", 3000.00, 7, gadgets, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Беспроводная зарядка", "Беспроводная зарядка", 2500.00, 5, gadgets, ProductType.PHYSICAL, false, false, null, null);
        createProduct("USB-флешка", "Брендированная флешка на 128гб", 900.00, 20, gadgets, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Мышка", "Компьютерная мышь", 1800.00, 31, gadgets, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Клавиатура", "Брендированная клавиатура", 2500.00, 4, gadgets, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Наушники", "Наушники брендированные", 3000.00, 4, gadgets, ProductType.PHYSICAL, false, false, null, null);

        // Аксессуары
        createProduct("Значок", "Значки случайные", 50.00, 85, accessories, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Ручка", "Ручка брендированная", 100.00, 56, accessories, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Блокнот", "Блокнот", 250.00, 33, accessories, ProductType.PHYSICAL, false, false, null, null);

        // Кружки
        createProduct("Термокружка", "Термокружка брендированная", 1200.00, 13, mugs, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Термобутылка", "Термобутылка брендированная", 1000.00, 18, mugs, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Кружка", "Брендированная кружка", 900.00, 1, mugs, ProductType.PHYSICAL, false, false, null, null);
        createProduct("Бутылка спортивная", "Спортивная бутылка брендированная", 600.00, 7, mugs, ProductType.PHYSICAL, false, false, null, null);

        // Отдых
        createProduct("Отгул", "Отгул на 1 день", 6000.00, 999, leisure, ProductType.PERK, false, false, null, null);
        createProduct("Сертификат в аквапарк", "Сертификат на поход в аквапарк", 4000.00, 999, leisure, ProductType.PERK, false, false, null, null);
        createProduct("Сертификат на посещение катка", "Сертификат на посещение катка", 1500.00, 120, leisure, ProductType.PHYSICAL, false, false, null, null);

        // Тестовые
        createProduct("Товар 1", "Описание тестового товара", 552.00, 20, testCat, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый");
        createProduct("ТЕст", "Тест", 1000.00, 20, testCat, ProductType.PHYSICAL, true, true, "XXS,XS,S,M,L,XL,XXL,XXXL", "Черный,Белый");


        // --- 5. Квесты ---
        createQuest("Прочитать книгу", "Прочитать книгу по программированию", 200.00, "Все сотрудники", 2, hr);
        createQuest("Пробежать 10 км", "Спортивный челлендж", 300.00, "Все сотрудники", 2, hr);
        createQuest("Помочь коллеге", "Помочь с задачами другому отделу", 100.00, "Все сотрудники", 3, hr);
        createQuest("Пройти курс по Java", "Просмотреть 10 лекций и сдать тест", 1000.00, "Все сотрудники", 4, hr);
        createQuest("Организовать митап", "Провести внутренний митап по обмену опытом", 2000.00, "Все сотрудники", 5, hr);
        createQuest("Написать статью в блог", "Статья на 3000+ символов", 800.00, "Все сотрудники", 6, hr);
        createQuest("Пройди опрос", "Обязательный опрос по вовлеченности", 500.00, "Все сотрудники", 7, hr);
        createQuest("Утренняя зарядка", "5 дней подряд делать зарядку", 300.00, "Все сотрудники", 8, hr);
        createQuest("Помощь новичку", "Онбординг нового сотрудника", 1500.00, "Все сотрудники", 9, hr);

        // --- 6. События ---
        createEvent("IT Meetup", "IT", "Обсуждаем архитектуру", "Москва", hr);
        createEvent("Коммуникация", "Soft Skills", "Как общаться", "Онлайн", hr);
        createEvent("Забег", "Sport", "Бежим 5 км", "Парк", hr);
        createEvent("Воркшоп по архитектуре", "Обучение", "Разбираем микросервисы", "Онлайн", hr);
        createEvent("Пятничный покер", "Тимбилдинг", "Играем в покер в офисе", "Офис, 4 этаж", admin);
        createEvent("Тест мероприятие 1", "Тест категория 1", "Описание", "Тест место 1", admin);

        // --- 7. Новости ---
        createNews("Запуск платформы ПУЛЬС!", "Ура! Мы запустили нашу платформу вовлеченности ПУЛЬС. Теперь вы можете получать монеты за активность и тратить их в магазине.", true, hr);
        createNews("Итоги квартала", "Мы отлично поработали в этом квартале!", false, admin);
        createNews("Новогодний корпоратив", "Встречаемся 25 декабря в 18:00 в ресторане \"Прага\". Будет весело!", false, hr);

        // --- 8. Ачивки ---
        seedAchievements();

        log.info("✅ Тестовые данные успешно добавлены ({} пользователей, {} товаров, {} квестов).",
                userRepository.count(), productRepository.count(), questRepository.count());
    }

    private void seedTreasury() {
        if (treasuryRepository.count() == 0) {
            Treasury t = new Treasury();
            t.setId(1L);
            t.setBalance(new BigDecimal("26178.00"));
            treasuryRepository.save(t);
        }
    }

    private void seedSettings() {
        createSettingIfNotExists("limit.peer.daily-per-recipient", "1000", "Лимит на коллегу", "Максимум монет, которое можно перевести одному коллеге за день", "Переводы");
        createSettingIfNotExists("limit.peer.daily-total", "1000", "Общий лимит переводов", "Максимум монет, которое можно перевести всем коллегам за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-per-subordinate", "2000", "Лимит бонусов на сотрудника", "Максимум монет, которое менеджер может начислить одному сотруднику за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-total", "5000", "Общий лимит бонусов менеджера", "Максимум монет, которое менеджер может начислить всем сотрудникам за день", "Переводы");
        createSettingIfNotExists("economy.monthly-earn-limit", "10000", "Месячный лимит заработка", "Максимум монет, которое сотрудник может заработать за месяц", "Экономика");
        createSettingIfNotExists("limit.quest.max-reward", "5000", "Макс. награда за квест", "Максимальное количество монет, которое можно назначить за один квест", "Экономика");
        createSettingIfNotExists("limit.event.max-reward", "2000", "Макс. награда за событие", "Максимальное количество монет, которое можно назначить за одно событие", "Экономика");
        createSettingIfNotExists("economy.treasury.auto-refill-amount", "50000", "Автопополнение казны (сумма)", "На сколько монет пополняется казна 1-го числа каждого месяца", "Экономика");
        createSettingIfNotExists("economy.treasury.threshold", "1000", "Автопополнение казны (порог)", "Если баланс казны опускается ниже этого числа, сработает автопополнение", "Экономика");
    }

    private void seedAchievements() {
        upsertAchievement("EVENT_JOINER_5", "Участник I", "Посетил 5 событий", AchievementType.AUTOMATIC, 5, 1, "EVENT_JOINER", new BigDecimal("50.00"));
        upsertAchievement("EVENT_JOINER_10", "Участник II", "Посетил 10 событий", AchievementType.AUTOMATIC, 10, 2, "EVENT_JOINER", new BigDecimal("100.00"));
        upsertAchievement("EVENT_JOINER_20", "Участник III", "Посетил 20 событий", AchievementType.AUTOMATIC, 20, 3, "EVENT_JOINER", new BigDecimal("200.00"));
        upsertAchievement("SEASON_CHAMPION", "Чемпион сезона", "1 место в общем рейтинге", AchievementType.AUTOMATIC, 1, 1, "SEASON", new BigDecimal("0"));
        upsertAchievement("SEASON_TOP_3", "Лидер сезона", "Топ-3 в общем рейтинге", AchievementType.AUTOMATIC, 1, 2, "SEASON", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_1", "Гордость отдела I", "1 место в своем подразделении", AchievementType.AUTOMATIC, 1, 1, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_2", "Лучший в отделе II", "Занял 2 место по рейтингу внутри отдела", AchievementType.AUTOMATIC, 2, 2, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_3", "Лучший в отделе III", "Занял 3 место по рейтингу внутри отдела", AchievementType.AUTOMATIC, 3, 3, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("BEST_EMPLOYEE", "Лучший сотрудник", "Особое достижение от руководства", AchievementType.MANUAL, null, 1, "BEST_EMPLOYEE", new BigDecimal("500.00"));
        upsertAchievement("HELPER", "Помощник", "Активно помогает коллегам", AchievementType.MANUAL, null, 1, "HELPER", new BigDecimal("300.00"));
        upsertAchievement("MENTOR", "Наставник", "Обучает и поддерживает новых сотрудников", AchievementType.MANUAL, null, 1, "MENTOR", new BigDecimal("500.00"));
        upsertAchievement("INNOVATOR", "Инноватор", "Предложил и внедрил полезную идею", AchievementType.MANUAL, null, 1, "INNOVATOR", new BigDecimal("500.00"));
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

    private void upsertAchievement(String code, String name, String description, AchievementType type, Integer requiredProgress, Integer level, String groupCode, BigDecimal rewardCoins) {
        if (achievementRepository.findByCode(code).isPresent()) return;
        Achievement a = new Achievement();
        a.setCode(code); a.setName(name); a.setDescription(description); a.setType(type);
        a.setRequiredProgress(requiredProgress); a.setLevel(level); a.setGroupCode(groupCode); a.setRewardCoins(rewardCoins);
        achievementRepository.save(a);
    }

    private Department createDepartment(String name, String description) {
        Department d = new Department();
        d.setName(name); d.setDescription(description);
        return departmentRepository.save(d);
    }

    private User createUser(String name, String email, String password, UserRole role, double balance, double rating, double lifetime, Department department) {
        User u = new User();
        u.setName(name); u.setEmail(email); u.setPassword(password); u.setRole(role);
        u.setBalance(BigDecimal.valueOf(balance));
        u.setRating(rating);
        u.setLifetimeRating(lifetime);
        u.setIsBlocked(false);
        u.setDepartment(department);
        u.setCurrentStreak(0);
        u.setLongestStreak(0);
        u.setLastStreakRewardAt(0);
        return userRepository.save(u);
    }

    private Category createCategory(String name, String description, int sortOrder) {
        Category c = new Category();
        c.setName(name); c.setDescription(description); c.setSortOrder(sortOrder);
        return categoryRepository.save(c);
    }

    private Product createProduct(String name, String description, double price, int stock, Category category, ProductType type, boolean hasVariants, boolean hasImages, String sizesStr, String colorsStr) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(BigDecimal.valueOf(price));
        p.setStock(stock);
        p.setCategory(category);
        p.setType(type);
        p.setIsActive(true);
        p.setHasVariants(hasVariants);
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
                    v.setStock((int) (Math.random() * 10) + 2); // Случайный остаток от 2 до 11
                    variantRepository.save(v);
                }
            }
        }

        return saved;
    }

    private void createQuest(String title, String description, double reward, String audience, int daysDeadline, User creator) {
        Quest q = new Quest();
        q.setTitle(title);
        q.setDescription(description);
        q.setRewardCoins(BigDecimal.valueOf(reward));
        q.setRewardRating(1.0);
        q.setIsActive(true);
        q.setIsPublic(true);
        q.setIsMandatory(false);
        q.setAudienceDescription(audience);
        q.setDeadline(LocalDateTime.now().plusDays(daysDeadline));
        q.setCreator(creator);
        q.setIsRepeatable(false);
        questRepository.save(q);
    }

    private void createEvent(String name, String category, String description, String place, User organizer) {
        Event e = new Event();
        e.setNameEvent(name);
        e.setCategory(category);
        e.setDescription(description);
        e.setEventPlace(place);
        e.setFromTime(LocalDateTime.now().plusDays(3));
        e.setToTime(LocalDateTime.now().plusDays(3).plusHours(2));
        e.setOrganizer(organizer);
        e.setEventStatus(EventStatus.NEW);
        e.setPaidInCoins(false);
        e.setRewardsGranted(false);
        eventRepository.save(e);
    }

    private void createNews(String title, String content, boolean isPinned, User author) {
        News n = new News();
        n.setTitle(title);
        n.setContent(content);
        n.setIsPinned(isPinned);
        n.setAuthor(author);
        n.setIsArchived(false);
        n.setViews(0);
        n.setExpiresAt(LocalDateTime.now().plusDays(30));
        newsRepository.save(n);
    }
}