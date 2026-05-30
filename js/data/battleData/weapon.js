import { DEFAULT_SWORD_SKILL, SWORD_SKILLS } from "../weaponSkills/swordSkills.js";
import { DEFAULT_SPEAR_SKILL, SPEAR_SKILLS} from "../weaponSkills/spearSkills.js";
import { DEFAULT_HAMMER_SKILL, HAMMER_SKILLS} from "../weaponSkills/hammerSkills.js";
import { DEFAULT_AXE_SKILL, AXE_SKILLS} from "../weaponSkills/axeSkills.js";
import { DEFAULT_SLING_SKILL, SLING_SKILLS} from "../weaponSkills/slingSkills.js";
import { DEFAULT_CROSSBOW_SKILL, CROSSBOW_SKILLS} from "../weaponSkills/crossbowSkills.js";
import { DEFAULT_BOW_SKILL, BOW_SKILLS} from "../weaponSkills/bowSkills.js";
import { DEFAULT_ARQUEBUS_SKILL, ARQUEBUS_SKILLS} from "../weaponSkills/arquebusSkills.js";

export const test_weapon = {
    debugSword: { 
        name: "Меч (ОТЛАДКА)", 
        type: "weapon", category: "swords", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SWORD_SKILL, 
        skills: Object.values(SWORD_SKILLS)
    },
    debugSpear: {
        name: "Копьё (ОТЛАДКА)", 
        type: "weapon", category: "spears", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SPEAR_SKILL, 
        skills: Object.values(SPEAR_SKILLS)
    },
    debugHammer: {
        name: "Молот (ОТЛАДКА)", 
        type: "weapon", category: "hammers", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_HAMMER_SKILL, 
        skills: Object.values(HAMMER_SKILLS)
    },
    debugAxe: {
        name: "Топор (ОТЛАДКА)", 
        type: "weapon", category: "axes", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_AXE_SKILL, 
        skills: Object.values(AXE_SKILLS)
    },
    debugSling: {
        name: "Праща (ОТЛАДКА)", 
        type: "weapon", category: "slings", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SLING_SKILL, 
        skills: Object.values(SLING_SKILLS)
    },
    debugCrossbow: {
        name: "Арбалет (ОТЛАДКА)", 
        type: "weapon", category: "crossbows", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL, 
        skills: Object.values(CROSSBOW_SKILLS)
    },
    debugBow: {
        name: "Лук (ОТЛАДКА)", 
        type: "weapon", category: "bows", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_BOW_SKILL, 
        skills: Object.values(BOW_SKILLS)
    },
    debugArquebus: {
        name: "Аркебуза (ОТЛАДКА)", 
        type: "weapon", category: "arquebuses", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL, 
        skills: Object.values(ARQUEBUS_SKILLS)
    }
};

