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

    get combatStat() {
        return this.stats.battle; // Теперь берет Бой с учетом одежды и черт
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
        if (armor) {
            const b = armor.stats || armor.levels?.[this.level] || armor.effect || {};
            if (b.battle) s.battle += b.battle;
            if (b.atkArmor) s.atkArmor += b.atkArmor;
            if (b.defArmor) s.defArmor += b.defArmor;
        }
        return s;
    }

    recalculateMaxHp() {
        let bonus = 0;
        this.traits.forEach(t => { if (t.effect?.hp) bonus += t.effect.hp; });
        const armor = this.equipment.body || this.civilBody;
        const b = armor?.stats || armor?.levels?.[this.level] || armor?.effect;
        if (b?.hp) bonus += b.hp;
        this.maxHp = (Number(this.baseStats.hp) || 40) + bonus;
    }

    recalculateMaxStamina() {
        let bonus = 0;
        this.traits.forEach(t => { if (t.effect?.stamina) bonus += t.effect.stamina; });
        const armor = this.equipment.body || this.civilBody;
        const b = armor?.stats || armor?.levels?.[this.level] || armor?.effect;
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
        const armor = this.equipment.body || this.civilBody;
        const b = armor?.stats || armor?.levels?.[this.level] || armor?.effect;
        if (b?.battle) gB += b.battle;
        return { base, tB, gB, total: base + tB + gB };
    }

    getTooltipHTML() {
        const bd = this.getStatBreakdown();
        let bonusStr = `(${bd.base}`;
        if (bd.tB !== 0) bonusStr += `<span style="color:#4affab">${bd.tB > 0 ? '+' : ''}${bd.tB}</span>`;
        if (bd.gB !== 0) bonusStr += `<span style="color:#ff7f50">${bd.gB > 0 ? '+' : ''}${bd.gB}</span>`;
        bonusStr += `)`;
        return `
            <div class="unit-card-mini" style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:32px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 4px;">ПОГРУЖЕНЕЦ</div>
                <div style="position:relative; z-index:1;">
                    <h3 style="margin:0; color:#fff; font-size: 20px;">${this.name.toUpperCase()}</h3>
                    <div style="font-size:12px; color:#ffbf00; margin-top:2px;">${this.background} | <span style="color:#4affab">${this.traits[0]?.name || 'Без черт'}</span></div>
                    <div class="tt-divider"></div>
                    <div class="tt-stats-row">
                        <div style="color:#ff6666; font-weight:bold; font-size:18px;">❤️ ${Math.floor(this.hp)}<small style="font-size:10px; color:#666;">/${this.maxHp}</small></div>
                        <div style="font-size:18px; color:#ffbf00; font-weight:bold; border-left:1px solid #444; border-right:1px solid #444;">⚔️ ${bd.total} <br><small style="font-size:10px; color:#888;">${bonusStr}</small></div>
                        <div style="color:#66ff88; font-weight:bold; font-size:18px;">💨 ${Math.floor(this.stamina)}<small style="font-size:10px; color:#666;">/${this.maxStamina}</small></div>
                    </div>
                </div>
            </div>`;
    }

    getEquipmentHTML() {
        const weapon = this.equipment.rightHand;
        const armor = this.equipment.body || this.civilBody;
        const offhand = this.equipment.leftHand;
        const b = armor?.stats || armor?.levels?.[this.level] || armor?.effect || {};
        const bd = this.getStatBreakdown();

        return `
            <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:32px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 4px;">СНАРЯЖЕНИЕ</div>
                <div style="position:relative; z-index:1; height:100%;">
                    <div class="tt-equip-grid">
                        <div class="tt-equip-col">
                            <div class="tt-equip-header">Оружие</div>
                            <div class="tt-equip-name" style="color:#4affab">${weapon ? weapon.name : 'Нет'}</div>
                            ${weapon ? `<div class="tt-equip-stat">Ур. ${weapon.level}</div><div class="tt-equip-stat">Урон оружия: ${weapon.baseDamage}</div>` : ''}
                        </div>
                        <div class="tt-equip-col">
                            <div class="tt-equip-header">Одежда</div>
                            <div class="tt-equip-name" style="color:#ff7f50">${armor ? armor.name : 'Лохмотья'}</div>
                            ${b.hp || b.stamina || bd.gB || b.atkArmor || b.defArmor ? `
                                ${b.hp ? `<div class="tt-equip-stat" style="color:#ff6666">Здоровье: +${b.hp}</div>` : ''}
                                ${b.stamina ? `<div class="tt-equip-stat" style="color:#66ff88">Выносливость: +${b.stamina}</div>` : ''}
                                ${bd.gB ? `<div class="tt-equip-stat" style="color:#ffbf00">Бой: +${bd.gB}</div>` : ''}
                                ${b.atkArmor ? `<div class="tt-equip-stat" style="color:#4affab">Шанс атаки: +${b.atkArmor}</div>` : ''}
                                ${b.defArmor ? `<div class="tt-equip-stat" style="color:#ff7f50">Шанс защиты: +${b.defArmor}</div>` : ''}
                            ` : `<div class="tt-equip-stat" style="color:#666; font-style:italic;">Нет боевых бонусов</div>`}
                        </div>
                        <div class="tt-equip-col">
                            <div class="tt-equip-header">Всп. Оружие</div>
                            <div class="tt-equip-name" style="color:#aaa">${offhand ? offhand.name : 'Пусто'}</div>
                            ${!offhand ? `<div class="tt-equip-stat" style="color:#4affab">Урон x1.3</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
    }
}