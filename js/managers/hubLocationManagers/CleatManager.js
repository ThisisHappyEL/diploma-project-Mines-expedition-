import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { TooltipManager } from './TooltipManager.js';
import { HubManager } from './HubManager.js';
import { RecruitManager } from './RecruitManager.js';
import { BiomeManager } from './BiomeManager.js';
import { EquipManager } from './EquipManager.js';

export const CleatManager = {
    sortBy: null,  
    sortDir: null, 

    render(container) {
        container.oncontextmenu = (e) => e.preventDefault();

        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:#aaa;">Некого отправлять.</p>';
            return;
        }
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.height = '100%';
        container.style.boxSizing = 'border-box';

        let squadVisual = `<div style="display:flex; justify-content:center; gap:10px; margin-bottom:10px; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #333; width: 100%; box-sizing: border-box;">`;
        for (let i = 4; i >= 1; i--) {
            const member = GameState.currentSquad[i - 1];
            squadVisual += `
                <div class="squad-slot" data-pos="${i}" style="width:160px; height:180px; border: 2px solid ${member ? '#ffbf00' : '#444'}; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; background: ${member ? '#2a241e' : 'transparent'}; cursor:${member ? 'grab' : 'default'}; overflow:hidden;">
                    <div style="font-size:12px; font-weight:bold; color:var(--color-gold); position:absolute; top:8px; text-transform:uppercase; letter-spacing:0.5px;">ПОЗИЦИЯ ${i}</div>
                    ${member ? `
                        <div style="margin-top:20px; pointer-events:none;">${CharacterRenderer.getAvatarHTML(member, '120px', true)}</div>
                        <div style="margin-top:8px; pointer-events:none; transform: scale(0.95);">${HubManager.getRangeHTML(HubManager.getUnitRangeData(member).ranks, HubManager.getUnitRangeData(member).targets)}</div>
                    ` : '<div style="color:#444; font-size:13px; font-weight:bold; margin-top:15px;">ПУСТО</div>'}
                </div>
            `;
        }
        squadVisual += `</div>`;

        const renderSortButton = (param, icon) => { 
            const isActive = this.sortBy === param;
            const dir = isActive ? this.sortDir : null;
            let label = icon;
            let borderStyle = '#444'; let colorStyle = '#888';
            if (dir === 'desc') { label += ' 🔽'; colorStyle = 'var(--color-success)'; borderStyle = 'var(--color-success)'; } 
            else if (dir === 'asc') { label += ' 🔼'; colorStyle = 'var(--color-warning)'; borderStyle = 'var(--color-warning)'; } 
            else { label += ' ➖'; }
            return `<button class="hub-btn sort-btn" data-param="${param}" style="padding: 4px 8px; font-size:12px; font-weight:bold; border-color:${borderStyle}; color:${colorStyle}; display:flex; align-items:center; gap:3px;">${label}</button>`;
        };

        const selectedBiomeId = GameState.selectedBiome || 'glassForest';
        const biomeBgUrl = `assets/img/backgrounds/${selectedBiomeId}/${selectedBiomeId}0.png`;
        const hasEquip = GameState.expeditionInventory.length > 0;
        const equipBgUrl = hasEquip ? `assets/img/backgrounds/hubLocations/warehouse.png` : null;

        const squadReady = GameState.currentSquad.filter(Boolean).length > 0;
        const alreadyExplored = GameState.hasFinishedExpedition;
        const startEnabled = squadReady && !alreadyExplored;
        
        let startLabel = '⬇️ Спустить Клеть';
        if (alreadyExplored) startLabel = '🔒 Клеть уже спускалась';
        else if (!squadReady) startLabel = '⚠️ Отряд не собран';

        const startBgUrl = startEnabled ? `assets/img/backgrounds/hubLocations/cleat.png` : null;

        const createPrepareButton = (id, label, borderColor, textColor, bgUrl, disabled) => {
            const disabledAttr = disabled ? 'disabled style="opacity: 0.35; cursor: not-allowed; border-color: #333; color: #666;"' : '';
            const bgHtml = (bgUrl && !disabled) 
                ? `<div style="position: absolute; top: 0; right: 0; width: 65%; height: 100%; background: url('${bgUrl}') center/cover no-repeat; -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%); mask-image: linear-gradient(to right, transparent 0%, black 50%); opacity: 0.45; z-index: 1; pointer-events: none; transition: 0.3s;"></div>`
                : '';
            const activeStyles = disabled ? '' : `border-color: ${borderColor}; color: ${textColor}; cursor: pointer;`;
            return `
                <button id="${id}" class="hub-btn action-btn" style="flex: 1; padding: 15px; font-size: 18px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: flex-start; min-height: 55px; box-sizing: border-box; ${activeStyles}" ${disabledAttr}>
                    ${bgHtml}
                    <span style="position: relative; z-index: 2; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); text-transform: uppercase; letter-spacing: 0.5px;">${label}</span>
                </button>
            `;
        };

        const biomeName = GameState.selectedBiome ? BiomeManager.BIOMES.find(b=>b.id===GameState.selectedBiome).name : "Выбор биома";
        
        const bottomBarHTML = `
            <div style="display:flex; gap: 15px; width: 100%; margin-top: 10px; flex-shrink:0;">
                ${createPrepareButton('btn-biome', `🌐 ${biomeName}`, '#b19cd9', '#b19cd9', biomeBgUrl, false)}
                ${createPrepareButton('btn-equip', '🎒 Снаряжение', '#4affab', '#4affab', equipBgUrl, false)}
                ${createPrepareButton('start-btn', startLabel, 'var(--color-danger)', 'var(--color-danger)', startBgUrl, !startEnabled)}
            </div>
        `;

        container.innerHTML = `
            ${squadVisual}
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-shrink:0; margin-bottom:10px; box-sizing:border-box; padding: 0 10px;">
                <div style="font-size: 18px; font-weight: bold;">Укомплектованность отряда: <b>${GameState.currentSquad.filter(Boolean).length} / 4</b></div>
                <div style="display:flex; gap:6px; align-items:center;">
                    <span style="color:#aaa; font-size:12px; font-weight:bold; margin-right:5px; text-transform:uppercase;">Сортировка:</span>
                    ${renderSortButton('hp', '❤️')} ${renderSortButton('stamina', '💨')} ${renderSortButton('battle', '⚔️')}
                    ${renderSortButton('mining', '⛏️')} ${renderSortButton('research', '📚')} ${renderSortButton('construction', '🔨')}
                    ${renderSortButton('scouting', '🪔')} ${renderSortButton('salary', '🕯️')}
                </div>
            </div>
            <div id="cleat-list" style="display: flex; flex-direction: column; gap: 5px; justify-content: start; width: 100%; flex: 1; min-height: 0; overflow-y:auto; padding-right:5px; box-sizing: border-box;"></div>
            ${bottomBarHTML}
        `;

        const sortBtns = container.querySelectorAll('.sort-btn');
        sortBtns.forEach(btn => { 
            btn.onclick = (e) => {
                e.stopPropagation();
                const param = btn.getAttribute('data-param');
                if (this.sortBy === param) {
                    if (this.sortDir === 'desc') this.sortDir = 'asc';
                    else if (this.sortDir === 'asc') { this.sortBy = null; this.sortDir = null; }
                } else { this.sortBy = param; this.sortDir = 'desc'; }
                CleatManager.render(container);
            };
        });

        const sortedRoster = [...GameState.roster];
        const getSortValue = (adv, param) => {
            if (param === 'hp' || param === 'stamina') {
                const maxVal = RecruitManager.getStat(adv, param);
                return maxVal === 0 ? 0 : adv[param] / maxVal; 
            }
            if (param === 'salary') return adv.salary || 0;
            return HubManager.getStat(adv, param);
        };

        if (this.sortBy && this.sortDir) {
            sortedRoster.sort((a, b) => {
                const valA = getSortValue(a, this.sortBy);
                const valB = getSortValue(b, this.sortBy);
                return this.sortDir === 'desc' ? valB - valA : valA - valB;
            });
        }

        const list = document.getElementById('cleat-list');
        sortedRoster.forEach(adv => {
            const isInSquad = GameState.currentSquad.some(s => s && s.id === adv.id);
            const traitDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
            const row = document.createElement('div');
            row.className = 'char-row';
            
            let borderStyle = '1px solid #555'; let bgStyle = 'var(--bg-panel)';
            if (isInSquad) { borderStyle = '2px solid var(--color-gold)'; bgStyle = 'var(--bg-btn)'; } 
            else if (adv.isResting) { borderStyle = '1px solid var(--color-success)'; } 
            else if (adv.isHealing) { borderStyle = '1px solid var(--color-danger)'; }

            row.style.cssText = `padding:0; display:flex; align-items:center; cursor:grab; transition:0.2s; height:95px; min-height:95px; box-sizing:border-box; border:${borderStyle}; background:${bgStyle}; width:100%; margin-bottom:5px; overflow:hidden; position:relative; flex-shrink:0;`;

            const maxH = RecruitManager.getStat(adv, 'hp');
            const maxS = RecruitManager.getStat(adv, 'stamina');

            let skillsIconsHtml = '';
            if (adv.equipment.rightHand && adv.equipment.rightHand.skills) {
                adv.equipment.rightHand.skills.forEach(s => {
                    const skillKey = s.id || s.key || '';
                    const skillTooltip = HubManager.getSkillTooltipHTML(s, adv.equipment.rightHand);
                    const ttId = TooltipManager.registerTooltip(skillTooltip);
                    skillsIconsHtml += `
                        <div class="cd-skill-square" data-tooltip-id="${ttId}" style="width: 48px; height: 48px; border: 1.5px solid #666; background: #000; cursor: help; flex-shrink: 0; display:flex; justify-content:center; align-items:center;">
                            ${skillKey ? `<img src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width:100%; height:100%; object-fit:cover;">` : ''}
                            <span class="cd-skill-text-fallback" style="display:none; font-size:11px; font-weight:bold;">${s.name.substring(0,3)}</span>
                        </div>
                    `;
                });
            } else {
                skillsIconsHtml = '<span style="color:#555; font-size:12px; font-weight:bold;">Нет навыков</span>';
            }

            const weaponName = adv.equipment.rightHand ? adv.equipment.rightHand.name : "Без оружия";
            const armorName = (adv.equipment.body || adv.civilBody) ? (adv.equipment.body || adv.civilBody).name : "Лохмотья";
            const zoomSize = "425px"; const offsetX = "-190px"; const offsetY = "-40px";

            row.innerHTML = `
                <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                    </div>
                </div>
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                    <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>
                <div style="flex: 0 0 22%; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:10px; font-size:13px; color:#ccc; font-weight:bold;">
                        <span>❤️ ${Math.floor(adv.hp)}/${maxH}</span><span>💨 ${Math.floor(adv.stamina)}/${maxS}</span>
                        <span style="color: var(--color-gold); margin-left: 5px;">🔼 ${adv.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${HubManager.getStat(adv, 'battle')}</span><span>⛏️ ${HubManager.getStat(adv, 'mining')}</span>
                        <span>📚 ${HubManager.getStat(adv, 'research')}</span><span>🔨 ${HubManager.getStat(adv, 'construction')}</span>
                        <span>🪔 ${HubManager.getStat(adv, 'scouting')}</span><span style="color:var(--color-gold); font-weight:bold; margin-left:8px; font-size:13px;">🕯️ ${adv.salary}</span>
                    </div>
                </div>
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:5px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold); border-right: 2px solid var(--color-gold);">
                    <div style="font-size:13px; color:#4affab; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚔️ ${weaponName}</div>
                    <div style="font-size:13px; color:#bbb; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🛡️ ${armorName}</div>
                </div>
                <div style="flex: 0 0 22%; display: flex; gap: 8px; align-items: center; justify-content: center; height: 100%; box-sizing: border-box; padding: 0 8px; border-right: 2px solid var(--color-gold); overflow-x: auto;">
                    ${skillsIconsHtml}
                </div>
                <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; height: 100%; box-sizing: border-box; padding-right: 15px; min-width: 0;">
                    <div style="pointer-events:none; transform: scale(0.95); transform-origin: right center;">
                        ${HubManager.getRangeHTML(HubManager.getUnitRangeData(adv).ranks, HubManager.getUnitRangeData(adv).targets)}
                    </div>
                </div>
            `;

            row.setAttribute('draggable', 'true');
            row.ondragstart = (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ id: adv.id, sourcePos: null })); row.style.opacity = '0.5'; };
            row.ondragend = () => { row.style.opacity = '1'; };

            row.onclick = () => {
                const idx = GameState.currentSquad.findIndex(s => s && s.id === adv.id);
                if (idx > -1) GameState.currentSquad[idx] = null;
                else {
                    const freeSlotIdx = GameState.currentSquad.findIndex(s => !s);
                    if (freeSlotIdx > -1) { adv.isResting = false; adv.isHealing = false; GameState.currentSquad[freeSlotIdx] = adv; } 
                    else if (GameState.currentSquad.length < 4) { adv.isResting = false; adv.isHealing = false; GameState.currentSquad.push(adv); }
                }
                CleatManager.render(container);
            };
            row.oncontextmenu = (e) => { e.preventDefault(); HubManager.openCharacterDetails(adv); };
            list.appendChild(row);
        });
        
        const slots = container.querySelectorAll('.squad-slot');
        slots.forEach(slotEl => {
            const pos = parseInt(slotEl.getAttribute('data-pos'));
            const member = GameState.currentSquad[pos - 1];

            if (member) {
                slotEl.setAttribute('draggable', 'true');
                slotEl.ondragstart = (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ id: member.id, sourcePos: pos })); slotEl.style.opacity = '0.5'; };
                slotEl.ondragend = () => { slotEl.style.opacity = '1'; };
                slotEl.onclick = () => { GameState.currentSquad[pos - 1] = null; CleatManager.render(container); };
                slotEl.oncontextmenu = (e) => { e.preventDefault(); HubManager.openCharacterDetails(member); };
            }

            slotEl.ondragover = (e) => { e.preventDefault(); slotEl.style.borderColor = 'var(--color-success)'; };
            slotEl.ondragleave = () => { slotEl.style.borderColor = member ? '#ffbf00' : '#444'; };
            slotEl.ondrop = (e) => {
                e.preventDefault();
                const dataStr = e.dataTransfer.getData('text/plain');
                if (!dataStr) return;
                const data = JSON.parse(dataStr);
                const adv = GameState.roster.find(a => a.id === parseFloat(data.id));
                if (!adv) return;
                adv.isResting = false; adv.isHealing = false;
                if (data.sourcePos !== undefined && data.sourcePos !== null) {
                    const temp = GameState.currentSquad[pos - 1];
                    GameState.currentSquad[pos - 1] = GameState.currentSquad[data.sourcePos - 1];
                    GameState.currentSquad[data.sourcePos - 1] = temp;
                } else {
                    const existingIdx = GameState.currentSquad.findIndex(s => s && s.id === adv.id);
                    if (existingIdx > -1) GameState.currentSquad[existingIdx] = null;
                    GameState.currentSquad[pos - 1] = adv;
                }
                CleatManager.render(container);
            };
        });

        document.getElementById('btn-biome').onclick = () => BiomeManager.openBiomeModal(container);
        document.getElementById('btn-equip').onclick = () => EquipManager.openEquipModal(container);
        document.getElementById('start-btn').onclick = () => {
            if (GameState.currentSquad.filter(Boolean).length > 0) {
                document.getElementById('building-ui').classList.add('hidden');
                SceneManager.changeScene(ExploreScene);
            }
        };
    }
};

window.CleatManager = CleatManager;
