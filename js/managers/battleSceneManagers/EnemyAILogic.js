import { ENEMY_SKILLS } from '../../data/battleData/enemySkillLogic.js';

export const EnemyAILogic = {
    decideEnemyAction(enemy, manager) {
        let players = manager.units.filter(u => u.side === 'player' && !u.isDead);
        
        const getTarget = (targetPosArray) => {
            let t = players.filter(p => targetPosArray.includes(p.posIdx));
            if (t.length === 0) return null; 
            return t[Math.floor(Math.random() * t.length)];
        };

        let crystal = manager.units.find(u => u.isEnvironment && !u.isDead);
        let mites = crystal ? (crystal.getEffect('mites')?.count || 0) : 0;
        let myCombo = enemy.getEffect('combo')?.count || 0;
        let pos = enemy.posIdx;
        let action = null;

        // логика матери роя
        if (enemy.name.includes("Мать")) {
            let allies = manager.units.filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment);
            let teamFull = allies.length >= 4;
            let hp = enemy.hp;
            let minHp = 40; // минимальный порог хп после отливки

            if (teamFull && myCombo > 3) return { skill: ENEMY_SKILLS['motherVoltage'], target: enemy };

            if (!teamFull) {
                if (myCombo >= 4 && (hp - 30) >= minHp) return { skill: ENEMY_SKILLS['motherSpawnVitrail'], target: enemy };
                if (myCombo >= 2 && (hp - 16) >= minHp) return { skill: ENEMY_SKILLS['motherSpawnAmalgam'], target: enemy };
                if (myCombo >= 1 && (hp - 16) >= minHp) return { skill: ENEMY_SKILLS['motherSpawnGlass'], target: enemy };
                if ((hp - 8) >= minHp) return { skill: ENEMY_SKILLS['motherSpawnFritta'], target: enemy };
            }

            if (teamFull && myCombo <= 3) {
                let r = Math.random();
                if (r < 0.66 && myCombo < (enemy.maxCombo || 8)) {
                    return { skill: ENEMY_SKILLS['motherSurge'], target: enemy };
                } else {
                    if (pos <= 2) {
                        let t = getTarget(ENEMY_SKILLS['motherMelee'].targetPos);
                        if (t) return { skill: ENEMY_SKILLS['motherMelee'], target: t };
                    } else {
                        let t = getTarget(ENEMY_SKILLS['motherRanged'].targetPos);
                        if (t) return { skill: ENEMY_SKILLS['motherRanged'], target: t };
                    }
                }
            }

            if (pos <= 2) {
                let t = getTarget(ENEMY_SKILLS['motherMelee'].targetPos);
                if (t) return { skill: ENEMY_SKILLS['motherMelee'], target: t };
            } else {
                let t = getTarget(ENEMY_SKILLS['motherRanged'].targetPos);
                if (t) return { skill: ENEMY_SKILLS['motherRanged'], target: t };
            }
        }

        // логика паука-витража
        if (enemy.name.includes("Паук-витраж")) {
            let hasGlassSpiders = manager.units.some(u => u.side === 'enemy' && !u.isDead && u.name.includes("Стеклянный паук"));
            let aliveAllies = manager.units.filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment && u !== enemy);
            let totalAllyCombo = aliveAllies.reduce((sum, u) => sum + (u.getEffect('combo')?.count || 0), 0);

            if (myCombo === 0 && totalAllyCombo >= 2) action = { skill: ENEMY_SKILLS['vitrailStealCombo'], target: enemy };

            if (!action && myCombo > 0) {
                let options = [];
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['vitrailMeleeEnhanced'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['vitrailMeleeEnhanced'], target: t }); } 
                else { let t = getTarget(ENEMY_SKILLS['vitrailChargeEnhanced'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['vitrailChargeEnhanced'], target: t }); }
                if (options.length > 0) action = options[Math.floor(Math.random() * options.length)];
            }

            if (!action && !hasGlassSpiders && pos <= 2 && aliveAllies.length > 0) action = { skill: ENEMY_SKILLS['vitrailRetreat'], target: enemy };

            if (!action) {
                let options = [];
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['vitrailMeleeBasic'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['vitrailMeleeBasic'], target: t }); } 
                else { let t = getTarget(ENEMY_SKILLS['vitrailChargeBasic'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['vitrailChargeBasic'], target: t }); }
                if (options.length > 0) action = options[Math.floor(Math.random() * options.length)];
            }
            if (action) return action;
        }

        // логика паука-амальгамы
        if (enemy.name.includes("Паук-амальгама")) {
            let hasGlassSpiders = manager.units.some(u => u.side === 'enemy' && !u.isDead && u.name.includes("Стеклянный паук"));
            
            if (myCombo === 0 && crystal && mites >= 2 && !hasGlassSpiders) action = { skill: ENEMY_SKILLS['amalgamFeedSelf'], target: enemy };

            if (!action && myCombo > 0) {
                let options = [];
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['amalgamWound'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['amalgamWound'], target: t }); }
                if (pos >= 2) { let t = getTarget(ENEMY_SKILLS['amalgamHeavyDash'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['amalgamHeavyDash'], target: t }); }
                if (options.length > 0) action = options[Math.floor(Math.random() * options.length)];
            }

            if (!action) {
                let options = [];
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['amalgamBleed'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['amalgamBleed'], target: t }); }
                if (pos >= 2) { let t = getTarget(ENEMY_SKILLS['amalgamDash'].targetPos); if (t) options.push({ skill: ENEMY_SKILLS['amalgamDash'], target: t }); }
                if (options.length > 0) action = options[Math.floor(Math.random() * options.length)];
            }
            if (action) return action;
        }

        // логика стеклянного паука
        if (enemy.name.includes("Стеклянный паук")) {
            if (myCombo >= 2 && pos >= 2) {
                let validTargetsForWeb = ENEMY_SKILLS['glassWeb'].targetPos;
                let potentialTargets = players.filter(p => validTargetsForWeb.includes(p.posIdx) && !p.hasEffect('electroWeb'));
                let allPlayersInWeb = players.every(p => p.hasEffect('electroWeb'));
                if (potentialTargets.length > 0 && !allPlayersInWeb) action = { skill: ENEMY_SKILLS['glassWeb'], target: potentialTargets[Math.floor(Math.random() * potentialTargets.length)] };
            }

            if (!action && myCombo >= 1) {
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['glassMeleeEnhanced'].targetPos); if (t) action = { skill: ENEMY_SKILLS['glassMeleeEnhanced'], target: t }; } 
                else { let t = getTarget(ENEMY_SKILLS['glassRangedEnhanced'].targetPos); if (t) action = { skill: ENEMY_SKILLS['glassRangedEnhanced'], target: t }; }
            }

            if (!action && crystal && mites >= 2) {
                let hungryAllies = manager.units.filter(u => 
                    u.side === 'enemy' && u !== enemy && !u.isDead && !u.isEnvironment && 
                    u.maxCombo > 0 && (u.getEffect('combo')?.count || 0) < u.maxCombo
                );
                
                if (hungryAllies.length > 0) {
                    const getWeight = (u) => {
                        let n = u.name.toLowerCase();
                        if (n.includes("мать")) return 4;
                        if (n.includes("витраж")) return 3;
                        if (n.includes("амальгам")) return 2;
                        return 1; 
                    };
                    
                    hungryAllies.sort((a, b) => {
                        let wDiff = getWeight(b) - getWeight(a);
                        if (wDiff !== 0) return wDiff;
                        
                        let idxA = manager.turnQueue.indexOf(a); 
                        let idxB = manager.turnQueue.indexOf(b);
                        if (idxA === -1) idxA = 999; 
                        if (idxB === -1) idxB = 999;
                        return idxA - idxB;
                    });
                    
                    action = { skill: ENEMY_SKILLS['glassFeedAlly'], target: hungryAllies[0] };
                }
            }

            if (!action && crystal && mites >= 2 && myCombo < (enemy.maxCombo || 2)) action = { skill: ENEMY_SKILLS['glassFeedSelf'], target: enemy };
            if (!action && crystal && mites < 2) action = { skill: ENEMY_SKILLS['glassGrowMites'], target: crystal };

            if (!action) {
                if (pos <= 2) { let t = getTarget(ENEMY_SKILLS['glassMeleeBasic'].targetPos); if (t) action = { skill: ENEMY_SKILLS['glassMeleeBasic'], target: t }; } 
                else { let t = getTarget(ENEMY_SKILLS['glassRangedBasic'].targetPos); if (t) action = { skill: ENEMY_SKILLS['glassRangedBasic'], target: t }; }
            }
            if (action) return action;
        }

        // логика фритт
        let skillId = enemy.skills[0];
        let skill = ENEMY_SKILLS[skillId];
        if (skill && skill.validPos.includes(enemy.posIdx)) {
            let t = getTarget(skill.targetPos);
            if (t) return { skill: skill, target: t };
        }
        
        return null; 
    }
};