import { SceneManager } from '../core/SceneManager.js';
import { HubScene } from './HubScene.js';
import { ExpeditionManager } from '../managers/ExpeditionManager.js';
import { GameState } from '../core/GameState.js';

export const ExploreScene = {
    timer: null,
    msUntilNextTick: 0,
    TICK_INTERVAL_MS: 3000,

    init() {
        document.getElementById('ui-explore').classList.remove('hidden');
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
            list.innerHTML = '<div style="color: #666; padding: 10px;">Отряд не назначен...</div>';
            return;
        }

        list.innerHTML = squad.map(adv => {
            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStamina = window.HubManager.getStat(adv, 'stamina');

            return `
            <div class="squad-member-mini" style="background: rgba(40,35,30,0.8); border: 1px solid #555; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-weight: bold; font-size: 14px; color: #ffbf00; margin-bottom: 6px; border-bottom: 1px solid #444; padding-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${adv.name}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; cursor: help;">
                    <span ${this.getHov(adv, 'mining')}>⛏️ ${window.HubManager.getStat(adv, 'mining')}</span>
                    <span ${this.getHov(adv, 'research')}>📚 ${window.HubManager.getStat(adv, 'research')}</span>
                    <span ${this.getHov(adv, 'construction')}>🔨 ${window.HubManager.getStat(adv, 'construction')}</span>
                    <span ${this.getHov(adv, 'scouting')}>🪔 ${window.HubManager.getStat(adv, 'scouting')}</span>
                    <span ${this.getHov(adv, 'hp')}>❤️ ${adv.hp} / ${maxHp}</span>
                    <span ${this.getHov(adv, 'stamina')}>💨 ${adv.stamina} / ${maxStamina}</span>
                </div>
            </div>
        `}).join('');
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

        const tips = {
            mining: "<b>ДОБЫЧА</b><br>Скорость извлечения минералов. При 100% вы получите случайную добычу (железо, уголь, медь).",
            research: "<b>ИЗЫСКАНИЯ</b><br>Анализ аномалий и артефактов. При 100% выдает очки знаний для Палаты Науки.",
            construction: "<b>СТРОЙКА</b><br>Создание опор и лесов. При 100% дает материалы, полезные для обустройства Хаба.",
            scouting: "<b>РАЗВЕДКА</b><br>Поиск новых ответвлений. При 100% может открыть скрытые жилы ресурсов."
        };

        document.querySelectorAll('.activity-row').forEach(row => {
            const type = row.dataset.type;
            if (tips[type]) {
                const encoded = window.HubManager.getEncodedTooltip(tips[type]);
                row.onmousemove = (e) => window.HubManager.showEncodedTooltip(e, encoded);
                row.onmouseout = () => window.HubManager.hideTooltip();
            }
        });

        const threatTip = "<b>⚠️ УГРОЗА</b><br>Показатель того, насколько сильно вы мешаете местной фауне. При 100% на отряд нападут чудовища биома.";
        const encThreat = window.HubManager.getEncodedTooltip(threatTip);
        
        const threatText = document.getElementById('threat-block');
        if (threatText) {
            threatText.onmousemove = (e) => window.HubManager.showEncodedTooltip(e, encThreat);
            threatText.onmouseout = () => window.HubManager.hideTooltip();
        }
        const threatBarContainer = document.querySelector('.threat-bar') || document.getElementById('bar-threat')?.parentElement;
        if (threatBarContainer) {
            threatBarContainer.onmousemove = (e) => window.HubManager.showEncodedTooltip(e, encThreat);
            threatBarContainer.onmouseout = () => window.HubManager.hideTooltip();
        }

        document.querySelectorAll('.pace-btn').forEach(btn => {
            const pace = btn.dataset.pace;
            let txt = "";
            if(pace === 'slow') txt = "<b>ТИХИЙ ТЕМП</b><br>Минимальный риск, но эффективность работы снижена наполовину.";
            if(pace === 'normal') txt = "<b>ШТАТНЫЙ ТЕМП</b><br>Баланс между скоростью и скрытностью.";
            if(pace === 'fast') txt = "<b>СПЕШКА</b><br>Двойная эффективность основного дела, но чудовища найдут вас очень быстро.";
            const enc = window.HubManager.getEncodedTooltip(txt);
            btn.onmousemove = (e) => window.HubManager.showEncodedTooltip(e, enc);
            btn.onmouseout = () => window.HubManager.hideTooltip();
        });

        document.querySelectorAll('.priority-btn').forEach(btn => {
            const enc = window.HubManager.getEncodedTooltip("<b>ПРИОРИТЕТ</b><br>Сосредоточить силы отряда на этой задаче.<br><span style='color: #4affab;'>Скорость +50%</span><br><span style='color: #ff6666;'>Прочие задачи -25%</span>");
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
            if (!ExpeditionManager.isPaused && ExpeditionManager.active) {
                this.msUntilNextTick -= dt;
                const percent = 100 - (this.msUntilNextTick / this.TICK_INTERVAL_MS * 100);
                const timerBar = document.getElementById('tick-timer-bar');
                if (timerBar) timerBar.style.height = Math.max(0, Math.min(100, percent)) + '%';
                if (this.msUntilNextTick <= 0) {
                    this.msUntilNextTick = this.TICK_INTERVAL_MS;
                    const status = ExpeditionManager.tick();
                    if (status === "TIMEOUT") this.showSummary("Время вышло. Автоматическая эвакуация!");
                    else this.updateUI(true);
                }
            }
            this.timer = requestAnimationFrame(loop);
        };
        this.timer = requestAnimationFrame(loop);
    },

    showSummary(reason) {
        ExpeditionManager.active = false;
        const modal = document.getElementById('expedition-summary');
        modal.classList.remove('hidden');
        document.getElementById('summary-reason').innerText = reason;
        document.getElementById('summary-progress-list').innerHTML = `
            <li>⛏️ Добыча: ${Math.floor(ExpeditionManager.progress.mining)}%</li>
            <li>📚 Изыскания: ${Math.floor(ExpeditionManager.progress.research)}%</li>
            <li>🔨 Стройка: ${Math.floor(ExpeditionManager.progress.construction)}%</li>
            <li>🪔 Разведка: ${Math.floor(ExpeditionManager.progress.scouting)}%</li>
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
        if (showAnims) {
            this.renderSquad();
        }

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
        ctx.fillStyle = "#0a0c10"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.timer = null;
        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('expedition-summary').classList.add('hidden');
    }
};