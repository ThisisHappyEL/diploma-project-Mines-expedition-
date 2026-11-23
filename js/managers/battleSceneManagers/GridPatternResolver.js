import { BATTLE_BALANCE } from '../../data/balanceFiles/battleBalance.js';

export const GridPatternResolver = {
    getWeaponPattern(unit) {
        if (unit.side === 'enemy') {
            const prof = BATTLE_BALANCE.enemyProfiles[unit.enemyId] || {};
            return {
                rangeClass: prof.rangeClass || 'melee',
                shape: prof.patternShape || 'point',
                attackIntervalSec: prof.attackIntervalSec || 3.0
            };
        }

        const weapon = unit.equipment?.rightHand;
        if (!weapon) {
            return {
                rangeClass: BATTLE_BALANCE.fists.rangeClass,
                shape: BATTLE_BALANCE.fists.patternShape,
                attackIntervalSec: BATTLE_BALANCE.fists.attackIntervalSec
            };
        }

        const cat = weapon.category || 'swords';
        const cfg = BATTLE_BALANCE.weaponCategories[cat] || BATTLE_BALANCE.weaponCategories.swords;
        return {
            rangeClass: weapon.rangeClass || cfg.rangeClass,
            shape: weapon.patternShape || cfg.patternShape,
            attackIntervalSec: weapon.attackIntervalSec || cfg.attackIntervalSec
        };
    },

    // Глубина от центра поля (0 = Фронт, 1 = Центр, 2 = Тыл)
    getDepthFromFront(side, col) {
        return side === 'player' ? (2 - col) : col;
    },

    getColFromDepth(side, depth) {
        return side === 'player' ? (2 - depth) : depth;
    },

    canAttackFromDepth(rangeClass, attackerDepth) {
        if (rangeClass === 'melee') return attackerDepth === 0;
        if (rangeClass === 'medium') return attackerDepth === 0 || attackerDepth === 1;
        if (rangeClass === 'ranged') return attackerDepth === 1 || attackerDepth === 2;
        return false;
    },

    getAnchorTargetDepth(rangeClass, attackerDepth) {
        if (rangeClass === 'melee') return 0;
        if (rangeClass === 'medium') return attackerDepth === 0 ? 1 : 0;
        if (rangeClass === 'ranged') return attackerDepth === 1 ? 2 : 1;
        return 0;
    },

    // Волновое расширение BFS по 3x3 сетке врага (depth: 0..2, lane: 0..2)
    computeWaves(rangeClass, shape, attackerDepth, attackerLane) {
        if (!this.canAttackFromDepth(rangeClass, attackerDepth)) return [];

        const anchorDepth = this.getAnchorTargetDepth(rangeClass, attackerDepth);
        const seedCells = [{ depth: anchorDepth, lane: attackerLane }];

        if (shape === 'cleave' || shape === 'universal') {
            if (attackerLane - 1 >= 0) seedCells.push({ depth: anchorDepth, lane: attackerLane - 1 });
            if (attackerLane + 1 <= 2) seedCells.push({ depth: anchorDepth, lane: attackerLane + 1 });
        }

        if (shape === 'pierce' || shape === 'universal') {
            if (anchorDepth + 1 <= 2) seedCells.push({ depth: anchorDepth + 1, lane: attackerLane });
        }

        const key = (d, l) => `${d}_${l}`;
        const visited = new Set(seedCells.map(c => key(c.depth, c.lane)));
        const waves = [seedCells];
        let frontier = [...seedCells];

        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (frontier.length > 0) {
            const nextWave = [];
            for (const cell of frontier) {
                for (const [dd, dl] of dirs) {
                    const nd = cell.depth + dd;
                    const nl = cell.lane + dl;
                    if (nd < 0 || nd > 2 || nl < 0 || nl > 2) continue;
                    const k = key(nd, nl);
                    if (!visited.has(k)) {
                        visited.add(k);
                        nextWave.push({ depth: nd, lane: nl });
                    }
                }
            }
            if (nextWave.length > 0) waves.push(nextWave);
            frontier = nextWave;
        }

        return waves;
    },

    resolveAutoAttackTargets(attacker, allUnits) {
        const pattern = this.getWeaponPattern(attacker);
        const atkDepth = this.getDepthFromFront(attacker.side, attacker.gridCol);

        // Если боец с ближним/средним/дальним оружием стоит не на своей линии — не достаёт
        const waves = this.computeWaves(pattern.rangeClass, pattern.shape, atkDepth, attacker.gridLane);
        if (waves.length === 0) return { validPosition: false, targets: [], waveIdx: -1 };

        const targetSide = attacker.side === 'player' ? 'enemy' : 'player';
        const livingEnemies = allUnits.filter(u => u.side === targetSide && !u.isDead && !u.isEnvironment);
        if (livingEnemies.length === 0) return { validPosition: true, targets: [], waveIdx: -1 };

        for (let wIdx = 0; wIdx < waves.length; wIdx++) {
            const wave = waves[wIdx];
            const hits = [];

            wave.forEach(cell => {
                const targetCol = this.getColFromDepth(targetSide, cell.depth);
                const found = livingEnemies.find(u => u.gridCol === targetCol && u.gridLane === cell.lane);
                if (found) hits.push(found);
            });

            if (hits.length > 0) {
                return { validPosition: true, targets: hits, waveIdx: wIdx };
            }
        }

        return { validPosition: true, targets: [], waveIdx: -1 };
    }
};
