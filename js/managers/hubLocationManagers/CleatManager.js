import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { TooltipManager } from './TooltipManager.js';
import { HubManager } from './HubManager.js';
import { RecruitManager } from './RecruitManager.js';
import { BiomeManager } from './BiomeManager.js';
import { EquipManager } from './EquipManager.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { SaveManager } from '../SaveManager.js';

const COL_NAMES = ['Тыл', 'Центр', 'Фронт'];
const LANE_NAMES = ['Верх', 'Центр', 'Низ'];

// Временный профиль дальности по категории оружия (будет перенесён в единую схему оружия на этапе боёвки)
const WEAPON_RANGE_PROFILES = {
    swords:     { label: 'Ближний', optimalCols: [2],    color: '#ff6666' },
    axes:       { label: 'Ближний', optimalCols: [2],    color: '#ff6666' },
    hammers:    { label: 'Ближний', optimalCols: [2],    color: '#ff6666' },
    spears:     { label: 'Средний', optimalCols: [1, 2], color: '#ffbf00' },
    bows:       { label: 'Дальний', optimalCols: [0, 1], color: '#4affab' },
    crossbows:  { label: 'Дальний', optimalCols: [0, 1], color: '#4affab' },
    slings:     { label: 'Дальний', optimalCols: [0, 1], color: '#4affab' },
    arquebuses: { label: 'Дальний', optimalCols: [0, 1], color: '#4affab' },
};