export const swords = {
    // --- УРОВЕНЬ 1 ---
    rustySword: { 
        name: "Ржавый меч", 
        type: "weapon",
        category: "swords",
        level: 1,
        baseDamage: 10,
        defaultSkillData: DEFAULT_SWORD_SKILL, 
        skills: [
            SWORD_SKILLS.dupliren, 
            SWORD_SKILLS.cleavingStrike, 
            SWORD_SKILLS.wideSwing,
        ],
        description: 'Хлам с гор мусора, списанный в виду нерентабельности ремонта.'
    },
    // --- УРОВЕНЬ 2 ---
    messer: {
        name: "Фальшион", // Тяжелый нож-переросток
        type: "weapon", category: "swords", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.wideSwing,     // АоЕ
            SWORD_SKILLS.flatStrike,    // Удар плашмя (вес клинка позволяет)
            SWORD_SKILLS.mordhau,       // Мордхау (удачно для тяжелых мечей)
        ],
        description: 'Своеобразный большой тесак. Мило дело наносить рубящие удары, но вот ткнуть кого-то не выйдет.'
    },
    broadsword: {
        name: "Палаш", // Прямой, мощный, с закрытой гардой.
        type: "weapon", category: "swords", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.thrust,        // Укол
            SWORD_SKILLS.pommelStrike,  // Удар эфесом (защищенная гарда — кастет)
            SWORD_SKILLS.flatStrike,    // Удар плашмя
            SWORD_SKILLS.versetzen,     // Ферзеццен
        ],
        description: 'Конная сабля, утратившая свою ценность в виду бессмысленности конных войск. Ну и отсутствия коней под землёй...'
    },
    // --- УРОВЕНЬ 3 ---
    khopesh: {
        name: "Хопеш", // Серповидный меч. Мастер зацепов и рваных ран.
        type: "weapon", category: "swords", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.wideSwing,     // АоЕ
            SWORD_SKILLS.feint,         // Финт
            SWORD_SKILLS.bladeGrab,     // Захват клинка (формой крюка легко ловить руки)
        ],
        description: 'С резкой сменой уклада жизни на поверхность всплыват многие специфичные античные дизайны оружия и предметов быта.'
    },
    knightlySword: {
        name: "Рыцарский меч", // Классический рыцарский меч с разными вариантами нанесения ударов
        type: "weapon", category: "swords", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.thrust,        // Укол
            SWORD_SKILLS.pommelStrike,  // Удар эфесом
            SWORD_SKILLS.mordhau,       // Мордхау
            SWORD_SKILLS.versetzen,     // Ферзеццен
        ],
        description: 'Титул рыцаря утерян, а вот популярная конструкция и старые образцы остались.'
    },
    // --- УРОВЕНЬ 4 ---
    estoc: {
        name: "Эсток", // Граненый клинок для пробития доспехов.
        type: "weapon", category: "swords", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.thrust,        // Пробитие
            SWORD_SKILLS.feint,         // Финт
            SWORD_SKILLS.flatStrike,    // Удар плашмя
            SWORD_SKILLS.bladeGrab,     // Захват клинка
        ],
        description: 'Оружие боевитого аристократа. Абсурдно на поле брани, но в дуэли то, что надо'
    },
    zweihander: {
        name: "Цвайхендер", // Двуручный исполин.
        type: "weapon", category: "swords", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.dupliren,
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.wideSwing,      // Тотальное АоЕ
            SWORD_SKILLS.pommelStrike,   // Удар эфесом
            SWORD_SKILLS.versetzen,      // Ферзеццен
        ],
        description: 'Не самое практичное с точки зрения применимости оружие, но какой эффект оказывает его внушительный размер...'
    }
};

export const spears = {
    // --- УРОВЕНЬ 1 ---
    brokenSpear: {
        name: "Сломанное копьё", 
        type: "weapon", category: "spears", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_SPEAR_SKILL, 
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.injectionInTheLegs,
            SPEAR_SKILLS.rightThrough
        ],
        description: 'Поржавелый наконечник, едва удерживающийся на древке. Долго не прослужит.'
    },

    // --- УРОВЕНЬ 2 ---
    partisan: {
        name: "Протазана", // Широкое лезвие с "ушками". Позволяет и колоть, и тянуть.
        type: "weapon", category: "spears", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.injectionInTheLegs,
            SPEAR_SKILLS.freeingUpSpace,       // Расталкивание
            SPEAR_SKILLS.attraction,            // Притягивание (ушками)
            SPEAR_SKILLS.slashingStrike,       // Секущий взмах
        ],
        description: 'Копьё, удлинённые "ушки", которого призваны оставлять плохо заживающие раны.'
    },
    pike: {
        name: "Длинная пика", // Огромная дистанция и упор на защиту.
        type: "weapon", category: "spears", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.rightThrough,
            SPEAR_SKILLS.spearBlock,           // Блок
            SPEAR_SKILLS.attraction,           // Контроль дистанции
            SPEAR_SKILLS.notOneStepFurther,    // Стойка
        ],
        description: 'Для тех, кому претит подпускать к себе противника на растояние вытянутой руки. А то и двух.'
    },

    // --- УРОВЕНЬ 3 ---
    halberd: {
        name: "Алебарда", // Топор + Копье. Универсальный солдат.
        type: "weapon", category: "spears", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.rightThrough,         // Пробитие блоков
            SPEAR_SKILLS.freeingUpSpace,        // Отбрасывание
            SPEAR_SKILLS.slashingStrike,       // Мощное АоЕ
            SPEAR_SKILLS.notOneStepFurther,    // Защита зоны
        ],
        description: 'Универсальное орудие, способное нанести вред кому угодно, вне зависимости от уровня защищённости и размера.'
    },
    trident: {
        name: "Трезубец", // Оружие для захвата и запутывания.
        type: "weapon", category: "spears", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.injectionInTheLegs,   // Уколы в ноги тремя зубцами
            SPEAR_SKILLS.spearBlock,           // Удобно блокировать чужое оружие
            SPEAR_SKILLS.attraction,           // Легко зацепить и притянуть
            SPEAR_SKILLS.spearThrow            // Гладиаторская классика
        ],
        description: 'Странное и экзотичное оружие, которому находятся необычные применения в бою.'
    },

    // --- УРОВЕНЬ 4 ---
    glaive: {
        name: "Глефа", // Меч на палке. Максимальная маневренность.
        type: "weapon", category: "spears", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.freeingUpSpace,       // Контроль позиции
            SPEAR_SKILLS.spearBlock,
            SPEAR_SKILLS.slashingStrike,       // Размашистый удар
            SPEAR_SKILLS.pole,                 // Прыжок на шесте
        ],
        description: 'Если бы не кусок сабли на окончании можно было принять за танцевальный инвентарь. Смертоносная и изящная.'
    },
    pilum: {
        name: "Пилум", // Тяжелый метательный дротик.
        type: "weapon", category: "spears", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.rightThrough,         // Пробивает щиты насквозь
            SPEAR_SKILLS.notOneStepFurther,     // Оборона после сближения
            SPEAR_SKILLS.spearThrow,           // Главная фишка
            SPEAR_SKILLS.pole,                 // Рывок на сближение
        ],
        description: 'Забытая конструкция позволяет не сильно переживать за порчу металла при броске, да и привычно "тыкать" им никто не запрещает.'
    }
};

