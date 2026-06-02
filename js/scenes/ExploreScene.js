import { ExpeditionManager } from '../managers/ExpeditionManagers/ExpeditionManager.js';
import { GameState } from '../core/GameState.js';
import { EXPEDITION_BALANCE } from '../data/balanceFiles/expiditionBalance.js';
import { ExploreUIHelper } from '../managers/ExpeditionManagers/ExploreUIHelper.js';
import { ExploreTubesHelper } from '../managers/ExpeditionManagers/ExploreTubesHelper.js';
import { ExpeditionSummaryHelper } from '../managers/ExpeditionManagers/ExpeditionSummaryHelper.js';
import { TooltipManager } from '../managers/hubLocationManagers/TooltipManager.js';

export const ExploreScene = {
    timer: null,
    msUntilNextTick: 0,
    TICK_INTERVAL_MS: EXPEDITION_BALANCE.tickIntervalMs,
    handleKeyDown: null,
    handleRightClick: null,
    bgImage: null,

    init() {
        document.getElementById('game-container').addEventListener('contextmenu', e => e.preventDefault());
        document.getElementById('ui-explore').classList.remove('hidden');
        
        const bgIndex = Math.floor(Math.random() * 6);
        this.bgImage = new Image();
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgIndex}.png`;

        ExploreUIHelper.applyMaskToButton('btn-evacuate', 'ПОКИНУТЬ ПЕЩЕРУ', 'assets/img/backgrounds/ExploreScene/leave.png');
        ExploreUIHelper.applyMaskToButton('btn-rest', 'ОТДЫХ (ПРИВАЛ)', 'assets/img/backgrounds/ExploreScene/glassForestRest.png');
        ExploreUIHelper.applyMaskToButton('btn-explore-inv', 'ИНВЕНТАРЬ', 'assets/img/backgrounds/hubLocations/warehouse.png');
        this.currentBattleThreatTier = -1;

        if (GameState.isReturningFromBattle) {
            GameState.isReturningFromBattle = false;
            
            ExploreTubesHelper.renderTubes();
            ExploreUIHelper.renderSquad();
            ExploreUIHelper.renderActiveTools();
            this.setupListeners();
            this.updateUI(false);

            if (GameState.battleContext === 'forced_timeout') {
                ExpeditionSummaryHelper.showSummary("Время смены вышло. Отряд с боем прорвался к клети.");
            } else if (GameState.battleContext === 'forced_threat') {
                ExpeditionSummaryHelper.showSummary("Критическая угроза! Отразив атаку, отряд экстренно сбежал из шахты.");
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

            ExploreTubesHelper.renderTubes();
            ExploreUIHelper.renderSquad();
            ExpeditionManager.evaluateTools();
            ExploreUIHelper.renderActiveTools();

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

    setupListeners() {
        const pauseBtn = document.getElementById('btn-pause');
        pauseBtn.onclick = () => {
            const isNowPaused = ExpeditionManager.togglePause();
            document.getElementById('pause-indicator').classList.toggle('hidden', !isNowPaused);
            document.getElementById('pause-text').innerText = isNowPaused ? "ПРОДОЛЖИТЬ" : "ПАУЗА";
        };

        const tubesZone = document.getElementById('tubes-inject-zone');
        if (tubesZone) {
            tubesZone.onclick = (e) => {
                const btn = e.target.closest('.prio-tube-btn');
                if (btn) {
                    const type = btn.dataset.type;
                    ExpeditionManager.priority = (ExpeditionManager.priority === type) ? null : type;
                    this.updateUI(false);
                }
            };
        }

        document.querySelectorAll('.prio-grid-btn').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
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
            ExploreUIHelper.renderInventory(); 
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
                    ExpeditionSummaryHelper.showSummary("Досрочное завершение экспедиции.");
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

        ExploreTubesHelper.activitiesConfig.forEach(act => {
            if (act.type === 'threat') return; 
            const body = document.querySelector(`.tube-row[data-type="${act.type}"] .tube-body`);
            if (body && tips[act.type]) {
                const encoded = window.HubManager.getEncodedTooltip(tips[act.type]);
                const onMove = (e) => {
                    if (e.target.closest('[data-tooltip-id]') || e.target.closest('.prio-tube-btn')) return;
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
                            ExpeditionSummaryHelper.showSummary("Время смены подошло к концу.");
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

    updateUI(showAnims = false) {
        if (showAnims) {
            ExploreUIHelper.renderSquad();
            ExploreUIHelper.renderActiveTools();
        }

        ExploreTubesHelper.updateTubesUI(
            this.currentBattleThreatTier,
            (newTier, enemyId) => {
                this.currentBattleThreatTier = newTier;
                ExploreUIHelper.applyMaskToButton('btn-trigger-battle', 'БИТВА ⚔️', null, enemyId);
            }
        );
    },

    showSummary(reason) {
        ExpeditionSummaryHelper.showSummary(reason);
    },

    showLootNotification(item, isDeduction = false) {
        ExploreUIHelper.showLootNotification(item, isDeduction);
    },

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.timer = null;
        
        if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown);
        if (this.handleRightClick) window.removeEventListener('mousedown', this.handleRightClick);

        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('expedition-summary').classList.add('hidden');
    }
};