import { GameState } from '../../core/GameState.js';
import { EFFECTS } from '../../data/battleData/effects.js';
import { BATTLE_BALANCE } from '../../data/balanceFiles/battleBalance.js';
import { GridPatternResolver } from './GridPatternResolver.js';
import { BattleDamageCalculator } from './BattleDamageCalculator.js';
import { BattleLootManager } from './BattleLootManager.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.uiCallback = uiCallback;
        this.round = 1;
        this.phase = 'TACTICS'; // 'TACTICS' | 'AUTOBATTLE' | 'ENDED'
        this.phaseTimer = BATTLE_BALANCE.autobattleDurationSec;

        this.playerCP = BATTLE_BALANCE.basePlayerCP;
        this.maxPlayerCP = BATTLE_BALANCE.basePlayerCP;
        this.enemyCP = BATTLE_BALANCE.baseEnemyThreatCP;

        this.selectedUnit = null;
        this.interactionMode = 'IDLE'; // 'IDLE' | 'MOVE' | 'SKILL_TARGET'
        this.selectedSkill = null;
        this.scheduledSkillQueue = [];
        this.logPanel = null;
        this.logs = [];
        this.attackTraces = [];
        this.lootEarned = [];
        this.battleResult = null; // 'VICTORY' | 'DEFEAT'
        this.ended = false;
    }

    startBattle() {
        this.log('<b>=== СРАЖЕНИЕ 3×3 НАЧАЛОСЬ ===</b>');
        this.enterTacticsPhase();
    }

    enterTacticsPhase() {
        if (this.ended) return;
        this.phase = 'TACTICS';
        this.phaseTimer = BATTLE_BALANCE.autobattleDurationSec;
        this.playerCP = this.maxPlayerCP;
        this.enemyCP = BATTLE_BALANCE.baseEnemyThreatCP;
        this.interactionMode = 'IDLE';
        this.selectedSkill = null;

        this.units.forEach(u => {
            u.queuedAction = null;
            if (!u.isDead && u.hasEffect('dot')) {
                const dot = u.getEffect('dot');
                const dmg = dot.damagePerTurn || 2;
                u.takeDamage(dmg);
                window.spawnDamageText(`-${dmg} 🩸`, u.x + 15, u.y - 30, '#ff4444');
                this.log(`🩸 ${u.name} теряет ${dmg} HP от кровотечения.`);
            }
        });

        this.checkBattleEnd();
        if (this.ended) return;

        this.selectedUnit = this.units.find(u => u.side === 'player' && !u.isDead) || null;
        this.planEnemyIntents();

        this.log(`<b>--- Раунд ${this.round}: Фаза Тактики (Очки Командования: ${this.playerCP}) ---</b>`);
        this.uiCallback(this);
    }

    planEnemyIntents() {
        let budget = this.enemyCP;
        const enemies = this.units
            .filter(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment && !u.hasEffect('stun'))
            .sort((a, b) => b.combatStat - a.combatStat);

        const livingPlayers = this.units.filter(u => u.side === 'player' && !u.isDead);
        if (livingPlayers.length === 0) return;

        for (const enemy of enemies) {
            if (budget <= 0) break;
            const res = GridPatternResolver.resolveAutoAttackTargets(enemy, this.units);
            const target = res.targets[0] || livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
            if (!target) continue;

            const skillId = Array.isArray(enemy.skills) && enemy.skills.length > 0 ? enemy.skills[0] : null;
            enemy.queuedAction = {
                type: 'SKILL',
                skill: {
                    id: skillId || 'enemy_special',
                    name: 'Спецвыпад',
                    damageCoef: 1.35,
                    effect: null
                },
                target
            };
            budget--;
        }
    }

    startAutobattlePhase() {
        if (this.phase !== 'TACTICS' || this.ended) return;
        this.phase = 'AUTOBATTLE';
        this.phaseTimer = BATTLE_BALANCE.autobattleDurationSec;
        this.interactionMode = 'IDLE';
        this.selectedSkill = null;

        const casters = this.units
            .filter(u => !u.isDead && !u.isEnvironment && u.queuedAction && !u.hasEffect('stun'))
            .sort((a, b) => b.combatStat - a.combatStat);

        const totalDuration = BATTLE_BALANCE.autobattleDurationSec;
        this.scheduledSkillQueue = casters.map((u, idx) => ({
            unit: u,
            action: u.queuedAction,
            triggerAtElapsed: Math.min(totalDuration - 1.5, 0.8 + idx * 1.1),
            fired: false
        }));

        this.log(`<b>▶ Фаза Автобоя (${totalDuration} сек)</b>`);
        this.uiCallback(this);
    }

    update(dtSec) {
        this.attackTraces = this.attackTraces.filter(tr => {
            tr.life -= dtSec;
            return tr.life > 0;
        });

        if (this.phase !== 'AUTOBATTLE' || this.ended) return;

        this.phaseTimer = Math.max(0, this.phaseTimer - dtSec);
        const elapsed = BATTLE_BALANCE.autobattleDurationSec - this.phaseTimer;

        for (const item of this.scheduledSkillQueue) {
            if (!item.fired && elapsed >= item.triggerAtElapsed) {
                item.fired = true;
                this.executeQueuedSkill(item.unit, item.action);
                if (this.checkBattleEnd()) return;
            }
        }

        this.units.forEach(u => {
            if (u.isDead || u.isEnvironment) return;

            if (u.side === 'player') {
                u.stamina = Math.min(u.maxStamina, u.stamina + BATTLE_BALANCE.staminaRegenPerSec * dtSec);
            }

            if (u.hasEffect('stun')) return;

            const pattern = GridPatternResolver.getWeaponPattern(u);
            u.attackTimer += dtSec;

            if (u.attackTimer >= pattern.attackIntervalSec) {
                u.attackTimer = 0;
                this.performAutoAttack(u);
                this.checkBattleEnd();
            }
        });

        this.uiCallback(this);

        if (!this.ended && this.phaseTimer <= 0) {
            this.round++;
            this.enterTacticsPhase();
        }
    }

    spawnTrace(attacker, target, color) {
        if (!attacker || !target) return;
        this.attackTraces.push({
            x1: attacker.x + attacker.width / 2,
            y1: attacker.y - attacker.height * 0.45,
            x2: target.x + target.width / 2,
            y2: target.y - target.height * 0.45,
            color,
            life: 0.35,
            maxLife: 0.35
        });
    }

    executeQueuedSkill(unit, action) {
        if (unit.isDead || unit.hasEffect('stun') || !action) return;
        const skill = action.skill;

        let target = action.target;
        if (!target || target.isDead) {
            const res = GridPatternResolver.resolveAutoAttackTargets(unit, this.units);
            target = res.targets[0] || null;
        }

        if (skill.targetSelf) target = unit;
        if (!target) return;

        unit.offsetX = unit.side === 'player' ? 32 : -32;
        window.spawnDamageText(`✨ ${skill.name}`, unit.x + 5, unit.y - unit.height - 25, '#ffbf00');
        this.log(`✨ <b>${unit.name}</b> применяет навык «${skill.name}»!`);

        if (skill.damageCoef === 0 && skill.effect) {
            this.spawnTrace(unit, target, '#4affab');
            this.applySkillEffects(target, skill.effect, false, false, false, unit);
        } else {
            const hits = skill.hits || 1;
            for (let h = 0; h < hits; h++) {
                if (target.isDead) {
                    const fallback = GridPatternResolver.resolveAutoAttackTargets(unit, this.units);
                    target = fallback.targets[0] || null;
                    if (!target) break;
                }
                this.spawnTrace(unit, target, '#ffbf00');
                BattleDamageCalculator.executeStrike(this, unit, target, skill, 1.0);
            }
        }
        unit.queuedAction = null;
    }

    performAutoAttack(attacker) {
        const res = GridPatternResolver.resolveAutoAttackTargets(attacker, this.units);
        if (!res.validPosition || res.targets.length === 0) return;

        const stamCost = attacker.side === 'player'
            ? (attacker.equipment?.rightHand ? BATTLE_BALANCE.autoAttackStaminaCost : BATTLE_BALANCE.fists.staminaCost)
            : 0;

        if (attacker.side === 'player' && attacker.stamina < stamCost) {
            window.spawnDamageText('УСТАЛ', attacker.x + 10, attacker.y - 35, '#888');
            return;
        }
        if (attacker.side === 'player') attacker.stamina = Math.max(0, attacker.stamina - stamCost);

        attacker.offsetX = attacker.side === 'player' ? 18 : -18;

        const count = res.targets.length;
        const splitScale = BATTLE_BALANCE.multiTargetDamageScale[count] || 0.45;
        const autoSkill = { id: 'auto', name: 'Автоатака', damageCoef: 1.0 };

        res.targets.forEach(target => {
            this.spawnTrace(attacker, target, attacker.side === 'player' ? '#4affab' : '#ff4444');
            BattleDamageCalculator.executeStrike(this, attacker, target, autoSkill, splitScale);
        });
    }

    // Скрытая дальность шага: 1 (только ортогональ). Диагональ (2) открывается только бонусом скорости/черты
    getUnitMoveRange(unit) {
        let range = BATTLE_BALANCE.baseMoveRange || 1;
        if (!unit) return range;
        if (unit.hasEffect('speed')) range += 1;
        const agile = BATTLE_BALANCE.agileTraits || [];
        if (Array.isArray(unit.traits) && unit.traits.some(t => agile.includes(t.name))) {
            range += 1;
        }
        return range;
    }

    canMoveUnitTo(unit, targetCol, targetLane) {
        if (!unit || unit.side !== 'player' || this.phase !== 'TACTICS') return false;
        if (this.playerCP < BATTLE_BALANCE.moveCostCP) return false;
        if (targetCol < 0 || targetCol > 2 || targetLane < 0 || targetLane > 2) return false;
        if (unit.gridCol === targetCol && unit.gridLane === targetLane) return false;

        const manhattanDist = Math.abs(unit.gridCol - targetCol) + Math.abs(unit.gridLane - targetLane);
        return manhattanDist <= this.getUnitMoveRange(unit);
    }

    moveUnitToCell(unit, targetCol, targetLane) {
        if (!this.canMoveUnitTo(unit, targetCol, targetLane)) return false;

        const occupant = this.units.find(u => u.side === 'player' && !u.isDead && u.gridCol === targetCol && u.gridLane === targetLane);
        if (occupant) {
            occupant.gridCol = unit.gridCol;
            occupant.gridLane = unit.gridLane;
        }
        unit.gridCol = targetCol;
        unit.gridLane = targetLane;

        this.playerCP -= BATTLE_BALANCE.moveCostCP;
        this.interactionMode = 'IDLE';
        this.log(`🥾 <b>${unit.name}</b> перемещается.`);
        this.uiCallback(this);
        return true;
    }

    orderSkill(unit, skill, targetUnit) {
        if (this.phase !== 'TACTICS' || !unit || unit.side !== 'player') return false;
        if (unit.queuedAction) {
            this.log('⚠️ Этот боец уже получил приказ на этот раунд.');
            return false;
        }
        if (this.playerCP < BATTLE_BALANCE.skillCostCP) {
            this.log('⚠️ Недостаточно Очков Командования!');
            return false;
        }

        unit.queuedAction = { type: 'SKILL', skill, target: targetUnit };
        this.playerCP -= BATTLE_BALANCE.skillCostCP;
        this.interactionMode = 'IDLE';
        this.selectedSkill = null;
        this.log(`📋 Приказ: <b>${unit.name}</b> ➔ «${skill.name}»`);
        this.uiCallback(this);
        return true;
    }

    handleCellOrUnitClick(side, col, lane, clickedUnit) {
        if (this.phase !== 'TACTICS' || this.ended) return;

        if (this.interactionMode === 'MOVE' && this.selectedUnit && side === 'player') {
            if (this.moveUnitToCell(this.selectedUnit, col, lane)) return;
        }

        if (this.interactionMode === 'SKILL_TARGET' && this.selectedUnit && this.selectedSkill) {
            if (this.selectedSkill.targetSelf && clickedUnit === this.selectedUnit) {
                this.orderSkill(this.selectedUnit, this.selectedSkill, this.selectedUnit);
                return;
            }
            if (!this.selectedSkill.targetSelf && clickedUnit && clickedUnit.side === 'enemy' && !clickedUnit.isDead) {
                this.orderSkill(this.selectedUnit, this.selectedSkill, clickedUnit);
                return;
            }
        }

        if (clickedUnit && clickedUnit.side === 'player' && !clickedUnit.isDead) {
            this.selectedUnit = clickedUnit;
            this.interactionMode = 'IDLE';
            this.selectedSkill = null;
            this.uiCallback(this);
        }
    }

    applySkillEffects(target, effectString, isLucky, isUnlucky, isCrit, attacker) {
        if (!effectString || target.isDead) return;
        effectString.split(', ').forEach(part => {
            let finalTarget = target;
            if (part.startsWith('self ')) { finalTarget = attacker; part = part.replace('self ', ''); }
            const [name, p2, p3] = part.split('-');
            let count = parseInt(p2) || 1;
            if (isCrit) count += 2;
            else if (isLucky) count += 1;
            else if (isUnlucky) count = Math.max(0, count - 1);

            const effObj = Object.values(EFFECTS).find(e => e.id.toLowerCase() === name.toLowerCase());
            if (effObj && count > 0) {
                finalTarget.addEffect(effObj, count, name.toLowerCase() === 'dot' ? { damagePerTurn: parseInt(p3) || 2 } : {});
            }
        });
    }

    syncVitalsToGameState() {
        this.units.forEach(u => {
            if (u.side !== 'player') return;
            const orig = GameState.currentSquad.find(a => a && a.name === u.name);
            if (orig) {
                orig.hp = Math.max(0, Math.floor(u.hp));
                orig.stamina = Math.max(0, Math.floor(u.stamina));
            }
        });
    }

    checkBattleEnd() {
        if (this.ended) return true;
        const enemiesAlive = this.units.some(u => u.side === 'enemy' && !u.isDead && !u.isEnvironment);
        const playersAlive = this.units.some(u => u.side === 'player' && !u.isDead);

        if (!enemiesAlive) {
            this.ended = true;
            this.phase = 'ENDED';
            this.battleResult = 'VICTORY';
            this.log('<b>🏆 ПОБЕДА! Поверженные враги отступили.</b>');
            const deadEnemies = this.units.filter(u => u.side === 'enemy' && !u.isEnvironment);
            const crystal = this.units.find(u => u.isEnvironment);
            this.lootEarned = BattleLootManager.generateAndDistributeLoot(deadEnemies, crystal, msg => this.log(msg)) || [];

            this.units.forEach(u => {
                if (u.side === 'player' && u.hp <= 0) u.hp = 1;
            });
            this.syncVitalsToGameState();
            this.uiCallback(this);
            return true;
        }

        if (!playersAlive) {
            this.ended = true;
            this.phase = 'ENDED';
            this.battleResult = 'DEFEAT';
            this.log('<b>💀 ПОРАЖЕНИЕ... Все погруженцы потеряли сознание.</b>');
            this.syncVitalsToGameState();
            this.uiCallback(this);
            return true;
        }

        return false;
    }

    log(msg) {
        this.logs.unshift(msg);
        if (!this.logPanel) return;
        const entry = document.createElement('div');
        entry.innerHTML = msg;
        entry.style.borderBottom = '1px solid #2a241e';
        entry.style.padding = '3px 0';
        this.logPanel.prepend(entry);
    }
}