export const hammers = {
    // --- УРОВЕНЬ 1 ---
    blacksmithsHammer: {
        name: "Кузнечный молот", 
        type: "weapon", category: "hammers", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_HAMMER_SKILL, 
        skills: [
            HAMMER_SKILLS.descendingStrike, 
            HAMMER_SKILLS.starsFromEyes, 
            HAMMER_SKILLS.preparation
        ],
        description: 'Возможно его присутствие как-то связано с негодованием вашего знакомого кузнеца о пропаже его молота.'
    },

    // --- УРОВЕНЬ 2 ---
    warHammer: {
        name: "Боевой молот", // Классический одноручный молот
        type: "weapon", category: "hammers", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.starsFromEyes,
            HAMMER_SKILLS.preparation,
            HAMMER_SKILLS.horizontalStrike,
            HAMMER_SKILLS.risingStrike
        ],
        description: 'Для человека с молотом окружающие не более чем забавно визжащие гвоздики.'
    },
    morningStar: {
        name: "Моргенштерн", // Шипастая булава для привлечения внимания
        type: "weapon", category: "hammers", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.starsFromEyes,
            HAMMER_SKILLS.horizontalStrike,
            HAMMER_SKILLS.attentionGrabber,
            HAMMER_SKILLS.beakStrike
        ],
        description: 'Вызывает тоскливые воспоминания о солнце у тех, кто его застал, и удивление у рождённых после его заката.'
    },

    // --- УРОВЕНЬ 3 ---
    heavyMaul: {
        name: "Тяжелая кувалда", // Двуручное сокрушительное оружие
        type: "weapon", category: "hammers", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.preparation,
            HAMMER_SKILLS.runningStrike,
            HAMMER_SKILLS.allInThisStrike,
            HAMMER_SKILLS.earthTremor
        ],
        description: 'Немного доработанный инструмент, с сменившийся рабочей плоскостью.'
    },
    flangedMace: {
        name: "Пернач", // Профессиональное пробитие доспехов
        type: "weapon", category: "hammers", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.horizontalStrike,
            HAMMER_SKILLS.attentionGrabber,
            HAMMER_SKILLS.risingStrike,
            HAMMER_SKILLS.beakStrike
        ],
        description: 'Наиболее совершенное развитие идеи простой дубинки.'
    },

    // --- УРОВЕНЬ 4 ---
    crowBeak: {
        name: "Клевец", // Узкоспециализированное оружие с клювом
        type: "weapon", category: "hammers", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.risingStrike,
            HAMMER_SKILLS.beakStrike,
            HAMMER_SKILLS.runningStrike,
            HAMMER_SKILLS.allInThisStrike
        ],
        description: 'Иногда лучше не стучать по листу металла, а пробить его навылет.'
    },
    polex: {
        name: "Полэкс", // 
        type: "weapon", category: "hammers", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.starsFromEyes,
            HAMMER_SKILLS.preparation,
            HAMMER_SKILLS.attentionGrabber,
            HAMMER_SKILLS.earthTremor
        ],
        description: 'Брат алебарды. Также универсален и смертоносен.'
    }
};

