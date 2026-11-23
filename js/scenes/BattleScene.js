import { BattleManager } from '../managers/battleSceneManagers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { GLASS_FOREST_ENEMIES, GLASS_FOREST_ENCOUNTERS } from '../data/battleData/enemies.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { ExploreScene } from './ExploreScene.js';
import { EFFECTS } from '../data/battleData/effects.js';
import { BattleRenderHelper } from '../managers/battleSceneManagers/BattleRenderHelper.js';
import { BATTLE_BALANCE } from '../data/balanceFiles/battleBalance.js';
import { GridPatternResolver } from '../managers/battleSceneManagers/GridPatternResolver.js';

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoveredCell: null, // { side, col, lane }
    lastFrameTime: 0,
    bgImage: null,
    bgLoaded: false,

    init() {
        BattleRenderHelper.applyPatches();

        const uiBase = document.getElementById('ui-battle');
        uiBase.classList.remove('hidden');

        uiBase.innerHTML = `
            <div id="b-top-bar">
                <div class="battle-phase-pill" id="b-phase-label" style="color:var(--color-gold);">РАУНД 1 · ФАЗА ТАКТИКИ</div>
                <div class="battle-cp-box">
                    <span id="b-player-cp" style="color:#4affab;">⚡ Очки Командования: 3/3</span>
                    <span style="color:#555;">|</span>
                    <span id="b-enemy-cp" style="color:#ff6666;">💀 Угроза врага: 3</span>
                </div>
                <div id="b-timer-label" style="font-size:18px; font-weight:bold; color:#fff;">⏸ ПАУЗА</div>
            </div>

            <button id="b-log-btn" class="hub-btn">ЛОГ БОЯ</button>
            <div id="b-log-container" class="hidden"></div>

            <div id="b-bottom-bar">
                <button id="b-btn-move" class="b-action-tab" style="border-right:1px solid #333;">
                    <span>🥾 ДВИЖЕНИЕ</span>
                    <small style="font-size:11px; color:#888;">1 ОЧК. КОМ.</small>
                </button>
                <div id="b-main-area">
                    <div id="b-info-row">
                        <div id="b-info-left" class="b-info-block"></div>
                        <div id="b-info-right" class="b-info-block"></div>
                    </div>
                    <div id="b-skills-row"></div>
                </div>
                <button id="b-btn-start-phase" class="b-action-tab" style="border-left:1px solid #333; color:var(--color-gold);">
                    <span>⚔️ В БОЙ</span>
                    <small style="font-size:11px; color:#888;">15 СЕК (SPACE)</small>
                </button>
            </div>
        `;

        document.getElementById('b-log-btn').onclick = () => document.getElementById('b-log-container').classList.toggle('hidden');

        this.gameUnits = [];
        this.damageTexts = [];
        this.hoveredCell = null;
        this.lastFrameTime = performance.now();

        this.bgImage = new Image();
        this.bgLoaded = false;
        const bgRand = Math.floor(Math.random() * 6);
        this.bgImage.onload = () => { this.bgLoaded = true; };
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgRand}.webp`;

        // Размещаем отряд игрока ровно по его 3x3 слотам из GameState.currentSquad
        GameState.currentSquad.forEach((data, idx) => {
            if (!data || data.hp <= 0) return;
            const lane = Math.floor(idx / 3);
            const col = idx % 3;

            const hero = new Adventurer(data, col + 1);
            hero.id = data.id;
            hero.gender = data.gender;
            hero.spriteIndex = data.spriteIndex;
            hero.salary = data.salary;
            hero.gridCol = col;
            hero.gridLane = lane;
            hero.x = BATTLE_BALANCE.gridLayout.playerColsX[col] - hero.width / 2;
            hero.y = BATTLE_BALANCE.gridLayout.lanesY[lane];

            this.gameUnits.push(hero);
        });

        const getSpriteUrl = (data) => {
            if (data.spriteVariations) {
                const r = Math.floor(Math.random() * data.spriteVariations);
                return `${data.spriteUrl.replace(/\.webp$/i, '')}${r}.webp`;
            }
            return data.spriteUrl;
        };

        const encounter = GLASS_FOREST_ENCOUNTERS[GameState.selectedEncounter || 'easy_2'];
        const occupiedEnemy = new Set();

        const placeEnemyInGrid = (preferredCol) => {
            const colOrder = [preferredCol, 0, 1, 2].filter((v, i, a) => a.indexOf(v) === i);
            const laneOrder = [1, 0, 2];
            for (const c of colOrder) {
                for (const l of laneOrder) {
                    const k = `${c}_${l}`;
                    if (!occupiedEnemy.has(k)) {
                        occupiedEnemy.add(k);
                        return { col: c, lane: l };
                    }
                }
            }
            return { col: 0, lane: 1 };
        };

        encounter.units.forEach((enemyId, index) => {
            if (!enemyId) return;
            const eData = GLASS_FOREST_ENEMIES[enemyId];
            if (!eData) return;
            const prof = BATTLE_BALANCE.enemyProfiles[enemyId] || { preferredDepth: 0 };
            const slot = placeEnemyInGrid(prof.preferredDepth);
            const letter = String.fromCharCode(65 + index);

            const enemy = new Unit({
                name: `${eData.name} ${letter}`,
                enemyId,
                side: 'enemy',
                posIdx: slot.col + 1,
                gridCol: slot.col,
                gridLane: slot.lane,
                hp: eData.hp,
                maxHp: eData.hp,
                combat: eData.combat,
                skills: eData.skills,
                spriteUrl: getSpriteUrl(eData),
                scale: eData.scale,
                maxCombo: eData.maxCombo,
                lore: eData.lore,
                tactics: eData.tactics
            });

            enemy.x = BATTLE_BALANCE.gridLayout.enemyColsX[slot.col] - enemy.width / 2;
            enemy.y = BATTLE_BALANCE.gridLayout.lanesY[slot.lane];
            if (enemyId === 'fritta') enemy.addEffect(EFFECTS.SWARM, 3);
            this.gameUnits.push(enemy);
        });

        if (encounter.env) {
            const envData = GLASS_FOREST_ENEMIES[encounter.env];
            const slot = placeEnemyInGrid(2);
            const envUnit = new Unit({
                name: envData.name,
                enemyId: encounter.env,
                side: 'enemy',
                posIdx: slot.col + 1,
                gridCol: slot.col,
                gridLane: slot.lane,
                hp: envData.hp,
                maxHp: envData.hp,
                combat: envData.combat,
                skills: envData.skills,
                isEnvironment: true,
                spriteUrl: getSpriteUrl(envData),
                scale: envData.scale,
                lore: envData.lore,
                tactics: envData.tactics
            });
            envUnit.x = BATTLE_BALANCE.gridLayout.enemyColsX[slot.col] - envUnit.width / 2;
            envUnit.y = BATTLE_BALANCE.gridLayout.lanesY[slot.lane];
            this.gameUnits.push(envUnit);
        }

        this.battleManager = new BattleManager(this.gameUnits, (mgr) => this.updateUI(mgr));
        this.battleManager.logPanel = document.getElementById('b-log-container');
        this.setupInput();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => { if (!overlay.classList.contains('active')) overlay.classList.add('hidden'); }, 1200);
        }

        this.battleManager.startBattle();
    },

    getCellAtPoint(mx, my) {
        const layout = BATTLE_BALANCE.gridLayout;
        const hitW = 190;
        const hitH = 165;

        for (const side of ['player', 'enemy']) {
            const colsX = side === 'player' ? layout.playerColsX : layout.enemyColsX;
            for (let col = 0; col < 3; col++) {
                for (let lane = 0; lane < 3; lane++) {
                    const cx = colsX[col];
                    const fy = layout.lanesY[lane];
                    if (mx >= cx - hitW / 2 && mx <= cx + hitW / 2 && my >= fy - hitH + 20 && my <= fy + 25) {
                        return { side, col, lane };
                    }
                }
            }
        }
        return null;
    },

    setupInput() {
        const canvas = SceneManager.canvas;
        canvas.oncontextmenu = (e) => {
            e.preventDefault();
            if (this.battleManager && this.battleManager.phase === 'TACTICS') {
                this.battleManager.interactionMode = 'IDLE';
                this.battleManager.selectedSkill = null;
                this.updateUI(this.battleManager);
            }
        };

        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.hoveredCell = this.getCellAtPoint(this.mouseX, this.mouseY);
            this.renderInfoPanels();
        };

        canvas.onmousedown = (e) => {
            if (e.button !== 0 || !this.battleManager) return;
            const cell = this.getCellAtPoint(this.mouseX, this.mouseY);
            if (!cell) return;
            const unit = this.gameUnits.find(u => !u.isDead && u.side === cell.side && u.gridCol === cell.col && u.gridLane === cell.lane) || null;
            this.battleManager.handleCellOrUnitClick(cell.side, cell.col, cell.lane, unit);
        };

        document.getElementById('b-btn-move').onclick = () => {
            if (!this.battleManager || this.battleManager.phase !== 'TACTICS' || !this.battleManager.selectedUnit) return;
            this.battleManager.interactionMode = this.battleManager.interactionMode === 'MOVE' ? 'IDLE' : 'MOVE';
            this.battleManager.selectedSkill = null;
            this.updateUI(this.battleManager);
        };

        document.getElementById('b-btn-start-phase').onclick = () => {
            if (this.battleManager && this.battleManager.phase === 'TACTICS') {
                this.battleManager.startAutobattlePhase();
            }
        };

        this.keyDownHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.battleManager && this.battleManager.phase === 'TACTICS') {
                    this.battleManager.startAutobattlePhase();
                }
            } else if (e.key === 'Escape' && this.battleManager) {
                this.battleManager.interactionMode = 'IDLE';
                this.battleManager.selectedSkill = null;
                this.updateUI(this.battleManager);
            }
        };
        window.addEventListener('keydown', this.keyDownHandler);
    },

    updateUI(mgr) {
        if (!mgr) return;
        const isTactics = mgr.phase === 'TACTICS';

        const phaseLabel = document.getElementById('b-phase-label');
        if (phaseLabel) {
            phaseLabel.innerText = isTactics
                ? `РАУНД ${mgr.round} · ФАЗА ТАКТИКИ`
                : (mgr.phase === 'AUTOBATTLE' ? `РАУНД ${mgr.round} · АВТОБОЙ` : 'БОЙ ЗАВЕРШЁН');
            phaseLabel.style.color = isTactics ? 'var(--color-gold)' : 'var(--color-success)';
        }

        const cpEl = document.getElementById('b-player-cp');
        if (cpEl) cpEl.innerText = `⚡ Очки Командования: ${mgr.playerCP}/${mgr.maxPlayerCP}`;

        const timerEl = document.getElementById('b-timer-label');
        if (timerEl) {
            timerEl.innerText = isTactics ? '⏸ ПАУЗА' : `⏱ ${mgr.phaseTimer.toFixed(1)}с`;
            timerEl.style.color = isTactics ? '#ffbf00' : '#4affab';
        }

        const moveBtn = document.getElementById('b-btn-move');
        if (moveBtn) {
            moveBtn.disabled = !isTactics || !mgr.selectedUnit || mgr.playerCP < BATTLE_BALANCE.moveCostCP;
            moveBtn.classList.toggle('active', mgr.interactionMode === 'MOVE');
        }

        const startBtn = document.getElementById('b-btn-start-phase');
        if (startBtn) startBtn.disabled = !isTactics;

        this.renderSkillsRow(mgr);
        this.renderInfoPanels();
        if (mgr.phase === 'ENDED') {
            this.showBattleSummary(mgr);
        }
    },

    showBattleSummary(mgr) {
        if (document.getElementById('b-summary-overlay')) return;
        const isWin = mgr.battleResult === 'VICTORY';
        const overlay = document.createElement('div');
        overlay.id = 'b-summary-overlay';

        const playersHtml = this.gameUnits
            .filter(u => u.side === 'player')
            .map(u => {
                const unconscious = u.hp <= 0 || u.isDead;
                return `
                    <div style="display:flex; justify-content:space-between; padding:6px 8px; background:#1a1612; border:1px solid ${unconscious ? 'var(--color-danger)' : '#444'}; font-size:13px;">
                        <b style="color:#fff;">${u.name}</b>
                        <span>
                            ${unconscious ? '<span style="color:#ff6666;">😵 Без сознания (1 HP после боя)</span>' : `<span style="color:#4affab;">❤️ ${Math.floor(u.hp)}/${u.maxHp}</span>`}
                        </span>
                    </div>
                `;
            }).join('');

        const lootHtml = (mgr.lootEarned && mgr.lootEarned.length > 0)
            ? mgr.lootEarned.map(item => `<span style="padding:4px 8px; background:#1a1612; border:1px solid #4affab; color:#4affab; font-size:12px;">💀 ${item.name}</span>`).join('')
            : '<span style="color:#777; font-size:12px;">Трофеев не получено</span>';

        const logsHtml = (mgr.logs || [])
            .slice()
            .reverse()
            .map(line => `<div style="border-bottom:1px solid #2a241e; padding:3px 0;">${line}</div>`)
            .join('');

        overlay.innerHTML = `
            <div class="b-summary-card" style="border-color:${isWin ? 'var(--color-gold)' : 'var(--color-danger)'};">
                <h2 style="margin:0; font-size:28px; color:${isWin ? 'var(--color-gold)' : 'var(--color-danger)'}; text-transform:uppercase;">
                    ${isWin ? '🏆 Победа в сражении' : '💀 Отряд повержен'}
                </h2>
                <div class="b-summary-cols">
                    <div class="b-summary-col">
                        <div style="font-size:12px; color:var(--color-gold); font-weight:bold; text-transform:uppercase;">Состояние отряда</div>
                        <div style="display:flex; flex-direction:column; gap:6px;">${playersHtml}</div>
                        <div style="font-size:12px; color:#4affab; font-weight:bold; text-transform:uppercase; margin-top:8px;">Собранные трофеи</div>
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">${lootHtml}</div>
                    </div>
                    <div class="b-summary-col">
                        <div style="font-size:12px; color:var(--color-gold); font-weight:bold; text-transform:uppercase;">Полный лог боя</div>
                        <div class="b-summary-log">${logsHtml}</div>
                    </div>
                </div>
                <button id="b-summary-return-btn" class="huge-action-btn ${isWin ? 'btn-success' : 'btn-danger'}" style="width:100%;">
                    ⬇️ ВЕРНУТЬСЯ В ШАХТУ
                </button>
            </div>
        `;

        document.getElementById('ui-battle').appendChild(overlay);
        document.getElementById('b-summary-return-btn').onclick = () => {
            GameState.isReturningFromBattle = true;
            SceneManager.changeScene(ExploreScene);
        };
    },

    renderSkillsRow(mgr) {
        const row = document.getElementById('b-skills-row');
        if (!row) return;
        const u = mgr.selectedUnit;
        if (!u || u.side !== 'player') {
            row.innerHTML = '<span style="color:#777;">Выберите бойца слева для просмотра навыков</span>';
            return;
        }

        const skills = u.getAvailableSkills();
        if (skills.length === 0) {
            row.innerHTML = '<span style="color:#aaa;">Безоружный боец (в автобое бьёт Кулаками). Выдайте оружие в Хабе для активных навыков.</span>';
            return;
        }

        row.innerHTML = '';
        skills.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `skill-btn ${mgr.selectedSkill?.id === s.id ? 'active' : ''}`;
            btn.disabled = mgr.phase !== 'TACTICS' || Boolean(u.queuedAction) || mgr.playerCP < BATTLE_BALANCE.skillCostCP;
            btn.innerHTML = `<b>${s.name}</b><br><small style="color:#aaa;">1 ОЧК. КОМ.</small>`;
            btn.onclick = () => {
                if (s.targetSelf) {
                    mgr.orderSkill(u, s, u);
                } else {
                    mgr.selectedSkill = s;
                    mgr.interactionMode = 'SKILL_TARGET';
                    this.updateUI(mgr);
                }
            };
            row.appendChild(btn);
        });
    },

    renderInfoPanels() {
        const left = document.getElementById('b-info-left');
        const right = document.getElementById('b-info-right');
        if (!left || !right || !this.battleManager) return;

        const sel = this.battleManager.selectedUnit;
        if (sel) {
            const pat = GridPatternResolver.getWeaponPattern(sel);
            const colNames = ['Тыл', 'Центр', 'Фронт'];
            const depth = GridPatternResolver.getDepthFromFront(sel.side, sel.gridCol);
            const validLine = GridPatternResolver.canAttackFromDepth(pat.rangeClass, depth);

            left.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:var(--color-gold); font-size:15px;">${sel.name}</b>
                    <span style="color:#aaa;">${colNames[sel.gridCol]}</span>
                </div>
                <div style="margin-top:4px; color:#ccc;">❤️ ${Math.floor(sel.hp)}/${sel.maxHp} | 💨 ${Math.floor(sel.stamina)}/${sel.maxStamina} | ⚔️ Бой: ${sel.combatStat}</div>
                <div style="margin-top:4px; color:${validLine ? '#4affab' : '#ffaa44'};">
                    Оружие: <b>${sel.equipment?.rightHand ? sel.equipment.rightHand.name : 'Кулаки'}</b> (${pat.rangeClass} / ${pat.shape}, ${pat.attackIntervalSec}с)
                    ${validLine ? '' : ' — ⚠️ Вне дистанции! Сдвиньтесь в фазе тактики.'}
                </div>
            `;
        } else {
            left.innerHTML = '<span style="color:#777;">Кликните по своему бойцу на сетке 3×3</span>';
        }

        const hoveredUnit = this.hoveredCell
            ? this.gameUnits.find(u => !u.isDead && u.side === this.hoveredCell.side && u.gridCol === this.hoveredCell.col && u.gridLane === this.hoveredCell.lane)
            : null;

        if (hoveredUnit && hoveredUnit.side === 'enemy') {
            const intent = hoveredUnit.queuedAction;
            right.innerHTML = `
                <b style="color:#ff6666; font-size:15px;">${hoveredUnit.name}</b> — ❤️ ${Math.floor(hoveredUnit.hp)}/${hoveredUnit.maxHp} | ⚔️ Бой: ${hoveredUnit.combatStat}<br>
                <div style="margin-top:4px; color:#ffbf00;">
                    ${intent ? `⚠️ Намерение: <b>«${intent.skill.name}»</b> ➔ ${intent.target?.name || '?'}` : 'Обычные автоатаки по таймеру'}
                </div>
                <div style="margin-top:4px; color:#888; font-size:11px;">${hoveredUnit.tactics || ''}</div>
            `;
        } else {
            right.innerHTML = '<span style="color:#888;">Наведите на врага, чтобы увидеть его статы и намерение. В фазе тактики используйте 🥾 Движение и навыки, затем жмите ⚔️ В БОЙ.</span>';
        }
    },

    drawGridTiles(ctx) {
        const layout = BATTLE_BALANCE.gridLayout;
        const mgr = this.battleManager;
        const tileW = 180;
        const tileH = 54;

        const sel = mgr?.selectedUnit;
        const previewRes = (sel && !sel.isDead)
            ? GridPatternResolver.resolveAutoAttackTargets(sel, this.gameUnits)
            : null;
        const previewTargets = new Set(previewRes?.targets || []);

        for (const side of ['player', 'enemy']) {
            const colsX = side === 'player' ? layout.playerColsX : layout.enemyColsX;
            const labels = side === 'player' ? ['ТЫЛ', 'ЦЕНТР', 'ФРОНТ'] : ['ФРОНТ', 'ЦЕНТР', 'ТЫЛ'];

            for (let col = 0; col < 3; col++) {
                ctx.fillStyle = 'rgba(255, 191, 0, 0.35)';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(labels[col], colsX[col], 175);

                for (let lane = 0; lane < 3; lane++) {
                    const cx = colsX[col];
                    const fy = layout.lanesY[lane];
                    const x = cx - tileW / 2;
                    const y = fy - tileH / 2 + 12;

                    const isMoveValid = mgr?.interactionMode === 'MOVE' && side === 'player' && sel && mgr.canMoveUnitTo(sel, col, lane);
                    const isHovered = this.hoveredCell && this.hoveredCell.side === side && this.hoveredCell.col === col && this.hoveredCell.lane === lane;
                    const unitHere = this.gameUnits.find(u => !u.isDead && u.side === side && u.gridCol === col && u.gridLane === lane);
                    const isPatternTarget = unitHere && previewTargets.has(unitHere);

                    ctx.save();
                    ctx.fillStyle = isMoveValid
                        ? 'rgba(74, 255, 171, 0.22)'
                        : (isPatternTarget ? 'rgba(255, 68, 68, 0.25)' : 'rgba(20, 16, 12, 0.65)');
                    ctx.strokeStyle = isHovered
                        ? '#ffffff'
                        : (isMoveValid ? '#4affab' : (isPatternTarget ? '#ff4444' : 'rgba(255, 191, 0, 0.25)'));
                    ctx.lineWidth = isHovered || isMoveValid || isPatternTarget ? 2 : 1;

                    ctx.beginPath();
                    ctx.roundRect(x, y, tileW, tileH, 6);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    },

    draw(ctx, canvas) {
        const now = performance.now();
        const dtSec = Math.min(0.1, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;

        if (this.battleManager) {
            this.battleManager.update(dtSec);
        }

        if (this.bgLoaded) {
            ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(10, 8, 6, 0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#0c0a08';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.drawGridTiles(ctx);

        // Сортируем по коридору (сверху вниз), чтобы нижние ряды перекрывали верхние корректно
        const sortedUnits = [...this.gameUnits].sort((a, b) => a.gridLane - b.gridLane);

        sortedUnits.forEach(unit => {
            unit.update();
            if (unit.isDead) return;

            const isSelected = this.battleManager?.selectedUnit === unit;
            const isHovered = this.hoveredCell && this.hoveredCell.side === unit.side && this.hoveredCell.col === unit.gridCol && this.hoveredCell.lane === unit.gridLane;
            unit.drawBody(ctx, isSelected, false, isHovered);
            unit.drawUI(ctx, 0, 0);

            // Полоска таймера автоатаки + значок намерения / заказанного навыка
            const pat = GridPatternResolver.getWeaponPattern(unit);
            const barW = 75;
            const barX = unit.x + (unit.width - barW) / 2;
            if (!unit.isEnvironment && pat.attackIntervalSec < 100) {
                const atkPct = Math.min(1, unit.attackTimer / pat.attackIntervalSec);
                ctx.fillStyle = '#1e1a15';
                ctx.fillRect(barX, unit.y + 23, barW, 4);
                ctx.fillStyle = '#ffbf00';
                ctx.fillRect(barX, unit.y + 23, barW * atkPct, 4);
            }

            if (unit.queuedAction) {
                ctx.save();
                ctx.fillStyle = unit.side === 'enemy' ? '#ff4444' : '#4affab';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`⚡ ${unit.queuedAction.skill.name}`, unit.x + unit.width / 2, unit.y - unit.height - 8);
                ctx.restore();
            }
        });

        if (this.battleManager && this.battleManager.attackTraces.length > 0) {
            this.battleManager.attackTraces.forEach(tr => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, tr.life / tr.maxLife);
                ctx.strokeStyle = tr.color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(tr.x1, tr.y1);
                ctx.lineTo(tr.x2, tr.y2);
                ctx.stroke();
                ctx.restore();
            });
        }

        this.damageTexts = this.damageTexts.filter(t => t.life > 0);
        this.damageTexts.forEach(t => {
            t.y -= 1.2;
            t.life--;
            ctx.fillStyle = t.color;
            ctx.font = 'bold 28px Arial';
            ctx.fillText(t.text, t.x, t.y);
        });
    },

    destroy() {
        document.getElementById('ui-battle').innerHTML = '';
        document.getElementById('ui-battle').classList.add('hidden');
        SceneManager.canvas.onmousedown = null;
        SceneManager.canvas.onmousemove = null;
        SceneManager.canvas.oncontextmenu = null;
        if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 55 });
};
window.BattleScene = BattleScene;
