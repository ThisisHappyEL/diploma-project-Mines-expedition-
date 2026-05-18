import { EFFECTS } from './effects.js';

export const ENEMY_SKILLS = {
    // === НАВЫКИ ФРИТТЫ ===
    frittaAttack: {
        id: 'frittaAttack',
        name: "Атака роя",
        type: 'melee',
        validPos: [1, 2], // Доступна только с передовой
        targetPos: [1, 2],
        damageCoef: 1.0, 
        // По твоей таблице: урон зависит от кол-ва фритт, но пока мы сделаем стандартный,
        // а потом пропишем уникальный скейлинг через SkillLogic (эффект Роя)
        description: "Группа фритт набрасывается на цель."
    },
    
    // Сюда будем добавлять навыки остальных пауков...
};