export const CleatManager = {
    sortBy: null,
    sortDir: null,
    draggedAdvId: null,

    ensureSquadArray() {
        if (!Array.isArray(GameState.currentSquad) || GameState.currentSquad.length !== 9) {
            const fixed = new Array(9).fill(null);
            if (Array.isArray(GameState.currentSquad)) {
                GameState.currentSquad.slice(0, 9).forEach((m, i) => { fixed[i] = m || null; });
            }
            GameState.currentSquad = fixed;
        }
    },

    getWeaponProfile(adv) {
        const weapon = adv?.equipment?.rightHand;
        if (!weapon) {
            return { label: 'Без оружия (Ближ.)', optimalCols: [2], color: '#888' };
        }
        const cat = HubManager.getLocalCategory(weapon) || weapon.category;
        return WEAPON_RANGE_PROFILES[cat] || { label: 'Ближний', optimalCols: [2], color: '#ffbf00' };
    },

    getLineDotsHTML(adv) {
        const prof = this.getWeaponProfile(adv);
        const dots = [0, 1, 2].map(col => {
            const active = prof.optimalCols.includes(col);
            const tt = `${COL_NAMES[col]}: ${active ? 'эффективная позиция' : 'неэффективно'}`;
            return `<span class="range-3x3-dot ${active ? 'active' : ''}" title="${tt}"></span>`;
        }).join('');
        return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                <div class="range-3x3-dots">${dots}</div>
                <span style="font-size:10px; color:${prof.color}; font-weight:bold;">${prof.label}</span>
            </div>
        `;
    },

    findBestSlotForAdv(adv) {
        const prof = this.getWeaponProfile(adv);
        // Сначала пробуем центр коридора, затем верх/низ на оптимальных колонках
        const laneOrder = [1, 0, 2];
        const colOrder = [...prof.optimalCols, ...[2, 1, 0].filter(c => !prof.optimalCols.includes(c))];

        for (const col of colOrder) {
            for (const lane of laneOrder) {
                const idx = lane * 3 + col;
                if (!GameState.currentSquad[idx]) return idx;
            }
        }
        return -1;
    },

    render(container) {
        this.ensureSquadArray();
        TooltipManager.clear();
        container.oncontextmenu = (e) => e.preventDefault();

        if (GameState.isExpeditionActive) {
            container.innerHTML = `
                <div style="margin:auto; text-align:center; max-width:520px; background:rgba(0,0,0,0.5); border:2px solid var(--color-gold); padding:30px;">
                    <h2 style="color:var(--color-gold); margin-top:0;">Клеть сейчас в шахте</h2>
                    <p style="color:#ccc; line-height:1.5; font-size:14px;">
                        Текущая смена находится под землёй на паузе (глубина <b>${GameState.currentMine?.cageDepth || 1}</b>, осталось <b>${GameState.cycleHoursLeft ?? 24} ч</b>).<br><br>
                        Вы можете нанимать людей и покупать экипировку для следующей смены или вернуться к управлению текущей.
                    </p>
                    <button id="cleat-resume-btn" class="hub-btn action-btn btn-bold" style="margin-top:15px; width:100%; text-align:center; border-color:var(--color-success); color:var(--color-success); font-size:16px;">
                        ⬇️ Вернуться в шахту
                    </button>
                </div>
            `;
            document.getElementById('cleat-resume-btn').onclick = () => {
                document.getElementById('building-ui').classList.add('hidden');
                SceneManager.changeScene(ExploreScene);
            };
            return;
        }

        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:#aaa;">Некого отправлять. Наймите погруженцев в Потоке авантюристов.</p>';
            return;
        }

        const maxSquad = HUB_BALANCE.expedition?.maxSquadSize || 4;
        const squadMembers = GameState.currentSquad.filter(Boolean);
        const squadCount = squadMembers.length;

        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.height = '100%';
        container.style.boxSizing = 'border-box';

        // Подсчет по линиям и суммарные статы отряда
        const colCounts = [0, 0, 0];
        let suboptimalCount = 0;
        const totals = { battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 };

        GameState.currentSquad.forEach((member, idx) => {
            if (!member) return;
            const col = idx % 3;
            colCounts[col]++;
            const prof = this.getWeaponProfile(member);
            if (!prof.optimalCols.includes(col)) suboptimalCount++;
            totals.battle += HubManager.getStat(member, 'battle');
            totals.mining += HubManager.getStat(member, 'mining');
            totals.research += HubManager.getStat(member, 'research');
            totals.construction += HubManager.getStat(member, 'construction');
            totals.scouting += HubManager.getStat(member, 'scouting');
        });

        // Построение 3x3 сетки
        let gridRowsHTML = '';
        for (let lane = 0; lane < 3; lane++) {
            let cellsHTML = '';
            for (let col = 0; col < 3; col++) {
                const idx = lane * 3 + col;
                const member = GameState.currentSquad[idx];

                if (member) {
                    const prof = this.getWeaponProfile(member);
                    const isOptimal = prof.optimalCols.includes(col);
                    const maxH = RecruitManager.getStat(member, 'hp');
                    const maxS = RecruitManager.getStat(member, 'stamina');
                    const weaponName = member.equipment?.rightHand ? member.equipment.rightHand.name : 'Без оружия';
                    const warnText = `<b>Неподходящая линия!</b><br>${weaponName} эффективно работает с линии: <b>${prof.optimalCols.map(c => COL_NAMES[c]).join(' / ')}</b>.`;
                    const warnBadge = !isOptimal
                        ? `<span class="slot-warn-badge" data-tooltip-id="${TooltipManager.registerTooltip(warnText)}">⚠️</span>`
                        : '';

                    cellsHTML += `
                        <div class="squad-slot-3x3 occupied ${isOptimal ? '' : 'suboptimal'}" data-idx="${idx}" data-col="${col}" draggable="true">
                            ${warnBadge}
                            <div style="width:60px; height:66px; flex-shrink:0; pointer-events:none;">
                                ${CharacterRenderer.getAvatarHTML(member, '66px', true)}
                            </div>
                            <div class="slot-mini-info">
                                <div class="slot-mini-name">${member.name}</div>
                                <div class="slot-mini-weapon">⚔️ ${weaponName}</div>
                                <div class="slot-mini-bars">
                                    <span style="color:#ff6666;">❤️ ${Math.floor(member.hp)}/${maxH}</span>
                                    <span style="color:#4affab;">💨 ${Math.floor(member.stamina)}/${maxS}</span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    cellsHTML += `
                        <div class="squad-slot-3x3" data-idx="${idx}" data-col="${col}">
                            <div class="slot-empty-hint">${COL_NAMES[col]}</div>
                        </div>
                    `;
                }
            }

            gridRowsHTML += `
                <div class="cleat-grid-row">
                    <div class="cleat-lane-label">${LANE_NAMES[lane]}</div>
                    ${cellsHTML}
                </div>
            `;
        }

        const positionStatusHTML = squadCount === 0
            ? `<div style="color:#888; font-size:12px;">Перетащите бойцов в сетку или кликните по строке снизу.</div>`
            : (suboptimalCount > 0
                ? `<div style="color:var(--color-warning); font-size:12px; font-weight:bold;">⚠️ Вне эффективной линии: ${suboptimalCount}</div>`
                : `<div style="color:var(--color-success); font-size:12px; font-weight:bold;">✅ Все бойцы на эффективных позициях</div>`);

        const topPanelHTML = `
            <div class="cleat-top-panel">
                <div class="cleat-grid-section">
                    <div class="cleat-col-headers">
                        <div></div>
                        <div>🛡️ Тыл</div>
                        <div>⚖️ Центр</div>
                        <div>⚔️ Фронт ➔</div>
                    </div>
                    <div class="cleat-grid-rows">${gridRowsHTML}</div>
                </div>

                <div class="cleat-summary-section">
                    <div class="cleat-summary-header">
                        <span style="font-size:15px; font-weight:bold; color:var(--color-gold);">
                            ОТРЯД: <b style="color:#fff;">${squadCount} / ${maxSquad}</b>
                        </span>
                        <button id="cleat-clear-squad" class="hub-btn" style="padding:3px 10px; font-size:11px; border-color:#666;" ${squadCount === 0 ? 'disabled' : ''}>
                            Очистить
                        </button>
                    </div>

                    <div class="cleat-lines-stats">
                        <div class="cleat-line-pill"><div style="color:#888;">Тыл</div><b style="font-size:14px; color:#fff;">${colCounts[0]}</b></div>
                        <div class="cleat-line-pill"><div style="color:#888;">Центр</div><b style="font-size:14px; color:#fff;">${colCounts[1]}</b></div>
                        <div class="cleat-line-pill"><div style="color:#ffbf00;">Фронт</div><b style="font-size:14px; color:#fff;">${colCounts[2]}</b></div>
                    </div>

                    <div>
                        <div style="font-size:10px; color:#888; text-transform:uppercase; margin-bottom:4px;">Суммарная мощь отряда:</div>
                        <div class="cleat-total-stats">
                            <span>⚔️ ${totals.battle}</span>
                            <span>⛏️ ${totals.mining}</span>
                            <span>📚 ${totals.research}</span>
                            <span>🔨 ${totals.construction}</span>
                            <span>🪔 ${totals.scouting}</span>
                        </div>
                    </div>

                    <div style="border-top:1px dashed #333; padding-top:6px;">
                        ${positionStatusHTML}
                        <div style="font-size:11px; color:#777; margin-top:4px;">ПКМ по бойцу — профиль и экипировка</div>
                    </div>
                </div>
            </div>
        `;

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
        const biomeBgUrl = `assets/img/backgrounds/${selectedBiomeId}/${selectedBiomeId}0.webp`;
        const hasEquip = GameState.expeditionInventory.length > 0;
        const equipBgUrl = hasEquip ? `assets/img/backgrounds/hubLocations/warehouse.webp` : null;

        const hoursLeft = GameState.cycleHoursLeft ?? 24;
        const noTimeLeft = hoursLeft <= 0;
        const startEnabled = squadCount > 0 && !noTimeLeft;

        let startLabel = `⬇️ Спустить Клеть (${hoursLeft}ч)`;
        if (noTimeLeft) startLabel = '🔒 Время цикла вышло (0/24ч)';
        else if (squadCount === 0) startLabel = '⚠️ Отряд не собран';

        const startBgUrl = startEnabled ? `assets/img/backgrounds/hubLocations/cleat.webp` : null;

        const createPrepareButton = (id, label, borderColor, textColor, bgUrl, disabled) => {
            const disabledAttr = disabled ? 'disabled style="opacity: 0.35; cursor: not-allowed; border-color: #333; color: #666;"' : '';
            const bgHtml = (bgUrl && !disabled)
                ? `<div style="position: absolute; top: 0; right: 0; width: 65%; height: 100%; background: url('${bgUrl}') center/cover no-repeat; -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%); mask-image: linear-gradient(to right, transparent 0%, black 50%); opacity: 0.45; z-index: 1; pointer-events: none; transition: 0.3s;"></div>`
                : '';
            const activeStyles = disabled ? '' : `border-color: ${borderColor}; color: ${textColor}; cursor: pointer;`;
            return `
                <button id="${id}" class="hub-btn action-btn" style="flex: 1; padding: 14px; font-size: 17px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: flex-start; min-height: 52px; box-sizing: border-box; ${activeStyles}" ${disabledAttr}>
                    ${bgHtml}
                    <span style="position: relative; z-index: 2; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); text-transform: uppercase; letter-spacing: 0.5px;">${label}</span>
                </button>
            `;
        };

        const biomeName = GameState.selectedBiome ? BiomeManager.BIOMES.find(b => b.id === GameState.selectedBiome).name : 'Выбор биома';

        const bottomBarHTML = `
            <div style="display:flex; gap: 15px; width: 100%; flex-shrink:0;">
                ${createPrepareButton('btn-biome', `🌐 ${biomeName}`, '#b19cd9', '#b19cd9', biomeBgUrl, false)}
                ${createPrepareButton('btn-equip', '🎒 Снаряжение', '#4affab', '#4affab', equipBgUrl, false)}
                ${createPrepareButton('start-btn', startLabel, 'var(--color-danger)', 'var(--color-danger)', startBgUrl, !startEnabled)}
            </div>
        `;

        container.innerHTML = `
            <div class="cleat-layout">
                ${topPanelHTML}
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-shrink:0; padding: 0 4px;">
                    <div style="font-size: 15px; font-weight: bold;">Доступный состав (${GameState.roster.length})</div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <span style="color:#aaa; font-size:12px; font-weight:bold; margin-right:5px; text-transform:uppercase;">Сортировка:</span>
                        ${renderSortButton('hp', '❤️')} ${renderSortButton('stamina', '💨')} ${renderSortButton('battle', '⚔️')}
                        ${renderSortButton('mining', '⛏️')} ${renderSortButton('research', '📚')} ${renderSortButton('construction', '🔨')}
                        ${renderSortButton('scouting', '🪔')} ${renderSortButton('salary', '🕯️')}
                    </div>
                </div>
                <div id="cleat-list" style="display: flex; flex-direction: column; gap: 5px; width: 100%; flex: 1; min-height: 0; overflow-y:auto; padding-right:5px; box-sizing: border-box;"></div>
                ${bottomBarHTML}
            </div>
        `;

        // Сортировка
        container.querySelectorAll('.sort-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const param = btn.getAttribute('data-param');
                if (this.sortBy === param) {
                    if (this.sortDir === 'desc') this.sortDir = 'asc';
                    else if (this.sortDir === 'asc') { this.sortBy = null; this.sortDir = null; }
                } else {
                    this.sortBy = param;
                    this.sortDir = 'desc';
                }
                CleatManager.render(container);
            };
        });

        const clearBtn = document.getElementById('cleat-clear-squad');
        if (clearBtn) {
            clearBtn.onclick = () => {
                GameState.currentSquad = new Array(9).fill(null);
                SaveManager.saveGame();
                CleatManager.render(container);
            };
        }

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

            row.style.cssText = `padding:0; display:flex; align-items:center; cursor:grab; transition:0.2s; height:86px; min-height:86px; box-sizing:border-box; border:${borderStyle}; background:${bgStyle}; width:100%; margin-bottom:2px; overflow:hidden; position:relative; flex-shrink:0;`;

            const maxH = RecruitManager.getStat(adv, 'hp');
            const maxS = RecruitManager.getStat(adv, 'stamina');

            let skillsIconsHtml = '';
            if (adv.equipment.rightHand && adv.equipment.rightHand.skills) {
                adv.equipment.rightHand.skills.forEach(s => {
                    const skillKey = s.id || s.key || '';
                    const skillTooltip = HubManager.getSkillTooltipHTML(s, adv.equipment.rightHand);
                    const ttId = TooltipManager.registerTooltip(skillTooltip);
                    skillsIconsHtml += `
                        <div class="cd-skill-square" data-tooltip-id="${ttId}" style="width: 44px; height: 44px; border: 1.5px solid #666; background: #000; cursor: help; flex-shrink: 0; display:flex; justify-content:center; align-items:center;">
                            ${skillKey ? `<img src="assets/img/weaponSkillsIcons/${skillKey}.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width:100%; height:100%; object-fit:cover;">` : ''}
                            <span class="cd-skill-text-fallback" style="display:none; font-size:11px; font-weight:bold;">${s.name.substring(0, 3)}</span>
                        </div>
                    `;
                });
            } else {
                skillsIconsHtml = '<span style="color:#555; font-size:12px; font-weight:bold;">Нет навыков</span>';
            }

            const weaponName = adv.equipment.rightHand ? adv.equipment.rightHand.name : 'Без оружия';
            const armorName = (adv.equipment.body || adv.civilBody) ? (adv.equipment.body || adv.civilBody).name : 'Лохмотья';
            const zoomSize = '425px'; const offsetX = '-190px'; const offsetY = '-40px';

            row.innerHTML = `
                <div class="avatar-slice" style="width: 86px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                    </div>
                </div>
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                    <span style="font-size:12px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>
                <div style="flex: 0 0 22%; display: flex; flex-direction: column; justify-content: center; gap:6px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:10px; font-size:12px; color:#ccc; font-weight:bold;">
                        <span>❤️ ${Math.floor(adv.hp)}/${maxH}</span><span>💨 ${Math.floor(adv.stamina)}/${maxS}</span>
                        <span style="color: var(--color-gold); margin-left: 5px;">🔼 ${adv.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:12px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${HubManager.getStat(adv, 'battle')}</span><span>⛏️ ${HubManager.getStat(adv, 'mining')}</span>
                        <span>📚 ${HubManager.getStat(adv, 'research')}</span><span>🔨 ${HubManager.getStat(adv, 'construction')}</span>
                        <span>🪔 ${HubManager.getStat(adv, 'scouting')}</span><span style="color:var(--color-gold); font-weight:bold; margin-left:8px;">🕯️ ${adv.salary}</span>
                    </div>
                </div>
                <div style="flex: 0 0 18%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold); border-right: 2px solid var(--color-gold);">
                    <div style="font-size:12px; color:#4affab; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚔️ ${weaponName}</div>
                    <div style="font-size:12px; color:#bbb; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🛡️ ${armorName}</div>
                </div>
                <div style="flex: 0 0 22%; display: flex; gap: 6px; align-items: center; justify-content: center; height: 100%; box-sizing: border-box; padding: 0 8px; border-right: 2px solid var(--color-gold); overflow-x: auto;">
                    ${skillsIconsHtml}
                </div>
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; height: 100%; box-sizing: border-box; padding: 0 10px; min-width: 0;">
                    ${this.getLineDotsHTML(adv)}
                </div>
            `;

            row.setAttribute('draggable', 'true');
            row.ondragstart = (e) => {
                this.draggedAdvId = adv.id;
                e.dataTransfer.setData('text/plain', JSON.stringify({ id: adv.id, sourceIdx: null }));
                row.style.opacity = '0.5';
            };
            row.ondragend = () => {
                this.draggedAdvId = null;
                row.style.opacity = '1';
                container.querySelectorAll('.squad-slot-3x3').forEach(s => s.classList.remove('drop-optimal', 'drop-suboptimal'));
            };

            row.onclick = () => {
                const existingIdx = GameState.currentSquad.findIndex(s => s && s.id === adv.id);
                if (existingIdx > -1) {
                    GameState.currentSquad[existingIdx] = null;
                } else {
                    if (squadCount >= maxSquad) return;
                    const bestIdx = this.findBestSlotForAdv(adv);
                    if (bestIdx > -1) {
                        adv.isResting = false;
                        adv.isHealing = false;
                        GameState.currentSquad[bestIdx] = adv;
                    }
                }
                SaveManager.saveGame();
                CleatManager.render(container);
            };
            row.oncontextmenu = (e) => { e.preventDefault(); HubManager.openCharacterDetails(adv); };
            list.appendChild(row);
        });

        // Обработка слотов 3x3 сетки
        container.querySelectorAll('.squad-slot-3x3').forEach(slotEl => {
            const idx = parseInt(slotEl.getAttribute('data-idx'));
            const col = parseInt(slotEl.getAttribute('data-col'));
            const member = GameState.currentSquad[idx];

            if (member) {
                slotEl.ondragstart = (e) => {
                    this.draggedAdvId = member.id;
                    e.dataTransfer.setData('text/plain', JSON.stringify({ id: member.id, sourceIdx: idx }));
                    slotEl.style.opacity = '0.5';
                };
                slotEl.ondragend = () => {
                    this.draggedAdvId = null;
                    slotEl.style.opacity = '1';
                    container.querySelectorAll('.squad-slot-3x3').forEach(s => s.classList.remove('drop-optimal', 'drop-suboptimal'));
                };
                slotEl.onclick = () => {
                    GameState.currentSquad[idx] = null;
                    SaveManager.saveGame();
                    CleatManager.render(container);
                };
                slotEl.oncontextmenu = (e) => { e.preventDefault(); HubManager.openCharacterDetails(member); };
            }

            slotEl.ondragover = (e) => {
                e.preventDefault();
                const dragged = GameState.roster.find(a => String(a.id) === String(this.draggedAdvId));
                if (dragged) {
                    const prof = this.getWeaponProfile(dragged);
                    slotEl.classList.add(prof.optimalCols.includes(col) ? 'drop-optimal' : 'drop-suboptimal');
                }
            };
            slotEl.ondragleave = () => {
                slotEl.classList.remove('drop-optimal', 'drop-suboptimal');
            };
            slotEl.ondrop = (e) => {
                e.preventDefault();
                slotEl.classList.remove('drop-optimal', 'drop-suboptimal');
                const dataStr = e.dataTransfer.getData('text/plain');
                if (!dataStr) return;

                const data = JSON.parse(dataStr);
                const adv = GameState.roster.find(a => String(a.id) === String(data.id));
                if (!adv) return;

                adv.isResting = false;
                adv.isHealing = false;

                if (data.sourceIdx !== undefined && data.sourceIdx !== null) {
                    const temp = GameState.currentSquad[idx];
                    GameState.currentSquad[idx] = GameState.currentSquad[data.sourceIdx];
                    GameState.currentSquad[data.sourceIdx] = temp;
                } else {
                    const existingIdx = GameState.currentSquad.findIndex(s => s && s.id === adv.id);
                    if (existingIdx === -1 && squadCount >= maxSquad) return;
                    if (existingIdx > -1) GameState.currentSquad[existingIdx] = null;
                    GameState.currentSquad[idx] = adv;
                }
                SaveManager.saveGame();
                CleatManager.render(container);
            };
        });

        document.getElementById('btn-biome').onclick = () => BiomeManager.openBiomeModal(container);
        document.getElementById('btn-equip').onclick = () => EquipManager.openEquipModal(container);
        document.getElementById('start-btn').onclick = () => {
            if (GameState.currentSquad.some(Boolean)) {
                document.getElementById('building-ui').classList.add('hidden');
                SceneManager.changeScene(ExploreScene);
            }
        };
    }
};

window.CleatManager = CleatManager;
