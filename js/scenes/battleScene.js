import { BattleManager } from '../managers/battleSceneManagers/BattleManager.js';
import { Adventurer } from '../entities/Adventurer.js';
import { Unit } from '../entities/Unit.js';
import { test_weapon, swords } from '../data/battleData/weapon.js';
import { GLASS_FOREST_ENEMIES, GLASS_FOREST_ENCOUNTERS } from '../data/battleData/enemies.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { BattleUIHelper } from '../managers/battleSceneManagers/BattleUIHelper.js';
import { EFFECTS } from '../data/battleData/effects.js';
import { CharacterRenderer } from '../managers/hubLocationManagers/CharacterRenderer.js';

// Соединялка элементов спрайта погруженца
function getLayersFromHTML(adv) {
    const html = CharacterRenderer.getAvatarHTML(adv, "100%", true);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const imgs = temp.querySelectorAll('img');
    return Array.from(imgs).map(img => img.getAttribute('src'));
}

Adventurer.prototype.drawBody = function(ctx, isActive, isValidTarget, isHovered) {
    // Анимация смерти
    if (this.isDead) {
        if (this.deathAnimProgress === undefined) {
            this.deathAnimProgress = 0;
        }
        if (this.deathAnimProgress < 1.0) {
            this.deathAnimProgress += 0.05;
        } else {
            return;
        }
    }

    ctx.save();

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    if (!this._avatarLayersLoaded) {
        this._avatarLayersLoaded = [];
        try {
            const paths = getLayersFromHTML(this);
            paths.forEach(src => {
                const img = new Image();
                img.onload = () => { this._avatarLayersLoaded.push(img); };
                img.src = src;
            });
        } catch (e) {
            console.error("Ошибка ленивой загрузки слоев аватара:", e);
        }
    }

    if (this._avatarLayersLoaded && this._avatarLayersLoaded.length > 0) {
        // Размер спрайта погруженца
        const scaleX = 1.75;  
        const scaleY = 1.75;  
        const offsetX = -10;   
        const offsetY = 0;   

        const drawW = w * scaleX;
        const drawH = h * scaleY;
        const drawX = x + (w - drawW) / 2 + offsetX;
        const drawY = y - drawH + offsetY;

        if (!this._offscreenCanvas) {
            this._offscreenCanvas = document.createElement('canvas');
            this._offscreenCtx = this._offscreenCanvas.getContext('2d');
        }
        this._offscreenCanvas.width = drawW;
        this._offscreenCanvas.height = drawH;
        this._offscreenCtx.clearRect(0, 0, drawW, drawH);

        this._avatarLayersLoaded.forEach(img => {
            if (img.complete) {
                this._offscreenCtx.drawImage(img, 0, 0, drawW, drawH);
            }
        });

        // Падение набок при смерти
        if (this.isDead) {
            const prog = this.deathAnimProgress;
            ctx.globalAlpha = Math.max(0, 1 - prog);
            const centerX = drawX + drawW / 2;
            const centerY = drawY + drawH;
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2 * prog);
            ctx.translate(-centerX, -centerY);
        }

        let shadowColor = null;
        let shadowBlur = 0;

        if (!this.isDead) {
            if (isActive) {
                if (isValidTarget) {
                    shadowColor = isHovered ? '#00f0ff' : '#ffbf00'; 
                    shadowBlur = isHovered ? 28 : 24; 
                } else {
                    shadowColor = '#ffbf00'; 
                    shadowBlur = 20;
                }
            } else if (isValidTarget) {
                shadowColor = '#4affab';
                shadowBlur = isHovered ? 25 : 15; 
            } else if (isHovered) {
                shadowColor = '#ffffff';
                shadowBlur = 15;
            }
        }

        if (shadowColor) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
        }

        ctx.drawImage(this._offscreenCanvas, drawX, drawY);
    } else {
        if (!this.isDead) {
            ctx.fillStyle = isActive ? "rgba(255, 191, 0, 0.4)" : "rgba(74, 144, 226, 0.3)";
            ctx.fillRect(x, y - h, w, h);
        }
    }

    ctx.restore();
};

