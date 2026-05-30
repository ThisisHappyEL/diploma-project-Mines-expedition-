import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { TooltipManager } from './TooltipManager.js';
import { HubManager } from './HubManager.js';
import { RecruitManager } from './RecruitManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { GLASS_FOREST_ENEMIES } from '../../data/battleData/enemies.js';

export class CleatManager {
    static sortBy = null;  
    static sortDir = null; 
    static selectedBestiaryEnemy = null; 
    static equipFilter = 'all';

    static BIOMES = [
        { id: 'glassForest', name: 'Стеклянный лес', active: true, desc: 'Обширная сеть пещер, где порода кристаллизовалась. Обитают существа из живого стекла и протекают опасные токи.' },
        { id: 'amberHives', name: 'Янтарные ульи', active: false },
        { id: 'graphiteHills', name: 'Графитовые горки', active: false },
        { id: 'rustyBramble', name: 'Ржавый терновник', active: false },
        { id: 'singingPipes', name: 'Поющие трубы', active: false },
        { id: 'fatSwamp', name: 'Сало-топь', active: false },
        { id: 'mercuryMirrors', name: 'Ртутные зеркала', active: false },
        { id: 'saltHalls', name: 'Солёные чертоги', active: false },
        { id: 'magneticGardens', name: 'Магнитные сады', active: false },
        { id: 'cryoGrottos', name: 'Крио-гроты', active: false },
        { id: 'seaOfDarkness', name: 'Море Мрака', active: false },
        { id: 'basaltForge', name: 'Базальтовая кузня', active: false },
        { id: 'mudCauldrons', name: 'Грязевые котлы', active: false },
        { id: 'chitinThickets', name: 'Хитиновые чащи', active: false },
        { id: 'copperCascades', name: 'Медные каскады', active: false },
        { id: 'shiningWastes', name: 'Сияющие Пустоши', active: false }
    ];

