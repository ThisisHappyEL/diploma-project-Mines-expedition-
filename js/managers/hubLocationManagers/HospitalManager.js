import { GameState } from '../../core/GameState.js';
import { RecruitManager } from './RecruitManager.js';
import { HubManager } from './HubManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';

export class HospitalManager {
    static render(container) {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.padding = '0';
        container.style.height = '100%';
        container.style.minHeight = '0';
        container.innerHTML = '';

        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:25px; color:#aaa;">В ростере нет погруженцев.</p>';
            return;
        }

        const healingCount = GameState.roster.filter(a => a.isHealing).length;
        const COST_PER_HEAL = HUB_BALANCE.upkeep.costPerHealingCycle;

        const header = document.createElement('div');
        header.style.cssText = "display:flex; justify-content:space-between; width:100%; padding: 20px 25px; border-bottom:1px solid #555; box-sizing: border-box; flex-shrink: 0;";
        header.innerHTML = `
            <span style="color:#aaa;">Всего сейчас лечится: <b style="color:#fff;">${healingCount}</b></span>
            <span style="color:#aaa;">Расходы на медикаменты в цикл: <b style="color:#ff6666;">${healingCount * COST_PER_HEAL} 🕯️</b></span>
        `;
        container.appendChild(header);

        const scrollWrapper = document.createElement('div');
        scrollWrapper.style.cssText = "flex: 1; overflow-y: auto; padding: 20px 25px; min-height: 0; width: 100%; box-sizing: border-box; display: flex; flex-direction: column;";
        container.appendChild(scrollWrapper);

        const sortedRoster = [...GameState.roster].sort((a, b) => {
            const aMax = RecruitManager.getStat(a, 'hp');
            const bMax = RecruitManager.getStat(b, 'hp');
            const aMissing = (aMax - a.hp) / aMax;
            const bMissing = (bMax - b.hp) / bMax;
            return bMissing - aMissing; 
        });

        sortedRoster.forEach(adv => {
            const row = document.createElement('div');
            row.className = `char-row ${adv.isHealing ? 'active-heal' : ''}`;
            row.style.cssText = "padding: 0; display: flex; align-items: center; cursor: pointer; transition: 0.2s; height: 95px; min-height: 95px; box-sizing: border-box; overflow: hidden; position: relative; width: 100%; margin-bottom: 5px; flex-shrink: 0;";
            
            const traitDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
            const maxH = RecruitManager.getStat(adv, 'hp');
            const maxS = RecruitManager.getStat(adv, 'stamina');

            const zoomSize = "425px"; 
            const offsetX = "-190px";  
            const offsetY = "-40px";  

            row.innerHTML = `
                <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                    </div>
                </div>

                <div style="flex: 0 0 30%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                    <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 15px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:12px; font-size:13px; color:#ccc; font-weight:bold; align-items:center; white-space:nowrap;">
                        <span>💨 Выносливость: ${Math.floor(adv.stamina)}/${maxS}</span>
                        <span style="color: var(--color-gold); display: inline-flex; align-items: center; gap: 4px;">🔼 ${adv.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${RecruitManager.getStat(adv, 'battle')}</span>
                        <span>⛏️ ${RecruitManager.getStat(adv, 'mining')}</span>
                        <span>📚 ${RecruitManager.getStat(adv, 'research')}</span>
                        <span>🔨 ${RecruitManager.getStat(adv, 'construction')}</span>
                        <span>🪔 ${RecruitManager.getStat(adv, 'scouting')}</span>
                    </div>
                </div>

                <div style="width: 240px; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255, 68, 68, 0.05); border-left: 2px solid var(--color-gold); padding: 0 20px; flex-shrink: 0; box-sizing: border-box;">
                    <div style="color: #ff6666; font-size: 24px; font-weight: bold; text-align: center; white-space: nowrap;">
                        ❤️ ${Math.floor(adv.hp)} / ${maxH}
                    </div>
                </div>
            `;
            
            row.onclick = () => {
                adv.isHealing = !adv.isHealing;
                if (adv.isHealing) adv.isResting = false;
                this.render(container);
            };

            row.oncontextmenu = (e) => {
                e.preventDefault();
                HubManager.openCharacterDetails(adv);
            };
            
            scrollWrapper.appendChild(row);
        });
    }
}