const originalUnitDrawBody = Unit.prototype.drawBody;
Unit.prototype.drawBody = function(ctx, isActive, isValidTarget, isHovered) {
    if (this.isDead) {
        if (this.deathAnimProgress === undefined) {
            this.deathAnimProgress = 0;
        }
        if (this.deathAnimProgress < 1.0) {
            this.deathAnimProgress += 0.05;
        } else {
            return;
        }
    }

    ctx.save();

    if (this.isDead) {
        const prog = this.deathAnimProgress;
        ctx.globalAlpha = Math.max(0, 1 - prog);
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y; 
        
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2 * prog);
        ctx.translate(-centerX, -centerY);
    }

    originalUnitDrawBody.call(this, ctx, isActive, isValidTarget, isHovered);

    ctx.restore();
};

Adventurer.prototype.isClicked = function(mx, my) {
    return mx >= this.x && mx <= this.x + this.width &&
           my >= this.y - this.height && my <= this.y;
};

export const BattleScene = {
    battleManager: null,
    gameUnits: [],
    damageTexts: [],
    mouseX: 0,
    mouseY: 0,
    hoverQueueUnit: null,
    hoveredObject: null, 

    // Кеш для оптимизации
    lastHoverTarget: null,
    lastSkillId: null,
    lastHoveredObjRef: null,
    cachedExpectedDmg: 0,
    cachedAoeTargets: [],
    isHoveringValidTarget: false,

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

        // Сброс кеша
        this.lastHoverTarget = null; this.lastSkillId = null; this.lastHoveredObjRef = null;

        this.bgImage = new Image();
        this.bgLoaded = false;
        let bgRand = Math.floor(Math.random() * 6);
        this.bgImage.onload = () => { this.bgLoaded = true; };
        this.bgImage.src = `assets/img/backgrounds/glassForest/glassForest${bgRand}.png`;

        let activePos = 1;
        GameState.currentSquad.forEach((data) => {
            if (data.hp <= 0) return; // Смертно уставшие не дерутся
            
            const hero = new Adventurer(data, activePos);
            Object.assign(hero, data);
            
            // Временное решение отсутствия кулачных ударов
            if (!hero.equipment.rightHand) hero.equip('rightHand', swords.rustySword);
            
            this.gameUnits.push(hero);
            activePos++;
        });


        const getSpriteUrl = (data) => {
            if (data.spriteVariations) {
                let r = Math.floor(Math.random() * data.spriteVariations);
                let cleanUrl = data.spriteUrl.replace(/\.png$/i, ''); 
                return `${cleanUrl}${r}.png`;
            }
            return data.spriteUrl; 
        };

        const encounter = GLASS_FOREST_ENCOUNTERS[GameState.selectedEncounter];
        
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
                    name: `${eData.name} ${letter}`, 
                    side: 'enemy', 
                    posIdx: pos, 
                    hp: eData.hp, 
                    maxHp: eData.hp, 
                    combat: eData.combat, 
                    skills: eData.skills,
                    spriteUrl: getSpriteUrl(eData),
                    scale: eData.scale,
                    maxCombo: eData.maxCombo,
                    lore: eData.lore,
                    tactics: eData.tactics,
                });

                if (enemyId === 'fritta') {
                    newEnemy.addEffect(EFFECTS.SWARM, 3);
                }

                this.gameUnits.push(newEnemy);
            }
        });

        this.battleManager = new BattleManager(this.gameUnits, (a, s, m) => this.updateUI(a, s, m));
        this.battleManager.logPanel = document.getElementById('b-log-container');
        this.setupInput();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (!overlay.classList.contains('active')) {
                    overlay.classList.add('hidden');
                }
            }, 1200);
        }

        this.battleManager.startBattle();
    },

    renderTurnQueue() {
        const container = document.getElementById('b-turn-queue');
        if (!container || !this.battleManager) return;
        container.innerHTML = this.battleManager.turnQueue.map((unit, index) => {
            const sideClass = unit.side === 'player' ? 'player' : 'enemy';
            const activeClass = index === 0 ? 'active' : '';
            
            let avatarContent = '';
            if (unit.side === 'player') {
                const layeredHTML = CharacterRenderer.getAvatarHTML(unit, "100%", true);
                // скейлинг и смещение лиц погруженцев в очерёдности ходов
                const scale = "5";
                const translateX = "-10%";
                const translateY = "-10%";

                avatarContent = `
                    <div class="char-avatar-layered" style="width:100%; height:100%; background: transparent; border: none; box-shadow: none; overflow:hidden; transform: scale(${scale}) translateX(${translateX}) translateY(${translateY}); transform-origin: top center;">
                        ${layeredHTML}
                    </div>
                `;
            } else if (unit.sprite && unit.sprite.src) {
                // Скейлинг и смещение для врагов в очереди ходов
                let size = "200%";
                let posX = "20%";
                let posY = "50%";
                
                const name = unit.name.toLowerCase();
                if (name.includes("мать")) {
                    size = "200%"; posX = "50%"; posY = "50%";
                } else if (name.includes("витраж")) {
                    size = "240%"; posX = "50%"; posY = "50%";
                } else if (name.includes("амальгама")) {
                    size = "400%"; posX = "50%"; posY = "80%";
                } else if (name.includes("стеклянный")) {
                    size = "500%"; posX = "50%"; posY = "90%";
                } else if (name.includes("фритта")) {
                    size = "550%"; posX = "50%"; posY = "90%";
                }
                
                avatarContent = `<div style="width:100%; height:100%; background-image: url('${unit.sprite.src}'); background-size: ${size}; background-position: ${posX} ${posY}; background-repeat: no-repeat; border-radius: 4px;"></div>`;
            } else {
                let bgColor = 'rgba(226, 74, 74, 0.2)';
                avatarContent = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; background:${bgColor}; border-radius: 4px;">${unit.name.charAt(0)}</div>`;
            }

            return `<div class="queue-item ${sideClass} ${activeClass}" data-name="${unit.name}"
                        style="position:relative; overflow:hidden;"
                        onmouseenter="BattleScene.hoverQueueUnit = BattleScene.gameUnits.find(u => u.name === '${unit.name}'); BattleScene.updateStateAndDOM();" 
                        onmouseleave="BattleScene.hoverQueueUnit = null; BattleScene.updateStateAndDOM();">
                        ${avatarContent}
                    </div>`;
        }).join('');
    },

    updateUI(activeUnit, skills, manager) {
        this.renderTurnQueue();
        const skillsRow = document.getElementById('b-skills-row');
        if (!skillsRow) return;
        skillsRow.innerHTML = '';
        
        const mBtn = document.getElementById('b-btn-move');
        const rBtn = document.getElementById('b-btn-rest');

        if (!activeUnit || activeUnit.side !== 'player' || manager.state === 'EXECUTING') {
            mBtn.style.opacity = '0.3'; mBtn.onclick = null; mBtn.onmouseenter = null; mBtn.onmouseleave = null;
            rBtn.style.opacity = '0.3'; rBtn.onclick = null; rBtn.onmouseenter = null; rBtn.onmouseleave = null;
            this.updateStateAndDOM();
            return;
        }

        if (activeUnit.stamina < 3) {
            mBtn.style.opacity = '0.3'; mBtn.onclick = null; mBtn.onmouseenter = null; mBtn.onmouseleave = null;
        } else {
            mBtn.style.opacity = '1';
            mBtn.onclick = () => { manager.selectMoveAction(); this.updateStateAndDOM(); };
            mBtn.onmouseenter = () => { this.hoveredObject = { type: 'skill', data: { name: "Движение", description: "Смена позиции с соседним союзником. (-3 Выносливости)", isMove: true } }; this.updateStateAndDOM(); };
            mBtn.onmouseleave = () => { this.hoveredObject = null; this.updateStateAndDOM(); };
        }

        rBtn.style.opacity = '1';
        rBtn.onclick = () => { manager.performRest(); this.updateStateAndDOM(); };
        rBtn.onmouseenter = () => { this.hoveredObject = { type: 'skill', data: { name: "Отдых", description: "Пропуск хода для восстановления сил (+15 Выносливости).", isRest: true } }; this.updateStateAndDOM(); };
        rBtn.onmouseleave = () => { this.hoveredObject = null; this.updateStateAndDOM(); };

        const baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;
        const effectiveBase = activeUnit.equipment?.leftHand === null ? Math.round(baseDmg * 1.3) : baseDmg;

        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            
            let isActive = manager.selectedSkill?.id === skill.id;
            if (isActive) btn.classList.add('active');
            
            if (!this.iconCache) this.iconCache = {}; 
            
            if (this.iconCache[skill.id] === true) {
                btn.innerHTML = `<img src="assets/img/weaponSkillsIcons/${skill.id}.png" style="width:100%; height:100%; object-fit:cover; pointer-events:none; display:block;" />`;
                btn.style.padding = '0'; 
                btn.style.overflow = 'visible';
                
                btn.style.backgroundColor = '#000'; 
                
                if (isActive) {
                    btn.style.height = '140px';
                    btn.style.transform = 'translateY(-37px)';
                    btn.style.zIndex = '100'; 
                    btn.style.boxShadow = '0 15px 25px rgba(0,0,0,0.8), 0 0 15px #ffbf00';
                    btn.style.borderColor = '#ffbf00';
                } else {
                    btn.style.height = '65px';
                    btn.style.transform = 'translateY(0)';
                    btn.style.zIndex = '1';
                    btn.style.borderColor = '#444';
                }

            } else {
                btn.innerText = skill.name;
                
                if (this.iconCache[skill.id] === undefined) {
                    this.iconCache[skill.id] = 'loading'; 
                    
                    let img = new Image();
                    img.onload = () => { 
                        this.iconCache[skill.id] = true; 
                        this.updateUI(activeUnit, skills, manager); 
                    };
                    img.onerror = () => { 
                        this.iconCache[skill.id] = false; 
                    };
                    img.src = `assets/img/weaponSkillsIcons/${skill.id}.png`; 
                }
            }
            
            let isPosValid = skill.validPos?.includes(activeUnit.posIdx);
            let hasTarget = false;
            
            if (skill.targetSelf || skill.targetAny) {
                hasTarget = true; 
            } else {
                const targetSide = skill.targetAlly ? activeUnit.side : (activeUnit.side === 'player' ? 'enemy' : 'player');
                hasTarget = this.gameUnits.some(u => !u.isDead && u.side === targetSide && skill.targetPos?.includes(u.posIdx));
                if (!skill.targetAlly && skill.damageCoef > 0) {
                    if (this.gameUnits.find(u => u.isEnvironment)) hasTarget = true;
                }
            }

            let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt',
                             'frontRearSights', 'buckshot', 'shotIntoAir', 'piercedArtery', 'piercingShot', 'stayAway'].includes(skill.id);
            let hasAmmo = activeUnit.hasEffect('ammo');
            
            let isVulnerableSpotValid = skill.id !== 'vulnerableSpot' || activeUnit.hasEffect('combo') || this.gameUnits.some(u => u.side !== activeUnit.side && !u.isDead && u.hasEffect('mark'));
            let isRapidFireValid = skill.id !== 'rapidFire' || activeUnit.hasEffect('combo');
            let sCost = skill.staminaCost !== undefined ? skill.staminaCost : 6;
            
            if (!isPosValid || !hasTarget || (needsAmmo && !hasAmmo) || !isVulnerableSpotValid || !isRapidFireValid || activeUnit.stamina < sCost) {
                btn.disabled = true;
            }

            if (!isPosValid || !hasTarget || (needsAmmo && !hasAmmo) || !isVulnerableSpotValid || !isRapidFireValid) {
                btn.disabled = true;
            }

            if (skill.id === 'allInThisStrike') {
                const controlEffects = ['stun', 'daze', 'fear', 'inWeb', 'instability'];
                if (activeUnit.activeEffects.some(e => controlEffects.includes(e.base.id))) btn.disabled = true; 
            }
            
            let finalDmg = Math.round(effectiveBase * (skill.damageCoef || 0));
            
            btn.onclick = () => { manager.selectSkill(skill); this.updateStateAndDOM(); };
            btn.onmouseenter = () => { this.hoveredObject = { type: 'skill', data: { ...skill, finalDmg } }; this.updateStateAndDOM(); };
            btn.onmouseleave = () => { this.hoveredObject = null; this.updateStateAndDOM(); };
            
            skillsRow.appendChild(btn);
        });
        
        this.updateStateAndDOM();
    },

    setupInput() {
        const canvas = SceneManager.canvas;
        
        canvas.oncontextmenu = (e) => {
            e.preventDefault();
            this.cancelCurrentAction();
        };

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

            if (e.key === 'Escape') {
                this.cancelCurrentAction();
                return;
            }

            let active = this.battleManager ? this.battleManager.getActiveUnit() : null;
            if (!active || active.side !== 'player' || this.battleManager.state === 'EXECUTING') return;

            const mBtn = document.getElementById('b-btn-move');
            const rBtn = document.getElementById('b-btn-rest');
            const skillsRow = document.getElementById('b-skills-row');

            if (e.key === 'p') { 
                if (mBtn && mBtn.style.opacity === '1') mBtn.click();
            } 
            else if (e.key === ' ' || e.code === 'Space') {
                if (rBtn && rBtn.style.opacity === '1') rBtn.click();
            } 
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
            this.battleManager.selectedSkill = null;
            this.battleManager.state = 'IDLE';
            
            this.updateUI(active, active.getAvailableSkills(), this.battleManager);
        }
    },

    updateStateAndDOM() {
        if (!this.battleManager) return;
        

        let active = this.battleManager.getActiveUnit();
        let s = active && this.battleManager.state === 'SELECT_TARGET' ? this.battleManager.selectedSkill : null;
        
        let hFieldU = null;
        this.gameUnits.forEach(u => { if (u.isClicked(this.mouseX, this.mouseY)) hFieldU = u; });
        const target = hFieldU || this.hoverQueueUnit;

        if (this.lastHoverTarget === target && this.lastSkillId === (s ? s.id : null) && this.lastHoveredObjRef === this.hoveredObject) {
            return;
        }
        
        // обновление кеша
        this.lastHoverTarget = target;
        this.lastSkillId = s ? s.id : null;
        this.lastHoveredObjRef = this.hoveredObject;
        
        this.cachedExpectedDmg = 0;
        this.cachedExpectedStamina = 0;
        this.cachedAoeTargets = [];
        this.isHoveringValidTarget = false;
        
        let predictionHTML = null;

        if (active && active.side === 'player') {
            if (this.hoveredObject?.type === 'skill') {
                if (this.hoveredObject.data.isMove) this.cachedExpectedStamina = 3;
                else if (this.hoveredObject.data.isRest) this.cachedExpectedStamina = -15; // минус значит восстановление
                else this.cachedExpectedStamina = this.hoveredObject.data.staminaCost !== undefined ? this.hoveredObject.data.staminaCost : 6;
            } else if (s) {
                this.cachedExpectedStamina = s.staminaCost !== undefined ? s.staminaCost : 6;
            }
        }

        document.querySelectorAll('.queue-item').forEach(el => el.classList.remove('hover-highlight'));
        if (target) {
            const el = document.querySelector(`.queue-item[data-name="${target.name}"]`);
            if (el) el.classList.add('hover-highlight');
        }

        let currentTargetPos = s ? (s.targetPos || []) : [];
        if (s && s.id === 'buckshot' && target) {
            if (target.posIdx === 1) currentTargetPos = [1, 2];
            else if (target.posIdx === 3) currentTargetPos = [2, 3];
            else currentTargetPos = [1, 2];
        }

        if (s && target && !target.isDead) {
            if (s.targetSelf && target === active) this.isHoveringValidTarget = true;
            else if (s.targetAny && currentTargetPos.includes(target.posIdx)) this.isHoveringValidTarget = true;
            else if (s.targetAlly && target.side === active.side && currentTargetPos.includes(target.posIdx)) this.isHoveringValidTarget = true;
            else if (!s.targetAlly && target.side !== active.side && currentTargetPos.includes(target.posIdx)) this.isHoveringValidTarget = true;
            else if (!s.targetAlly && target.isEnvironment && s.damageCoef > 0) this.isHoveringValidTarget = true; 

            if (this.isHoveringValidTarget) {
                let tempSkill = { ...s, targetPos: currentTargetPos }; 
                let pred = this.battleManager.getPrediction(active, target, tempSkill);
                this.cachedExpectedDmg = pred.expectedDamage;

                let top3 = pred.list.slice(0, 3);
                let listHTML = top3.map(p => {
                    let effsStr = pred.simSkill.effect || '';
                    if (pred.simSkill.id === 'flareBolt') effsStr = (target.side === active.side) ? 'ally taunt-1' : 'vulnerable-1, mark-1'; 
                    if (pred.simSkill.id === 'duck') effsStr = ''; 
                    if (pred.simSkill.id === 'invigoratingRicochet') effsStr = 'weakness-1'; 

                    let translated = [];
                    if (effsStr && p.type !== "ПРОМАХ") {
                        let cleanEffs = effsStr.split(',')
                            .filter(eff => !eff.trim().toLowerCase().startsWith('self ') && !eff.trim().toLowerCase().startsWith('ally '))
                            .join(',');
                        translated = BattleUIHelper.translateEffect(cleanEffs, p.isL, p.isU, p.isC, target.hasEffect('susceptibility'));
                    }

                    if (pred.simSkill.moveTarget && target !== active && p.type !== "ПРОМАХ") {
                        let dir = pred.simSkill.moveTarget > 0 ? 'Назад' : 'Вперед';
                        translated.push(`<span class="tt-move">${dir} ${Math.abs(pred.simSkill.moveTarget)}</span>`);
                    }
                    if (pred.simSkill.moveSelf && target === active && p.type !== "ПРОМАХ") {
                        let dir = pred.simSkill.moveSelf > 0 ? 'Назад' : 'Вперед';
                        translated.push(`<span class="tt-move">${dir} ${Math.abs(pred.simSkill.moveSelf)}</span>`);
                    }

                    let effsHTML = translated.length > 0 ? translated.join(', ') : '<span style="color:#666">Нет эффектов</span>';
                    let hitsStr = p.hits > 1 ? `<span style="font-size:10px; color:#888; margin-left:4px;">(${p.hits}x${p.singleDmg})</span>` : '';
                    let formulaRow = p.formula ? `<div style="text-align:right; font-size:9px; color:#888; margin-top:2px;">Расчет: ${p.formula}</div>` : '';

                    return `
                    <div style="margin-bottom:4px; background: rgba(255,255,255,0.08); padding: 5px 8px; border-radius: 4px; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                            <span style="color:${p.color}; min-width: 85px; font-weight:bold;">${p.type} <span style="font-size:10px; color:#aaa">(${p.prob}%)</span></span>
                            <span style="flex:1; color:#ccc; font-size:11px; margin: 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align:center;">${effsHTML}</span>
                            <span style="text-align:right; min-width: 80px;">
                                <span style="color:#ff4444; font-weight:bold; font-size: 13px;">-${p.totalDmg} HP</span>
                                ${hitsStr}
                            </span>
                        </div>
                        ${formulaRow}
                    </div>`;
                }).join('');

                predictionHTML = `
                    <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding: 0 10px;">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:42px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 8px;">ПРОГНОЗ</div>
                        <div style="position:relative; z-index:1;">${listHTML}</div>
                    </div>`;

                if (s.isAoE) {
                    let targetSide = target.isEnvironment ? (active.side === 'player' ? 'enemy' : 'player') : target.side;
                    this.cachedAoeTargets = this.gameUnits.filter(u => u.side === targetSide && !u.isDead && !u.isEnvironment && currentTargetPos.includes(u.posIdx));
                }
            }
        }

        const leftBox = document.getElementById('b-info-left');
        const rightBox = document.getElementById('b-info-right');
        
        if (leftBox && rightBox) {
            if (predictionHTML && target && !target.isEnvironment) {
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
                } else if (target.isEnvironment) {
                    leftBox.innerHTML = target.getTacticsHTML ? target.getTacticsHTML() : '';
                    rightBox.innerHTML = target.getTooltipHTML();
                } else {
                    leftBox.innerHTML = target.getTacticsHTML ? target.getTacticsHTML() : '';
                    rightBox.innerHTML = target.getTooltipHTML();
                }
            } else {
                leftBox.innerHTML = ''; rightBox.innerHTML = '';
            }
        }
    },

    draw(ctx, canvas) {
        if (this.bgLoaded) {
            ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(12, 10, 8, 0.4)"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let floorGradient = ctx.createLinearGradient(0, 680, 0, canvas.height);
            floorGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            floorGradient.addColorStop(0.1, "rgba(10, 8, 6, 0.7)");
            floorGradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
            
            ctx.fillStyle = floorGradient;
            ctx.fillRect(0, 680, canvas.width, canvas.height - 680);
        } else {
            ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (this.cachedAoeTargets.length > 1) {
            this.cachedAoeTargets.sort((a, b) => a.x - b.x);
            let first = this.cachedAoeTargets[0]; let last = this.cachedAoeTargets[this.cachedAoeTargets.length - 1];
            let centerY = first.y - (first.height / 2); 
            ctx.save();
            ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000';
            ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(first.x + first.width/2, centerY); ctx.lineTo(last.x + last.width/2, centerY); ctx.stroke();
            ctx.lineWidth = 4; const capH = 15;
            ctx.beginPath(); ctx.moveTo(first.x + 5, centerY - capH); ctx.lineTo(first.x - 5, centerY); ctx.lineTo(first.x + 5, centerY + capH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(last.x + last.width - 5, centerY - capH); ctx.lineTo(last.x + last.width + 5, centerY); ctx.lineTo(last.x + last.width - 5, centerY + capH); ctx.stroke();
            ctx.restore();
        }

        if (this.battleManager) {
            let active = this.battleManager.getActiveUnit();
            let s = active && this.battleManager.state === 'SELECT_TARGET' ? this.battleManager.selectedSkill : null;
            let currentTargetPos = s ? (s.targetPos || []) : [];
            if (s && s.id === 'buckshot' && this.lastHoverTarget) {
                if (this.lastHoverTarget.posIdx === 1) currentTargetPos = [1, 2];
                else if (this.lastHoverTarget.posIdx === 3) currentTargetPos = [2, 3];
                else currentTargetPos = [1, 2];
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
                    if (s.targetSelf) { if (unit === active) isP = true; }
                    else if (s.targetAny) { if (currentTargetPos.includes(unit.posIdx)) isP = true; }
                    else if (s.targetAlly) { if (unit.side === active.side && currentTargetPos.includes(unit.posIdx)) isP = true; }
                    else { 
                        if (unit.side !== active.side && currentTargetPos.includes(unit.posIdx)) isP = true; 
                        if (unit.isEnvironment && s.damageCoef > 0) isP = true;
                    }
                } else if (active && this.battleManager.state === 'SELECT_MOVE') {
                    if (unit.side === active.side && unit !== active && Math.abs(unit.posIdx - active.posIdx) === 1) isP = true;
                }

                let isActuallyHovered = false;
                if (this.isHoveringValidTarget && this.cachedAoeTargets.length > 0) {
                    if (this.cachedAoeTargets.includes(unit) || (this.lastHoverTarget?.isEnvironment && unit.isEnvironment)) isActuallyHovered = true;
                } else {
                    if (unit === this.lastHoverTarget) isActuallyHovered = true;
                }

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
        if (this.keyDownHandler) {
            window.removeEventListener('keydown', this.keyDownHandler);
        }
    }
};

window.spawnDamageText = (text, x, y, color) => {
    BattleScene.damageTexts.push({ text, x, y, color, life: 60 });
};

window.BattleScene = BattleScene;