    static render(container) {
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

        if (this.biomeBgRand === undefined) {
            this.biomeBgRand = Math.floor(Math.random() * 6);
        }

        const selectedBiomeId = GameState.selectedBiome || 'glassForest';
        const biomeBgUrl = `assets/img/backgrounds/${selectedBiomeId}/${selectedBiomeId}${this.biomeBgRand}.png`;

        // фон кнопочки видно, только если взят хотя бы один предмет
        const hasEquip = GameState.expeditionInventory.length > 0;
        const equipBgUrl = hasEquip ? `assets/img/backgrounds/hubLocations/warehouse.png` : null;

        // фон спуска активируется только при наличии людей в экспедиции
        const squadReady = GameState.currentSquad.filter(Boolean).length > 0;
        const startEnabled = GameState.currentSquad.filter(Boolean).length > 0;

        let startLabel = '⬇️ Спустить Клеть';
        if (!squadReady) startLabel = '⚠️ Отряд не собран';

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

        const biomeName = GameState.selectedBiome ? this.BIOMES.find(b=>b.id===GameState.selectedBiome).name : "Выбор биома";
        
        const bottomBarHTML = `
            <div style="display:flex; gap: 15px; width: 100%; margin-top: 10px; flex-shrink:0;">
                ${createPrepareButton('btn-biome', `🌐 ${biomeName}`, '#b19cd9', '#b19cd9', biomeBgUrl, false)}
                ${createPrepareButton('btn-equip', '🎒 Снаряжение', '#4affab', '#4affab', equipBgUrl, false)}
                ${createPrepareButton('start-btn', '⬇️ Спустить Клеть', 'var(--color-danger)', 'var(--color-danger)', startBgUrl, !startEnabled)}
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

            row.style.cssText = `padding:0; display:flex; align-items:center; cursor:grab; transition:0.2s; height:95px; min-height:95px; box-sizing:border-box; border:${borderStyle}; background:${bgStyle}; width:100%; margin-bottom:5px; overflow:hidden; position:relative;`;

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

        document.getElementById('btn-biome').onclick = () => this.openBiomeModal(container);
        document.getElementById('btn-equip').onclick = () => this.openEquipModal(container);
        document.getElementById('start-btn').onclick = () => {
            if (GameState.currentSquad.filter(Boolean).length > 0) {
                document.getElementById('building-ui').classList.add('hidden');
                SceneManager.changeScene(ExploreScene);
            }
        };
    }

    // выбор биома. Жаль, что он всего один
    static openBiomeModal(mainContainer) {
        const modal = document.getElementById('biome-modal');
        const body = document.getElementById('biome-body');
        modal.classList.remove('hidden');
        document.getElementById('biome-close-btn').onclick = () => modal.classList.add('hidden');

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div');
        leftCol.className = 'forge-column';
        leftCol.style.flex = '0 0 35%'; leftCol.style.maxWidth = '35%';
        leftCol.innerHTML = '<h3 style="color:#ffbf00; margin:0 0 15px 0; border-bottom:1px solid #555; padding-bottom:10px;">Доступные маршруты:</h3>';
        
        const listDiv = document.createElement('div');
        listDiv.className = 'forge-column-list';
        listDiv.style.cssText = "flex: 1; overflow-y: auto; padding-right: 5px; min-height: 0; width: 100%; display: flex; flex-direction: column; gap: 5px;";
        
        leftCol.appendChild(listDiv);

        let tempSelectedBiome = GameState.selectedBiome || 'glassForest';

        const renderBiomes = () => {
            listDiv.innerHTML = '';
            this.BIOMES.forEach(biome => {
                const btn = document.createElement('div');
                const isActive = tempSelectedBiome === biome.id;
                const disabledStyle = biome.active ? '' : 'opacity: 0.4; filter: grayscale(1); cursor: not-allowed;';
                
                let bgHtml = '';
                if (biome.id === 'glassForest') {
                    const rand = Math.floor(Math.random() * 6);
                    bgHtml = `<div style="position: absolute; top: 0; right: 0; width: 70%; height: 100%; background: url('assets/img/backgrounds/${biome.id}/${biome.id}${rand}.png') center/cover; -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%); mask-image: linear-gradient(to right, transparent 0%, black 40%); opacity: 0.5; z-index: 1; transition: 0.2s;"></div>`;
                }

                const borderCol = isActive ? 'var(--color-gold)' : '#555';
                const bgCol = isActive ? 'var(--bg-btn)' : 'var(--bg-panel)';

                btn.style.cssText = `position: relative; overflow: hidden; padding: 15px; border: 1px solid ${borderCol}; background: ${bgCol}; cursor: ${biome.active ? 'pointer' : 'not-allowed'}; ${disabledStyle} transition: 0.2s; min-height: 55px; flex-shrink: 0;`;
                
                btn.innerHTML = `
                    ${bgHtml}
                    <div style="position: relative; z-index: 2; font-size:18px; font-weight:bold; color:#fff;">
                        ${biome.name} ${biome.active ? '' : '<span style="color:#ff4444; font-size:9px; float:right; margin-top:4px; text-transform:uppercase;">[В разработке]</span>'}
                    </div>
                `;
                
                if (biome.active) {
                    btn.onmouseenter = () => { if (!isActive) btn.style.borderColor = '#fff'; };
                    btn.onmouseleave = () => { if (!isActive) btn.style.borderColor = '#555'; };
                    btn.onclick = () => { tempSelectedBiome = biome.id; renderBiomes(); renderRightPanel(); };
                }
                listDiv.appendChild(btn);
            });
        };

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column'; rightCol.style.flex = '1'; rightCol.style.maxWidth = '65%'; rightCol.style.display = 'flex'; rightCol.style.flexDirection = 'column';

        const renderRightPanel = () => {
            const selected = this.BIOMES.find(b => b.id === tempSelectedBiome);
            const p = GameState.biomeProgress;

            const makeBar = (label, icon, val, color) => `
                <div style="margin-bottom: 6px;">
                    <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>${icon} ${label}</span><b>${val}%</b></div>
                    <div style="width:100%; height:8px; background:#111; border:1px solid #444;"><div style="width:${val}%; height:100%; background:${color};"></div></div>
                </div>`;

            let tLevel = GameState.threatLevel || 0;
            let tColor, tText, tBg;
            if(tLevel < 30) { tColor = '#4affab'; tText = 'Фауна спокойна'; tBg = 'rgba(74,255,171,0.05)'; }
            else if(tLevel < 70) { tColor = '#ffbf00'; tText = 'Обитатели насторожены'; tBg = 'rgba(255,191,0,0.05)'; }
            else { tColor = '#ff4444'; tText = 'Твари в ярости!'; tBg = 'rgba(255,68,68,0.05)'; }

            rightCol.innerHTML = `
                <h2 style="color:var(--color-gold); margin:0 0 5px 0; font-size: 32px;">${selected.name}</h2>
                <p style="color:#ccc; font-style:italic; font-size: 14px; line-height:1.4; border-left: 2px solid #555; padding-left:10px; margin: 0 0 15px 0;">${selected.desc}</p>
                
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; margin-bottom: 15px; flex-shrink: 0;">
                    <h4 style="margin:0 0 10px 0; color:#fff; border-bottom:1px solid #555; padding-bottom:5px; font-size: 14px;">ПРОГРЕСС ИССЛЕДОВАНИЯ:</h4>
                    ${makeBar('Добыча', '⛏️', p.mining, '#ffbf00')}
                    ${makeBar('Изыскания', '📚', p.research, '#b19cd9')}
                    ${makeBar('Стройка', '🔨', p.construction, '#ff7f50')}
                    ${makeBar('Разведка', '🪔', p.scouting, '#4affab')}
                </div>

                <div style="display:flex; gap:15px; flex: 1; min-height: 0;">
                    
                    <!-- ЛЕВАЯ ЧАСТЬ: Находки (Тянутся вниз на всю высоту своей ниши) -->
                    <div style="flex: 1; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; display: flex; flex-direction: column;">
                        <h4 style="margin:0 0 10px 0; color:#fff; border-bottom:1px solid #555; padding-bottom:5px; font-size: 14px;">ДОСТУПНЫЕ НАХОДКИ:</h4>
                        <ul style="color:#aaa; font-size:13px; padding-left:20px; line-height: 1.6; margin: 0;">
                            <li>💎 Необработанные минералы</li><li>📜 Научные образцы</li><li>💀 Трофеи чудищ</li>
                        </ul>
                    </div>

                    <!-- ПРАВАЯ ЧАСТЬ: Уровень угрозы + кнопки -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                        
                        <div style="flex: 1; background: ${tBg}; padding: 15px; border: 1px solid ${tColor}; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <h4 style="margin:0 auto auto 0; width: 100%; color:${tColor}; border-bottom:1px solid ${tColor}; padding-bottom:5px; text-transform: uppercase; font-size: 14px;">⚠️ Уровень угрозы:</h4>
                            <div style="font-size:42px; font-weight:bold; color:${tColor}; text-align:center; margin-top:10px;">${tLevel}%</div>
                            <div style="font-size:13px; color:#aaa; text-align:center; margin-top:5px; margin-bottom: auto;">${tText}</div>
                        </div>

                        <button id="btn-open-bestiary" class="hub-btn action-btn" style="padding: 12px; font-size: 14px; border-color: #b19cd9; color: #b19cd9; flex-shrink: 0;">📖 Открыть Бестиарий</button>
                        <button id="btn-confirm-biome" class="hub-btn action-btn" style="padding: 15px; font-size: 16px; border-color: var(--color-success); color: var(--color-success); flex-shrink: 0;">✅ Подтвердить маршрут</button>
                    </div>

                </div>
            `;

            rightCol.querySelector('#btn-open-bestiary').onclick = () => this.openBestiaryModal();
            rightCol.querySelector('#btn-confirm-biome').onclick = () => { GameState.selectedBiome = tempSelectedBiome; modal.classList.add('hidden'); CleatManager.render(mainContainer); };
        };

        renderBiomes();
        renderRightPanel();
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);
    }


    // Бестиарий биома
    static openBestiaryModal() {
        const modal = document.getElementById('bestiary-modal');
        const body = document.getElementById('bestiary-body');
        modal.classList.remove('hidden');
        document.getElementById('bestiary-close-btn').onclick = () => modal.classList.add('hidden');

        // Базовые скейлинг и смещение спрайтов
        const DEFAULT_CONFIG = {
            list: { size: "350px", offsetX: "-120px", offsetY: "-150px", scale: "1.0" },
            detail: { size: "400px", offsetX: "0px", offsetY: "-200px", scale: "1.0" }
        };

        // Привязанные к конкретным чудикам скейлы и смещение
        const ENEMY_OVERRIDES = {
            piezoCrystal: {
                list: { size: "350px", offsetX: "-80px", offsetY: "-150px", scale: "1.0" },
                detail: { size: "400px", offsetX: "0px", offsetY: "-220px", scale: "1.0" }
            },
            fritta: {
                list: { size: "400px", offsetX: "-150px", offsetY: "-250px", scale: "1.0" },
                detail: { size: "500px", offsetX: "0px", offsetY: "-310px", scale: "1.0" }
            },
            glassSpider: {
                list: { size: "475px", offsetX: "-190px", offsetY: "-290px", scale: "1.0" },
            detail: { size: "600px", offsetX: "0px", offsetY: "-370px", scale: "1.0" }
            },
            vitrailSpider: {
                list: { size: "300px", offsetX: "-100px", offsetY: "-135px", scale: "1.0" },
            detail: { size: "380px", offsetX: "0px", offsetY: "-170px", scale: "1.0" }
            },
            glassMother: {
                list: { size: "280px", offsetX: "-50px", offsetY: "-80px", scale: "1.0" },
            detail: { size: "400px", offsetX: "0px", offsetY: "-190px", scale: "1.0" }
            },
        };

        const getSpriteConfig = (enemyId, viewType) => {
            const override = ENEMY_OVERRIDES[enemyId]?.[viewType];
            return override ? { ...DEFAULT_CONFIG[viewType], ...override } : DEFAULT_CONFIG[viewType];
        };

        const getVariationUrl = (enemy) => {
            if (!enemy.spriteVariations || enemy.spriteVariations <= 1) return enemy.spriteUrl;
            const variant = Math.floor(Math.random() * enemy.spriteVariations);
            return enemy.spriteUrl.replace('.png', `${variant}.png`);
        };

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div'); leftCol.className = 'forge-column'; leftCol.style.flex = '0 0 35%'; leftCol.style.maxWidth = '35%';
        const listDiv = document.createElement('div'); listDiv.className = 'forge-column-list'; listDiv.style.cssText = "flex: 1; overflow-y: auto; padding-right: 5px; min-height: 0;";
        const rightCol = document.createElement('div'); rightCol.className = 'forge-column'; rightCol.style.flex = '1'; rightCol.style.maxWidth = '65%';

        const enemies = Object.values(GLASS_FOREST_ENEMIES);
        if (!this.selectedBestiaryEnemy && enemies.length > 0) this.selectedBestiaryEnemy = enemies[0].id;

        const renderList = () => {
            listDiv.innerHTML = '';
            enemies.forEach(enemy => {
                const btn = document.createElement('div');
                btn.className = `char-row ${this.selectedBestiaryEnemy === enemy.id ? 'active-rest' : ''}`;
                btn.style.cssText = `padding: 0; border: 1px solid #555; background: var(--bg-panel); margin-bottom: 5px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; height: 75px; overflow: hidden;`;
                
                const titleColor = enemy.isBoss ? 'var(--color-danger)' : '#fff';
                const rndUrl = getVariationUrl(enemy);
                const cfg = getSpriteConfig(enemy.id, 'list');

                btn.innerHTML = `
                    <div style="padding-left: 15px; font-size: 16px; font-weight:bold; color:${titleColor}; z-index: 2;">${enemy.name}</div>
                    <div class="avatar-slice" style="width: 100px; height: 100%; position: relative; flex-shrink: 0; z-index: 1;">
                        <img src="${rndUrl}" style="position: absolute; width: ${cfg.size}; height: ${cfg.size}; top: ${cfg.offsetY}; right: ${cfg.offsetX}; transform: scale(${cfg.scale}); object-fit: contain; pointer-events: none; filter: drop-shadow(-5px 0 5px rgba(0,0,0,0.8)); transform-origin: right center;">
                    </div>
                `;
                
                btn.onclick = () => { this.selectedBestiaryEnemy = enemy.id; renderList(); renderDetails(); };
                listDiv.appendChild(btn);
            });
        };

        const renderDetails = () => {
            const enemy = enemies.find(e => e.id === this.selectedBestiaryEnemy);
            if (!enemy) return;

            const bossTag = enemy.isBoss ? '<span style="color:var(--color-danger); border: 1px solid var(--color-danger); padding: 2px 6px; font-size: 11px; text-transform: uppercase;">Вожак</span>' : '';
            const envTag = enemy.isEnvironment ? '<span style="color:#aaa; border: 1px solid #aaa; padding: 2px 6px; font-size: 11px; text-transform: uppercase;">Окружение</span>' : '';
            const rndUrl = getVariationUrl(enemy);
            const cfg = getSpriteConfig(enemy.id, 'detail');

            rightCol.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #444; padding-bottom: 10px;">
                    <div>
                        <h2 style="color: #b19cd9; margin: 0; font-size: 32px;">${enemy.name}</h2>
                        <div style="margin-top: 5px; display: flex; gap: 10px;">${bossTag}${envTag}</div>
                    </div>
                    <div style="text-align: right; font-size: 14px; color: #ccc;">
                        <div>❤️ Здоровье: <b style="color: #ff6666;">${enemy.hp}</b></div>
                        <div>⚔️ Угроза: <b style="color: #ffbf00;">${enemy.combat}</b></div>
                    </div>
                </div>

                <!-- БЛОК ПОЛНОГО СПРАЙТА УЖАТ ДО 120px ДЛЯ СОЗДАНИЯ ПРОСТРАНСТВА -->
                <div style="width: 100%; height: 120px; display: flex; justify-content: center; align-items: center; background: #050403; border: 1px solid #333; margin: 15px 0; overflow: visible; position: relative; flex-shrink: 0;">
                    <div style="position: absolute; width: ${cfg.size}; height: ${cfg.size}; top: ${cfg.offsetY}; left: calc(50% + ${cfg.offsetX}); transform: translateX(-50%) scale(${cfg.scale}); transform-origin: center center; pointer-events: none; z-index: 10;">
                        <img src="${rndUrl}" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(177, 156, 217, 0.4));">
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; margin-bottom: 15px; flex-shrink: 0;">
                    <h4 style="margin-top: 0; color: #fff; font-size: 14px; text-transform: uppercase;">Сводка наблюдений:</h4>
                    <p style="color: #aaa; font-style: italic; line-height: 1.4; margin-bottom: 0;">${enemy.lore}</p>
                </div>

                <div style="background: rgba(177, 156, 217, 0.05); padding: 15px; border: 1px solid #b19cd9; overflow-y: auto; flex: 1;">
                    <h4 style="margin-top: 0; color: #b19cd9; font-size: 14px; text-transform: uppercase;">Тактика и поведение:</h4>
                    <p style="color: #ccc; line-height: 1.5; margin-bottom: 0; white-space: pre-line;">${enemy.tactics}</p>
                </div>
            `;
        };

        renderList();
        renderDetails();

        leftCol.appendChild(listDiv);
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);
    }

    static openEquipModal(mainContainer) {
        GameState.initDebugInventory(); 

        TooltipManager.clear();
        const modal = document.getElementById('equip-modal');
        const body = document.getElementById('equip-body');
        modal.classList.remove('hidden');
        document.getElementById('equip-close-btn').onclick = () => {
            modal.classList.add('hidden');
            CleatManager.render(mainContainer);
        };

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div'); leftCol.className = 'forge-column';
        const rightCol = document.createElement('div'); rightCol.className = 'forge-column';
        
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);

        this.renderEquipLists(leftCol, rightCol);
    }

    static renderEquipLists(leftCol, rightCol) {
        const renderFilterBtn = (id, text) => `<button class="filter-toggle-btn ${this.equipFilter === id ? 'active' : ''}" data-f="${id}">${text}</button>`;
        
        leftCol.innerHTML = `
            <div style="margin-bottom: 15px; border-bottom:1px solid #555; padding-bottom:10px;">
                <h3 style="color:#ffbf00; margin:0 0 10px 0;">Склад:</h3>
                <div class="filter-btn-group" id="equip-filters" style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${renderFilterBtn('all', '⭐ Все')}
                    ${renderFilterBtn('foodAndWater', 'Еда/Вода')}
                    ${renderFilterBtn('miningMaterials', 'Добыча')}
                    ${renderFilterBtn('researchMaterials', 'Изыскания')}
                    ${renderFilterBtn('buildingMaterials', 'Стройка')}
                    ${renderFilterBtn('scoutingMaterials', 'Разведка')}
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const btns = leftCol.querySelectorAll('#equip-filters .filter-toggle-btn');
            btns.forEach(b => { b.onclick = () => { this.equipFilter = b.getAttribute('data-f'); this.renderEquipLists(leftCol, rightCol); }; });
        }, 0);

        const leftList = document.createElement('div');
        leftList.className = 'forge-column-list';
        leftList.style.display = 'flex'; leftList.style.flexWrap = 'wrap'; leftList.style.gap = '5px'; leftList.style.alignContent = 'flex-start';

        const availableItems = GameState.inventory.filter(i => {
            if (i.type !== 'supplies') return false;
            if (this.equipFilter !== 'all' && i.category !== this.equipFilter) return false;
            return true;
        });
        
        availableItems.forEach(item => {
            const box = document.createElement('div'); 
            box.className = 'inv-item'; 
            box.style.cursor = 'pointer';
            box.style.overflow = 'hidden';
            
            const iconMap = { 
                foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', 
                buildingMaterials: '🔨', scoutingMaterials: '🪔' 
            };
            const icon = iconMap[item.category] || '📦';

            box.innerHTML = `
                <div class="inv-fallback" style="display:flex; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="inv-icon" style="font-size: 28px; line-height: 1;">${icon}</div>
                    <div class="inv-name" style="margin-top: 5px; color: #aaa; font-size: 10px; text-align: center; padding: 0 4px; box-sizing: border-box;">${item.name}</div>
                </div>
            `;
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            box.onclick = () => { GameState.inventory.splice(GameState.inventory.findIndex(i => i.id === item.id), 1); GameState.expeditionInventory.push(item); this.renderEquipLists(leftCol, rightCol); };
            leftList.appendChild(box);
        });
        if (availableItems.length === 0) leftList.innerHTML = '<p style="color:#aaa;">На складе нет подходящего снаряжения.</p>';
        leftCol.appendChild(leftList);

        rightCol.innerHTML = '<h3 style="color:#4affab; margin-top:0; margin-bottom:10px; border-bottom:1px solid #555; padding-bottom:10px;">Рюкзак экспедиции:</h3>';
        const rightList = document.createElement('div');
        rightList.className = 'forge-column-list';
        rightList.style.display = 'flex'; rightList.style.flexWrap = 'wrap'; rightList.style.gap = '5px'; rightList.style.alignContent = 'flex-start';

        GameState.expeditionInventory.forEach(item => {
            const box = document.createElement('div'); 
            box.className = 'inv-item'; 
            box.style.cursor = 'pointer'; 
            box.style.borderColor = '#4affab';
            box.style.overflow = 'hidden';
            
            const iconMap = { 
                foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', 
                buildingMaterials: '🔨', scoutingMaterials: '🪔' 
            };
            const icon = iconMap[item.category] || '📦';

            box.innerHTML = `
                <div class="inv-fallback" style="display:flex; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="inv-icon" style="font-size: 28px; line-height: 1;">${icon}</div>
                    <div class="inv-name" style="margin-top: 5px; color: #aaa; font-size: 10px; text-align: center; padding: 0 4px; box-sizing: border-box;">${item.name}</div>
                </div>
            `;
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            box.onclick = () => { GameState.expeditionInventory.splice(GameState.expeditionInventory.findIndex(i => i.id === item.id), 1); GameState.inventory.push(item); this.renderEquipLists(leftCol, rightCol); };
            rightList.appendChild(box);
        });

        if (GameState.expeditionInventory.length === 0) rightList.innerHTML = '<p style="color:#aaa;">Инвентарь пуст. Кликните по предмету слева.</p>';
        rightCol.appendChild(rightList);

        const hintsBox = document.createElement('div');
        hintsBox.style.cssText = "background: rgba(0,0,0,0.4); border: 1px solid #555; padding: 15px; margin-top: auto; flex-shrink:0;";
        
        const p = GameState.biomeProgress;
        const iconMap = { miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
        
        let hintsHtml = '<h4 style="color:var(--color-gold); margin-top:0;">Аналитика для текущего прогресса:</h4><ul style="color:#ccc; font-size:13px; padding-left:20px; margin:0; line-height: 1.5;">';
        
        let foundHint = false;
        Object.entries(EQUIPMENT).forEach(([cat, items]) => {
            Object.values(items).forEach(item => {
                const progTypeMap = { miningMaterials: p.mining, researchMaterials: p.research, buildingMaterials: p.construction, scoutingMaterials: p.scouting };
                const currentProg = progTypeMap[cat];
                const catIcon = iconMap[cat] || '💡';
                
                if (currentProg !== undefined) {
                    if (item.requiredAt !== undefined && currentProg >= item.requiredAt) {
                        hintsHtml += `<li style="color:#ff4444; margin-bottom:5px;">${catIcon} Строго необходимо: <b>${item.name}</b></li>`;
                        foundHint = true;
                    } 
                    else if (item.usefulAt !== undefined && currentProg >= item.usefulAt) {
                        hintsHtml += `<li style="color:#ffbf00; margin-bottom:5px;">${catIcon} Сильно ускорит: <b>${item.name}</b></li>`;
                        foundHint = true;
                    }
                }
            });
        });

        if (!foundHint) hintsHtml += '<li>Специфические инструменты пока не требуются. Берите еду и освещение.</li>';
        hintsHtml += '</ul>';
        hintsBox.innerHTML = hintsHtml;

        rightCol.appendChild(hintsBox);
    }
}