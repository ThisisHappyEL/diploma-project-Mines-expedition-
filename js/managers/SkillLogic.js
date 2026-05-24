import { EFFECTS } from '../data/battleData/effects.js';

export const SkillLogic = {
    
    applyPreStrikeModifiers(manager, attacker, primaryTarget, skill, effectiveBase, isPrediction = false) {
        
        if (skill.id === 'execution') {
            let tokensCount = primaryTarget.activeEffects.length;
            if (tokensCount > 0) {
                skill.damageCoef += (tokensCount * 0.1);
                if (!isPrediction) manager.log(`[КАЗНЬ] Урон усилен на ${tokensCount * 10}% за жетоны врага!`);
            }
        }

        if (skill.id === 'aPrickBecauseOfAFriend' && skill.uniqueConditionReward) {
            let allyInFront = manager.units.find(u => u.side === attacker.side && !u.isDead && u.posIdx < attacker.posIdx && (u.hasEffect('block') || u.hasEffect('parry')));
            if (allyInFront) {
                Object.assign(skill, skill.uniqueConditionReward);
                if (!isPrediction) manager.log(`[ТАКТИКА СТРОЯ] Удар усилен из-за спины защитника!`);
            }
        }

        if (skill.id === 'overhandThrow') {
            let distance = attacker.posIdx + primaryTarget.posIdx;
            let isSynergy = attacker.hasEffect('combo') || primaryTarget.hasEffect('mark');
            let step = isSynergy ? 0.2 : 0.15;
            skill.damageCoef = 0.15 + (distance - 2) * step;
            if (!isPrediction) {
                let sText = isSynergy ? " <span style='color:#4affab;'>(Синергия!)</span>" : "";
                manager.log(`[ДИСТАНЦИЯ] Шаг: ${Math.round(step*100)}%, Дист: ${distance}${sText}`);
            }
        }

        if (skill.id === 'straightThrow') {
            let buffs = primaryTarget.activeEffects.filter(e => e.base.type === 'buff');
            if (buffs.length > 0) {
                let bonus = buffs.length * 0.1;
                skill.damageCoef += bonus;
                if (!isPrediction) manager.log(`[РАЗРУШЕНИЕ] Бонус +${Math.round(bonus*100)}% за снятие защит`);
            }
        }

        if (skill.id === 'vulnerableSpot') {
            if (!primaryTarget.hasEffect('mark') && !attacker.hasEffect('combo')) {
                skill.damageCoef = 0.5; 
                skill.effect = null;
                if (!isPrediction) manager.log(`[ПРОМАШКА] Удар без подготовки теряет свою силу!`);
            }
        }

        if (skill.id === 'flareBolt') {
            if (primaryTarget.side === attacker.side) {
                skill.effect = 'taunt-1'; 
            } else {
                let val = 1;
                let isL = isPrediction ? false : manager.lastLucky;
                let isC = isPrediction ? false : manager.lastCrit;
                let isU = isPrediction ? false : manager.lastUnlucky;
                if (isC) val = 3; else if (isL) val = 2; else if (isU) val = 0;
                if (val > 0) skill.effect = `vulnerable-${val}, mark-${val}`;
                else skill.effect = null;
            }
        }

        if (skill.id === 'prickAndShot') {
            skill.effect = null;
        }

        if (skill.id === 'morePowder') {
            let wLvl = attacker.equipment?.rightHand?.level || 1;
            skill.effect = 'morePowder-1';
            if (wLvl <= 2) skill.effect += ', stun-1';
            else if (wLvl === 3) skill.effect += ', daze-1';
        }

        if (skill.id === 'reloadHelp') {
            let wLvl = attacker.equipment?.rightHand?.level || 1;
            
            skill.effect = 'self ammo-2'; 
            
            if (wLvl <= 2) skill.effect += ', daze-1';
            else if (wLvl === 3) skill.effect += ', self speed-1';
            else if (wLvl >= 4) skill.effect += ', self speed-1, speed-1';

            let allyPos = primaryTarget.posIdx;
            let myPos = attacker.posIdx;
            
            if (allyPos < myPos - 1) {
                let shift = (myPos - 1) - allyPos;
                skill.moveTarget = shift; 
            }
        }

        if (attacker.hasEffect('morePowder') && !skill.targetSelf && !skill.targetAlly && skill.damageCoef > 0) {
            skill.effect = skill.effect ? skill.effect + ', stun-1' : 'stun-1';
            if (!isPrediction) manager.log(`[БОЛЬШЕ ПОРОХА] Усиленный выстрел оглушает цель!`);
        }

        if (['glassMeleeEnhanced', 'glassRangedEnhanced', 'amalgamWound', 'amalgamHeavyDash', 'vitrailMeleeEnhanced', 'vitrailChargeEnhanced', 'motherSpawnGlass'].includes(skill.id)) {
            if (!isPrediction) attacker.modifyEffect('combo', -1);
        }
        if (skill.id === 'glassWeb', 'motherSpawnAmalgam') {
            if (!isPrediction) attacker.modifyEffect('combo', -2);
        }

        if (skill.id === 'motherSpawnVitrail') {
            if (!isPrediction) attacker.modifyEffect('combo', -4);
        }
    },

    applyPostStrikeModifiers(manager, attacker, primaryTarget, skill, effectiveBase, isL = false, isU = false, isC = false) {
        let hitType = manager.lastHitType || "ОБЫЧНЫЙ";

        if (skill.id === 'sweep') {
            let targetsToMove = manager.units.filter(u => u.side !== attacker.side && !u.isDead && (u.posIdx === 3 || u.posIdx === 4));
            targetsToMove.forEach(t => manager.moveUnit(t, -1));
        }
        
        if (skill.id === 'invigoratingRicochet') {
            let mirrorAlly = manager.units.find(u => u.side === attacker.side && !u.isDead && u.posIdx === primaryTarget.posIdx);
            if (mirrorAlly) {
                let allyDmg = Math.floor(effectiveBase * 0.3); 
                mirrorAlly.takeDamage(allyDmg);
                window.spawnDamageText(`-${allyDmg}`, mirrorAlly.x, mirrorAlly.y - 20, "#ffaa44");
                let val = 1; if (isC) val = 3; else if (isL) val = 2; else if (isU) val = 0;
                if (val > 0) mirrorAlly.addEffect(EFFECTS.POWER, val);
                manager.log(`[РИКОШЕТ] Камень отскакивает в ${mirrorAlly.name}!`);
                if (!skill.comboChanges && skill.comboOrMarkImproveable && val > 0) mirrorAlly.addEffect(EFFECTS.COURAGE, 1);
            }
        }

        if (skill.id === 'duck') {
            let frontAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead && (u.posIdx === 1 || u.posIdx === 2));
            let val = 1; if (isC) val = 3; else if (isL) val = 2; else if (isU) val = 0;
            if (val > 0) {
                frontAllies.forEach(ally => {
                    ally.addEffect(EFFECTS.COMBO, val);
                    window.spawnDamageText(`КОМБО (${val})`, ally.x, ally.y - 20, "#4affab");
                });
            }
        }

        if (skill.id === 'flareBolt' && primaryTarget.side === attacker.side) {
            let val = 1; if (isC) val = 3; else if (isL) val = 2; else if (isU) val = 0;
            if (val > 0) {
                primaryTarget.addEffect(EFFECTS.TAUNT, val);
                window.spawnDamageText(`ПРОВОКАЦИЯ (${val})`, primaryTarget.x, primaryTarget.y - 20, "#4affab");
                let otherAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead && u !== primaryTarget);
                otherAllies.forEach(ally => {
                    ally.addEffect(EFFECTS.DODGE, val);
                    window.spawnDamageText(`УКЛОНЕНИЕ (${val})`, ally.x, ally.y - 20, "#fff");
                });
                manager.log(`[СИГНАЛ] Погруженец ${primaryTarget.name} привлекает огонь на себя!`);
            }
        }

        if (skill.id === 'brightFeathers') {
            let enemies = manager.units.filter(u => u.side !== attacker.side && !u.isDead);
            enemies.forEach(e => {
                let hadEffect = false;
                e.activeEffects = e.activeEffects.filter(eff => {
                    let isDefense = ['taunt', 'protection', 'underProtection'].includes(eff.base.id);
                    if (isDefense) hadEffect = true;
                    return !isDefense;
                });
                if (hadEffect) window.spawnDamageText("СНЯТИЕ", e.x, e.y - 20, "#b19cd9");
            });
            manager.log(`[ЯРКОЕ ОПЕРЕНИЕ] Защитные построения врага рассеяны!`);
        }

        if (skill.id === 'prickAndShot') {
            let frontEnemy = manager.units.find(u => u.side === primaryTarget.side && u.posIdx === 1 && !u.isDead);
            if (frontEnemy && primaryTarget === frontEnemy) {
                let val = 3; if (isC) val += 2; else if (isL) val += 1; else if (isU) val -= 1;
                let dotDmg = 2; if (isC) dotDmg += 2; else if (isL) dotDmg += 1; else if (isU) dotDmg -= 1;
                dotDmg = Math.max(1, dotDmg);
                
                if (val > 0) {
                    frontEnemy.addEffect(EFFECTS.DOT, 1, { duration: val, damagePerTurn: dotDmg });
                    window.spawnDamageText(`КРОВОТЕЧЕНИЕ`, frontEnemy.x, frontEnemy.y - 20, "#ff4444");
                }
            }

            let aliveEnemies = manager.units.filter(u => u.side !== attacker.side && !u.isDead).sort((a, b) => b.posIdx - a.posIdx);
            let backEnemy = aliveEnemies.length > 0 ? aliveEnemies[0] : null;
            
            if (backEnemy && (backEnemy !== frontEnemy || aliveEnemies.length === 1)) {
                let backSkill = { name: "Выстрел", damageCoef: skill.damageCoef, effect: null };
                manager.applyDamageLogic(attacker, backEnemy, backSkill, effectiveBase, 0, 1);
            }
        }

        if (skill.id === 'rapidFire') {
            attacker.modifyEffect('combo', -1);
            attacker.addEffect(EFFECTS.RAPIDFIRE, 2); 
            manager.log(`[СКОРОСТРЕЛЬНОСТЬ] ${attacker.name} занимает позицию для прикрытия!`);
        }

        if (attacker.hasEffect('morePowder') && !skill.targetSelf && !skill.targetAlly && skill.damageCoef > 0) {
            attacker.modifyEffect('morePowder', -1);
        }
        if (hitType === "ПРОМАХ" && ['glassFeedSelf', 'glassFeedAlly', 'glassGrowMites', 'amalgamFeedSelf'].includes(skill.id)) {
            manager.log(`[ПРОМАХ] ${attacker.name} суетится и совершает критическую ошибку!`);
            return; 
        }
        if (['glassFeedSelf', 'glassFeedAlly', 'amalgamFeedSelf'].includes(skill.id)) {
            let crystal = manager.units.find(u => u.isEnvironment);
            let target = ['glassFeedSelf', 'amalgamFeedSelf'].includes(skill.id) ? attacker : primaryTarget;
            
            let currentCombo = target.getEffect('combo')?.count || 0;
            let tMaxCombo = target.maxCombo || 2; 
            let missingCombo = tMaxCombo - currentCombo;
            
            let availablePairs = Math.floor((crystal?.getEffect('mites')?.count || 0) / 2);
            let comboToGive = Math.min(missingCombo, availablePairs);

            if (crystal && comboToGive > 0) {
                crystal.modifyEffect('mites', -(comboToGive * 2));
                
                if (hitType === "КРИТ") {
                    comboToGive += 2; 
                    target.addEffect(EFFECTS.POWER, 1); 
                    window.spawnDamageText(`СИЛА (+1)`, target.x, target.y - 40, "#ff00ff");
                } else if (hitType === "УДАЧНЫЙ") {
                    comboToGive += 1; 
                    target.addEffect(EFFECTS.SPEED, 1); 
                    window.spawnDamageText(`СКОРОСТЬ (+1)`, target.x, target.y - 40, "#ff8844");
                } else if (hitType === "НЕУДАЧНЫЙ") {
                    comboToGive -= 1;
                    manager.log(`[НЕУДАЧА] ${attacker.name} давится клещами, теряя часть эффекта.`);
                }

                comboToGive = Math.max(0, comboToGive);

                if (comboToGive > 0) {
                    target.addEffect(EFFECTS.COMBO, comboToGive);
                    window.spawnDamageText(`КОМБО (+${comboToGive})`, target.x, target.y - 20, hitType === "КРИТ" ? "#ff00ff" : (hitType === "НЕУДАЧНЫЙ" ? "#ffaa44" : "#4affab"));
                    manager.log(`[СИНЕРГИЯ РОЯ] ${target.name} поглощает клещей (+${comboToGive} комбо)!`);
                } else {
                    window.spawnDamageText(`ПРОВАЛ`, target.x, target.y - 20, "#ffaa44");
                }
            }
        }

        if (skill.id === 'glassGrowMites') {
            let crystal = manager.units.find(u => u.isEnvironment);
            if (crystal) {
                let mites = crystal.getEffect('mites');
                let currentCount = mites ? mites.count : 0;
                let growth = currentCount > 5 ? 4 : (currentCount >= 3 ? 3 : (currentCount >= 1 ? 2 : 1));
                
                if (hitType === "КРИТ") growth += 2; 
                else if (hitType === "УДАЧНЫЙ") growth += 1; 
                else if (hitType === "НЕУДАЧНЫЙ") growth -= 1;

                growth = Math.max(0, growth);

                if (growth > 0) {
                    crystal.addEffect(EFFECTS.MITES, growth);
                    manager.log(`[ЗАБОТА] ${attacker.name} расплодил клещей (+${growth})!`);
                    window.spawnDamageText(`+${growth} КЛЕЩЕЙ`, crystal.x, crystal.y - 20, hitType === "КРИТ" ? "#ff00ff" : (hitType === "НЕУДАЧНЫЙ" ? "#ffaa44" : "#b19cd9"));
                } else {
                    window.spawnDamageText(`ПУСТО`, crystal.x, crystal.y - 20, "#ffaa44");
                }
            }
        }

        if (skill.id === 'vitrailStealCombo') {
            if (hitType === "ПРОМАХ") return;
            let totalStolen = 0;
            let allies = manager.units.filter(u => u.side === attacker.side && u !== attacker && !u.isDead && u.hasEffect('combo'));
            allies.forEach(a => {
                let count = a.getEffect('combo').count;
                a.modifyEffect('combo', -count);
                totalStolen += count;
                window.spawnDamageText(`-КОМБО`, a.x, a.y - 20, "#ffaa44");
            });

            if (hitType === "КРИТ") totalStolen += 2;
            else if (hitType === "УДАЧНЫЙ") totalStolen += 1;
            else if (hitType === "НЕУДАЧНЫЙ") totalStolen -= 1;

            totalStolen = Math.max(0, totalStolen);
            if (totalStolen > 0) {
                attacker.addEffect(EFFECTS.COMBO, totalStolen);
                window.spawnDamageText(`КОМБО (+${totalStolen})`, attacker.x, attacker.y - 20, "#4affab");
                manager.log(`[ЭГОИЗМ] ${attacker.name} поглотил заряды роя (+${totalStolen})!`);
            }
        }

        if (skill.id === 'vitrailChargeEnhanced') {
            let oldPos = attacker.posIdx;
            let newPos = Math.max(1, oldPos - 3); 
            
            let passedAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead && u !== attacker && u.posIdx >= newPos && u.posIdx < oldPos);
            passedAllies.forEach(a => {
                if (a.maxCombo > 0) { 
                    a.addEffect(EFFECTS.COMBO, 1);
                    window.spawnDamageText(`КОМБО (+1)`, a.x, a.y - 20, "#4affab");
                }
            });
            if (passedAllies.some(a => a.maxCombo > 0)) {
                manager.log(`[ЦЕПНАЯ РЕАКЦИЯ] Искры от тарана заряжают союзников!`);
            }
        }
    },

    executeCustomSkillFlow(manager, attacker, primaryTarget, skill, effectiveBase) {
        if (skill.id === 'whirlwind') {
            let aliveAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead);
            let destination = (attacker.posIdx === 1) ? aliveAllies.length : 1;
            let direction = (destination > attacker.posIdx) ? 1 : -1;

            let totalSteps = Math.abs(attacker.posIdx - destination);
            if (totalSteps === 0) totalSteps = 1; 

            let currentStep = 0;

            const performStep = () => {
                if (attacker.isDead || currentStep >= totalSteps) {
                    setTimeout(() => manager.finalizeSkill(attacker, primaryTarget, skill), 500);
                    return;
                }

                const currentPos = attacker.posIdx;
                const nextPos = Math.max(1, Math.min(4, currentPos + direction));

                const mirroredTargets = manager.units.filter(u => 
                    u.side !== attacker.side && !u.isDead && 
                    (u.posIdx === currentPos || u.posIdx === nextPos)
                );

                mirroredTargets.forEach(enemy => {
                    manager.applyDamageLogic(attacker, enemy, skill, effectiveBase, 0, 1);
                });

                if (totalSteps > 1) {
                    let allyToBump = manager.units.find(u => u.side === attacker.side && u.posIdx === nextPos && u !== attacker && !u.isDead);
                    if (allyToBump) {
                        let allyDmg = Math.round(effectiveBase * skill.damageCoef * 0.5);
                        allyToBump.takeDamage(allyDmg);
                        window.spawnDamageText(`-${allyDmg}`, allyToBump.x, allyToBump.y - 20, "#ffaa44");
                        manager.log(`[ВИХРЬ] ${attacker.name} проносится сквозь ${allyToBump.name}!`);
                    }
                    manager.moveUnit(attacker, direction);
                }

                if (attacker.hasEffect('combo') && skill.comboOrMarkImproveable) {
                    let someoneDied = mirroredTargets.some(e => e.isDead || e.hp <= 0);
                    let canMoveFurther = (direction > 0 && attacker.posIdx < 4) || (direction < 0 && attacker.posIdx > 1);
                    
                    if (someoneDied && canMoveFurther) {
                        totalSteps++; 
                        destination += direction; 
                        manager.log(`[БЕЗУМИЕ] Смерть врага продлевает ярость!`);
                    }
                }

                currentStep++;
                setTimeout(performStep, 400); 
            };

            performStep(); 
            return true; 
        }
        return false;
    }
};