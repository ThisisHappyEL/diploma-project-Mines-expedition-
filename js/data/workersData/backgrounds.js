export const BACKGROUNDS = {
    // --- ТИР 0 ---
    "Калека": {
        tier: 0, salary: 2, category: "Маргинал, Изолированный", profile: "Нет",
        description: "Кто его сюда пустил? Впрочем много он не попросит...",
        stats: { hp: [25, 35], stamina: [70, 90], battle: [4, 6], mining: [4, 6], research: [5, 7], construction: [4, 6], scouting: [6, 7] }
    },
    "Попрошайка": {
        tier: 0, salary: 3, category: "Маргинал, Низкорожденный, Общественный", profile: "Разведка",
        description: "Немощ или юродивый, живший за счёт пожертвований.",
        stats: { hp: [26, 32], stamina: [75, 85], battle: [3, 5], mining: [2, 4], research: [5, 7], construction: [3, 5], scouting: [6, 7] }
    },

    // --- ТИР 1 ---
    "Жуковод": {
        tier: 1, salary: 5, category: "Низкорожденный, Пищевой, Грязная работа", profile: "Добыча",
        description: "Разведение червей и жуков для биогумуса.",
        stats: { hp: [32, 38], stamina: [85, 95], battle: [3, 5], mining: [8, 9], research: [5, 7], construction: [6, 8], scouting: [5, 7] }
    },
    "Кашевар": {
        tier: 1, salary: 5, category: "Пищевой, Низкорожденный, Общественный", profile: "Изыскания",
        description: "Приготовление пищи в тавернах.",
        stats: { hp: [34, 40], stamina: [85, 100], battle: [3, 5], mining: [4, 6], research: [8, 9], construction: [6, 8], scouting: [4, 6] }
    },
    "Подмастерье": {
        tier: 1, salary: 6, category: "Низкорожденный, Ремесленник", profile: "Строительство",
        description: "Юнец или бездарный старец при мастере.",
        stats: { hp: [35, 40], stamina: [90, 100], battle: [4, 6], mining: [5, 7], research: [6, 8], construction: [8, 9], scouting: [4, 6] }
    },
    "Школяр": {
        tier: 1, salary: 7, category: "Полезный умс. труд", profile: "Изыскания",
        description: "Предпочёл занозам от парт рубцы от сражений.",
        stats: { hp: [30, 38], stamina: [80, 95], battle: [2, 4], mining: [2, 4], research: [8, 9], construction: [4, 6], scouting: [7, 9] }
    },
    "Паломник": {
        tier: 1, salary: 6, category: "Маргинал, Полезный умс. труд, Изолированный", profile: "Разведка",
        description: "Ищет святыню на глубине.",
        stats: { hp: [34, 40], stamina: [90, 100], battle: [3, 5], mining: [4, 6], research: [8, 9], construction: [3, 5], scouting: [8, 9] }
    },
    "Крысиный заводчик": {
        tier: 1, salary: 6, category: "Пищевой, Низкорожденный, Грязная работа", profile: "Разведка, Добыча",
        description: "Ищет крысу-чемпиона там, где другие не рискнут.",
        stats: { hp: [32, 38], stamina: [85, 95], battle: [4, 6], mining: [8, 9], research: [4, 6], construction: [5, 7], scouting: [7, 9] }
    },
    "Шут": {
        tier: 1, salary: 5, category: "Маргинал, Низкорожденный, Общественный", profile: "Разведка",
        description: "В него летят не гнилые помидоры, а камни.",
        stats: { hp: [30, 38], stamina: [90, 100], battle: [3, 5], mining: [2, 4], research: [6, 8], construction: [4, 6], scouting: [8, 9] }
    },
    "Краснобай": {
        tier: 1, salary: 5, category: "Низкорожденный, Общественный", profile: "Изыскания",
        description: "Развлечение и сохранение легенд.",
        stats: { hp: [32, 38], stamina: [80, 95], battle: [2, 4], mining: [2, 4], research: [8, 9], construction: [3, 5], scouting: [7, 9] }
    },
    "Брадобрей": {
        tier: 1, salary: 6, category: "Низкорожденный, Общественный", profile: "Изыскания",
        description: "Стрижка и мелкая хирургия.",
        stats: { hp: [32, 36], stamina: [80, 90], battle: [3, 5], mining: [2, 4], research: [8, 9], construction: [6, 8], scouting: [5, 7] }
    },
    "Мусорщик": {
        tier: 1, salary: 5, category: "Низкорожденный, Грязная работа", profile: "Добыча",
        description: "Сбор и сортировка отходов.",
        stats: { hp: [32, 38], stamina: [85, 95], battle: [4, 6], mining: [8, 9], research: [4, 6], construction: [5, 7], scouting: [6, 8] }
    },

    // --- ТИР 2 ---
    "Крысолов": {
        tier: 2, salary: 11, category: "Незаконный, Вредный физ. труд, Грязная работа", profile: "Бой, Разведка",
        description: "Отлавливает вредителей (и мясо).",
        stats: { hp: [38, 42], stamina: [100, 110], battle: [10, 11], mining: [6, 8], research: [3, 5], construction: [4, 6], scouting: [10, 11] }
    },
    "Вышибала": {
        tier: 2, salary: 12, category: "Низкорожденный, Вредный боев. труд, Общественный", profile: "Бой",
        description: "Совмещает попойки с мордобоем.",
        stats: { hp: [42, 45], stamina: [95, 105], battle: [10, 11], mining: [4, 6], research: [3, 5], construction: [4, 6], scouting: [7, 9] }
    },
    "Беглый каторжник": {
        tier: 2, salary: 11, category: "Незаконный, Вредный физ. труд", profile: "Добыча, Бой",
        description: "Из шахт одних пришёл в другие.",
        stats: { hp: [36, 42], stamina: [105, 110], battle: [8, 10], mining: [10, 11], research: [2, 4], construction: [4, 6], scouting: [6, 8] }
    },
    "Кулачный боец": {
        tier: 2, salary: 12, category: "Маргинал, Вредный боев. труд, Общественный", profile: "Бой",
        description: "Поднаторел на кулачных аренах.",
        stats: { hp: [38, 42], stamina: [100, 110], battle: [10, 11], mining: [4, 6], research: [3, 5], construction: [4, 6], scouting: [8, 10] }
    },
    "Ополченец": {
        tier: 2, salary: 10, category: "Низкорожденный, Полезный боев. труд", profile: "Бой",
        description: "Терпение лопнуло, решил защищать.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [10, 11], mining: [6, 8], research: [4, 6], construction: [6, 8], scouting: [7, 9] }
    },
    "Менестрель": {
        tier: 2, salary: 13, category: "Элита, Полезный умс. труд, Общественный", profile: "Изыскания, Разведка",
        description: "Вместо лютни - кирка.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [3, 5], mining: [3, 5], research: [10, 11], construction: [4, 6], scouting: [10, 11] }
    },
    "Оруженосец": {
        tier: 2, salary: 13, category: "Полезный боев. труд, Элита", profile: "Бой, Строительство",
        description: "Юнец, лишившийся рыцаря.",
        stats: { hp: [40, 45], stamina: [100, 110], battle: [10, 11], mining: [5, 7], research: [5, 7], construction: [9, 11], scouting: [6, 8] }
    },
    "Вор": {
        tier: 2, salary: 11, category: "Маргинал, Незаконный", profile: "Разведка",
        description: "Убийца или проигравшийся дурак.",
        stats: { hp: [36, 42], stamina: [100, 110], battle: [7, 9], mining: [4, 6], research: [6, 8], construction: [5, 7], scouting: [10, 11] }
    },
    "Угледобытчик": {
        tier: 2, salary: 10, category: "Вредный физ. труд, Опасная среда", profile: "Добыча",
        description: "Тяжелая добыча топлива в пыли.",
        stats: { hp: [35, 40], stamina: [105, 110], battle: [6, 8], mining: [10, 11], research: [3, 5], construction: [6, 8], scouting: [5, 7] }
    },
    "Глинокоп": {
        tier: 2, salary: 9, category: "Вредный физ. труд, Опасная среда", profile: "Добыча",
        description: "Тяжелая добыча глины.",
        stats: { hp: [35, 42], stamina: [100, 110], battle: [5, 7], mining: [10, 11], research: [4, 6], construction: [8, 10], scouting: [4, 6] }
    },
    "Грибовод": {
        tier: 2, salary: 10, category: "Пищевой промысел", profile: "Добыча",
        description: "Выращивание пищевых грибов.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [4, 6], mining: [10, 11], research: [7, 9], construction: [6, 8], scouting: [5, 7] }
    },
    "Корнеплодник": {
        tier: 2, salary: 10, category: "Пищевой промысел", profile: "Добыча",
        description: "Выращивание овощей под лампами.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [4, 6], mining: [10, 11], research: [6, 8], construction: [6, 8], scouting: [5, 7] }
    },
    "Птицевод": {
        tier: 2, salary: 9, category: "Пищевой промысел, Грязная работа", profile: "Добыча",
        description: "Разведение кур и уток.",
        stats: { hp: [40, 45], stamina: [95, 105], battle: [4, 6], mining: [10, 11], research: [6, 8], construction: [6, 8], scouting: [5, 7] }
    },
    "Рыбовод": {
        tier: 2, salary: 9, category: "Пищевой промысел", profile: "Добыча",
        description: "Разведение пещерной рыбы.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [4, 6], mining: [10, 11], research: [7, 9], construction: [5, 7], scouting: [6, 8] }
    },
    "Мельник": {
        tier: 2, salary: 8, category: "Низкорожденный", profile: "Строительство",
        description: "Перемалывание грибной муки.",
        stats: { hp: [38, 44], stamina: [95, 110], battle: [4, 6], mining: [5, 7], research: [5, 7], construction: [10, 11], scouting: [6, 8] }
    },
    "Пекарь": {
        tier: 2, salary: 10, category: "Пищевой промысел", profile: "Строительство, Изыскания",
        description: "Выпечка хлеба.",
        stats: { hp: [38, 44], stamina: [90, 100], battle: [3, 5], mining: [4, 6], research: [8, 10], construction: [10, 11], scouting: [5, 7] }
    },
    "Сыровар": {
        tier: 2, salary: 10, category: "Пищевой промысел", profile: "Строительство, Изыскания",
        description: "Производство сыра.",
        stats: { hp: [40, 45], stamina: [90, 100], battle: [3, 5], mining: [4, 6], research: [8, 10], construction: [10, 11], scouting: [6, 8] }
    },
    "Коптильщик": {
        tier: 2, salary: 9, category: "Пищевой промысел, Грязная работа", profile: "Строительство, Изыскания",
        description: "Консервация продуктов.",
        stats: { hp: [36, 42], stamina: [90, 105], battle: [3, 5], mining: [5, 7], research: [8, 10], construction: [10, 11], scouting: [5, 7] }
    },
    "Самогонщик": {
        tier: 2, salary: 12, category: "Незаконный, Общественный", profile: "Изыскания, Строительство",
        description: "Производство алкоголя.",
        stats: { hp: [36, 42], stamina: [90, 100], battle: [4, 6], mining: [4, 6], research: [10, 11], construction: [9, 11], scouting: [6, 8] }
    },
    "Гончар": {
        tier: 2, salary: 10, category: "Ремесленник", profile: "Строительство",
        description: "Изготовление керамики.",
        stats: { hp: [38, 44], stamina: [90, 105], battle: [4, 6], mining: [5, 7], research: [6, 8], construction: [10, 11], scouting: [5, 7] }
    },
    "Ткач": {
        tier: 2, salary: 9, category: "Ремесленник", profile: "Строительство",
        description: "Изготовление тканей.",
        stats: { hp: [36, 42], stamina: [90, 100], battle: [3, 5], mining: [3, 5], research: [7, 9], construction: [10, 11], scouting: [6, 8] }
    },
    "Сапожник": {
        tier: 2, salary: 10, category: "Ремесленник", profile: "Строительство",
        description: "Изготовление обуви.",
        stats: { hp: [36, 42], stamina: [90, 100], battle: [4, 6], mining: [3, 5], research: [6, 8], construction: [10, 11], scouting: [6, 8] }
    },
    "Маслобой": {
        tier: 2, salary: 9, category: "Низкорожденный", profile: "Строительство, Добыча",
        description: "Производство масла.",
        stats: { hp: [38, 44], stamina: [95, 105], battle: [5, 7], mining: [8, 10], research: [5, 7], construction: [10, 11], scouting: [5, 7] }
    },
    "Лекарь": {
        tier: 2, salary: 13, category: "Полезный умс. труд, Общественный", profile: "Изыскания",
        description: "Уход за больными.",
        stats: { hp: [36, 42], stamina: [90, 100], battle: [2, 4], mining: [3, 5], research: [10, 11], construction: [6, 8], scouting: [7, 9] }
    },
    "Купец": {
        tier: 2, salary: 13, category: "Элита, Общественный", profile: "Разведка",
        description: "Торговля между униями.",
        stats: { hp: [38, 44], stamina: [90, 100], battle: [4, 6], mining: [3, 5], research: [8, 10], construction: [4, 6], scouting: [10, 11] }
    },
    "Ростовщик": {
        tier: 2, salary: 13, category: "Незаконный, Общественный", profile: "Разведка, Изыскания",
        description: "Обмен валюты и ссуды.",
        stats: { hp: [36, 42], stamina: [90, 100], battle: [3, 5], mining: [2, 4], research: [10, 11], construction: [4, 6], scouting: [9, 11] }
    },
    "Сборщик налогов": {
        tier: 2, salary: 12, category: "Незаконный, Общественный", profile: "Разведка, Бой",
        description: "Сбор дани.",
        stats: { hp: [38, 42], stamina: [95, 105], battle: [8, 10], mining: [4, 6], research: [7, 9], construction: [4, 6], scouting: [9, 11] }
    },
    "Священник": {
        tier: 2, salary: 13, category: "Полезный умс. труд, Общественный", profile: "Изыскания",
        description: "Ритуалы огня и камня.",
        stats: { hp: [38, 44], stamina: [90, 100], battle: [3, 5], mining: [3, 5], research: [10, 11], construction: [4, 6], scouting: [8, 10] }
    },
    "Корчмарь": {
        tier: 2, salary: 12, category: "Пищевой промысел, Общественный", profile: "Разведка, Строительство",
        description: "Содержание заведения.",
        stats: { hp: [38, 44], stamina: [90, 100], battle: [6, 8], mining: [4, 6], research: [6, 8], construction: [8, 10], scouting: [9, 11] }
    },
    "Гробовщик": {
        tier: 2, salary: 10, category: "Вредный физ. труд, Грязная работа", profile: "Строительство, Добыча",
        description: "Захоронение умерших.",
        stats: { hp: [35, 42], stamina: [95, 105], battle: [5, 7], mining: [8, 10], research: [5, 7], construction: [8, 10], scouting: [5, 7] }
    },
    "Золотарь": {
        tier: 2, salary: 8, category: "Вредный физ. труд, Грязная работа", profile: "Добыча",
        description: "Очистка нечистот.",
        stats: { hp: [35, 42], stamina: [100, 110], battle: [4, 6], mining: [10, 11], research: [4, 6], construction: [4, 6], scouting: [5, 7] }
    },
    "Чистильщик вентиляции": {
        tier: 2, salary: 11, category: "Вредный физ. труд, Опасная среда", profile: "Разведка, Строительство",
        description: "Опасная очистка шахт.",
        stats: { hp: [35, 42], stamina: [100, 110], battle: [5, 7], mining: [5, 7], research: [4, 6], construction: [8, 10], scouting: [10, 11] }
    },
    "Подёнщик": {
        tier: 2, salary: 8, category: "Низкорожденный", profile: "Строительство, Добыча",
        description: "Любая неквалифицированная работа.",
        stats: { hp: [38, 44], stamina: [95, 110], battle: [6, 8], mining: [8, 10], research: [3, 5], construction: [8, 10], scouting: [5, 7] }
    },

    // --- ТИР 3 ---
    "Наёмник": {
        tier: 3, salary: 18, category: "Незаконный, Вредный боев. труд", profile: "Бой",
        description: "За монету готов сделать почти что угодно.",
        stats: { hp: [40, 50], stamina: [105, 120], battle: [12, 13], mining: [5, 7], research: [4, 6], construction: [6, 8], scouting: [9, 11] }
    },
    "Лесоруб": {
        tier: 3, salary: 17, category: "Низкорожденный, Полезный физ. труд", profile: "Добыча",
        description: "Успел развить завидную мускулатуру.",
        stats: { hp: [42, 50], stamina: [110, 120], battle: [10, 12], mining: [12, 13], research: [3, 5], construction: [8, 10], scouting: [5, 7] }
    },
    "Гонец": {
        tier: 3, salary: 16, category: "Полезный физ. труд, Изолированный", profile: "Разведка",
        description: "Не ясно для кого он несёт послание.",
        stats: { hp: [42, 48], stamina: [115, 120], battle: [6, 8], mining: [4, 6], research: [7, 9], construction: [4, 6], scouting: [12, 13] }
    },
    "Пыточник": {
        tier: 3, salary: 18, category: "Вредный умс. труд, Грязная работа", profile: "Бой, Изыскания",
        description: "Людей калечить он горазд.",
        stats: { hp: [40, 48], stamina: [100, 110], battle: [11, 13], mining: [4, 6], research: [10, 12], construction: [6, 8], scouting: [8, 10] }
    },
    "Световод": {
        tier: 3, salary: 19, category: "Полезный умс. труд, Опасная среда", profile: "Изыскания",
        description: "Культивация биолюминесцентных мхов.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [3, 5], mining: [5, 7], research: [12, 13], construction: [8, 10], scouting: [9, 11] }
    },
    "Проходчик": {
        tier: 3, salary: 18, category: "Полезный физ. труд, Опасная среда", profile: "Строительство, Добыча",
        description: "Прокладка новых туннелей.",
        stats: { hp: [42, 50], stamina: [110, 120], battle: [7, 9], mining: [11, 13], research: [4, 6], construction: [11, 13], scouting: [6, 8] }
    },
    "Мясник": {
        tier: 3, salary: 17, category: "Пищевой промысел, Грязная работа", profile: "Бой, Добыча",
        description: "Разделка туш животных.",
        stats: { hp: [40, 48], stamina: [100, 115], battle: [12, 13], mining: [10, 12], research: [5, 7], construction: [6, 8], scouting: [7, 9] }
    },
    "Алхимик": {
        tier: 3, salary: 22, category: "Вредный умс. труд, Опасная среда", profile: "Изыскания",
        description: "Создание лекарств и ядов.",
        stats: { hp: [40, 46], stamina: [100, 110], battle: [3, 5], mining: [4, 6], research: [12, 13], construction: [8, 10], scouting: [8, 10] }
    },
    "Картограф": {
        tier: 3, salary: 20, category: "Полезный умс. труд, Изолированный", profile: "Разведка",
        description: "Составление карт туннелей.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [4, 6], mining: [3, 5], research: [11, 13], construction: [5, 7], scouting: [12, 13] }
    },
    "Тюремщик": {
        tier: 3, salary: 18, category: "Вредный боев. труд, Общественный", profile: "Бой, Разведка",
        description: "Охрана заключенных.",
        stats: { hp: [42, 48], stamina: [100, 115], battle: [12, 13], mining: [5, 7], research: [5, 7], construction: [6, 8], scouting: [10, 12] }
    },
    "Плавильщик": {
        tier: 3, salary: 18, category: "Вредный физ. труд, Опасная среда", profile: "Строительство, Добыча",
        description: "Выплавка металла.",
        stats: { hp: [38, 46], stamina: [110, 120], battle: [6, 8], mining: [10, 12], research: [5, 7], construction: [12, 13], scouting: [5, 7] }
    },
    "Кожевенник": {
        tier: 3, salary: 17, category: "Ремесленник, Грязная работа", profile: "Строительство",
        description: "Выделка кож.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [5, 7], mining: [6, 8], research: [6, 8], construction: [12, 13], scouting: [6, 8] }
    },
    "Солевар": {
        tier: 3, salary: 18, category: "Полезный физ. труд, Опасная среда", profile: "Добыча",
        description: "Добыча каменной соли.",
        stats: { hp: [42, 50], stamina: [110, 120], battle: [5, 7], mining: [12, 13], research: [5, 7], construction: [8, 10], scouting: [5, 7] }
    },
    "Крепильщик": {
        tier: 3, salary: 18, category: "Полезный физ. труд, Опасная среда", profile: "Строительство",
        description: "Установка подпорок в шахтах.",
        stats: { hp: [42, 50], stamina: [105, 115], battle: [6, 8], mining: [8, 10], research: [4, 6], construction: [12, 13], scouting: [6, 8] }
    },
    "Гидролог": {
        tier: 3, salary: 20, category: "Полезный умс. труд, Изолированный", profile: "Изыскания, Разведка",
        description: "Поиск подземных рек.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [4, 6], mining: [5, 7], research: [12, 13], construction: [5, 7], scouting: [11, 13] }
    },
    "Животновод": {
        tier: 3, salary: 17, category: "Пищевой промысел, Грязная работа", profile: "Добыча",
        description: "Разведение подземного скота.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [6, 8], mining: [12, 13], research: [6, 8], construction: [8, 10], scouting: [6, 8] }
    },
    "Резчик по кости": {
        tier: 3, salary: 17, category: "Ремесленник", profile: "Строительство, Изыскания",
        description: "Изготовление мелких вещей.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [4, 6], mining: [5, 7], research: [10, 12], construction: [12, 13], scouting: [6, 8] }
    },
    "Писарь": {
        tier: 3, salary: 19, category: "Полезный умс. труд", profile: "Изыскания",
        description: "Копирование книг.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [2, 4], mining: [3, 5], research: [12, 13], construction: [8, 10], scouting: [10, 12] }
    },
    "Учитель": {
        tier: 3, salary: 21, category: "Полезный умс. труд, Общественный", profile: "Изыскания",
        description: "Обучение грамоте.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [3, 5], mining: [3, 5], research: [12, 13], construction: [8, 10], scouting: [10, 12] }
    },
    "Бюрократ": {
        tier: 3, salary: 18, category: "Полезный умс. труд, Общественный", profile: "Изыскания, Разведка",
        description: "Учет и налоги.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [2, 4], mining: [3, 5], research: [12, 13], construction: [6, 8], scouting: [10, 12] }
    },
    "Судья": {
        tier: 3, salary: 22, category: "Элита, Общественный", profile: "Изыскания, Разведка",
        description: "Разрешение споров.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [3, 5], mining: [2, 4], research: [12, 13], construction: [5, 7], scouting: [11, 13] }
    },
    "Воздухопроводильщик": {
        tier: 3, salary: 18, category: "Полезный физ. труд, Опасная среда", profile: "Строительство, Разведка",
        description: "Регуляция вентиляции.",
        stats: { hp: [42, 50], stamina: [105, 120], battle: [5, 7], mining: [6, 8], research: [6, 8], construction: [12, 13], scouting: [10, 12] }
    },
    "Караванщик": {
        tier: 3, salary: 20, category: "Полезный физ. труд, Изолированный", profile: "Разведка",
        description: "Водитель вьючных животных.",
        stats: { hp: [42, 50], stamina: [110, 120], battle: [7, 9], mining: [5, 7], research: [5, 7], construction: [5, 7], scouting: [12, 13] }
    },
    "Каменотёс": {
        tier: 3, salary: 19, category: "Полезный физ. труд", profile: "Строительство",
        description: "Возведение зданий из камня.",
        stats: { hp: [42, 50], stamina: [105, 120], battle: [6, 8], mining: [9, 11], research: [4, 6], construction: [12, 13], scouting: [5, 7] }
    },
    "Портной": {
        tier: 3, salary: 16, category: "Ремесленник", profile: "Строительство",
        description: "Пошив одежды.",
        stats: { hp: [40, 50], stamina: [100, 115], battle: [3, 5], mining: [3, 5], research: [8, 10], construction: [12, 13], scouting: [6, 8] }
    },
    "Свечник": {
        tier: 3, salary: 17, category: "Ремесленник", profile: "Строительство, Изыскания",
        description: "Изготовление свечей.",
        stats: { hp: [40, 50], stamina: [100, 110], battle: [3, 5], mining: [4, 6], research: [10, 12], construction: [12, 13], scouting: [5, 7] }
    },

    // --- ТИР 4 ---
    "Завальный спасатель": {
        tier: 4, salary: 28, category: "Полезный физ., Полезный боев., Опасная среда", profile: "Строительство, Добыча",
        description: "Первый кто придёт на помощь от завалов.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [9, 11], mining: [14, 16], research: [6, 8], construction: [14, 16], scouting: [9, 11] }
    },
    "Старый вояка": {
        tier: 4, salary: 32, category: "Вредный боев. труд", profile: "Бой",
        description: "Ветеран войн прошлого.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [15, 16], mining: [6, 8], research: [8, 10], construction: [8, 10], scouting: [10, 12] }
    },
    "Защитник Унии": {
        tier: 4, salary: 30, category: "Полезный боев. труд", profile: "Бой, Разведка",
        description: "Подземный пограничник.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [15, 16], mining: [7, 9], research: [7, 9], construction: [8, 10], scouting: [13, 15] }
    },
    "Бретёр": {
        tier: 4, salary: 35, category: "Элита, Вредный боев. труд, Общественный", profile: "Бой, Разведка",
        description: "Готов пролить кровь любого.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [15, 16], mining: [3, 5], research: [8, 10], construction: [4, 6], scouting: [14, 16] }
    },
    "Страж пламени": {
        tier: 4, salary: 32, category: "Элита, Полезный боев. труд, Общественный", profile: "Бой, Изыскания",
        description: "Элитный воин церкви.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [15, 16], mining: [5, 7], research: [12, 14], construction: [7, 9], scouting: [10, 12] }
    },
    "Дознаватель": {
        tier: 4, salary: 32, category: "Элита, Полезный умс. труд", profile: "Разведка, Изыскания",
        description: "Ищет кто убийца.",
        stats: { hp: [45, 55], stamina: [115, 130], battle: [10, 12], mining: [3, 5], research: [14, 16], construction: [5, 7], scouting: [15, 16] }
    },
    "Рудокоп": {
        tier: 4, salary: 28, category: "Полезный физ. труд, Опасная среда", profile: "Добыча",
        description: "Добыча руды. Почетный труд.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [10, 12], mining: [15, 16], research: [4, 6], construction: [9, 11], scouting: [7, 9] }
    },
    "Жилоискатель": {
        tier: 4, salary: 30, category: "Полезный физ. труд, Изолированный", profile: "Разведка, Добыча",
        description: "Поиск новых залежей минералов.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [7, 9], mining: [13, 15], research: [8, 10], construction: [6, 8], scouting: [14, 16] }
    },
    "Кузнец": {
        tier: 4, salary: 34, category: "Ремесленник", profile: "Строительство, Бой",
        description: "Ковка инструментов и оружия.",
        stats: { hp: [48, 55], stamina: [110, 130], battle: [12, 14], mining: [6, 8], research: [7, 9], construction: [15, 16], scouting: [6, 8] }
    },
    "Стражник": {
        tier: 4, salary: 30, category: "Полезный боев. труд", profile: "Бой, Разведка",
        description: "Защита поселения.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [15, 16], mining: [5, 7], research: [6, 8], construction: [7, 9], scouting: [12, 14] }
    },
    "Ювелир": {
        tier: 4, salary: 34, category: "Ремесленник", profile: "Строительство, Изыскания",
        description: "Работа с камнями.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [4, 6], mining: [5, 7], research: [13, 15], construction: [15, 16], scouting: [10, 12] }
    },
    "Скульптор": {
        tier: 4, salary: 30, category: "Ремесленник", profile: "Строительство, Изыскания",
        description: "Создание декора.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [6, 8], mining: [6, 8], research: [11, 13], construction: [15, 16], scouting: [7, 9] }
    },
    "Охотник": {
        tier: 4, salary: 32, category: "Полезный боев. опыт, Изолированный", profile: "Бой, Разведка",
        description: "Охота на пещерную фауну.",
        stats: { hp: [48, 55], stamina: [115, 130], battle: [14, 16], mining: [6, 8], research: [7, 9], construction: [7, 9], scouting: [14, 16] }
    },
    "Механик": {
        tier: 4, salary: 34, category: "Полезный умс. труд", profile: "Строительство, Изыскания",
        description: "Ремонт механизмов.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [8, 10], mining: [7, 9], research: [13, 15], construction: [15, 16], scouting: [8, 10] }
    },
    "Летописец": {
        tier: 4, salary: 28, category: "Полезный умс. труд", profile: "Изыскания",
        description: "Сохранение истории.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [3, 5], mining: [3, 5], research: [15, 16], construction: [5, 7], scouting: [11, 13] }
    },
    "Астроном": {
        tier: 4, salary: 30, category: "Элита, Полезный умс. труд, Изолированный", profile: "Изыскания, Разведка",
        description: "Наблюдение за звездами.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [3, 5], mining: [2, 4], research: [15, 16], construction: [5, 7], scouting: [14, 16] }
    },
    "Стеклодув": {
        tier: 4, salary: 26, category: "Вредный физ. труд, Опасная среда", profile: "Строительство",
        description: "Мастерство, губительное для легких.",
        stats: { hp: [45, 55], stamina: [110, 130], battle: [4, 6], mining: [4, 6], research: [12, 14], construction: [15, 16], scouting: [8, 10] }
    },

    // --- ТИР 5 ---
    "Королевский страж": {
        tier: 5, salary: 48, category: "Элита, Полезный боев. труд", profile: "Бой, Разведка",
        description: "Гвардеец короля, утративший статус.",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [19, 20], mining: [8, 10], research: [10, 12], construction: [8, 10], scouting: [14, 16] }
    },
    "Инквизитор": {
        tier: 5, salary: 50, category: "Элита, Вредный умс. труд", profile: "Изыскания, Бой",
        description: "Отлучен от прежней работы. Несет угрозу?",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [16, 18], mining: [6, 8], research: [19, 20], construction: [6, 8], scouting: [14, 16] }
    },
    "Архитектор": {
        tier: 5, salary: 45, category: "Полезный умс. труд", profile: "Строительство, Изыскания",
        description: "Проектирование поселений.",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [6, 8], mining: [6, 8], research: [18, 20], construction: [19, 20], scouting: [12, 14] }
    },
    "Надземник": {
        tier: 5, salary: 52, category: "Вредный боев. труд, Изолированный", profile: "Бой, Разведка",
        description: "Экспедиции на поверхность.",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [18, 20], mining: [8, 10], research: [8, 10], construction: [8, 10], scouting: [18, 20] }
    },
    "Оружейник": {
        tier: 5, salary: 48, category: "Ремесленник", profile: "Строительство, Бой",
        description: "Спец. по оружию.",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [14, 16], mining: [8, 10], research: [10, 12], construction: [19, 20], scouting: [8, 10] }
    },
    "Бронник": {
        tier: 5, salary: 48, category: "Ремесленник", profile: "Строительство, Бой",
        description: "Спец. по доспехам.",
        stats: { hp: [50, 60], stamina: [120, 140], battle: [12, 14], mining: [8, 10], research: [10, 12], construction: [19, 20], scouting: [10, 12] }
    }
};