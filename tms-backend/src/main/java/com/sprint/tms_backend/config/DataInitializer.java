package com.sprint.tms_backend.config;

import com.sprint.tms_backend.model.*;
import com.sprint.tms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AchievementRepository achievementRepository;
    private final SystemSettingRepository settingRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedSettings();

        if (userRepository.count() > 0) {
            log.info("База данных уже содержит пользователей. Пропускаем инициализацию.");
            seedAchievements();
            return;
        }

        Department backend = createDepartment("Backend Team", "Серверная разработка");
        Department frontend = createDepartment("Frontend Team", "Клиентская разработка");
        Department qa = createDepartment("QA Team", "Тестирование");
        Department hr = createDepartment("HR Team", "Управление персоналом");
        Department support = createDepartment("Support Team", "Техническая поддержка");

        createUser("Сергей Админов", "admin@tms.local", "123", UserRole.ADMIN, 10000, null);
        createUser("Ольга HR", "hr@tms.local", "123", UserRole.HR, 1500, hr);
        createUser("Иван Бэкендов", "mgr_back@tms.local", "123", UserRole.MANAGER, 2000, backend);
        createUser("Алексей Поддержкинов", "support@tms.local", "123", UserRole.SUPPORT, 1000, support);
        createUser("Петр Кодеров", "emp_back@tms.local", "123", UserRole.EMPLOYEE, 500, backend);
        createUser("Мария Верстальщикова", "emp_front@tms.local", "123", UserRole.EMPLOYEE, 300, frontend);
        createUser("Алексей Тестировщиков", "emp_qa@tms.local", "123", UserRole.EMPLOYEE, 150, qa);
        createUser("Елена Копирайтерова", "emp_hr@tms.local", "123", UserRole.EMPLOYEE, 400, hr);

        Category textiles = createCategory("Текстиль", "Одежда и текстиль", 1);
        Category gadgets = createCategory("Гаджеты", "Электроника и гаджеты", 2);
        Category accessories = createCategory("Аксессуары", "Полезные мелочи", 3);
        Category bottles = createCategory("Бутылки и кружки", "Посуда", 4);
        Category food = createCategory("Еда", "Вкусные вознаграждения", 5);
        Category leisure = createCategory("Отдых", "Впечатления и отдых", 6);

        createProduct("Футболка", "Классическая корпоративная футболка", 500, 50, textiles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=T-Shirt");
        createProduct("Худи", "Теплое худи с логотипом", 1500, 30, textiles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Hoodie");
        createProduct("Свитшот", "Уютный свитшот", 1200, 20, textiles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Sweatshirt");
        createProduct("Шопер", "Эко-сумка", 400, 100, textiles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Shopper");
        createProduct("Павербанк", "Емкость 10000 mAh", 2000, 15, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Power+Bank");
        createProduct("Беспроводная зарядка", "Зарядка 15W", 1500, 25, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Wireless+Charger");
        createProduct("USB-флешка 128гб", "Быстрая флешка", 800, 40, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=USB+128GB");
        createProduct("Мышка", "Беспроводная мышь", 1000, 50, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Mouse");
        createProduct("Клавиатура", "Механическая клавиатура", 3000, 10, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Keyboard");
        createProduct("Наушники", "Беспроводные наушники", 3500, 12, gadgets, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Headphones");
        createProduct("Значки", "Набор корпоративных значков", 100, 200, accessories, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Pins");
        createProduct("Ручка", "Стильная ручка", 150, 100, accessories, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Pen");
        createProduct("Блокнот", "Блокнот А5", 300, 80, accessories, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Notebook");
        createProduct("Термобутылки", "Стальная бутылка 500мл", 900, 30, bottles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Thermo+Bottle");
        createProduct("Термокружки", "Термокружка 350мл", 700, 40, bottles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Thermo+Mug");
        createProduct("Чашка", "Керамическая чашка", 350, 100, bottles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Cup");
        createProduct("Бутылка спортивная", "Пластиковая бутылка 750мл", 450, 60, bottles, ProductType.PHYSICAL, "https://placehold.co/600x400?text=Sport+Bottle");
        createProduct("Кофе", "Сертификат на кофе в кофейне", 300, 999, food, ProductType.DIGITAL, "https://placehold.co/600x400?text=Coffee");
        createProduct("Обед", "Бизнес-ланч в ресторане", 800, 999, food, ProductType.DIGITAL, "https://placehold.co/600x400?text=Lunch");
        createProduct("Отгул", "Дополнительный выходной день", 5000, 5, leisure, ProductType.PERK, "https://placehold.co/600x400?text=Day+Off");
        createProduct("Аквапарк", "Билет в аквапарк", 2500, 10, leisure, ProductType.PERK, "https://placehold.co/600x400?text=Aquapark");
        createProduct("Каток", "Билет на каток", 1500, 20, leisure, ProductType.PERK, "https://placehold.co/600x400?text=Ice+Rink");
        createProduct("Кинотеатр", "Билет в кино на 2 лица", 1200, 30, leisure, ProductType.PERK, "https://placehold.co/600x400?text=Cinema");

        seedAchievements();
        log.info("✅ Тестовые данные успешно добавлены.");
    }

    private void seedSettings() {

        createSettingIfNotExists("limit.peer.daily-per-recipient", "1000",
                "Лимит на коллегу", "Максимум монет, которое можно перевести одному коллеге за день", "Переводы");
        createSettingIfNotExists("limit.peer.daily-total", "1000",
                "Общий лимит переводов", "Максимум монет, которое можно перевести всем коллегам за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-per-subordinate", "2000",
                "Лимит бонусов на сотрудника", "Максимум монет, которое менеджер может начислить одному сотруднику за день", "Переводы");
        createSettingIfNotExists("limit.manager.daily-total", "5000",
                "Общий лимит бонусов менеджера", "Максимум монет, которое менеджер может начислить всем сотрудникам за день", "Переводы");

        createSettingIfNotExists("economy.monthly-earn-limit", "10000",
                "Месячный лимит заработка", "Максимум монет, которое сотрудник может заработать за месяц", "Экономика");
        createSettingIfNotExists("limit.quest.max-reward", "5000",
                "Макс. награда за квест", "Максимальное количество монет, которое можно назначить за один квест", "Экономика");
        createSettingIfNotExists("limit.event.max-reward", "2000",
                "Макс. награда за событие", "Максимальное количество монет, которое можно назначить за одно событие", "Экономика");

        createSettingIfNotExists("economy.treasury.auto-refill-amount", "50000",
                "Автопополнение казны (сумма)", "На сколько монет пополняется казна 1-го числа каждого месяца", "Экономика");
        createSettingIfNotExists("economy.treasury.threshold", "1000",
                "Автопополнение казны (порог)", "Если баланс казны опускается ниже этого числа, сработает автопополнение", "Экономика");
    }

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

    private void seedAchievements() {
        upsertAchievement("EVENT_JOINER_5", "Участник I", "Посетил 5 корпоративных событий", AchievementType.AUTOMATIC, 5, 1, "EVENT_JOINER", new BigDecimal("200"));
        upsertAchievement("EVENT_JOINER_10", "Участник II", "Посетил 10 корпоративных событий", AchievementType.AUTOMATIC, 10, 2, "EVENT_JOINER", new BigDecimal("500"));
        upsertAchievement("EVENT_JOINER_20", "Участник III", "Посетил 20 корпоративных событий", AchievementType.AUTOMATIC, 20, 3, "EVENT_JOINER", new BigDecimal("1000"));
        upsertAchievement("SEASON_CHAMPION", "Чемпион сезона", "Занял 1 место в личном зачёте сезона", AchievementType.AUTOMATIC, 1, 1, "SEASON_CHAMPION", new BigDecimal("0"));
        upsertAchievement("SEASON_TOP_3", "Топ-3 сезона", "Вошёл в топ-3 личного зачёта сезона", AchievementType.AUTOMATIC, 1, 1, "SEASON_TOP_3", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_1", "Лучший в отделе I", "Занял 1 место по рейтингу внутри отдела", AchievementType.AUTOMATIC, 1, 1, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_2", "Лучший в отделе II", "Занял 2 место по рейтингу внутри отдела", AchievementType.AUTOMATIC, 2, 2, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("DEPT_TOP_3", "Лучший в отделе III", "Занял 3 место по рейтингу внутри отдела", AchievementType.AUTOMATIC, 3, 3, "DEPT_TOP", new BigDecimal("0"));
        upsertAchievement("BEST_EMPLOYEE", "Сотрудник месяца", "Выдающийся вклад в работу компании", AchievementType.MANUAL, null, 1, "BEST_EMPLOYEE", new BigDecimal("1000"));
        upsertAchievement("HELPER", "Помощник", "Активно помогает коллегам", AchievementType.MANUAL, null, 1, "HELPER", new BigDecimal("300"));
        upsertAchievement("MENTOR", "Наставник", "Обучает и поддерживает новых сотрудников", AchievementType.MANUAL, null, 1, "MENTOR", new BigDecimal("500"));
        upsertAchievement("INNOVATOR", "Инноватор", "Предложил и внедрил полезную идею", AchievementType.MANUAL, null, 1, "INNOVATOR", new BigDecimal("500"));
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

    private User createUser(String name, String email, String password, UserRole role, double balance, Department department) {
        User u = new User();
        u.setName(name); u.setEmail(email); u.setPassword(password); u.setRole(role);
        u.setBalance(BigDecimal.valueOf(balance)); u.setRating(0.0); u.setLifetimeRating(0.0);
        u.setIsBlocked(false); u.setDepartment(department);
        return userRepository.save(u);
    }

    private Category createCategory(String name, String description, int sortOrder) {
        Category c = new Category();
        c.setName(name); c.setDescription(description); c.setSortOrder(sortOrder);
        return categoryRepository.save(c);
    }

    private Product createProduct(String name, String description, double price, int stock, Category category, ProductType type, String imageUrl) {
        Product p = new Product();
        p.setName(name); p.setDescription(description); p.setPrice(BigDecimal.valueOf(price));
        p.setStock(stock); p.setCategory(category); p.setType(type); p.setImageUrl(imageUrl); p.setIsActive(true);
        return productRepository.save(p);
    }
}