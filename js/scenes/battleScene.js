import { BattleManager } from '../managers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { test_weapon } from '../data/battleData/weapon.js';
import { GLASS_FOREST_ENEMIES } from '../data/battleData/enemies.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { BattleUIHelper } from '../managers/BattleUIHelper.js';

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoverQueueUnit: null,
    hoveredObject: null, 

    init() {
        console.log("Бой начался!");
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

        GameState.currentSquad.forEach((data, index) => {
            const hero = new Adventurer(data, index + 1);
            if (!hero.equipment.rightHand) hero.equip('rightHand', test_weapon.debugSword);
            this.gameUnits.push(hero);
        });

        for (let i = 1; i <= 4; i++) {
            this.gameUnits.push(new Unit({ 
                name: `Фритта ${String.fromCharCode(64+i)}`, side: 'enemy', posIdx: i, 
                hp: GLASS_FOREST_ENEMIES.fritta.hp, maxHp: GLASS_FOREST_ENEMIES.fritta.hp, 
                combat: GLASS_FOREST_ENEMIES.fritta.combat, skills: GLASS_FOREST_ENEMIES.fritta.skills 
            }));
        }

        this.battleManager = new BattleManager(this.gameUnits, (a, s, m) => this.updateUI(a, s, m));
        this.battleManager.logPanel = document.getElementById('b-log-container');
        this.setupInput();
        this.battleManager.startBattle();
    },

    renderTurnQueue() {
        const container = document.getElementById('b-turn-queue');
        if (!container || !this.battleManager) return;
        container.innerHTML = this.battleManager.turnQueue.map((unit, index) => {
            const sideClass = unit.side === 'player' ? 'player' : 'enemy';
            const activeClass = index === 0 ? 'active' : '';
            const isHov = this.hoverQueueUnit === unit ? 'hover-highlight' : '';
            return `<div class="queue-item ${sideClass} ${activeClass} ${isHov}" data-name="${unit.name}"
                        onmouseenter="BattleScene.hoverQueueUnit = BattleScene.gameUnits.find(u => u.name === '${unit.name}')" 
                        onmouseleave="BattleScene.hoverQueueUnit = null">
                        ${unit.name.substring(0, 5)}
                    </div>`;
        }).join('');
    },

    updateUI(activeUnit, skills, manager) {
        this.renderTurnQueue();
        const skillsRow = document.getElementById('b-skills-row');
        if (!skillsRow) return;
        skillsRow.innerHTML = '';
        
        if (!activeUnit || activeUnit.side !== 'player' || manager.state === 'EXECUTING') return;

        const mBtn = document.getElementById('b-btn-move');
        mBtn.onclick = () => manager.selectMoveAction();
        mBtn.onmouseenter = () => this.hoveredObject = { type: 'skill', data: { name: "Движение", description: "Смена позиции с соседним союзником.", isMove: true } };
        mBtn.onmouseleave = () => this.hoveredObject = null;

        const rBtn = document.getElementById('b-btn-rest');
        rBtn.onclick = () => manager.performRest();
        rBtn.onmouseenter = () => this.hoveredObject = { type: 'skill', data: { name: "Отдых", description: "Пропуск хода для восстановления сил.", isRest: true } };
        rBtn.onmouseleave = () => this.hoveredObject = null;

        const baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;
        const effectiveBase = activeUnit.equipment?.leftHand === null ? Math.round(baseDmg * 1.3) : baseDmg;

        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            if (manager.selectedSkill?.id === skill.id) btn.classList.add('active');
            btn.innerText = skill.name; 
            
            let isPosValid = skill.validPos?.includes(activeUnit.posIdx);
            let hasTarget = false;
            
            if (skill.targetSelf) {
                hasTarget = true; 
            } else if (skill.targetAny) {
                hasTarget = true; // Можно кидать в кого угодно
            } else {
                const targetSide = skill.targetAlly ? activeUnit.side : (activeUnit.side === 'player' ? 'enemy' : 'player');
                hasTarget = this.gameUnits.some(u => !u.isDead && u.side === targetSide && skill.targetPos?.includes(u.posIdx));
            }

            let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt'].includes(skill.id);
            let hasAmmo = activeUnit.hasEffect('ammo');
            
            let isVulnerableSpotValid = true;
            if (skill.id === 'vulnerableSpot') {
                isVulnerableSpotValid = activeUnit.hasEffect('combo') || this.gameUnits.some(u => u.side !== activeUnit.side && !u.isDead && u.hasEffect('mark'));
            }

            if (!isPosValid || !hasTarget || (needsAmmo && !hasAmmo) || !isVulnerableSpotValid) {
                btn.disabled = true;
            }

            if (skill.id === 'allInThisStrike') {
                const controlEffects = ['stun', 'daze', 'fear', 'inWeb', 'instability'];
                if (activeUnit.activeEffects.some(e => controlEffects.includes(e.base.id))) isPosValid = false; 
            }

            if (!isPosValid || !hasTarget) btn.disabled = true;
            
            let finalDmg = Math.round(effectiveBase * (skill.damageCoef || 0));
            
            btn.onclick = () => manager.selectSkill(skill);
            btn.onmouseenter = () => this.hoveredObject = { type: 'skill', data: { ...skill, finalDmg } };
            btn.onmouseleave = () => this.hoveredObject = null;
            
            skillsRow.appendChild(btn);
        });
    },

    setupInput() {
        const canvas = SceneManager.canvas;
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        };
        canvas.onmousedown = () => {
            if (this.hoverQueueUnit) { this.battleManager.handleCanvasClick(this.hoverQueueUnit); return; }
            this.gameUnits.forEach(u => { if (u.isClicked(this.mouseX, this.mouseY)) this.battleManager.handleCanvasClick(u); });
        };
    },

    draw(ctx, canvas) {
        ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255, 191, 0, 0.3)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 200); ctx.lineTo(canvas.width/2, 800); ctx.stroke();

        let hFieldU = null;
        this.gameUnits.forEach(u => { if (u.isClicked(this.mouseX, this.mouseY)) hFieldU = u; });

        document.querySelectorAll('.queue-item').forEach(el => el.classList.remove('hover-highlight'));
        const target = hFieldU || this.hoverQueueUnit;
        if (target) {
            const el = document.querySelector(`.queue-item[data-name="${target.name}"]`);
            if (el) el.classList.add('hover-highlight');
        }

        let active = this.battleManager ? this.battleManager.getActiveUnit() : null;

        // ПРЕДВАРИТЕЛЬНЫЙ ПРОСЧЕТ ПРОГНОЗА И АОЕ (ДО отрисовки юнитов)
        let predictionHTML = null;
        let globalExpectedDmg = 0;
        let isHoveringAoE = false;
        let hoveredAoESide = null;

        if (active && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill && target && !target.isDead) {
            let s = this.battleManager.selectedSkill;
            let isP = false;
            
            if (s.targetSelf) { if (target === active) isP = true; }
            else if (s.targetAny) { if (s.targetPos?.includes(target.posIdx)) isP = true; }
            else if (s.targetAlly) { if (target.side === active.side && s.targetPos?.includes(target.posIdx)) isP = true; }
            else { if (target.side !== active.side && s.targetPos?.includes(target.posIdx)) isP = true; }

            if (isP) {
                let pred = this.battleManager.getPrediction(active, target, s);
                globalExpectedDmg = pred.expectedDamage; 

                let top3 = pred.list.slice(0, 3);
                let listHTML = top3.map(p => {
                            let effsStr = pred.simSkill.effect || '';
                            if (pred.simSkill.id === 'flareBolt') effsStr = (unit.side === active.side) ? 'ally taunt-1' : 'vulnerable-1, mark-1'; 
                            if (pred.simSkill.id === 'duck') effsStr = ''; 
                            if (pred.simSkill.id === 'invigoratingRicochet') effsStr = 'weakness-1'; 

                            let isTargetSusceptible = target.hasEffect('susceptibility');

                            let translated = [];
                            if (effsStr && p.type !== "ПРОМАХ") {
                                let filteredEffects = effsStr.split(',')
                                    .filter(eff => !eff.trim().toLowerCase().startsWith('self ') && !eff.trim().toLowerCase().startsWith('ally '))
                                    .join(',');
                                translated = BattleUIHelper.translateEffect(filteredEffects, p.isL, p.isU, p.isC, isTargetSusceptible);
                            }

                            if (pred.simSkill.moveTarget && target !== active && p.type !== "ПРОМАХ") {
                                let dir = pred.simSkill.moveTarget > 0 ? 'Назад' : 'Вперед';
                                translated.push(`<span class="tt-move">${dir} ${Math.abs(pred.simSkill.moveTarget)}</span>`);
                            }

                            let effsHTML = translated.length > 0 ? translated.join(', ') : '<span style="color:#666">Нет эффектов</span>';
                            let hitsStr = p.hits > 1 ? `<span style="font-size:10px; color:#888; margin-left:4px;">(${p.hits}x${p.singleDmg})</span>` : '';

                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:12px; background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 4px; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                            <span style="color:${p.color}; min-width: 85px; font-weight:bold;">${p.type} <span style="font-size:10px; color:#aaa">(${p.prob}%)</span></span>
                            <span style="flex:1; color:#ccc; font-size:11px; margin: 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align:center;">${effsHTML}</span>
                            <span style="text-align:right; min-width: 80px;">
                                ${p.formula || ''}
                                <span style="color:#ff4444; font-weight:bold; font-size: 13px;">-${p.totalDmg} HP</span>
                                ${hitsStr}
                            </span>
                        </div>`;
                }).join('');

                predictionHTML = `
                    <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding: 0 10px;">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:42px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 8px;">ПРОГНОЗ</div>
                        <div style="position:relative; z-index:1;">${listHTML}</div>
                    </div>
                `;
                
                if (s.isAoE) {
                    isHoveringAoE = true;
                    hoveredAoESide = target.side;
                }
            }
        }

        // Отрисовка красной линии АоЕ
        if (isHoveringAoE && active && this.battleManager.selectedSkill?.isAoE) {
            let s = this.battleManager.selectedSkill;
            let aoeTargets = this.gameUnits.filter(u => u.side === hoveredAoESide && !u.isDead && s.targetPos.includes(u.posIdx));
            if (aoeTargets.length > 1) {
                aoeTargets.sort((a, b) => a.x - b.x);
                let first = aoeTargets[0]; let last = aoeTargets[aoeTargets.length - 1];
                let centerY = first.y + first.height / 2;
                ctx.save();
                ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000';
                ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 6;
                ctx.beginPath(); ctx.moveTo(first.x + first.width/2, centerY); ctx.lineTo(last.x + last.width/2, centerY); ctx.stroke();
                ctx.lineWidth = 4; const capH = 15;
                ctx.beginPath(); ctx.moveTo(first.x + 5, centerY - capH); ctx.lineTo(first.x - 5, centerY); ctx.lineTo(first.x + 5, centerY + capH); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(last.x + last.width - 5, centerY - capH); ctx.lineTo(last.x + last.width + 5, centerY); ctx.lineTo(last.x + last.width - 5, centerY + capH); ctx.stroke();
                ctx.restore();
            }
        }

        const leftBox = document.getElementById('b-info-left');
        const rightBox = document.getElementById('b-info-right');

        if (this.battleManager) {
            this.gameUnits.forEach(unit => {
                unit.update();
                let isP = false;
                let dmgToDraw = 0;

                if (active && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill) {
                    let s = this.battleManager.selectedSkill;
                    if (s.targetSelf) { if (unit === active) isP = true; }
                    else if (s.targetAny) { if (s.targetPos?.includes(unit.posIdx)) isP = true; }
                    else if (s.targetAlly) { if (unit.side === active.side && s.targetPos?.includes(unit.posIdx)) isP = true; }
                    else { if (unit.side !== active.side && s.targetPos?.includes(unit.posIdx)) isP = true; }

                    if (predictionHTML) {
                        if (s.isAoE && isHoveringAoE) {
                            if (unit.side === hoveredAoESide && s.targetPos?.includes(unit.posIdx)) dmgToDraw = globalExpectedDmg;
                        } else if (!s.isAoE && unit === target) {
                            dmgToDraw = globalExpectedDmg;
                        }
                    }
                } else if (active && this.battleManager.state === 'SELECT_MOVE') {
                    if (unit.side === active.side && unit !== active && Math.abs(unit.posIdx - active.posIdx) === 1) isP = true;
                }

                // ИСПРАВЛЕНИЕ: Если АоЕ, подсвечиваем КРАСНОЙ РАМКОЙ всех юнитов в АоЕ
                let isActuallyHovered = (unit === target);
                if (isHoveringAoE && isP && unit.side === hoveredAoESide) isActuallyHovered = true;

                unit.draw(ctx, active === unit, isP, isActuallyHovered, dmgToDraw);
            });
        }

        if (leftBox && rightBox) {
            if (predictionHTML && target) {
                leftBox.innerHTML = predictionHTML;
                rightBox.innerHTML = target.getTooltipHTML();
            } 
            else if (this.hoveredObject?.type === 'skill') {
                if (this.hoveredObject.data.isMove || this.hoveredObject.data.isRest) {
                    leftBox.innerHTML = `
                        <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:42px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 8px;">ДЕЙСТВИЕ</div>
                            <div style="position:relative; z-index:1; text-align:center;">
                                <h4 style="color:#ffbf00; margin:0 0 10px 0; text-transform:uppercase;">${this.hoveredObject.data.name}</h4>
                                <div style="color:#aaa; font-size:13px; line-height:1.4;">${this.hoveredObject.data.description}</div>
                            </div>
                        </div>`;
                    rightBox.innerHTML = '';
                } else {
                    const info = BattleUIHelper.getSkillDetailedHTML(this.hoveredObject.data, active);
                    leftBox.innerHTML = info.leftHTML; 
                    rightBox.innerHTML = info.rightHTML;
                }
            } 
            else if (target) {
                if (target.side === 'player') {
                    leftBox.innerHTML = target.getTooltipHTML();
                    rightBox.innerHTML = target.getEquipmentHTML();
                } else {
                    leftBox.innerHTML = `
                        <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:48px; font-weight:900; color:rgba(255,191,0,0.03); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 8px;">АНАЛИЗ</div>
                            <div style="position:relative; z-index:1; color:#555; text-align:center; font-weight:bold; letter-spacing:2px; font-size:14px;">ОЖИДАНИЕ ДЕЙСТВИЙ...</div>
                        </div>`;
                    rightBox.innerHTML = target.getTooltipHTML();
                }
            } else {
                leftBox.innerHTML = ''; rightBox.innerHTML = '';
            }
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
        }
    },

    destroy() {
        document.getElementById('ui-battle').innerHTML = '';
        document.getElementById('ui-battle').classList.add('hidden');
        SceneManager.canvas.onmousedown = null;
        SceneManager.canvas.onmousemove = null;
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 60 });
};

window.BattleScene = BattleScene;