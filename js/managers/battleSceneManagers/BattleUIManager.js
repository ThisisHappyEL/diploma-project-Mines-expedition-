import { CharacterRenderer } from '../hubLocationManagers/CharacterRenderer.js';
import { BattleUIHelper } from './BattleUIHelper.js';

export const BattleUIManager = {
    renderTurnQueue(scene) {
        const container = document.getElementById('b-turn-queue');
        if (!container || !scene.battleManager) return;

        const portraitConfigs = {
            player: { scale: "5", translateX: "-10%", translateY: "-10%" },
            enemy: {
                "Мать": { size: "200%", posX: "50%", posY: "50%" },
                "Витраж": { size: "240%", posX: "50%", posY: "50%" },
                "Амальгама": { size: "400%", posX: "50%", posY: "80%" },
                "Стеклянный": { size: "500%", posX: "50%", posY: "90%" },
                "Фритта": { size: "550%", posX: "50%", posY: "90%" },
                "default": { size: "200%", posX: "20%", posY: "50%" }
            }
        };

        container.innerHTML = scene.battleManager.turnQueue.map((unit, index) => {
            const sideClass = unit.side === 'player' ? 'player' : 'enemy';
            const activeClass = index === 0 ? 'active' : '';
            
            let avatarContent;
            if (unit.side === 'player') {
                const layeredHTML = CharacterRenderer.getAvatarHTML(unit, "100%", true);
                const cfg = portraitConfigs.player;
                avatarContent = `
                    <div class="char-avatar-layered" style="width:100%; height:100%; background: transparent; border: none; box-shadow: none; overflow:hidden; transform: scale(${cfg.scale}) translateX(${cfg.translateX}) translateY(${cfg.translateY}); transform-origin: top center;">
                        ${layeredHTML}
                    </div>
                `;
            } else if (unit.sprite && unit.sprite.src) {
                let cfg = portraitConfigs.enemy.default;
                const name = unit.name.toLowerCase();
                if (name.includes("мать")) cfg = portraitConfigs.enemy["Мать"];
                else if (name.includes("витраж")) cfg = portraitConfigs.enemy["Витраж"];
                else if (name.includes("амальгама")) cfg = portraitConfigs.enemy["Амальгама"];
                else if (name.includes("стеклянный")) cfg = portraitConfigs.enemy["Стеклянный"];
                else if (name.includes("фритта")) cfg = portraitConfigs.enemy["Фритта"];
                
                avatarContent = `<div style="width:100%; height:100%; background-image: url('${unit.sprite.src}'); background-size: ${cfg.size}; background-position: ${cfg.posX} ${cfg.posY}; background-repeat: no-repeat; border-radius: 4px;"></div>`;
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

    updateSkillsPanel(scene, activeUnit, skills, manager) {
        this.renderTurnQueue(scene);
        const skillsRow = document.getElementById('b-skills-row');
        if (!skillsRow) return;
        skillsRow.innerHTML = '';
        
        const mBtn = document.getElementById('b-btn-move');
        const rBtn = document.getElementById('b-btn-rest');

        if (!activeUnit || activeUnit.side !== 'player' || manager.state === 'EXECUTING') {
            mBtn.style.opacity = '0.3'; mBtn.onclick = null; mBtn.onmouseenter = null; mBtn.onmouseleave = null;
            rBtn.style.opacity = '0.3'; rBtn.onclick = null; rBtn.onmouseenter = null; rBtn.onmouseleave = null;
            this.updateInfoPanels(scene);
            return;
        }

        if (activeUnit.stamina < 3) {
            mBtn.style.opacity = '0.3'; mBtn.onclick = null; mBtn.onmouseenter = null; mBtn.onmouseleave = null;
        } else {
            mBtn.style.opacity = '1';
            mBtn.onclick = () => { manager.selectMoveAction(); scene.updateStateAndDOM(); };
            mBtn.onmouseenter = () => { scene.hoveredObject = { type: 'skill', data: { name: "Движение", description: "Смена позиции с соседним союзником. (-3 Выносливости)", isMove: true } }; scene.updateStateAndDOM(); };
            mBtn.onmouseleave = () => { scene.hoveredObject = null; scene.updateStateAndDOM(); };
        }

        rBtn.style.opacity = '1';
        rBtn.onclick = () => { manager.performRest(); scene.updateStateAndDOM(); };
        rBtn.onmouseenter = () => { scene.hoveredObject = { type: 'skill', data: { name: "Отдых", description: "Пропуск хода для восстановления сил (+15 Выносливости).", isRest: true } }; scene.updateStateAndDOM(); };
        rBtn.onmouseleave = () => { scene.hoveredObject = null; scene.updateStateAndDOM(); };

        const baseDmg = activeUnit.equipment?.rightHand?.baseDamage || 10;
        const effectiveBase = activeUnit.equipment?.leftHand === null ? Math.round(baseDmg * 1.3) : baseDmg;

        skills.forEach(skill => {
            let btn = document.createElement('button');
            btn.className = 'skill-btn';
            
            let isActive = manager.selectedSkill?.id === skill.id;
            if (isActive) btn.classList.add('active');
            
            if (!scene.iconCache) scene.iconCache = {}; 
            
            if (scene.iconCache[skill.id] === true) {
                btn.innerHTML = `<img src="assets/img/weaponSkillsIcons/${skill.id}.png" style="width:100%; height:100%; object-fit:cover; pointer-events:none; display:block;" />`;
                btn.style.padding = '0'; 
                btn.style.overflow = 'visible';
                btn.style.backgroundColor = '#000'; 
                
                if (isActive) {
                    btn.style.height = '140px'; btn.style.transform = 'translateY(-37px)'; btn.style.zIndex = '100'; 
                    btn.style.boxShadow = '0 15px 25px rgba(0,0,0,0.8), 0 0 15px #ffbf00'; btn.style.borderColor = '#ffbf00';
                } else {
                    btn.style.height = '65px'; btn.style.transform = 'translateY(0)'; btn.style.zIndex = '1'; btn.style.borderColor = '#444';
                }
            } else {
                btn.innerText = skill.name;
                if (scene.iconCache[skill.id] === undefined) {
                    scene.iconCache[skill.id] = 'loading'; 
                    let img = new Image();
                    img.onload = () => { 
                        scene.iconCache[skill.id] = true; 
                        this.updateSkillsPanel(scene, activeUnit, skills, manager); 
                    };
                    img.onerror = () => { scene.iconCache[skill.id] = false; };
                    img.src = `assets/img/weaponSkillsIcons/${skill.id}.png`; 
                }
            }
            
            let isPosValid = skill.validPos?.includes(activeUnit.posIdx);
            let hasTarget;
            
            if (skill.targetSelf || skill.targetAny) {
                hasTarget = true; 
            } else {
                const targetSide = skill.targetAlly ? activeUnit.side : (activeUnit.side === 'player' ? 'enemy' : 'player');
                hasTarget = scene.gameUnits.some(u => !u.isDead && u.side === targetSide && skill.targetPos?.includes(u.posIdx));
                if (!skill.targetAlly && skill.damageCoef > 0) {
                    if (scene.gameUnits.find(u => u.isEnvironment)) hasTarget = true;
                }
            }

            let needsAmmo = ['aimedShot', 'duck', 'snapShot', 'broadheadBolt', 'heavyBolt', 'fireBolt', 'vulnerableSpot', 'flareBolt',
                             'frontRearSights', 'buckshot', 'shotIntoAir', 'piercedArtery', 'piercingShot', 'stayAway'].includes(skill.id);
            let hasAmmo = activeUnit.hasEffect('ammo');
            let isVulnerableSpotValid = skill.id !== 'vulnerableSpot' || activeUnit.hasEffect('combo') || scene.gameUnits.some(u => u.side !== activeUnit.side && !u.isDead && u.hasEffect('mark'));
            let isRapidFireValid = skill.id !== 'rapidFire' || activeUnit.hasEffect('combo');
            let sCost = skill.staminaCost !== undefined ? skill.staminaCost : 6;
            
            if (!isPosValid || !hasTarget || (needsAmmo && !hasAmmo) || !isVulnerableSpotValid || !isRapidFireValid || activeUnit.stamina < sCost) {
                btn.disabled = true;
            }

            if (skill.id === 'allInThisStrike') {
                const controlEffects = ['stun', 'daze', 'fear', 'inWeb', 'instability'];
                if (activeUnit.activeEffects.some(e => controlEffects.includes(e.base.id))) btn.disabled = true; 
            }
            
            let finalDmg = Math.round(effectiveBase * (skill.damageCoef || 0));
            
            btn.onclick = () => { manager.selectSkill(skill); scene.updateStateAndDOM(); };
            btn.onmouseenter = () => { scene.hoveredObject = { type: 'skill', data: { ...skill, finalDmg } }; scene.updateStateAndDOM(); };
            btn.onmouseleave = () => { scene.hoveredObject = null; scene.updateStateAndDOM(); };
            
            skillsRow.appendChild(btn);
        });
        
        this.updateInfoPanels(scene);
    },

    updateInfoPanels(scene) {
        if (!scene.battleManager) return;

        let active = scene.battleManager.getActiveUnit();
        let s = active && scene.battleManager.state === 'SELECT_TARGET' ? scene.battleManager.selectedSkill : null;
        
        let hFieldU = null;
        scene.gameUnits.forEach(u => { if (u.isClicked(scene.mouseX, scene.mouseY)) hFieldU = u; });
        const target = hFieldU || scene.hoverQueueUnit;

        scene.lastHoverTarget = target;
        scene.cachedExpectedDmg = 0;
        scene.cachedExpectedStamina = 0;
        scene.cachedAoeTargets = [];
        scene.isHoveringValidTarget = false;
        
        let predictionHTML = null;

        if (active && active.side === 'player') {
            if (scene.hoveredObject?.type === 'skill') {
                if (scene.hoveredObject.data.isMove) scene.cachedExpectedStamina = 3;
                else if (scene.hoveredObject.data.isRest) scene.cachedExpectedStamina = -15;
                else scene.cachedExpectedStamina = scene.hoveredObject.data.staminaCost !== undefined ? scene.hoveredObject.data.staminaCost : 6;
            } else if (s) {
                scene.cachedExpectedStamina = s.staminaCost !== undefined ? s.staminaCost : 6;
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
            if (s.targetSelf && target === active) scene.isHoveringValidTarget = true;
            else if (s.targetAny && currentTargetPos.includes(target.posIdx)) scene.isHoveringValidTarget = true;
            else if (s.targetAlly && target.side === active.side && currentTargetPos.includes(target.posIdx)) scene.isHoveringValidTarget = true;
            else if (!s.targetAlly && target.side !== active.side && currentTargetPos.includes(target.posIdx)) scene.isHoveringValidTarget = true;
            else if (!s.targetAlly && target.isEnvironment && s.damageCoef > 0) scene.isHoveringValidTarget = true; 

            if (scene.isHoveringValidTarget) {
                let tempSkill = { ...s, targetPos: currentTargetPos }; 
                let pred = scene.battleManager.getPrediction(active, target, tempSkill);
                scene.cachedExpectedDmg = pred.expectedDamage;

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
                    scene.cachedAoeTargets = scene.gameUnits.filter(u => u.side === targetSide && !u.isDead && !u.isEnvironment && currentTargetPos.includes(u.posIdx));
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
            else if (scene.hoveredObject?.type === 'skill') {
                if (scene.hoveredObject.data.isMove || scene.hoveredObject.data.isRest) {
                    leftBox.innerHTML = `
                        <div style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:42px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 8px;">ДЕЙСТВИЕ</div>
                            <div style="position:relative; z-index:1; text-align:center;">
                                <h4 style="color:#ffbf00; margin:0 0 10px 0; text-transform:uppercase;">${scene.hoveredObject.data.name}</h4>
                                <div style="color:#aaa; font-size:13px; line-height:1.4;">${scene.hoveredObject.data.description}</div>
                            </div>
                        </div>`;
                    rightBox.innerHTML = '';
                } else {
                    const info = BattleUIHelper.getSkillDetailedHTML(scene.hoveredObject.data, active);
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
    }
};
