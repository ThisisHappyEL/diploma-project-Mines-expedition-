import { ExpeditionManager } from '../managers/ExpeditionManagers/ExpeditionManager.js';
import { GameState } from '../core/GameState.js';
import { EXPEDITION_BALANCE } from '../data/balanceFiles/expiditionBalance.js';
import { ExploreUIHelper } from '../managers/ExpeditionManagers/ExploreUIHelper.js';
import { ExpeditionSummaryHelper } from '../managers/ExpeditionManagers/ExpeditionSummaryHelper.js';
import { CharacterRenderer } from '../managers/hubLocationManagers/CharacterRenderer.js';
import { HubManager } from '../managers/hubLocationManagers/HubManager.js';
import { SceneManager } from '../core/SceneManager.js';
import { HubScene } from './HubScene.js';
import { SaveManager } from '../managers/SaveManager.js';
import { TooltipManager } from '../managers/hubLocationManagers/TooltipManager.js';

export const ExploreScene = {
    timer: null,
    msUntilNextTick: 0,
    TICK_INTERVAL_MS: EXPEDITION_BALANCE.tickIntervalMs || 3000,
    handleKeyDown: null,
    bgImage: null,
    draggedSquadIdx: null,

    init() {
        document.getElementById('ui-explore').classList.remove('hidden');
        document.getElementById('top-bar').classList.remove('hidden');
        GameState.updateTopBarUI();

        const bgIndex = Math.floor(Math.random() * 6);
        this.bgImage = new Image();
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgIndex}.webp`;

        if (GameState.isReturningFromBattle) {
            GameState.isReturningFromBattle = false;
            ExpeditionManager.resumeFromHub();
        } else if (GameState.isExpeditionActive) {
            ExpeditionManager.resumeFromHub();
        } else {
            ExpeditionManager.start();
            this.msUntilNextTick = this.TICK_INTERVAL_MS;
        }

        this.setupListeners();
        this.updateUI();
        this.startLoop();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (!overlay.classList.contains('active')) overlay.classList.add('hidden');
            }, 1200);
        }
    },

    setupListeners() {
        document.getElementById('btn-pause').onclick = () => {
            ExpeditionManager.togglePause();
            this.updatePauseButton();
        };

        document.getElementById('btn-to-hub-pause').onclick = () => {
            ExpeditionManager.isPaused = true;
            if ((GameState.cycleHoursLeft ?? 0) > 0) {
                GameState.cycleHoursLeft = Math.max(0, GameState.cycleHoursLeft - 1);
            }
            if (GameState.cycleHoursLeft <= 0) {
                ExpeditionSummaryHelper.showSummary('CYCLE_TIMEOUT');
                return;
            }
            SaveManager.saveGame();
            SceneManager.changeScene(HubScene);
        };

        document.getElementById('btn-explore-inv').onclick = () => {
            ExpeditionManager.isPaused = true;
            this.updatePauseButton();
            document.getElementById('explore-inv-modal').classList.remove('hidden');
            const badge = document.getElementById('inv-badge');
            if (badge) {
                badge.classList.add('hidden');
                badge.innerText = '0';
            }
            ExploreUIHelper.renderInventory();
        };

        document.getElementById('explore-inv-close').onclick = () => {
            document.getElementById('explore-inv-modal').classList.add('hidden');
        };

        document.getElementById('btn-evacuate').onclick = () => {
            ExpeditionManager.isPaused = true;
            this.updatePauseButton();
            const hoursLeft = GameState.cycleHoursLeft ?? 0;
            this.showConfirm(
                'Поднять Клеть',
                `Завершить текущую смену и забрать добычу на поверхность? В сутках останется ${hoursLeft} ч., и вы сможете спустить другую смену.`,
                () => ExpeditionSummaryHelper.showSummary('Подъём смены на поверхность.')
            );
        };

        const battleBtn = document.getElementById('btn-trigger-battle');
        if (battleBtn) {
            battleBtn.onclick = () => {
                ExpeditionManager.isPaused = true;
                this.updatePauseButton();
                this.showConfirm('Тест старой схватки', 'Запустить тестовый бой на текущей глубине?', () => {
                    ExpeditionManager.triggerBattle('preemptive');
                });
            };
        }

        this.handleKeyDown = (e) => {
            const activeModal = document.querySelector('.modal-overlay:not(.hidden)');
            if (activeModal) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    if (activeModal.id === 'confirm-modal') document.getElementById('confirm-btn-cancel').click();
                    else activeModal.querySelector('.btn-danger, #explore-inv-close')?.click();
                }
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                document.getElementById('btn-pause')?.click();
            }
        };
        window.addEventListener('keydown', this.handleKeyDown);
    },

    updatePauseButton() {
        const txt = document.getElementById('pause-text');
        if (txt) txt.innerText = ExpeditionManager.isPaused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА';
    },

    renderSquad3x3() {
        const grid = document.getElementById('explore-squad-3x3');
        if (!grid) return;

        const stats = ExpeditionManager.getSquadTotalStats();
        const statsEl = document.getElementById('explore-squad-stats-mini');
        if (statsEl) {
            statsEl.innerText = `⚔️${stats.battle}  ⛏️${stats.mining}  📚${stats.research}  🔨${stats.construction}  🪔${stats.scouting}`;
        }

        const colNames = ['Тыл', 'Центр', 'Фронт'];
        let html = '';

        for (let i = 0; i < 9; i++) {
            const adv = GameState.currentSquad[i];
            const colLabel = colNames[i % 3];

            if (!adv) {
                html += `<div class="exp-grid-cell" data-idx="${i}"><span style="width:100%; text-align:center; font-size:10px; color:#3d352e; text-transform:uppercase; pointer-events:none;">${colLabel}</span></div>`;
                continue;
            }

            const maxHp = HubManager.getStat(adv, 'hp');
            const maxStam = HubManager.getStat(adv, 'stamina');
            const collapsed = adv.hp <= 0 || adv.stamina <= 0;
            const col = i % 3;
            const weapon = adv.equipment?.rightHand;
            const weaponName = weapon ? weapon.name : 'Кулаки';
            const cat = weapon ? (HubManager.getLocalCategory(weapon) || weapon.category) : 'fists';
            const optimalCols = [ 'bows', 'crossbows', 'slings', 'arquebuses' ].includes(cat)
                ? [0, 1]
                : (cat === 'spears' ? [1, 2] : [2]);
            const isSuboptimal = !optimalCols.includes(col);
            const armor = adv.equipment?.body || adv.civilBody;
            const ttHtml = `<b>${adv.name}</b> (${colNames[col]})<br>⚔️ ${weaponName}<br>🛡️ ${armor ? armor.name : 'Лохмотья'}${isSuboptimal ? '<br><span style="color:#ffaa44;">⚠️ Оружие неэффективно на этой линии!</span>' : ''}`;
            const ttId = TooltipManager.registerTooltip(ttHtml);

            html += `
                <div class="exp-grid-cell occupied ${collapsed ? 'collapsed' : ''}" style="${isSuboptimal ? 'border-color:var(--color-warning);' : ''}" data-idx="${i}" data-tooltip-id="${ttId}" draggable="true">
                    <div class="exp-face-crop">
                        <div class="exp-face-crop-inner">
                            <div style="position:absolute; width:425px; height:425px; top:-40px; left:-190px; pointer-events:none;">
                                ${CharacterRenderer.getAvatarHTML(adv, '425px', true)}
                            </div>
                        </div>
                    </div>
                    <div class="exp-cell-info">
                        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#fff;">
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${adv.name}</span>
                            ${isSuboptimal ? '<span style="color:var(--color-warning); margin-left:3px;">⚠️</span>' : ''}
                        </div>
                        <div style="font-size:10px; color:#4affab; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚔️ ${weaponName}</div>
                        <div style="display:flex; gap:6px; font-size:10px; font-weight:bold;">
                            <span style="color:#ff6666;">❤️ ${Math.floor(adv.hp)}/${maxHp}</span>
                            <span style="color:#4affab;">💨 ${Math.floor(adv.stamina)}/${maxStam}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html;

        grid.querySelectorAll('.exp-grid-cell').forEach(cell => {
            const idx = parseInt(cell.getAttribute('data-idx'));
            const hasUnit = Boolean(GameState.currentSquad[idx]);

            if (hasUnit) {
                cell.ondragstart = (e) => {
                    this.draggedSquadIdx = idx;
                    e.dataTransfer.setData('text/plain', String(idx));
                    cell.style.opacity = '0.45';
                };
                cell.ondragend = () => {
                    this.draggedSquadIdx = null;
                    cell.style.opacity = '1';
                    grid.querySelectorAll('.exp-grid-cell').forEach(c => c.classList.remove('drag-over'));
                };
            }

            cell.ondragover = (e) => {
                e.preventDefault();
                if (this.draggedSquadIdx !== null && this.draggedSquadIdx !== idx) {
                    cell.classList.add('drag-over');
                }
            };
            cell.ondragleave = () => {
                cell.classList.remove('drag-over');
            };
            cell.ondrop = (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');
                const srcIdx = parseInt(e.dataTransfer.getData('text/plain'));
                if (Number.isNaN(srcIdx) || srcIdx === idx) return;

                const tmp = GameState.currentSquad[idx];
                GameState.currentSquad[idx] = GameState.currentSquad[srcIdx];
                GameState.currentSquad[srcIdx] = tmp;

                SaveManager.saveGame();
                this.renderSquad3x3();
            };
        });
    },

    renderShaft() {
        const body = document.getElementById('shaft-scroll-body');
        if (!body) return;

        const mine = ExpeditionManager.getMine();
        const scrollTopPrev = body.scrollTop;
        body.innerHTML = '';

        for (let d = 1; d <= mine.visibleMaxDepth; d++) {
            const rowData = mine.depths[d - 1];
            if (!rowData) continue;

            const isCurrentDepth = mine.cageDepth === d;
            const isReachable = ExpeditionManager.canDescendTo(d);

            const rowEl = document.createElement('div');
            rowEl.className = `shaft-depth-row ${isCurrentDepth ? 'active-depth' : ''}`;

            const badge = document.createElement('div');
            badge.className = 'shaft-depth-badge';
            badge.innerHTML = `
                <span style="font-size:11px; color:#888;">ГЛУБИНА</span>
                <span style="font-size:26px; color:${isCurrentDepth ? 'var(--color-gold)' : '#ccc'};">${d}</span>
                ${!isCurrentDepth && isReachable ? `<button class="hub-btn move-cage-btn" style="padding:3px 8px; font-size:11px; border-color:var(--color-gold); color:var(--color-gold);">Клеть сюда</button>` : ''}
            `;
            const moveBtn = badge.querySelector('.move-cage-btn');
            if (moveBtn) {
                moveBtn.onclick = () => {
                    ExpeditionManager.moveCageToDepth(d);
                    this.updateUI();
                };
            }
            rowEl.appendChild(badge);

            ['west', 'center', 'east'].forEach(col => {
                const node = rowData[col];
                const isCenter = col === 'center';
                const isFocused = isCurrentDepth && ExpeditionManager.focusedCol === col;
                const locked = !isCurrentDepth && !(isCenter && isReachable);
                const stage = ExpeditionManager.getActiveStage(node);

                const card = document.createElement('div');
                card.className = [
                    'shaft-node-card',
                    isCenter ? 'center-lane' : '',
                    isFocused ? 'focused' : '',
                    node.completed ? 'completed' : '',
                    !node.revealed ? 'fogged' : '',
                    locked ? 'locked' : ''
                ].filter(Boolean).join(' ');

                const cageTag = (isCenter && isCurrentDepth) ? `<div class="cage-tag">🪜 КЛЕТЬ</div>` : '';

                if (!node.revealed) {
                    card.innerHTML = `
                        ${cageTag}
                        <div style="font-weight:bold; font-size:14px;">❓ Туман войны</div>
                        <div style="font-size:12px; color:#777;">${isCurrentDepth ? 'Кликните, чтобы разведать штрек, или подождите 1 час.' : 'Скрыто мраком до спуска на ярус.'}</div>
                    `;
                } else if (stage) {
                    const totalStages = node.stages.length;
                    const stageBadge = totalStages > 1 ? `<span style="color:#888; font-size:11px;">[Этап ${node.currentStageIdx + 1}/${totalStages}]</span>` : '';

                    const statusBadge = node.completed
                        ? `<span style="color:#4affab; font-size:11px; font-weight:bold;">✅ Выработано</span>`
                        : (isFocused
                            ? `<span style="color:var(--color-success); font-size:11px; font-weight:bold;">🎯 В приоритете</span>`
                            : (isCurrentDepth ? `<span style="color:#aaa; font-size:11px;">Клик — фокус</span>` : (isCenter && isReachable ? `<span style="color:var(--color-gold); font-size:11px;">Спустить клеть</span>` : '')));

                    card.innerHTML = `
                        ${cageTag}
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                            <b style="font-size:14px; color:#fff;">${stage.icon} ${stage.title} ${stageBadge}</b>
                            ${statusBadge}
                        </div>
                        <div style="font-size:12px; color:#aaa; line-height:1.3;">${stage.desc}</div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
                                <span style="color:#888;">${totalStages > 1 ? 'Этап / Общий прогресс' : 'Прогресс прорыва'}</span>
                                <b style="color:var(--color-gold);">${Math.floor(stage.progress)}% (${Math.floor(node.progress)}%)</b>
                            </div>
                            <div class="shaft-node-bar-bg">
                                <div class="shaft-node-bar-fill" style="width:${Math.min(100, node.progress)}%;"></div>
                            </div>
                        </div>
                    `;
                }

                card.onclick = () => {
                    if (isCenter && !isCurrentDepth && isReachable) {
                        ExpeditionManager.moveCageToDepth(d);
                        this.updateUI();
                        return;
                    }
                    if (!isCurrentDepth) return;
                    if (!node.revealed) ExpeditionManager.revealNode(d, col);
                    if (!node.completed) ExpeditionManager.toggleFocus(col);
                    this.updateUI();
                };

                rowEl.appendChild(card);
            });

            body.appendChild(rowEl);
        }

        if (mine.visibleMaxDepth < mine.maxDepth) {
            const remaining = mine.maxDepth - mine.visibleMaxDepth;
            const teaser = document.createElement('div');
            teaser.className = 'shaft-deeper-teaser';
            teaser.innerHTML = `⬇️ ГЛУБЖЕ В НЕДРА (Ещё ${remaining} ярус. скрыто — пробейте центральный проход, чтобы открыть новые глубины)`;
            body.appendChild(teaser);
        }

        body.scrollTop = scrollTopPrev;
    },

    updateUI() {
        const mine = ExpeditionManager.getMine();
        document.getElementById('explore-time').innerText = GameState.cycleHoursLeft ?? 24;
        document.getElementById('explore-depth-val').innerText = `${mine.cageDepth} / ${mine.maxDepth}`;
        document.getElementById('explore-loot-count').innerText = `${(ExpeditionManager.foundItems || []).length} шт.`;
        GameState.updateTopBarUI();

        this.updatePauseButton();
        this.renderSquad3x3();
        this.renderShaft();
    },

    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            if (!this.timer) return;
            const dt = now - lastTime;
            lastTime = now;

            if (!ExpeditionManager.isPaused && ExpeditionManager.active) {
                this.msUntilNextTick -= dt;
                const fillEl = document.getElementById('pause-tick-fill');
                if (fillEl) {
                    const pct = Math.max(0, Math.min(100, (1 - this.msUntilNextTick / this.TICK_INTERVAL_MS) * 100));
                    fillEl.style.width = `${pct}%`;
                }
                if (this.msUntilNextTick <= 0) {
                    this.msUntilNextTick = this.TICK_INTERVAL_MS;
                    if (fillEl) fillEl.style.width = '0%';
                    const status = ExpeditionManager.tick();
                    if (status === 'CYCLE_TIMEOUT') {
                        ExpeditionSummaryHelper.showSummary('CYCLE_TIMEOUT');
                    } else if (status === 'SUCCESS') {
                        this.updateUI();
                    }
                }
            }
            this.timer = requestAnimationFrame(loop);
        };
        this.timer = requestAnimationFrame(loop);
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

    showSummary(reason) {
        ExpeditionSummaryHelper.showSummary(reason);
    },

    showLootNotification(item, isDeduction = false) {
        ExploreUIHelper.showLootNotification(item, isDeduction);
    },

    draw(ctx, canvas) {
        ctx.fillStyle = '#0a0806';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.bgImage && this.bgImage.complete) {
            ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(10, 8, 6, 0.72)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.timer = null;
        if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown);

        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('expedition-summary').classList.add('hidden');
    }
};
