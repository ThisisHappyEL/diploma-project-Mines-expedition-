import { Unit } from './Unit.js';
import { BACKGROUNDS } from '../data/workersData/backgrounds.js';

export class Adventurer extends Unit {
    constructor(data, posIdx) {
        super({ 
            name: data.name, side: 'player', posIdx: posIdx, 
            hp: data.hp, maxHp: data.maxHp,
            stamina: data.stamina, maxStamina: data.maxStamina,
            combat: Number(data.combat || data.pureStats?.battle) || 5 
        });
        
        this.background = data.background || "Неизвестно";
        this.level = data.level || 1;
        this.traits = data.traits || [];
        this.civilBody = data.civilBody;
        this.baseStats = data.pureStats ? { ...data.pureStats } : { battle: 5, stamina: 100, hp: 40 };
        this.equipment = data.equipment ? { ...data.equipment } : { leftHand: null, rightHand: null, body: null };

        this.recalculateMaxHp();
        this.recalculateMaxStamina();
    }

    get stats() {
        let base = Number(this.baseStats.battle || 5);
        let s = { battle: base, atkArmor: 0, defArmor: 0 };
        this.traits.forEach(t => {
            if (t.effect) {
                if (t.effect.battle) s.battle += t.effect.battle;
                if (t.effect.atkArmor) s.atkArmor += t.effect.atkArmor;
                if (t.effect.defArmor) s.defArmor += t.effect.defArmor;
            }
        });
        const armor = this.equipment.body || this.civilBody;
        if (armor && (armor.stats || armor.bonuses)) {
            const b = armor.stats || armor.bonuses;
            if (b.battle) s.battle += b.battle;
            if (b.atkArmor) s.atkArmor += b.atkArmor;
            if (b.defArmor) s.defArmor += b.defArmor;
        }
        return s;
    }

    recalculateMaxHp() {
        let bonus = 0;
        this.traits.forEach(t => { if (t.effect?.hp) bonus += t.effect.hp; });
        const b = (this.equipment.body || this.civilBody)?.stats || (this.equipment.body || this.civilBody)?.bonuses;
        if (b?.hp) bonus += b.hp;
        this.maxHp = (Number(this.baseStats.hp) || 40) + bonus;
    }

    recalculateMaxStamina() {
        let bonus = 0;
        this.traits.forEach(t => { if (t.effect?.stamina) bonus += t.effect.stamina; });
        const b = (this.equipment.body || this.civilBody)?.stats || (this.equipment.body || this.civilBody)?.bonuses;
        if (b?.stamina) bonus += b.stamina;
        this.maxStamina = (Number(this.baseStats.stamina) || 100) + bonus;
    }

    equip(slot, item) {
        this.equipment[slot] = item;
        this.recalculateMaxHp();
        this.recalculateMaxStamina();
    }

    getAvailableSkills() {
        const weapon = this.equipment.rightHand;
        if (!weapon || !weapon.skills) return [];
        const weaponLevel = Number(weapon.level) || 1;
        const DEFAULT = weapon.defaultSkillData || {};
        return weapon.skills.filter(s => weaponLevel >= (s.fromLevel || 1)).map(s => {
            const merged = { ...DEFAULT, ...s, ...(s[`level${weaponLevel}`] || {}) };
            for (let i = 1; i <= 4; i++) delete merged[`level${i}`];
            return merged;
        });
    }

    getStatBreakdown() {
        let base = Number(this.baseStats.battle || 5);
        let tB = 0, gB = 0;
        this.traits.forEach(t => { if (t.effect?.battle) tB += t.effect.battle; });
        const b = (this.equipment.body || this.civilBody)?.stats || (this.equipment.body || this.civilBody)?.bonuses;
        if (b?.battle) gB += b.battle;
        return { base, tB, gB, total: base + tB + gB };
    }

    getTooltipHTML() {
        const bd = this.getStatBreakdown();
        const weapon = this.equipment.rightHand;
        const armor = this.equipment.body || this.civilBody;
        let bonusStr = `(${bd.base}`;
        if (bd.tB !== 0) bonusStr += `<span style="color:#4affab">${bd.tB > 0 ? '+' : ''}${bd.tB}</span>`;
        if (bd.gB !== 0) bonusStr += `<span style="color:#ff7f50">${bd.gB > 0 ? '+' : ''}${bd.gB}</span>`;
        bonusStr += `)`;
        return `
            <div class="unit-card-mini">
                <h3 style="margin:0; color:#fff;">${this.name.toUpperCase()}</h3>
                <div style="font-size:12px; color:#ffbf00; margin-top:2px;">${this.background} | <span style="color:#4affab">${this.traits[0]?.name || 'Без черт'}</span></div>
                <div class="tt-divider"></div>
                <div style="text-align:center;">
                    <div style="font-size:18px; color:#ffbf00; font-weight:bold;">⚔️ Бой: ${bd.total} <small style="font-size:11px; color:#888;">${bonusStr}</small></div>
                    <div style="display:flex; justify-content:space-around; margin-top:8px; font-weight:bold;">
                        <span style="color:#ff6666">❤️ ${Math.floor(this.hp)}/${this.maxHp}</span>
                        <span style="color:#66ff88">💨 ${Math.floor(this.stamina)}/${this.maxStamina}</span>
                    </div>
                </div>
                <div class="tt-divider"></div>
                <div style="font-size: 11px; line-height: 1.4;">
                    <div style="color:#4affab">⚔️ ${weapon ? `${weapon.name} [Ур.${weapon.level}] (Урн:${weapon.baseDamage})` : 'Без оружия'}</div>
                    <div style="color:#ff7f50">🛡️ ${armor ? armor.name : 'Лохмотья'}</div>
                </div>
            </div>`;
    }
}