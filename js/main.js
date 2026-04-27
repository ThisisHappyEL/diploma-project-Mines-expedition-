// import { GLASS_FOREST_ENEMIES } from '../templates/enemies.js';
// import { sword } from '../templates/weapon.js';
// import { Unit } from '../templates/Unit.js';
// import { Adventurer } from '../templates/Adventurer.js';
// import { BattleManager } from '../templates/BattleManager.js';
import { SceneManager } from './core/SceneManager.js';
import { HubScene } from './scenes/HubScene.js';

// const canvas = document.getElementById('battleCanvas');
// const ctx = canvas.getContext('2d');
// const GameState = {
//     units: [],
//     selectedUnit: null,
//     damageTexts: []
// };
// let gameUnits = [];
// let battle = null;

// class FloatingText {
//     constructor(text, x, y, color) {
//         this.text = text;
//         this.x = x;
//         this.y = y;
//         this.color = color;
//         this.alpha = 1.0;
//         this.life = 60;
//     }
//     update() {
//         this.y -= 1;
//         this.alpha -= 0.015;
//         this.life--;
//     }
//     draw(ctx) {
//         ctx.globalAlpha = this.alpha;
//         ctx.fillStyle = this.color;
//         ctx.font = 'bold 24px Arial';
//         ctx.fillText(this.text, this.x, this.y);
//         ctx.globalAlpha = 1.0;
//     }
// }

// window.spawnDamageText = (text, x, y, color = '#ff4444') => {
//     GameState.damageTexts.push(new FloatingText(text, x, y, color));
// };

// function updateUI(activeUnit, skills, battleObj) {
//     const skillsPanel = document.getElementById('skills-panel');
//     skillsPanel.innerHTML = '';

//     if (!activeUnit || activeUnit.side !== 'player' || battleObj.state === 'EXECUTING') {
//         document.getElementById('turn-info').innerText = activeUnit?.side === 'enemy' ? "ХОД ПРОТИВНИКА" : "...";
//         return;
//     }

//     document.getElementById('turn-info').innerText = `Ход: ${activeUnit.name}\n(Поз: ${activeUnit.posIdx})`;

//     let moveBtn = document.createElement('button');
//     moveBtn.className = 'skill-btn';
//     if (battleObj.state === 'SELECT_MOVE') moveBtn.classList.add('active');
//     moveBtn.innerText = 'ДВИЖЕНИЕ';
//     moveBtn.onclick = () => battleObj.selectMoveAction();
//     skillsPanel.appendChild(moveBtn);

//     let baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;

//     skills.forEach(skill => {
//         let btn = document.createElement('button');
//         btn.className = 'skill-btn';
        
//         if (battleObj.selectedSkill?.id === skill.id && battleObj.state === 'SELECT_TARGET') {
//             btn.classList.add('active');
//         }

//         let finalDmg = Math.round(baseDmg * (skill.damageCoef || 0) * (skill.hits || 1));
//         btn.innerText = `${skill.name}\n${finalDmg > 0 ? '(Урон: '+finalDmg+')' : '(Бафф)'}`;
        
//         if (!skill.validPos?.includes(activeUnit.posIdx)) btn.disabled = true;

//         btn.onclick = () => battleObj.selectSkill(skill);
//         skillsPanel.appendChild(btn);
//     });
// }

// function initGame() {
//     const hero1 = new Adventurer("Губерт", "Шахтёр", 1);
//     hero1.equip('rightHand', sword.rustySword);
    
//     const hero2 = new Adventurer("Борс", "Шахтёр", 2);
//     hero2.equip('rightHand', sword.rustySword);

//     const enemy1 = new Unit({ name: "Фритта A", side: 'enemy', posIdx: 1, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });
//     const enemy2 = new Unit({ name: "Фритта B", side: 'enemy', posIdx: 2, hp: GLASS_FOREST_ENEMIES.fritta.hp, skills: GLASS_FOREST_ENEMIES.fritta.skills });

//     gameUnits = [hero1, enemy1, hero2, enemy2];

//     battle = new BattleManager(gameUnits, updateUI);
//     battle.startBattle();

//     canvas.addEventListener('mousedown', (e) => {
//         const rect = canvas.getBoundingClientRect();

//         const scaleX = canvas.width / rect.width;
//         const scaleY = canvas.height / rect.height;
        
//         const mx = (e.clientX - rect.left) * scaleX;
//         const my = (e.clientY - rect.top) * scaleY;

//         gameUnits.forEach(unit => {
//             if (unit.isClicked(mx, my)) {
//                 battle.handleCanvasClick(unit);
//             }
//         });
//     });

//     gameLoop();
// }

// function gameLoop() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     const grd = ctx.createRadialGradient(500, 300, 50, 500, 300, 600);
//     grd.addColorStop(0, "#2a241e");
//     grd.addColorStop(1, "#110e0c");
//     ctx.fillStyle = grd;
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     gameUnits.forEach(unit => {
//         unit.update();
        
//         let isPotential = false;
//         let active = battle.getActiveUnit();
        
//         if (battle.state === 'SELECT_TARGET' && battle.selectedSkill) {
//             if (unit.side !== active.side && battle.selectedSkill.targetPos.includes(unit.posIdx)) isPotential = true;
//         } else if (battle.state === 'SELECT_MOVE') {
//             if (unit.side === active.side && unit !== active) isPotential = true;
//         }

//         unit.draw(ctx, GameState.selectedUnit === unit, isPotential); 
//     });

//     GameState.damageTexts = GameState.damageTexts.filter(t => t.life > 0);
//     GameState.damageTexts.forEach(t => {
//         t.update();
//         t.draw(ctx);
//     });

//     requestAnimationFrame(gameLoop);
// }

SceneManager.init('mainCanvas');

SceneManager.changeScene(HubScene);