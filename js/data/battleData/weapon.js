import { DEFAULT_SWORD_SKILL, SWORD_SKILLS } from "./weaponSkills/swordSkills.js";
import { DEFAULT_SPEAR_SKILL, SPEAR_SKILLS} from "./weaponSkills/spearSkills.js;"
import { DEFAULT_HAMMER_SKILL, HAMMER_SKILLS} from "./weaponSkills/hammerSkills.js;"
import { DEFAULT_AXE_SKILL, AXE_SKILLS} from "./weaponSkills/axeSkills.js;"
import { DEFAULT_SLING_SKILL, SLING_SKILLS} from "./weaponSkills/slingSkills.js;"
import { DEFAULT_CROSSBOW_SKILL, CROSSBOW_SKILLS} from "./weaponSkills/crossbowSkills.js;"
import { DEFAULT_BOW_SKILL, BOW_SKILLS} from "./weaponSkills/bowSkills.js;"
import { DEFAULT_ARQUEBUS_SKILL, ARQUEBUS_SKILLS} from "./weaponSkills/arquebusSkills.js;"

export const test_weapon = {
    debugSword: { 
        name: "Меч (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SWORD_SKILL, 
        skills: Object.values(SWORD_SKILLS)
    },
    debugSpear: {
        name: "Копьё (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SPEAR_SKILL, 
        skills: Object.values(SPEAR_SKILLS)
    },
    debugHammer: {
        name: "Молот (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_HAMMER_SKILL, 
        skills: Object.values(HAMMER_SKILLS)
    },
    debugAxe: {
        name: "Топор (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_AXE_SKILL, 
        skills: Object.values(AXE_SKILLS)
    },
    debugSling: {
        name: "Праща (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_SLING_SKILL, 
        skills: Object.values(SLING_SKILLS)
    },
    debugCrossbow: {
        name: "Арбалет (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL, 
        skills: Object.values(CROSSBOW_SKILLS)
    },
    debugBow: {
        name: "Лук (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_BOW_SKILL, 
        skills: Object.values(BOW_SKILLS)
    },
    debugArquebus: {
        name: "Аркебуза (ОТЛАДКА)", 
        type: "weapon", level: 4, baseDamage: 10,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL, 
        skills: Object.values(ARQUEBUS_SKILLS)
    }
};

export const swords = {
    // --- УРОВЕНЬ 1 ---
    rustySword: { 
        name: "Ржавый меч", 
        type: "weapon", 
        level: 1,
        baseDamage: 10,
        defaultSkillData: DEFAULT_SWORD_SKILL, 
        skills: [
            SWORD_SKILLS.dupliren, 
            SWORD_SKILLS.cleavingStrike, 
            SWORD_SKILLS.wideSwing,
        ]
    },
    // --- УРОВЕНЬ 2 ---
    messer: {
        name: "Фальшион", // Тяжелый нож-переросток
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.wideSwing,     // АоЕ
            SWORD_SKILLS.flatStrike,    // Удар плашмя (вес клинка позволяет)
            SWORD_SKILLS.mordhau,       // Мордхау (удачно для тяжелых мечей)
            SWORD_SKILLS.dupliren
        ]
    },
    broadsword: {
        name: "Палаш", // Прямой, мощный, с закрытой гардой.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.thrust,        // Укол
            SWORD_SKILLS.pommelStrike,  // Удар эфесом (защищенная гарда — кастет)
            SWORD_SKILLS.versetzen,     // Ферзеццен
            SWORD_SKILLS.flatStrike,    // Удар плашмя
            SWORD_SKILLS.dupliren
        ]
    },
    // --- УРОВЕНЬ 3 ---
    khopesh: {
        name: "Хопеш", // Серповидный меч. Мастер зацепов и рваных ран.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.bladeGrab,     // Захват клинка (формой крюка легко ловить руки)
            SWORD_SKILLS.feint,         // Финт
            SWORD_SKILLS.wideSwing,     // АоЕ
            SWORD_SKILLS.dupliren
        ]
    },
    knightlySword: {
        name: "Рыцарский меч", // Классический рыцарский меч с разными вариантами нанесения ударов
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.thrust,        // Укол
            SWORD_SKILLS.pommelStrike,  // Удар эфесом
            SWORD_SKILLS.mordhau,       // Мордхау
            SWORD_SKILLS.versetzen,     // Ферзеццен
            SWORD_SKILLS.dupliren
        ]
    },
    // --- УРОВЕНЬ 4 ---
    estoc: {
        name: "Эсток", // Граненый клинок для пробития доспехов.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.thrust,        // Пробитие
            SWORD_SKILLS.feint,         // Финт
            SWORD_SKILLS.bladeGrab,     // Захват клинка
            SWORD_SKILLS.flatStrike,    // Удар плашмя
            SWORD_SKILLS.dupliren
        ]
    },
    zweihander: {
        name: "Цвайхендер", // Двуручный исполин.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SWORD_SKILL,
        skills: [
            SWORD_SKILLS.wideSwing,      // Тотальное АоЕ
            SWORD_SKILLS.cleavingStrike, // Кровоток
            SWORD_SKILLS.pommelStrike,   // Удар эфесом
            SWORD_SKILLS.versetzen,      // Ферзеццен
            SWORD_SKILLS.dupliren
        ]
    }
};

