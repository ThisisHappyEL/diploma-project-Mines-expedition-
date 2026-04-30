import { EFFECTS } from '../data/effects.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnQueue = []; 
        this.baseInitiativeMap = new Map();
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('log-panel');
        this.state = 'IDLE'; 
    }

    log(msg) {
        if (!this.logPanel) return;
        this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    getActiveUnit() { return this.turnQueue[0] || null; }

    startBattle() {
        this.log("БОЙ НАЧИНАЕТСЯ!");
        this.generateTurnQueue(); 
        this.startTurn();
    }

    generateTurnQueue() {
        let aliveUnits = this.units.filter(u => !u.isDead);
        let initList = aliveUnits.map(u => {
            let roll = Math.floor(Math.random() * 5) + 1; 
            let initScore = u.combatStat + roll;
            this.baseInitiativeMap.set(u, initScore);
            return { unit: u, score: initScore };
        });
        this.sortQueue(initList);
        this.log("=== НОВЫЙ РАУНД ===");
    }

    sortQueue(initList = null) {
        if (!initList) {
            initList = this.turnQueue.map(u => ({ unit: u, score: this.baseInitiativeMap.get(u) || 5 }));
        }
        initList.forEach(item => {
            if (item.unit.hasEffect('speed')) item.score += 5;
            if (item.unit.hasEffect('daze')) item.score -= 5;
        });
        initList.sort((a, b) => b.score - a.score);
        this.turnQueue = initList.map(item => item.unit);
    }

    updateQueueInitiative() {
        if (this.turnQueue.length === 0) return;
        let active = this.turnQueue.shift();
        this.sortQueue();
        this.turnQueue.unshift(active);
    }

    startTurn() {
        let active = this.getActiveUnit();
        if (!active) { this.generateTurnQueue(); active = this.getActiveUnit(); if (!active) return; }
        if (active.isDead) { this.nextTurn(); return; }

        this.state = 'EXECUTING';

        if (active.hasEffect('inWeb')) {
            this.log(`${active.name} вырывается из сетей!`);
            active.removeEffect('inWeb');
            active.addEffect(EFFECTS.SPEED, 1);
            setTimeout(() => this.nextTurn(), 1000); return;
        }

        if (active.hasEffect('fear')) {
            this.log(`${active.name} в панике атакует и отступает!`);
            active.modifyEffect('fear', -1);
            let target = this.units.find(u => u.side !== active.side && !u.isDead && u.posIdx === 1);
            if (target) {
                target.takeDamage(5);
                window.spawnDamageText("-5", target.x + 20, target.y - 20, "#ff4444");
            }
            this.moveUnit(active, 2);
            setTimeout(() => this.nextTurn(), 1000); return;
        }

        if (active.hasEffect('stun')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} ПРОПУСКАЕТ ХОД (ОГЛУШЕНИЕ).</span>`);
            
            active.modifyEffect('stun', -1); 
            
            window.spawnDamageText("ПРОПУСК", active.x, active.y - 60, "#aaa");
            
            setTimeout(() => {
                this.turnQueue.shift();
                this.state = 'IDLE';
                this.startTurn();
            }, 1000); 
            return;
        }

        let bleed = active.getEffect('bleed');
        if (bleed) {
            let dmg = bleed.damagePerTurn || 2;
            active.takeDamage(dmg);
            window.spawnDamageText(`-${dmg}`, active.x + 20, active.y - 20, '#ff6666');
            this.log(`${active.name} кровоточит (-${dmg})`);
        }

        this.log(`--- ХОД: ${active.name.toUpperCase()} ---`);
        this.state = 'IDLE';
        this.selectedSkill = null;

        this.uiCallback(active, active.side === 'player' ? active.getAvailableSkills() : [], this);
        if (active.side === 'enemy') setTimeout(() => this.enemyTurn(active), 1000);
    }

    selectSkill(skill) {
        let active = this.getActiveUnit();
        if (this.selectedSkill?.id === skill.id && this.state === 'SELECT_TARGET') return;
        this.selectedSkill = skill;
        if (skill.targetSelf) this.executeSkill(active, active);
        else {
            this.state = 'SELECT_TARGET';
            this.uiCallback(active, active.getAvailableSkills(), this);
        }
    }

    selectMoveAction() {
        if (this.state === 'SELECT_MOVE') return;
        this.state = 'SELECT_MOVE'; this.selectedSkill = null;
        this.uiCallback(this.getActiveUnit(), this.getActiveUnit().getAvailableSkills(), this);
    }

    handleCanvasClick(targetUnit) {
        if (this.state === 'EXECUTING') return;
        let active = this.getActiveUnit();
        if (this.state === 'SELECT_TARGET' && this.selectedSkill) {
            let skill = this.selectedSkill;
            if (skill.targetAlly && targetUnit.side !== active.side) return; 
            if (!skill.targetAlly && targetUnit.side === active.side) return; 
            if (skill.targetPos && !skill.targetPos.includes(targetUnit.posIdx)) return;
            this.executeSkill(active, targetUnit);
        } 
        else if (this.state === 'SELECT_MOVE') {
            if (targetUnit.side !== active.side || targetUnit === active) return;
            if (Math.abs(active.posIdx - targetUnit.posIdx) > 1) { this.log("Только на соседнюю позицию!"); return; }
            this.performBasicMove(targetUnit);
        }
    }

    executeSkill(attacker, primaryTarget) {
        this.state = 'EXECUTING';
        this.uiCallback(attacker, [], this);
        let skill = { ...this.selectedSkill };
        let baseDmg = attacker.equipment?.rightHand?.baseDamage || 10;

        if (!skill.targetAlly && !skill.targetSelf && primaryTarget.hasEffect('underProtection')) {
            let protector = this.units.find(u => u.side === primaryTarget.side && u.hasEffect('protection') && !u.isDead);
            if (protector) { primaryTarget = protector; this.log(`[Защита] Удар принят на себя!`); }
        }

        if (primaryTarget.hasEffect('mark') && skill.comboOrMarkImproveable && skill.comboChanges) {
            Object.assign(skill, skill.comboChanges);
            primaryTarget.modifyEffect('mark', -1); 
            this.log(`[СИНЕРГИЯ] Уязвимость цели использована!`);
        }

        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 

        let targets = skill.targetSelf ? [attacker] : (skill.isAoE ? this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx)) : [primaryTarget]);
        let hitsCount = (skill.damageCoef === 0) ? 1 : (skill.hits || 1);

        for (let i = 0; i < hitsCount; i++) {
            setTimeout(() => {
                targets.forEach(target => {
                    if (target.isDead) return;

                    if (skill.damageCoef === 0 && (skill.targetSelf || skill.targetAlly)) {
                        if (i === 0) window.spawnDamageText(`+БАФФ`, target.x, target.y - 40, '#4affab');
                        if (i === hitsCount - 1) {
                            if (skill.effect) this.applySkillEffects(target, skill.effect, false, false);
                        }
                        return;
                    }

                    if (target.hasEffect('dodge') && !skill.effect?.includes('ignorEvasion')) {
                        target.modifyEffect('dodge', -1);
                        window.spawnDamageText("УВОРОТ", target.x + 10, target.y - 40, "#fff");
                        return;
                    }

                    let luckMod = 1.0; let dmgColor = '#ffffff'; 
                    let isLucky = false; let isUnlucky = false;
                    let atkR = Math.floor(Math.random() * 5) + 1; 
                    let defR = Math.floor(Math.random() * 5) + 1; 
                    let aStat = attacker.combatStat; let dStat = target.combatStat;
                    
                    let aMods = ""; let dLogs = "";
                    if (attacker.hasEffect('speed')) { aStat += 2; aMods += " <span style='color:#4affab'>+2(Уск)</span>"; }
                    if (attacker.hasEffect('daze')) { aStat -= 2; aMods += " <span style='color:#ff4444'>-2(Ошел)</span>"; }
                    if (target.hasEffect('speed')) { dStat += 2; dLogs += " <span style='color:#4affab'>+2(Уск)</span>"; }
                    if (target.hasEffect('daze')) { dStat -= 2; dLogs += " <span style='color:#ff4444'>-2(Ошел)</span>"; }

                    let atkTotal = aStat + atkR;
                    let defTotal = dStat + defR;
                    let diff = atkTotal - defTotal;
                    
                    let combatLog = `⚔️ [${attacker.name}](${attacker.combatStat}${aMods} + 🎲${atkR}=<b>${atkTotal}</b>) vs [${target.name}](${target.combatStat}${dLogs} + 🎲${defR}=<b>${defTotal}</b>). Разница: ${diff}.`;

                    if (diff >= 10) { luckMod = 2.0; isLucky = true; this.log(`${combatLog} <span style="color:#ff00ff">КРИТ!</span>`); }
                    else if (diff > 5) { luckMod = 1.5; isLucky = true; this.log(`${combatLog} <span style="color:#4affab">УДАЧНО!</span>`); }
                    else if (diff < -5) { luckMod = 0.5; isUnlucky = true; this.log(`${combatLog} <span style="color:#ff4444">ПЛОХО.</span>`); }
                    else { this.log(`${combatLog} <span style="color:#aaa">ОБЫЧНЫЙ.</span>`); }

                    let finalDmg = Math.floor(baseDmg * skill.damageCoef * luckMod);

                    if (attacker.hasEffect('weakness')) { finalDmg = Math.floor(finalDmg * 0.5); attacker.modifyEffect('weakness', -1); }
                    if (attacker.hasEffect('power')) { finalDmg = Math.floor(finalDmg * 1.5); attacker.modifyEffect('power', -1); }
                    if (target.hasEffect('vulnerable')) { finalDmg = Math.floor(finalDmg * 1.5); }
                    if (target.hasEffect('block') && !skill.effect?.includes('ignorArmor')) { finalDmg = Math.floor(finalDmg * 0.5); target.modifyEffect('block', -1); }

                    if (finalDmg > 0) {
                        target.takeDamage(finalDmg);
                        window.spawnDamageText(`-${finalDmg}`, target.x + 20 + ((Math.random()*20)-10), target.y - 20 - (i*15), dmgColor);
                        target.tickEffectsByTrigger('hitReceived');
                        attacker.tickEffectsByTrigger('hitGiven');
                        
                        if (target.hasEffect('aGapingWound')) {
                            target.modifyEffect('aGapingWound', -1);
                            target.addEffect(EFFECTS.BLEED, 1, { duration: 3, damagePerTurn: 2 });
                        }
                    }

                    if (i === hitsCount - 1) {
                        if (skill.effect) this.applySkillEffects(target, skill.effect, isLucky, isUnlucky);
                        this.checkParrying(attacker, target, skill);
                    }
                });

                if (i === hitsCount - 1) {
                    setTimeout(() => this.finalizeSkill(attacker, primaryTarget, skill), 500);
                }
            }, i * 300);
        }
    }

    checkParrying(attacker, target, skill) {
        if (target.hasEffect('parry') && !skill.effect?.includes('ignorParrying') && attacker !== target && !skill.targetAlly) {
            target.modifyEffect('parry', -1);
            this.log(`[Контратака!]`);
            let cDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(cDmg);
            window.spawnDamageText(`-${cDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
        }
    }

    applySkillEffects(target, effectString, isLucky, isUnlucky) {
        const ALIASES = { 'DOT': 'BLEED', 'FRAGILE': 'VULNERABLE', 'PARRYING': 'PARRY' };
        effectString.split(',').forEach(part => {
            const params = part.trim().split('-');
            let id = params[0].toUpperCase();
            if (ALIASES[id]) id = ALIASES[id];
            const val = parseInt(params[1]) || 1;
            
            if (id === 'BLEED') {
                let dur = 3; if (isLucky) dur = 4; if (isUnlucky) dur = 2;
                target.addEffect(EFFECTS.BLEED, 1, { duration: dur, damagePerTurn: val });
            } else if (EFFECTS[id]) {
                target.addEffect(EFFECTS[id], val);
                if (id === 'DAZE' || id === 'SPEED') this.updateQueueInitiative();
            }
        });
    }

    finalizeSkill(attacker, primaryTarget, skill) {
        if (skill && skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill && skill.moveTarget && primaryTarget !== attacker) this.moveUnit(primaryTarget, skill.moveTarget);
        
        if (attacker.hasEffect('courage')) {
            attacker.removeEffect('courage');
            this.turnQueue.unshift(attacker);
            this.log(`${attacker.name} действует снова!`);
        }
        this.nextTurn();
    }

    performBasicMove(targetAlly) {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        this.shiftUnits(this.getActiveUnit(), targetAlly.posIdx);
        setTimeout(() => this.nextTurn(), 600);
    }

    moveUnit(unit, offset) {
        let newPos = Math.max(1, Math.min(4, unit.posIdx + offset));
        if (newPos !== unit.posIdx) {
            let enemyCheck = this.units.find(u => u.side !== unit.side && u.hasEffect('noOneStepFurther') && offset < 0 && !u.isDead);
            if (enemyCheck) {
                unit.takeDamage(5);
                window.spawnDamageText("-5", unit.x + 20, unit.y - 20, '#ffbb00');
            }
            this.shiftUnits(unit, newPos);
        }
    }

    shiftUnits(movingUnit, targetPos) {
        const side = movingUnit.side;
        const oldPos = movingUnit.posIdx;
        let allies = this.units.filter(u => u.side === side && !u.isDead);
        if (oldPos < targetPos) allies.forEach(u => { if (u !== movingUnit && u.posIdx > oldPos && u.posIdx <= targetPos) u.posIdx -= 1; });
        else if (oldPos > targetPos) allies.forEach(u => { if (u !== movingUnit && u.posIdx >= targetPos && u.posIdx < oldPos) u.posIdx += 1; });
        movingUnit.posIdx = targetPos;
    }

    autoShiftUnits() {
        ['player', 'enemy'].forEach(side => {
            let alive = this.units.filter(u => u.side === side && !u.isDead).sort((a, b) => a.posIdx - b.posIdx);
            alive.forEach((u, i) => u.posIdx = i + 1);
        });
    }

    enemyTurn(enemy) {
        if (enemy.isDead) { this.nextTurn(); return; }
        this.state = 'EXECUTING';
        enemy.offsetX = -40; 
        let target = this.units.find(u => u.side === 'player' && !u.isDead && (!enemy.hasEffect('taunt') || u.hasEffect('taunt')));
        if (!target) target = this.units.find(u => u.side === 'player' && !u.isDead);
        if (target) {
            this.selectedSkill = (enemy.skills && enemy.skills.length > 0) ? enemy.skills[0] : { name: "Укус", damageCoef: 0.5 };
            this.executeSkill(enemy, target);
        } else { setTimeout(() => this.nextTurn(), 1000); }
    }

    nextTurn() {
        let active = this.getActiveUnit();
        if (active && !active.isDead) active.tickEffectsByTrigger('turnEnd');
        this.autoShiftUnits();
        this.turnQueue.shift();
        this.state = 'IDLE';
        
        const players = this.units.filter(u => u.side === 'player' && !u.isDead).length;
        const enemies = this.units.filter(u => u.side === 'enemy' && !u.isDead).length;
        if (players === 0 || enemies === 0) { this.log(players === 0 ? "ПОРАЖЕНИЕ..." : "ПОБЕДА!"); return; }
        this.startTurn();
    }
}