import { EFFECTS } from '../../templates/effects.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnIndex = 0;
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('log-panel');
        this.state = 'IDLE'; // IDLE, SELECT_TARGET, SELECT_MOVE, EXECUTING
    }

    log(msg) {
        this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    getActiveUnit() {
        return this.units[this.turnIndex];
    }

    startBattle() {
        this.log("Бой начинается!");
        this.startTurn();
    }

    startTurn() {
        let active = this.getActiveUnit();
        if (active.isDead) { this.nextTurn(); return; }

        if (active.hasEffect('stun')) {
            this.log(`${active.name.toUpperCase()} ОГЛУШЕН!`);
            active.removeEffect('stun');
            window.spawnDamageText("ПРОПУСК ХОДА", active.x, active.y - 60, "#aaa");
            setTimeout(() => this.nextTurn(), 1000);
            return;
        }

        const bleedStacks = active.activeEffects.filter(e => e.id === 'bleed').length;
        if (bleedStacks > 0) {
            const totalBleedDmg = bleedStacks * 2;
            active.takeDamage(totalBleedDmg);
            window.spawnDamageText(`-${totalBleedDmg}`, active.x + 20, active.y - 20, '#ff6666');
            this.log(`${active.name} кровоточит: -${totalBleedDmg}`);
        }
        
        active.tickEffects();

        this.log(`--- ХОД: ${active.name.toUpperCase()} ---`);
        this.state = 'IDLE';
        this.selectedSkill = null;

        this.uiCallback(active, active.side === 'player' ? active.getAvailableSkills() : [], this);

        if (active.side === 'enemy') {
            setTimeout(() => this.enemyTurn(active), 1000);
        }
    }

    selectMoveAction() {
        if (this.state === 'SELECT_MOVE') return;
        
        this.state = 'SELECT_MOVE';
        this.selectedSkill = null;
        this.log("Выберите союзника для смены позиции.");
        
        const active = this.getActiveUnit();
        this.uiCallback(active, active.getAvailableSkills(), this);
    }

    selectSkill(skill) {
        let active = this.getActiveUnit();
        
        if (this.selectedSkill?.id === skill.id && this.state === 'SELECT_TARGET') return;

        this.selectedSkill = skill;
        
        if (skill.targetSelf) {
            this.log(`${active.name} применяет ${skill.name} на себя.`);
            this.executeSkill(active, active);
            return;
        }

        this.state = 'SELECT_TARGET';
        this.log(`Выбран навык: ${skill.name}. Выберите цель!`);
        
        this.uiCallback(active, active.getAvailableSkills(), this);
    }

    handleCanvasClick(targetUnit) {
        let active = this.getActiveUnit();
        if (this.state === 'SELECT_TARGET' && this.selectedSkill) {
            if (!this.selectedSkill.targetPos.includes(targetUnit.posIdx) || targetUnit.side === active.side) return;
            this.executeSkill(active, targetUnit);
        } 
        else if (this.state === 'SELECT_MOVE') {
            if (targetUnit.side !== active.side || targetUnit === active) return;
            this.performBasicMove(targetUnit);
        }
    }

    executeSkill(attacker, target) {
        this.state = 'EXECUTING';
        this.uiCallback(attacker, [], this);

        let skill = { ...this.selectedSkill };
        let baseDmg = attacker.equipment?.rightHand?.baseDamage || 10;

        if (target.hasEffect('mark') && skill.comboOrMarkImproveable && skill.comboChanges) {
            this.log(`[СИНЕРГИЯ] Уязвимость цели использована!`);
            Object.assign(skill, skill.comboChanges);
            target.removeEffect('mark'); 
        }

        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 

        let finalDmg = Math.round(baseDmg * skill.damageCoef);

        if (target.hasEffect('dodge') && !skill.effect?.includes('ignorEvasion')) {
            target.removeEffect('dodge');
            this.log(`${target.name} уклонился!`);
            setTimeout(() => this.finalizeSkill(attacker, target, skill), 800);
            return;
        }

        if (attacker.hasEffect('weakness')) {
            finalDmg = Math.floor(finalDmg * 0.5);
            attacker.removeEffect('weakness');
        }
        if (attacker.hasEffect('power')) {
            finalDmg = Math.floor(finalDmg * 2.0);
            attacker.removeEffect('power');
        }

        if (target.hasEffect('vulnerable')) {
            finalDmg = Math.floor(finalDmg * 2.0);
            target.removeEffect('vulnerable');
        }
        if (target.hasEffect('block') && !skill.effect?.includes('ignorArmor')) {
            finalDmg = Math.floor(finalDmg * 0.5);
            target.removeEffect('block');
        }

        let hitsCount = skill.hits || 1;
        if (skill.damageCoef === 0) hitsCount = 1;

        for (let i = 0; i < hitsCount; i++) {
            setTimeout(() => {
                if (skill.damageCoef > 0) {
                    target.takeDamage(finalDmg);
                    window.spawnDamageText(`-${finalDmg}`, target.x + 20 + (i*10), target.y - 20 - (i*10), '#ff4444');
                } else if (skill.targetSelf && i === 0) {
                    window.spawnDamageText(`+${skill.name.toUpperCase()}`, attacker.x, attacker.y - 40, '#4affab');
                }

                if (i === hitsCount - 1) {
                    if (skill.effect) this.applySkillEffects(target, skill.effect);
                    this.checkParrying(attacker, target, skill);
                    setTimeout(() => this.finalizeSkill(attacker, target, skill), 600);
                }
            }, i * 250);
        }
    }

    checkParrying(attacker, target, skill) {
        if (target.hasEffect('parry') && !skill.effect?.includes('ignorParrying') && attacker !== target) {
            target.removeEffect('parry');
            this.log(`[Паррирование!] Ответный удар!`);
            let counterDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(counterDmg);
            window.spawnDamageText(`-${counterDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
        }
    }

    applySkillEffects(target, effectString) {
        const effectParts = effectString.split(',').map(s => s.trim());
        effectParts.forEach(part => {
            const [effectId, countStr] = part.split('-');
            const count = parseInt(countStr) || 1;
            const effectKey = effectId.toUpperCase();
            
            if (effectId === 'DOT') {
                target.addEffect(EFFECTS.BLEED, count);
                this.log(`[Эффект] ${target.name} начинает кровоточить (${count})`);
            } else if (EFFECTS[effectKey]) {
                target.addEffect(EFFECTS[effectKey], count);
                this.log(`[Эффект] ${target.name}: ${EFFECTS[effectKey].name} (${count})`);
            }
        });
    }

    finalizeSkill(attacker, target, skill) {
        if (skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill.moveTarget && target !== attacker) this.moveUnit(target, skill.moveTarget);
        this.state = 'IDLE';
        this.nextTurn();
    }

    performBasicMove(targetAlly) {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        let active = this.getActiveUnit();
        let oldPos = active.posIdx;
        active.posIdx = targetAlly.posIdx;
        targetAlly.posIdx = oldPos;
        this.log(`${active.name} поменялся местами с ${targetAlly.name}`);
        setTimeout(() => this.nextTurn(), 600);
    }

    moveUnit(unit, offset) {
        let newPos = Math.max(1, Math.min(4, unit.posIdx + offset));
        if (newPos !== unit.posIdx) {
            let occupier = this.units.find(u => u.side === unit.side && u.posIdx === newPos && !u.isDead);
            if (occupier) occupier.posIdx = unit.posIdx;
            unit.posIdx = newPos;
        }
    }

    autoShiftUnits() {
        ['player', 'enemy'].forEach(side => {
            let alive = this.units.filter(u => u.side === side && !u.isDead).sort((a, b) => a.posIdx - b.posIdx);
            alive.forEach((u, i) => u.posIdx = i + 1);
        });
    }

    enemyTurn(enemy) {
        this.state = 'EXECUTING';
        let skill = enemy.skills[0]; 
        enemy.offsetX = -30; 
        let target = this.units.find(u => u.side === 'player' && !u.isDead);
        if (target) {
            target.takeDamage(skill.damage);
            window.spawnDamageText(`-${skill.damage}`, target.x + 20, target.y - 20, '#ff4444');
            this.log(`${enemy.name} атакует ${target.name}`);
        }
        setTimeout(() => this.nextTurn(), 1000);
    }

    nextTurn() {
        this.autoShiftUnits();
        this.turnIndex = (this.turnIndex + 1) % this.units.length;
        this.startTurn();
    }
}