export const axes = {
    // --- УРОВЕНЬ 1 (Стартовый инвентарь) ---
    rustyAxe: {
        name: "Ржавый топор",
        type: "weapon", category: "axes", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База: размашистый удар
            AXE_SKILLS.maimingStrike,  // Калечащий замах
            AXE_SKILLS.berserkerJump   // Прыжок на врага
        ],
        description: 'Один из самых бесполезных инструментов, в реалиях отсутствия доступной древесины и плотнического ремесла.'
    },

    // --- УРОВЕНЬ 2 (Специализированные топоры) ---
    francisca: {
        name: "Франциска", // Метательный топор. Баланс между ближним и дальним боем.
        type: "weapon", category: "axes", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.maimingStrike,   // Ослабление врага
            AXE_SKILLS.cleave,         // Нанесение глубоких ран
            AXE_SKILLS.danceOfPain,    // Маневренность через боль
            AXE_SKILLS.axeThrow,       // Дистанционная атака (метание)
        ],
        description: 'Наиболее удобный топорик для броска в противника. Правда в ближнем бою орудовать немного сложнее.'
    },
    beardedAxe: {
        name: "Бородовидный топор", // Топор с "бородой" для зацепов.
        type: "weapon", category: "axes", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.berserkerJump,   // Агрессивное сближение
            AXE_SKILLS.cleave,         // Рассечение
            AXE_SKILLS.sweep,          // Подсечка (удобно цеплять "бородой")
            AXE_SKILLS.ironSwan,       // Удар по тылу
        ],
        description: 'Конструкционное новшество для того, кому уже мало просто рубить и хочется провернуть какой-нибудь интересный манёвр.'
    },

    // --- УРОВЕНЬ 3 (Боевое снаряжение) ---
    labrys: {
        name: "Лабрис", // Двусторонний топор. Олицетворение ярости.
        type: "weapon", category: "axes", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.danceOfPain,    // Пляска боли
            AXE_SKILLS.axeThrow,        // Отчаянный бросок
            AXE_SKILLS.execution,      // Добивание раненых
            AXE_SKILLS.whirlwind,      // Безумный вихрь (двойное лезвие помогает)
        ],
        description: 'Кузен цвайхендера. Большей частью лишь демонстрация опасности, так как орудовать таким крайне и крайне неудобно.'
    },
    bardiche: {
        name: "Бердыш", // Большой топор на длинном древке.
        type: "weapon", category: "axes", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.maimingStrike,  // Увечащий удар
            AXE_SKILLS.cleave,          // Рассечение
            AXE_SKILLS.sweep,          // Размашистая подсечка
            AXE_SKILLS.ironSwan,       // Достает до самых дальних рядов
        ],
        description: 'Его конструкция пришла вместе с беженцами с севера. Грозное оружие, которое выглядит не менее солидно у стражника, чем полуторный меч.'
    },

    // --- УРОВЕНЬ 4 (Элитное оружие) ---
    daneAxe: {
        name: "Датский топор", // Огромный двуручный топор для прорыва строя.
        type: "weapon", category: "axes", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.berserkerJump,  // Влет в гущу боя
            AXE_SKILLS.axeThrow,       // Бросок махины во врага
            AXE_SKILLS.sweep,           // Опрокидывание группы врагов
            AXE_SKILLS.whirlwind,      // Сокрушительный вихрь
        ],
        description: 'Длинное древко потенциально позволяет использовать его как своеобразный древковый топор, сохраняя дистанцию с противником.'
    },
    executionerAxe: {
        name: "Топор палача", // Оружие, созданное для одного идеального удара.
        type: "weapon", category: "axes", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.cleave,         // Смертельные раны
            AXE_SKILLS.ironSwan,       // Точный удар по важной цели
            AXE_SKILLS.execution,      // Казнь (усиление от дебаффов)
            AXE_SKILLS.whirlwind       // Неотвратимая жатва
        ],
        description: 'К чему рубить головы потенциальных каторжников. Пусть лучше послужит доброму делу.'
    }
};

