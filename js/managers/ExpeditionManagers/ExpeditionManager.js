import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';
import { MineGenerator } from './MineGenerator.js';
import { ExpeditionLootManager } from './ExpeditionLootManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';

export const ExpeditionManager = {
    active: false,
    isPaused: true,
    focusedCol: null, // null = поровну; 'west' | 'center' | 'east'
    workTimeElapsed: 0,
    spentItems: [],
    foundItems: [],
    lastDeltas: { west: 0, center: 0, east: 0 },
    activeToolsCache: { mining: [], scouting: [], construction: [], research: [] },
    catMap: { mining: 'miningMaterials', research: 'researchMaterials', construction: 'buildingMaterials', scouting: 'scoutingMaterials' },
    foodQuality: ['generousRation', 'normalRation', 'scantyRation'],
    waterQuality: ['springWater', 'meltSnow', 'wasteWater'],

    ensureMine() {
        if (!GameState.currentMine) {
            GameState.currentMine = MineGenerator.createMine(GameState.selectedBiome || 'glassForest');
        }
        return GameState.currentMine;
    },

    getActiveStage(node) {
        if (!node || !Array.isArray(node.stages)) return null;
        return node.stages[Math.min(node.currentStageIdx, node.stages.length - 1)] || null;
    },

    start() {
        const mine = this.ensureMine();
        GameState.isExpeditionActive = true;
        this.active = true;
        this.isPaused = true;
        this.focusedCol = null;

        mine.shiftWorkHours = 0;
        mine.shiftFoundItems = [];
        mine.shiftSpentItems = [];

        this.workTimeElapsed = 0;
        this.spentItems = mine.shiftSpentItems;
        this.foundItems = mine.shiftFoundItems;
        this.lastDeltas = { west: 0, center: 0, east: 0 };

        GameState.currentSquad.forEach(adv => {
            if (!adv) return;
            adv.minExpeditionHp = adv.hp;
            adv.minExpeditionStamina = adv.stamina;
        });

        this.applyScoutingFogReveal(mine.cageDepth);
        this.evaluateTools();
    },

    resumeFromHub() {
        const mine = this.ensureMine();
        this.active = true;
        this.isPaused = true;
        this.workTimeElapsed = mine.shiftWorkHours || 0;
        this.foundItems = mine.shiftFoundItems || (mine.shiftFoundItems = []);
        this.spentItems = mine.shiftSpentItems || (mine.shiftSpentItems = []);
        this.applyScoutingFogReveal(mine.cageDepth);
        this.evaluateTools();
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    },

    toggleFocus(col) {
        this.focusedCol = this.focusedCol === col ? null : col;
    },

    getMine() {
        return this.ensureMine();
    },

    canDescendTo(depth) {
        const mine = this.ensureMine();
        if (depth < 1 || depth > mine.maxDepth) return false;
        if (depth <= mine.maxReachedDepth) return true;
        const prevRow = mine.depths[depth - 2];
        return Boolean(prevRow && prevRow.center.completed);
    },

    moveCageToDepth(targetDepth) {
        const mine = this.ensureMine();
        if (!this.canDescendTo(targetDepth)) return false;

        mine.cageDepth = targetDepth;
        mine.maxReachedDepth = Math.max(mine.maxReachedDepth, targetDepth);
        mine.visibleMaxDepth = Math.min(mine.maxDepth, Math.max(mine.visibleMaxDepth, targetDepth + 2));
        this.focusedCol = null;

        this.applyScoutingFogReveal(targetDepth);
        return true;
    },

    revealNode(depth, col) {
        const mine = this.ensureMine();
        const row = mine.depths[depth - 1];
        if (!row || !row[col]) return false;
        row[col].revealed = true;
        return true;
    },

    applyScoutingFogReveal(depth) {
        const mine = this.ensureMine();
        const row = mine.depths[depth - 1];
        if (!row) return;

        row.center.revealed = true;
        const nextRow = mine.depths[depth];
        if (nextRow && (row.center.progress >= 50 || row.center.completed)) {
            nextRow.center.revealed = true;
        }

        const stats = this.getSquadTotalStats();
        const hasScoutTools = (GameState.expeditionInventory || []).some(i => i.category === 'scoutingMaterials');
        const threshold = EXPEDITION_BALANCE.mine?.autoScoutThreshold || 8;

        if (stats.scouting >= threshold || hasScoutTools) {
            row.west.revealed = true;
            row.east.revealed = true;
        }
    },

    evaluateTools() {
        const inv = GameState.expeditionInventory || [];
        const activities = ['mining', 'scouting', 'construction', 'research'];
        const depthPct = ((this.ensureMine().cageDepth - 1) / (EXPEDITION_BALANCE.maxDepth || 10)) * 100;

        activities.forEach(type => {
            this.activeToolsCache[type] = [];
            const toolsData = EQUIPMENT[this.catMap[type]];
            if (!toolsData) return;

            for (const [key, t] of Object.entries(toolsData)) {
                const found = inv.find(item => item.key === key);
                if (found && depthPct >= (t.usefulAt || 0)) {
                    this.activeToolsCache[type].push({ ...t, isBoost: true });
                }
            }
        });
    },

    getSquadTotalStats() {
        return GameState.currentSquad.reduce((acc, adv) => {
            if (!adv || adv.hp <= 0 || adv.stamina <= 0) return acc;
            acc.battle += window.HubManager.getStat(adv, 'battle') || 0;
            acc.mining += window.HubManager.getStat(adv, 'mining') || 0;
            acc.scouting += window.HubManager.getStat(adv, 'scouting') || 0;
            acc.construction += window.HubManager.getStat(adv, 'construction') || 0;
            acc.research += window.HubManager.getStat(adv, 'research') || 0;
            return acc;
        }, { battle: 0, mining: 0, scouting: 0, construction: 0, research: 0 });
    },

    tickHubRecoveryHourly() {
        const divider = EXPEDITION_BALANCE.mine?.hourlyHubHealDivider || 12;
        const activeIds = new Set(GameState.currentSquad.filter(Boolean).map(a => a.id));

        GameState.roster.forEach(adv => {
            if (activeIds.has(adv.id)) return;
            if (adv.isResting) {
                const maxS = window.HubManager.getStat(adv, 'stamina');
                const gain = Math.max(1, Math.round((maxS * 0.5) / divider));
                adv.stamina = Math.min(maxS, adv.stamina + gain);
                if (adv.stamina >= maxS) adv.isResting = false;
            }
            if (adv.isHealing) {
                const maxH = window.HubManager.getStat(adv, 'hp');
                const gain = Math.max(1, Math.round((maxH * 0.5) / divider));
                adv.hp = Math.min(maxH, adv.hp + gain);
                if (adv.hp >= maxH) adv.isHealing = false;
            }
        });
    },

    autoConsumeSupplies() {
        const inv = GameState.expeditionInventory || [];
        if (inv.length === 0) return;

        const mineCfg = EXPEDITION_BALANCE.mine || {};
        const stamThreshold = mineCfg.autoConsumeStaminaPct ?? 0.35;
        const hpThreshold = mineCfg.autoConsumeHpPct ?? 0.50;
        const campBal = EXPEDITION_BALANCE.camp;

        GameState.currentSquad.forEach(adv => {
            if (!adv || adv.hp <= 0) return;
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStam = window.HubManager.getStat(adv, 'stamina');

            const needsFood = (adv.stamina / maxStam <= stamThreshold) || (adv.hp / maxHp <= hpThreshold);
            if (!needsFood) return;

            const fKey = this.foodQuality.find(k => inv.some(i => i.key === k));
            const wKey = this.waterQuality.find(k => inv.some(i => i.key === k));
            if (!fKey || !wKey) return;

            const foodItem = inv.splice(inv.findIndex(i => i.key === fKey), 1)[0];
            const waterItem = inv.splice(inv.findIndex(i => i.key === wKey), 1)[0];
            this.spentItems.push(foodItem, waterItem);

            import('../../scenes/ExploreScene.js').then(m => {
                m.ExploreScene.showLootNotification(foodItem, true);
                m.ExploreScene.showLootNotification(waterItem, true);
            });

            const isHigh = fKey === 'generousRation' && wKey === 'springWater';
            const isLow = fKey === 'scantyRation' || wKey === 'wasteWater';

            const pctBonus = isHigh ? campBal.highQualityHealPercent : (isLow ? campBal.lowQualityHealPercent : campBal.mediumQualityHealPercent);
            const flatBonus = isHigh ? campBal.highQualityHealFlat : (isLow ? 0 : campBal.mediumQualityHealFlat);

            adv.hp = Math.min(maxHp, adv.hp + Math.round(maxHp * pctBonus) + flatBonus);
            adv.stamina = Math.min(maxStam, adv.stamina + Math.round(maxStam * pctBonus) + flatBonus);
        });
    },

    tick() {
        if (!this.active || this.isPaused) return 'PAUSED';
        if ((GameState.cycleHoursLeft ?? 0) <= 0) return 'CYCLE_TIMEOUT';

        const mine = this.ensureMine();
        GameState.cycleHoursLeft = Math.max(0, (GameState.cycleHoursLeft ?? 24) - 1);
        this.workTimeElapsed++;
        mine.shiftWorkHours = this.workTimeElapsed;

        this.tickHubRecoveryHourly();
        this.handleMineWorkTick();
        this.autoConsumeSupplies();

        const activeMembers = GameState.currentSquad.filter(Boolean);
        const allCollapsed = activeMembers.length === 0 || activeMembers.every(adv => adv.hp <= 0 || adv.stamina <= 0);

        if (allCollapsed) {
            this.active = false;
            const anyDead = activeMembers.every(adv => adv.hp <= 0);
            if (this.foundItems.length > 0) {
                mine.droppedCaches.push({ depth: mine.cageDepth, items: [...this.foundItems] });
            }
            import('../../scenes/ExploreScene.js').then(m => {
                m.ExploreScene.showSummary(anyDead ? 'ALL_DEAD' : 'SHIFT_EXHAUSTED');
            });
            return 'DEFEAT';
        }

        if (GameState.cycleHoursLeft <= 0) {
            this.active = false;
            return 'CYCLE_TIMEOUT';
        }

        return 'SUCCESS';
    },

    handleMineWorkTick() {
        this.evaluateTools();
        const mine = this.ensureMine();
        const row = mine.depths[mine.cageDepth - 1];
        if (!row) return;

        const fatigueBal = EXPEDITION_BALANCE.fatigue;

        GameState.currentSquad.forEach(adv => {
            if (!adv || adv.hp <= 0 || adv.stamina <= 0) return;
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStam = window.HubManager.getStat(adv, 'stamina');

            const hpLoss = Math.max(1, Math.round(fatigueBal.baseHpLoss * 0.4 + maxHp * 0.05));
            const stamLoss = Math.max(1, Math.round(fatigueBal.baseStaminaLoss * 0.6 + maxStam * 0.08));

            adv.hp = Math.max(0, adv.hp - hpLoss);
            adv.stamina = Math.max(0, adv.stamina - stamLoss);
            adv.minExpeditionHp = Math.min(adv.minExpeditionHp, adv.hp);
            adv.minExpeditionStamina = Math.min(adv.minExpeditionStamina, adv.stamina);
        });

        row.west.revealed = true;
        row.east.revealed = true;

        const stats = this.getSquadTotalStats();
        const cols = ['west', 'center', 'east'];
        const openCols = cols.filter(c => row[c] && !row[c].completed);

        this.lastDeltas = { west: 0, center: 0, east: 0 };

        if (openCols.length > 0) {
            const focusShare = EXPEDITION_BALANCE.mine?.focusPrimaryShare || 0.70;
            const hasFocus = this.focusedCol && openCols.includes(this.focusedCol);

            openCols.forEach(col => {
                const node = row[col];
                const stage = this.getActiveStage(node);
                if (!stage) return;

                let share = 1 / openCols.length;
                if (hasFocus && openCols.length > 1) {
                    share = col === this.focusedCol ? focusShare : (1 - focusShare) / (openCols.length - 1);
                }

                const statVal = Math.max(4, stats[stage.stat] || stats.mining || 6);
                const toolBoost = (this.activeToolsCache[stage.stat]?.length > 0) ? 1.35 : 1.0;
                const workGain = statVal * 2.2 * share * toolBoost;

                const prevTotalPct = node.progress;
                stage.workDone = Math.min(stage.workRequired, stage.workDone + workGain);
                stage.progress = Math.min(100, (stage.workDone / stage.workRequired) * 100);

                if (stage.workDone >= stage.workRequired && !stage.completed) {
                    stage.completed = true;
                    this.grantStageLoot(node.depth, stage);

                    if (node.currentStageIdx < node.stages.length - 1) {
                        node.currentStageIdx++;
                    } else {
                        node.completed = true;
                        if (this.focusedCol === col) this.focusedCol = null;

                        if (col === 'center') {
                            mine.maxReachedDepth = Math.max(mine.maxReachedDepth, Math.min(mine.maxDepth, mine.cageDepth + 1));
                            mine.visibleMaxDepth = Math.min(mine.maxDepth, Math.max(mine.visibleMaxDepth, mine.cageDepth + 2));
                            const nextRow = mine.depths[mine.cageDepth];
                            if (nextRow) nextRow.center.revealed = true;
                        }
                    }
                }

                const totalDone = node.stages.reduce((s, st) => s + st.workDone, 0);
                const totalReq = node.stages.reduce((s, st) => s + st.workRequired, 0);
                node.progress = totalReq > 0 ? Math.min(100, (totalDone / totalReq) * 100) : 100;
                this.lastDeltas[col] = parseFloat((node.progress - prevTotalPct).toFixed(1));
            });
        }

        this.applyScoutingFogReveal(mine.cageDepth);
    },

    grantStageLoot(depth, stage) {
        const minP = Math.max(0, (depth - 1) * 10);
        const maxP = 45 + depth * 35;
        let cats = ['valuableTypesOfStone', 'minerals'];
        if (stage.kind === 'research') cats = ['scientificSamples', 'researchResults', 'gases'];
        else if (stage.kind === 'hazard') cats = ['battlePrey', 'preciousStones'];
        else if (stage.kind === 'breach' || stage.kind === 'boss') cats = ['minerals', 'preciousStones', 'naturalResources'];

        const count = depth >= 5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const item = ExpeditionLootManager.getRandomLoot(cats, minP, maxP);
            if (item) ExpeditionLootManager.giveLoot(item, this);
        }
    },

    getEncounterComposition() {
        const mine = this.ensureMine();
        const d = mine.cageDepth;
        if (d >= 10) return 'boss_mother';
        if (d >= 7) return 'hard_1';
        if (d >= 4) return 'medium_1';
        return 'easy_2';
    },

    triggerBattle(context = 'preemptive') {
        this.isPaused = true;
        this.active = false;
        GameState.battleContext = context;
        GameState.selectedEncounter = this.getEncounterComposition();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            void overlay.offsetWidth;
            overlay.classList.add('active');
        }

        setTimeout(() => {
            import('../../scenes/BattleScene.js').then(m => {
                SceneManager.changeScene(m.BattleScene);
            });
        }, 1200);
    }
};
