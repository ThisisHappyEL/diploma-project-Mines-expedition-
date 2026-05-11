import { EFFECTS } from '../data/battleData/effects.js';

export const SkillLogic = {
    
    // ЭТАП 1: Модификаторы до удара (используется и в бою, и в прогнозе)
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
            let bonus = (distance - 2) * 0.2; 
            skill.damageCoef += bonus;
            if (!isPrediction) manager.log(`[ДИСТАНЦИЯ] Бонус урона +${Math.round(bonus*100)}% за расстояние ${distance}`);
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
                skill.damageCoef = 0.5; // Сильный штраф, если бьем без условия
                skill.effect = null;
                if (!isPrediction) manager.log(`[ПРОМАШКА] Удар без подготовки теряет свою силу!`);
            }
        }

        // СИГНАЛЬНЫЙ БОЛТ (Арбалет) - Динамическая смена эффектов
        if (skill.id === 'flareBolt') {
            if (primaryTarget.side === attacker.side) {
                // Если стреляем в союзника
                skill.effect = 'taunt-1'; // Цели - провокация
                // Остальным союзникам даем уклонение (реализуем в postStrike)
            } else {
                // Если стреляем во врага
                skill.effect = 'vulnerable-1, mark-1';
            }
        }
    },

    // ЭТАП 2: Эффекты после удара (Только в реальном бою)
    applyPostStrikeModifiers(manager, attacker, primaryTarget, skill, effectiveBase) {
        
        if (skill.id === 'sweep') {
            // Ищем живых врагов на 3 и 4 позициях
            let targetsToMove = manager.units.filter(u => u.side !== attacker.side && !u.isDead && (u.posIdx === 3 || u.posIdx === 4));
            // Сдвигаем их всех разом (каждого на 1 клетку вперед)
            targetsToMove.forEach(t => manager.moveUnit(t, -1));
        }
        
        if (skill.id === 'invigoratingRicochet') {
            // Ищет "зеркального" союзника
            let mirrorAlly = manager.units.find(u => u.side === attacker.side && !u.isDead && u.posIdx === primaryTarget.posIdx);
            
            if (mirrorAlly) {
                let allyDmg = Math.floor(effectiveBase * 0.3); 
                mirrorAlly.takeDamage(allyDmg);
                window.spawnDamageText(`-${allyDmg}`, mirrorAlly.x, mirrorAlly.y - 20, "#ffaa44");
                
                // Даем силу (теперь она не сгорит, т.к. удар уже прошел!)
                mirrorAlly.addEffect(EFFECTS.POWER, 1);
                manager.log(`[РИКОШЕТ] Камень отскакивает в ${mirrorAlly.name}, придавая Сил!`);

                if (!skill.comboChanges && skill.comboOrMarkImproveable) {
                    mirrorAlly.addEffect(EFFECTS.COURAGE, 1);
                    manager.log(`[БЕЗУМНЫЙ РИКОШЕТ] Рикошет заряжает ${mirrorAlly.name} Куражом!`);
                }
            } else {
                manager.log(`[РИКОШЕТ] Камень отскакивает в пустоту...`);
            }
        }

        if (skill.id === 'duck') {
            let frontAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead && (u.posIdx === 1 || u.posIdx === 2));
            frontAllies.forEach(ally => {
                ally.addEffect(EFFECTS.COMBO, 1);
                window.spawnDamageText("КОМБО", ally.x, ally.y - 20, "#4affab");
            });
            manager.log(`[ПРИГНИСЬ] Союзники на передовой получают Комбо!`);
        }

        // СИГНАЛЬНЫЙ БОЛТ (Арбалет) - Раздача уклонения союзникам
        if (skill.id === 'flareBolt' && primaryTarget.side === attacker.side) {
            let otherAllies = manager.units.filter(u => u.side === attacker.side && !u.isDead && u !== primaryTarget);
            otherAllies.forEach(ally => {
                ally.addEffect(EFFECTS.DODGE, 1);
                window.spawnDamageText("УКЛОНЕНИЕ", ally.x, ally.y - 20, "#fff");
            });
            manager.log(`[СИГНАЛ] Сигнальный болт привлекает внимание к ${primaryTarget.name}!`);
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