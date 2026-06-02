import { GameState } from '../../core/GameState.js';
import { ExpeditionManager } from './ExpeditionManager.js';
import { CharacterRenderer } from '../hubLocationManagers/CharacterRenderer.js';
import { TooltipManager } from '../hubLocationManagers/TooltipManager.js';

export const ExploreUIHelper = {
    ENEMY_RENDER_CONFIG: {
        default: { size: "400px", offsetX: "0px", offsetY: "-200px", scale: "1.0" },
        overrides: {
            fritta: { size: "500px", offsetX: "75px", offsetY: "-275px", scale: "2.5" },
            glassSpider: { size: "600px", offsetX: "75px", offsetY: "-300px", scale: "2.5" },
            amalgamSpider: { size: "550px", offsetX: "60px", offsetY: "-240px", scale: "2.5" },
            vitrailSpider: { size: "600px", offsetX: "50px", offsetY: "-220px", scale: "2.5" },
            glassMother: { size: "650px", offsetX: "50px", offsetY: "-200px", scale: "2.5" }
        }
    },

    getEnemyConfig(enemyId) {
        return this.ENEMY_RENDER_CONFIG.overrides[enemyId] || this.ENEMY_RENDER_CONFIG.default;
    },

    getEnemySpriteUrl(enemyId) {
        let base = '';
        let vars = 0;
        if (enemyId === 'glassMother') { base = 'assets/img/enemies/mother'; vars = 11; }
        else if (enemyId === 'vitrailSpider') { base = 'assets/img/enemies/vitrail'; vars = 12; }
        else if (enemyId === 'amalgamSpider') { base = 'assets/img/enemies/amalgam'; vars = 12; }
        else if (enemyId === 'glassSpider') { base = 'assets/img/enemies/glassSpider'; vars = 10; }
        else if (enemyId === 'fritta') { base = 'assets/img/enemies/fritta'; vars = 12; }
        return `${base}${Math.floor(Math.random() * vars)}.png`;
    },

    getHov(adv, stat) {
        const tooltip = window.HubManager.getStatTooltip(adv, stat);
        const encoded = window.HubManager.getEncodedTooltip(tooltip);
        return `onmousemove="HubManager.showEncodedTooltip(event, '${encoded}')" onmouseout="HubManager.hideTooltip()"`;
    },

    applyMaskToButton(btnId, label, bgUrl, enemyId = null) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        let bgHtml = '';
        if (enemyId) {
            const cfg = this.getEnemyConfig(enemyId);
            const spriteUrl = this.getEnemySpriteUrl(enemyId);
            bgHtml = `
            <div class="btn-masked-bg" style="
                position: absolute; top: 0; right: 0; width: 70%; height: 100%; 
                -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%); 
                mask-image: linear-gradient(to right, transparent 0%, black 50%); 
                opacity: 0.75; z-index: 1; pointer-events: none; transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                display: flex; align-items: center; justify-content: center;
            ">
                <div style="position: absolute; transform: scale(0.25) translateY(20%);">
                    <div style="
                        position: relative; width: ${cfg.size}; height: ${cfg.size}; 
                        top: ${cfg.offsetY}; left: calc(50% + ${cfg.offsetX}); 
                        transform: translateX(-50%) scale(${cfg.scale}); transform-origin: center center;
                    ">
                        <img src="${spriteUrl}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 30px rgba(255, 68, 68, 0.8));">
                    </div>
                </div>
            </div>`;
        } else if (bgUrl) {
            bgHtml = `
            <div class="btn-masked-bg" style="
                position: absolute; top: 0; right: 0; width: 65%; height: 100%; 
                background: url('${bgUrl}') center/cover no-repeat; 
                -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%); 
                mask-image: linear-gradient(to right, transparent 0%, black 50%); 
                opacity: 0.45; z-index: 1; pointer-events: none; transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            "></div>`;
        }

        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = `
            ${bgHtml}
            <span style="position: relative; z-index: 2; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${label}</span>
        `;
    },

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

    renderSquad() {
        const list = document.getElementById('explore-squad-list');
        if (!list) return;

        const squad = GameState.currentSquad;
        if (!squad || squad.length === 0) {
            list.innerHTML = '<div style="color: #666; text-align: center; margin-top: 20px;">Отряд пуст...</div>';
            return;
        }

        const activeSquad = squad.filter(adv => adv !== null && adv !== undefined);

        list.innerHTML = activeSquad.map(adv => {
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStamina = window.HubManager.getStat(adv, 'stamina');
            const hpPercent = (adv.hp / maxHp) * 100;
            const stamPercent = (adv.stamina / maxStamina) * 100;

            adv.prevHp = adv.prevHp !== undefined ? adv.prevHp : adv.hp;
            adv.prevStamina = adv.prevStamina !== undefined ? adv.prevStamina : adv.stamina;

            const prevHpPercent = (adv.prevHp / maxHp) * 100;
            const prevStamPercent = (adv.prevStamina / maxStamina) * 100;

            const isHpHealing = adv.hp > adv.prevHp;
            const isStamHealing = adv.stamina > adv.prevStamina;

            const initialHpFillPercent = isHpHealing ? prevHpPercent : hpPercent;
            const initialHpGhostPercent = isHpHealing ? hpPercent : prevHpPercent;

            const initialStamFillPercent = isStamHealing ? prevStamPercent : stamPercent;
            const initialStamGhostPercent = isStamHealing ? stamPercent : prevStamPercent;

            let combatStat = window.HubManager.getStat(adv, 'battle');
            if (combatStat === undefined || isNaN(combatStat)) combatStat = 0;

            const avatarHTML = `
                <div style="position: absolute; width: 425px; height: 425px; top: -40px; left: -190px; pointer-events:none;">
                    ${CharacterRenderer.getAvatarHTML(adv, "425px", true)}
                </div>
            `;

            return `
            <div class="squad-member-mini">
                <div class="sq-avatar-wrapper">${avatarHTML}</div>
                <div class="sq-stats-wrapper">
                    <div class="sq-name">${adv.name} <span class="sq-lvl">${adv.level} ур</span></div>
                    
                    <div class="sq-work-stats">
                        <span ${this.getHov(adv, 'battle')}>⚔️ ${combatStat}</span>
                        <span ${this.getHov(adv, 'mining')}>⛏️ ${window.HubManager.getStat(adv, 'mining')}</span>
                        <span ${this.getHov(adv, 'research')}>📚 ${window.HubManager.getStat(adv, 'research')}</span>
                        <span ${this.getHov(adv, 'construction')}>🔨 ${window.HubManager.getStat(adv, 'construction')}</span>
                        <span ${this.getHov(adv, 'scouting')}>🪔 ${window.HubManager.getStat(adv, 'scouting')}</span>
                    </div>

                    <div class="sq-vitals-grid">
                        <div style="display: flex; flex-direction: column; position: relative;" ${this.getHov(adv, 'hp')}>
                            <span style="color:#ff6666;">❤️ ${adv.hp}/${maxHp}</span>
                            <div class="sq-vital-bar ${isHpHealing ? 'healing' : ''}">
                                <div class="sq-hp-ghost" style="width: ${initialHpGhostPercent}%;"></div>
                                <div class="sq-hp-fill" style="width: ${initialHpFillPercent}%;"></div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; position: relative;" ${this.getHov(adv, 'stamina')}>
                            <span style="color:#4affab;">💨 ${adv.stamina}/${maxStamina}</span>
                            <div class="sq-vital-bar ${isStamHealing ? 'healing' : ''}">
                                <div class="sq-stam-ghost" style="width: ${initialStamGhostPercent}%;"></div>
                                <div class="sq-stam-fill" style="width: ${initialStamFillPercent}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        requestAnimationFrame(() => {
            document.querySelectorAll('.sq-hp-fill').forEach((el, index) => {
                const adv = activeSquad[index];
                if (adv) el.style.width = `${(adv.hp / window.HubManager.getStat(adv, 'hp')) * 100}%`;
            });
            document.querySelectorAll('.sq-hp-ghost').forEach((el, index) => {
                const adv = activeSquad[index];
                if (adv) el.style.width = `${(adv.hp / window.HubManager.getStat(adv, 'hp')) * 100}%`;
            });

            document.querySelectorAll('.sq-stam-fill').forEach((el, index) => {
                const adv = activeSquad[index];
                if (adv) el.style.width = `${(adv.stamina / window.HubManager.getStat(adv, 'stamina')) * 100}%`;
            });
            document.querySelectorAll('.sq-stam-ghost').forEach((el, index) => {
                const adv = activeSquad[index];
                if (adv) el.style.width = `${(adv.stamina / window.HubManager.getStat(adv, 'stamina')) * 100}%`;
            });

            activeSquad.forEach(adv => {
                adv.prevHp = adv.hp;
                adv.prevStamina = adv.stamina;
            });
        });
    },

    renderActiveTools() {
        const container = document.getElementById('active-tools-container');
        if(!container) return;
        
        let html = '';
        ExpeditionManager.activeToolsCache && Object.keys(ExpeditionManager.activeToolsCache).forEach(type => {
            const tools = ExpeditionManager.activeToolsCache[type] || [];
            if (tools.length > 0) {
                tools.sort((a, b) => (a.isBoost === b.isBoost) ? 0 : a.isBoost ? 1 : -1);

                const toolsHTML = tools.map(t => {
                    const icon = t.sprite && t.sprite !== 'correctFilePath' ? `<img src="${t.sprite}">` : `<span class="t-fallback">${this.getIcon(t)}</span>`;
                    const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip({ ...t, type: 'supplies' }));
                    return `<div class="tool-slot-mini ${t.isBoost ? 'boost-tool' : ''}" data-tooltip-id="${tooltipId}">${icon}</div>`;
                }).join('');

                const activityName = type === 'mining' ? '⛏️ ДОБЫЧА' : type === 'research' ? '📚 ИЗЫСКАНИЯ' : type === 'construction' ? '🔨 СТРОЙКА' : '🪔 РАЗВЕДКА';

                html += `
                    <div class="tool-activity-group">
                        <div class="tag-header" style="color: var(--color-gold);">${activityName}</div>
                        <div class="tag-tools">${toolsHTML}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || `<div style="color: #666; text-align: center; font-size: 13px; font-style: italic; margin-top: 20px;">Инструменты не задействованы</div>`;
    },

    renderInventory() {
        const suppliesContainer = document.getElementById('explore-inv-supplies');
        const lootContainer = document.getElementById('explore-inv-loot');
        
        if (suppliesContainer) {
            const inv = GameState.expeditionInventory || [];
            suppliesContainer.innerHTML = inv.length === 0 ? '<div style="color:#666; grid-column: 1/-1;">Пусто</div>' : inv.map(item => {
                const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip(item));
                return `
                <div class="inv-item" data-tooltip-id="${tooltipId}">
                    ${item.sprite && item.sprite !== 'correctFilePath' ? `<img src="${item.sprite}" style="max-width:80%;max-height:80%;">` : `<div class="inv-icon-large">${this.getIcon(item)}</div>`}
                </div>
            `}).join('');
        }

        if (lootContainer) {
            const found = ExpeditionManager.foundItems || [];
            lootContainer.innerHTML = found.length === 0 ? '<div style="color:#666; grid-column: 1/-1;">Пока ничего не найдено</div>' : found.map(item => {
                const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip(item));
                return `
                <div class="inv-item" data-tooltip-id="${tooltipId}">
                    ${item.sprite && item.sprite !== 'correctFilePath' ? `<img src="${item.sprite}" style="max-width:80%;max-height:80%;">` : `<div class="inv-icon-large">${this.getIcon(item)}</div>`}
                </div>
            `}).join('');
        }
    },

    showLootNotification(item, isDeduction = false) {
        const isModalOpen = !document.getElementById('explore-inv-modal').classList.contains('hidden');
        if (isModalOpen) {
            this.renderInventory(); 
        } else if (!isDeduction) {
            const badge = document.getElementById('inv-badge');
            if (badge) {
                badge.classList.remove('hidden');
                badge.innerText = parseInt(badge.innerText || 0) + 1;
            }
        }

        const container = document.getElementById('loot-toast-container');
        if (!container) return;

        const tId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip(item));
        const icon = item.sprite && item.sprite !== 'correctFilePath' ? `<img src="${item.sprite}" style="width:20px;">` : this.getIcon(item);

        const toast = document.createElement('div');
        toast.className = `loot-toast ${isDeduction ? 'deduction' : ''}`;
        toast.setAttribute('data-tooltip-id', tId);
        toast.innerHTML = `
            <div class="loot-toast-icon">${icon}</div>
            <div class="loot-toast-text">${isDeduction ? '-' : '+'} ${item.name}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    showBattleNotification() {
        const container = document.getElementById('battle-toast-container');
        if (!container) return;

        const tText = "<b>🚨 БОЙ ДОСТУПЕН!</b><br>Угроза достигла 25%. Кнопка сражения активирована. Вы можете нанести превентивный удар!";
        const tId = TooltipManager.registerTooltip(tText);

        const toast = document.createElement('div');
        toast.className = 'loot-toast deduction'; 
        toast.setAttribute('data-tooltip-id', tId);
        toast.innerHTML = `
            <div class="loot-toast-icon">⚔️</div>
            <div class="loot-toast-text">Опасность: Бой доступен!</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 5000); 
    }
};