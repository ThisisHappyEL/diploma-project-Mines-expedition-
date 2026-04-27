import { SceneManager } from '../core/SceneManager.js';
import { HubScene } from './HubScene.js';
import { ExpeditionManager } from '../managers/ExpeditionManager.js';
import { GameState } from '../core/GameState.js';

export const ExploreScene = {
    timer: null,
    msUntilNextTick: 0,
    TICK_INTERVAL_MS: 3000,

    init() {
        const ui = document.getElementById('ui-explore');
        ui.classList.remove('hidden');
        
        ExpeditionManager.start();
        ExpeditionManager.isPaused = true;
        
        this.msUntilNextTick = this.TICK_INTERVAL_MS;
        
        document.getElementById('pause-indicator').classList.remove('hidden');
        document.getElementById('btn-pause').innerText = "ПРОДОЛЖИТЬ";

        this.renderSquad();
        this.setupListeners();
        this.updateUI(false);

        this.startLoop();
    },

    renderSquad() {
        const list = document.getElementById('explore-squad-list');
        if (!list) return;

        const squad = GameState.currentSquad;
        if (!squad || squad.length === 0) {
            list.innerHTML = '<div style="color: #666; padding: 10px;">Клеть пуста...</div>';
            return;
        }

        list.innerHTML = squad.map(adv => `
            <div class="squad-member-mini" style="background: rgba(255,255,255,0.03); border: 1px solid #333; padding: 8px; margin-bottom: 8px; border-radius: 4px;">
                <div style="font-weight: bold; font-size: 14px; color: #ffbf00; margin-bottom: 4px;">${adv.name}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; color: #bbb;">
                    <span>⚔️${adv.combat}</span>
                    <span>⛏️${adv.mining}</span>
                    <span>🔍${adv.scouting}</span>
                    <span>🔨${adv.building}</span>
                    <span>📚${adv.research}</span>
                </div>
            </div>
        `).join('');
    },

    startLoop() {
        let lastTime = performance.now();
        
        const loop = (now) => {
            if (!this.timer) return; 

            const dt = now - lastTime;
            lastTime = now;

            if (!ExpeditionManager.isPaused && ExpeditionManager.active) {
                this.msUntilNextTick -= dt;

                const percent = 100 - (this.msUntilNextTick / this.TICK_INTERVAL_MS * 100);
                const timerBar = document.getElementById('tick-timer-bar');
                if (timerBar) timerBar.style.height = Math.max(0, Math.min(100, percent)) + '%';

                if (this.msUntilNextTick <= 0) {
                    this.msUntilNextTick = this.TICK_INTERVAL_MS;
                    const status = ExpeditionManager.tick();
                    
                    if (status === "TIMEOUT") {
                        this.showSummary("Время вышло. Автоматическая эвакуация!");
                    } else {
                        this.updateUI(true);
                    }
                }
            }
            this.timer = requestAnimationFrame(loop);
        };
        this.timer = requestAnimationFrame(loop);
    },

    setupListeners() {
        const pauseBtn = document.getElementById('btn-pause');
        pauseBtn.onclick = () => {
            const isNowPaused = ExpeditionManager.togglePause();
            document.getElementById('pause-indicator').classList.toggle('hidden', !isNowPaused);
            pauseBtn.innerText = isNowPaused ? "ПРОДОЛЖИТЬ" : "ПАУЗА";
        };

        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.onclick = (e) => {
                const row = e.target.closest('.activity-row');
                if (row) {
                    ExpeditionManager.priority = row.dataset.type;
                    this.updateUI(false);
                }
            };
        });

        document.querySelectorAll('.pace-btn').forEach(btn => {
            btn.onclick = () => {
                ExpeditionManager.pace = btn.dataset.pace;
                this.updateUI(false);
            };
        });

        document.getElementById('btn-evacuate').onclick = () => {
            this.showSummary("Вы решили вернуться досрочно.");
        };
    },

    showSummary(reason) {
        ExpeditionManager.active = false;
        const modal = document.getElementById('expedition-summary');
        modal.classList.remove('hidden');
        document.getElementById('summary-reason').innerText = reason;

        document.getElementById('summary-progress-list').innerHTML = `
            <li>⛏️ Добыча: ${Math.floor(ExpeditionManager.progress.mining)}%</li>
            <li>🔍 Разведка: ${Math.floor(ExpeditionManager.progress.scouting)}%</li>
            <li>🔨 Стройка: ${Math.floor(ExpeditionManager.progress.construction)}%</li>
            <li>📚 Знания: ${Math.floor(ExpeditionManager.progress.research)}%</li>
        `;

        document.getElementById('summary-loot-list').innerHTML = `
            <li>💎 Минералы: ${ExpeditionManager.loot.minerals}</li>
            <li>📜 Знания: ${ExpeditionManager.loot.knowledge}</li>
            <li>📦 Ресурсы: ${ExpeditionManager.loot.materials}</li>
        `;

        document.getElementById('btn-summary-close').onclick = () => {
            SceneManager.changeScene(HubScene);
        };
    },

    updateUI(showAnims = false) {
        const activities = ['mining', 'scouting', 'construction', 'research'];
        activities.forEach(type => {
            const val = ExpeditionManager.progress[type];
            const delta = ExpeditionManager.lastDeltas[type];
            document.getElementById(`bar-${type}`).style.width = val + '%';
            document.getElementById(`stats-${type}`).innerText = `${val.toFixed(1)} / 100 (${Math.floor(val)}%)`;

            if (showAnims && delta > 0) {
                const deltaEl = document.getElementById(`delta-${type}`);
                if (deltaEl) {
                    deltaEl.innerText = `+${delta}`;
                    deltaEl.classList.remove('animate-delta');
                    void deltaEl.offsetWidth; 
                    deltaEl.classList.add('animate-delta');
                }
            }
        });

        document.querySelectorAll('.priority-btn').forEach(btn => {
            const row = btn.closest('.activity-row');
            btn.classList.toggle('active', row && ExpeditionManager.priority === row.dataset.type);
        });

        document.querySelectorAll('.pace-btn').forEach(btn => {
            btn.classList.toggle('active', ExpeditionManager.pace === btn.dataset.pace);
        });

        const tVal = ExpeditionManager.threat;
        document.getElementById('bar-threat').style.width = Math.min(tVal, 100) + '%';
        document.getElementById('stats-threat').innerText = `${tVal.toFixed(1)} / 100 (${Math.floor(Math.min(100, tVal))}%)`;
        
        document.getElementById('explore-time').innerText = ExpeditionManager.timeElapsed;
        document.getElementById('explore-max-time').innerText = ExpeditionManager.maxTime;
        document.getElementById('loot-minerals').innerText = ExpeditionManager.loot.minerals;
        document.getElementById('loot-knowledge').innerText = ExpeditionManager.loot.knowledge;
        document.getElementById('loot-materials').innerText = ExpeditionManager.loot.materials;
    },

    draw(ctx, canvas) {
        ctx.fillStyle = "#0f1215"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.timer = null;
        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('expedition-summary').classList.add('hidden');
    }
};