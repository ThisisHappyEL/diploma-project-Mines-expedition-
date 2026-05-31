import { GameState } from '../../core/GameState.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';

export const ExpeditionCampManager = {
    foodQuality: ['generousRation', 'normalRation', 'scantyRation'],
    waterQuality: ['springWater', 'meltSnow', 'wasteWater'],

    handleRestTick(ExpeditionManager) {
        const inv = GameState.expeditionInventory || [];
        const squad = GameState.currentSquad;
        const bal = EXPEDITION_BALANCE.camp;

        const constBal = EXPEDITION_BALANCE.construction.milestones;
        const scoutBal = EXPEDITION_BALANCE.scouting.milestones;

        // бонус к лечению от еды и воды
        const constHealCount = Math.floor(ExpeditionManager.progress.construction / constBal.foodBoost.interval);
        const activeFoodFlatBonus = constHealCount * constBal.foodBoost.flatBonus;
        const activeFoodPercentBonus = constHealCount * constBal.foodBoost.percentBonus;

        // бнус к лечению от ничего
        const scoutHealCount = Math.floor(ExpeditionManager.progress.scouting / scoutBal.baseHealBoost.interval);
        const activeBasePercentBonus = scoutHealCount * scoutBal.baseHealBoost.percentBonus;

        const activeSquad = squad.filter(Boolean);

        const sortedSquad = [...activeSquad ].sort((a, b) => {
            const maxA = window.HubManager.getStat(a, 'hp') + window.HubManager.getStat(a, 'stamina');
            const curA = a.hp + a.stamina;
            const maxB = window.HubManager.getStat(b, 'hp') + window.HubManager.getStat(b, 'stamina');
            const curB = b.hp + b.stamina;
            return (curA / maxA) - (curB / maxB);
        });

        sortedSquad.forEach(adv => {
            if (adv.hasEatenThisExpedition === undefined) adv.hasEatenThisExpedition = false;
            if (adv.expeditionHealQuality === undefined) adv.expeditionHealQuality = 'none';

            if (!adv.hasEatenThisExpedition) {
                let foodFoundKey = null;
                let waterFoundKey = null;

                for (let fKey of this.foodQuality) {
                    if (inv.some(item => item.key === fKey)) {
                        foodFoundKey = fKey;
                        break;
                    }
                }
                for (let wKey of this.waterQuality) {
                    if (inv.some(item => item.key === wKey)) {
                        waterFoundKey = wKey;
                        break;
                    }
                }

                if (foodFoundKey && waterFoundKey) {
                    const fIdx = inv.findIndex(i => i.key === foodFoundKey);
                    const consumedFood = inv.splice(fIdx, 1)[0];
                    const wIdx = inv.findIndex(i => i.key === waterFoundKey);
                    const consumedWater = inv.splice(wIdx, 1)[0];

                    ExploreScene.showLootNotification(consumedFood, true);
                    ExploreScene.showLootNotification(consumedWater, true);

                    const isHigh = foodFoundKey === 'generousRation' && waterFoundKey === 'springWater';
                    const isLow = foodFoundKey === 'scantyRation' || waterFoundKey === 'wasteWater';
                    
                    adv.expeditionHealQuality = isHigh ? 'high' : (isLow ? 'low' : 'medium');
                    adv.hasEatenThisExpedition = true;
                } else {
                    adv.expeditionHealQuality = 'none';
                }
            }
        });

        activeSquad.forEach(adv => {
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStamina = window.HubManager.getStat(adv, 'stamina');

            let hpHeal = Math.round(maxHp * (bal.baseHealPercent + activeBasePercentBonus));
            let stamHeal = Math.round(maxStamina * (bal.baseHealPercent + activeBasePercentBonus));

            const qual = adv.expeditionHealQuality || 'none';

            if (qual === 'low') {
                hpHeal += Math.round(maxHp * (bal.lowQualityHealPercent + activeFoodPercentBonus)) + activeFoodFlatBonus;
                stamHeal += Math.round(maxStamina * (bal.lowQualityHealPercent + activeFoodPercentBonus)) + activeFoodFlatBonus;
            } else if (qual === 'medium') {
                hpHeal += Math.round(maxHp * (bal.mediumQualityHealPercent + activeFoodPercentBonus)) + bal.mediumQualityHealFlat + activeFoodFlatBonus;
                stamHeal += Math.round(maxStamina * (bal.mediumQualityHealPercent + activeFoodPercentBonus)) + bal.mediumQualityHealFlat + activeFoodFlatBonus;
            } else if (qual === 'high') {
                hpHeal += Math.round(maxHp * (bal.highQualityHealPercent + activeFoodPercentBonus)) + bal.highQualityHealFlat + activeFoodFlatBonus;
                stamHeal += Math.round(maxStamina * (bal.highQualityHealPercent + activeFoodPercentBonus)) + bal.highQualityHealFlat + activeFoodFlatBonus;
            }

            adv.hp = Math.min(maxHp, adv.hp + hpHeal);
            adv.stamina = Math.min(maxStamina, adv.stamina + stamHeal);
        });
    }
};