import { EFFECTS } from '../../data/battleData/effects.js';
import { BATTLE_BALANCE } from '../../data/balanceFiles/battleBalance.js';

export const BattleDamageCalculator = {
    calculateBaseDiff(manager, attacker, target, skill) {
        const isFriendlyCast = Boolean(skill?.targetSelf || skill?.targetAlly || (target && target.side === attacker.side));

        const aStatBase = Number(attacker.combatStat);
        const aStatMod = (attacker.hasEffect('speed') ? Math.round(aStatBase * 0.25) : 0) - (attacker.hasEffect('daze') ? Math.round(aStatBase * 0.25) : 0);
        const aFinal = aStatBase + aStatMod + (attacker.stats?.atkArmor || 0);

        let dFinal = 0;
        if (isFriendlyCast) {
            const enemies = manager.units.filter(u => u.side !== attacker.side && !u.isDead && !u.isEnvironment);
            if (enemies.length > 0) {
                const strongest = enemies.reduce((p, c) => (p.combatStat > c.combatStat ? p : c));
                const dStatBase = Number(strongest.combatStat);
                const dStatMod = (strongest.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (strongest.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
                dFinal = dStatBase + dStatMod;
            }
        } else if (target) {
            const dStatBase = Number(target.combatStat);
            const dStatMod = (target.hasEffect('speed') ? Math.round(dStatBase * 0.25) : 0) - (target.hasEffect('daze') ? Math.round(dStatBase * 0.25) : 0);
            dFinal = dStatBase + dStatMod + (target.stats?.defArmor || 0);
        }
        return aFinal - dFinal;
    },

    evaluateHit(attacker, target, skill, effectiveBase, diff, splitScale = 1.0) {
        let hitType = 'ОБЫЧНЫЙ';
        let luckMult = 1.0;
        let isL = false; let isU = false; let isC = false;
        let armorBroken = false;

        if (diff >= 10 || (diff >= 5 && attacker.hasEffect('power'))) {
            isL = true; isC = true; hitType = 'КРИТ'; luckMult = 2.0;
        } else if (diff >= 5) {
            isL = true; hitType = 'УДАЧНЫЙ'; luckMult = 1.5;
        } else if (diff <= -10 || (diff <= -5 && attacker.hasEffect('weakness'))) {
            isU = true; hitType = 'ПРОМАХ'; luckMult = 0.0;
        } else if (diff <= -5) {
            isU = true; hitType = 'НЕУДАЧНЫЙ'; luckMult = 0.5;
        }

        const coef = skill?.damageCoef !== undefined ? skill.damageCoef : 1.0;
        let finalDmg = Math.round(effectiveBase * coef * luckMult * splitScale);

        if (attacker.hasEffect('weakness')) finalDmg = Math.round(finalDmg * 0.5);
        if (attacker.hasEffect('power')) finalDmg = Math.round(finalDmg * 1.5);
        if (target && target.hasEffect('vulnerable')) finalDmg = Math.round(finalDmg * 1.5);

        const ignoresDef = skill?.effect?.includes('ignorArmor') || skill?.effect?.includes('ignorBlock');
        if (target && target.hasEffect('block') && !ignoresDef) {
            finalDmg = Math.round(finalDmg * 0.5);
            target.modifyEffect('block', -1);
        }

        if (target && target.hasEffect('armor') && !ignoresDef) {
            const armorVal = target.getEffect('armor').count;
            if (finalDmg > armorVal) armorBroken = true;
            finalDmg = Math.max(0, finalDmg - armorVal);
        }

        let swarmBonus = 0;
        if (attacker.hasEffect('swarm')) swarmBonus += attacker.getEffect('swarm').count;
        if (target && target.hasEffect('swarm')) swarmBonus += target.getEffect('swarm').count;

        if (hitType !== 'ПРОМАХ') finalDmg += swarmBonus;
        else finalDmg = 0;

        let displayColor = '#ffffff';
        if (attacker.side === 'player') {
            if (isC) displayColor = '#ff00ff';
            else if (isL) displayColor = '#4affab';
            else if (isU) displayColor = '#ffaa44';
            if (hitType === 'ПРОМАХ') displayColor = '#aaaaaa';
        } else {
            if (isC) displayColor = '#ff4444';
            else if (isL) displayColor = '#ff8844';
            if (hitType === 'ПРОМАХ') displayColor = '#88ff88';
        }

        return { hitType, luckMult, finalDmg, isL, isC, isU, displayColor, armorBroken };
    },

    executeStrike(manager, attacker, target, skill, splitScale = 1.0) {
        if (!target || target.isDead) return;

        const weapon = attacker.equipment?.rightHand;
        const weaponBase = attacker.side === 'player'
            ? (weapon ? weapon.baseDamage : BATTLE_BALANCE.fists.baseDamage)
            : 10;
        const hasOffhandBonus = attacker.side === 'player' && weapon && attacker.equipment?.leftHand === null;
        const effectiveBase = hasOffhandBonus ? Math.round(weaponBase * 1.3) : weaponBase;

        const baseDiff = this.calculateBaseDiff(manager, attacker, target, skill);
        const aRoll = Math.floor(Math.random() * 5) + 1;
        const dRoll = Math.floor(Math.random() * 5) + 1;
        const diff = baseDiff + (aRoll - dRoll);

        const hitResult = this.evaluateHit(attacker, target, skill, effectiveBase, diff, splitScale);

        if (target.hasEffect('dodge') && !skill?.effect?.includes('ignorDodge')) {
            target.modifyEffect('dodge', -1);
            window.spawnDamageText('УВОРОТ', target.x + 10, target.y - 40, '#fff');
            manager.log(`<b>${attacker.name}</b> ➔ <b>${target.name}</b>: Уворот!`);
            return;
        }

        if (hitResult.hitType === 'ПРОМАХ') {
            window.spawnDamageText('ПРОМАХ', target.x + 10, target.y - 40, hitResult.displayColor);
            manager.log(`<span style="color:${hitResult.displayColor}">[ПРОМАХ]</span> <b>${attacker.name}</b> ➔ <b>${target.name}</b>`);
            return;
        }

        if (hitResult.armorBroken && !target.isDead) {
            target.modifyEffect('armor', -1);
        }

        const fd = hitResult.finalDmg;
        if (target.hasEffect('swarm')) {
            if (fd >= target.hp) {
                target.modifyEffect('swarm', -1);
                if (!target.hasEffect('swarm')) target.takeDamage(target.hp);
                else target.hp = target.maxHp;
                window.spawnDamageText('-1 ОСОБЬ', target.x, target.y - 20, hitResult.displayColor);
            } else {
                target.hp -= fd;
                window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
            }
        } else {
            target.takeDamage(fd);
            window.spawnDamageText(`-${fd}`, target.x + 20, target.y - 20, hitResult.displayColor);
        }

        manager.log(`<span style="color:${hitResult.displayColor}">[${hitResult.hitType}]</span> <b>${attacker.name}</b> ⚔️ <b>${target.name}</b>: <b>-${fd}</b> HP`);

        target.tickEffectsByTrigger('hitReceived');
        attacker.tickEffectsByTrigger('hitGiven');

        if (target.hasEffect('aGapingWound') && !target.isDead) {
            target.modifyEffect('aGapingWound', -1);
            target.addEffect(EFFECTS.DOT, 3, { damagePerTurn: 2 });
        }

        if (skill?.effect) {
            manager.applySkillEffects(target, skill.effect, hitResult.isL, hitResult.isU, hitResult.isC, attacker);
        }

        manager.syncVitalsToGameState();
    }
};
