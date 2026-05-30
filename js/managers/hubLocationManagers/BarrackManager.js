import { GameState } from '../../core/GameState.js';
import { RecruitManager } from './RecruitManager.js';
import { HubManager } from './HubManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';

export class BarracksManager {
    static render(container) {
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';

        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:#aaa;">В ростере нет погруженцев.</p>';
            return;
        }

        // сортировка по недостающей выносливости
        const sortedRoster = [...GameState.roster].sort((a, b) => {
            const aMax = RecruitManager.getStat(a, 'stamina');
            const bMax = RecruitManager.getStat(b, 'stamina');
            const aMissing = (aMax - a.stamina) / aMax;
            const bMissing = (bMax - b.stamina) / bMax;
            return bMissing - aMissing; 
        });

        let restingCount = GameState.roster.filter(a => a.isResting).length;
        const COST_PER_REST = HUB_BALANCE.upkeep.costPerRestingCycle;

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:15px; border-bottom:1px solid #555; padding-bottom:10px;">
                <span style="color:#aaa;">Всего сейчас отдыхает: <b style="color:#fff;">${restingCount}</b></span>
                <span style="color:#aaa;">Расходы на помещения в цикл: <b style="color:#ff6666;">${restingCount * COST_PER_REST} 🕯️</b></span>
            </div>
        `;
        
        const list = document.createElement('div');
        list.style.width = '100%';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';

        sortedRoster.forEach(adv => {
            const row = document.createElement('div');
            row.className = `char-row ${adv.isResting ? 'active-rest' : ''}`;
            
            row.style.cssText = "padding: 0; display: flex; align-items: center; cursor: pointer; transition: 0.2s; height: 95px; min-height: 95px; box-sizing: border-box; overflow: hidden; position: relative; width: 100%; margin-bottom: 5px;";

            const traitDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
            const maxH = RecruitManager.getStat(adv, 'hp');
            const maxS = RecruitManager.getStat(adv, 'stamina');

            // скейлинг спрайтов погруженцев
        const zoomSize = "425px";
        const offsetX = "-190px";
        const offsetY = "-40px";

            row.innerHTML = `
                <!-- Колонна 1: Срез лица -->
                <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                    </div>
                </div>

                <!-- Колонна 2 (30%): Имя, Предыстория и Черта -->
                <div style="flex: 0 0 30%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                    <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>

                <!-- Колонна 3: Второстепенные характеристики и здоровье -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 15px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:12px; font-size:13px; color:#ccc; font-weight:bold; align-items:center; white-space:nowrap;">
                        <span>❤️ Здоровье: ${Math.floor(adv.hp)}/${maxH}</span>
                        <span style="color: var(--color-gold); display: inline-flex; align-items: center; gap: 4px;">🔼 ${adv.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${RecruitManager.getStat(adv, 'battle')}</span>
                        <span>⛏️ ${RecruitManager.getStat(adv, 'mining')}</span>
                        <span>📚 ${RecruitManager.getStat(adv, 'research')}</span>
                        <span>🔨 ${RecruitManager.getStat(adv, 'construction')}</span>
                        <span>🪔 ${RecruitManager.getStat(adv, 'scouting')}</span>
                        <span style="color:var(--color-gold); font-weight:bold; margin-left:10px; font-size:13px;">🕯️ ${adv.salary}</span>
                    </div>
                </div>

                <!-- Колонна 4: ГИГАНТСКИЙ БЛОК ВЫНОСЛИВОСТИ (Выделение предназначения) -->
                <div style="width: 240px; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(74, 255, 171, 0.05); border-left: 2px solid var(--color-gold); padding: 0 20px; flex-shrink: 0; box-sizing: border-box;">
                    <div style="color: #4affab; font-size: 24px; font-weight: bold; text-align: center; white-space: nowrap;">
                        💨 ${Math.floor(adv.stamina)} / ${maxS}
                    </div>
                </div>
            `;
            
            row.onclick = () => {
                if (adv.isResting) {
                    adv.isResting = false;
                } else {
                    adv.isResting = true;
                    adv.isHealing = false;
                }
                this.render(container);
            };

            row.oncontextmenu = (e) => {
                e.preventDefault();
                HubManager.openCharacterDetails(adv);
            };
            
            list.appendChild(row);
        });

        container.appendChild(list);
    }
}