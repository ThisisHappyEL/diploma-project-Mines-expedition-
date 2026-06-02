import { EFFECTS } from "../../data/battleData/effects.js";

export const BattleDamageCalculator = {
    calculateBaseDiff(manager, attacker, target, skill) {
        let isFriendlyCast = (skill.targetSelf || skill.targetAlly || (target && target.side === attacker.side));
        
        let aStatBase = Number(attacker.combatStat);
        let aStatMod = (attacker.hasEffect('speed') ? Math.round(aStatBase * 0.25) : 0) - (attacker.hasEffect('daze') ? Math.round(aStatBase * 0.25) : 0);
        let aFinal = aStatBase + aStatMod + (attacker.stats?.atkArmor || 0);

        let dFinal = 0;
        if (isFriendlyCast) {
            let enemies = manager.units.filter(u => u.side !== attacker.side && !u.isDead);
            if (enemies.length > 0) {
                let strongest = enemies.reduce((prev, curr) => (prev.combatStat > curr.combatStat) ? prev : curr);
                let dStatBase = Number(strongest.combatStat);
                let dStatMod = (strongest.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (strongest.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
                dFinal = dStatBase + dStatMod; 
            }
        } else {
            let dStatBase = Number(target.combatStat);
            let dStatMod = (target.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (target.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
            dFinal = dStatBase + dStatMod + (target.stats?.defArmor || 0);
        }
        return aFinal - dFinal;
    },

    evaluateHit(manager, attacker, target, skill, effectiveBase, diff, isPrediction = false) {
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
    },

    getPrediction(manager, attacker, target, skill) {
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

        this.applyPreStrikeModifiersFromCalculator(manager, attacker, target, simSkill, effectiveBase);

        let baseDiff = this.calculateBaseDiff(manager, attacker, target, simSkill);
        let outcomes = { "КРИТ": { count: 0 }, "УДАЧНЫЙ": { count: 0 }, "ОБЫЧНЫЙ": { count: 0 }, "НЕУДАЧНЫЙ": { count: 0 }, "ПРОМАХ": { count: 0 } };

        for (let a = 1; a <= 5; a++) {
            for (let d = 1; d <= 5; d++) {
                let diff = baseDiff + (a - d);
                let hitResult = this.evaluateHit(manager, attacker, target, simSkill, effectiveBase, diff, true);
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

                result.push({ 
                    type, prob, 
                    singleDmg: sample.finalDmg, totalDmg: sample.finalDmg * hitsCount, hits: hitsCount,
                    formula: formulaStr, color: sample.displayColor,
                    isL: sample.isL, isU: sample.isU, isC: sample.isC
                });
            }
        }

        result.sort((a, b) => b.prob - a.prob);
        return { list: result, simSkill, expectedDamage: result[0]?.totalDmg || 0 };
    },

    applyPreStrikeModifiersFromCalculator(manager, attacker, target, skill) {
        if (skill.id === 'execution') {
            let tokensCount = target.activeEffects.length;
            if (tokensCount > 0) skill.damageCoef += (tokensCount * 0.1);
        }
        if (skill.id === 'aPrickBecauseOfAFriend' && skill.uniqueConditionReward) {
            let allyInFront = manager.units.find(u => u.side === attacker.side && !u.isDead && u.posIdx < attacker.posIdx && (u.hasEffect('block') || u.hasEffect('parry')));
            if (allyInFront) Object.assign(skill, skill.uniqueConditionReward);
        }
        if (skill.id === 'overhandThrow') {
            let distance = attacker.posIdx + target.posIdx;
            let isSynergy = attacker.hasEffect('combo') || target.hasEffect('mark');
            let step = isSynergy ? 0.2 : 0.15;
            skill.damageCoef = 0.15 + (distance - 2) * step;
        }
    },

    applyDamageLogic(manager, attacker, target, skill, effectiveBase, i, hitsCount) {
        if (target.isEnvironment && skill.damageCoef > 0) {
            let mites = target.getEffect('mites');
            if (mites && mites.count > 0) {
                let burnCount = skill.isAoE ? 2 : 3;
                let actualBurn = Math.min(burnCount, mites.count);
                target.modifyEffect('mites', -(actualBurn));
                window.spawnDamageText(`-${actualBurn} КЛЕЩЕЙ`, target.x + 20, target.y - 20, "#b19cd9");
                manager.log(`[ОЧИСТКА] ${attacker.name} сжигает ${actualBurn} клещей. Осталось: ${target.getEffect('mites')?.count || 0}`);
            }

            if (attacker.side === 'player') {
                let playersInWeb = manager.units.filter(u => u.side === 'player' && u.hasEffect('electroWeb'));
                if (playersInWeb.length > 0) {
                    playersInWeb.forEach(p => {
                        p.activeEffects = p.activeEffects.filter(e => e.base.id !== 'electroWeb');
                        window.spawnDamageText("СВОБОДА!", p.x, p.y - 40, "#4affab");
                    });
                    manager.log(`[ОСВОБОЖДЕНИЕ] Удар по кристаллу обесточил паутину!`);
                }
            }

            manager.syncVitalsToGameState();

            if (skill.isAoE && i === 0) {
                let splash = manager.units.filter(u => u.side !== attacker.side && !u.isDead && !u.isEnvironment && skill.targetPos.includes(u.posIdx));
                splash.forEach(sT => this.applyDamageLogic(manager, sT, skill, effectiveBase, 0, 1));
            }
            return;
        }

        if (target.isDead) return;

        let baseDiff = this.calculateBaseDiff(manager, attacker, target, skill);
        let aRoll = Math.floor(Math.random() * 5) + 1;
        let dRoll = Math.floor(Math.random() * 5) + 1;
        let diff = baseDiff + (aRoll - dRoll);

        let hitResult = this.evaluateHit(manager, attacker, target, skill, effectiveBase, diff, false);
        if (i === 0) { 
            manager.lastLucky = hitResult.isL; 
            manager.lastUnlucky = hitResult.isU; 
            manager.lastCrit = hitResult.isC; 
            manager.lastHitType = hitResult.hitType;
        }

        let isFriendlyCast = (skill.targetSelf || skill.targetAlly || (target && target.side === attacker.side));
        if (skill.damageCoef === 0 && isFriendlyCast) {
            if (hitResult.hitType === "ПРОМАХ") { 
                if (i === 0) window.spawnDamageText("ПРОМАХ", target.x, target.y - 40, "#aaa"); 
                return; 
            }
            let buffText = hitResult.isC ? "КРИТ. БАФФ" : (hitResult.hitType === "НЕУДАЧНЫЙ" ? "СЛАБЫЙ БАФФ" : "БАФФ");
            if (i === 0) window.spawnDamageText(buffText, target.x, target.y - 40, hitResult.displayColor);
            if (i === hitsCount - 1 && skill.effect) manager.applySkillEffects(target, skill.effect, hitResult.isL, hitResult.isU, hitResult.isC, attacker);
            manager.syncVitalsToGameState();
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
            manager.log(logHeader + logMath + `<br/>&nbsp;&nbsp;💨 Промах! Урон не нанесен.`);
        } else {
            let label = hitResult.hitType === "КРИТ" ? "КРИТ!" : (hitResult.hitType === "УДАЧНЫЙ" ? "УДАЧНО" : (hitResult.hitType === "НЕУДАЧНЫЙ" ? "НЕУДАЧНО" : ""));
            if (label && i === 0) window.spawnDamageText(label, target.x + 10, target.y - 45, hitResult.displayColor);
            
            if (hitResult.armorBroken && !target.isDead) {
                target.modifyEffect('armor', -1);
                window.spawnDamageText("-БРОНЯ", target.x + 20, target.y - 65, "#aaa");
            }

            if (target.side === 'player' && attacker.side === 'enemy') {
                target.stamina = Math.max(0, target.stamina - 3);
            }

            let resultStatus;
            let fd = hitResult.finalDmg;
            if (target.hasEffect('swarm')) {
                if (fd >= target.hp) {
                    target.hp = 0; target.modifyEffect('swarm', -1);
                    if (!target.isDead) target.hp = target.maxHp; 
                    window.spawnDamageText(`-1 ОСОБЬ`, target.x, target.y - 20, hitResult.displayColor);
                    resultStatus = `Одна особь погибла! Осталось: ${target.getEffect('swarm')?.count || 0}`;
                } else {
                    target.hp -= fd; window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
                    resultStatus = `HP особи: ${target.hp}/${target.maxHp}`;
                }
                if (!target.isDead) target.offsetX = target.side === 'player' ? -20 : 20;
            } else {
                target.takeDamage(fd); window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
                resultStatus = target.isDead ? "ЦЕЛЬ УНИЧТОЖЕНА" : `Осталось HP: ${target.hp}/${target.maxHp}`;
            }
            
            manager.log(logHeader + logMath + logDmg + `<br/>&nbsp;&nbsp;❤️ <b>Итог:</b> ${resultStatus}`);
            target.tickEffectsByTrigger('hitReceived'); attacker.tickEffectsByTrigger('hitGiven');
            
            if (target.hasEffect('aGapingWound')) {
                target.modifyEffect('aGapingWound', -1); target.addEffect(EFFECTS.DOT, 3, { damagePerTurn: 2 });
            }
            if (target.hasEffect('instability') && !target.isDead) {
                let shift = (target.posIdx === 1) ? 1 : (target.posIdx === 4 ? -1 : (Math.random() > 0.5 ? 1 : -1));
                manager.moveUnit(target, shift);
            }

            manager.syncVitalsToGameState();

            if (target.isDead) {
                manager.turnQueue = manager.turnQueue.filter(u => u !== target);
                manager.uiCallback(manager.getActiveUnit(), [], manager);
                manager.triggerMotherDeathPassive(target);
            }
        }

        if (i === hitsCount - 1) {
            if (skill.effect) manager.applySkillEffects(target, skill.effect, hitResult.isL, hitResult.isU, hitResult.isC, attacker);
            if (!target.isDead) manager.checkParrying(attacker, target, skill); 
            manager.syncVitalsToGameState();
        }
    }
};