export const slings = {
    // --- УРОВЕНЬ 1 (Простейшая самоделка) ---
    braidedSling: {
        name: "Плетеная праща", // Изготовлена из верёвок или сухожилий
        type: "weapon", category: "slings", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow, // База: урон от дистанции
            SLING_SKILLS.visualNoise,   // Защита через раскручивание
            SLING_SKILLS.sightingThrow  // Пристрелка
        ],
        description: 'Шмат дряной кожи, которую даже на кошель или ремень пускать жаль. А вот с её помощью камни пускать - мило дело.'
    },

    // --- УРОВЕНЬ 2 (Специализированные инструменты) ---
    huntersSling: {
        name: "Охотничий ремень", // Кожаная праща с хорошим захватом снаряда
        type: "weapon", category: "slings", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.visualNoise,      // Наложение блока
            SLING_SKILLS.sightingThrow,   // Навешивание уязвимости
            SLING_SKILLS.flail,           // Удар самой пращой как кистенем (ближний бой)
            SLING_SKILLS.whistlingBullet, // Испуг врагов свистом снаряда
        ],
        description: 'Ценителей охоты с пращой и в тёплые времена было не сыскать, а сейчас это и вовсе диковинка для чудака.'
    },
    fustibalus: {
        name: "Фустибал", // Праща на посохе. Позволяет метать тяжелые снаряды.
        type: "weapon", category: "slings", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.leadBullet,      // Ошеломляющий удар тяжелым камнем
            SLING_SKILLS.flail,           // Посох фустибала — отличный кистень
            SLING_SKILLS.hail,            // Град мелких камней (АоЕ)
            SLING_SKILLS.limeVessel       // Метание сосуда с известью
        ],
        description: 'Увеличение мощи запуска камней с помощью фустибала может превратить пращу из всеми принижаемого оружия, в выдающее удивительные результаты.'
    },

    // --- УРОВЕНЬ 3 (Военное применение) ---
    balearicSling: {
        name: "Балеарская праща", // Профессиональное плетение для огромной скорости.
        type: "weapon", category: "slings", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.leadBullet,      // Оглушающая пуля
            SLING_SKILLS.straightThrow,   // Мощный прямой выстрел по защите
            SLING_SKILLS.hail,            // Засыпание позиций врага
            SLING_SKILLS.whistlingBullet  // Психологическое давление
        ],
        description: 'Мало какой мастер возьмётся за работу над подобным заказом. Не столько из-за сложности или неизвестной технологии, сколько из-за отсутствия покупателя.'
    },
    heavySling: {
        name: "Тяжёлый фустибал", // Тяжелая версия для метания зажигательных/хим. смесей.
        type: "weapon", category: "slings", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,    // База
            SLING_SKILLS.leadBullet,        // Тяжелый снаряд
            SLING_SKILLS.straightThrow,      // Сбивание защиты
            SLING_SKILLS.invigoratingRicochet, // Рикошет, помогающий союзникам
            SLING_SKILLS.limeVessel,       // Облако едкой извести по площади
        ],
        description: 'Конструкционный пик пращи на фустибале. Дальше уже только увеличивать размеры и ставить осаждать замки.'
    },

    // --- УРОВЕНЬ 4 (Вершина технологий подземелий) ---
    plumbataSling: {
        name: "Свинцовая праща", // Заточена под использование литых пуль.
        type: "weapon", category: "slings", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.sightingThrow,   // Смертельная точность
            SLING_SKILLS.leadBullet,       // Глухое ошеломление
            SLING_SKILLS.straightThrow,   // Пробитие любых щитов
            SLING_SKILLS.invigoratingRicochet, // Мастерский рикошет от стен пещеры
        ],
        description: 'Максимум, который можно выжать из конструкции классической пращи, для запуска наиболее тяжёлых и опасных видов снарядов.'
    },
    experimentSling: {
        name: "Экспериментальный фустибал",
        type: "weapon", category: "slings", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.visualNoise,      // Абсолютный контроль дистанции
            SLING_SKILLS.flail,           // Непредсказуемый ближний бой
            SLING_SKILLS.hail,            // Заградительный огонь
            SLING_SKILLS.limeVessel,      // Хим. атака
        ],
        description: 'Чёрт его знает откуда эта диковинка взялась, но единичные энтузиасты делают с ней интересные вещи.'
    }
};

