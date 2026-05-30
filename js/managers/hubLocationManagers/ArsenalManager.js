import { GameState } from '../../core/GameState.js';
import { HubManager } from './HubManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { RecruitManager } from './RecruitManager.js';

export class ArsenalManager {
    static render(container) {
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';

        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:#aaa;">В ростере нет погруженцев.</p>';
            return;
        }

        container.innerHTML = `<h3 style="margin-top:0; color:#ffbf00; margin-bottom:15px;">Доступные погруженцы: ${GameState.roster.length}</h3>`;
        
        const list = document.createElement('div');
        list.style.width = '100%';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';

        GameState.roster.forEach(adv => {
            const row = document.createElement('div');
            row.className = `char-row ${adv.isResting ? 'active-rest' : ''} ${adv.isHealing ? 'active-heal' : ''}`;
            row.style.cssText = "padding: 0; display: flex; align-items: center; cursor: pointer; transition: 0.2s; height: 95px; min-height: 95px; box-sizing: border-box; overflow: hidden; position: relative; width: 100%; margin-bottom: 5px;";

            const traitDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
            const maxH = RecruitManager.getStat(adv, 'hp');
            const maxS = RecruitManager.getStat(adv, 'stamina');
            const weaponName = adv.equipment.rightHand ? adv.equipment.rightHand.name : "Без оружия";
            const armorName = (adv.equipment.body || adv.civilBody) ? (adv.equipment.body || adv.civilBody).name : "Лохмотья";

            // Скейлинг спрайтов погруженцев
            const zoomSize = "425px";
            const offsetX = "-190px";
            const offsetY = "-40px";

            row.innerHTML = `
                <!-- Колонна 1 (90px): Срез лица -->
                <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                    </div>
                </div>
                
                <!-- Колонна 2 (18%): Имя, Предыстория и Черта -->
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                    <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>

                <!-- Колонна 3 (22%): Характеристики + Свечка -->
                <div style="flex: 0 0 22%; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:10px; font-size:13px; color:#ccc; font-weight:bold;">
                        <span>❤️ ${Math.floor(adv.hp)}/${maxH}</span>
                        <span>💨 ${Math.floor(adv.stamina)}/${maxS}</span>
                        <span style="color: var(--color-gold); margin-left: 5px;">🔼 ${adv.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${RecruitManager.getStat(adv, 'battle')}</span>
                        <span>⛏️ ${RecruitManager.getStat(adv, 'mining')}</span>
                        <span>📚 ${RecruitManager.getStat(adv, 'research')}</span>
                        <span>🔨 ${RecruitManager.getStat(adv, 'construction')}</span>
                        <span>🪔 ${RecruitManager.getStat(adv, 'scouting')}</span>
                        <span style="color:var(--color-gold); font-weight:bold; margin-left:8px; font-size:13px;">🕯️ ${adv.salary}</span>
                    </div>
                </div>

                <!-- Колонна 4 (18%): Экипировка -->
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:5px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold); border-right: 2px solid var(--color-gold);">
                    <div style="font-size:13px; color:#4affab; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚔️ ${weaponName}</div>
                    <div style="font-size:13px; color:#bbb; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🛡️ ${armorName}</div>
                </div>
            `;

            const rangeCol = document.createElement('div');
            rangeCol.style.cssText = "flex: 0 0 14%; display: flex; align-items: center; justify-content: center; height: 100%; box-sizing: border-box; min-width: 0; border-right: 2px solid var(--color-gold);";
            rangeCol.innerHTML = `
                <div style="pointer-events:none; transform: scale(0.95); transform-origin: center center;">
                    ${HubManager.getRangeHTML(HubManager.getUnitRangeData(adv).ranks, HubManager.getUnitRangeData(adv).targets)}
                </div>
            `;
            row.appendChild(rangeCol);

            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = "width: 180px; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 0 15px; box-sizing: border-box; flex-shrink: 0;";

            const restBtn = document.createElement('button');
            restBtn.className = 'hub-btn';
            restBtn.style.padding = '4px 8px';
            restBtn.style.fontSize = '12px';
            restBtn.style.borderColor = adv.isResting ? 'var(--color-success)' : '#444';
            restBtn.innerHTML = adv.isResting ? '💤 Отдыхает' : '🛌 Отдых';
            restBtn.onclick = (e) => {
                e.stopPropagation();
                adv.isResting = !adv.isResting;
                if (adv.isResting) adv.isHealing = false;
                ArsenalManager.render(container);
            };

            const healBtn = document.createElement('button');
            healBtn.className = 'hub-btn';
            healBtn.style.padding = '4px 8px';
            healBtn.style.fontSize = '12px';
            healBtn.style.borderColor = adv.isHealing ? 'var(--color-danger)' : '#444';
            healBtn.innerHTML = adv.isHealing ? '🩹 Лечится' : '🏥 Лечение';
            healBtn.onclick = (e) => {
                e.stopPropagation();
                adv.isHealing = !adv.isHealing;
                if (adv.isHealing) adv.isResting = false;
                ArsenalManager.render(container);
            };

            btnGroup.appendChild(restBtn);
            btnGroup.appendChild(healBtn);
            row.appendChild(btnGroup);

            row.onclick = () => HubManager.openCharacterDetails(adv);
            row.oncontextmenu = (e) => {
                e.preventDefault();
                HubManager.openCharacterDetails(adv);
            };
            
            list.appendChild(row);
        });

        container.appendChild(list);
    }
}