import { BattleManager } from '../managers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { sword } from '../data/weapon.js';
import { GLASS_FOREST_ENEMIES } from '../data/enemies.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,

    init() {
        console.log("Бой начался!");
        document.getElementById('ui-battle').classList.remove('hidden');
        this.damageTexts = [];
        this.gameUnits = [];

        GameState.currentSquad.forEach((data, index) => {
            const hero = new Adventurer(data.name, data.background, index + 1);
            hero.equip('rightHand', sword.rustySword);
            hero.hp = data.hp;
            hero.maxHp = data.maxHp;
            this.gameUnits.push(hero);
        });

        const enemy1 = new Unit({ name: "Фритта A", side: 'enemy', posIdx: 1, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });
        const enemy2 = new Unit({ name: "Фритта B", side: 'enemy', posIdx: 2, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });
        const enemy3 = new Unit({ name: "Фритта C", side: 'enemy', posIdx: 3, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });
        const enemy4 = new Unit({ name: "Фритта D", side: 'enemy', posIdx: 4, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });
        this.gameUnits.push(enemy1, enemy2, enemy3, enemy4);

        this.battleManager = new BattleManager(this.gameUnits, (a, s, m) => this.updateUI(a, s, m));
        
        this.setupInput();
        this.battleManager.startBattle();
    },

    setupInput() {
        const canvas = SceneManager.canvas;
        
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        };

        canvas.onmousedown = (e) => {
            this.gameUnits.forEach(u => {
                if (u.isClicked(this.mouseX, this.mouseY)) this.battleManager.handleCanvasClick(u);
            });
        };
    },

    hoverQueueUnit: null,

    setupInput() {
        const canvas = SceneManager.canvas;
        
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        };

        canvas.onmousedown = (e) => {
            if (this.hoverQueueUnit) {
                this.battleManager.handleCanvasClick(this.hoverQueueUnit);
                return; 
            }

            this.gameUnits.forEach(u => {
                if (u.isClicked(this.mouseX, this.mouseY)) {
                    this.battleManager.handleCanvasClick(u);
                }
            });
        };
    },

    updateUI(activeUnit, skills, manager) {
        const skillsPanel = document.getElementById('skills-panel');
        const turnInfo = document.getElementById('turn-info');
        skillsPanel.innerHTML = '';

        if (!activeUnit || activeUnit.side !== 'player' || manager.state === 'EXECUTING') {
            turnInfo.innerText = activeUnit?.side === 'enemy' ? "ХОД ПРОТИВНИКА" : "...";
            return;
        }

        turnInfo.innerText = `Ход: ${activeUnit.name} (Поз: ${activeUnit.posIdx})`;

        let mBtn = document.createElement('button');
        mBtn.className = 'skill-btn';
        if (manager.state === 'SELECT_MOVE') mBtn.classList.add('active');
        mBtn.innerText = 'ДВИЖЕНИЕ';
        mBtn.onclick = () => manager.selectMoveAction();
        skillsPanel.appendChild(mBtn);

        const baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;
        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            if (manager.selectedSkill?.id === skill.id) btn.classList.add('active');
            
            let finalDmg = Math.round(baseDmg * (skill.damageCoef || 0) * (skill.hits || 1));
            btn.innerText = `${skill.name}\n${finalDmg > 0 ? '(Ур: '+finalDmg+')' : '(Бафф)'}`;
            
            if (!skill.validPos?.includes(activeUnit.posIdx)) btn.disabled = true;
            btn.onclick = () => manager.selectSkill(skill);
            skillsPanel.appendChild(btn);
        });
    },

    draw(ctx, canvas) {
        ctx.fillStyle = "#1a1612";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const grd = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 800);
        grd.addColorStop(0, "#2a241e");
        grd.addColorStop(1, "#0a0806");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255, 191, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 300); ctx.lineTo(canvas.width/2, 900); ctx.stroke();

        this.hoverQueueUnit = null; 
        let hoveredFieldUnit = null;

        this.gameUnits.forEach(u => {
            if (u.isClicked(this.mouseX, this.mouseY)) {
                hoveredFieldUnit = u;
            }
        });

        if (this.battleManager && this.battleManager.turnQueue.length > 0) {
            let startX = (canvas.width / 2) - ((this.battleManager.turnQueue.length * 60) / 2);
            
            this.battleManager.turnQueue.forEach((unit, index) => {
                let boxX = startX + (index * 60);
                let boxY = 50;
                
                let isHovered = false;
                if (this.mouseX >= boxX && this.mouseX <= boxX + 50 && this.mouseY >= boxY && this.mouseY <= boxY + 50) {
                    this.hoverQueueUnit = unit;
                    isHovered = true;
                } else if (unit === hoveredFieldUnit) {
                    isHovered = true;
                }

                if (isHovered) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#fff';
                }

                ctx.fillStyle = unit.side === 'player' ? '#4a90e2' : '#e24a4a';
                ctx.fillRect(boxX, boxY, 50, 50);
                
                ctx.strokeStyle = index === 0 ? '#ffbf00' : '#fff';
                ctx.lineWidth = index === 0 ? 3 : (isHovered ? 2 : 1);
                ctx.strokeRect(boxX, boxY, 50, 50);
                
                ctx.shadowBlur = 0; 
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.fillText(unit.name.substring(0, 5), boxX + 5, boxY + 30);
            });
        }

        if (this.battleManager) {
            this.gameUnits.forEach(unit => {
                unit.update();
                
                let isPotential = false;
                let active = this.battleManager.getActiveUnit();
                
                if (active && this.battleManager.state === 'SELECT_TARGET' && this.battleManager.selectedSkill) {
                    let skill = this.battleManager.selectedSkill;
                    if (skill.targetAlly && unit.side === active.side && skill.validPos?.includes(unit.posIdx)) isPotential = true;
                    else if (!skill.targetAlly && unit.side !== active.side && skill.targetPos?.includes(unit.posIdx)) isPotential = true;
                } 
                else if (active && this.battleManager.state === 'SELECT_MOVE') {
                    if (unit.side === active.side && unit !== active && Math.abs(unit.posIdx - active.posIdx) === 1) isPotential = true;
                }

                let isHovered = (unit === this.hoverQueueUnit || unit === hoveredFieldUnit);
                unit.draw(ctx, active === unit, isPotential, isHovered);
            });
        }

        this.damageTexts = this.damageTexts.filter(t => t.life > 0);
        this.damageTexts.forEach(t => {
            t.y -= 1.5; t.life--;
            ctx.fillStyle = t.color;
            ctx.font = "bold 40px Arial";
            ctx.fillText(t.text, t.x, t.y);
        });

        let hoveredEffect = null;
        let hx = 0; let hy = 0;

        if (this.battleManager) {
            this.gameUnits.forEach(unit => {
                if (unit.effectHitboxes) {
                    unit.effectHitboxes.forEach(box => {
                        if (this.mouseX >= box.x && this.mouseX <= box.x + box.width &&
                            this.mouseY >= box.y && this.mouseY <= box.y + box.height) {
                            hoveredEffect = box.data; hx = box.x; hy = box.y;
                        }
                    });
                }
            });
        }

        if (hoveredEffect) {
            const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
                let words = text.split(' '); let line = ''; let currentY = y;
                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    if (context.measureText(testLine).width > maxWidth && n > 0) {
                        context.fillText(line, x, currentY);
                        line = words[n] + ' '; currentY += lineHeight;
                    } else { line = testLine; }
                }
                context.fillText(line, x, currentY);
                return currentY + lineHeight;
            };

            const boxWidth = 240; const startX = hx + 15; const startY = hy - 90;
            
            let title = hoveredEffect.base.name.toUpperCase();
            let desc = hoveredEffect.base.description || "";
            
            let stats = hoveredEffect.base.id === 'bleed' 
                ? `Урон в ход: ${hoveredEffect.damagePerTurn || 2} | Ходов: ${hoveredEffect.duration}`
                : `Жетонов: ${hoveredEffect.count} | Осталось ходов: ${hoveredEffect.duration || '∞'}`;

            ctx.font = "12px Arial";
            let boxHeight = wrapText(ctx, desc, 0, -1000, boxWidth - 20, 16) + 50 - (-1000); 

            ctx.fillStyle = "rgba(10, 8, 5, 0.95)";
            ctx.strokeStyle = "#ffbf00"; ctx.lineWidth = 1;
            ctx.fillRect(startX, startY, boxWidth, boxHeight);
            ctx.strokeRect(startX, startY, boxWidth, boxHeight);

            ctx.fillStyle = "#ffbf00"; ctx.font = "bold 13px Arial"; ctx.fillText(title, startX + 10, startY + 20);
            ctx.fillStyle = "#aaa"; ctx.font = "12px Arial";
            let nextY = wrapText(ctx, desc, startX + 10, startY + 40, boxWidth - 20, 16);
            ctx.fillStyle = "#ff6666"; ctx.font = "bold 12px Arial"; ctx.fillText(stats, startX + 10, nextY + 5);
        }
    },

    destroy() {
        document.getElementById('ui-battle').classList.add('hidden');
        SceneManager.canvas.onmousedown = null;
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 60 });
};