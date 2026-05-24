import { EFFECTS } from './effects.js';

export const ENEMY_SKILLS = {
    frittaAttack: {
        id: 'frittaAttack',
        name: "Атака роя",
        type: 'melee',
        validPos: [1, 2, 3], 
        targetPos: [1, 2],
        damageCoef: 0.3, 
        moveSelf: -1,
        description: "Фритты наскакивают на жертву."
    },
    
    glassMeleeBasic: {
        id: 'glassMeleeBasic', name: "Укус", type: 'melee',
        validPos: [1, 2], targetPos: [1, 2], damageCoef: 0.8
    },
    glassMeleeEnhanced: {
        id: 'glassMeleeEnhanced', name: "Жвало", type: 'melee',
        validPos: [1, 2], targetPos: [1, 2], damageCoef: 1.0, isAoE: true
    },
    glassRangedBasic: {
        id: 'glassRangedBasic', name: "Плевок осколком", type: 'ranged',
        validPos: [3, 4], targetPos: [3, 4], damageCoef: 0.6
    },
    glassRangedEnhanced: {
        id: 'glassRangedEnhanced', name: "Град осколков", type: 'ranged',
        validPos: [3, 4], targetPos: [3, 4], damageCoef: 0.8, isAoE: true
    },
    glassWeb: {
        id: 'glassWeb', name: "Электро-паутина", type: 'ranged',
        validPos: [2, 3, 4], targetPos: [1, 2, 3, 4], damageCoef: 0, effect: 'electroWeb-1'
    },
    glassFeedSelf: {
        id: 'glassFeedSelf', name: "Поглощение", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0
    },
    glassFeedAlly: {
        id: 'glassFeedAlly', name: "Подпитка", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: [1, 2, 3, 4], targetAlly: true, damageCoef: 0
    },
    glassGrowMites: {
        id: 'glassGrowMites', name: "Забота о клещах", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: [0], damageCoef: 0
    },


    amalgamBleed: {
        id: 'amalgamBleed', name: "Рваная рана", type: 'melee',
        validPos: [1, 2], targetPos: [3, 4], damageCoef: 0.4, moveSelf: 1, effect: 'dot-3-2'
    },
    amalgamWound: {
        id: 'amalgamWound', name: "Вскрытие", type: 'melee',
        validPos: [1, 2], targetPos: [3, 4], damageCoef: 0.6, moveSelf: 1, effect: 'aGapingWound-2'
    },
    amalgamDash: {
        id: 'amalgamDash', name: "Рывок", type: 'melee',
        validPos: [2, 3, 4], targetPos: [1, 2], damageCoef: 1.0, moveSelf: -3
    },
    amalgamHeavyDash: {
        id: 'amalgamHeavyDash', name: "Тяжелый прыжок", type: 'melee',
        validPos: [2, 3, 4], targetPos: [1, 2], damageCoef: 1.4, moveSelf: -3
    },
    amalgamFeedSelf: {
        id: 'amalgamFeedSelf', name: "Поглощение", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0
    },


    vitrailMeleeBasic: {
        id: 'vitrailMeleeBasic', name: "Взмах стеклом", type: 'melee',
        validPos: [1, 2], targetPos: [1, 2], damageCoef: 0.8, isAoE: true
    },
    vitrailMeleeEnhanced: {
        id: 'vitrailMeleeEnhanced', name: "Дрожь недр", type: 'melee',
        validPos: [1, 2], targetPos: [1, 2, 3, 4], damageCoef: 0.6, isAoE: true, effect: 'instability-1'
    },
    vitrailChargeBasic: {
        id: 'vitrailChargeBasic', name: "Таран", type: 'melee',
        validPos: [3, 4], targetPos: [1], damageCoef: 1.2, moveTarget: 3, moveSelf: -3
    },
    vitrailChargeEnhanced: {
        id: 'vitrailChargeEnhanced', name: "Пролом строя", type: 'melee',
        validPos: [3, 4], targetPos: [1], damageCoef: 1.4, moveTarget: 3, moveSelf: -3, effect: 'stun-1'
    },
    vitrailRetreat: {
        id: 'vitrailRetreat', name: "Взятие разгона", type: 'buff',
        validPos: [1, 2], targetPos: null, targetSelf: true, damageCoef: 0, moveSelf: 2, effect: 'block-1, combo-1'
    },
    vitrailStealCombo: {
        id: 'vitrailStealCombo', name: "Похищение заряда", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0
    },

    motherMelee: {
        id: 'motherMelee', name: "Раздавливание", type: 'melee',
        validPos: [1, 2], targetPos: [1, 2], damageCoef: 1.0, isAoE: true, moveTarget: 1, moveSelf: 1 
    },
    motherRanged: {
        id: 'motherRanged', name: "Осколочный плевок", type: 'ranged',
        validPos: [3, 4], targetPos: [3, 4], damageCoef: 1.2, moveSelf: -1 
    },
    motherSurge: {
        id: 'motherSurge', name: "Подпитка", type: 'buff',
        validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0, effect: 'combo-3'
    },
    motherVoltage: {
        id: 'motherVoltage', name: "Перепад напряжения", type: 'ranged',
        validPos: [1, 2, 3, 4], targetPos: [1, 2, 3, 4], damageCoef: 0, isAoE: true 
    },
    motherSpawnFritta: { id: 'motherSpawnFritta', name: "Отливка: Фритты", type: 'buff', validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0 },
    motherSpawnGlass: { id: 'motherSpawnGlass', name: "Отливка: Стеклянного паука", type: 'buff', validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0 },
    motherSpawnAmalgam: { id: 'motherSpawnAmalgam', name: "Отливка: Амальгама", type: 'buff', validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0 },
    motherSpawnVitrail: { id: 'motherSpawnVitrail', name: "Отливка: Витраж", type: 'buff', validPos: [1, 2, 3, 4], targetPos: null, targetSelf: true, damageCoef: 0 },
};