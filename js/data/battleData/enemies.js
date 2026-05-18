export const GLASS_FOREST_ENEMIES = {
    piezoCrystal: {
        id: 'piezoCrystal', name: "Пьезокристалл",
        hp: 40, combat: 0,
        isEnvironment: true,
        spriteUrl: 'assets/img/enemies/piezo.png',
        spriteVariations: 9, 
        scale: 0.4,
        skills: [] 
    },
    fritta: {
        id: 'fritta', name: "Фритта",
        hp: 4, combat: 2,
        spriteUrl: 'assets/img/enemies/fritta.png',
        spriteVariations: 12, 
        scale: 0.125,
        skills: ['frittaAttack']
    },
    glassSpider: {
        id: 'glassSpider', name: "Стеклянный паук",
        hp: 14, combat: 3,
        spriteUrl: 'assets/img/enemies/glassSpider.png',
        spriteVariations: 7, 
        scale: 0.175,
        skills: ['glassMelee', 'glassCleave', 'glassRanged', 'glassWeb', 'glassBuffSelf', 'glassBuffAlly', 'glassCare']
    },
    amalgamSpider: {
        id: 'amalgamSpider', name: "Паук-амальгама",
        hp: 10, combat: 5,
        spriteUrl: 'assets/img/enemies/amalgam.png',
        spriteVariations: 12, 
        scale: 0.25,
        skills: ['amalgamBleed', 'amalgamWound', 'amalgamDash', 'amalgamHeavyDash', 'amalgamBuff']
    },
    vitrailSpider: {
        id: 'vitrailSpider', name: "Паук-витраж",
        hp: 28, combat: 8,
        spriteUrl: 'assets/img/enemies/vitrail.png',
        spriteVariations: 12, 
        scale: 0.25,
        skills: ['vitrailCleave', 'vitrailQuake', 'vitrailCharge', 'vitrailHeavyCharge', 'vitrailBlock', 'vitrailSteal']
    },
    glassMother: {
        id: 'glassMother', name: "Мать стеклороя",
        hp: 60, combat: 6,
        isBoss: true,
        spriteUrl: 'assets/img/enemies/mother.png',
        spriteVariations: 11, 
        scale: 0.3, 
        skills: ['motherMelee', 'motherRanged', 'motherSpawnFritta', 'motherSpawnGlass', 'motherSpawnAmalgam', 'motherSpawnVitrail', 'motherCharge']
    }
};

// СИСТЕМА ПРЕДУСТАНОВЛЕННЫХ ГРУПП
// Позиции врагов заполняются справа налево: Индекс 0 = Позиция 1 (впереди), Индекс 3 = Позиция 4 (сзади)
// env - элемент ландшафта (встанет на нулевую позицию между командами)
export const GLASS_FOREST_ENCOUNTERS = {
    // Легкие группы (Разведка)
    easy_1: {
        env: 'piezoCrystal',
        units: ['fritta', 'fritta', 'fritta', 'fritta'] // Толпа мелочи
    },
    easy_2: {
        env: null,
        units: ['fritta', 'fritta', 'glassSpider', null] // 2 фритты спереди, паук сзади
    },
    
    // Средние группы (Бой)
    medium_1: {
        env: 'piezoCrystal',
        units: ['fritta', 'glassSpider', 'glassSpider', null]
    },
    medium_2: {
        env: null,
        units: ['glassSpider', 'glassSpider', 'amalgamSpider', null] // Амальгама сзади
    },

    // Тяжелые группы (Элита)
    hard_1: {
        env: 'piezoCrystal',
        units: ['vitrailSpider', 'glassSpider', 'amalgamSpider', null] // Витраж танкует
    },

    // Босс
    boss_mother: {
        env: 'piezoCrystal',
        units: ['fritta', 'fritta', 'glassSpider', 'glassMother'] // Мать сзади (занимает 4 позицию, но модельку потом сделаем большой)
    },

    demo_1: {
        env: 'piezoCrystal',
        units: ['fritta', 'glassSpider', 'amalgamSpider', 'vitrailSpider']
    },

    demo_2: {
        env: 'piezoCrystal',
        units: ['glassMother', null, null, null]
    },
};