export const SWORD_SKILLS = {
    dupliren: { 
        id: 'dupliren', name: "Дуплирен", damageCoef: 0.6, hits: 2, 
        validPos: [1, 2], targetPos: [1, 2], desc: "2 удара" 
    },
    cleavingStrike: { 
        id: 'cleavingStrike', name: "Секущий удар", damageCoef: 0.6, hits: 1, 
        validPos: [1, 2, 3], targetPos: [1, 2], effect: "Кровотечение", desc: "ДОТ" 
    },
    wideSwing: { 
        id: 'wideSwing', name: "Широкий размах", damageCoef: 0.7, hits: 1, isAoE: true, 
        validPos: [1, 2], targetPos: [1, 2], desc: "Бьет двоих спереди" 
    },
    thrust: {
        id: 'thrust', name: "Укол", damageCoef: 1.0, hits: 1,
        validPos: [1, 2, 3], targetPos: [1, 2, 3], effect: "Игнор брони", desc: "Игнорирует броню"
    },
    feint: {
        id: 'feint', name: "Финт", damageCoef: 0.9, hits: 1,
        validPos: [1, 2], targetPos: [1, 2], effect: "Игнор уклонения", desc: "Снимает уклонение"
    },
    pommelStrike: {
        id: 'pommelStrike', name: "Удар эфесом", damageCoef: 0.7, hits: 1,
        validPos: [1, 2], targetPos: [1, 2], effect: "Ошеломление", desc: "Накладывает ошеломление"
    },
    flatStrike: {
        id: 'flatStrike', name: "Удар плашмя", damageCoef: 0.7, hits: 1,
        validPos: [1, 2], targetPos: [1, 2], effect: "Слабость", desc: "Ослабляет врага"
    },
    mordhau: {
        id: 'mordhau', name: "Мордхау", damageCoef: 1.3, hits: 1,
        validPos: [4, 3], targetPos: [1, 2], 
        moveSelf: -1, moveTarget: 2, // Сам прыгает на 1 вперед (-1), врага толкает на 2 назад (+2)
        desc: "Толкает врага, прыжок вперед"
    },
    bladeGrab: {
        id: 'bladeGrab', name: "Захват клинка", damageCoef: 1.1, hits: 1,
        validPos: [1, 2], targetPos: [1, 2], effect: "Метка, Снятие паррирования", desc: "Контроль врага"
    },
    versetzen: {
        id: 'versetzen', name: "Ферзеццен", damageCoef: 0, hits: 0,
        validPos: [2, 3, 4], targetPos: [1, 2, 3, 4], // Цель не важна, применяется на себя
        targetSelf: true, moveSelf: -1, effect: "Паррирование (2)", desc: "Защитная стойка"
    }
};