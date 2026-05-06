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

    getRangeHTML(skill) {
        if (skill.isMove || skill.isRest) return '';
        let validHTML = ''; let targetHTML = '';
        const validPos = skill.validPos || [1,2,3,4];
        const targetPos = skill.targetPos || [1,2,3,4];
        for (let i = 4; i >= 1; i--) validHTML += `<div class="pos-dot ${validPos.includes(i) ? 'yellow' : ''}"></div>`;
        if (!skill.targetSelf) {
            let dots = ''; let minT = Math.min(...targetPos); let maxT = Math.max(...targetPos);
            for (let i = 1; i <= 4; i++) dots += `<div class="pos-dot ${targetPos.includes(i) ? (skill.targetAlly ? 'green' : 'red') : ''} aoe-dot"></div>`;
            if (skill.isAoE) {
                const sL = (minT - 1) * 16 + 2; const w = (maxT - minT) * 16 + 8;
                targetHTML = `<div class="aoe-line-container"><div class="aoe-line" style="left:${sL}px; width:${w}px;"></div>${dots}</div>`;
            } else targetHTML = `<div class="pos-group">${dots}</div>`;
        }
        return `<div class="pos-container"><div class="pos-group">${validHTML}</div><span style="color:#555">»</span>${targetHTML}</div>`;
    },

    translateEffect(effectString) {
        if (!effectString) return [];
        let translated = [];
        effectString.split(',').forEach(part => {
            const p = part.trim();
            const cleanPart = p.toLowerCase().startsWith('self ') ? p.substring(5).trim() : p;

            const params = cleanPart.split('-');
            const effectId = params[0].toUpperCase();
            const val1 = params[1] || 1;
            
            const effectBase = EFFECTS[effectId];
            
            if (effectId === 'DOT') {
                translated.push(`Кровотечение (${params[2] || 2} ур/ход)`);
            } else if (effectBase) {
                translated.push(`${effectBase.name} (${val1})`);
            } else {
                translated.push(`${params[0]} (${val1})`);
            }
        });
        return translated; 
    },

    getSkillDetailedHTML(skill) {
        const attacker = this.battleManager?.getActiveUnit();
        let weaponBase = attacker?.equipment?.rightHand?.baseDamage || 10;
        let effectiveBase = weaponBase;
        let baseLabel = `База оружия: ${weaponBase}`;

        if (attacker?.equipment && attacker.equipment.leftHand === null) {
            effectiveBase = Math.round(weaponBase * 1.3);
            baseLabel = `База (бонус руки x1.3): ${effectiveBase}`;
        }

        const formatReward = (reward) => {
            if (!reward) return "";
            if (typeof reward === 'string') return reward;
            let p = [];
            if (reward.damageCoef) {
                let d = Math.round(effectiveBase * reward.damageCoef);
                p.push(`Урон: ${skill.hits > 1 ? skill.hits+'x' : ''}${d} <small style="color:#666">(${effectiveBase}x${reward.damageCoef})</small>`);
            }
            if (reward.effect) p.push(...this.translateEffect(reward.effect));
            if (reward.moveSelf) p.push(`Сам: ${reward.moveSelf > 0 ? 'Назад' : 'Вперед'} ${Math.abs(reward.moveSelf)}`);
            if (reward.moveTarget) p.push(`Цель: ${reward.moveTarget > 0 ? 'Назад' : 'Вперед'} ${Math.abs(reward.moveTarget)}`);
            return p.join(', ');
        };

        if (skill.isMove || skill.isRest) {
            return { 
                leftHTML: `<h4 style="color:#ffbf00; margin:0;">${skill.name.toUpperCase()}</h4><div class="tt-divider"></div><div class="tt-desc" style="border:none; padding:0;">${skill.description}</div>`, 
                rightHTML: '' 
            };
        }

        let leftHTML = `
            <h4 style="color:#ffbf00; margin:0; text-transform:uppercase;">${skill.name}</h4>
            <div class="tt-type">${skill.type === 'melee' ? '🗡 Ближний бой' : (skill.type === 'ranged' ? '🏹 Дальний бой' : '🛡 Поддержка')}</div>
            <div class="tt-divider"></div>
            ${this.getRangeHTML(skill)}
            ${skill.uniqueCondition ? `<div class="tt-reward-line" style="margin-top:10px;"><b>Условие:</b> ${skill.uniqueCondition}<br><b>Награда:</b> ${formatReward(skill.uniqueConditionReward)}</div>` : ''}
        `;

        let sA = []; let tA = [];
        
        if (skill.moveTarget) tA.push(`<span class="tt-move">${skill.moveTarget > 0 ? 'Назад' : 'Вперед'} ${Math.abs(skill.moveTarget)}</span>`);
        if (skill.moveSelf) sA.push(`<span class="tt-move">${skill.moveSelf > 0 ? 'Назад' : 'Вперед'} ${Math.abs(skill.moveSelf)}</span>`);
        
        if (skill.effect) {
            const effectParts = skill.effect.split(',');
            const translatedArray = this.translateEffect(skill.effect);
            
            effectParts.forEach((part, idx) => {
                const p = part.trim().toLowerCase();
                const isSelf = p.startsWith('self ') || skill.targetSelf || skill.targetAlly;
                const txt = translatedArray[idx];
                
                if (isSelf) sA.push(`<span class="tt-buff">${txt}</span>`); 
                else tA.push(`<span class="tt-debuff">${txt}</span>`);
            });
        }

        let finalDmg = Math.round(effectiveBase * (skill.damageCoef || 0));

        let rightHTML = `
            <div style="display:flex; flex-direction:column; height: 100%;">
                ${finalDmg > 0 ? `<div class="tt-dmg">Урон: ${(skill.hits > 1 ? skill.hits + 'x' : '')}${finalDmg} <small style="color:#555">(${effectiveBase} x ${skill.damageCoef})</small></div>` : ''}
                ${tA.length > 0 ? `<div class="tt-action"><span class="tt-action-label">${skill.targetAlly ? 'Союзник' : 'Цель'}:</span> ${tA.join(', ')}</div>` : ''}
                ${sA.length > 0 ? `<div class="tt-action" style="margin-top:3px;"><span class="tt-action-label">Сам погруженец:</span> ${sA.join(', ')}</div>` : ''}
                ${skill.comboOrMarkImproveable ? `<div class="tt-combo" style="margin-top:5px;"><b>Комбо:</b> ${formatReward(skill.comboChanges)}</div>` : ''}
                <div class="tt-divider"></div>
                <div class="tt-desc">${skill.description || ''}</div>
            </div>`;
        return { leftHTML, rightHTML };
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
        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            if (manager.selectedSkill?.id === skill.id) btn.classList.add('active');
            btn.innerText = skill.name; 
            if (!skill.validPos?.includes(activeUnit.posIdx)) btn.disabled = true;
            let finalDmg = Math.round(baseDmg * (skill.damageCoef || 0));
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

        const leftBox = document.getElementById('b-info-left');
        const rightBox = document.getElementById('b-info-right');
        if (leftBox && rightBox) {
            if (this.hoveredObject?.type === 'skill') {
                const info = this.getSkillDetailedHTML(this.hoveredObject.data);
                leftBox.innerHTML = info.leftHTML; rightBox.innerHTML = info.rightHTML;
            } else if (target) {
                if (target.side === 'player') {
                    leftBox.innerHTML = target.getTooltipHTML();
                    rightBox.innerHTML = target.getEquipmentHTML();
                } else {
                    leftBox.innerHTML = '<div style="color:#444; padding:20px; text-align:center;">АНАЛИЗ ПРОТИВНИКА</div>';
                    rightBox.innerHTML = target.getTooltipHTML();
                }
            } else {
                leftBox.innerHTML = ''; rightBox.innerHTML = '';
            }
        }

        if (this.battleManager && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill?.isAoE) {
            let active = this.battleManager.getActiveUnit();
            let skill = this.battleManager.selectedSkill;
            let aoeTargets = this.gameUnits.filter(u => u.side !== active.side && !u.isDead && skill.targetPos.includes(u.posIdx));
            if (aoeTargets.length > 1) {
                aoeTargets.sort((a, b) => a.x - b.x);
                let first = aoeTargets[0]; let last = aoeTargets[aoeTargets.length - 1];
                let centerY = first.y + first.height / 2;
                ctx.save();
                let isHov = aoeTargets.some(u => u === hFieldU || u === this.hoverQueueUnit);
                ctx.shadowBlur = isHov ? 20 : 10; ctx.shadowColor = isHov ? '#ff0000' : 'rgba(255, 68, 68, 0.5)';
                ctx.strokeStyle = isHov ? '#ff0000' : 'rgba(255, 68, 68, 0.4)'; ctx.lineWidth = isHov ? 6 : 3;
                ctx.beginPath(); ctx.moveTo(first.x + first.width/2, centerY); ctx.lineTo(last.x + last.width/2, centerY); ctx.stroke();
                ctx.lineWidth = isHov ? 4 : 2; const capH = 15;
                ctx.beginPath(); ctx.moveTo(first.x + 5, centerY - capH); ctx.lineTo(first.x - 5, centerY); ctx.lineTo(first.x + 5, centerY + capH); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(last.x + last.width - 5, centerY - capH); ctx.lineTo(last.x + last.width + 5, centerY); ctx.lineTo(last.x + last.width - 5, centerY + capH); ctx.stroke();
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
                unit.draw(ctx, active === unit, isP, unit === target);
            });
        }

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