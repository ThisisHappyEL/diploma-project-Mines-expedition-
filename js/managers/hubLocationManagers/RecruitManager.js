import { GameState } from '../../core/GameState.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { TooltipManager } from './TooltipManager.js';
import { HubManager } from './HubManager.js';
import { STAT_ICONS } from '../../data/workersData/labels.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { RecruitGenerator } from './RecruitGenerator.js';

export class RecruitManager {
    static currentRecruits = [];
    static lastGeneratedCycle = -1;
    static selectedRecruitId = null;

    static sortBy = null;  
    static sortDir = null; 

    static getStat(adv, statName) {
        let val = adv.pureStats[statName] || 0;
        adv.traits.forEach(t => { if (t.effect && t.effect[statName]) val += t.effect[statName]; });
        if (adv.equipment.body && adv.equipment.body.stats && adv.equipment.body.stats[statName]) val += adv.equipment.body.stats[statName];
        else if (!adv.equipment.body && adv.civilBody && adv.civilBody.effect && adv.civilBody.effect[statName]) val += adv.civilBody.effect[statName];
        return Math.max(0, val);
    }

    static generateRecruits() {
        if (this.lastGeneratedCycle === GameState.cycle) return;
        
        // кандидаты в день
        const count = Math.floor(Math.random() * (HUB_BALANCE.tavern.maxRecruitsPerCycle - HUB_BALANCE.tavern.minRecruitsPerCycle + 1)) + HUB_BALANCE.tavern.minRecruitsPerCycle;
        
        this.currentRecruits = RecruitGenerator.generateRecruitsPool(count);
        this.lastGeneratedCycle = GameState.cycle;

        if (this.currentRecruits.length > 0) {
            this.selectedRecruitId = this.currentRecruits[0].id;
        } else {
            this.selectedRecruitId = null;
        }
    }