export const spear = {
    // --- УРОВЕНЬ 1 ---
    brokenSpear: {
        name: "Сломанное копьё", 
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_SPEAR_SKILL, 
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.injectionInTheLegs,
            SPEAR_SKILLS.rightThrough
        ]
    },

    // --- УРОВЕНЬ 2 ---
    partisan: {
        name: "Протазана", // Широкое лезвие с "ушками". Позволяет и колоть, и тянуть.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.attraction,            // Притягивание (ушками)
            SPEAR_SKILLS.freeingUpSpace,       // Расталкивание
            SPEAR_SKILLS.slashingStrike,       // Секущий взмах
            SPEAR_SKILLS.injectionInTheLegs
        ]
    },
    pike: {
        name: "Длинная пика", // Огромная дистанция и упор на защиту.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.notOneStepFurther,    // Стойка
            SPEAR_SKILLS.spearBlock,           // Блок
            SPEAR_SKILLS.attraction,           // Контроль дистанции
            SPEAR_SKILLS.rightThrough
        ]
    },

    // --- УРОВЕНЬ 3 ---
    halberd: {
        name: "Алебарда", // Топор + Копье. Универсальный солдат.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.rightThrough,         // Пробитие блоков
            SPEAR_SKILLS.slashingStrike,       // Мощное АоЕ
            SPEAR_SKILLS.notOneStepFurther,    // Защита зоны
            SPEAR_SKILLS.freeingUpSpace        // Отбрасывание
        ]
    },
    trident: {
        name: "Трезубец", // Оружие для захвата и запутывания.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.injectionInTheLegs,   // Уколы в ноги тремя зубцами
            SPEAR_SKILLS.attraction,           // Легко зацепить и притянуть
            SPEAR_SKILLS.spearBlock,           // Удобно блокировать чужое оружие
            SPEAR_SKILLS.spearThrow            // Гладиаторская классика
        ]
    },

    // --- УРОВЕНЬ 4 ---
    glaive: {
        name: "Глефа", // Меч на палке. Максимальная маневренность.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.pole,                 // Прыжок на шесте
            SPEAR_SKILLS.slashingStrike,       // Размашистый удар
            SPEAR_SKILLS.freeingUpSpace,       // Контроль позиции
            SPEAR_SKILLS.spearBlock
        ]
    },
    pilum: {
        name: "Пилум", // Тяжелый метательный дротик.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SPEAR_SKILL,
        skills: [
            SPEAR_SKILLS.aPrickBecauseOfAFriend,
            SPEAR_SKILLS.spearThrow,           // Главная фишка
            SPEAR_SKILLS.rightThrough,         // Пробивает щиты насквозь
            SPEAR_SKILLS.pole,                 // Рывок на сближение
            SPEAR_SKILLS.notOneStepFurther     // Оборона после сближения
        ]
    }
};