export const crossbows = {
    // --- УРОВЕНЬ 1 (Простейшее охотничье устройство) ---
    huntingCrossbow: {
        name: "Дрянной арбалет", // Простой деревянный арбалет
        type: "weapon", category: "crossbows", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,    // База: подготовка болтов
            CROSSBOW_SKILLS.aimedShot, // Прицельный выстрел
            CROSSBOW_SKILLS.duck       // Командное действие
        ],
        description: 'Еле как работающая конструкция, ещё способная запустить болт или что-то на него похожее.'
    },

    // --- УРОВЕНЬ 2 (Механизированное оружие) ---
    lightCrossbow: {
        name: "Легкий арбалет", // Быстрый и мобильный
        type: "weapon", category: "crossbows", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.duck,          // Поддержка передовой
            CROSSBOW_SKILLS.snapShot,      // Выстрел навскидку (мобильность)
            CROSSBOW_SKILLS.broadheadBolt, // Кровотечение
            CROSSBOW_SKILLS.buttstroke     // Удар прикладом (ближний бой)
        ],
        description: 'Добротненький, пусть и слабенький арбалетик. Силы недостаёт, зато компактный и лёгкий.'
    },
    cranequinCrossbow: {
        name: "Арбалет с воротом", // Механика позволяет использовать тяжелые болты
        type: "weapon", category: "crossbows", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.aimedShot,     // Высокий урон
            CROSSBOW_SKILLS.snapShot,      // Быстрая реакция
            CROSSBOW_SKILLS.broadheadBolt,  // Охотничьи наконечники
            CROSSBOW_SKILLS.heavyBolt,     // Отталкивание врага
        ],
        description: 'Инженерная придурь позваляет натягивать и выпускать болты с такой мощью, что заброневым воздейсвтием можно контузить одоспешенного противника.'
    },

    // --- УРОВЕНЬ 3 (Военные образцы) ---
    heavyArbalest: {
        name: "Тяжелый арбалест", // Стальные дуги, огромная мощь
        type: "weapon", category: "crossbows", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,         // База
            CROSSBOW_SKILLS.aimedShot,      // Пробитие брони
            CROSSBOW_SKILLS.buttstroke,      // Самооборона вблизи
            CROSSBOW_SKILLS.heavyBolt,      // Мощный толчок
            CROSSBOW_SKILLS.vulnerableSpot, // Огромный урон по метке
        ],
        description: 'Крайне и крайне мощный арбалет, выбивающий желание продолжать сражаться у любого, мимо кого пролетит болт выпущенный из него.'
    },
    repeatingCrossbow: {
        name: "Многозарядный арбалет", // Чо-ко-ну. Упор на спец. болты и поддержку.
        type: "weapon", category: "crossbows", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.duck,          // Тактика
            CROSSBOW_SKILLS.broadheadBolt,  // Осыпание градом болтов
            CROSSBOW_SKILLS.fireBolt,      // Поджог (испуг)
            CROSSBOW_SKILLS.flareBolt,     // Сигнальный выстрел
        ],
        description: 'Крайне ненадёжная, но занятная инжерная модель, способная поднять скорострельность арбалета до значений, делающего его конкурентным луку. Правда перезарядка...'
    },

    // --- УРОВЕНЬ 4 (Шедевры инженеров недр) ---
    siegeArbalest: {
        name: "Осадный арбалест", // Огромная машина смерти
        type: "weapon", category: "crossbows", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,         // База
            CROSSBOW_SKILLS.aimedShot,       // Хирургическая точность
            CROSSBOW_SKILLS.heavyBolt,      // Пролом рядов врага
            CROSSBOW_SKILLS.fireBolt,       // Огненный террор
            CROSSBOW_SKILLS.vulnerableSpot, // Аннигиляция помеченной цели
        ],
        description: 'Не каждый рискнёт стрелять таким с рук, без подпорки-сошки. Да и не практично. Но тут как с большими мечами и топорами - ради зрелищности жертвуем практичностью.'
    },
    alchemistCrossbow: {
        name: "Алхимический арбалет", // Использует спец. боеприпасы
        type: "weapon", category: "crossbows", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.snapShot,       // Скорость использования
            CROSSBOW_SKILLS.broadheadBolt, // Отравленные/зубчатые болты
            CROSSBOW_SKILLS.fireBolt,      // Алхимический огонь
            CROSSBOW_SKILLS.flareBolt,     // Тактическое управление полем
        ],
        description: 'Странный арбалет с не менее странными задачами. Материал устойчив к корозии, в качестве снарядов какие-то склянки. Оружие самообороны алхимика, а не солдата какого.'
    }
};

