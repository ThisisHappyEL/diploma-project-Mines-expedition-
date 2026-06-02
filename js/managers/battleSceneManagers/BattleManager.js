import { EFFECTS } from '../../data/battleData/effects.js';
import { SkillLogic } from './SkillLogic.js';
import { EnemyAILogic } from './EnemyAILogic.js';
import { GameState } from '../../core/GameState.js';
import { ExpeditionManager } from '../ExpeditionManagers/ExpeditionManager.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { BattleLootManager } from './BattleLootManager.js';
import { BattleDamageCalculator } from './BattleDamageCalculator.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnQueue = []; 
        this.baseInitiativeMap = new Map();
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('b-log-container');
        this.state = 'IDLE'; 
        this.round = 1;
    }

    log(msg) {
        if (this.logPanel) this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    getActiveUnit() { return this.turnQueue[0] || null; }

    syncVitalsToGameState() {
        this.units.forEach(u => {
            if (u.side === 'player') {
                const s = GameState.currentSquad.find(s => s && (s.id === u.id || s.name === u.name));
                if (s) {
                    s.hp = u.hp; s.stamina = u.stamina;
                    s.minExpeditionHp = Math.min(s.minExpeditionHp ?? u.hp, u.hp);
                    s.minExpeditionStamina = Math.min(s.minExpeditionStamina ?? u.stamina, u.stamina);
                }
            }
        });
    }

    startBattle() { 
        this.log("БОЙ НАЧИНАЕТСЯ!"); 
        this.units.forEach(u => {
            let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt',
                             'frontRearSights', 'buckshot', 'shotIntoAir', 'piercedArtery', 'piercingShot', 'stayAway'];
            if (u.side === 'player' && u.equipment?.rightHand?.skills?.some(s => needsAmmo.includes(s.id))) {
                let enemies = this.units.filter(e => e.side !== u.side);
                let dStat = enemies.length > 0 ? Number(enemies.reduce((p, c) => p.combatStat > c.combatStat ? p : c).combatStat) : 0;
                let diff = (Number(u.combatStat) + (u.stats?.atkArmor || 0) + 3) - (dStat + 3); 
                let ammo = diff >= 10 ? 3 : (diff >= 5 ? 2 : (diff <= -5 ? 0 : 1));
                if (ammo > 0) u.addEffect(EFFECTS.AMMO, ammo);
            }
        });
        let crystal = this.units.find(u => u.isEnvironment);
        let spiders = this.units.filter(u => u.name.includes("Стеклянный паук") || u.id === 'glassSpider').length;
        if (crystal && spiders > 0) {
            crystal.addEffect(EFFECTS.MITES, spiders);
            this.log(`[ПАССИВНО] Пауки увеличивают популяцию клещей на старте (+${spiders})!`);
        }
        this.generateTurnQueue(); this.syncVitalsToGameState(); this.startTurn(); 
    }

    generateTurnQueue() {
        let crystal = this.units.find(u => u.isEnvironment && !u.isDead);
        if (this.round > 1 && crystal) {
            let mites = crystal.getEffect('mites');
            let growth = !mites ? 1 : (mites.count > 5 ? 4 : (mites.count >= 3 ? 3 : 2));
            crystal.addEffect(EFFECTS.MITES, growth);
            this.log(`[ПЬЕЗОКРИСТАЛЛ] Популяция клещей растет (+${growth})!`);
        }
        let initList = this.units.filter(u => !u.isDead && !u.isEnvironment).map(u => {
            let score = u.combatStat + Math.floor(Math.random() * 5) + 1;
            this.baseInitiativeMap.set(u, score);
            return { unit: u, score };
        });
        this.sortQueue(initList);
        const rL = document.getElementById('b-turn-display');
        if (rL) rL.innerText = `РАУНД ${this.round}`;
        this.log(`=== РАУНД ${this.round} ===`); this.round++;
    }

    sortQueue(initList = null) {
        if (!initList) initList = this.turnQueue.map(u => ({ unit: u, score: this.baseInitiativeMap.get(u) || 10 }));
        initList.forEach(item => {
            if (item.unit.hasEffect('speed')) item.score += 1000;
            if (item.unit.hasEffect('daze')) item.score -= 1000;
        });
        initList.sort((a, b) => b.score - a.score);
        this.turnQueue = initList.map(item => item.unit);
    }

    updateQueueInitiative() {
        if (this.turnQueue.length === 0) return;
        let active = this.turnQueue.shift(); this.sortQueue(); this.turnQueue.unshift(active);
    }

    startTurn() {
        let active = this.getActiveUnit();
        if (!active) { this.generateTurnQueue(); active = this.getActiveUnit(); if (!active) return; }
        if (active.isDead) { this.nextTurn(); return; }
        this.state = 'EXECUTING';

        if (active.hasEffect('electroWeb')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} бьется в электро-паутине! ПРОПУСК ХОДА.</span>`);
            let dmg = Math.round(10 * 0.6); active.takeDamage(dmg);
            window.spawnDamageText(`-${dmg} (ШОК)`, active.x, active.y - 60, "#ffbf00");
            this.syncVitalsToGameState();
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 1200); return;
        }
        if (active.hasEffect('rapidFire')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} обеспечивает прикрытие.</span>`);
            setTimeout(() => this.nextTurn(), 600); return;
        }
        if (active.hasEffect('stun')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} ПРОПУСКАЕТ ХОД.</span>`);
            active.modifyEffect('stun', -1); window.spawnDamageText("ПРОПУСК", active.x, active.y - 60, "#aaa");
            this.syncVitalsToGameState();
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 800); return;
        }
        if (active.hasEffect('fear')) {
            this.log(`<span style="color:#b19cd9">[ИСПУГ] ${active.name.toUpperCase()} в панике отступает!</span>`);
            active.modifyEffect('fear', -1); this.moveUnit(active, 2); this.syncVitalsToGameState();
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 800); return;
        }

        let isWebCC = active.activeEffects.some(e => ['stun', 'daze', 'inWeb', 'electroWeb'].includes(e.base.id));
        if ((active.name.includes("Паук-амальгама") || active.id === 'amalgamSpider') && active.hasEffect('combo') && !isWebCC) {
            active.addEffect(EFFECTS.DODGE, 1); window.spawnDamageText("УКЛОНЕНИЕ (+1)", active.x, active.y - 40, "#fff");
            this.log(`[ЛОВКОСТЬ] ${active.name} сливается с окружением!`);
        }
        if ((active.name.includes("Паук-витраж") || active.id === 'vitrailSpider') && (active.getEffect('combo')?.count || 0) > 0) {
            let armor = active.getEffect('combo').count * 2; active.addEffect(EFFECTS.ARMOR, armor);
            window.spawnDamageText(`БРОНЯ (+${armor})`, active.x, active.y - 40, "#fff");
            this.log(`[МЕТАЛЛ] Заряд уплотняет оловянные швы ${active.name}!`);
        }

        let dot = active.getEffect('dot');
        if (dot) {
            let dmg = dot.damagePerTurn || 2; active.takeDamage(dmg);
            window.spawnDamageText(`-${dmg} (КРОВЬ)`, active.x + 20, active.y - 20, '#ff4444');
            this.log(`${active.name} кровоточит (-${dmg})`);
            if ((dot.duration -= 1) <= 0) active.activeEffects = active.activeEffects.filter(e => e.base.id !== 'dot');
            this.syncVitalsToGameState();
            if (active.isDead) { this.triggerMotherDeathPassive(active); this.nextTurn(); return; }
        }
        if (active.isDead) { this.nextTurn(); return; }
        
        this.log(`--- ХОД: ${active.name.toUpperCase()} ---`); this.state = 'IDLE'; this.selectedSkill = null;
        this.uiCallback(active, active.side === 'player' ? active.getAvailableSkills() : [], this);
        if (active.side === 'enemy') setTimeout(() => this.enemyTurn(active), 1000);
    }

    selectSkill(skill) {
        let active = this.getActiveUnit();
        if (this.selectedSkill?.id === skill.id && this.state === 'SELECT_TARGET') return;
        this.selectedSkill = skill; this.state = 'SELECT_TARGET';
        this.uiCallback(active, active.getAvailableSkills(), this);
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
            if (skill.targetSelf && targetUnit !== active) return; 
            if (!skill.targetSelf && !skill.targetAny) {
                if (skill.targetAlly && targetUnit.side !== active.side) return; 
                if (!skill.targetAlly && targetUnit.side === active.side) return; 
            }
            if ((skill.targetSelf || skill.targetAny || (skill.targetPos && skill.targetPos.includes(targetUnit.posIdx))) || (targetUnit.isEnvironment && skill.damageCoef > 0)) {
                this.executeSkill(active, targetUnit);
            }
        } else if (this.state === 'SELECT_MOVE' && targetUnit.side === active.side && targetUnit !== active && Math.abs(active.posIdx - targetUnit.posIdx) === 1) {
            this.performBasicMove(targetUnit);
        }
    }

    executeSkill(attacker, primaryTarget) {
        this.state = 'EXECUTING'; this.uiCallback(attacker, [], this);
        let skill = { ...this.selectedSkill };
        let baseDmg = attacker.side === 'player' ? (attacker.equipment?.rightHand?.baseDamage || 10) : 10;
        let effectiveBase = (attacker.side === 'player' && attacker.equipment?.leftHand === null) ? Math.round(baseDmg * 1.3) : baseDmg;

        SkillLogic.applyPreStrikeModifiers(this, attacker, primaryTarget, skill, effectiveBase);

        if ((primaryTarget.hasEffect('mark') || attacker.hasEffect('combo')) && skill.comboOrMarkImproveable && skill.comboChanges) {
            Object.assign(skill, skill.comboChanges);
            if (primaryTarget.hasEffect('mark')) primaryTarget.modifyEffect('mark', -1); 
            if (attacker.hasEffect('combo')) attacker.modifyEffect('combo', -1); 
            this.log(`[СИНЕРГИЯ] Использовано преимущество!`);
        }

        if (['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt'].includes(skill.id)) attacker.modifyEffect('ammo', -1);
        if (skill.randomTarget) {
            let pool = this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx));
            if (pool.length > 0) primaryTarget = pool[Math.floor(Math.random() * pool.length)];
        }

        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 
        if (attacker.side === 'player') attacker.stamina = Math.max(0, attacker.stamina - (skill.staminaCost ?? 6));
        this.syncVitalsToGameState();

        if (SkillLogic.executeCustomSkillFlow(this, attacker, primaryTarget, skill, effectiveBase)) return; 

        // Кастомная логика призывов и разрядов босса вынесена в SkillLogic.js
        let targets = [];
        if (skill.targetSelf) targets = [attacker];
        else if (primaryTarget && primaryTarget.isEnvironment) targets = [primaryTarget];
        else if (skill.isAoE) targets = this.units.filter(u => u.side !== attacker.side && !u.isDead && !u.isEnvironment && skill.targetPos.includes(u.posIdx));
        else targets = [primaryTarget];

        let hitsCount = (skill.damageCoef === 0) ? 1 : (skill.hits || 1);

        for (let i = 0; i < hitsCount; i++) {
            setTimeout(() => {
                targets.forEach(target => this.applyDamageLogic(attacker, target, skill, effectiveBase, i, hitsCount));
                if (i === hitsCount - 1) setTimeout(() => this.finalizeSkill(attacker, primaryTarget, skill), 500);
            }, i * 300);
        }
    }

    getPrediction(attacker, target, skill) {
        return BattleDamageCalculator.getPrediction(this, attacker, target, skill);
    }

    applyDamageLogic(attacker, target, skill, effectiveBase, i, hitsCount) {
        BattleDamageCalculator.applyDamageLogic(this, attacker, target, skill, effectiveBase, i, hitsCount);
    }

    applySkillEffects(target, effectString, isLucky, isUnlucky, isCrit, attacker = null) {
        if (!effectString) return;
        const NO_SCALE = ['SHUFFLE', 'MOVETARGET', 'MOVESELF', 'REMOVETAUNTALL'];
        
        effectString.split(',').forEach(part => {
            let p = part.trim(); let curTarget = target;
            if (p.toLowerCase().startsWith('self ')) { p = p.substring(5).trim(); curTarget = attacker; }
            if (!curTarget || curTarget.isDead) return;

            const params = p.split('-');
            let id = params[0].toUpperCase(); let val = parseInt(params[1]) || 1;
            
            if (!NO_SCALE.includes(id)) {
                val += isCrit ? 2 : (isLucky ? 1 : (isUnlucky ? -1 : 0));
                val = Math.max(0, val);
            }
            if (val === 0 && !NO_SCALE.includes(id)) return;

            let dur = EFFECTS[id]?.duration || 4;
            if (!NO_SCALE.includes(id)) {
                dur += isCrit ? 2 : (isLucky ? 1 : (isUnlucky ? -1 : 0));
                dur = Math.max(1, dur);
            }

            if (id === 'SHUFFLE') this.shuffleUnits(curTarget.side);
            else if (id === 'REMOVETAUNTALL') {
                // Обрабатывается отдельно в SkillLogic.applyPostStrikeModifiers
            }
            else if (id === 'DOT') {
                let dotDmg = parseInt(params[2]) || 2;
                dotDmg += isCrit ? 2 : (isLucky ? 1 : (isUnlucky ? -1 : 0));
                dotDmg = Math.max(1, dotDmg);
                curTarget.addEffect(EFFECTS.DOT, 1, { duration: val, damagePerTurn: dotDmg });
            } 
            else if (EFFECTS[id]) {
                curTarget.addEffect(EFFECTS[id], val, { duration: dur });
                if ((id === 'DAZE' || id === 'SPEED') && curTarget === target) this.updateQueueInitiative();
            }
        });
        this.syncVitalsToGameState();
    }

    checkParrying(attacker, target, skill) {
        if (target.hasEffect('parry') && !skill.effect?.includes('ignorParry') && attacker !== target && !skill.targetAlly) {
            target.modifyEffect('parry', -1);
            let cDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(cDmg); window.spawnDamageText(`-${cDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
            this.log(`[ПАРРИРОВАНИЕ] ${target.name} наносит ответный удар!`);
            this.syncVitalsToGameState();
        }
    }

    finalizeSkill(attacker, primaryTarget, skill) {
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let effectiveBase = (attacker.equipment && attacker.equipment.leftHand === null) ? Math.round(weaponBase * 1.3) : weaponBase;

        if (skill.id === 'rapidFire') {
            attacker.modifyEffect('combo', -1); attacker.addEffect(EFFECTS.RAPIDFIRE, 3);
            this.log(`[СКОРОСТРЕЛЬНОСТЬ] ${attacker.name} занимает позицию для прикрытия!`);
        }
        
        SkillLogic.applyPostStrikeModifiers(this, attacker, primaryTarget, skill, effectiveBase, this.lastLucky, this.lastUnlucky, this.lastCrit);

        if (skill && skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill && skill.moveTarget && primaryTarget !== attacker) this.moveUnit(primaryTarget, skill.moveTarget);
        this.syncVitalsToGameState(); this.nextTurn();
    }

    performBasicMove(targetAlly) {
        this.state = 'EXECUTING'; this.uiCallback(null, [], this);
        let active = this.getActiveUnit();
        if (active.side === 'player') active.stamina = Math.max(0, active.stamina - 3);

        this.shiftUnits(active, targetAlly.posIdx); this.syncVitalsToGameState();
        setTimeout(() => this.nextTurn(), 600);
    }

    performRest() {
        this.state = 'EXECUTING'; this.uiCallback(null, [], this);
        let active = this.getActiveUnit();
        if (active.side === 'player') {
            active.stamina = Math.min(active.maxStamina, active.stamina + 15);
            window.spawnDamageText("+15 СИЛЫ", active.x + 20, active.y + 10, "#66ff88");
        }
        this.log(`${active.name} отдыхает и восстанавливает дыхание.`);
        window.spawnDamageText("ОТДЫХ", active.x + 20, active.y - 40, "#aaa");
        this.syncVitalsToGameState();
        setTimeout(() => this.nextTurn(), 600);
    }

    moveUnit(unit, offset) {
        let newPos = Math.max(1, Math.min(4, unit.posIdx + offset));
        if (newPos !== unit.posIdx) {
            if (newPos < unit.posIdx) {
                let overwatchers = this.units.filter(u => u.side !== unit.side && u.hasEffect('noOneStepFurther') && !u.isDead);
                overwatchers.forEach(watcher => {
                    this.log(`<span style="color:#ffbf00">[НИ ШАГУ ДАЛЬШЕ!] ${watcher.name} бьет приблизившегося врага!</span>`);
                    let baseDmg = watcher.equipment?.rightHand?.baseDamage || 10;
                    if (watcher.equipment && watcher.equipment.leftHand === null) baseDmg = Math.round(baseDmg * 1.3);
                    let multiplier = (watcher.equipment?.rightHand?.level || 1) >= 3 ? 1.2 : 1.0;

                    let finalDmg = Math.round(baseDmg * multiplier); watcher.offsetX = watcher.side === 'player' ? 30 : -30;
                    
                    setTimeout(() => {
                        unit.takeDamage(finalDmg); window.spawnDamageText(`-${finalDmg}`, unit.x + 20, unit.y - 20, "#ffbf00"); 
                        this.syncVitalsToGameState();
                    }, 150);
                    watcher.modifyEffect('noOneStepFurther', -1);
                });
            }
            this.shiftUnits(unit, newPos);
        }
        this.syncVitalsToGameState();
    }

    shiftUnits(movingUnit, targetPos) {
        if (movingUnit.isEnvironment) return;
        const side = movingUnit.side; const oldPos = movingUnit.posIdx;
        let allies = this.units.filter(u => u.side === side && !u.isDead && !u.isEnvironment);
        
        if (oldPos < targetPos) {
            allies.forEach(u => { if (u !== movingUnit && u.posIdx > oldPos && u.posIdx <= targetPos) u.posIdx -= 1; });
        } else if (oldPos > targetPos) {
            allies.forEach(u => { if (u !== movingUnit && u.posIdx >= targetPos && u.posIdx < oldPos) u.posIdx += 1; });
        }
        movingUnit.posIdx = targetPos;
    }

    autoShiftUnits() {
        ['player', 'enemy'].forEach(side => {
            let alive = this.units.filter(u => u.side === side && !u.isDead && !u.isEnvironment).sort((a, b) => a.posIdx - b.posIdx);
            alive.forEach((u, i) => u.posIdx = i + 1);
        });
    }

    enemyTurn(enemy) {
        if (enemy.isDead) { this.nextTurn(); return; }
        this.state = 'EXECUTING'; enemy.offsetX = -40; 
        let action = EnemyAILogic.decideEnemyAction(enemy, this);

        if (!action || !action.skill) {
            this.log(`<span style="color:#aaa">${enemy.name} перегруппировывается...</span>`);
            window.spawnDamageText("ДВИЖЕНИЕ", enemy.x, enemy.y - 40, "#aaa");
            this.moveUnit(enemy, -1); setTimeout(() => this.nextTurn(), 800); return;
        }

        this.selectedSkill = action.skill; this.executeSkill(enemy, action.target);
    }

    nextTurn() {
        let active = this.getActiveUnit();
        if (active && !active.isDead && active.hasEffect('courage')) {
            this.log(`<span style="color:#ffbf00">[КУРАЖ] ${active.name.toUpperCase()} делает дополнительный ход!</span>`);
            active.modifyEffect('courage', -1); this.state = 'IDLE'; this.startTurn(); return;
        }
        if (active && !active.isDead) active.tickEffectsByTrigger('turnEnd');
        this.autoShiftUnits(); this.syncVitalsToGameState();
        
        let justFinished = active; this.turnQueue.shift(); this.processOverwatch(justFinished);
    }

    processOverwatch(justFinished) {
        this.state = 'IDLE';
        if (justFinished && justFinished.side === 'player' && !justFinished.isDead) {
            let overwatchers = this.units.filter(u => u.side === 'player' && u.hasEffect('rapidFire') && !u.isDead && u !== justFinished);
            if (overwatchers.length > 0) {
                this.state = 'EXECUTING'; 
                overwatchers.forEach(archer => {
                    let enemies = this.units.filter(u => u.side !== 'player' && !u.isDead);
                    if (enemies.length > 0) {
                        let target = enemies[Math.floor(Math.random() * enemies.length)];
                        this.log(`<span style="color:#ffbf00">[ПРИКРЫТИЕ] ${archer.name} делает выстрел навскидку!</span>`);
                        let baseDmg = archer.equipment?.rightHand?.baseDamage || 10;
                        if (archer.equipment && archer.equipment.leftHand === null) baseDmg = Math.round(baseDmg * 1.3);
                        let finalDmg = Math.round(baseDmg); archer.offsetX = 30; 
                        
                        setTimeout(() => {
                            target.takeDamage(finalDmg); window.spawnDamageText(`-${finalDmg}`, target.x + 20, target.y - 20, '#fff');
                            this.syncVitalsToGameState(); if (target.isDead) this.autoShiftUnits();
                        }, 150);
                    }
                });
                setTimeout(() => this.checkWinAndContinue(), 600); return; 
            }
        }
        this.checkWinAndContinue();
    }

    checkWinAndContinue() {
        this.state = 'IDLE';
        const players = this.units.filter(u => u.side === 'player' && !u.isDead).length;
        const enemies = this.units.filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment).length;
        
        if (players === 0 || enemies === 0) { 
            this.state = 'EXECUTING';
            const overlay = document.getElementById('battle-transition-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                void overlay.offsetWidth;
                overlay.classList.add('active');
            }

            setTimeout(() => {
                if (players === 0) {
                    GameState.isReturningFromBattle = true;
                    GameState.currentSquad.forEach(adv => {
                        if (!adv) return;
                        adv.hp = 0; adv.stamina = 0; adv.minExpeditionHp = 0; adv.minExpeditionStamina = 0;
                    });
                    SceneManager.changeScene(ExploreScene);
                } else {
                    GameState.isReturningFromBattle = true;
                    ExpeditionManager.battleCompleted = true;

                    const deadEnemies = this.units.filter(u => u.side === 'enemy' && u.isDead);
                    const crystal = this.units.find(u => u.isEnvironment || u.name.toLowerCase().includes("пьезо"));

                    BattleLootManager.generateAndDistributeLoot(deadEnemies, crystal, (msg) => this.log(msg));

                    SceneManager.changeScene(ExploreScene);
                }
            }, 1200);
            return; 
        }
        this.startTurn();
    }

    triggerMotherDeathPassive(deadUnit) {
        if (deadUnit.side === 'enemy' && !deadUnit.name.includes("Мать") && !deadUnit.isEnvironment) {
            let mother = this.units.find(u => u.name.includes("Мать") && !u.isDead);
            if (mother) {
                let dName = deadUnit.name.toLowerCase();
                if (dName.includes("фритт")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 16); window.spawnDamageText("+16 HP", mother.x, mother.y, "#4affab"); 
                } else if (dName.includes("стеклянный")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 8); mother.addEffect(EFFECTS.COMBO, 1); window.spawnDamageText("+8 HP", mother.x, mother.y, "#4affab"); 
                } else if (dName.includes("амальгам")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 8); mother.addEffect(EFFECTS.DODGE, 1); window.spawnDamageText("+8 HP", mother.x, mother.y, "#4affab"); 
                } else if (dName.includes("витраж")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 15); mother.addEffect(EFFECTS.ARMOR, 4); window.spawnDamageText("+15 HP", mother.x, mother.y, "#4affab"); 
                }
                this.log(`[ПЕРЕРАБОТКА] Мать поглощает останки ${deadUnit.name.substring(0, 5)}!`);
            }
        }
    }
}