export const hammer = {
    // --- УРОВЕНЬ 1 ---
    blacksmithsHammer: {
        name: "Кузнечный молот", 
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_HAMMER_SKILL, 
        skills: [
            HAMMER_SKILLS.descendingStrike, 
            HAMMER_SKILLS.starsFromEyes, 
            HAMMER_SKILLS.preparation
        ]
    },

    // --- УРОВЕНЬ 2 ---
    warHammer: {
        name: "Боевой молот", // Классический одноручный молот
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.horizontalStrike,
            HAMMER_SKILLS.risingStrike,
            HAMMER_SKILLS.starsFromEyes,
            HAMMER_SKILLS.preparation
        ]
    },
    morningStar: {
        name: "Моргенштерн", // Шипастая булава для привлечения внимания
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.attentionGrabber,
            HAMMER_SKILLS.horizontalStrike,
            HAMMER_SKILLS.beakStrike,
            HAMMER_SKILLS.starsFromEyes
        ]
    },

    // --- УРОВЕНЬ 3 ---
    heavyMaul: {
        name: "Тяжелая кувалда", // Двуручное сокрушительное оружие
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.preparation,
            HAMMER_SKILLS.runningStrike,
            HAMMER_SKILLS.earthTremor,
            HAMMER_SKILLS.allInThisStrike
        ]
    },
    flangedMace: {
        name: "Пернач", // Профессиональное пробитие доспехов
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.beakStrike,
            HAMMER_SKILLS.risingStrike,
            HAMMER_SKILLS.attentionGrabber,
            HAMMER_SKILLS.horizontalStrike
        ]
    },

    // --- УРОВЕНЬ 4 ---
    crowBeak: {
        name: "Клевец", // Узкоспециализированное оружие с клювом
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.beakStrike,
            HAMMER_SKILLS.runningStrike,
            HAMMER_SKILLS.allInThisStrike,
            HAMMER_SKILLS.risingStrike
        ]
    },
    polex: {
        name: "Полэкс", // 
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_HAMMER_SKILL,
        skills: [
            HAMMER_SKILLS.descendingStrike,
            HAMMER_SKILLS.earthTremor,
            HAMMER_SKILLS.starsFromEyes,
            HAMMER_SKILLS.preparation,
            HAMMER_SKILLS.attentionGrabber
        ]
    }
};

export const axe = {
    // --- УРОВЕНЬ 1 (Стартовый инвентарь) ---
    rustyAxe: {
        name: "Ржавый топор",
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База: размашистый удар
            AXE_SKILLS.maimingStrike,  // Калечащий замах
            AXE_SKILLS.berserkerJump   // Прыжок на врага
        ]
    },

    // --- УРОВЕНЬ 2 (Специализированные топоры) ---
    francisca: {
        name: "Франциска", // Метательный топор. Баланс между ближним и дальним боем.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.axeThrow,       // Дистанционная атака (метание)
            AXE_SKILLS.cleave,         // Нанесение глубоких ран
            AXE_SKILLS.danceOfPain,    // Маневренность через боль
            AXE_SKILLS.maimingStrike   // Ослабление врага
        ]
    },
    beardedAxe: {
        name: "Бородовидный топор", // Топор с "бородой" для зацепов.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.cleave,         // Рассечение
            AXE_SKILLS.sweep,          // Подсечка (удобно цеплять "бородой")
            AXE_SKILLS.ironSwan,       // Удар по тылу
            AXE_SKILLS.berserkerJump   // Агрессивное сближение
        ]
    },

    // --- УРОВЕНЬ 3 (Боевое снаряжение) ---
    labrys: {
        name: "Лабрис", // Двусторонний топор. Олицетворение ярости.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.execution,      // Добивание раненых
            AXE_SKILLS.whirlwind,      // Безумный вихрь (двойное лезвие помогает)
            AXE_SKILLS.danceOfPain,    // Пляска боли
            AXE_SKILLS.axeThrow        // Отчаянный бросок
        ]
    },
    bardiche: {
        name: "Бердыш", // Большой топор на длинном древке.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.sweep,          // Размашистая подсечка
            AXE_SKILLS.ironSwan,       // Достает до самых дальних рядов
            AXE_SKILLS.maimingStrike,  // Увечащий удар
            AXE_SKILLS.cleave          // Рассечение
        ]
    },

    // --- УРОВЕНЬ 4 (Элитное оружие) ---
    daneAxe: {
        name: "Датский топор", // Огромный двуручный топор для прорыва строя.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.whirlwind,      // Сокрушительный вихрь
            AXE_SKILLS.berserkerJump,  // Влет в гущу боя
            AXE_SKILLS.axeThrow,       // Бросок махины во врага
            AXE_SKILLS.sweep           // Опрокидывание группы врагов
        ]
    },
    executionerAxe: {
        name: "Топор палача", // Оружие, созданное для одного идеального удара.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_AXE_SKILL,
        skills: [
            AXE_SKILLS.choppingStrike, // База
            AXE_SKILLS.execution,      // Казнь (усиление от дебаффов)
            AXE_SKILLS.cleave,         // Смертельные раны
            AXE_SKILLS.ironSwan,       // Точный удар по важной цели
            AXE_SKILLS.whirlwind       // Неотвратимая жатва
        ]
    }
};

