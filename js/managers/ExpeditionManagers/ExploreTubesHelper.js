import { ExpeditionManager } from './ExpeditionManager.js';
import { TooltipManager } from '../hubLocationManagers/TooltipManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';

export const ExploreTubesHelper = {
    activitiesConfig: [
        { type: 'mining', name: '⛏️ ДОБЫЧА', colorClass: 'bg-yellow', labelClass: 'label-yellow' },
        { type: 'research', name: '📚 ИЗЫСКАНИЯ', colorClass: 'bg-purple', labelClass: 'label-purple' },
        { type: 'construction', name: '🔨 СТРОЙКА', colorClass: 'bg-orange', labelClass: 'label-orange' },
        { type: 'scouting', name: '🪔 РАЗВЕДКА', colorClass: 'bg-turquoise', labelClass: 'label-turquoise' },
        { type: 'threat', name: '⚠️ УГРОЗА', colorClass: 'bg-red', labelClass: 'label-red' }
    ],

    renderTubes() {
        const injectZone = document.getElementById('tubes-inject-zone');
        if (!injectZone) return;
        injectZone.innerHTML = '';

        const bal = EXPEDITION_BALANCE.loot;

        this.activitiesConfig.forEach(act => {
            const isThreat = act.type === 'threat';
            const toolsData = isThreat ? null : EQUIPMENT[ExpeditionManager.catMap[act.type]];
            
            let markersHTML = '';
            let columnsHTML = ''; 
            const isLootActivity = (act.type === 'mining' || act.type === 'research');
            const extraRowStyle = isThreat ? 'style="margin-top: 45px;"' : ''; 

            for (let i = 5; i <= 100; i += 5) {
                let notchClass = '';
                let icons = []; 
                
                if (!isThreat) {
                    const requiredToolEntry = Object.entries(toolsData || {}).find(([, t]) => t.requiredAt === i);
                    if (requiredToolEntry) {
                        const [, tool] = requiredToolEntry;
                        const tText = `<b>⚠️ Рубеж усложнения работ (${i}%)</b><br>До этой отметки инструмент <span style="color:var(--color-success); font-weight:bold;">${tool.name}</span> ускоряет работу на +50%.<br>С момента её достижения он становится <b>СТРОГО ОБЯЗАТЕЛЕН</b> для продолжения деятельности. Без него работа остановится!`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '!', class: 'notch-required', tooltipId: tId });
                        notchClass = 'notch-required';
                    } 
                }

                if (isLootActivity) {
                    const leg = bal.milestones.legendary;
                    if (i % leg.interval === 0) {
                        const tText = `<b>${leg.icon} ${leg.label} (${i}%)</b><br>${leg.desc}`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: leg.icon, class: 'notch-large', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-large';
                    } 

                    const rare = bal.milestones.rare;
                    if (i % rare.interval === 0) {
                        const tText = `<b>${rare.icon} ${rare.label} (${i}%)</b><br>${rare.desc}`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: rare.icon, class: 'notch-medium', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-medium';
                    }
                }

                if (act.type === 'construction') {
                    const cBal = EXPEDITION_BALANCE.construction.milestones;
                    if (i % cBal.speedup.interval === 0) {
                        const tText = `<b>🔨 Укрепление сводов (${i}%)</b><br>Пассивный бонус от Стройки.<br>Каждые 25% прогресса уменьшают общий делитель скорости на 2 единицы, ускоряя выполнение всех видов работ в пещере.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '🔨', class: 'notch-large', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-large';
                    }
                    if (i % cBal.fatigueReduction.interval === 0) {
                        const tText = `<b>🛡️ Опоры для шахты (${i}%)</b><br>Пассивный бонус от Стройки.<br>Каждые 10% прогресса уменьшают изнурение погруженцев от работы на -1 ед. и -1% ХП и Стамины в час.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '🛡️', class: 'notch-medium', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-medium';
                    }
                    if (i % cBal.foodBoost.interval === 0) {
                        const tText = `<b>🍖 Обустроенная кухня (${i}%)</b><br>Пассивный бонус от Стройки.<br>Каждые 5% прогресса повышают эффективность лечения от еды и воды на +1 ед. и +1% к ХП и Стамине во время привала.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '🍖', class: 'notch-small', tooltipId: tId });
                    }
                }

                if (act.type === 'scouting') {
                    const sBal = EXPEDITION_BALANCE.scouting.milestones;
                    if (i % sBal.lootBonus.interval === 0) {
                        const tText = `<b>📦 Картография недр (${i}%)</b><br>Пассивный бонус от Разведки.<br>Каждые 25% прогресса увеличивают количество находимого лута в Добыче и Изысканиях на +1 предмет за каждую веху редкости.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '📦', class: 'notch-large', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-large';
                    }
                    if (i % sBal.threatReduction.interval === 0) {
                        const tText = `<b>🪔 Безопасные тропы (${i}%)</b><br>Пассивный бонус от Разведки.<br>Каждые 10% прогресса снижают скорость накопления Угрозы на -0.5 в час для всех видов темпов.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '🪔', class: 'notch-medium', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-medium';
                    }
                    if (i % sBal.baseHealBoost.interval === 0) {
                        const tText = `<b>🏕️ Секреты выживания (${i}%)</b><br>Пассивный бонус от Разведки.<br>Каждые 5% прогресса повышают базовую регенерацию погруженцев во время привала на +1% от их максимального здоровья и стамины.`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: '🏕️', class: 'notch-small', tooltipId: tId });
                    }
                }

                if (isThreat) {
                    const tBal = EXPEDITION_BALANCE.threat.milestones;
                    const milestone = Object.values(tBal).find(m => m.percent === i);
                    if (milestone) {
                        const tText = `<b>${milestone.icon} ${milestone.label} (${milestone.percent}%)</b><br>${milestone.desc}`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: milestone.icon, class: 'notch-required', tooltipId: tId });
                        notchClass = 'notch-required';
                    }
                }

                if (icons.length === 0) {
                    notchClass = 'notch-small';
                }

                markersHTML += `<div class="tube-marker ${notchClass}" style="left: ${i}%;" data-percent="${i}"></div>`;

                if (icons.length > 0) {
                    const innerIcons = icons.map(ico => {
                        const finalClass = `notch-icon ${ico.class}`;
                        return `<div class="${finalClass}" data-tooltip-id="${ico.tooltipId}">${ico.symbol}</div>`;
                    }).join('');
                    
                    columnsHTML += `
                        <div class="notch-column" style="left: ${i}%;" data-percent="${i}">
                            ${innerIcons}
                        </div>
                    `;
                }
            }

            injectZone.innerHTML += `
                <div class="tube-row" data-type="${act.type}" ${extraRowStyle}>
                    <div class="tube-wrapper">
                        <div class="tube-percent" id="pct-${act.type}">0.00%</div>
                        <div class="tube-body">
                            <div class="tube-fill-clip"><div id="bar-${act.type}" class="tube-fill ${act.colorClass}"></div></div>
                            <div class="tube-markers">${markersHTML}</div>
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;">
                                ${columnsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    updateTubesUI(currentBattleThreatTier, onThreatTierChangeCallback) {
        this.activitiesConfig.forEach(act => {
            const isThreat = act.type === 'threat';
            const val = isThreat ? ExpeditionManager.threat : ExpeditionManager.progress[act.type];
            const delta = ExpeditionManager.lastDeltas[act.type];
            const haltReason = isThreat ? null : ExpeditionManager.haltReasons[act.type];
            
            const bar = document.getElementById(`bar-${act.type}`);
            const pctText = document.getElementById(`pct-${act.type}`);
            
            if (bar) bar.style.width = Math.min(val, 100) + '%';
            if (pctText) pctText.innerText = `${val.toFixed(2)}%`; 

            const markers = document.querySelectorAll(`.tube-row[data-type="${act.type}"] .tube-marker`);
            const columns = document.querySelectorAll(`.tube-row[data-type="${act.type}"] .notch-column`);
            
            markers.forEach(m => {
                const p = parseInt(m.dataset.percent);
                m.style.display = (val >= p) ? 'none' : '';
            });

            columns.forEach(c => {
                const p = parseInt(c.dataset.percent);
                if (val >= p) {
                    if (val - delta < p && delta > 0) {
                        c.classList.add('milestone-completed');
                    } else {
                        c.style.display = 'none'; 
                    }
                } else {
                    c.style.display = '';
                    c.classList.remove('milestone-completed');
                }
            });

            if (isThreat) return;

            const footer = document.querySelector(`.tube-row[data-type="${act.type}"] .tube-footer`);
            let deltaEl = document.getElementById(`delta-${act.type}`);
            if (!deltaEl && footer) {
                deltaEl = document.createElement('div');
                deltaEl.className = 'delta-value';
                deltaEl.id = `delta-${act.type}`;
                deltaEl.style.position = 'static';
                deltaEl.style.marginLeft = '10px';
                const oldWarning = footer.querySelector('.halt-warning');
                if (oldWarning) oldWarning.remove();
                footer.appendChild(deltaEl);
            }

            if (haltReason) {
                if (deltaEl) deltaEl.remove();
                let warningEl = footer.querySelector('.halt-warning');
                if (!warningEl) {
                    warningEl = document.createElement('div');
                    warningEl.className = 'halt-warning';
                    footer.appendChild(warningEl);
                }
                warningEl.innerText = haltReason;
            } else if (delta > 0 && deltaEl) {
                const warningEl = footer.querySelector('.halt-warning');
                if (warningEl) warningEl.remove();

                deltaEl.innerText = `+${delta}`;
                deltaEl.classList.remove('animate-delta');
                void deltaEl.offsetWidth; 
                deltaEl.classList.add('animate-delta');
            }
        });

        document.querySelectorAll('.prio-grid-btn').forEach(btn => {
            const type = btn.dataset.type;
            btn.classList.toggle('active', ExpeditionManager.priority === type);
        });

        const paceCurrentBtn = document.getElementById('btn-pace-current');
        if (paceCurrentBtn) {
            const activePace = ExpeditionManager.pace;
            paceCurrentBtn.innerText = activePace === 'slow' ? 'ТИХО' : activePace === 'normal' ? 'НОРМ' : 'СПЕШКА';
            
            document.querySelectorAll('.pace-select-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.pace === activePace);
            });
        }

        const triggerBattleBtn = document.getElementById('btn-trigger-battle');
        if (triggerBattleBtn) {
            const tVal = ExpeditionManager.threat;
            let tier;
            let enemyId;
            if (tVal >= 100) { tier = 4; enemyId = 'glassMother'; }
            else if (tVal >= 90) { tier = 3; enemyId = 'vitrailSpider'; }
            else if (tVal >= 70) { tier = 2; enemyId = 'amalgamSpider'; }
            else if (tVal >= 25) { tier = 1; enemyId = 'glassSpider'; }
            else { tier = 0; enemyId = 'fritta'; }

            if (currentBattleThreatTier !== tier) {
                onThreatTierChangeCallback(tier, enemyId);
            }

            if (ExpeditionManager.battleCompleted) {
                triggerBattleBtn.style.display = 'none';
            } else {
                triggerBattleBtn.style.display = 'block';
                if (tVal >= 25) {
                    triggerBattleBtn.removeAttribute('disabled');
                    triggerBattleBtn.setAttribute('data-tooltip-id', TooltipManager.registerTooltip("<b>Начать превентивное сражение</b><br>Нажмите, чтобы атаковать стаю на своих условиях. Победа полностью снимет угрозу до конца экспедиции."));
                } else {
                    triggerBattleBtn.setAttribute('disabled', 'true');
                    triggerBattleBtn.setAttribute('data-tooltip-id', TooltipManager.registerTooltip("<b>Сражение недоступно</b><br>Уровень угрозы слишком мал (требуется минимум 25.00%). Пока что вокруг суетятся только относительно безобидные фритты."));
                }
            }
        }
        const exploreTimeEl = document.getElementById('explore-time');
        if (exploreTimeEl) {
            exploreTimeEl.innerText = ExpeditionManager.timeElapsed;
        }
    }
};