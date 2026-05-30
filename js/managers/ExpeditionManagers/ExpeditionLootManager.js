import { GameState } from '../../core/GameState.js';
import { LOOT } from '../../data/expiditionData/lootData.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';

export const ExpeditionLootManager = {
    getRandomLoot(allowedCategories, minPrice, maxPrice) {
        let pool = [];
        for (let cat of allowedCategories) {
            if (LOOT[cat]) {
                for (let [key, item] of Object.entries(LOOT[cat])) {
                    if (item.price >= minPrice && item.price <= maxPrice) {
                        pool.push({ key, ...item, category: cat, type: 'loot', id: `found_${Date.now()}_${Math.random()}` });
                    }
                }
            }
        }
        if (pool.length === 0) return null;
        return Object.assign({}, pool[Math.floor(Math.random() * pool.length)]);
    },

    giveLoot(item, ExpeditionManager) {
        if (!item) return;
        ExpeditionManager.foundItems.push(item);
        ExploreScene.showLootNotification(item, false);
    },

    processMilestones(type, oldProg, newProg, ExpeditionManager) {
        const oldInt = Math.floor(oldProg);
        const newInt = Math.floor(newProg);
        const bal = EXPEDITION_BALANCE.loot; 
        
        const scoutBal = EXPEDITION_BALANCE.scouting.milestones;

        // увеличения количества штук находимого лута
        const lootBonusCount = Math.floor(ExpeditionManager.progress.scouting / scoutBal.lootBonus.interval);
        const activeExtraItems = lootBonusCount * scoutBal.lootBonus.extraCount;

        for (let i = oldInt + 1; i <= newInt; i++) {
            if (i > 100) break;

            const isMining = type === 'mining';
            const isResearch = type === 'research';
            if (!isMining && !isResearch) continue;

            const cats = isMining 
                ? ['valuableTypesOfStone', 'minerals', 'preciousStones', 'naturalResources']
                : ['researchResults', 'gases', 'scientificSamples'];

            let hasTriggeredMilestone = false;

            const leg = bal.milestones.legendary;
            if (i % leg.interval === 0) {
                const count = bal.rewardsCount.legendary + activeExtraItems;
                for (let c = 0; c < count; c++) {
                    this.giveLoot(this.getRandomLoot(cats, leg.minPrice, leg.maxPrice), ExpeditionManager);
                }
                hasTriggeredMilestone = true;
            }

            const rare = bal.milestones.rare;
            if (i % rare.interval === 0) {
                const count = bal.rewardsCount.rare + activeExtraItems;
                for (let c = 0; c < count; c++) {
                    this.giveLoot(this.getRandomLoot(cats, rare.minPrice, rare.maxPrice), ExpeditionManager);
                }
                hasTriggeredMilestone = true;
            }

            if (!hasTriggeredMilestone) {
                const common = bal.milestones.common;
                const count = bal.rewardsCount.common + activeExtraItems;
                for (let c = 0; c < count; c++) {
                    this.giveLoot(this.getRandomLoot(cats, common.minPrice, common.maxPrice), ExpeditionManager);
                }
            }
        }
    }
};