export const sling = {
    // --- УРОВЕНЬ 1 (Простейшая самоделка) ---
    braidedSling: {
        name: "Плетеная праща", // Изготовлена из верёвок или сухожилий
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow, // База: урон от дистанции
            SLING_SKILLS.visualNoise,   // Защита через раскручивание
            SLING_SKILLS.sightingThrow  // Пристрелка
        ]
    },

    // --- УРОВЕНЬ 2 (Специализированные инструменты) ---
    huntersSling: {
        name: "Охотничий ремень", // Кожаная праща с хорошим захватом снаряда
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.whistlingBullet, // Испуг врагов свистом снаряда
            SLING_SKILLS.flail,           // Удар самой пращой как кистенем (ближний бой)
            SLING_SKILLS.sightingThrow,   // Навешивание уязвимости
            SLING_SKILLS.visualNoise      // Наложение блока
        ]
    },
    fustibalus: {
        name: "Фустибал", // Праща на посохе. Позволяет метать тяжелые снаряды.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.leadBullet,      // Ошеломляющий удар тяжелым камнем
            SLING_SKILLS.hail,            // Град мелких камней (АоЕ)
            SLING_SKILLS.flail,           // Посох фустибала — отличный кистень
            SLING_SKILLS.limeVessel       // Метание сосуда с известью
        ]
    },

    // --- УРОВЕНЬ 3 (Военное применение) ---
    balearicSling: {
        name: "Балеарская праща", // Профессиональное плетение для огромной скорости.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.straightThrow,   // Мощный прямой выстрел по защите
            SLING_SKILLS.leadBullet,      // Оглушающая пуля
            SLING_SKILLS.hail,            // Засыпание позиций врага
            SLING_SKILLS.whistlingBullet  // Психологическое давление
        ]
    },
    heavySling: {
        name: "Тяжёлый фустибал", // Тяжелая версия для метания зажигательных/хим. смесей.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,    // База
            SLING_SKILLS.limeVessel,       // Облако едкой извести по площади
            SLING_SKILLS.invigoratingRicochet, // Рикошет, помогающий союзникам
            SLING_SKILLS.leadBullet,        // Тяжелый снаряд
            SLING_SKILLS.straightThrow      // Сбивание защиты
        ]
    },

    // --- УРОВЕНЬ 4 (Вершина технологий подземелий) ---
    plumbataSling: {
        name: "Свинцовая праща", // Заточена под использование литых пуль.
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.straightThrow,   // Пробитие любых щитов
            SLING_SKILLS.invigoratingRicochet, // Мастерский рикошет от стен пещеры
            SLING_SKILLS.sightingThrow,   // Смертельная точность
            SLING_SKILLS.leadBullet       // Глухое ошеломление
        ]
    },
    experimentSling: {
        name: "Экспериментальный фустибал",
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_SLING_SKILL,
        skills: [
            SLING_SKILLS.overhandThrow,  // База
            SLING_SKILLS.hail,            // Заградительный огонь
            SLING_SKILLS.limeVessel,      // Хим. атака
            SLING_SKILLS.flail,           // Непредсказуемый ближний бой
            SLING_SKILLS.visualNoise      // Абсолютный контроль дистанции
        ]
    }
};

