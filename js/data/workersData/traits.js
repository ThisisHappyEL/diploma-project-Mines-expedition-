export const TRAITS = [
    { 
        name: "Здоровяк", femaleName: "Здоровячка", excludes: "Мелкий", tier: 3, rarity: "Редкая",
        effect: { hp: 10, stamina: -10, battle: 2, mining: 2, research: -1, construction: -1, scouting: -1 },
        frequentIn: ["Полезный физ. труд", "Вредный физ. труд"], neverIn: ["Элита", "Полезный умс. труд"]
    },
    { 
        name: "Удачливый", femaleName: "Удачливая", excludes: "Невезучий", tier: 3, rarity: "Редкая", 
        effect: { hp: 5, stamina: 5, battle: 1, mining: 1, research: 1, construction: 1, scouting: 1 }
    },
    { 
        name: "Атлетичный", femaleName: "Атлетичная", excludes: "Немощный", tier: 2, rarity: "Необычная", 
        effect: { hp: 5, stamina: 15, battle: 1, mining: 1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный физ. труд", "Полезный боев. труд"], neverIn: ["Вредный умс. труд", "Маргинал"]
    },
    { 
        name: "Легкообучаемый", femaleName: "Легкообучаемая", excludes: "Необучаемый", tier: 2, rarity: "Редкая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 2, construction: 1, scouting: 0 },
        frequentIn: ["Полезный умс. труд", "Элита"], neverIn: ["Низкорожденный"]
    },
    { 
        name: "Высокий болевой порог", excludes: "Низкий болевой порог", tier: 2, rarity: "Редкая", 
        effect: { hp: 5, stamina: 10, battle: 1, mining: 1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный физ. труд", "Вредный боев. труд", "Грязная работа"], neverIn: ["Элита"]
    },
    { 
        name: "Ловкий", femaleName: "Ловкая", excludes: "Неловкий", tier: 2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 10, battle: 1, mining: 0, research: 0, construction: 1, scouting: 1 },
        frequentIn: ["Незаконный", "Ремесленник", "Опасная среда"], neverIn: ["Вредный физ. труд"]
    },
    { 
        name: "Точный", femaleName: "Точная", excludes: "Неточный", tier: 2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 1, mining: 1, research: 0, construction: 1, scouting: 0 },
        frequentIn: ["Ремесленник", "Полезный боев. труд", "Опасная среда"], neverIn: ["Маргинал"]
    },
    { 
        name: "Шустрый", femaleName: "Шустрая", excludes: "Вялый", tier: 2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 15, battle: 1, mining: 1, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Незаконный", "Полезный физ. труд"], neverIn: ["Элита"]
    },
    { 
        name: "Сильный", femaleName: "Сильная", excludes: "Слабый", tier: 2, rarity: "Частая", 
        effect: { hp: 0, stamina: 5, battle: 1, mining: 2, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный физ. труд", "Вредный физ. труд"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Крепкий", femaleName: "Крепкая", excludes: "Хрупкий", tier: 2, rarity: "Необычная", 
        effect: { hp: 10, stamina: 0, battle: 1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный боев. труд", "Полезный физ. труд"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Каменные лёгкие", excludes: "Слабые лёгкие", tier: 2, rarity: "Редкая", 
        effect: { hp: 0, stamina: 20, battle: 0, mining: 2, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный физ. труд", "Опасная среда"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Храбрый", femaleName: "Храбрая", excludes: "Трусливый", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 10, battle: 1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный боев. труд", "Вредный боев. труд"], neverIn: ["Маргинал"]
    },
    { 
        name: "Аккуратный", femaleName: "Аккуратная", excludes: "Неаккуратный", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 1, construction: 1, scouting: 0 },
        frequentIn: ["Ремесленник", "Полезный умс. труд"], neverIn: ["Маргинал", "Низкорожденный"]
    },
    { 
        name: "Зоркий", femaleName: "Зоркая", excludes: "Слабовидящий", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 1, mining: 0, research: 0, construction: 0, scouting: 2 },
        frequentIn: ["Полезный боев. труд", "Незаконный", "Изолированный"], neverIn: ["Вредный физ. труд"]
    },
    { 
        name: "Мелкий", femaleName: "Мелкая", excludes: "Здоровяк", tier: 1, rarity: "Редкая", 
        effect: { hp: -5, stamina: 10, battle: -1, mining: -1, research: 0, construction: 1, scouting: 2 },
        frequentIn: ["Незаконный", "Маргинал"], neverIn: ["Полезный боев. труд"]
    },
    { 
        name: "Прочные кости", excludes: "Ломкие кости", tier: 1, rarity: "Необычная", 
        effect: { hp: 5, stamina: 0, battle: 1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный физ. труд", "Пищевой промысел"], neverIn: ["Вредный умс. труд"]
    },
    { 
        name: "Молодой", femaleName: "Молодая", excludes: "Старый", tier: 2, rarity: "Частая", 
        effect: { hp: 10, stamina: 20, battle: 2, mining: 1, research: -2, construction: -2, scouting: 1 },
        frequentIn: ["Низкорожденный", "Полезный физ. труд"], neverIn: ["Элита", "Полезный умс. труд"]
    },
    { 
        name: "Оптимист", femaleName: "Оптимистка", excludes: "Пессимист", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 10, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный физ. труд", "Пищевой промысел", "Общественный"], neverIn: ["Вредный боев. труд", "Вредный умс. труд"]
    },
    { 
        name: "Аскет", femaleName: "Аскетка", excludes: "Требовательный", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 10, battle: 0, mining: 0, research: 1, construction: 0, scouting: 0 },
        frequentIn: ["Полезный умс. труд", "Изолированный"], neverIn: ["Элита", "Незаконный", "Общественный"]
    },
    { 
        name: "Крепко стоит на ногах", excludes: "Глиняные ножки", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 10, battle: 1, mining: 1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный физ. труд", "Полезный боев. труд"], neverIn: ["Маргинал"]
    },
    { 
        name: "Быстрый", femaleName: "Быстрая", excludes: "Медленный", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 15, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Незаконный", "Низкорожденный"], neverIn: ["Элита"]
    },
    { 
        name: "Чуткий сон", excludes: "Крепкий сон", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: -5, battle: 0, mining: 0, research: 0, construction: 0, scouting: 2 },
        frequentIn: ["Незаконный", "Полезный боев. труд", "Изолированный"], neverIn: ["Элита"]
    },
    { 
        name: "Золотые руки", excludes: "Руки не из того места", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 1, research: 0, construction: 1, scouting: 0 },
        frequentIn: ["Ремесленник"], neverIn: ["Маргинал"]
    },
    { 
        name: "Пытливый ум", excludes: "Безмятежный ум", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 1, construction: 0, scouting: 1 },
        frequentIn: ["Полезный умс. труд"], neverIn: ["Низкорожденный"]
    },
    { 
        name: "Кровожадный", femaleName: "Кровожадная", excludes: "Миролюбивый", tier: 0, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 2, mining: 0, research: -1, construction: -1, scouting: 0 },
        frequentIn: ["Вредный боев. труд", "Незаконный", "Грязная работа"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Самоуверенный", femaleName: "Самоуверенная", excludes: "Неуверенный в себе", tier: 0, rarity: "Частая", 
        effect: { hp: 0, stamina: 5, battle: 1, mining: 0, research: -1, construction: 0, scouting: -1 },
        frequentIn: ["Элита", "Незаконный", "Общественный"], neverIn: ["Маргинал"]
    },
    { 
        name: "Сова", excludes: "Жаворонок", tier: 0, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Незаконный", "Вредный умс. труд"], neverIn: ["Пищевой промысел"]
    },
    { 
        name: "Жаворонок", excludes: "Сова", tier: 0, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Пищевой промысел", "Полезный физ. труд"], neverIn: ["Незаконный"]
    },
    { 
        name: "Жестокий", femaleName: "Жестокая", excludes: "Милосердный", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 1, mining: 0, research: 0, construction: 0, scouting: -1 },
        frequentIn: ["Вредный боев. труд", "Незаконный", "Маргинал"], neverIn: ["Полезный умс. труд", "Пищевой промысел"]
    },
    { 
        name: "Косолапый", femaleName: "Косолапая", excludes: "Прямоногий", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: -10, battle: 0, mining: 0, research: 0, construction: 0, scouting: -1 },
        frequentIn: ["Низкорожденный", "Маргинал"], neverIn: ["Элита", "Полезный боев. труд"]
    },
    { 
        name: "Подлый", femaleName: "Подлая", excludes: "Верный", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 2 },
        frequentIn: ["Незаконный", "Маргинал"], neverIn: ["Полезный боев. труд"]
    },
    { 
        name: "Толстый", femaleName: "Толстая", excludes: "Тощий", tier: -1, rarity: "Частая", 
        effect: { hp: 5, stamina: -20, battle: 0, mining: -1, research: 0, construction: 0, scouting: -1 },
        frequentIn: ["Пищевой промысел", "Элита", "Общественный"], neverIn: ["Вредный физ. труд", "Полезный боев. труд"]
    },
    { 
        name: "Тощий", femaleName: "Тощая", excludes: "Толстый", tier: -1, rarity: "Частая", 
        effect: { hp: -5, stamina: 10, battle: 0, mining: -1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Элита"]
    },
    { 
        name: "Требовательный", femaleName: "Требовательная", excludes: "Аскет", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Элита", "Общественный"], neverIn: ["Маргинал", "Изолированный"]
    },
    { 
        name: "Нерешительный", femaleName: "Нерешительная", excludes: "Решительный", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: -5, battle: -1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Низкорожденный", "Полезный умс. труд"], neverIn: ["Вредный боев. труд", "Элита"]
    },
    { 
        name: "Нетерпеливый", femaleName: "Нетерпеливая", excludes: "Терпеливый", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 5, battle: 1, mining: 0, research: -1, construction: -1, scouting: 0 },
        frequentIn: ["Незаконный", "Вредный боев. труд"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Иррациональный", femaleName: "Иррациональная", excludes: "Рациональный", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: -2, construction: 0, scouting: 0 },
        frequentIn: ["Маргинал", "Незаконный", "Изолированный"], neverIn: ["Полезный умс. труд"]
    },
    { 
        name: "Пессимист", femaleName: "Пессимистка", excludes: "Оптимист", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: -10, battle: 0, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Вредный умс. труд", "Вредный физ. труд"], neverIn: ["Элита", "Общественный"]
    },
    { 
        name: "Суеверный", femaleName: "Суеверная", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: -1, construction: 0, scouting: 1 },
        frequentIn: ["Маргинал", "Низкорожденный", "Изолированный"], neverIn: ["Элита", "Полезный умс. труд"]
    },
    { 
        name: "Болезный", femaleName: "Болезная", excludes: "Здоровый", tier: -2, rarity: "Частая", 
        effect: { hp: -8, stamina: -15, battle: -1, mining: -1, research: 0, construction: 0, scouting: 0 },
        special: "Выше шанс подхватить болезнь",
        frequentIn: ["Вредный физ. труд", "Вредный умс. труд", "Маргинал", "Грязная работа"], neverIn: ["Полезный боев. труд", "Элита"]
    },
    { 
        name: "Неуклюжий", femaleName: "Неуклюжая", excludes: "Расторопный", tier: -2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: -1, mining: 0, research: 0, construction: -2, scouting: -1 },
        frequentIn: ["Маргинал"], neverIn: ["Элита", "Ремесленник", "Опасная среда"]
    },
    { 
        name: "Низкий болевой порог", excludes: "Высокий болевой порог", tier: -2, rarity: "Необычная", 
        effect: { hp: -5, stamina: -10, battle: -1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Элита", "Полезный умс. труд"], neverIn: ["Вредный боев. труд", "Вредный физ. труд"]
    },
    { 
        name: "Необучаемый", femaleName: "Необучаемая", excludes: "Легкообучаемый", tier: -2, rarity: "Редкая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: -3, construction: -1, scouting: 0 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Элита", "Полезный умс. труд"]
    },
    { 
        name: "Пугливый", femaleName: "Пугливая", excludes: "Смелый", tier: -2, rarity: "Частая", 
        effect: { hp: 0, stamina: -10, battle: -2, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Полезный боев. труд", "Вредный боев. труд"]
    },
    { 
        name: "Хрупкий", femaleName: "Хрупкая", excludes: "Крепкий", tier: -2, rarity: "Необычная", 
        effect: { hp: -10, stamina: -5, battle: -1, mining: -1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Полезный умс. труд", "Элита"], neverIn: ["Вредный физ. труд", "Полезный физ. труд"]
    },
    { 
        name: "Старый", femaleName: "Старая", excludes: "Молодой", tier: -2, rarity: "Частая", 
        effect: { hp: -10, stamina: -20, battle: -1, mining: -1, research: 2, construction: 2, scouting: 0 },
        frequentIn: ["Элита", "Полезный умс. труд"], neverIn: ["Вредный физ. труд", "Опасная среда"]
    },
    { 
        name: "Слабый", femaleName: "Слабая", excludes: "Сильный", tier: -2, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: -2, mining: -2, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный умс. труд", "Маргинал"], neverIn: ["Полезный боев. труд", "Полезный физ. труд"]
    },
    { 
        name: "Глиняные ножки", excludes: "Крепко стоит на ногах", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: -10, battle: -1, mining: -1, research: 0, construction: 0, scouting: 0 },
        special: "Шанс быть оглушенным/сбитым с ног выше",
        frequentIn: ["Маргинал", "Полезный умс. труд"], neverIn: ["Полезный боев. труд", "Полезный физ. труд"]
    },
    { 
        name: "Ломкие кости", excludes: "Прочные кости", tier: -1, rarity: "Необычная", 
        effect: { hp: -5, stamina: 0, battle: -1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный умс. труд", "Элита"], neverIn: ["Полезный физ. труд", "Вредный физ. труд"]
    },
    { 
        name: "Трусливый", femaleName: "Трусливая", excludes: "Храбрый", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: -10, battle: -1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Полезный боев. труд", "Вредный боев. труд"]
    },
    { 
        name: "Слабые лёгкие", excludes: "Каменные лёгкие", tier: -2, rarity: "Редкая", 
        effect: { hp: 0, stamina: -20, battle: 0, mining: -2, research: 0, construction: 0, scouting: 0 },
        special: "Хуже переносит пыль, споры и газы",
        frequentIn: ["Полезный умс. труд", "Элита"], neverIn: ["Вредный физ. труд", "Опасная среда"]
    },
    { 
        name: "Руки не из того места", excludes: "Золотые руки", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: -1, research: 0, construction: -1, scouting: 0 },
        special: "Выше шанс испортить инструмент или материал",
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Ремесленник"]
    },
    { 
        name: "Безмятежный ум", excludes: "Пытливый ум", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: -1, construction: 0, scouting: -1 },
        frequentIn: ["Низкорожденный", "Маргинал"], neverIn: ["Полезный умс. труд", "Элита"]
    },
    { 
        name: "Невезучий", femaleName: "Невезучая", excludes: "Удачливый", tier: -3, rarity: "Редкая", 
        effect: { hp: -5, stamina: -5, battle: -1, mining: -1, research: -1, construction: -1, scouting: -1 },
        special: "Постоянно притягивает мелкие неприятности"
    },
    { 
        name: "Немощный", femaleName: "Немощная", excludes: "Атлетичный", tier: -2, rarity: "Необычная", 
        effect: { hp: -5, stamina: -15, battle: -1, mining: -1, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный умс. труд", "Маргинал"], neverIn: ["Полезный физ. труд", "Полезный боев. труд"]
    },
    { 
        name: "Неловкий", femaleName: "Неловкая", excludes: "Ловкий", tier: -2, rarity: "Необычная", 
        effect: { hp: 0, stamina: -10, battle: -1, mining: 0, research: 0, construction: -1, scouting: -1 },
        frequentIn: ["Вредный физ. труд", "Маргинал"], neverIn: ["Незаконный", "Ремесленник", "Опасная среда"]
    },
    { 
        name: "Неточный", femaleName: "Неточная", excludes: "Точный", tier: -2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: -1, mining: -1, research: 0, construction: -1, scouting: 0 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Ремесленник", "Полезный боев. труд"]
    },
    { 
        name: "Вялый", femaleName: "Вялая", excludes: "Шустрый", tier: -2, rarity: "Необычная", 
        effect: { hp: 0, stamina: -15, battle: -1, mining: -1, research: 0, construction: 0, scouting: -1 },
        frequentIn: ["Элита", "Вредный умс. труд"], neverIn: ["Незаконный", "Полезный физ. труд"]
    },
    { 
        name: "Неаккуратный", femaleName: "Неаккуратная", excludes: "Аккуратный", tier: -1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: -1, construction: -1, scouting: 0 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Ремесленник", "Полезный умс. труд"]
    },
    { 
        name: "Слабовидящий", femaleName: "Слабовидящая", excludes: "Зоркий", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: -1, mining: 0, research: 0, construction: 0, scouting: -2 },
        frequentIn: ["Вредный физ. труд", "Полезный умс. труд"], neverIn: ["Полезный боев. труд", "Опасная среда"]
    },
    { 
        name: "Крепкий сон", excludes: "Чуткий сон", tier: -1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 5, battle: 0, mining: 0, research: 0, construction: 0, scouting: -2 },
        frequentIn: ["Элита", "Общественный"], neverIn: ["Незаконный", "Полезный боев. труд", "Изолированный"]
    },
    { 
        name: "Миролюбивый", femaleName: "Миролюбивая", excludes: "Кровожадный", tier: 0, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: -2, mining: 0, research: 1, construction: 1, scouting: 0 },
        special: "Не может атаковать первым или добить врага",
        frequentIn: ["Полезный умс. труд", "Священник"], neverIn: ["Вредный боев. труд", "Незаконный"]
    },
    { 
        name: "Неуверенный в себе", femaleName: "Неуверенная в себе", excludes: "Самоуверенный", tier: 0, rarity: "Частая", 
        effect: { hp: 0, stamina: -5, battle: -1, mining: 0, research: 1, construction: 0, scouting: 1 },
        frequentIn: ["Маргинал", "Низкорожденный"], neverIn: ["Элита", "Незаконный", "Общественный"]
    },
    { 
        name: "Милосердный", femaleName: "Милосердная", excludes: "Жестокий", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: -1, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Полезный умс. труд", "Священник", "Пищевой промысел"], neverIn: ["Вредный боев. труд", "Незаконный"]
    },
    { 
        name: "Прямоногий", femaleName: "Прямоногая", excludes: "Косолапый", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 10, battle: 0, mining: 0, research: 0, construction: 0, scouting: 1 },
        frequentIn: ["Элита", "Полезный боев. труд"], neverIn: ["Маргинал"]
    },
    { 
        name: "Верный", femaleName: "Верная", excludes: "Подлый", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: -2 },
        special: "Не бросит в беде",
        frequentIn: ["Полезный боев. труд", "Общественный"], neverIn: ["Незаконный", "Маргинал"]
    },
    { 
        name: "Решительный", femaleName: "Решительная", excludes: "Нерешительный", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: 5, battle: 1, mining: 0, research: 0, construction: 0, scouting: 0 },
        frequentIn: ["Вредный боев. труд", "Элита", "Полезный боев. труд"], neverIn: ["Низкорожденный", "Полезный умс. труд"]
    },
    { 
        name: "Терпеливый", femaleName: "Терпеливая", excludes: "Нетерпеливый", tier: 1, rarity: "Частая", 
        effect: { hp: 0, stamina: -5, battle: -1, mining: 0, research: 1, construction: 1, scouting: 0 },
        frequentIn: ["Полезный умс. труд", "Ремесленник"], neverIn: ["Незаконный", "Вредный боев. труд"]
    },
    { 
        name: "Рациональный", femaleName: "Рациональная", excludes: "Иррациональный", tier: 1, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 0, mining: 0, research: 2, construction: 0, scouting: 0 },
        frequentIn: ["Полезный умс. труд", "Элита"], neverIn: ["Маргинал", "Незаконный", "Изолированный"]
    },
    { 
        name: "Здоровый", femaleName: "Здоровая", excludes: "Болезный", tier: 2, rarity: "Частая", 
        effect: { hp: 8, stamina: 15, battle: 1, mining: 1, research: 0, construction: 0, scouting: 0 },
        special: "Меньше шанс подхватить болезнь",
        frequentIn: ["Полезный боев. труд", "Элита"], neverIn: ["Вредный физ. труд", "Вредный умс. труд", "Маргинал"]
    },
    { 
        name: "Расторопный", femaleName: "Расторопная", excludes: "Неуклюжий", tier: 2, rarity: "Необычная", 
        effect: { hp: 0, stamina: 0, battle: 1, mining: 0, research: 0, construction: 2, scouting: 1 },
        frequentIn: ["Элита", "Ремесленник", "Опасная среда"], neverIn: ["Маргинал"]
    },
    { 
        name: "Смелый", femaleName: "Смелая", excludes: "Пугливый", tier: 2, rarity: "Частая", 
        effect: { hp: 0, stamina: 10, battle: 2, mining: 0, research: 0, construction: 0, scouting: -1 },
        frequentIn: ["Полезный боев. труд", "Вредный боев. труд", "Опасная среда"], neverIn: ["Маргинал", "Низкорожденный"]
    }
];