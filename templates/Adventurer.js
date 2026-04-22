import { Unit } from './Unit.js';
import { BACKGROUNDS } from './backgrounds.js';

// ТА САМАЯ ГРАНИТНАЯ БАЗА
const BASE_HP = 40;

export class Adventurer extends Unit {
    constructor(name, backgroundKey, posIdx) {
        const bg = BACKGROUNDS[backgroundKey];
        
        // Временно создаем бойца с голой базой (40 ХП)
        super({ name, side: 'player', posIdx, hp: BASE_HP, maxHp: BASE_HP });
        
        this.background = backgroundKey;
        this.level = 1;
        this.exp = 0;

        // Базовые статы от предыстории (тут лежат +5 ХП от шахтёра и т.д.)
        this.baseStats = { ...bg.stats };
        
        this.traits = [];
        this.equipment = { leftHand: null, rightHand: null, body: null };

        // Пересчитываем здоровье с учетом бонусов предыстории и лечим до полного
        this.recalculateMaxHp();
        this.hp = this.maxHp; 
    }

    // Функция пересчета максимального здоровья
    recalculateMaxHp() {
        let bonusHp = 0;

        // 1. Модификатор от предыстории
        if (this.baseStats.hp) bonusHp += this.baseStats.hp;

        // 2. Модификаторы от черт (Traits)
        this.traits.forEach(trait => {
            if (trait.effect && trait.effect.hp) bonusHp += trait.effect.hp;
        });

        // 3. Модификаторы от снаряжения (например, брони)
        Object.values(this.equipment).forEach(item => {
            if (item && item.bonuses && item.bonuses.hp) {
                bonusHp += item.bonuses.hp;
            }
        });

        // Итоговое максимальное здоровье: База (40) + Все бонусы
        this.maxHp = BASE_HP + bonusHp;

        // Убеждаемся, что текущее здоровье не превышает новый максимум
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    get stats() {
        let finalStats = { ...this.baseStats };
        // Применяем черты
        this.traits.forEach(trait => {
            for (let s in trait.effect) {
                if (finalStats[s] !== undefined && s !== 'hp') finalStats[s] += trait.effect[s];
            }
        });
        // Применяем экипировку
        Object.values(this.equipment).forEach(item => {
            if (item && item.bonuses) {
                for (let s in item.bonuses) {
                    if (finalStats[s] !== undefined && s !== 'hp') finalStats[s] += item.bonuses[s];
                }
            }
        });
        return finalStats;
    }

    equip(slot, item) {
        this.equipment[slot] = item;
        // Пересчитываем ХП, так как мы могли надеть броню, дающую +20 ХП
        this.recalculateMaxHp();
    }

    getAvailableSkills() {
        if (this.equipment.rightHand && this.equipment.rightHand.skills) {
            return this.equipment.rightHand.skills;
        }
        return [];
    }
}