export const crossbow = {
    // --- УРОВЕНЬ 1 (Простейшее охотничье устройство) ---
    huntingCrossbow: {
        name: "Охотничий арбалет", // Простой деревянный арбалет
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,    // База: подготовка болтов
            CROSSBOW_SKILLS.aimedShot, // Прицельный выстрел
            CROSSBOW_SKILLS.duck       // Командное действие
        ]
    },

    // --- УРОВЕНЬ 2 (Механизированное оружие) ---
    lightCrossbow: {
        name: "Легкий арбалет", // Быстрый и мобильный
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.snapShot,      // Выстрел навскидку (мобильность)
            CROSSBOW_SKILLS.broadheadBolt, // Кровотечение
            CROSSBOW_SKILLS.duck,          // Поддержка передовой
            CROSSBOW_SKILLS.buttstroke     // Удар прикладом (ближний бой)
        ]
    },
    cranequinCrossbow: {
        name: "Арбалет с воротом", // Механика позволяет использовать тяжелые болты
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.aimedShot,     // Высокий урон
            CROSSBOW_SKILLS.heavyBolt,     // Отталкивание врага
            CROSSBOW_SKILLS.snapShot,      // Быстрая реакция
            CROSSBOW_SKILLS.broadheadBolt  // Охотничьи наконечники
        ]
    },

    // --- УРОВЕНЬ 3 (Военные образцы) ---
    heavyArbalest: {
        name: "Тяжелый арбалест", // Стальные дуги, огромная мощь
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,         // База
            CROSSBOW_SKILLS.aimedShot,      // Пробитие брони
            CROSSBOW_SKILLS.vulnerableSpot, // Огромный урон по метке
            CROSSBOW_SKILLS.heavyBolt,      // Мощный толчок
            CROSSBOW_SKILLS.buttstroke      // Самооборона вблизи
        ]
    },
    repeatingCrossbow: {
        name: "Многозарядный арбалет", // Чо-ко-ну. Упор на спец. болты и поддержку.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.fireBolt,      // Поджог (испуг)
            CROSSBOW_SKILLS.flareBolt,     // Сигнальный выстрел
            CROSSBOW_SKILLS.duck,          // Тактика
            CROSSBOW_SKILLS.broadheadBolt  // Осыпание градом болтов
        ]
    },

    // --- УРОВЕНЬ 4 (Шедевры инженеров недр) ---
    siegeArbalest: {
        name: "Осадный арбалест", // Огромная машина смерти
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,         // База
            CROSSBOW_SKILLS.vulnerableSpot, // Аннигиляция помеченной цели
            CROSSBOW_SKILLS.heavyBolt,      // Пролом рядов врага
            CROSSBOW_SKILLS.fireBolt,       // Огненный террор
            CROSSBOW_SKILLS.aimedShot       // Хирургическая точность
        ]
    },
    alchemistCrossbow: {
        name: "Алхимический арбалет", // Использует спец. боеприпасы
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_CROSSBOW_SKILL,
        skills: [
            CROSSBOW_SKILLS.reload,        // База
            CROSSBOW_SKILLS.flareBolt,     // Тактическое управление полем
            CROSSBOW_SKILLS.fireBolt,      // Алхимический огонь
            CROSSBOW_SKILLS.broadheadBolt, // Отравленные/зубчатые болты
            CROSSBOW_SKILLS.snapShot       // Скорость использования
        ]
    }
};

export const bow = {
    // --- УРОВЕНЬ 1 (Самоделка) ---
    simpleBow: {
        name: "Простой лук", // Гибкая палка и тетива
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База: метка цели
            BOW_SKILLS.shoulderStrike,  // Оборона вблизи
            BOW_SKILLS.brightFeathers   // Снятие провокации
        ]
    },

    // --- УРОВЕНЬ 2 (Специализированные луки) ---
    recurveBow: {
        name: "Рекурсивный лук", // Компактный и быстрый
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.lowShot,         // Контроль позиции врага
            BOW_SKILLS.overcastShot,    // Навес по тылам
            BOW_SKILLS.shoulderStrike,  // Самооборона
            BOW_SKILLS.doubleShot       // Скорострельность
        ]
    },
    reflexBow: {
        name: "Рефлексивный лук", // Сильный изгиб дает хлесткий выстрел
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.breathingPractices, // Подготовка/Ускорение
            BOW_SKILLS.brightFeathers,  // Тактика
            BOW_SKILLS.returnShot,      // Ответный выстрел
            BOW_SKILLS.doubleShot       // Двойной залп
        ]
    },

    // --- УРОВЕНЬ 3 (Военное снаряжение) ---
    compositeBow: {
        name: "Составной лук", // Рог, дерево и сухожилия. Большая мощь.
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.prickAndShot,    // Техничный выстрел с кровотоком
            BOW_SKILLS.lowShot,         // Опрокидывание
            BOW_SKILLS.overcastShot,    // Засыпание стрелами
            BOW_SKILLS.breathingPractices // Контроль дыхания
        ]
    },
    infantryBow: {
        name: "Пехотный лук", // Усиленный лук для затяжных стычек
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.rapidFire,       // Заградительный огонь
            BOW_SKILLS.returnShot,      // Контратака
            BOW_SKILLS.brightFeathers,  // Снятие таунтов
            BOW_SKILLS.shoulderStrike   // Рукопашная
        ]
    },

    // --- УРОВЕНЬ 4 (Вершины мастерства) ---
    yewLongbow: {
        name: "Тисовый длинный лук", // Огромная сила натяжения и дистанция
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.overcastShot,    // Траектория позволяет бить через ряды
            BOW_SKILLS.rapidFire,       // Легендарная скорость лонгбоуменов
            BOW_SKILLS.lowShot,         // Тяжелая стрела сбивает с ног
            BOW_SKILLS.prickAndShot     // Пробитие со спец. эффектом
        ]
    },
    asymmetricalLongBow: {
        name: "Ассиметричный длинный лук", // Асимметричный шедевр для медитативной стрельбы
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_BOW_SKILL,
        skills: [
            BOW_SKILLS.directShot,      // База
            BOW_SKILLS.doubleShot,      // Два идеальных выстрела
            BOW_SKILLS.breathingPractices, // Дзэн-концентрация
            BOW_SKILLS.returnShot,      // Мастерская реакция
            BOW_SKILLS.rapidFire        // Град стрел
        ]
    }
};

