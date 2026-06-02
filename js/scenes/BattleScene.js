import { BattleManager } from '../managers/battleSceneManagers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { /*test_weapon*/ swords } from '../data/battleData/weapon.js';
import { GLASS_FOREST_ENEMIES, GLASS_FOREST_ENCOUNTERS } from '../data/battleData/enemies.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { EFFECTS } from '../data/battleData/effects.js';
import { BattleRenderHelper } from '../managers/battleSceneManagers/BattleRenderHelper.js';
import { BattleUIManager } from '../managers/battleSceneManagers/BattleUIManager.js';

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoverQueueUnit: null,
    hoveredObject: null, 

    lastHoverTarget: null,
    lastSkillId: null,
    lastHoveredObjRef: null,
    cachedExpectedDmg: 0,
    cachedAoeTargets: [],
    isHoveringValidTarget: false,

    init() {
        console.log("Бой начался!");
        BattleRenderHelper.applyPatches();

        const uiBase = document.getElementById('ui-battle');
        uiBase.classList.remove('hidden');
        
        uiBase.innerHTML = `
            <div id="b-top-bar">
                <div id="b-turn-display" style="margin-top:5px; color:#ffbf00; font-size:11px; font-weight:bold;">РАУНД 1</div>
                <div id="b-turn-queue"></div> 
            </div>
            <button id="b-log-btn" class="hub-btn">ЛОГ</button>
            <div id="b-log-container" class="hidden"></div>
            <div id="b-bottom-bar">
                <div id="b-btn-move" class="b-action-tab">ДВИЖЕНИЕ</div>
                <div id="b-main-area">
                    <div id="b-info-row">
                        <div id="b-info-left" class="b-info-block"></div>
                        <div id="b-info-right" class="b-info-block"></div>
                    </div>
                    <div id="b-skills-row"></div>
                </div>
                <div id="b-btn-rest" class="b-action-tab">ОТДЫХ</div>
            </div>
        `;

        document.getElementById('b-log-btn').onclick = () => document.getElementById('b-log-container').classList.toggle('hidden');
        this.gameUnits = []; this.damageTexts = []; this.hoveredObject = null; this.hoverQueueUnit = null;
        this.lastHoverTarget = null; this.lastSkillId = null; this.lastHoveredObjRef = null;

        this.bgImage = new Image();
        this.bgLoaded = false;
        let bgRand = Math.floor(Math.random() * 6);
        this.bgImage.onload = () => { this.bgLoaded = true; };
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgRand}.png`;

        let activePos = 1;
        GameState.currentSquad.forEach((data) => {
            if (!data) return; 
            if (data.hp <= 0) return; 
            
            const hero = new Adventurer(data, activePos);
            Object.assign(hero, data); 
            
            if (!hero.equipment.rightHand) hero.equip('rightHand', swords.rustySword);
            this.gameUnits.push(hero);
            activePos++;
        });

        const getSpriteUrl = (data) => {
            if (data.spriteVariations) {
                let r = Math.floor(Math.random() * data.spriteVariations);
                return `${data.spriteUrl.replace(/\.png$/i, '')}${r}.png`;
            }
            return data.spriteUrl; 
        };

        const encounter = GLASS_FOREST_ENCOUNTERS[GameState.selectedEncounter || 'boss_mother'];
        
        if (encounter.env) {
            let envData = GLASS_FOREST_ENEMIES[encounter.env];
            this.gameUnits.push(new Unit({ 
                name: envData.name, side: 'enemy', posIdx: 0, 
                hp: envData.hp, maxHp: envData.hp, 
                combat: envData.combat, skills: envData.skills,
                isEnvironment: true,
                spriteUrl: getSpriteUrl(envData),
                scale: envData.scale,
                lore: envData.lore,
                tactics: envData.tactics,
            }));
        }

        encounter.units.forEach((enemyId, index) => {
            if (enemyId) {
                let eData = GLASS_FOREST_ENEMIES[enemyId];
                let pos = index + 1;
                let letter = String.fromCharCode(65 + index); 
                
                const newEnemy = new Unit({ 
                    name: `${eData.name} ${letter}`, side: 'enemy', posIdx: pos, 
                    hp: eData.hp, maxHp: eData.hp, combat: eData.combat, skills: eData.skills,
                    spriteUrl: getSpriteUrl(eData), scale: eData.scale, maxCombo: eData.maxCombo,
                    lore: eData.lore, tactics: eData.tactics,
                });

                if (enemyId === 'fritta') newEnemy.addEffect(EFFECTS.SWARM, 3);
                this.gameUnits.push(newEnemy);
            }
        });

        this.battleManager = new BattleManager(this.gameUnits, (a, s, m) => this.updateUI(a, s, m));
        this.battleManager.logPanel = document.getElementById('b-log-container');
        this.setupInput();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => { if (!overlay.classList.contains('active')) overlay.classList.add('hidden'); }, 1200);
        }

        this.battleManager.startBattle();
    },

    renderTurnQueue() {
        BattleUIManager.renderTurnQueue(this);
    },

    updateUI(activeUnit, skills, manager) {
        BattleUIManager.updateSkillsPanel(this, activeUnit, skills, manager);
    },

    setupInput() {
        const canvas = SceneManager.canvas;
        canvas.oncontextmenu = (e) => { e.preventDefault(); this.cancelCurrentAction(); };
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.updateStateAndDOM();
        };
        canvas.onmousedown = (e) => {
            if (e.button !== 0) return; 
            if (this.hoverQueueUnit) { this.battleManager.handleCanvasClick(this.hoverQueueUnit); return; }
            this.gameUnits.forEach(u => { if (u.isClicked(this.mouseX, this.mouseY)) this.battleManager.handleCanvasClick(u); });
        };

        this.keyDownHandler = (e) => {
            if (e.key === ' ' || e.code === 'Space') e.preventDefault();
            if (e.key === 'Escape') { this.cancelCurrentAction(); return; }

            let active = this.battleManager ? this.battleManager.getActiveUnit() : null;
            if (!active || active.side !== 'player' || this.battleManager.state === 'EXECUTING') return;

            const mBtn = document.getElementById('b-btn-move');
            const rBtn = document.getElementById('b-btn-rest');
            const skillsRow = document.getElementById('b-skills-row');

            if (e.key === 'p' && mBtn && mBtn.style.opacity === '1') mBtn.click();
            else if ((e.key === ' ' || e.code === 'Space') && rBtn && rBtn.style.opacity === '1') rBtn.click();
            else if (['1','2','3','4','5','6','7','8','9','0'].includes(e.key)) {
                let idx = e.key === '0' ? 9 : parseInt(e.key) - 1;
                if (skillsRow && skillsRow.children.length > idx) {
                    let btn = skillsRow.children[idx];
                    if (!btn.disabled) btn.click();
                }
            }
        };
        window.addEventListener('keydown', this.keyDownHandler);
    },

    cancelCurrentAction() {
        if (!this.battleManager || this.battleManager.state === 'EXECUTING') return;
        let active = this.battleManager.getActiveUnit();
        if (active && active.side === 'player') {
            this.battleManager.selectedSkill = null; this.battleManager.state = 'IDLE'; 
            this.updateUI(active, active.getAvailableSkills(), this.battleManager);
        }
    },

    updateStateAndDOM() {
        BattleUIManager.updateInfoPanels(this);
    },

    draw(ctx, canvas) {
        if (this.bgLoaded) {
            ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(12, 10, 8, 0.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height);

            let floorGradient = ctx.createLinearGradient(0, 680, 0, canvas.height);
            floorGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            floorGradient.addColorStop(0.1, "rgba(10, 8, 6, 0.7)");
            floorGradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
            
            ctx.fillStyle = floorGradient; ctx.fillRect(0, 680, canvas.width, canvas.height - 680);
        } else {
            ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (this.cachedAoeTargets.length > 1) {
            this.cachedAoeTargets.sort((a, b) => a.x - b.x);
            let first = this.cachedAoeTargets[0]; let last = this.cachedAoeTargets[this.cachedAoeTargets.length - 1];
            let centerY = first.y - (first.height / 2); 
            ctx.save();
            ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000'; ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(first.x + first.width/2, centerY); ctx.lineTo(last.x + last.width/2, centerY); ctx.stroke();
            ctx.restore();
        }

        if (this.battleManager) {
            let active = this.battleManager.getActiveUnit();
            let s = active && this.battleManager.state === 'SELECT_TARGET' ? this.battleManager.selectedSkill : null;
            let currentTargetPos = s ? (s.targetPos || []) : [];
            if (s && s.id === 'buckshot' && this.lastHoverTarget) {
                currentTargetPos = this.lastHoverTarget.posIdx === 1 ? [1, 2] : (this.lastHoverTarget.posIdx === 3 ? [2, 3] : [1, 2]);
            }

            let unitsToDraw = [...this.gameUnits].sort((a, b) => {
                if (a.isEnvironment && !b.isEnvironment) return -1;
                if (!a.isEnvironment && b.isEnvironment) return 1;
                return b.posIdx - a.posIdx; 
            });

            unitsToDraw.forEach(unit => {
                unit.update();
                let isP = false; 
                if (s) {
                    if (s.targetSelf) isP = (unit === active);
                    else if (s.targetAny) isP = currentTargetPos.includes(unit.posIdx);
                    else if (s.targetAlly) isP = (unit.side === active.side && currentTargetPos.includes(unit.posIdx));
                    else isP = (unit.side !== active.side && currentTargetPos.includes(unit.posIdx)) || (unit.isEnvironment && s.damageCoef > 0);
                } else if (active && this.battleManager.state === 'SELECT_MOVE') {
                    isP = (unit.side === active.side && unit !== active && Math.abs(unit.posIdx - active.posIdx) === 1);
                }

                let isActuallyHovered = this.isHoveringValidTarget && this.cachedAoeTargets.length > 0 
                    ? (this.cachedAoeTargets.includes(unit) || (this.lastHoverTarget?.isEnvironment && unit.isEnvironment))
                    : (unit === this.lastHoverTarget);

                unit.drawBody(ctx, active === unit, isP, isActuallyHovered);
                unit._tempExpectedDmg = (isActuallyHovered && this.isHoveringValidTarget) ? this.cachedExpectedDmg : 0;
            });

            unitsToDraw.forEach(unit => {
                let stPred = (unit === active) ? this.cachedExpectedStamina : 0;
                unit.drawUI(ctx, unit._tempExpectedDmg, stPred);
            });
        }

        this.damageTexts = this.damageTexts.filter(t => t.life > 0);
        this.damageTexts.forEach(t => { t.y -= 1.5; t.life--; ctx.fillStyle = t.color; ctx.font = "bold 40px Arial"; ctx.fillText(t.text, t.x, t.y); });
        this.drawEffectTooltip(ctx);
    },

    drawEffectTooltip(ctx) {
        let hEff = null; let hx = 0; let hy = 0;
        this.gameUnits.forEach(unit => {
            if (!unit.isDead && unit.effectHitboxes) {
                unit.effectHitboxes.forEach(box => {
                    if (this.mouseX >= box.x && this.mouseX <= box.x + box.width && this.mouseY >= box.y && this.mouseY <= box.y + box.height) { hEff = box.data; hx = box.x; hy = box.y; }
                });
            }
        });
        if (hEff) {
            ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
                let words = text.split(' '); let line = ''; let currentY = y;
                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    if (context.measureText(testLine).width > maxWidth && n > 0) { context.fillText(line, x, currentY); line = words[n] + ' '; currentY += lineHeight; }
                    else { line = testLine; }
                }
                context.fillText(line, x, currentY); return currentY + lineHeight;
            };
            const boxW = 240; const startX = hx + 15; const startY = hy - 90;
            let title = hEff.base.name.toUpperCase(); let desc = hEff.base.description || "";
            let stats = hEff.base.id === 'dot' ? `Урон: ${hEff.damagePerTurn || 2} | Ходов: ${hEff.duration}` : `Жетонов: ${hEff.count} | Ходов: ${hEff.duration || '∞'}`;
            ctx.font = "12px Arial";
            let boxH = wrapText(ctx, desc, 0, -1000, boxW - 20, 16) + 50 - (-1000); 
            ctx.fillStyle = "rgba(10, 8, 5, 0.95)"; ctx.strokeStyle = "#ffbf00"; ctx.lineWidth = 1;
            ctx.fillRect(startX, startY, boxW, boxH); ctx.strokeRect(startX, startY, boxW, boxH);
            ctx.fillStyle = "#ffbf00"; ctx.font = "bold 13px Arial"; ctx.fillText(title, startX + 10, startY + 20);
            ctx.fillStyle = "#aaa"; ctx.font = "12px Arial";
            let nextY = wrapText(ctx, desc, startX + 10, startY + 40, boxW - 20, 16);
            ctx.fillStyle = "#ff6666"; ctx.font = "bold 12px Arial"; ctx.fillText(stats, startX + 10, nextY + 5);
            ctx.restore();
        }
    },

    destroy() {
        document.getElementById('ui-battle').innerHTML = '';
        document.getElementById('ui-battle').classList.add('hidden');
        SceneManager.canvas.onmousedown = null;
        SceneManager.canvas.onmousemove = null;
        if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 60 });
};

window.BattleScene = BattleScene;
