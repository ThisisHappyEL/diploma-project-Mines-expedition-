import { LOOT } from '../../data/expiditionData/lootData.js';
import { ExpeditionManager } from '../ExpeditionManagers/ExpeditionManager.js';

export const BattleLootManager = {
    generateAndDistributeLoot(deadEnemies, crystal, logCallback) {
        const drops = [];

        deadEnemies.forEach(e => {
            const nameLower = e.name.toLowerCase();

            if (nameLower.includes("фритта")) {
                drops.push("tickHusk");
                if (Math.random() < 0.35) drops.push("intactFrit");
            }
            else if (nameLower.includes("стеклянный паук")) {
                if (Math.random() < 0.40) drops.push("glassSpiderHead");
                if (Math.random() < 0.60) drops.push("conductiveWeb");
            }
            else if (nameLower.includes("амальгам")) {
                if (Math.random() < 0.30) drops.push("amalgamSpiderHead");
                if (Math.random() < 0.50) drops.push("amalgamSpiderLeg");
            }
            else if (nameLower.includes("витраж")) {
                if (Math.random() < 0.30) drops.push("stainedGlassSpiderHead");
                if (Math.random() < 0.50) drops.push("stainedGlassCarapace");
            }
            else if (nameLower.includes("мать")) {
                drops.push("swarmMotherAcid");
                if (Math.random() < 0.50) drops.push("conductiveWeb");
            }
        });

        if (crystal) {
            const mitesEffect = crystal.getEffect('mites');
            const mitesCount = mitesEffect ? mitesEffect.count : 0;
            const halfMites = Math.floor(mitesCount / 2);

            if (halfMites > 0) {
                for (let m = 0; m < halfMites; m++) {
                    if (Math.random() < 0.30) drops.push("intactPincers");
                    else drops.push("tickHusk");
                }
                if (logCallback) logCallback(`[СБОР] С кристалла успешно собрано ${halfMites} кремниевых клещей!`);
            }
        }

        drops.forEach(key => {
            const itemData = LOOT.battlePrey?.[key];
            if (itemData) {
                const item = {
                    key: key,
                    ...itemData,
                    category: 'battlePrey',
                    type: 'loot',
                    id: `found_battle_${Date.now()}_${Math.random()}`
                };
                ExpeditionManager.foundItems.push(item);
            }
        });
    }
};