    static hire(id) {
        const recruitIndex = this.currentRecruits.findIndex(x => x.id === id);
        if (recruitIndex > -1) {
            const recruit = this.currentRecruits[recruitIndex];
            GameState.roster.push(recruit);
            this.currentRecruits.splice(recruitIndex, 1);
            GameState.updateTopBarUI();

            if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
                window.SaveManager.saveGame();
            }
            
            if (this.currentRecruits.length > 0) {
                this.selectedRecruitId = this.currentRecruits[0].id;
            } else {
                this.selectedRecruitId = null;
            }
            return true;
        }
        return false;
    }

    static render(container) {
        TooltipManager.clear();
        this.generateRecruits();

        container.style.display = 'flex';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '0';
        container.style.overflow = 'hidden';
        container.innerHTML = '';

        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        container.appendChild(splitWrapper);

        const leftCol = document.createElement('div');
        leftCol.className = 'forge-column';
        leftCol.style.flex = '0 0 35%';
        leftCol.style.maxWidth = '35%';
        splitWrapper.appendChild(leftCol);

        const renderSortButton = (param, icon) => {
            const isActive = this.sortBy === param;
            const dir = isActive ? this.sortDir : null;
            
            let label = icon;
            let borderStyle = '#444';
            let colorStyle = '#888';
            
            if (dir === 'desc') {
                label += ' 🔽';
                colorStyle = 'var(--color-success)';
                borderStyle = 'var(--color-success)';
            } else if (dir === 'asc') {
                label += ' 🔼';
                colorStyle = 'var(--color-warning)';
                borderStyle = 'var(--color-warning)';
            } else {
                label += ' ➖';
            }

            return `
                <button class="hub-btn sort-btn" data-param="${param}" style="padding: 4px 8px; font-size:11px; font-weight:bold; border-color:${borderStyle}; color:${colorStyle}; display:flex; align-items:center; gap:2px;">
                    ${label}
                </button>
            `;
        };

        const leftHeader = document.createElement('div');
        leftHeader.style.cssText = "border-bottom: 1px solid #444; padding-bottom: 12px; margin-bottom: 12px; display:flex; flex-direction:column; gap:8px;";
        
        const countRow = document.createElement('div');
        countRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; width:100%;";
        countRow.innerHTML = `<h3 style="color:#ffbf00; margin:0; font-size:16px;">Поток авантюристов (${this.currentRecruits.length})</h3>`;
        leftHeader.appendChild(countRow);

        const filterRow = document.createElement('div');
        filterRow.style.cssText = "display:flex; gap:5px; align-items:center; width:100%; flex-wrap:nowrap;";
        filterRow.innerHTML = `
            <span style="color:#aaa; font-size:11px; font-weight:bold; margin-right:4px; text-transform:uppercase; letter-spacing:0.5px;">Сорт:</span>
            ${renderSortButton('battle', '⚔️')}
            ${renderSortButton('mining', '⛏️')}
            ${renderSortButton('research', '📚')}
            ${renderSortButton('construction', '🔨')}
            ${renderSortButton('scouting', '🪔')}
            ${renderSortButton('salary', '🕯️')}
        `;
        leftHeader.appendChild(filterRow);
        leftCol.appendChild(leftHeader);

        const sortBtns = leftHeader.querySelectorAll('.sort-btn');
        sortBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const param = btn.getAttribute('data-param');
                if (this.sortBy === param) {
                    if (this.sortDir === 'desc') {
                        this.sortDir = 'asc';
                    } else if (this.sortDir === 'asc') {
                        this.sortBy = null;
                        this.sortDir = null;
                    }
                } else {
                    this.sortBy = param;
                    this.sortDir = 'desc';
                }
                this.render(container);
            };
        });

        const recruitList = document.createElement('div');
        recruitList.className = 'forge-column-list';
        leftCol.appendChild(recruitList);

        if (this.currentRecruits.length === 0) {
            recruitList.innerHTML = '<p style="color:#aaa;">В данный цикл никто не пришел. Ожидайте следующего цикла.</p>';
            return;
        }

        const sortedRecruits = [...this.currentRecruits];
        const getSortValue = (rec, param) => {
            if (param === 'salary') return rec.salary || 0;
            return this.getStat(rec, param);
        };

        if (this.sortBy && this.sortDir) {
            sortedRecruits.sort((a, b) => {
                const valA = getSortValue(a, this.sortBy);
                const valB = getSortValue(b, this.sortBy);
                return this.sortDir === 'desc' ? valB - valA : valA - valB;
            });
        }

        sortedRecruits.forEach(r => {
            const traitDeclined = HubManager.getDeclinedTraitName(r.traits[0].name, r.gender);
            const row = document.createElement('div');
            row.className = `char-row ${this.selectedRecruitId === r.id ? 'active-rest' : ''}`;
            
            row.style.cssText = `
                padding: 0; 
                display: flex; 
                align-items: center; 
                cursor: pointer; 
                transition: 0.2s; 
                height: 95px; 
                min-height: 95px; 
                box-sizing: border-box;
                border: 1px solid #555;
                background: var(--bg-panel);
                width: 100%;
                margin-bottom: 5px;
                overflow: hidden;
                position: relative;
            `;
            if (this.selectedRecruitId === r.id) {
                row.style.borderColor = 'var(--color-gold)';
                row.style.background = 'var(--bg-btn)';
            }

            const maxH = this.getStat(r, 'hp');
            const maxS = this.getStat(r, 'stamina');
            const zoomSize = "425px"; 
            const offsetX = "-190px";  
            const offsetY = "-40px";  

            row.innerHTML = `
                <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                    <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                        ${CharacterRenderer.getAvatarHTML(r, zoomSize, true)}
                    </div>
                </div>
                
                <div style="flex: 0 0 30%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                    <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${r.name}</b>
                    <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${r.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                    <div style="display:flex; gap:6px; font-size:13px; color:#ccc; font-weight:bold; align-items:center; white-space:nowrap;">
                        <span>❤️ ${Math.floor(r.hp)}/${maxH}</span>
                        <span>💨 ${Math.floor(r.stamina)}/${maxS}</span>
                        <span style="color: var(--color-gold); display: inline-flex; align-items: center; gap: 3px; margin-left: 6px;">🔼 ${r.level}</span>
                    </div>
                    <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                        <span>⚔️ ${this.getStat(r, 'battle')}</span>
                        <span>⛏️ ${this.getStat(r, 'mining')}</span>
                        <span>📚 ${this.getStat(r, 'research')}</span>
                        <span>🔨 ${this.getStat(r, 'construction')}</span>
                        <span>🪔 ${this.getStat(r, 'scouting')}</span>
                        <span style="color:var(--color-gold); font-weight:bold; margin-left:8px; font-size:13px;">🕯️ ${r.salary}</span>
                    </div>
                </div>
            `;
            row.onclick = () => {
                this.selectedRecruitId = r.id;
                this.render(container);
            };
            recruitList.appendChild(row);
        });

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column';
        rightCol.style.flex = '1 1 65%';
        rightCol.style.maxWidth = '65%';
        splitWrapper.appendChild(rightCol);

        const selectedRecruit = this.currentRecruits.find(r => r.id === this.selectedRecruitId);
        if (!selectedRecruit) {
            rightCol.innerHTML = '<p style="color:#aaa; text-align:center; margin-top:50px;">Выберите кандидата слева для просмотра досье.</p>';
            return;
        }

        this.renderDossier(rightCol, selectedRecruit, container);
    }

    static renderDossier(column, recruit, mainContainer) {
        const bgData = BACKGROUNDS[recruit.background];
        const traitDeclined = HubManager.getDeclinedTraitName(recruit.traits[0].name, recruit.gender);

        const bgT = `
            <b>Предыстория: ${recruit.background}</b><br>
            ${bgData ? bgData.description : ''}<br><br>
            Разброс базы:<br>
            <center>${STAT_ICONS.battle} ${bgData ? bgData.stats.battle.join('-') : '10-10'}</center>
            <div style='display:flex; justify-content:space-between;'>
                <span>⛏️ ${bgData ? bgData.stats.mining.join('-') : '10-10'}</span>
                <span>📚 ${bgData ? bgData.stats.research.join('-') : '10-10'}</span>
            </div>
            <div style='display:flex; justify-content:space-between;'>
                <span>🔨 ${bgData ? bgData.stats.construction.join('-') : '10-10'}</span>
                <span>🪔 ${bgData ? bgData.stats.scouting.join('-') : '10-10'}</span>
            </div>
            <hr style='border:none; border-bottom:1px solid #444'>
            <div style='display:flex; justify-content:space-between;'>
                <span>❤️ ${bgData ? bgData.stats.hp.join('-') : '10-10'}</span>
                <span>💨 ${bgData ? bgData.stats.stamina.join('-') : '10-10'}</span>
            </div>`;

        const trT = `
            <b>Черта: ${traitDeclined}</b><br>
            ${Object.entries(recruit.traits[0].effect || {})
                .map(([k, v]) => v !== 0 ? STAT_ICONS[k] + ' ' + (v > 0 ? '+' + v : v) : '')
                .filter(x => x !== '')
                .join('<br>')}`;

        const bgTtId = TooltipManager.registerTooltip(bgT);
        const trTtId = TooltipManager.registerTooltip(trT);

        const header = document.createElement('div');
        header.style.cssText = "border-bottom:1px solid #444; padding-bottom: 10px; margin-bottom: 15px; display:flex; justify-content:space-between; align-items:center;";
        header.innerHTML = `
            <div style="display:flex; align-items:baseline; gap:15px; flex-wrap:wrap; min-width:0;">
                <h2 style="color:var(--color-gold); margin:0; font-size: 26px; white-space:nowrap;">${recruit.name}</h2>
                <span style="color:#888; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    Предыстория: <b id="cd-dossier-bg" style="cursor:help; border-bottom: 1px dotted #888; color:#fff;" data-tooltip-id="${bgTtId}">${recruit.background}</b> <span style="color:#555;">|</span> 
                    Черта: <b id="cd-dossier-trait" style="cursor:help; border-bottom: 1px dotted var(--color-success); color:var(--color-success)" data-tooltip-id="${trTtId}">${traitDeclined}</b>
                </span>
            </div>
            <span style="color:#aaa; font-size:14px; font-weight:bold; flex-shrink:0;">ур. 1</span>
        `;
        column.appendChild(header);

        const dossierBody = document.createElement('div');
        dossierBody.style.cssText = "display: flex; gap: 20px; flex: 1; min-height: 0; width:100%; box-sizing:border-box;";
        column.appendChild(dossierBody);

        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = "width: 45%; background: #050403; border: 1px solid var(--border-main); padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; overflow: visible; height: 100%; box-sizing: border-box; flex-shrink: 0;";

        const dossierZoomSize = "1.40"; 
        const dossierOffsetY = "-25px";
        const dossierOffsetX = "-40px";

        leftPanel.innerHTML = `
            <div style="width: 100%; flex: 1; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; min-height: 0; position: relative; overflow:visible; z-index: 10;">
                <div style="position: absolute; width: 100%; height: 100%; top: ${dossierOffsetY}; left: ${dossierOffsetX}; transform: scale(${dossierZoomSize}); transform-origin: center center; pointer-events: none;">
                    ${CharacterRenderer.getAvatarHTML(recruit, '100%', true)}
                </div>
            </div>
            <div style="width: 100%; text-align: center; border-top: 1px solid #333; padding-top: 15px; flex-shrink:0; position: relative; z-index: 5; background: transparent;">
                <div style="position: relative; z-index: 30;">
                    <div style="color:var(--color-gold); font-size:16px; font-weight:bold; margin-bottom:10px; text-shadow: 1px 1px 2px #000;">Содержание: ${recruit.salary} 🕯️</div>
                    <button id="hire-dossier-btn" class="hub-btn action-btn btn-bold" style="width: 100%; padding: 12px; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">Нанять</button>
                </div>
            </div>
        `;

        const hireBtn = leftPanel.querySelector('#hire-dossier-btn');
        hireBtn.onclick = () => {
            if (this.hire(recruit.id)) {
                this.render(mainContainer);
            }
        };

        dossierBody.appendChild(leftPanel);

        const rightPanel = document.createElement('div');
        rightPanel.style.cssText = "width: 55%; background: rgba(0,0,0,0.35); border: 1px solid var(--border-main); padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box; flex-shrink: 0;";
        dossierBody.appendChild(rightPanel);

        const statKeys = ['battle', 'mining', 'research', 'construction', 'scouting'];
        const STAT_RUS = { battle: 'Бой', mining: 'Добыча', research: 'Изыскания', construction: 'Строительство', scouting: 'Разведка' };

        let sum = 0, minSum = 0, maxSum = 0;
        let aboveNorm = [], belowNorm = [], avgNorm = [];

        statKeys.forEach(k => {
            const val = recruit.pureStats[k];
            sum += val;
            const [min, max] = bgData.stats[k];
            minSum += min; maxSum += max;

            if (min === max) { avgNorm.push(STAT_RUS[k]); return; }
            const step = (max - min) / 4;

            if (val >= max - step) aboveNorm.push(STAT_RUS[k]);
            else if (val <= min + step) belowNorm.push(STAT_RUS[k]);
            else avgNorm.push(STAT_RUS[k]);
        });

        const span = maxSum - minSum;
        const avgSum = Math.round((minSum + maxSum) / 2);
        const diff = sum - avgSum;

        let verdict = "Средний претендент, хорошист";
        let verdictColor = "var(--color-gold)";
        let verdictDesc = "Кандидат обладает базовым распределением сил. Подходит для большинства штатных экспедиций.";

        if (span > 0) {
            const ratio = (sum - minSum) / span;
            if (ratio >= 0.9) { verdict = "Исключительный претендент, отличник!"; verdictColor = "var(--color-success)"; verdictDesc = "Показатели близки к максимально возможным! Кандидат обладает невероятным потенциалом."; }
            else if (ratio >= 0.72) { verdict = "Отличный претендент, кандидат наук"; verdictColor = "#aaffaa"; verdictDesc = "Превосходный ролл характеристик. Персонаж будет намного эффективнее среднестатистических погруженцев."; }
            else if (ratio >= 0.55) { verdict = "Хороший претендент, хорошист"; verdictColor = "#d4ff7f"; verdictDesc = "Положительное распределение роллов. Добротный специалист, готовый к тяжелой работе."; }
            else if (ratio >= 0.4) { verdict = "Средний претендент, посредственный"; verdictColor = "var(--color-gold)"; verdictDesc = "Кандидат обладает стандартным распределением сил. Подходит для регулярных задач."; }
            else if (ratio >= 0.2) { verdict = "Слабый претендент, отстающий"; verdictColor = "var(--color-warning)"; verdictDesc = "Показатели характеристик ниже среднего. Кандидату будет тяжело в опасных шахтах."; }
            else { verdict = "Ужасный претендент, профнепригоден"; verdictColor = "var(--color-danger)"; verdictDesc = "Характеристики распределились крайне неудачно. Настоятельно рекомендуется отказаться от найма."; }
        }

        const getHovStat = (s) => `data-tooltip-id="${TooltipManager.registerTooltip(HubManager.getStatTooltip(recruit, s))}"`;
        const renderStatRow = (key, icon, label, isCore = true) => {
            const val = isCore ? this.getStat(recruit, key) : Math.floor(recruit[key]);
            const range = bgData.stats[key];
            const rangeStr = range ? `${range[0]}-${range[1]}` : '—';
            const color = isCore ? HubManager.getStatColor(recruit, key, true) : (key === 'hp' ? '#ff6666' : '#4affab');
            return `
                <div ${getHovStat(key)} style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border:1px solid #333; padding: 6px 12px; font-size:14px; font-weight:bold; cursor:help;">
                    <span style="color:#e0d8c3;">${icon} ${label}: <b style="color:${color}; font-size:15px; margin-left: 4px;">${val}</b></span>
                    <span style="color:#666; font-size:13px; font-weight:normal;">Разбег предыстории: <b style="color:#aaa;">${rangeStr}</b></span>
                </div>
            `;
        };

        rightPanel.innerHTML = `
            <h4 style="color:var(--color-gold); margin:0; text-transform:uppercase; font-size:13px; letter-spacing:1px; border-bottom:1px solid #444; padding-bottom:6px; flex-shrink:0;">Характеристики и Диапазоны</h4>
            <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
                ${renderStatRow('hp', '❤️', 'Здоровье', false)}
                ${renderStatRow('stamina', '💨', 'Выносливость', false)}
                ${renderStatRow('battle', '⚔️', 'Бой', true)}
                ${renderStatRow('mining', '⛏️', 'Добыча', true)}
                ${renderStatRow('research', '📚', 'Изыскания', true)}
                ${renderStatRow('construction', '🔨', 'Строительство', true)}
                ${renderStatRow('scouting', '🪔', 'Разведка', true)}
            </div>
            <h4 style="color:var(--color-gold); margin:0; text-transform:uppercase; font-size:13px; letter-spacing:1px; border-bottom:1px solid #444; padding-bottom:6px; margin-top:5px; flex-shrink:0;">Анализ потенциала</h4>
            <div style="font-size:14px; line-height:1.4; display:flex; flex-direction:column; gap:8px;">
                <div>Сумма чистых характеристик: <b style="font-size:17px; color:#fff;">${sum}</b><span style="display:block; color:#aaa; font-size:12px; margin-top:2px;">Это на <b style="color:${diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${Math.abs(diff)}</b> ${diff >= 0 ? 'выше' : 'ниже'} средней суммы предыстории (<b>${avgSum}</b>).</span></div>
                <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border:1px solid #444; font-size:12.5px; line-height:1.3; display:flex; flex-direction:column; gap:3px;">
                    <div>⚖️ Среднее значение суммы: <b>${avgSum}</b></div>
                    <div style="color:var(--color-danger);">📉 Худший исход суммы: <b>${minSum}</b></div>
                    <div style="color:var(--color-success);">📈 Лучший исход суммы: <b>${maxSum}</b></div>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; font-size:13px;">
                    ${aboveNorm.length > 0 ? `<div>🟢 <span style="color:var(--color-success); font-weight:bold;">Выше нормы:</span> ${aboveNorm.join(', ')}</div>` : ''}
                    ${belowNorm.length > 0 ? `<div>🔴 <span style="color:var(--color-danger); font-weight:bold;">Ниже нормы:</span> ${belowNorm.join(', ')}</div>` : ''}
                    ${avgNorm.length > 0 ? `<div>🟡 <span style="color:#aaa; font-weight:bold;">Средние:</span> ${avgNorm.join(', ')}</div>` : ''}
                </div>
            </div>
            <div style="border-top:1px dashed #444; padding-top:10px; margin-top:auto; flex-shrink:0;">
                <div style="font-size:10px; text-transform:uppercase; color:#888; margin-bottom:2px;">Итоговое резюме:</div>
                <div style="color:${verdictColor}; font-size:15px; font-weight:bold; margin-bottom:4px;">${verdict}</div>
                <div style="color:#aaa; font-size:11.5px; font-style:italic; line-height:1.3;">${verdictDesc}</div>
            </div>
        `;
    }
}
