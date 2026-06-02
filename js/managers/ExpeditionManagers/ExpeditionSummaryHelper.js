import { GameState } from '../../core/GameState.js';
import { ExpeditionManager } from './ExpeditionManager.js';
import { CharacterRenderer } from '../hubLocationManagers/CharacterRenderer.js';
import { TooltipManager } from '../hubLocationManagers/TooltipManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { LOOT_LABELS } from '../../data/workersData/labels.js';
import { HubScene } from '../../scenes/HubScene.js';
import { SceneManager } from '../../core/SceneManager.js';

export const ExpeditionSummaryHelper = {
    currentSummaryReason: null,
    subFilters: {
        loot: { 
            valuableTypesOfStone: true, minerals: true, preciousStones: true,       
            naturalResources: true, gases: true, researchResults: true,      
            scientificSamples: true, battlePrey: true
        }
    },

    activitiesConfig: [
        { type: 'mining', name: '⛏️ ДОБЫЧА', colorClass: 'bg-yellow' },
        { type: 'research', name: '📚 ИЗЫСКАНИЯ', colorClass: 'bg-purple' },
        { type: 'construction', name: '🔨 СТРОЙКА', colorClass: 'bg-orange' },
        { type: 'scouting', name: '🪔 РАЗВЕДКА', colorClass: 'bg-turquoise' }
    ],

    getIcon(item) {
        if (item.type === 'weapon') return '⚔️';
        if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') return '🛡️';
        if (item.type === 'supplies') {
            const map = { foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
            return map[item.category] || '📦';
        }
        if (item.type === 'loot') {
            const map = { 
                valuableTypesOfStone: '🪨', minerals: '⛏️', preciousStones: '💎', 
                naturalResources: '🧪', gases: '💨', researchResults: '📜', 
                battlePrey: '💀', scientificSamples: '🧪'
            };
            return map[item.category] || '📦';
        }
        return '📦';
    },

    showSummary(reason) {
        ExpeditionManager.active = false;
        
        if (typeof ExpeditionManager.saveProgressToGameState === 'function') {
            ExpeditionManager.saveProgressToGameState();
        } else {
            GameState.biomeProgress.mining = ExpeditionManager.progress.mining;
            GameState.biomeProgress.scouting = ExpeditionManager.progress.scouting;
            GameState.biomeProgress.construction = ExpeditionManager.progress.construction;
            GameState.biomeProgress.research = ExpeditionManager.progress.research;
        }

        this.currentSummaryReason = reason;
        
        const modal = document.getElementById('expedition-summary');
        const container = modal.querySelector('.modal-container');
        
        if (reason === "ALL_DEAD") {
            container.style.borderColor = "var(--color-danger)";
            container.style.boxShadow = "0 0 50px rgba(255, 68, 68, 0.4)";
            modal.querySelector('h2').innerText = "КАТАСТРОФА: ОТРЯД ПОГИБ В НЕДРАХ";
            modal.querySelector('h2').style.color = "var(--color-danger)";
        } else {
            container.style.borderColor = "var(--color-gold)";
            container.style.boxShadow = "0 0 50px #000";
            modal.querySelector('h2').innerText = "Отчет об экспедиции";
            modal.querySelector('h2').style.color = "var(--color-gold)";
        }

        modal.classList.remove('hidden');
        
        const advList = document.getElementById('summary-adventurers-list');
        const activeSquad = GameState.currentSquad.filter(adv => adv !== null && adv !== undefined);
        
        advList.innerHTML = activeSquad.map(adv => {
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStamina = window.HubManager.getStat(adv, 'stamina');

            const finalHp = reason === "ALL_DEAD" ? 0 : (adv.minExpeditionHp !== undefined ? adv.minExpeditionHp : adv.hp);
            const finalStamina = reason === "ALL_DEAD" ? 0 : (adv.minExpeditionStamina !== undefined ? adv.minExpeditionStamina : adv.stamina);

            const hpPercent = (finalHp / maxHp) * 100;
            const stamPercent = (finalStamina / maxStamina) * 100;

            let oldHours = adv.expHours || 0;
            let finalHours = oldHours + (reason === "ALL_DEAD" ? 0 : ExpeditionManager.workTimeElapsed);
            let finalLvl = adv.level || 1;
            let leveledUp = false;

            if (reason !== "ALL_DEAD") {
                while (true) {
                    const nextLevel = finalLvl + 1;
                    const threshold = GameState.getHoursThresholdForLevel(nextLevel);
                    if (finalHours >= threshold) {
                        finalLvl = nextLevel;
                        leveledUp = true;
                    } else {
                        break;
                    }
                }
            }

            const currentThresh = GameState.getHoursThresholdForLevel(finalLvl);
            const nextThresh = GameState.getHoursThresholdForLevel(finalLvl + 1);
            const progressPercent = ((finalHours - currentThresh) / (nextThresh - currentThresh)) * 100;

            const avatarHTML = `
                <div style="position: absolute; width: 425px; height: 425px; top: -40px; left: -190px; pointer-events:none; ${reason === "ALL_DEAD" ? 'filter: grayscale(100%) opacity(0.3);' : ''}">
                    ${CharacterRenderer.getAvatarHTML(adv, "425px", true)}
                </div>
            `;

            return `
            <div class="squad-member-mini" style="height: 95px; width: 100%; display: flex; background: #1a1612; border: 1px solid ${reason === "ALL_DEAD" ? 'var(--color-danger)' : '#444'}; overflow:hidden;">
                <div class="sq-avatar-wrapper" style="width: 90px; height: 100%; overflow: visible; border-right: none; z-index: 1;">${avatarHTML}</div>
                
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 15px 0 20px; min-width: 0; position: relative; z-index: 10;">
                    <div style="font-weight: bold; color: ${reason === "ALL_DEAD" ? 'var(--color-danger)' : '#fff'}; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 1px 1px 2px #000;">
                        ${adv.name} ${reason === "ALL_DEAD" ? '💀 (ПОГИБ)' : ''}
                    </div>
                    <div style="font-size: 11px; color: #ffbf00; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px #000;">
                        Уровень: ${finalLvl} ${leveledUp ? '▲ (ЛЕВЕЛАП!)' : ''}
                    </div>
                    <div class="sq-vital-bar" style="height: 6px; background: #222; margin-bottom: 4px; position:relative; overflow:hidden;">
                        <div style="width: ${progressPercent}%; height: 100%; background: #ffbf00; box-shadow: 0 0 5px #ffbf00;"></div>
                    </div>
                    <div style="font-size: 10px; color: #888; text-shadow: 1px 1px 2px #000;">
                        Часы смены: ${finalHours} / ${nextThresh}ч (${reason === "ALL_DEAD" ? '+0ч Погиб' : `+${ExpeditionManager.workTimeElapsed}ч`} работы)
                    </div>
                </div>

                <div style="width: 140px; display: flex; flex-direction: column; gap: 10px; justify-content: center; border-left: 1px solid #333; padding-left: 15px; padding-right: 10px; background: rgba(0,0,0,0.15); flex-shrink:0; z-index: 10; position: relative;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #ff6666;">
                            <span>❤️ ХП</span>
                            <span>${finalHp}/${maxHp}</span>
                        </div>
                        <div class="sq-vital-bar" style="height: 5px; position:relative; overflow:hidden;"><div class="sq-hp-fill" style="width: ${hpPercent}%;"></div></div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #4affab;">
                            <span>💨 ВЫНОС</span>
                            <span>${finalStamina}/${maxStamina}</span>
                        </div>
                        <div class="sq-vital-bar" style="height: 5px; position:relative; overflow:hidden;"><div class="sq-stam-fill" style="width: ${stamPercent}%;"></div></div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        const progressDetails = document.getElementById('summary-progress-details');
        progressDetails.innerHTML = this.activitiesConfig.map(act => {
            const endProg = ExpeditionManager.progress[act.type];
            let reachedMilestones = [];
            const toolsData = EQUIPMENT[ExpeditionManager.catMap[act.type]];

            for (let i = 5; i <= 100; i += 5) {
                if (endProg >= i) {
                    const requiredToolEntry = Object.entries(toolsData || {}).find(([, t]) => t.requiredAt === i);
                    if (requiredToolEntry) {
                        reachedMilestones.push(`[${i}%] Рубеж усложнения (${requiredToolEntry[1].name})`);
                    } else if (i % 25 === 0) {
                        reachedMilestones.push(`[${i}%] Особо ценный рубеж`);
                    } else if (i % 10 === 0) {
                        reachedMilestones.push(`[${i}%] Ценная веха`);
                    }
                }
            }

            const milestonesText = reachedMilestones.length > 0 
                ? `<div style="color:#aaa; font-size:11px; margin-top:3px; padding-left:15px; font-style:italic;">Достигнуто: ${reachedMilestones.join(', ')}</div>` 
                : '';

            return `
                <div style="margin-bottom: 5px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span style="color:var(--color-gold);">${act.name}</span>
                        <span>0.00% ➔ <span style="color:#4affab;">${endProg.toFixed(2)}%</span></span>
                    </div>
                    ${milestonesText}
                </div>
            `;
        }).join('');

        const spentContainer = document.getElementById('summary-spent-supplies');
        const spentInv = ExpeditionManager.spentItems || [];
        spentContainer.innerHTML = spentInv.length === 0 
            ? '<div style="color:#aaa; font-size:12px;">Расходники не тратились</div>' 
            : spentInv.map(item => {
                const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip(item));
                return `
                    <div class="tool-slot-mini" data-tooltip-id="${tooltipId}" style="border-color:#ff4444; background: rgba(255,68,68,0.05); cursor: help;">
                        <div class="t-fallback">${this.getIcon(item)}</div>
                    </div>
                `;
            }).join('');

        this.renderSummaryLoot();

        document.getElementById('btn-summary-confirm').onclick = () => {
            if (reason === "ALL_DEAD") {
                const deadIds = activeSquad.map(adv => adv.id);
                GameState.roster = GameState.roster.filter(adv => !deadIds.includes(adv.id));
                GameState.currentSquad = [];
                ExpeditionManager.foundItems = [];
            } else {
                activeSquad.forEach(adv => {
                    adv.hp = adv.minExpeditionHp;
                    adv.stamina = adv.minExpeditionStamina;
                    
                    GameState.addExpHours(adv, ExpeditionManager.workTimeElapsed);

                    delete adv.minExpeditionHp;
                    delete adv.minExpeditionStamina;
                    delete adv.nextLevel;
                    delete adv.nextExpHours;
                    delete adv.prevHp;
                    delete adv.prevStamina;
                    delete adv.hasEatenThisExpedition;
                    delete adv.expeditionHealQuality;
                });

                ExpeditionManager.foundItems.forEach(item => {
                    GameState.inventory.push(item);
                });
            }

            GameState.hasFinishedExpedition = true; 
            GameState.expeditionInventory = [];

            if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
                window.SaveManager.saveGame();
            }

            modal.classList.add('hidden');
            SceneManager.changeScene(HubScene);
        };
    },

    renderSummaryLoot() {
        const filterContainer = document.getElementById('summary-loot-filters');
        const gridContainer = document.getElementById('summary-loot-grid');
        
        if (!filterContainer || !gridContainer) return;

        filterContainer.style.cssText = "display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; width: 100%; margin-top: 5px;";
        filterContainer.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'filter-toggle-btn';
        allBtn.innerText = '⭐ Все';
        allBtn.onclick = () => {
            const keys = Object.keys(this.subFilters.loot);
            const anyInactive = keys.some(k => !this.subFilters.loot[k]);
            keys.forEach(k => this.subFilters.loot[k] = anyInactive);
            this.renderSummaryLoot(); 
        };
        filterContainer.appendChild(allBtn);

        const currentGroup = this.subFilters.loot;

        Object.keys(currentGroup).forEach(key => {
            const btn = document.createElement('button');
            btn.className = `filter-toggle-btn ${currentGroup[key] ? 'active' : ''}`;
            btn.innerText = LOOT_LABELS[key] || key; 
            btn.onclick = () => {
                currentGroup[key] = !currentGroup[key];
                this.renderSummaryLoot(); 
            };
            filterContainer.appendChild(btn);
        });

        const found = ExpeditionManager.foundItems || [];
        const filteredLoot = found.filter(item => {
            if (!item) return false;
            const cat = item.category;
            if (cat && !this.subFilters.loot[cat]) return false;
            return true;
        });

        const isDead = this.currentSummaryReason === "ALL_DEAD";

        gridContainer.innerHTML = filteredLoot.length === 0 
            ? `<div style="color:#666; grid-column:1/-1; font-size:13px; text-align:center;">${isDead ? 'Все находки погребены под завалом' : 'Нет находок по данным фильтрам'}</div>` 
            : filteredLoot.map(item => {
                const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip(item));
                
                const itemStyle = isDead ? 'style="opacity: 0.35; filter: grayscale(100%) contrast(50%); border-color: var(--color-danger) !important; position: relative;"' : '';
                const lostOverlay = isDead ? '<div style="position: absolute; color: var(--color-danger); font-size: 8px; font-weight: bold; text-shadow: 1px 1px 2px #000; text-transform: uppercase; z-index: 10;">ПОТЕРЯНО</div>' : '';

                return `
                <div class="inv-item-summary" data-tooltip-id="${tooltipId}" ${itemStyle}>
                    ${lostOverlay}
                    ${item.sprite && item.sprite !== 'correctFilePath' 
                        ? `<img src="${item.sprite}">` 
                        : `<div class="inv-icon-large">${this.getIcon(item)}</div>`}
                </div>
            `}).join('');
    }
};