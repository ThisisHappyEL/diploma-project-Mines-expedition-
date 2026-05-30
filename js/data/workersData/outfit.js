export const STARTING_CLOTHES = {
    greasyRags: {
        name: 'Засаленные лохмотья',
        description: "Пахнут сыростью и безнадёгой. Почти не греют, но это лучше, чем ничего.",
        category: ["Маргинал", "Низкорожденный"],
        effect: { hp: 2, stamina: 2 }
    },
    canvasShirt: {
        name: 'Холщовая рубаха и обмотки',
        description: "Типичная одежда рабочего люда. Грубая ткань, почерневшая от угольной пыли.",
        category: ["Низкорожденный", "Грязная работа", "Полезный физ. труд", "Опасная среда"],
        effect: { hp: 5, stamina: 5 }
    },

    leatherApron: {
        name: 'Плотный кожаный фартук',
        description: "Защищает от искр горна или брызг жира на бойне. Пахнет дегтем.",
        category: ["Ремесленник", "Пищевой промысел", "Вредный физ. труд", "Полезный физ. труд", "Опасная среда"],
        effect: { hp: 8, construction: 1, mining: 1 }
    },
    woolenCaftan: {
        name: 'Шерстяной кафтан',
        description: "Добротная одежда горожанина. Хорошо держит тепло в прохладных туннелях.",
        category: ["Общественный", "Ремесленник"],
        effect: { stamina: 10, research: 1 }
    },
    sleevelessJacket: {
        name: 'Стёганая безрукавка',
        description: "Старая поддёвка под доспех, ставшая повседневной одеждой. Немного смягчает удары.",
        category: ["Полезный боев. труд", "Вредный боев. труд"],
        effect: { hp: 10, battle: 1 }
    },

    wornRobe: {
        name: 'Поношенная мантия',
        description: "Длинные полы мешают ходить по лужам, но обилие карманов удобно для свитков.",
        category: ["Полезный умс. труд", "Вредный умс. труд"],
        effect: { research: 2, scouting: 1 }
    },
    velvetDoublet: {
        name: 'Бархатный дублет',
        description: "Выглядит нелепо в грязи шахт, но напоминает владельцу о его высоком происхождении.",
        category: ["Элита"],
        effect: { stamina: 15, research: 1 }
    },
    travelCloak: {
        name: 'Дорожный плащ',
        description: "Незаменимая вещь для тех, кто проводит жизнь в переходах между униями.",
        category: ["Изолированный", "Разведка"],
        effect: { stamina: 5, scouting: 2 }
    },

    darkJacket: {
        name: 'Тёмная куртка на завязках',
        description: "Не стесняет движений и не имеет блестящих пуговиц. Идеально для темноты.",
        category: ["Незаконный"],
        effect: { scouting: 1, battle: 1, stamina: 5 }
    }
};

export const OUTFITS = {
    lightArmor: {
        name: 'Лёгкий доспех',
        description: "Обеспечивает базовую защиту, не сковывая движений.",
        levels: {
            1: { hp: 10, battle: 2, atkArmor: 2 },
            2: { hp: 20, battle: 4, atkArmor: 4 },
            3: { hp: 30, battle: 6, atkArmor: 6 },
            4: { hp: 40, battle: 8, atkArmor: 8 }
        }
    },
    middleArmor: {
        name: 'Средний доспех',
        description: "Баланс между защитой и мобильностью.",
        levels: {
            1: { hp: 15, battle: 2, atkArmor: 1, defArmor: 1 },
            2: { hp: 25, battle: 4, atkArmor: 2, defArmor: 2 },
            3: { hp: 35, battle: 6, atkArmor: 3, defArmor: 3 },
            4: { hp: 45, battle: 8, atkArmor: 4, defArmor: 4 }
        }
    },
    heavyArmor: {
        name: 'Тяжёлый доспех',
        description: "Толстые пластины металла и кости. Весьма тяжел.",
        levels: {
            1: { hp: 10, battle: 2, defArmor: 2 },
            2: { hp: 20, battle: 4, defArmor: 4 },
            3: { hp: 30, battle: 6, defArmor: 6 },
            4: { hp: 40, battle: 8, defArmor: 8 }
        }
    },
    minerOutfit: {
        name: 'Роба рудокопа',
        description: "Прочная рабочая одежда с множеством карманов для инструмента.",
        levels: {
            1: { hp: 5, stamina: 10, mining: 2 },
            2: { hp: 10, stamina: 20, mining: 4 },
            3: { hp: 15, stamina: 30, mining: 6 },
            4: { hp: 20, stamina: 40, mining: 8 }
        }
    },
    scientistOutfit: {
        name: 'Дублет учёного',
        description: "Защищает от пыли и реагентов, снабжен петлями для свитков.",
        levels: {
            1: { hp: 5, stamina: 10, research: 2 },
            2: { hp: 10, stamina: 20, research: 4 },
            3: { hp: 15, stamina: 30, research: 6 },
            4: { hp: 20, stamina: 40, research: 8 }
        }
    },
    builderOutfit: {
        name: 'Камзол рабочего',
        description: "Грубая ткань, усиленная кожаными вставками.",
        levels: {
            1: { hp: 5, stamina: 10, construction: 2 },
            2: { hp: 10, stamina: 20, construction: 4 },
            3: { hp: 15, stamina: 30, construction: 6 },
            4: { hp: 20, stamina: 40, construction: 8 }
        }
    },
    scoutOutfit: {
        name: 'Плащ следопыта',
        description: "Скрывает силуэт во тьме туннелей.",
        levels: {
            1: { hp: 5, stamina: 10, scouting: 2 },
            2: { hp: 10, stamina: 20, scouting: 4 },
            3: { hp: 15, stamina: 30, scouting: 6 },
            4: { hp: 20, stamina: 40, scouting: 8 }
        }
    }
};