export const arquebus = {
    // --- УРОВЕНЬ 1 (Примитивное дульнозарядное) ---
    handGonne: {
        name: "Ручница", // Просто железная трубка на палке
        type: "weapon", level: 1, baseDamage: 10,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База: перезарядка
            ARQUEBUS_SKILLS.improvisedClub, // Использование как дубины вблизи
            ARQUEBUS_SKILLS.morePowder       // Рискованный выстрел "на все деньги"
        ]
    },

    // --- УРОВЕНЬ 2 (Стандартное вооружение) ---
    matchlockArquebus: {
        name: "Фитильная аркебуза", // Полноценный замок и ложе
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Прицельная стрельба
            ARQUEBUS_SKILLS.shotIntoAir,     // Психологическая атака (шум)
            ARQUEBUS_SKILLS.improvisedClub,  // Самооборона
            ARQUEBUS_SKILLS.spentPowder      // Дебафф пороховым дымом
        ]
    },
    blunderbuss: {
        name: "Мушкетон", // Короткий ствол с раструбом. Король тесных помещений.
        type: "weapon", level: 2, baseDamage: 15,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.buckshot,        // Главная фишка: картечь и кровоток
            ARQUEBUS_SKILLS.stayAway,        // Отбрасывание врага в упор
            ARQUEBUS_SKILLS.spentPowder,     // Огромное облако дыма
            ARQUEBUS_SKILLS.improvisedClub   // Мощный удар прикладом
        ]
    },

    // --- УРОВЕНЬ 3 (Тяжелые калибры) ---
    infantryMusket: {
        name: "Пехотный мушкет", // Длинный ствол, высокая убойность
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Сверхмощный выстрел
            ARQUEBUS_SKILLS.piercedArtery,   // Пробитие со специфической раной
            ARQUEBUS_SKILLS.shotIntoAir,     // Запугивание грохотом
            ARQUEBUS_SKILLS.piercingShot     // Выстрел навылет сквозь строй
        ]
    },
    wallGun: {
        name: "Гаковница", // Тяжелое ружье с крюком для зацепа за упор
        type: "weapon", level: 3, baseDamage: 20,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.stayAway,        // Огромная отдача раскидывает всех
            ARQUEBUS_SKILLS.morePowder,      // Максимальный риск оглушения
            ARQUEBUS_SKILLS.piercingShot,    // Прошибает цели в ряд
            ARQUEBUS_SKILLS.spentPowder      // Ослепление врага вспышкой
        ]
    },

    // --- УРОВЕНЬ 4 (Инженерное совершенство) ---
    masterCaliver: {
        name: "Мастерский каливер", // Облегченное, но невероятно точное ружье
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.frontRearSights, // Идеальный выстрел
            ARQUEBUS_SKILLS.piercedArtery,   // Хирургическое попадание
            ARQUEBUS_SKILLS.buckshot,        // Спец-заряды (картечь)
            ARQUEBUS_SKILLS.spentPowder      // Тактическое использование дыма
        ]
    },
    heavyMatchlock: {
        name: "Тяжелый аркебуз", // Максимальный калибр, который может поднять человек
        type: "weapon", level: 4, baseDamage: 25,
        defaultSkillData: DEFAULT_ARQUEBUS_SKILL,
        skills: [
            ARQUEBUS_SKILLS.reloadHelp,      // База
            ARQUEBUS_SKILLS.stayAway,        // Громоподобный выстрел с отбросом
            ARQUEBUS_SKILLS.piercingShot,    // Уничтожение всей колонны врага
            ARQUEBUS_SKILLS.morePowder,      // Выстрел на пределе возможностей
            ARQUEBUS_SKILLS.shotIntoAir      // Массовая паника врагов
        ]
    }
};