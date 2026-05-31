import { SceneManager } from '../core/SceneManager.js';
import { HubScene } from './HubScene.js';
import { ExpeditionManager } from '../managers/ExpeditionManagers/ExpeditionManager.js';
import { GameState } from '../core/GameState.js';
import { CharacterRenderer } from '../managers/hubLocationManagers/CharacterRenderer.js';
import { EQUIPMENT } from '../data/workersData/equipment.js';
import { TooltipManager } from '../managers/hubLocationManagers/TooltipManager.js';
import { EXPEDITION_BALANCE } from '../data/balanceFiles/expiditionBalance.js';
import { LOOT_LABELS } from '../data/workersData/labels.js';

export const ExploreScene = {
    timer: null,
    msUntilNextTick: 0,
    TICK_INTERVAL_MS: EXPEDITION_BALANCE.tickIntervalMs,
    handleKeyDown: null,
    handleRightClick: null,
    bgImage: null,
    currentBattleThreatTier: -1,
    currentSummaryReason: null,

    // Размеры спрайтов врагов для кнопки
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

    subFilters: {
        loot: { 
            valuableTypesOfStone: true, 
            minerals: true,             
            preciousStones: true,       
            naturalResources: true,     
            gases: true,                
            researchResults: true,      
            scientificSamples: true,
            battlePrey: true
        }
    },

    activitiesConfig: [
        { type: 'mining', name: '⛏️ ДОБЫЧА', colorClass: 'bg-yellow', labelClass: 'label-yellow' },
        { type: 'research', name: '📚 ИЗЫСКАНИЯ', colorClass: 'bg-purple', labelClass: 'label-purple' },
        { type: 'construction', name: '🔨 СТРОЙКА', colorClass: 'bg-orange', labelClass: 'label-orange' },
        { type: 'scouting', name: '🪔 РАЗВЕДКА', colorClass: 'bg-turquoise', labelClass: 'label-turquoise' },
        { type: 'threat', name: '⚠️ УГРОЗА', colorClass: 'bg-red', labelClass: 'label-red' }
    ],

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
        
        const variant = Math.floor(Math.random() * vars);
        return `${base}${variant}.png`;
    },

    renderEnemyCard(enemyId, customSpriteUrl = null) {
        const cfg = this.getEnemyConfig(enemyId);
        const spriteUrl = customSpriteUrl || this.getEnemySpriteUrl(enemyId);

        return `
            <div style="width: 150px; height: 150px; display: flex; justify-content: center; align-items: center; position: relative; overflow: visible;">
                <div style="
                    position: absolute; 
                    width: ${cfg.size}; 
                    height: ${cfg.size}; 
                    top: ${cfg.offsetY}; 
                    left: calc(50% + ${cfg.offsetX}); 
                    transform: translateX(-50%) scale(${cfg.scale}); 
                    transform-origin: center center; 
                    pointer-events: none; 
                    z-index: 10;
                ">
                    <img src="${spriteUrl}" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255, 68, 68, 0.4));">
                </div>
            </div>
        `;
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
                position: absolute; top: 0; right: 0; 
                width: 70%; height: 100%; 
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
                position: absolute; top: 0; right: 0; 
                width: 65%; height: 100%; 
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
            <span style="position: relative; z-index: 2; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); text-transform: uppercase; letter-spacing: 1px;">${label}</span>
        `;
    },

    init() {
        document.getElementById('game-container').addEventListener('contextmenu', e => e.preventDefault());
        document.getElementById('ui-explore').classList.remove('hidden');
        
        const bgIndex = Math.floor(Math.random() * 6);
        this.bgImage = new Image();
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgIndex}.png`;

        this.applyMaskToButton('btn-evacuate', 'ПОКИНУТЬ ПЕЩЕРУ', 'assets/img/backgrounds/ExploreScene/leave.png');
        this.applyMaskToButton('btn-rest', 'ОТДЫХ (ПРИВАЛ)', 'assets/img/backgrounds/ExploreScene/glassForestRest.png');
        this.applyMaskToButton('btn-explore-inv', 'ИНВЕНТАРЬ', 'assets/img/backgrounds/hubLocations/warehouse.png');
        this.currentBattleThreatTier = -1;

        if (GameState.isReturningFromBattle) {
            GameState.isReturningFromBattle = false;
            
            this.renderTubes();
            this.renderSquad();
            this.renderActiveTools();
            this.setupListeners();
            this.updateUI(false);

            if (GameState.battleContext === 'forced_timeout') {
                this.showSummary("Время смены вышло. Отряд с боем прорвался к клети.");
            } else if (GameState.battleContext === 'forced_threat') {
                this.showSummary("Критическая угроза! Отразив атаку, отряд экстренно сбежал из шахты.");
            } else {
                ExpeditionManager.active = true;
                ExpeditionManager.isPaused = true;
                this.startLoop();
            }
        }
        else {
            ExpeditionManager.start();
            ExpeditionManager.isPaused = true;
            this.msUntilNextTick = this.TICK_INTERVAL_MS;
            
            document.getElementById('pause-indicator').classList.remove('hidden');
            document.getElementById('pause-text').innerText = "ПРОДОЛЖИТЬ";

            this.renderTubes();
            this.renderSquad();
            ExpeditionManager.evaluateTools();
            this.renderActiveTools();

            this.setupListeners();
            this.updateUI(false);
            this.startLoop();
        }

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (!overlay.classList.contains('active')) {
                    overlay.classList.add('hidden');
                }
            }, 1200);
        }
    },

    renderTubes() {
        const injectZone = document.getElementById('tubes-inject-zone');
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
                    const requiredToolEntry = Object.entries(toolsData || {}).find(([key, t]) => t.requiredAt === i);
                    if (requiredToolEntry) {
                        const [toolKey, tool] = requiredToolEntry;
                        const tText = `<b>⚠️ Рубеж усложнения работ (${i}%)</b><br>До этой отметки инструмент <span style="color:var(--color-success); font-weight:bold;">${tool.name}</span> ускоряет работу на +50%.<br>С момента её достижения он становится <b>СТРОГО ОБЯЗАТЕЛЕН</b> для продолжения деятельности. Без него работа остановится!`;
                        const tId = TooltipManager.registerTooltip(tText);
                        
                        icons.push({ symbol: '!', class: 'notch-required', tooltipId: tId });
                        notchClass = 'notch-required';
                    } 
                }

                if (isLootActivity) {
                    const leg = bal.milestones.legendary;
                    if (isLootActivity && i % leg.interval === 0) {
                        const tText = `<b>${leg.icon} ${leg.label} (${i}%)</b><br>${leg.desc}`;
                        const tId = TooltipManager.registerTooltip(tText);
                        icons.push({ symbol: leg.icon, class: 'notch-large', tooltipId: tId });
                        if (!notchClass) notchClass = 'notch-large';
                    } 

                    const rare = bal.milestones.rare;
                    if (isLootActivity && i % rare.interval === 0) {
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

    getHov(adv, stat) {
        const tooltip = window.HubManager.getStatTooltip(adv, stat);
        const encoded = window.HubManager.getEncodedTooltip(tooltip);
        return `onmousemove="HubManager.showEncodedTooltip(event, '${encoded}')" onmouseout="HubManager.hideTooltip()"`;
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

    showConfirm(title, desc, onYes) {
        document.getElementById('confirm-title').innerText = title;
        document.getElementById('confirm-desc').innerText = desc;
        document.getElementById('confirm-modal').classList.remove('hidden');
        
        document.getElementById('confirm-btn-yes').onclick = () => {
            document.getElementById('confirm-modal').classList.add('hidden');
            onYes();
        };
        document.getElementById('confirm-btn-cancel').onclick = () => {
            document.getElementById('confirm-modal').classList.add('hidden');
        };
    },

    setupListeners() {
        const pauseBtn = document.getElementById('btn-pause');
        pauseBtn.onclick = () => {
            const isNowPaused = ExpeditionManager.togglePause();
            document.getElementById('pause-indicator').classList.toggle('hidden', !isNowPaused);
            document.getElementById('pause-text').innerText = isNowPaused ? "ПРОДОЛЖИТЬ" : "ПАУЗА";
        };

        document.querySelectorAll('.prio-grid-btn').forEach(btn => {
            const type = btn.dataset.type;
            btn.onclick = () => {
                ExpeditionManager.priority = (ExpeditionManager.priority === type) ? null : type;
                this.updateUI(false);
            };
        });

        document.querySelectorAll('.pace-select-btn').forEach(btn => {
            btn.onclick = () => {
                ExpeditionManager.pace = btn.dataset.pace;
                this.updateUI(false);
            };
        });

        document.getElementById('btn-explore-inv').onclick = () => {
            ExpeditionManager.isPaused = true;
            document.getElementById('explore-inv-modal').classList.remove('hidden');
            document.getElementById('inv-badge').classList.add('hidden');
            document.getElementById('inv-badge').innerText = '0';
            this.renderInventory(); 
        };
        document.getElementById('explore-inv-close').onclick = () => {
            document.getElementById('explore-inv-modal').classList.add('hidden');
        };

        const restBtn = document.getElementById('btn-rest');
        restBtn.onclick = () => {
            const isResting = ExpeditionManager.toggleRest();
            restBtn.classList.toggle('btn-cleat', isResting);
            document.getElementById('rest-aura').classList.toggle('active', isResting);
            this.updateUI(false);
        };

        document.getElementById('btn-evacuate').onclick = () => {
            ExpeditionManager.isPaused = true;
            const isForced = ExpeditionManager.threat >= 50 && !ExpeditionManager.battleCompleted;
            const desc = isForced 
                ? "Внимание! Уровень угрозы слишком высок. При попытке покинуть шахту на ваш отряд НАПАДУТ ЧУДОВИЩА!" 
                : "Вы действительно хотите досрочно свернуть экспедицию и вернуться в лагерь?";
                
            this.showConfirm("Покинуть пещеру", desc, () => {
                if (isForced) {
                    ExpeditionManager.triggerBattle();
                } else {
                    this.showSummary("Досрочное завершение экспедиции.");
                }
            });
        };

        const triggerBattleBtn = document.getElementById('btn-trigger-battle');
        if (triggerBattleBtn) {
            triggerBattleBtn.onclick = () => {
                if (ExpeditionManager.threat >= 25 && !ExpeditionManager.battleCompleted) {
                    ExpeditionManager.isPaused = true;
                    this.showConfirm("Превентивная Битва", "Вы действительно хотите начать бой прямо сейчас на собственных условиях?", () => {
                        ExpeditionManager.triggerBattle();
                    });
                }
            };
        }

        this.handleKeyDown = (e) => {
            const activeModal = document.querySelector('.modal-overlay:not(.hidden)');
            
            if (activeModal) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    if (activeModal.id === 'confirm-modal') {
                        document.getElementById('confirm-btn-cancel').click();
                    } else {
                        const closeBtn = activeModal.querySelector('.btn-danger, #explore-inv-close');
                        if (closeBtn) closeBtn.click();
                    }
                } else if (e.code === 'Enter') {
                    if (activeModal.id === 'confirm-modal') {
                        e.preventDefault();
                        document.getElementById('confirm-btn-yes').click();
                    }
                }
                return; 
            }

            if (e.code === 'Space') {
                e.preventDefault();
                document.getElementById('btn-pause')?.click();
            } else if (e.code === 'Digit1') {
                document.querySelector('.pace-select-btn[data-pace="slow"]')?.click();
            } else if (e.code === 'Digit2') {
                document.querySelector('.pace-select-btn[data-pace="normal"]')?.click();
            } else if (e.code === 'Digit3') {
                document.querySelector('.pace-select-btn[data-pace="fast"]')?.click();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                document.getElementById('btn-evacuate')?.click();
            } else if (e.code === 'KeyR') {
                document.getElementById('btn-rest')?.click();
            } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                e.preventDefault();
                document.getElementById('btn-explore-inv')?.click();
            }
        };
        window.addEventListener('keydown', this.handleKeyDown);

        this.handleRightClick = (e) => {
            if (e.button === 2) { 
                const activeModal = document.querySelector('.modal-overlay:not(.hidden)');
                if (activeModal) {
                    e.preventDefault();
                    if (activeModal.id === 'confirm-modal') {
                        document.getElementById('confirm-btn-cancel').click();
                    } else {
                        const closeBtn = activeModal.querySelector('.btn-danger, #explore-inv-close');
                        if (closeBtn) closeBtn.click();
                    }
                }
            }
        };
        window.addEventListener('mousedown', this.handleRightClick);

        const tips = {
            mining: "<b>ДОБЫЧА</b><br>Скорость извлечения минералов.<br><br><span style='color: #4affab;'>Каждый 1% прогресса приносит случайный недорогой ресурс (руду, камень или смолу).</span>",
            research: "<b>ИЗЫСКАНИЯ</b><br>Анализ аномалий и сбор полевых данных.<br><br><span style='color: #4affab;'>Каждый 1% прогресса приносит случайный недорогой научный образец (окаменелость, флору или газы).</span>",
            construction: "<b>СТРОЙКА</b><br>Укрепление сводов.",
            scouting: "<b>РАЗВЕДКА</b><br>Поиск пути."
        };

        this.activitiesConfig.forEach(act => {
            if (act.type === 'threat') return; 
            const body = document.querySelector(`.tube-row[data-type="${act.type}"] .tube-body`);
            if (body && tips[act.type]) {
                const encoded = window.HubManager.getEncodedTooltip(tips[act.type]);
                const onMove = (e) => {
                    if (e.target.closest('[data-tooltip-id]') || e.target.closest('.priority-btn')) return;
                    window.HubManager.showEncodedTooltip(e, encoded);
                };
                body.onmousemove = onMove;
                body.onmouseout = () => window.HubManager.hideTooltip();
            }
        });

        const threatTip = "<b>⚠️ УГРОЗА</b><br>Шум и активность злят фауну. При 100% начнется бой.";
        const encThreat = window.HubManager.getEncodedTooltip(threatTip);
        const threatBody = document.querySelector('.tube-row[data-type="threat"] .tube-body');
        if (encThreat && threatBody) {
            const onThreatMove = (e) => {
                if (e.target.closest('[data-tooltip-id]')) return;
                window.HubManager.showEncodedTooltip(e, encThreat);
            };
            threatBody.onmousemove = onThreatMove;
            threatBody.onmouseout = () => window.HubManager.hideTooltip();
        }

        const btnTips = {
            'btn-evacuate': "<b>Покинуть пещеру</b><br>Досрочно прервать рабочий день, избежав потенциальных опасностей работы и сражения с чудищами. После этого в течение этого цикла вернуться будет уже нельзя.",
            'btn-rest': "<b>Отдых (Привал)</b><br>Аннулировать работу, тратя время на восстановление жизненных сил и выносливости. Тратит еду и воду по одной на каждого человека, заметно увеличивая качество отдыха.",
            'btn-explore-inv': "<b>Инвентарь экспедиции</b><br>Отображает то, что взяли с собой в экспедицию погруженцы, и что они в ходе оной нашли.",
            'btn-pause': "<b>Пауза / Продолжить</b><br>Приостановить прогресс, чтобы подумать над своими действиями / продолжить работу."
        };
        Object.entries(btnTips).forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) {
                const tId = TooltipManager.registerTooltip(text);
                el.setAttribute('data-tooltip-id', tId);
            }
        });

        document.querySelectorAll('.pace-select-btn').forEach(btn => {
            const pace = btn.dataset.pace;
            let txt = "";
            if(pace === 'slow') txt = "<b>ТИХИЙ ТЕМП</b><br>Минимальный риск, но эффективность работы снижена наполовину.";
            if(pace === 'normal') txt = "<b>ШТАТНЫЙ ТЕМП</b><br>Баланс между скоростью и скрытностью.";
            if(pace === 'fast') txt = "<b>СПЕШКА</b><br>Двойная эффективность основного дела, но чудовища найдут вас очень быстро.";
            const enc = window.HubManager.getEncodedTooltip(txt);
            btn.onmousemove = (e) => window.HubManager.showEncodedTooltip(e, enc);
            btn.onmouseout = () => window.HubManager.hideTooltip();
        });
    },

    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            if (!this.timer) return; 
            const dt = now - lastTime;
            lastTime = now;
            
            const pauseText = document.getElementById('pause-text');
            if (pauseText) {
                if (ExpeditionManager.isPaused && pauseText.innerText !== "ПРОДОЛЖИТЬ") {
                    document.getElementById('pause-indicator').classList.remove('hidden');
                    pauseText.innerText = "ПРОДОЛЖИТЬ";
                } else if (!ExpeditionManager.isPaused && pauseText.innerText !== "ПАУЗА") {
                    document.getElementById('pause-indicator').classList.add('hidden');
                    pauseText.innerText = "ПАУЗА";
                }
            }
            
            if (!ExpeditionManager.isPaused && ExpeditionManager.active) {
                this.msUntilNextTick -= dt;
                
                const percent = Math.max(0, 100 - (this.msUntilNextTick / this.TICK_INTERVAL_MS * 100));
                const timerBar = document.getElementById('tick-timer-bar');
                if (timerBar) {
                    const radius = (percent / 100) * 150;
                    timerBar.style.clipPath = `circle(${radius}% at 100% 100%)`;
                }
                
                if (this.msUntilNextTick <= 0) {
                    this.msUntilNextTick = this.TICK_INTERVAL_MS;
                    const status = ExpeditionManager.tick();
                    if (status === "TIMEOUT") {
                        if (ExpeditionManager.threat >= 50 && !ExpeditionManager.battleCompleted) {
                            ExpeditionManager.triggerBattle();
                        } else {
                            this.showSummary("Время смены подошло к концу.");
                        }
                    } else {
                        this.updateUI(true);
                    }
                }
            }
            this.timer = requestAnimationFrame(loop);
        };
        this.timer = requestAnimationFrame(loop);
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
                valuableTypesOfStone: '🪨', 
                minerals: '⛏️', 
                preciousStones: '💎', 
                naturalResources: '🧪', 
                gases: '💨', 
                researchResults: '📜', 
                battlePrey: '💀',
                scientificSamples: '🧪'
            };
            return map[item.category] || '📦';
        }
        return '📦';
    },

    renderActiveTools() {
        const container = document.getElementById('active-tools-container');
        if(!container) return;
        
        let html = '';
        this.activitiesConfig.forEach(act => {
            if (act.type === 'threat') return; 
            const tools = ExpeditionManager.activeToolsCache[act.type] || [];
            if (tools.length > 0) {
                tools.sort((a, b) => (a.isBoost === b.isBoost) ? 0 : a.isBoost ? 1 : -1);

                const toolsHTML = tools.map(t => {
                    const icon = t.sprite && t.sprite !== 'correctFilePath' ? `<img src="${t.sprite}">` : `<span class="t-fallback">${this.getIcon(t)}</span>`;
                    const tooltipId = TooltipManager.registerTooltip(window.HubManager.getItemTooltip({ ...t, type: 'supplies' }));
                    return `<div class="tool-slot-mini ${t.isBoost ? 'boost-tool' : ''}" data-tooltip-id="${tooltipId}">${icon}</div>`;
                }).join('');

                html += `
                    <div class="tool-activity-group">
                        <div class="tag-header" style="color: var(--color-gold);">${act.name}</div>
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

    showSummary(reason) {
        ExpeditionManager.active = false;
        ExpeditionManager.saveProgressToGameState();

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
        const activeSquadForSummary = GameState.currentSquad.filter(adv => adv !== null && adv !== undefined);
        
        advList.innerHTML = activeSquadForSummary.map(adv => {
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
        progressDetails.innerHTML = this.activitiesConfig.filter(act => act.type !== 'threat').map(act => {
            const endProg = ExpeditionManager.progress[act.type];
            let reachedMilestones = [];
            const toolsData = EQUIPMENT[ExpeditionManager.catMap[act.type]];

            for (let i = 5; i <= 100; i += 5) {
                if (endProg >= i) {
                    const requiredToolEntry = Object.entries(toolsData || {}).find(([key, t]) => t.requiredAt === i);
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
        const spentInv = GameState.expeditionInventory || [];
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
                const deadIds = GameState.currentSquad.map(adv => adv.id);
                GameState.roster = GameState.roster.filter(adv => !deadIds.includes(adv.id));
                GameState.currentSquad = [];
                ExpeditionManager.foundItems = [];
            } else {
                GameState.currentSquad.forEach(adv => {
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
    },

    updateUI(showAnims = false) {
        if (showAnims) {
            this.renderSquad();
            this.renderActiveTools();
        }

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
                if (val >= p) {
                    m.style.display = 'none'; 
                } else {
                    m.style.display = '';
                }
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
            } else if (showAnims && delta > 0 && deltaEl) {
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
            
            // Подставка спрайта врага, в звисимости от сложности предстоящего боя
            let tier = 0;
            let enemyId = 'fritta';
            
            if (tVal >= 100) { tier = 4; enemyId = 'glassMother'; }
            else if (tVal >= 90) { tier = 3; enemyId = 'vitrailSpider'; }
            else if (tVal >= 70) { tier = 2; enemyId = 'amalgamSpider'; }
            else if (tVal >= 25) { tier = 1; enemyId = 'glassSpider'; }
            else { tier = 0; enemyId = 'fritta'; }

            if (this.currentBattleThreatTier !== tier) {
                this.currentBattleThreatTier = tier;
                this.applyMaskToButton('btn-trigger-battle', 'БИТВА ⚔️', null, enemyId);
            }

            if (ExpeditionManager.battleCompleted) {
                triggerBattleBtn.style.display = 'none';
            } else {
                triggerBattleBtn.style.display = 'block';
                if (tVal >= 25) {
                    triggerBattleBtn.removeAttribute('disabled');
                    const bId = TooltipManager.registerTooltip("<b>Начать превентивное сражение</b><br>Нажмите, чтобы атаковать стаю на своих условиях. Победа полностью снимет угрозу до конца экспедиции.");
                    triggerBattleBtn.setAttribute('data-tooltip-id', bId);
                } else {
                    triggerBattleBtn.setAttribute('disabled', 'true');
                    const bId = TooltipManager.registerTooltip("<b>Сражение недоступно</b><br>Уровень угрозы слишком мал (требуется минимум 25.00%). Пока что вокруг суетятся только относительно безобидные фритты.");
                    triggerBattleBtn.setAttribute('data-tooltip-id', bId);
                }
            }
        }

        document.getElementById('explore-time').innerText = ExpeditionManager.timeElapsed;
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
    },

    draw(ctx, canvas) {
        ctx.fillStyle = "#0a0c10"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.bgImage && this.bgImage.complete) {
            ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
            
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, "rgba(10, 8, 6, 0.65)");
            grad.addColorStop(1, "rgba(10, 8, 6, 0.85)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.timer = null;
        
        if (this.handleKeyDown) {
            window.removeEventListener('keydown', this.handleKeyDown);
        }
        if (this.handleRightClick) {
            window.removeEventListener('mousedown', this.handleRightClick);
        }

        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('expedition-summary').classList.add('hidden');
    }
};