export const bows = {
    // --- УРОВЕНЬ 1 (Самоделка) ---
    simpleBow: {
        name: "Простой лук", // Гибкая палка и тетива
        type: "weapon", category: "bows", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База: метка цели
            BOW_SKILLS.shoulderStrike,  // Оборона вблизи
            BOW_SKILLS.brightFeathers   // Снятие провокации
        ],
        description: 'Страшно посмотреть - того и гляди развалится от веса взгляда.'
    },

    // --- УРОВЕНЬ 2 (Специализированные луки) ---
    recurveBow: {
        name: "Рекурсивный лук", // Компактный и быстрый
        type: "weapon", category: "bows", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.shoulderStrike,  // Самооборона
            BOW_SKILLS.overcastShot,    // Навес по тылам
            BOW_SKILLS.lowShot,         // Контроль позиции врага
            BOW_SKILLS.doubleShot       // Скорострельность
        ],
        description: 'Пожалуй конструкционная золотая середина в лукоделаньи. Без сложных материалов, конструкционных особенностей и особых техник стрельбы.'
    },
    reflexBow: {
        name: "Рефлексивный лук", // Сильный изгиб дает хлесткий выстрел
        type: "weapon", category: "bows", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.brightFeathers,  // Тактика
            BOW_SKILLS.returnShot,      // Ответный выстрел
            BOW_SKILLS.breathingPractices, // Подготовка/Ускорение
            BOW_SKILLS.doubleShot       // Двойной залп
        ],
        description: 'Сколько дуги ты не гни - а они всё пли-пли-пли.'
    },

    // --- УРОВЕНЬ 3 (Военное снаряжение) ---
    compositeBow: {
        name: "Составной лук", // Рог, дерево и сухожилия. Большая мощь.
        type: "weapon", category: "bows", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.overcastShot,    // Засыпание стрелами
            BOW_SKILLS.lowShot,         // Опрокидывание
            BOW_SKILLS.prickAndShot,    // Техничный выстрел с кровотоком
            BOW_SKILLS.breathingPractices // Контроль дыхания
        ],
        description: 'Мало какой богатей сейчас способен заказать себе такой. Древесина и так в дефиците, а тут ещё нужно и несколько их видов для создания.'
    },
    infantryBow: {
        name: "Пехотный лук", // Усиленный лук для затяжных стычек
        type: "weapon", category: "bows", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.shoulderStrike,   // Рукопашная
            BOW_SKILLS.brightFeathers,  // Снятие таунтов
            BOW_SKILLS.returnShot,      // Контратака
            BOW_SKILLS.rapidFire,       // Заградительный огонь
        ],
        description: 'Рабочая лошадка гарнизона унии. Арбалет попроще в освоении, но от некоторых угроз лук спасает лучше.'
    },

    // --- УРОВЕНЬ 4 (Вершины мастерства) ---
    yewLongbow: {
        name: "Тисовый длинный лук", // Огромная сила натяжения и дистанция
        type: "weapon", category: "bows", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.overcastShot,    // Траектория позволяет бить через ряды
            BOW_SKILLS.lowShot,         // Тяжелая стрела сбивает с ног
            BOW_SKILLS.prickAndShot,     // Пробитие со спец. эффектом
            BOW_SKILLS.rapidFire,       // Легендарная скорость лонгбоуменов
        ],
        description: 'Не иначе реликт прошлого, чудом сохранившийся до наших дней, ведь современное поверхностное дерево не способно выдавать те же параметры, что и дерево прошлого.'
    },
    asymmetricalLongBow: {
        name: "Ассиметричный длинный лук", // Асимметричный шедевр для медитативной стрельбы
        type: "weapon", category: "bows", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.returnShot,      // Мастерская реакция
            BOW_SKILLS.breathingPractices, // Дзэн-концентрация
            BOW_SKILLS.rapidFire,        // Град стрел
            BOW_SKILLS.doubleShot,      // Два идеальных выстрела
        ],
        description: 'Чей-то заморский сувенир, а не оружие. В пору чудом света называть, особенно глядя на то, как с него стреляют.'
    }
};

