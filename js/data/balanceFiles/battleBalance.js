export const BATTLE_BALANCE = {
    autobattleDurationSec: 15.0,
    basePlayerCP: 3,
    baseEnemyThreatCP: 3,
    moveCostCP: 1,
    baseMoveRange: 1,
    agileTraits: ['Быстрый', 'Шустрый', 'Ловкий'],
    skillCostCP: 1,

    // Восстановление и расход стамины в реальном времени
    staminaRegenPerSec: 3.5,
    autoAttackStaminaCost: 4,
    skillFallbackStaminaCost: 8,

    // Распределение урона при нескольких целях в волне автоатаки (массовый / пробивной / универсальный)
    multiTargetDamageScale: {
        1: 1.0,
        2: 0.72,
        3: 0.55,
        4: 0.45
    },

    // Безоружный бой (Кулаки)
    fists: {
        id: 'fists',
        name: 'Кулаки',
        category: 'fists',
        baseDamage: 4,
        attackIntervalSec: 1.8,
        staminaCost: 2,
        rangeClass: 'melee',
        patternShape: 'point'
    },

    // Интервалы автоатак и дефолтные паттерны по категориям оружия
    weaponCategories: {
        swords:     { attackIntervalSec: 2.6, rangeClass: 'melee',  patternShape: 'cleave',    staminaCost: 4 },
        axes:       { attackIntervalSec: 3.4, rangeClass: 'melee',  patternShape: 'cleave',    staminaCost: 6 },
        hammers:    { attackIntervalSec: 4.1, rangeClass: 'melee',  patternShape: 'point',     staminaCost: 7 },
        spears:     { attackIntervalSec: 2.1, rangeClass: 'medium', patternShape: 'pierce',    staminaCost: 4 },
        bows:       { attackIntervalSec: 2.8, rangeClass: 'ranged', patternShape: 'point',     staminaCost: 5 },
        slings:     { attackIntervalSec: 3.2, rangeClass: 'ranged', patternShape: 'point',     staminaCost: 4 },
        crossbows:  { attackIntervalSec: 6.2, rangeClass: 'ranged', patternShape: 'pierce',    staminaCost: 5 },
        arquebuses: { attackIntervalSec: 9.5, rangeClass: 'ranged', patternShape: 'universal', staminaCost: 6 }
    },

    // Профили врагов (Стеклянный лес)
    enemyProfiles: {
        fritta:        { attackIntervalSec: 2.2, rangeClass: 'melee',  patternShape: 'point',     preferredDepth: 0 },
        vitrailSpider: { attackIntervalSec: 3.8, rangeClass: 'melee',  patternShape: 'cleave',    preferredDepth: 0 },
        amalgamSpider: { attackIntervalSec: 2.7, rangeClass: 'medium', patternShape: 'pierce',    preferredDepth: 1 },
        glassSpider:   { attackIntervalSec: 3.1, rangeClass: 'ranged', patternShape: 'point',     preferredDepth: 1 },
        glassMother:   { attackIntervalSec: 4.5, rangeClass: 'ranged', patternShape: 'universal', preferredDepth: 2 },
        piezoCrystal:  { attackIntervalSec: 999, rangeClass: 'melee',  patternShape: 'point',     preferredDepth: 2 }
    },

    // Координаты 3x3 на канвасе 1920x1080
    gridLayout: {
        playerColsX: [230, 470, 710],   // Тыл (0), Центр (1), Фронт (2)
        enemyColsX: [1210, 1450, 1690], // Фронт (0), Центр (1), Тыл (2)
        lanesY: [330, 535, 740]         // Верх (0), Центр (1), Низ (2)
    }
};
