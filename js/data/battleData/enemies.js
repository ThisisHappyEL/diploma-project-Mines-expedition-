export const GLASS_FOREST_ENEMIES = {
    piezoCrystal: {
        id: 'piezoCrystal', name: "Пьезокристалл",
        hp: 40, combat: 0,
        isEnvironment: true,
        spriteUrl: 'assets/img/enemies/piezo.png',
        spriteVariations: 9, 
        scale: 0.4,
        skills: [],
        lore: "Огромная глыба кварца, накапливающего электричество, генерируемого тектоническими процессами.",
        tactics: "База местной пищевой цепочки. Привлекает к себе кремниевых клещей, которых после поедают многолапы покрупнее.\nДабы не давать копить врагам заряд, можно сбивать с него клещей, но с другой стороны эти маленькие батарейки довольно ценные..."
    },
    fritta: {
        id: 'fritta', name: "Фритта",
        hp: 8, maxHp: 8, combat: 3, maxCombo: 0,
        spriteUrl: 'assets/img/enemies/fritta.png',
        spriteVariations: 12, 
        scale: 0.275,
        skills: ['frittaAttack'],
        lore: "Рой мелких паучков, занимающихся сбором полезного для репродукции сырья.",
        tactics: "Назойливые малыши, которые бездумно прыгают в атаку.\nИз-за их количества наносимый им и ими вред увеличен, но за удар больше одной особи разбить не получится."
    },
    glassSpider: {
        id: 'glassSpider', name: "Стеклянный паук",
        hp: 36, maxHp: 40, combat: 6, maxCombo: 2,
        spriteUrl: 'assets/img/enemies/glassSpider.png',
        spriteVariations: 10, 
        scale: 0.315,
        skills: ['glassMelee', 'glassCleave', 'glassRanged', 'glassWeb', 'glassBuffSelf', 'glassBuffAlly', 'glassCare'],
        lore: "«Рабочая лошадка». Проводит токопроводящую паутину от пьезокристаллов для подпитки своей матушки.",
        tactics: "Универсальный рабочий, который в качестве приоритета подкармливает более сильных сородичей заряженными кремниевыми клещами с ближайшего пьезокристалла.\nПри отсутствии таковой возможности уплетает их сам и пытается укокошить нарушителей покоя с помощью своей токопроводящей паутины."
    },
    amalgamSpider: {
        id: 'amalgamSpider', name: "Паук-амальгама",
        hp: 36, maxHp: 26, combat: 9, maxCombo: 2,
        spriteUrl: 'assets/img/enemies/amalgam.png',
        spriteVariations: 12, 
        scale: 0.265,
        skills: ['amalgamBleed', 'amalgamWound', 'amalgamDash', 'amalgamHeavyDash', 'amalgamFeedSelf'],
        lore: "Разведчик, наблюдатель и незаметный убийца. Сливается с окружающей местностью.",
        tactics: "Бесшумный вытянутый ужас. Способен подкрасться и сделать стрижку зазевавшемуся шахтёру.\nПока по его структурам бегает ток, сливается с местностью, становясь неуловимым."
    },
    vitrailSpider: {
        id: 'vitrailSpider', name: "Паук-витраж",
        hp: 60, maxHp: 60, combat: 12, maxCombo: 4,
        spriteUrl: 'assets/img/enemies/vitrail.png',
        spriteVariations: 12, 
        scale: 0.325,
        skills: ['vitrailMeleeBasic', 'vitrailMeleeEnhanced', 'vitrailChargeBasic', 'vitrailChargeEnhanced', 'vitrailRetreat', 'vitrailStealCombo'],
        lore: "Стеклянный бегемот, по металлическим прожилкам которого пробегают молнии.",
        tactics: "Неповоротливая махина, разрушающая строй врага и сминающая нарушителей покоя своей тушей.\nЗа счёт использования в конструкции дефицитных для биома цветных металлов куда лучше хранит в себе ток и способен генерировать его самостоятельно, делясь им с соседями, или забирая всё себе."
    },
    glassMother: {
        id: 'glassMother', name: "Мать стеклороя",
        hp: 120, maxHp: 120, combat: 15, isBoss: true, maxCombo: 8,
        isBoss: true,
        spriteUrl: 'assets/img/enemies/mother.png',
        spriteVariations: 11, 
        scale: 0.35, 
        skills: ['motherMelee', 'motherRanged', 'motherSurge', 'motherVoltage', 'motherSpawnFritta', 'motherSpawnGlass', 'motherSpawnAmalgam', 'motherSpawnVitrail'],
        lore: "Живая стеклоплавильная печь, будучи потревоженной, производит новый выводок в невероятные темпы.",
        tactics: "Родоначальница всего выводка кварцевых пауков.\nБудучи потревоженной в ускоренном темпе производит себе во вред новых особей, впрочем трудолюбивые фритты охотно закинут в неё оставшееся от их тушек сырьё обратно.\nКрайне опасна при накоплении избыточного тока."
    }
};

export const GLASS_FOREST_ENCOUNTERS = {
    easy_1: {
        env: null,
        units: ['fritta', 'fritta', 'fritta', null]
    },
    easy_2: {
        env: 'piezoCrystal',
        units: ['fritta', 'glassSpider', null, null]
    },
    easy_3: {
        env: null,
        units: ['glassSpider', 'glassSpider', null, null]
    },
    
    medium_1: {
        env: 'piezoCrystal',
        units: ['fritta', 'fritta', 'glassSpider', 'glassSpider']
    },
    medium_2: {
        env: null,
        units: ['fritta', 'glassSpider', 'glassSpider', 'glassSpider']
    },
    medium_3: {
        env: null,
        units: ['fritta', 'amalgamSpider', 'amalgamSpider', null]
    },
    medium_4: {
        env: 'piezoCrystal',
        units: ['fritta', 'fritta', 'glassSpider', 'amalgamSpider']
    },
    medium_4: {
        env: 'piezoCrystal',
        units: ['glassSpider', 'glassSpider', 'glassSpider', 'glassSpider']
    },
    hard_1: {
        env: null,
        units: ['vitrailSpider', 'amalgamSpider', null, null]
    },
    hard_2: {
        env: 'piezoCrystal',
        units: ['vitrailSpider', 'glassSpider', 'amalgamSpider', 'amalgamSpider']
    },
    hard_3: {
        env: 'piezoCrystal',
        units: ['glassSpider', 'glassSpider', 'amalgamSpider', 'amalgamSpider']
    },
    hard_4: {
        env: null,
        units: ['vitrailSpider', 'fritta', 'vitrailSpider', 'fritta']
    },
    hard_5: {
        env: 'piezoCrystal',
        units: ['amalgamSpider', 'glassSpider', 'amalgamSpider', 'glassSpider']
    },
    boss_mother: {
        env: 'piezoCrystal',
        units: ['amalgamSpider', 'fritta', 'glassSpider', 'glassMother']
    },
    boss_mother_2: {
        env: 'piezoCrystal',
        units: ['glassMother', 'glassMother', 'glassSpider', 'amalgamSpider']
    },
    boss_mother_3: {
        env: null,
        units: ['vitrailSpider', 'glassSpider', 'glassMother', 'amalgamSpider']
    },
};