export const arquebuses = {
    // --- УРОВЕНЬ 1 (Примитивное дульнозарядное) ---
    handGonne: {
        name: "Ручница", // Просто железная трубка на палке
        type: "weapon", category: "arquebuses", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База: перезарядка
            ARQUEBUS_SKILLS.improvisedClub, // Использование как дубины вблизи
            ARQUEBUS_SKILLS.morePowder       // Рискованный выстрел "на все деньги"
        ],
        description: 'Стреляющему из неё чуть ли не страшнее жертвы. Того и гляди руки оторвёт.'
    },

    // --- УРОВЕНЬ 2 (Стандартное вооружение) ---
    matchlockArquebus: {
        name: "Фитильная аркебуза", // Полноценный замок и ложе
        type: "weapon", category: "arquebuses", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Прицельная стрельба
            ARQUEBUS_SKILLS.improvisedClub,  // Самооборона
            ARQUEBUS_SKILLS.spentPowder,      // Дебафф пороховым дымом
            ARQUEBUS_SKILLS.shotIntoAir,     // Психологическая атака (шум)
        ],
        description: 'Пользоваться ей сможет далеко не каждый, но вещь опасная.'
    },
    blunderbuss: {
        name: "Мушкетон", // Короткий ствол с раструбом. Король тесных помещений.
        type: "weapon", category: "arquebuses", level: 2, baseDamage: 12,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.improvisedClub,   // Мощный удар прикладом
            ARQUEBUS_SKILLS.spentPowder,     // Огромное облако дыма
            ARQUEBUS_SKILLS.buckshot,        // Главная фишка: картечь и кровоток
            ARQUEBUS_SKILLS.stayAway,        // Отбрасывание врага в упор
        ],
        description: 'Громыхает так, что эхо выстрела слышно, наверное, с другого конца унии.'
    },

    // --- УРОВЕНЬ 3 (Тяжелые калибры) ---
    infantryMusket: {
        name: "Пехотный мушкет", // Длинный ствол, высокая убойность
        type: "weapon", category: "arquebuses", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Сверхмощный выстрел
            ARQUEBUS_SKILLS.shotIntoAir,     // Запугивание грохотом
            ARQUEBUS_SKILLS.piercedArtery,   // Пробитие со специфической раной
            ARQUEBUS_SKILLS.piercingShot     // Выстрел навылет сквозь строй
        ],
        description: 'Едва ли арсенал унии насчитывает более сотни подобных. Подземные конфликты не благоволят пороховым новинкам, но что-то в них есть.'
    },
    wallGun: {
        name: "Гаковница", // Тяжелое ружье с крюком для зацепа за упор
        type: "weapon", category: "arquebuses", level: 3, baseDamage: 14,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.morePowder,      // Максимальный риск оглушения
            ARQUEBUS_SKILLS.spentPowder,      // Ослепление врага вспышкой
            ARQUEBUS_SKILLS.piercingShot,    // Прошибает цели в ряд
            ARQUEBUS_SKILLS.stayAway,        // Огромная отдача раскидывает всех
        ],
        description: 'Логичное завершение ручных громыхалок, целью которых является не убиение и нанесение вреда, а учинение паники и страха в рядах противника.'
    },

    // --- УРОВЕНЬ 4 (Инженерное совершенство) ---
    masterCaliver: {
        name: "Мастерский каливер", // Облегченное, но невероятно точное ружье
        type: "weapon", category: "arquebuses", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Идеальный выстрел
            ARQUEBUS_SKILLS.spentPowder,      // Тактическое использование дыма
            ARQUEBUS_SKILLS.buckshot,        // Спец-заряды (картечь)
            ARQUEBUS_SKILLS.piercedArtery,   // Хирургическое попадание
        ],
        description: 'С этой громыхающей палки даже можно метко стрелять! Обычному вояке такой не светит, а вот богатею, ценящему современное вооружение...'
    },
    heavyMatchlock: {
        name: "Тяжелый аркебуз", // Максимальный калибр, который может поднять человек
        type: "weapon", category: "arquebuses", level: 4, baseDamage: 16,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.morePowder,      // Выстрел на пределе возможностей
            ARQUEBUS_SKILLS.shotIntoAir,      // Массовая паника врагов
            ARQUEBUS_SKILLS.piercingShot,    // Уничтожение всей колонны врага
            ARQUEBUS_SKILLS.stayAway,        // Громоподобный выстрел с отбросом
        ],
        description: 'Вероятно именно с такими и будут ходить на осады прочих подземных уний наши потомки. А может и современники...'
    }
};