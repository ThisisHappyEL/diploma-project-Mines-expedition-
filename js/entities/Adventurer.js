import { Unit } from './Unit.js';
import { BACKGROUNDS } from '../data/backgrounds.js';
import { SWORD_SKILLS } from '../data/weaponSkills/swordSkills.js'

const BASE_HP = 40;

function getSkillByLevel(skillBase, weaponLevel, defaultData) {
    const levelKey = `level${weaponLevel}`;
    const levelData = skillBase[levelKey] || {};
    
    return { ...defaultData, ...skillBase, ...levelData };
}

export class Adventurer extends Unit {
    constructor(name, backgroundKey, posIdx) {
        const bg = BACKGROUNDS[backgroundKey];
        
        super({ name, side: 'player', posIdx, hp: BASE_HP, maxHp: BASE_HP });
        
        this.background = backgroundKey;
        this.level = 1;
        this.exp = 0;

        this.baseStats = { ...bg.stats };
        
        this.traits = [];
        this.equipment = { leftHand: null, rightHand: null, body: null };

        this.recalculateMaxHp();
        this.hp = this.maxHp; 
    }

    recalculateMaxHp() {
        let bonusHp = 0;

        if (this.baseStats.hp) bonusHp += this.baseStats.hp;

        this.traits.forEach(trait => {
            if (trait.effect && trait.effect.hp) bonusHp += trait.effect.hp;
        });

        Object.values(this.equipment).forEach(item => {
            if (item && item.bonuses && item.bonuses.hp) {
                bonusHp += item.bonuses.hp;
            }
        });

        this.maxHp = BASE_HP + bonusHp;

        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    get stats() {
        let finalStats = { ...this.baseStats };
        this.traits.forEach(trait => {
            for (let s in trait.effect) {
                if (finalStats[s] !== undefined && s !== 'hp') finalStats[s] += trait.effect[s];
            }
        });
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
        this.recalculateMaxHp();
    }

    getAvailableSkills() {
        const weapon = this.equipment.rightHand;
        if (!weapon || !weapon.skills) return [];

        const weaponLevel = weapon.level || 1;
        const DEFAULT = weapon.defaultSkillData || {};

        return weapon.skills
            .filter(skillBase => weaponLevel >= (skillBase.fromLevel || 1))
            .map(skillBase => {
                const levelData = skillBase[`level${weaponLevel}`] || {};
                const mergedSkill = { 
                    ...DEFAULT, 
                    ...skillBase, 
                    ...levelData 
                };

                for (let i = 1; i <= 4; i++) delete mergedSkill[`level${i}`];

                return mergedSkill;
            });
    }
}