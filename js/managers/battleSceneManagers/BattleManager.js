import { EFFECTS } from '../../data/battleData/effects.js';
import { SkillLogic } from './SkillLogic.js';
import { ENEMY_SKILLS } from '../../data/battleData/enemySkillLogic.js';
import { Unit } from '../../entities/Unit.js';
import { GLASS_FOREST_ENCOUNTERS } from '../../data/battleData/enemies.js';
import { EnemyAILogic } from './EnemyAILogic.js';
import { GameState } from '../../core/GameState.js';
import { ExpeditionManager} from '../ExpeditionManagers/ExpeditionManager.js';
import { LOOT } from '../../data/expiditionData/lootData.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnQueue = []; 
        this.baseInitiativeMap = new Map();
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('log-panel');
        this.state = 'IDLE'; 
        this.round = 1;
    }

    log(msg) {
        if (!this.logPanel) return;
        this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    getActiveUnit() { return this.turnQueue[0] || null; }

    startBattle() { 
        this.log("БОЙ НАЧИНАЕТСЯ!"); 
        this.units.forEach(u => {
            let needsInitialAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt',
                                    'frontRearSights', 'buckshot', 'shotIntoAir', 'piercedArtery', 'piercingShot', 'stayAway'];
            if (u.side === 'player' && u.equipment?.rightHand?.skills?.some(s => needsInitialAmmo.includes(s.id))) {
                let enemies = this.units.filter(e => e.side !== u.side);
                let dStatFinal = 0;
                if (enemies.length > 0) {
                    let strongestEnemy = enemies.reduce((prev, current) => (prev.combatStat > current.combatStat) ? prev : current);
                    dStatFinal = Number(strongestEnemy.combatStat);
                }
                
                let aStatFinal = Number(u.combatStat) + (u.stats?.atkArmor || 0);
                let diff = (aStatFinal + 3) - (dStatFinal + 3); 
                
                let ammoCount = 1;
                if (diff >= 5) ammoCount = 2;
                if (diff >= 10) ammoCount = 3;
                if (diff <= -5) ammoCount = 0;
                
                if (ammoCount > 0) u.addEffect(EFFECTS.AMMO, ammoCount);
            }
        });
        let crystal = this.units.find(u => u.isEnvironment);
        let glassSpidersCount = this.units.filter(u => u.name.includes("Стеклянный паук") || u.id === 'glassSpider').length;
        if (crystal && glassSpidersCount > 0) {
            crystal.addEffect(EFFECTS.MITES, glassSpidersCount);
            this.log(`[ПАССИВНО] Пауки увеличивают популяцию клещей на старте (+${glassSpidersCount})!`);
        }

        this.generateTurnQueue(); 
        this.startTurn(); 
    }

    generateTurnQueue() {
        let crystal = this.units.find(u => u.isEnvironment && !u.isDead);
        if (this.round > 1 && crystal) {
            let mites = crystal.getEffect('mites');
            let currentCount = mites ? mites.count : 0;
            let growth = currentCount > 5 ? 4 : (currentCount >= 3 ? 3 : (currentCount >= 1 ? 2 : 1));
            crystal.addEffect(EFFECTS.MITES, growth);
            this.log(`[ПЬЕЗОКРИСТАЛЛ] Популяция клещей растет (+${growth})!`);
        }

        let aliveUnits = this.units.filter(u => !u.isDead && !u.isEnvironment);
        let initList = aliveUnits.map(u => {
            let roll = Math.floor(Math.random() * 5) + 1; 
            let score = u.combatStat + roll;
            this.baseInitiativeMap.set(u, score);
            return { unit: u, score: score };
        });
        this.sortQueue(initList);
        
        const rL = document.getElementById('b-turn-display');
        if (rL) rL.innerText = `РАУНД ${this.round}`;
        this.log(`=== РАУНД ${this.round} ===`);
        this.round++;
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
        let active = this.turnQueue.shift();
        this.sortQueue();
        this.turnQueue.unshift(active);
    }

    startTurn() {
        let active = this.getActiveUnit();
        if (!active) { this.generateTurnQueue(); active = this.getActiveUnit(); if (!active) return; }
        if (active.isDead) { this.nextTurn(); return; }
        this.state = 'EXECUTING';

        if (active.hasEffect('electroWeb')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} бьется в электро-паутине! ПРОПУСК ХОДА.</span>`);
            let dmg = Math.round(10 * 0.6); // урон электро-паутины
            active.takeDamage(dmg);
            window.spawnDamageText(`-${dmg} (ШОК)`, active.x, active.y - 60, "#ffbf00");
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 1200); 
            return;
        }

        if (active.hasEffect('rapidFire')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} обеспечивает прикрытие.</span>`);
            setTimeout(() => { this.nextTurn(); }, 600); 
            return;
        }

        if (active.hasEffect('stun')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} ПРОПУСКАЕТ ХОД.</span>`);
            active.modifyEffect('stun', -1); 
            window.spawnDamageText("ПРОПУСК", active.x, active.y - 60, "#aaa");
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 800); 
            return;
        }

        if (active.hasEffect('fear')) {
            this.log(`<span style="color:#b19cd9">[ИСПУГ] ${active.name.toUpperCase()} в панике отступает!</span>`);
            active.modifyEffect('fear', -1);
            this.moveUnit(active, 2); 
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 800); 
            return;
        }

        if (active.name.includes("Паук-амальгама") || active.id === 'amalgamSpider') {
            let cc = ['stun', 'daze', 'inWeb', 'electroWeb'];
            let hasCC = active.activeEffects.some(e => cc.includes(e.base.id));
            if (active.hasEffect('combo') && !hasCC) {
                active.addEffect(EFFECTS.DODGE, 1);
                window.spawnDamageText("УКЛОНЕНИЕ (+1)", active.x, active.y - 40, "#fff");
                this.log(`[ЛОВКОСТЬ] ${active.name} сливается с окружением!`);
            }
        }

        if (active.name.includes("Паук-витраж") || active.id === 'vitrailSpider') {
            let myCombo = active.getEffect('combo')?.count || 0;
            if (myCombo > 0) {
                let armorBonus = myCombo * 2;
                active.addEffect(EFFECTS.ARMOR, armorBonus);
                window.spawnDamageText(`БРОНЯ (+${armorBonus})`, active.x, active.y - 40, "#fff");
                this.log(`[МЕТАЛЛ] Заряд уплотняет оловянные швы ${active.name}!`);
            }
        }

        let dot = active.getEffect('dot');
        if (dot) {
            let dmg = dot.damagePerTurn || 2;
            active.takeDamage(dmg);
            window.spawnDamageText(`-${dmg} (КРОВЬ)`, active.x + 20, active.y - 20, '#ff4444');
            this.log(`${active.name} кровоточит (-${dmg})`);
            
            dot.duration -= 1;
            if (dot.duration <= 0) {
                active.activeEffects = active.activeEffects.filter(e => e.base.id !== 'dot');
            }

            if (active.isDead) {
                this.triggerMotherDeathPassive(active); // полученные бафов матерью роя
                this.nextTurn();
                return;
            }
        }
        if (active.isDead) { this.nextTurn(); return; }
        
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
        this.state = 'SELECT_TARGET';
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

            let isValidPos = false;
            if (skill.targetPos && skill.targetPos.includes(targetUnit.posIdx)) isValidPos = true;
            if (targetUnit.isEnvironment && skill.damageCoef > 0) isValidPos = true;

            if (!skill.targetSelf && !skill.targetAny && !isValidPos) return; 
            this.executeSkill(active, targetUnit);
        } 
        else if (this.state === 'SELECT_MOVE') {
            if (targetUnit.side !== active.side || targetUnit === active) return;
            if (Math.abs(active.posIdx - targetUnit.posIdx) > 1) return;
            this.performBasicMove(targetUnit);
        }
    }

    executeSkill(attacker, primaryTarget) {
        this.state = 'EXECUTING';
        this.uiCallback(attacker, [], this);
        let skill = { ...this.selectedSkill };
        
        let effectiveBase = 10;
        if (attacker.side === 'player') {
            let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
            effectiveBase = (attacker.equipment && attacker.equipment.leftHand === null) ? Math.round(weaponBase * 1.3) : weaponBase;
        } else {
            effectiveBase = 10;
        }

        SkillLogic.applyPreStrikeModifiers(this, attacker, primaryTarget, skill, effectiveBase);

        if ((primaryTarget.hasEffect('mark') || attacker.hasEffect('combo')) && skill.comboOrMarkImproveable && skill.comboChanges) {
            Object.assign(skill, skill.comboChanges);
            if (primaryTarget.hasEffect('mark')) primaryTarget.modifyEffect('mark', -1); 
            if (attacker.hasEffect('combo')) attacker.modifyEffect('combo', -1); 
            this.log(`[СИНЕРГИЯ] Использовано преимущество!`);
        }

        let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt'].includes(skill.id);
        if (needsAmmo) attacker.modifyEffect('ammo', -1);

        if (skill.randomTarget) {
            let possibleTargets = this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx));
            if (possibleTargets.length > 0) {
                primaryTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            }
        }

        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 

        if (attacker.side === 'player') {
            let cost = skill.staminaCost !== undefined ? skill.staminaCost : 6;
            attacker.stamina = Math.max(0, attacker.stamina - cost);
        }

        if (SkillLogic.executeCustomSkillFlow(this, attacker, primaryTarget, skill, effectiveBase)) return; 

        if (attacker.name.includes("Мать") && skill.id.startsWith("mother")) {
            if (skill.id === 'motherVoltage') {
                let myCombo = attacker.getEffect('combo')?.count || 0;
                attacker.modifyEffect('combo', -myCombo);
                let dmg = myCombo * 3;
                this.log(`[ПЕРЕПАД НАПРЯЖЕНИЯ] Разряд в ${dmg} урона поражает всех!`);
                
                let targets = this.units.filter(u => u !== attacker && !u.isDead && !u.isEnvironment);
                targets.forEach((t, idx) => {
                    setTimeout(() => {
                        let finalDmg = dmg;
                        if (t.hasEffect('armor')) {
                            let armorVal = t.getEffect('armor').count;
                            if (finalDmg > armorVal) { t.modifyEffect('armor', -1); window.spawnDamageText("-БРОНЯ", t.x, t.y - 60, "#aaa"); }
                            finalDmg = Math.max(0, finalDmg - armorVal);
                        }

                        if (t.hasEffect('swarm')) {
                            if (finalDmg >= t.hp) {
                                t.hp = 0; t.modifyEffect('swarm', -1);
                                if (!t.isDead) t.hp = t.maxHp;
                                window.spawnDamageText(`-1 ОСОБЬ`, t.x, t.y - 40, "#ffbf00");
                            } else {
                                t.hp -= finalDmg;
                                window.spawnDamageText(`-${finalDmg}`, t.x, t.y - 40, "#ffbf00");
                            }
                        } else {
                            t.takeDamage(finalDmg);
                            window.spawnDamageText(`-${finalDmg} (ШОК)`, t.x, t.y - 40, "#ffbf00");
                        }

                        let debuff = Math.random() > 0.5 ? EFFECTS.DAZE : EFFECTS.WEAKNESS;
                        t.addEffect(debuff, 1);
                        window.spawnDamageText(debuff.name.toUpperCase(), t.x, t.y - 20, "#ffaa44");
                        
                        if (t.isDead) {
                            this.turnQueue = this.turnQueue.filter(u => u !== t);
                            this.triggerMotherDeathPassive(t);
                        }
                    }, idx * 100);
                });
                setTimeout(() => this.finalizeSkill(attacker, attacker, skill), targets.length * 100 + 500);
                return;
            }
            if (skill.id.startsWith('motherSpawn')) {
                let spawnData = {
                    'motherSpawnFritta': { id: 'fritta', pos: 2, cost: 8 },
                    'motherSpawnGlass': { id: 'glassSpider', pos: 3, cost: 16 },
                    'motherSpawnAmalgam': { id: 'amalgamSpider', pos: 4, cost: 16 },
                    'motherSpawnVitrail': { id: 'vitrailSpider', pos: 1, cost: 30 }
                }[skill.id];

                attacker.takeDamage(spawnData.cost);
                window.spawnDamageText(`-${spawnData.cost} HP`, attacker.x, attacker.y - 20, "#ff4444");

                let eData = GLASS_FOREST_ENEMIES[spawnData.id];
                let allies = this.units.filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment);
                allies.forEach(a => { if (a.posIdx >= spawnData.pos) a.posIdx++; });

                let spriteUrl = eData.spriteVariations ? eData.spriteUrl.replace(/\.png$/i, '') + Math.floor(Math.random() * eData.spriteVariations) + '.png' : eData.spriteUrl;
                let letter = String.fromCharCode(65 + allies.length); 
                
                const newEnemy = new Unit({ 
                    name: `${eData.name} ${letter}`, side: 'enemy', posIdx: spawnData.pos, 
                    hp: eData.hp, maxHp: eData.hp, combat: eData.combat, 
                    skills: eData.skills, spriteUrl: spriteUrl, scale: eData.scale, maxCombo: eData.maxCombo 
                });
                if (spawnData.id === 'fritta') newEnemy.addEffect(EFFECTS.SWARM, 4);

                this.units.push(newEnemy);
                this.turnQueue.push(newEnemy);
                this.log(`[ОТЛИВКА] Мать исторгает из себя ${newEnemy.name}!`);
                setTimeout(() => this.finalizeSkill(attacker, attacker, skill), 800);
                return;
            }
        }

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

    calculateBaseDiff(attacker, target, skill) {
        let isFriendlyCast = (skill.targetSelf || skill.targetAlly || (target && target.side === attacker.side));
        
        let aStatBase = Number(attacker.combatStat);
        let aStatMod = (attacker.hasEffect('speed') ? Math.round(aStatBase*0.25) : 0) - (attacker.hasEffect('daze') ? Math.round(aStatBase*0.25) : 0);
        let aFinal = aStatBase + aStatMod + (attacker.stats?.atkArmor || 0);

        let dFinal = 0;
        if (isFriendlyCast) {
            let enemies = this.units.filter(u => u.side !== attacker.side && !u.isDead);
            if (enemies.length > 0) {
                let strongest = enemies.reduce((prev, curr) => (prev.combatStat > curr.combatStat) ? prev : curr);
                let dStatBase = Number(strongest.combatStat);
                let dStatMod = (strongest.hasEffect('speed') ? Math.round(dStatBase*0.25) : 0) - (strongest.hasEffect('daze') ? Math.round(dStatBase*0.25) : 0);
                dFinal = dStatBase + dStatMod; 
            }
        } else {
            let dStatBase = Number(target.combatStat);
            let dStatMod = (target.hasEffect('speed') ? Math.round(dStatBase*0.25) : 0) - (target.hasEffect('daze') ? Math.round(dStatBase*0.25) : 0);
            dFinal = dStatBase + dStatMod + (target.stats?.defArmor || 0);
        }
        return aFinal - dFinal;
    }

    evaluateHit(attacker, target, skill, effectiveBase, diff, isPrediction = false) {
        let isL = false, isU = false, isC = false;
        let hitType = "ОБЫЧНЫЙ"; let luckMult = 1.0; 
        let armorBroken = false;

        if (diff >= 10 || (diff >= 5 && attacker.hasEffect('power'))) { 
            isL = true; isC = true; hitType = "КРИТ"; luckMult = 2.0;
        } else if (diff >= 5) { 
            isL = true; hitType = "УДАЧНЫЙ"; luckMult = 1.5;
        } else if (diff <= -10 || (diff <= -5 && attacker.hasEffect('weakness'))) { 
            isU = true; hitType = "ПРОМАХ"; luckMult = 0.0;
        } else if (diff <= -5) { 
            isU = true; hitType = "НЕУДАЧНЫЙ"; luckMult = 0.5;
        }

        let rawDmg = effectiveBase * (skill.damageCoef || 0) * luckMult;
        let finalDmg = Math.round(rawDmg);
        
        let formulaParts = []; 
        
        if (attacker.hasEffect('weakness')) { finalDmg = Math.round(finalDmg * 0.5); formulaParts.push('50%(Слаб)'); }
        if (attacker.hasEffect('power')) { finalDmg = Math.round(finalDmg * 1.5); formulaParts.push('150%(Сила)'); }
        if (target && target.hasEffect('vulnerable')) { finalDmg = Math.round(finalDmg * 1.5); formulaParts.push('150%(Уязв)'); }
        
        let ignoresDef = skill.effect?.includes('ignorArmor') || skill.effect?.includes('ignorBlock');
        if (target && target.hasEffect('block') && !ignoresDef) { 
            finalDmg = Math.round(finalDmg * 0.5); 
            formulaParts.push('50%(Блок)'); 
            if (!isPrediction) target.modifyEffect('block', -1); 
        }

        if (target && target.hasEffect('armor') && !ignoresDef) {
            let armorVal = target.getEffect('armor').count;
            if (finalDmg > armorVal) armorBroken = true;
            
            finalDmg = Math.max(0, finalDmg - armorVal);
            formulaParts.push(`-${armorVal}(Броня)`);
        }

        let swarmBonus = 0;
        if (attacker.hasEffect('swarm')) swarmBonus += attacker.getEffect('swarm').count;
        if (target && target.hasEffect('swarm')) swarmBonus += target.getEffect('swarm').count;
        
        if (hitType !== "ПРОМАХ") finalDmg += swarmBonus;
        else { finalDmg = 0; formulaParts = ["0"]; }

        let displayColor = "#ffffff";
        if (attacker.side === 'player') {
            if (isC) displayColor = "#ff00ff"; else if (isL) displayColor = "#4affab"; else if (isU) displayColor = "#ffaa44";
            if (hitType === "ПРОМАХ") displayColor = "#aaaaaa";
        } else {
            if (isC) displayColor = "#ff4444"; else if (isL) displayColor = "#ff8844"; else if (isU) displayColor = "#ffffff";
            if (hitType === "ПРОМАХ") displayColor = "#88ff88";
        }

        return { hitType, luckMult, finalDmg, isL, isC, isU, formulaParts, swarmBonus, displayColor, armorBroken };
    }

    getPrediction(attacker, target, skill) {
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let hasOffhandBonus = (attacker.equipment && attacker.equipment.leftHand === null);
        let effectiveBase = hasOffhandBonus ? Math.round(weaponBase * 1.3) : weaponBase;

        let simSkill = JSON.parse(JSON.stringify(skill));
        if ((target.hasEffect('mark') || attacker.hasEffect('combo')) && simSkill.comboOrMarkImproveable && simSkill.comboChanges) {
            let newEffect = simSkill.effect ? simSkill.effect : '';
            if (simSkill.comboChanges.effect) newEffect = newEffect ? newEffect + ', ' + simSkill.comboChanges.effect : simSkill.comboChanges.effect;
            Object.assign(simSkill, simSkill.comboChanges);
            simSkill.effect = newEffect;
        }

        SkillLogic.applyPreStrikeModifiers(this, attacker, target, simSkill, effectiveBase, true);

        let baseDiff = this.calculateBaseDiff(attacker, target, simSkill);

        let outcomes = {
            "КРИТ": { count: 0 }, "УДАЧНЫЙ": { count: 0 }, "ОБЫЧНЫЙ": { count: 0 },
            "НЕУДАЧНЫЙ": { count: 0 }, "ПРОМАХ": { count: 0 }
        };

        for (let a = 1; a <= 5; a++) {
            for (let d = 1; d <= 5; d++) {
                let diff = baseDiff + (a - d);
                let hitResult = this.evaluateHit(attacker, target, simSkill, effectiveBase, diff, true);
                outcomes[hitResult.hitType].count++;
                if (!outcomes[hitResult.hitType].sample) outcomes[hitResult.hitType].sample = hitResult;
            }
        }

        let result = [];
        let hitsCount = simSkill.hits || 1;

        for (let type in outcomes) {
            if (outcomes[type].count > 0) {
                let prob = Math.round((outcomes[type].count / 25) * 100);
                let sample = outcomes[type].sample;

                let formulaParts = [`${weaponBase}`];
                if (hasOffhandBonus) formulaParts.push(`130%`);
                if (simSkill.damageCoef !== 1 && simSkill.damageCoef !== 0) formulaParts.push(`${Math.round(simSkill.damageCoef * 100)}%`);
                if (sample.luckMult !== 1 && type !== "ПРОМАХ") formulaParts.push(`${Math.round(sample.luckMult * 100)}%`);
                if (sample.swarmBonus > 0 && type !== "ПРОМАХ") formulaParts.push(`+${sample.swarmBonus}(Рой)`);
                formulaParts.push(...sample.formulaParts); 
                
                if (type === "ПРОМАХ") formulaParts = ["0"];
                let formulaStr = formulaParts.length > 1 ? `<span style="color:#666; font-size:9px; margin-right:5px;">(${formulaParts.join(' * ')})</span>` : '';
                if (simSkill.damageCoef === 0) formulaStr = '';

                let displayType = type;
                if (type === "КРИТ" && attacker.hasEffect('power')) displayType = "КРИТ <span style='color:#ffbf00; font-size:10px;'>+ Сила!</span>";
                
                result.push({ 
                    type: displayType, prob, 
                    singleDmg: sample.finalDmg, totalDmg: sample.finalDmg * hitsCount, hits: hitsCount,
                    formula: formulaStr, color: sample.displayColor,
                    isL: sample.isL, isU: sample.isU, isC: sample.isC
                });
            }
        }

        result.sort((a, b) => b.prob - a.prob);
        return { list: result, simSkill: simSkill, expectedDamage: result[0]?.totalDmg || 0 };
    }

    applyDamageLogic(attacker, target, skill, effectiveBase, i, hitsCount) {
        if (target.isEnvironment && skill.damageCoef > 0) {
            let mites = target.getEffect('mites');
            if (mites && mites.count > 0) {
                let burnCount = skill.isAoE ? 2 : 3;
                let actualBurn = Math.min(burnCount, mites.count);
                target.modifyEffect('mites', -actualBurn);
                window.spawnDamageText(`-${actualBurn} КЛЕЩЕЙ`, target.x + 20, target.y - 20, "#b19cd9");
                this.log(`[ОЧИСТКА] ${attacker.name} сжигает ${actualBurn} клещей. Осталось: ${target.getEffect('mites')?.count || 0}`);
            }

            if (attacker.side === 'player') {
                let playersInWeb = this.units.filter(u => u.side === 'player' && u.hasEffect('electroWeb'));
                if (playersInWeb.length > 0) {
                    playersInWeb.forEach(p => {
                        p.activeEffects = p.activeEffects.filter(e => e.base.id !== 'electroWeb');
                        window.spawnDamageText("СВОБОДА!", p.x, p.y - 40, "#4affab");
                    });
                    this.log(`[ОСВОБОЖДЕНИЕ] Удар по кристаллу обесточил паутину!`);
                }
            }

            if (skill.isAoE && i === 0) {
                let splash = this.units.filter(u => u.side !== attacker.side && !u.isDead && !u.isEnvironment && skill.targetPos.includes(u.posIdx));
                splash.forEach(sT => this.applyDamageLogic(attacker, sT, skill, effectiveBase, 0, 1));
            }
            return;
        }

        if (target.isDead) return;

        let baseDiff = this.calculateBaseDiff(attacker, target, skill);
        let aRoll = Math.floor(Math.random() * 5) + 1;
        let dRoll = Math.floor(Math.random() * 5) + 1;
        let diff = baseDiff + (aRoll - dRoll);

        let hitResult = this.evaluateHit(attacker, target, skill, effectiveBase, diff, false);
        if (i === 0) { 
            this.lastLucky = hitResult.isL; 
            this.lastUnlucky = hitResult.isU; 
            this.lastCrit = hitResult.isC; 
            this.lastHitType = hitResult.hitType;
        }

        let isFriendlyCast = (skill.targetSelf || skill.targetAlly || (target && target.side === attacker.side));
        if (skill.damageCoef === 0 && isFriendlyCast) {
            if (hitResult.hitType === "ПРОМАХ") { 
                if (i === 0) window.spawnDamageText("ПРОМАХ", target.x, target.y - 40, "#aaa"); 
                return; 
            }
            
            let buffText = "БАФФ";
            if (hitResult.isC) buffText = "КРИТ. БАФФ";
            else if (hitResult.hitType === "НЕУДАЧНЫЙ") buffText = "СЛАБЫЙ БАФФ";

            if (i === 0) window.spawnDamageText(buffText, target.x, target.y - 40, hitResult.displayColor);
            
            if (i === hitsCount - 1 && skill.effect) this.applySkillEffects(target, skill.effect, hitResult.isL, hitResult.isU, hitResult.isC, attacker);
            return;
        }

        if (target.hasEffect('dodge') && !skill.effect?.includes('ignorDodge')) {
            target.modifyEffect('dodge', -1);
            window.spawnDamageText("УВОРОТ", target.x + 10, target.y - 40, "#fff"); return;
        }

        let logHeader = `<span style="color:${hitResult.displayColor}">[${hitResult.hitType}]</span> <b>${attacker.name}</b> ⚔️ <b>${target.name}</b>`;
        let logMath = `<br/>&nbsp;&nbsp;🎲 Бросок кубиков: Атака(+${aRoll}) vs Защита(+${dRoll}) | <b>Итог Разницы: ${diff > 0 ? '+'+diff : diff}</b>`;
        let logDmg = `<br/>&nbsp;&nbsp;💥 Урон: ${hitResult.finalDmg} <small style="color:#888">(База ${Math.round(effectiveBase * skill.damageCoef * hitResult.luckMult)} + Рой ${hitResult.swarmBonus})</small>`;
        
        if (hitResult.hitType === "ПРОМАХ") {
            window.spawnDamageText("ПРОМАХ", target.x + 10, target.y - 40, hitResult.displayColor);
            this.log(logHeader + logMath + `<br/>&nbsp;&nbsp;💨 Промах! Урон не нанесен.`);
        } else {
            if (hitResult.hitType === "КРИТ") {
                window.spawnDamageText("КРИТ!", target.x + 10, target.y - 45, hitResult.displayColor);
            } else if (hitResult.hitType === "УДАЧНЫЙ") {
                window.spawnDamageText("УДАЧНО", target.x + 10, target.y - 45, hitResult.displayColor);
            } else if (hitResult.hitType === "НЕУДАЧНЫЙ") {
                window.spawnDamageText("НЕУДАЧНО", target.x + 10, target.y - 45, hitResult.displayColor);
            }
            if (hitResult.armorBroken && !target.isDead) {
                target.modifyEffect('armor', -1);
                window.spawnDamageText("-БРОНЯ", target.x + 20, target.y - 65, "#aaa");
            }

            if (target.side === 'player' && attacker.side === 'enemy') {
                target.stamina = Math.max(0, target.stamina - 3);
            }

            let resultStatus = "";
            let fd = hitResult.finalDmg;
            if (target.hasEffect('swarm')) {
                if (fd >= target.hp) {
                    target.hp = 0; target.modifyEffect('swarm', -1);
                    if (!target.isDead) target.hp = target.maxHp; 
                    window.spawnDamageText(`-1 ОСОБЬ`, target.x, target.y - 20, hitResult.displayColor);
                    resultStatus = `Одна особь погибла! Осталось: ${target.getEffect('swarm')?.count || 0}`;
                } else {
                    target.hp -= fd;
                    window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
                    resultStatus = `HP особи: ${target.hp}/${target.maxHp}`;
                }
            } else {
                target.takeDamage(fd);
                window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
                resultStatus = target.isDead ? "ЦЕЛЬ УНИЧТОЖЕНА" : `Осталось HP: ${target.hp}/${target.maxHp}`;
            }
            
            this.log(logHeader + logMath + logDmg + `<br/>&nbsp;&nbsp;❤️ <b>Итог:</b> ${resultStatus}`);
            target.tickEffectsByTrigger('hitReceived');
            attacker.tickEffectsByTrigger('hitGiven');
            
            if (target.hasEffect('aGapingWound')) {
                target.modifyEffect('aGapingWound', -1);
                target.addEffect(EFFECTS.DOT, 3, { damagePerTurn: 2 });
            }
            if (target.hasEffect('instability') && !target.isDead) {
                let shift = (target.posIdx === 1) ? 1 : (target.posIdx === 4 ? -1 : (Math.random() > 0.5 ? 1 : -1));
                this.moveUnit(target, shift);
            }
            if (target.isDead) {
                this.turnQueue = this.turnQueue.filter(u => u !== target);
                this.uiCallback(this.getActiveUnit(), [], this);
                this.triggerMotherDeathPassive(target);
            }
        }

        if (i === hitsCount - 1) {
            if (skill.effect) this.applySkillEffects(target, skill.effect, hitResult.isL, hitResult.isU, hitResult.isC, attacker);
            if (!target.isDead) this.checkParrying(attacker, target, skill); 
        }
    }

    checkParrying(attacker, target, skill) {
        if (target.hasEffect('parry') && !skill.effect?.includes('ignorParry') && attacker !== target && !skill.targetAlly) {
            target.modifyEffect('parry', -1);
            let cDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(cDmg);
            window.spawnDamageText(`-${cDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
            this.log(`[ПАРРИРОВАНИЕ] ${target.name} наносит ответный удар!`);
        }
    }

    applySkillEffects(target, effectString, isLucky, isUnlucky, isCrit, attacker = null) {
        if (!effectString) return;
        const NO_SCALE = ['SHUFFLE', 'MOVETARGET', 'MOVESELF', 'REMOVETAUNTALL'];
        
        effectString.split(',').forEach(part => {
            let p = part.trim(); let curTarget = target;
            if (p.toLowerCase().startsWith('self ')) { p = p.substring(5).trim(); curTarget = attacker; }
            if (!curTarget || curTarget.isDead) return;

            const params = p.split('-');
            let id = params[0].toUpperCase(); 
            let val = parseInt(params[1]) || 1;
            
            if (!NO_SCALE.includes(id)) {
                if (isCrit) val += 2;
                else if (isLucky) val += 1;
                else if (isUnlucky) val -= 1;
                val = Math.max(0, val);
            }
            if (val === 0 && !NO_SCALE.includes(id)) return;

            let dur = EFFECTS[id]?.duration || 4;
            if (!NO_SCALE.includes(id)) {
                if (isCrit) dur += 2; else if (isLucky) dur += 1; else if (isUnlucky) dur -= 1;
                dur = Math.max(1, dur);
            }

            if (id === 'SHUFFLE') this.shuffleUnits(curTarget.side);
            else if (id === 'REMOVETAUNTALL') {}
            else if (id === 'DOT') {
                let dotDmg = parseInt(params[2]) || 2;
                if (isCrit) dotDmg += 2; else if (isLucky) dotDmg += 1; else if (isUnlucky) dotDmg -= 1;
                dotDmg = Math.max(1, dotDmg);
                curTarget.addEffect(EFFECTS.DOT, 1, { duration: val, damagePerTurn: dotDmg });
            } 
            else if (EFFECTS[id]) {
                curTarget.addEffect(EFFECTS[id], val, { duration: dur });
                if ((id === 'DAZE' || id === 'SPEED') && curTarget === target) this.updateQueueInitiative();
            }
        });
    }

    shuffleUnits(side) {
        let alive = this.units.filter(u => u.side === side && !u.isDead);
        if (alive.length <= 1) return;
        this.log(`[ПЕРЕМЕШИВАНИЕ] Строй ${side === 'player' ? 'погруженцев' : 'врагов'} нарушен!`);
        for (let i = alive.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [alive[i], alive[j]] = [alive[j], alive[i]];
        }
        alive.forEach((unit, idx) => { unit.posIdx = idx + 1; });
    }

    finalizeSkill(attacker, primaryTarget, skill) {
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let effectiveBase = (attacker.equipment && attacker.equipment.leftHand === null) ? Math.round(weaponBase * 1.3) : weaponBase;

        if (skill.id === 'rapidFire') {
            attacker.modifyEffect('combo', -1);
            attacker.addEffect(EFFECTS.RAPIDFIRE, 3);
            this.log(`[СКОРОСТРЕЛЬНОСТЬ] ${attacker.name} готовится!`);
        }
        
        SkillLogic.applyPostStrikeModifiers(
            this, attacker, primaryTarget, skill, effectiveBase, 
            this.lastLucky, this.lastUnlucky, this.lastCrit
        );

        if (skill && skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill && skill.moveTarget && primaryTarget !== attacker) this.moveUnit(primaryTarget, skill.moveTarget);
        this.nextTurn();
    }

    performBasicMove(targetAlly) {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        
        let active = this.getActiveUnit();
        if (active.side === 'player') {
            active.stamina = Math.max(0, active.stamina - 3);
        }

        this.shiftUnits(active, targetAlly.posIdx);
        setTimeout(() => this.nextTurn(), 600);
    }

    performRest() {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        let active = this.getActiveUnit();
        
        if (active.side === 'player') {
            active.stamina = Math.min(active.maxStamina, active.stamina + 15);
            window.spawnDamageText("+15 СИЛЫ", active.x + 20, active.y + 10, "#66ff88");
        }

        this.log(`${active.name} отдыхает и восстанавливает дыхание.`);
        window.spawnDamageText("ОТДЫХ", active.x + 20, active.y - 40, "#aaa");
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
                    let wLvl = watcher.equipment?.rightHand?.level || 1;
                    let multiplier = (wLvl >= 3) ? 1.2 : 1.0;

                    let finalDmg = Math.round(baseDmg * multiplier);
                    watcher.offsetX = watcher.side === 'player' ? 30 : -30;
                    
                    setTimeout(() => {
                        unit.takeDamage(finalDmg);
                        window.spawnDamageText(`-${finalDmg}`, unit.x + 20, unit.y - 20, "#ffbf00"); 
                    }, 150);
                    watcher.modifyEffect('noOneStepFurther', -1);
                });
            }
            this.shiftUnits(unit, newPos);
        }
    }

    shiftUnits(movingUnit, targetPos) {
        if (movingUnit.isEnvironment) return;
        const side = movingUnit.side;
        const oldPos = movingUnit.posIdx;
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
        this.state = 'EXECUTING';
        enemy.offsetX = -40; 

        let action = EnemyAILogic.decideEnemyAction(enemy, this);

        if (!action || !action.skill) {
            this.log(`<span style="color:#aaa">${enemy.name} перегруппировывается...</span>`);
            window.spawnDamageText("ДВИЖЕНИЕ", enemy.x, enemy.y - 40, "#aaa");
            this.moveUnit(enemy, -1); 
            setTimeout(() => this.nextTurn(), 800);
            return;
        }

        this.selectedSkill = action.skill;
        this.executeSkill(enemy, action.target);
    }

    nextTurn() {
        let active = this.getActiveUnit();

        if (active && active.name.includes("Мать") && !active.isDead) {
            active.addEffect(EFFECTS.COMBO, 2);
            window.spawnDamageText("КОМБО (+2)", active.x, active.y - 40, "#4affab");
            this.log(`[ЭЛЕКТРОСЕТЬ] Мать восполняет энергию пещеры!`);
        }

        if (active && !active.isDead && active.hasEffect('courage')) {
            this.log(`<span style="color:#ffbf00">[КУРАЖ] ${active.name.toUpperCase()} делает дополнительный ход!</span>`);
            active.modifyEffect('courage', -1);
            this.state = 'IDLE';
            this.startTurn();
            return;
        }

        if (active && !active.isDead) active.tickEffectsByTrigger('turnEnd');
        this.autoShiftUnits();
        
        let justFinished = active;
        this.turnQueue.shift();
        this.processOverwatch(justFinished);
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
                        let finalDmg = Math.round(baseDmg);
                        archer.offsetX = 30; 
                        
                        setTimeout(() => {
                            target.takeDamage(finalDmg);
                            window.spawnDamageText(`-${finalDmg}`, target.x + 20, target.y - 20, '#fff');
                            if (target.isDead) this.autoShiftUnits();
                        }, 150);
                    }
                });
                setTimeout(() => this.checkWinAndContinue(), 600);
                return; 
            }
        }
        this.checkWinAndContinue();
    }

    checkWinAndContinue() {
        this.state = 'IDLE';
        const players = this.units.filter(u => u.side === 'player' && !u.isDead).length;
        // чтобы кристалл не мешал завершить бой
        const enemies = this.units.filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment).length;
        
        if (players === 0 || enemies === 0) { 
            this.state = 'EXECUTING';

            // затемнение
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
                        adv.hp = 0;
                        adv.stamina = 0;
                        adv.minExpeditionHp = 0;
                        adv.minExpeditionStamina = 0;
                    });
                    SceneManager.changeScene(ExploreScene);
                } else {
                    GameState.isReturningFromBattle = true;
                    ExpeditionManager.battleCompleted = true; // Сбрасываем угрозу экспедиции

                    const deadEnemies = this.units.filter(u => u.side === 'enemy' && u.isDead);
                    const drops = [];

                    // создание трофеев по типам врагов и с некоторой вероятностью
                    deadEnemies.forEach(e => {
                        const nameLower = e.name.toLowerCase();

                        if (nameLower.includes("фритта")) {
                            drops.push("tickHusk");
                            if (Math.random() < 0.35) drops.push("intactFrit");
                        }
                        else if (nameLower.includes("стеклянный паук")) {
                            if (Math.random() < 0.40) drops.push("glassSpiderHead");
                            if (Math.random() < 0.60) drops.push("conductiveWeb");
                        }
                        else if (nameLower.includes("амальгама")) {
                            if (Math.random() < 0.30) drops.push("amalgamSpiderHead");
                            if (Math.random() < 0.50) drops.push("amalgamSpiderLeg");
                        }
                        else if (nameLower.includes("витраж")) {
                            if (Math.random() < 0.30) drops.push("stainedGlassSpiderHead");
                            if (Math.random() < 0.50) drops.push("stainedGlassCarapace");
                        }
                        else if (nameLower.includes("мать")) {
                            drops.push("swarmMotherAcid");
                            if (Math.random() < 0.50) drops.push("conductiveWeb");
                        }
                    });

                    // сбор клещей с кристалла
                    const crystal = this.units.find(u => u.isEnvironment || u.name.toLowerCase().includes("пьезо"));
                    if (crystal) {
                        const mitesEffect = crystal.getEffect('mites');
                        const mitesCount = mitesEffect ? mitesEffect.count : 0;
                        const halfMites = Math.floor(mitesCount / 2);

                        if (halfMites > 0) {
                            for (let m = 0; m < halfMites; m++) {
                                if (Math.random() < 0.30) {
                                    drops.push("intactPincers");
                                } else {
                                    drops.push("tickHusk");
                                }
                            }
                            this.log(`[СБОР] С кристалла успешно собрано ${halfMites} кремниевых клещей!`);
                        }
                    }

                    drops.forEach(key => {
                        const itemData = LOOT.battlePrey?.[key];
                        if (itemData) {
                            const item = {
                                key: key,
                                ...itemData,
                                category: 'battlePrey',
                                type: 'loot',
                                id: `found_battle_${Date.now()}_${Math.random()}`
                            };
                            ExpeditionManager.foundItems.push(item);
                        }
                    });

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
                    mother.hp = Math.min(mother.maxHp, mother.hp + 16); 
                    window.spawnDamageText("+16 HP", mother.x, mother.y, "#4affab"); 
                }
                else if (dName.includes("стеклянный")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 8); 
                    mother.addEffect(EFFECTS.COMBO, 1); 
                    window.spawnDamageText("+8 HP", mother.x, mother.y, "#4affab"); 
                }
                else if (dName.includes("амальгам")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 8); 
                    mother.addEffect(EFFECTS.DODGE, 1); 
                    window.spawnDamageText("+8 HP", mother.x, mother.y, "#4affab"); 
                }
                else if (dName.includes("витраж")) { 
                    mother.hp = Math.min(mother.maxHp, mother.hp + 15); 
                    mother.addEffect(EFFECTS.ARMOR, 4); 
                    window.spawnDamageText("+15 HP", mother.x, mother.y, "#4affab"); 
                }
                this.log(`[ПЕРЕРАБОТКА] Мать поглощает останки ${deadUnit.name.substring(0, 5)}!`);
            }
        }
    }
}