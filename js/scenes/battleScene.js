import { BattleManager } from '../managers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { test_weapon } from '../data/battleData/weapon.js';
import { GLASS_FOREST_ENEMIES } from '../data/battleData/enemies.js';
import { EFFECTS } from '../data/battleData/effects.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoverQueueUnit: null,
    hoveredSkillBtn: null, 

    init() {
        console.log("Бой начался!");
        document.getElementById('ui-battle').classList.remove('hidden');
        this.gameUnits = []; this.damageTexts = []; this.hoveredSkillBtn = null; this.hoverQueueUnit = null;
        
        let tt = document.getElementById('battle-tooltip');
        if (!tt) {
            tt = document.createElement('div'); tt.id = 'battle-tooltip'; tt.className = 'hidden';
            document.getElementById('game-container').appendChild(tt); 
        }

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
        this.setupInput();
        this.battleManager.startBattle();
    },

    getRangeHTML(skill) {
        if (skill.isMove) return `<div style="color:#aaa; text-align: center; margin: 5px 0;">Обмен позицией с соседним союзником</div>`;
        let validHTML = ''; let targetHTML = '';
        const validPos = skill.validPos || [1,2,3,4];
        const targetPos = skill.targetPos || [1,2,3,4];
        for (let i = 4; i >= 1; i--) validHTML += `<div class="pos-dot ${validPos.includes(i) ? 'yellow' : ''}"></div>`;
        if (!skill.targetSelf) {
            let dots = '';
            let minT = Math.min(...targetPos); let maxT = Math.max(...targetPos);
            for (let i = 1; i <= 4; i++) {
                let colorClass = skill.targetAlly ? 'green' : 'red';
                dots += `<div class="pos-dot ${targetPos.includes(i) ? colorClass : ''} aoe-dot"></div>`;
            }
            if (skill.isAoE) {
                const start = (minT - 1) * 16 + 2; const w = (maxT - minT) * 16 + 8;
                targetHTML = `<div class="aoe-line-container"><div class="aoe-line" style="left:${start}px; width:${w}px;"></div>${dots}</div>`;
            } else targetHTML = `<div class="pos-group">${dots}</div>`;
        }
        let arrow = skill.targetSelf ? '' : `<span style="color:#555">»</span>`;
        return `<div class="pos-container"><div class="pos-group">${validHTML}</div>${arrow}${targetHTML}</div>`;
    },

    translateEffect(effectString) {
        if (!effectString) return [];
        let translated = [];
        effectString.split(',').forEach(part => {
            let p = part.trim();
            if (p.toLowerCase().startsWith('self ')) p = p.substring(5).trim();
            const params = p.split('-');
            let id = params[0].toUpperCase();
            const effectBase = EFFECTS[id];
            if (id === 'DOT') translated.push(`Кровотечение (${params[2] || 2} ур/ход)`);
            else if (effectBase) translated.push(`${effectBase.name} (${params[1] || 1})`);
            else translated.push(`${params[0]} (${params[1] || 1})`);
        });
        return translated; 
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

    updateUI(activeUnit, skills, manager) {
        const skillsPanel = document.getElementById('skills-panel');
        const turnInfo = document.getElementById('turn-info');
        skillsPanel.innerHTML = '';
        this.hoveredSkillBtn = null;
        if (!activeUnit || activeUnit.side !== 'player' || manager.state === 'EXECUTING') {
            turnInfo.innerText = activeUnit?.side === 'enemy' ? "ХОД ПРОТИВНИКА" : "...";
            return;
        }
        turnInfo.innerText = `Ход: ${activeUnit.name.split(' ')[0]}\n(Поз: ${activeUnit.posIdx})`;
        let mBtn = document.createElement('button');
        mBtn.className = 'skill-btn';
        if (manager.state === 'SELECT_MOVE') mBtn.classList.add('active');
        mBtn.innerText = 'ДВИЖЕНИЕ';
        mBtn.onmousemove = (e) => this.showTooltip(e, { name: "ДВИЖЕНИЕ", isMove: true, description: "Смена позиции с соседним союзником." });
        mBtn.onmouseout = () => this.hideTooltip();
        mBtn.onclick = () => manager.selectMoveAction();
        skillsPanel.appendChild(mBtn);
        const baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;
        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            if (manager.selectedSkill?.id === skill.id) btn.classList.add('active');
            btn.innerText = skill.name; 
            if (!skill.validPos?.includes(activeUnit.posIdx)) btn.disabled = true;
            let finalDmg = Math.round(baseDmg * (skill.damageCoef || 0));
            btn.onclick = () => manager.selectSkill(skill);
            btn.onmousemove = (e) => this.showTooltip(e, { ...skill, finalDmg });
            btn.onmouseout = () => this.hideTooltip();
            skillsPanel.appendChild(btn);
        });
    },

    showTooltip(e, skill) {
        const tt = document.getElementById('battle-tooltip');
        tt.classList.remove('hidden');
        const cRect = document.getElementById('game-container').getBoundingClientRect();
        tt.style.left = (e.clientX - cRect.left + 20) + 'px';
        tt.style.top = (e.clientY - cRect.top - 200) + 'px';

        const baseDmg = this.battleManager?.getActiveUnit()?.equipment?.rightHand?.baseDamage || 10;
        const formatReward = (reward) => {
            if (!reward) return "";
            if (typeof reward === 'string') return reward;
            let p = [];
            if (reward.damageCoef) p.push(`Урон: ${skill.hits > 1 ? skill.hits+' x ' : ''}${Math.round(baseDmg * reward.damageCoef)}`);
            if (reward.effect) p.push(...this.translateEffect(reward.effect));
            if (reward.moveSelf) p.push(`Боец: ${reward.moveSelf > 0 ? 'Назад' : 'Вперед'} ${Math.abs(reward.moveSelf)}`);
            if (reward.moveTarget) p.push(`Цель: ${reward.moveTarget > 0 ? 'Назад' : 'Вперед'} ${Math.abs(reward.moveTarget)}`);
            return p.join(', ');
        };

        if (skill.isMove) {
            tt.innerHTML = `<h4>${skill.name}</h4><div class="tt-divider"></div><div class="tt-desc">${skill.description}</div>`;
            return;
        }

        let html = `<h4>${skill.name}</h4>`;
        if (skill.type && skill.type !== 'none') {
            html += `<div class="tt-type">${skill.type === 'melee' ? '🗡 Ближний бой' : '🏹 Дальний бой'}</div><div class="tt-divider"></div>`;
        }
        html += this.getRangeHTML(skill) + `<div class="tt-divider"></div>`;

        if (skill.uniqueCondition) {
            let rwd = formatReward(skill.uniqueConditionReward);
            html += `<div class="tt-condition"><b>Условие:</b> ${skill.uniqueCondition}</div>`;
            if (rwd) html += `<div class="tt-reward-line"><b>Награда:</b> ${rwd}</div>`;
            html += `<div class="tt-divider"></div>`;
        }

        let selfActions = []; 
        let targetActions = [];
        let battleParts = [];

        if (skill.finalDmg > 0) battleParts.push(`<div class="tt-dmg">Урон: ${skill.hits > 1 ? skill.hits+' x ' : ''}${skill.finalDmg}</div>`);
        
        if (skill.moveTarget) targetActions.push(`<span class="tt-move">${skill.moveTarget > 0 ? 'Назад' : 'Вперед'} ${Math.abs(skill.moveTarget)}</span>`);
        if (skill.moveSelf) selfActions.push(`<span class="tt-move">${skill.moveSelf > 0 ? 'Назад' : 'Вперед'} ${Math.abs(skill.moveSelf)}</span>`);
        
        if (skill.effect) {
            skill.effect.split(',').forEach(part => {
                let txt = this.translateEffect(part.trim())[0];
                if (part.trim().toLowerCase().startsWith('self ') || skill.targetSelf || skill.targetAlly) selfActions.push(`<span class="tt-buff">${txt}</span>`);
                else targetActions.push(`<span class="tt-debuff">${txt}</span>`);
            });
        }

        if (targetActions.length > 0) battleParts.push(`<div class="tt-action"><span class="tt-action-label">${skill.targetAlly ? 'Союзник' : 'Цель'}:</span> ${targetActions.join(', ')}</div>`);
        if (selfActions.length > 0) battleParts.push(`<div class="tt-action"><span class="tt-action-label">Сам герой:</span> ${selfActions.join(', ')}</div>`);

        if (battleParts.length > 0) html += `<div>${battleParts.join('')}</div><div class="tt-divider"></div>`;
        if (skill.comboOrMarkImproveable && skill.comboChanges) {
            html += `<div class="tt-combo"><b>При Метке/Комбо:</b> ${formatReward(skill.comboChanges)}</div><div class="tt-divider"></div>`;
        }
        if (skill.description) html += `<div class="tt-desc">${skill.description}</div>`;
        
        tt.innerHTML = html;
        this.hoveredSkillBtn = skill;
    },

    hideTooltip() {
        const tt = document.getElementById('battle-tooltip');
        if (tt) tt.classList.add('hidden');
        this.hoveredSkillBtn = null;
    },

    draw(ctx, canvas) {
        ctx.fillStyle = "#1a1612"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const grd = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 800);
        grd.addColorStop(0, "#2a241e"); grd.addColorStop(1, "#0a0806");
        ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255, 191, 0, 0.3)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 300); ctx.lineTo(canvas.width/2, 900); ctx.stroke();
        this.hoverQueueUnit = null; let hFieldU = null;
        this.gameUnits.forEach(u => { if (u.isClicked(this.mouseX, this.mouseY)) hFieldU = u; });

        if (this.battleManager && this.battleManager.turnQueue.length > 0) {
            let startX = (canvas.width / 2) - ((this.battleManager.turnQueue.length * 60) / 2);
            this.battleManager.turnQueue.forEach((unit, index) => {
                let boxX = startX + (index * 60); let boxY = 50;
                let isH = (this.mouseX >= boxX && this.mouseX <= boxX + 50 && this.mouseY >= boxY && this.mouseY <= boxY + 50) || unit === hFieldU;
                if (isH) { this.hoverQueueUnit = unit; unit.queueYOffset = 8; ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; }
                ctx.fillStyle = unit.side === 'player' ? '#4a90e2' : '#e24a4a'; ctx.fillRect(boxX, boxY + unit.queueYOffset, 50, 50);
                ctx.strokeStyle = index === 0 ? '#ffbf00' : '#fff'; ctx.lineWidth = index === 0 ? 3 : (isH ? 2 : 1);
                ctx.strokeRect(boxX, boxY + unit.queueYOffset, 50, 50);
                ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = '10px Arial';
                ctx.fillText(unit.name.split(' ')[0].substring(0, 5), boxX + 5, boxY + 30 + unit.queueYOffset);
            });
        }

        if (this.battleManager && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill?.isAoE) {
            let active = this.battleManager.getActiveUnit();
            let skill = this.battleManager.selectedSkill;
            let aoeTargets = this.gameUnits.filter(u => u.side !== active.side && !u.isDead && skill.targetPos.includes(u.posIdx));
            
            if (aoeTargets.length > 1) {
                aoeTargets.sort((a, b) => a.x - b.x);
                let first = aoeTargets[0];
                let last = aoeTargets[aoeTargets.length - 1];
                let centerY = first.y + first.height / 2;

                ctx.save();
                let isHov = aoeTargets.some(u => u === hFieldU || u === this.hoverQueueUnit);
                
                ctx.shadowBlur = isHov ? 20 : 10;
                ctx.shadowColor = isHov ? '#ff0000' : 'rgba(255, 68, 68, 0.5)';
                
                ctx.strokeStyle = isHov ? '#ff0000' : 'rgba(255, 68, 68, 0.4)';
                ctx.lineWidth = isHov ? 6 : 3;
                ctx.beginPath();
                ctx.moveTo(first.x + first.width/2, centerY);
                ctx.lineTo(last.x + last.width/2, centerY);
                ctx.stroke();

                ctx.lineWidth = isHov ? 4 : 2;
                const capH = 15;

                ctx.beginPath();
                ctx.moveTo(first.x + 5, centerY - capH);
                ctx.lineTo(first.x - 5, centerY);
                ctx.lineTo(first.x + 5, centerY + capH);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(last.x + last.width - 5, centerY - capH);
                ctx.lineTo(last.x + last.width + 5, centerY);
                ctx.lineTo(last.x + last.width - 5, centerY + capH);
                ctx.stroke();

                ctx.restore();
            }
        }

        if (this.battleManager) {
            this.gameUnits.forEach(unit => {
                unit.update();
                let isP = false; let active = this.battleManager.getActiveUnit();
                if (active && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill) {
                    let s = this.battleManager.selectedSkill;
                    if (s.targetAlly && unit.side === active.side && s.validPos?.includes(unit.posIdx)) isP = true;
                    else if (!s.targetAlly && unit.side !== active.side && s.targetPos?.includes(unit.posIdx)) isP = true;
                } else if (active && this.battleManager.state === 'SELECT_MOVE') {
                    if (unit.side === active.side && unit !== active && Math.abs(unit.posIdx - active.posIdx) === 1) isP = true;
                }
                unit.draw(ctx, active === unit, isP, unit === this.hoverQueueUnit || unit === hFieldU);
            });
        }

        const tt = document.getElementById('battle-tooltip');
        let targetFTT = hFieldU || this.hoverQueueUnit;
        if (targetFTT && !this.hoveredSkillBtn) {
            tt.classList.remove('hidden');
            tt.style.left = (this.mouseX + 20) + 'px'; tt.style.top = (this.mouseY - 50) + 'px';
            tt.innerHTML = targetFTT.getTooltipHTML();
        } else if (!this.hoveredSkillBtn) this.hideTooltip();

        this.damageTexts = this.damageTexts.filter(t => t.life > 0);
        this.damageTexts.forEach(t => { t.y -= 1.5; t.life--; ctx.fillStyle = t.color; ctx.font = "bold 40px Arial"; ctx.fillText(t.text, t.x, t.y); });
        this.drawEffectTooltip(ctx);
    },

    drawEffectTooltip(ctx) {
        let hEff = null; let hx = 0; let hy = 0;
        this.gameUnits.forEach(unit => {
            if (unit.effectHitboxes) unit.effectHitboxes.forEach(box => {
                if (this.mouseX >= box.x && this.mouseX <= box.x + box.width && this.mouseY >= box.y && this.mouseY <= box.y + box.height) { hEff = box.data; hx = box.x; hy = box.y; }
            });
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
        document.getElementById('ui-battle').classList.add('hidden');
        document.getElementById('battle-tooltip')?.classList.add('hidden'); 
        SceneManager.canvas.onmousedown = null;
        SceneManager.canvas.onmousemove = null;
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 60 });
};