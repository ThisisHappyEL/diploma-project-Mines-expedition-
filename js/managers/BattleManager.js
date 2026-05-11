import { EFFECTS } from '../data/battleData/effects.js';
import { SkillLogic } from './SkillLogic.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnQueue = []; 
        this.baseInitiativeMap = new Map();
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('log-panel');
        this.state = 'IDLE'; 
        this.lastDiff = 0; 
        this.round = 1;
    }

    log(msg) {
        if (!this.logPanel) return;
        this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    getActiveUnit() { return this.turnQueue[0] || null; }

    startBattle() { 
        this.log("БОЙ НАЧИНАЕТСЯ!"); 
        
        // ВЫДАЧА НАЧАЛЬНОГО БОЕЗАПАСА
        this.units.forEach(u => {
            if (u.side === 'player' && u.equipment?.rightHand?.skills?.some(s => ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt'].includes(s.id))) {
                // Симулируем "бросок" против самого сильного врага (как при перезарядке)
                let enemies = this.units.filter(e => e.side !== u.side);
                let dStatFinal = 0;
                if (enemies.length > 0) {
                    let strongestEnemy = enemies.reduce((prev, current) => (prev.combatStat > current.combatStat) ? prev : current);
                    dStatFinal = Number(strongestEnemy.combatStat);
                }
                
                let aStatFinal = Number(u.combatStat) + (u.stats?.atkArmor || 0);
                let diff = (aStatFinal + 3) - (dStatFinal + 3); // Средний бросок 3 на 3
                
                let ammoCount = 1;
                if (diff >= 5) ammoCount = 2;
                if (diff >= 10) ammoCount = 3;
                if (diff <= -5) ammoCount = 0;
                
                if (ammoCount > 0) u.addEffect(EFFECTS.AMMO, ammoCount);
            }
        });

        this.generateTurnQueue(); 
        this.startTurn(); 
    }

    generateTurnQueue() {
        let aliveUnits = this.units.filter(u => !u.isDead);
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
            // ИСПРАВЛЕНИЕ: Гарантированный первый/последний ход
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

        if (active.hasEffect('stun')) {
            this.log(`<span style="color:#ffbf00">${active.name.toUpperCase()} ПРОПУСКАЕТ ХОД.</span>`);
            active.modifyEffect('stun', -1); 
            window.spawnDamageText("ПРОПУСК", active.x, active.y - 60, "#aaa");
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 1000); 
            return;
        }

        if (active.hasEffect('fear')) {
            this.log(`<span style="color:#b19cd9">[ИСПУГ] ${active.name.toUpperCase()} в панике атакует и отступает!</span>`);
            active.modifyEffect('fear', -1);
            
            let panicTarget = this.units.find(u => u.side !== active.side && u.posIdx === 1 && !u.isDead);
            if (panicTarget) {
                let panicSkill = { name: "Панический удар", damageCoef: 1.0, effect: null };
                let weaponBase = active.equipment?.rightHand?.baseDamage || 10;
                let effectiveBase = (active.equipment && active.equipment.leftHand === null) ? Math.round(weaponBase * 1.3) : weaponBase;
                
                this.applyDamageLogic(active, panicTarget, panicSkill, effectiveBase, 0, 1);
                
                // ИСПРАВЛЕНИЕ: Если мы убили героя, сразу схлопываем строй!
                if (panicTarget.isDead) this.autoShiftUnits();
            }
            
            this.moveUnit(active, 2); 
            
            setTimeout(() => { this.turnQueue.shift(); this.state = 'IDLE'; this.startTurn(); }, 1000); 
            return;
        }

        let dot = active.getEffect('dot');
        if (dot) {
            let dmg = dot.damagePerTurn || 2;
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
        
        // ИСПРАВЛЕНИЕ: Больше нет авто-каста на себя. Игрок всегда должен кликнуть!
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

            // ИСПРАВЛЕНИЕ: Логика выбора цели
            if (skill.targetSelf && targetUnit !== active) return; // Если скилл на себя - клик только по себе

            if (!skill.targetSelf) {
                if (skill.targetAny) {
                    // Разрешаем кликать по кому угодно
                } else if (skill.targetAlly && targetUnit.side !== active.side) {
                    return; // Только по своим
                } else if (!skill.targetAlly && !skill.targetAny && targetUnit.side === active.side) {
                    return; // Только по врагам
                }
            }

            // Проверка позиции цели (если это не каст на себя)
            if (!skill.targetSelf && skill.targetPos && !skill.targetPos.includes(targetUnit.posIdx)) return;

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
        
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let effectiveBase = weaponBase;
        if (attacker.equipment && attacker.equipment.leftHand === null) effectiveBase = Math.round(weaponBase * 1.3);

        // Применяем комбо-метку
        if ((primaryTarget.hasEffect('mark') || attacker.hasEffect('combo')) && skill.comboOrMarkImproveable && skill.comboChanges) {
            Object.assign(skill, skill.comboChanges);
            if (primaryTarget.hasEffect('mark')) primaryTarget.modifyEffect('mark', -1); 
            if (attacker.hasEffect('combo')) attacker.modifyEffect('combo', -1); 
            this.log(`[СИНЕРГИЯ] Использовано преимущество!`);
        }

        let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt'].includes(skill.id);
        if (needsAmmo) {
            attacker.modifyEffect('ammo', -1);
            this.log(`[-1 Болт]`);
        }

        // ВЫСТРЕЛ НАВСКИДКУ (Рандомная цель)
        if (skill.randomTarget) {
            let possibleTargets = this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx));
            if (possibleTargets.length > 0) {
                primaryTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                this.log(`[НАВСКИДКУ] Болт летит наугад в ${primaryTarget.name}!`);
            }
        }

        // 1. ПРИМЕНЯЕМ ВСЕ КАСТОМНЫЕ МОДИФИКАТОРЫ (вынесено в отдельный файл)
        SkillLogic.applyPreStrikeModifiers(this, attacker, primaryTarget, skill, effectiveBase);

        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 

        // 2. ПРОВЕРЯЕМ, ЕСТЬ ЛИ КАСТОМНЫЙ ЦИКЛ УДАРОВ (Вихрь и т.д.)
        const isCustomHandled = SkillLogic.executeCustomSkillFlow(this, attacker, primaryTarget, skill, effectiveBase);
        if (isCustomHandled) return; // Если скилл сам все отыграл (через setTimeout), прерываем стандартный поток

        // 3. СТАНДАРТНАЯ ЛОГИКА УДАРОВ
        let targets = skill.targetSelf ? [attacker] : (skill.isAoE ? this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx)) : [primaryTarget]);
        let hitsCount = (skill.damageCoef === 0) ? 1 : (skill.hits || 1);

        for (let i = 0; i < hitsCount; i++) {
            setTimeout(() => {
                targets.forEach(target => {
                    this.applyDamageLogic(attacker, target, skill, effectiveBase, i, hitsCount);
                });

                if (i === hitsCount - 1) {
                    setTimeout(() => this.finalizeSkill(attacker, primaryTarget, skill), 500);
                }
            }, i * 300);
        }
    }

    getPrediction(attacker, target, skill) {
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let hasOffhandBonus = (attacker.equipment && attacker.equipment.leftHand === null);
        let effectiveBase = hasOffhandBonus ? Math.round(weaponBase * 1.3) : weaponBase;

        let simSkill = JSON.parse(JSON.stringify(skill));
        
        if ((target.hasEffect('mark') || attacker.hasEffect('combo')) && simSkill.comboOrMarkImproveable && simSkill.comboChanges) {
            let newEffect = simSkill.effect ? simSkill.effect : '';
            if (simSkill.comboChanges.effect) {
                newEffect = newEffect ? newEffect + ', ' + simSkill.comboChanges.effect : simSkill.comboChanges.effect;
            }
            Object.assign(simSkill, simSkill.comboChanges);
            simSkill.effect = newEffect;
        }

        SkillLogic.applyPreStrikeModifiers(this, attacker, target, simSkill, effectiveBase, true);

        let aStatBase = Number(attacker.combatStat);
        let aStatMod = (attacker.hasEffect('speed') ? Math.round(aStatBase*0.25) : 0) - (attacker.hasEffect('daze') ? Math.round(aStatBase*0.25) : 0);
        let dStatBase = 0, dStatMod = 0;
        
        let isFriendlyCast = (simSkill.targetSelf || simSkill.targetAlly || (target && target.side === attacker.side));

        if (isFriendlyCast) {
            let enemies = this.units.filter(u => u.side !== attacker.side && !u.isDead);
            if (enemies.length > 0) {
                let strongestEnemy = enemies.reduce((prev, current) => (prev.combatStat > current.combatStat) ? prev : current);
                dStatBase = Number(strongestEnemy.combatStat);
                dStatMod = (strongestEnemy.hasEffect('speed') ? Math.round(dStatBase*0.25) : 0) - (strongestEnemy.hasEffect('daze') ? Math.round(dStatBase*0.25) : 0);
            }
        } else {
            dStatBase = Number(target.combatStat);
            dStatMod = (target.hasEffect('speed') ? Math.round(dStatBase*0.25) : 0) - (target.hasEffect('daze') ? Math.round(dStatBase*0.25) : 0);
        }
        
        let aStatFinal = aStatBase + aStatMod;
        let dStatFinal = dStatBase + dStatMod;
        
        let aArmorBonus = attacker.stats?.atkArmor || 0;
        let dArmorBonus = isFriendlyCast ? 0 : (target.stats?.defArmor || 0);

        let baseDiff = (aStatFinal + aArmorBonus) - (dStatFinal + dArmorBonus);

        let outcomes = {
            "КРИТ": { count: 0, mult: 2.0, color: '#ff00ff', flags: [true, false, true] },
            "УДАЧНЫЙ": { count: 0, mult: 1.5, color: '#4affab', flags: [true, false, false] },
            "ОБЫЧНЫЙ": { count: 0, mult: 1.0, color: '#fff', flags: [false, false, false] },
            "НЕУДАЧНЫЙ": { count: 0, mult: 0.5, color: '#ffaa44', flags: [false, true, false] },
            "ПРОМАХ": { count: 0, mult: 0, color: '#aaa', flags: [false, true, false] }
        };

        for (let a = 1; a <= 5; a++) {
            for (let d = 1; d <= 5; d++) {
                let diff = baseDiff + (a - d);
                if (diff >= 10 || (diff >= 5 && attacker.hasEffect('power'))) outcomes["КРИТ"].count++;
                else if (diff >= 5) outcomes["УДАЧНЫЙ"].count++;
                else if (diff <= -10 || (diff <= -5 && attacker.hasEffect('weakness'))) outcomes["ПРОМАХ"].count++;
                else if (diff <= -5) outcomes["НЕУДАЧНЫЙ"].count++;
                else outcomes["ОБЫЧНЫЙ"].count++;
            }
        }

        let result = [];
        let hitsCount = simSkill.hits || 1;

        for (let type in outcomes) {
            if (outcomes[type].count > 0) {
                let prob = Math.round((outcomes[type].count / 25) * 100);
                
                let rawDmg = effectiveBase * simSkill.damageCoef * outcomes[type].mult;
                let finalSingleDmg = Math.round(rawDmg);

                // Компактная формула расчета (как в левом верхнем углу тултипа)
                let formulaParts = [];
                // Если база 10 и пустая левая рука (13), пишем просто "13" как стартовую базу
                formulaParts.push(`${effectiveBase}`);
                
                // Если коэф. скилла не 1.0, пишем его (например x0.6)
                if (simSkill.damageCoef !== 1 && simSkill.damageCoef !== 0) formulaParts.push(`x${simSkill.damageCoef}`);
                
                // Если удача не 1.0, пишем ее (например x1.5)
                if (outcomes[type].mult !== 1 && type !== "ПРОМАХ") formulaParts.push(`x${outcomes[type].mult}`);

                if (attacker.hasEffect('weakness')) { finalSingleDmg = Math.round(finalSingleDmg * 0.5); formulaParts.push(`x0.5(Слаб)`); }
                if (attacker.hasEffect('power')) { finalSingleDmg = Math.round(finalSingleDmg * 1.5); formulaParts.push(`x1.5(Сила)`); }
                if (target.hasEffect('vulnerable')) { finalSingleDmg = Math.round(finalSingleDmg * 1.5); formulaParts.push(`x1.5(Уязв)`); }
                if (target.hasEffect('block') && !simSkill.effect?.includes('ignorArmor')) { finalSingleDmg = Math.round(finalSingleDmg * 0.5); formulaParts.push(`x0.5(Блок)`); }
                
                if (type === "ПРОМАХ") { finalSingleDmg = 0; formulaParts = ["0"]; }

                let formulaStr = formulaParts.length > 1 ? `<span style="color:#666; font-size:10px; margin-right:4px;">(${formulaParts.join('')})</span>` : '';
                if (simSkill.damageCoef === 0) formulaStr = '';

                // ИСПРАВЛЕНИЕ: Уточняем влияние Силы и Слабости на результат броска
                let displayType = type;
                if (type === "КРИТ" && attacker.hasEffect('power')) displayType = "КРИТ <span style='color:#ffbf00; font-size:10px;'>(от Силы)</span>";
                if (type === "ПРОМАХ" && attacker.hasEffect('weakness')) displayType = "ПРОМАХ <span style='color:#aaa; font-size:10px;'>(от Слаб.)</span>";

                result.push({ 
                    type: displayType, 
                    prob, 
                    singleDmg: finalSingleDmg, 
                    totalDmg: finalSingleDmg * hitsCount, 
                    hits: hitsCount,
                    formula: formulaStr, // <--- Передаем строку формулы
                    color: outcomes[type].color,
                    isL: outcomes[type].flags[0], isU: outcomes[type].flags[1], isC: outcomes[type].flags[2]
                });
            }
        }

        result.sort((a, b) => b.prob - a.prob);
        return { list: result, simSkill: simSkill, expectedDamage: result[0]?.totalDmg || 0 };
    }

    applyDamageLogic(attacker, target, skill, effectiveBase, i, hitsCount) {
        if (target.isDead) {
            if (i === hitsCount - 1 && skill.effect) {
                this.applySkillEffects(target, skill.effect, false, false, false, attacker); 
            }
            return;
        }

        let isFriendlyCast = (skill.targetSelf || skill.targetAlly || (target && target.side === attacker.side));

        if (skill.damageCoef === 0 && isFriendlyCast) {
            let aStatBase = Number(attacker.combatStat);
            let aStatMod = (attacker.hasEffect('speed') ? Math.round(aStatBase*0.25) : 0) - (attacker.hasEffect('daze') ? Math.round(aStatBase*0.25) : 0);
            let dStatBase = 0, dStatMod = 0;
            
            let enemies = this.units.filter(u => u.side !== attacker.side && !u.isDead);
            if (enemies.length > 0) {
                let strongestEnemy = enemies.reduce((prev, current) => (prev.combatStat > current.combatStat) ? prev : current);
                dStatBase = Number(strongestEnemy.combatStat);
                dStatMod = (strongestEnemy.hasEffect('speed') ? Math.round(dStatBase*0.25) : 0) - (strongestEnemy.hasEffect('daze') ? Math.round(dStatBase*0.25) : 0);
            }
            
            let diff = (aStatBase + aStatMod + Math.floor(Math.random() * 5) + 1 + (attacker.stats?.atkArmor || 0)) - 
                       (dStatBase + dStatMod + Math.floor(Math.random() * 5) + 1);
            
            let isL = false, isU = false, isC = false;
            let buffText = "БАФФ"; let buffColor = "#ffffff";

            if (diff >= 10 || (diff >= 5 && attacker.hasEffect('power'))) { 
                isL = true; isC = true; buffText = "КРИТ. БАФФ"; buffColor = "#ff00ff";
            } else if (diff >= 5) { 
                isL = true; buffText = "УДАЧНЫЙ БАФФ"; buffColor = "#4affab";
            } else if (diff <= -10 || (diff <= -5 && attacker.hasEffect('weakness'))) { 
                if (i === 0) window.spawnDamageText("ПРОМАХ", target.x, target.y - 40, "#aaa");
                return;
            } else if (diff <= -5) { 
                isU = true; buffText = "НЕУДАЧНЫЙ БАФФ"; buffColor = "#ffaa44";
            }

            if (i === 0) window.spawnDamageText(buffText, target.x, target.y - 40, buffColor);
            if (i === hitsCount - 1 && skill.effect) {
                this.applySkillEffects(target, skill.effect, isL, isU, isC, attacker);
            }
            return;
        }

        if (target.hasEffect('dodge') && !skill.effect?.includes('ignorEvasion')) {
            target.modifyEffect('dodge', -1);
            window.spawnDamageText("УВОРОТ", target.x + 10, target.y - 40, "#fff"); return;
        }

        let luckMod = 1.0, dmgColor = '#ffffff', hitType = "ОБЫЧНЫЙ";
        let isLucky = false, isUnlucky = false, isCrit = false;
        
        let aStatBase = Number(attacker.combatStat);
        let aDazeMod = attacker.hasEffect('daze') ? Math.round(aStatBase * 0.25) : 0;
        let aSpeedMod = attacker.hasEffect('speed') ? Math.round(aStatBase * 0.25) : 0;
        let aStatMod = aSpeedMod - aDazeMod;

        let dStatBase = 0, dStatMod = 0;

        if (isFriendlyCast) {
            let enemies = this.units.filter(u => u.side !== attacker.side && !u.isDead);
            if (enemies.length > 0) {
                let strongestEnemy = enemies.reduce((prev, current) => (prev.combatStat > current.combatStat) ? prev : current);
                dStatBase = Number(strongestEnemy.combatStat);
                dStatMod = (strongestEnemy.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (strongestEnemy.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
            }
        } else {
            dStatBase = Number(target.combatStat);
            dStatMod = (target.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (target.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
        }

        let aStatFinal = aStatBase + aStatMod;
        let dStatFinal = dStatBase + dStatMod;

        let atkR = Math.floor(Math.random() * 5) + 1; 
        let defR = Math.floor(Math.random() * 5) + 1; 

        let aArmorBonus = attacker.stats?.atkArmor || 0;
        let dArmorBonus = isFriendlyCast ? 0 : (target.stats?.defArmor || 0);

        let diff = (aStatFinal + atkR + aArmorBonus) - (dStatFinal + defR + dArmorBonus);
        this.lastDiff = diff;

        if (diff >= 10 || (diff >= 5 && attacker.hasEffect('power'))) {
            luckMod = 2.0; hitType = "КРИТИЧЕСКИЙ"; isLucky = true; isCrit = true; dmgColor = "#ff00ff";
        } else if (diff >= 5) {
            luckMod = 1.5; hitType = "УДАЧНЫЙ"; isLucky = true; dmgColor = (attacker.side==='player'?'#4affab':'#ff4444');
        } else if (diff <= -10 || (diff <= -5 && attacker.hasEffect('weakness'))) {
            luckMod = 0.0; hitType = "ПРОМАХ"; isUnlucky = true; dmgColor = "#aaa";
        } else if (diff <= -5) {
            luckMod = 0.5; hitType = "НЕУДАЧНЫЙ"; isUnlucky = true; dmgColor = (attacker.side==='player'?'#ff4444':'#4affab');
        }
        
        let aModStr = aStatMod !== 0 ? `<span style="color:#ffaa44">(${aStatMod > 0 ? '+'+aStatMod : aStatMod} от эфф)</span>` : '';
        let dModStr = dStatMod !== 0 ? `<span style="color:#ffaa44">(${dStatMod > 0 ? '+'+dStatMod : dStatMod} от эфф)</span>` : '';
        let atkStr = `${aStatBase}${aModStr} + ${atkR}🎲 + ${aArmorBonus}🛡️`;
        let defStr = `${dStatBase}${dModStr} + ${defR}🎲 + ${dArmorBonus}🛡️`;
        
        this.log(`Атака [${atkStr}] vs Защита [${defStr}]`);
        let colorDiff = diff >= 5 ? '#4affab' : (diff <= -5 ? '#ff4444' : '#fff');
        this.log(`Итог: Разница <span style="color:${colorDiff}">${diff}</span> -> <b>${hitType}</b>`);

        if (hitType === "ПРОМАХ") { 
            window.spawnDamageText("ПРОМАХ", target.x + 10, target.y - 40, "#aaa"); 
            return; 
        }
        
        let baseDmgStr = effectiveBase;
        let coefStr = skill.damageCoef;
        let luckStr = luckMod;
        let rawDmg = effectiveBase * skill.damageCoef * luckMod;
        let finalDmg = Math.round(rawDmg);
        
        let dmgLogParts = [];
        if (attacker.hasEffect('weakness')) { finalDmg = Math.round(finalDmg * 0.5); dmgLogParts.push("x0.5 Слаб"); }
        if (attacker.hasEffect('power')) { finalDmg = Math.round(finalDmg * 1.5); dmgLogParts.push("x1.5 Сила"); }
        if (target.hasEffect('vulnerable')) { finalDmg = Math.round(finalDmg * 1.5); dmgLogParts.push("x1.5 Уязв"); }
        if (target.hasEffect('block') && !skill.effect?.includes('ignorArmor')) { 
            finalDmg = Math.round(finalDmg * 0.5); 
            target.modifyEffect('block', -1); 
            dmgLogParts.push("x0.5 Блок");
        }
        
        let modsStr = dmgLogParts.length > 0 ? ` => [${dmgLogParts.join(', ')}]` : '';
        this.log(`🗡 Урон: (${effectiveBase} x ${skill.damageCoef}) x ${luckMod} Удача = ${Math.round(rawDmg)}${modsStr} => <b>${finalDmg}</b>`);

        if (i === 0) {
            if (attacker.hasEffect('power')) attacker.modifyEffect('power', -1);
            if (attacker.hasEffect('weakness')) attacker.modifyEffect('weakness', -1);
        }

        if (finalDmg > 0) {
            target.takeDamage(finalDmg);
            window.spawnDamageText(`-${finalDmg}`, target.x + 20, target.y - 20, dmgColor);
            
            target.tickEffectsByTrigger('hitReceived');
            attacker.tickEffectsByTrigger('hitGiven');
            
            if (target.hasEffect('aGapingWound')) {
                target.modifyEffect('aGapingWound', -1);
                target.addEffect(EFFECTS.DOT, 3, { damagePerTurn: 2 });
                this.log(`[РАНА] Удар вскрыл зияющую рану!`);
            }

            if (target.hasEffect('instability') && !target.isDead) {
                let shift = 0;
                let alliesCount = this.units.filter(u => u.side === target.side && !u.isDead).length;
                
                if (target.posIdx === 1) shift = 1; 
                else if (target.posIdx === alliesCount) shift = -1; 
                else shift = Math.random() > 0.5 ? 1 : -1; 

                this.log(`[НЕУСТОЙЧИВОСТЬ] ${target.name} теряет равновесие!`);
                this.moveUnit(target, shift);
            }

            if (target.isDead) {
                this.log(`☠️ ${target.name.toUpperCase()} ПОГИБАЕТ!`);
                this.turnQueue = this.turnQueue.filter(u => !u.isDead);
                this.uiCallback(this.getActiveUnit(), [], this);
            }
        }

        if (i === hitsCount - 1) {
            if (skill.effect) this.applySkillEffects(target, skill.effect, isLucky, isUnlucky, isCrit, attacker);
            if (!target.isDead) this.checkParrying(attacker, target, skill); 
        }
    }

    checkParrying(attacker, target, skill) {
        if (target.hasEffect('parry') && !skill.effect?.includes('ignorParry') && attacker !== target && !skill.targetAlly) {
            target.modifyEffect('parry', -1); // <-- ИСПРАВЛЕНО ЗДЕСЬ
            let cDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(cDmg);
            window.spawnDamageText(`-${cDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
            this.log(`[ПАРРИРОВАНИЕ] ${target.name} наносит ответный удар!`);
        }
    }

    applySkillEffects(target, effectString, isLucky, isUnlucky, isCrit, attacker = null) {
        if (!effectString) return;
        const NO_SCALE = ['SHUFFLE', 'MOVETARGET', 'MOVESELF'];
        
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
            if (isCrit) dur += 2;
            else if (isLucky) dur += 1;
            else if (isUnlucky) dur -= 1;
            dur = Math.max(1, dur);

            if (id === 'SHUFFLE') {
                this.shuffleUnits(curTarget.side);
            } 
            else if (id === 'DOT') {
                let dotDmg = parseInt(params[2]) || 2;
                
                // ИСПРАВЛЕНИЕ: Масштабируем УРОН кровотечения в зависимости от броска
                if (isCrit) dotDmg += 2;
                else if (isLucky) dotDmg += 1;
                else if (isUnlucky) dotDmg -= 1;
                dotDmg = Math.max(1, dotDmg); // Урон от ДОТа не может быть меньше 1

                curTarget.addEffect(EFFECTS.DOT, 1, { duration: val, damagePerTurn: dotDmg });
            } else if (EFFECTS[id]) {
                curTarget.addEffect(EFFECTS[id], val, { duration: dur }); // Передаем новую длительность!
                if ((id === 'DAZE' || id === 'SPEED') && curTarget === target) this.updateQueueInitiative();
            }
        });
    }

    // Вспомогательный метод для Дрожи Земли
    shuffleUnits(side) {
        let alive = this.units.filter(u => u.side === side && !u.isDead);
        if (alive.length <= 1) return;
        this.log(`[ПЕРЕМЕШИВАНИЕ] Строй ${side === 'player' ? 'погруженцев' : 'врагов'} нарушен!`);
        
        // Алгоритм Фишера-Йетса для самого массива юнитов
        for (let i = alive.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [alive[i], alive[j]] = [alive[j], alive[i]];
        }
        
        // Раздаем новые позиции по порядку (1, 2, 3, 4...)
        alive.forEach((unit, idx) => {
            unit.posIdx = idx + 1;
        });
    }

    finalizeSkill(attacker, primaryTarget, skill) {
        // Вычисляем базу заново
        let weaponBase = attacker.equipment?.rightHand?.baseDamage || 10;
        let effectiveBase = (attacker.equipment && attacker.equipment.leftHand === null) ? Math.round(weaponBase * 1.3) : weaponBase;
        
        // Запускаем этап ПОСЛЕ удара (Рикошет и т.д.)
        SkillLogic.applyPostStrikeModifiers(this, attacker, primaryTarget, skill, effectiveBase);

        if (skill && skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill && skill.moveTarget && primaryTarget !== attacker) this.moveUnit(primaryTarget, skill.moveTarget);
        this.nextTurn();
    }

    performBasicMove(targetAlly) {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        this.shiftUnits(this.getActiveUnit(), targetAlly.posIdx);
        setTimeout(() => this.nextTurn(), 600);
    }

    performRest() {
        this.state = 'EXECUTING';
        this.uiCallback(null, [], this);
        let active = this.getActiveUnit();
        this.log(`${active.name} отдыхает.`);
        window.spawnDamageText("ОТДЫХ", active.x + 20, active.y - 40, "#aaa");
        setTimeout(() => this.nextTurn(), 600);
    }

    moveUnit(unit, offset) {
        let newPos = Math.max(1, Math.min(4, unit.posIdx + offset));
        
        if (newPos < unit.posIdx) {
                let overwatchers = this.units.filter(u => u.side !== unit.side && u.hasEffect('noOneStepFurther') && !u.isDead);
                
                overwatchers.forEach(watcher => {
                    this.log(`<span style="color:#ffbf00">[НИ ШАГУ ДАЛЬШЕ!] ${watcher.name} бьет приблизившегося врага!</span>`);
                    
                    let baseDmg = watcher.equipment?.rightHand?.baseDamage || 10;
                    if (watcher.equipment && watcher.equipment.leftHand === null) baseDmg = Math.round(baseDmg * 1.3);
                    
                    let stanceEffect = watcher.getEffect('noOneStepFurther');
                    
                    // ИСПРАВЛЕНИЕ: Достаем множитель. Если стойка наложена скиллом 3-4 уровня, там будет что-то вроде noOneStepFurther-3-12 (где 12 это 1.2)
                    // Мы парсили это как val, но для урона мы заложили это в сам эффект (или достанем из названия)
                    let multiplier = 1.0;
                    if (stanceEffect && stanceEffect.base.damageCoef) multiplier = stanceEffect.base.damageCoef; // Если прописано жестко
                    // Если множитель передан через '-' (например noOneStepFurther-1-12) мы это не парсили. 
                    // Сделаем проще: если у оружия 3-4 уровень, даем бонус 1.2 (как ты и просил).
                    let wLvl = watcher.equipment?.rightHand?.level || 1;
                    if (wLvl >= 3) multiplier = 1.2;

                    let atkR = Math.floor(Math.random() * 5) + 1;
                    let defR = Math.floor(Math.random() * 5) + 1;
                    let diff = (watcher.combatStat + atkR) - (unit.combatStat + defR);
                    
                    let luckMod = 1.0;
                    if (diff >= 5) luckMod = 1.5;
                    if (diff <= -5) luckMod = 0.5;

                    let finalDmg = Math.round(baseDmg * multiplier * luckMod);
                    
                    // ИСПРАВЛЕНИЕ: АНИМАЦИЯ ТЫЧКА (Копейщик дергается в сторону врага)
                    watcher.offsetX = watcher.side === 'player' ? 30 : -30;
                    
                    setTimeout(() => {
                        if (finalDmg > 0) {
                            unit.takeDamage(finalDmg);
                            window.spawnDamageText(`-${finalDmg}`, unit.x + 20, unit.y - 20, '#ffbf00'); 
                        } else {
                            window.spawnDamageText("ПРОМАХ", unit.x + 10, unit.y - 40, "#aaa");
                        }
                    }, 150); // Урон прилетает чуть позже, на пике рывка
                    
                    watcher.modifyEffect('noOneStepFurther', -1);
                });

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
        let target = this.units.find(u => u.side === 'player' && !u.isDead);
        if (target) {
            this.selectedSkill = (enemy.skills && enemy.skills.length > 0) ? enemy.skills[0] : { name: "Укус", damageCoef: 0.5 };
            this.executeSkill(enemy, target);
        } else setTimeout(() => this.nextTurn(), 1000);
    }

    nextTurn() {
        let active = this.getActiveUnit();

        if (active && !active.isDead && active.hasEffect('courage')) {
            this.log(`<span style="color:#ffbf00">[КУРАЖ] ${active.name.toUpperCase()} делает дополнительный ход!</span>`);
            active.modifyEffect('courage', -1);
            this.state = 'IDLE';
            this.startTurn();
            return;
        }

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