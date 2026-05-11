import { EFFECTS } from '../data/battleData/effects.js';

export const BattleUIHelper = {
    translateEffect(effectString, isLucky = false, isUnlucky = false, isCrit = false, isSusceptible = false) {
        if (!effectString) return [];
        let translated = [];
        const NO_SCALE = ['SHUFFLE', 'MOVETARGET', 'MOVESELF']; 

        let hasSelf = false;
        let hasAlly = false;

        effectString.split(',').forEach(part => {
            let p = part.trim().replace(':', '-'); 
            
            if (p.toLowerCase().startsWith('self ')) hasSelf = true;
            if (p.toLowerCase().startsWith('ally ')) hasAlly = true;
            const cleanPart = p.toLowerCase().replace('self ', '').replace('ally ', '').trim();

            const params = cleanPart.split('-');
            const effectId = params[0].toUpperCase();
            let val = parseInt(params[1]) || 1;
            
            if (!NO_SCALE.includes(effectId)) {
                if (isCrit) val += 2;
                else if (isLucky) val += 1;
                else if (isUnlucky) val -= 1;
                val = Math.max(0, val);
            }
            if (val === 0 && !NO_SCALE.includes(effectId)) return;

            const effectBase = EFFECTS[effectId];
            let text = "";

            if (effectId === 'MOVETARGET' || effectId === 'MOVESELF') {
                const dir = val > 0 ? 'Назад' : 'Вперед';
                text = `<span class="tt-move">${dir} ${Math.abs(parseInt(params[1]))}</span>`; 
            } 
            else if (effectId === 'DOT') {
                let dotDmg = parseInt(params[2]) || 2;
                if (isCrit) dotDmg += 2;
                else if (isLucky) dotDmg += 1;
                else if (isUnlucky) dotDmg -= 1;
                
                // ИСПРАВЛЕНИЕ: Влияние восприимчивости
                if (isSusceptible) {
                    dotDmg += 1;
                    val += 1;
                }
                dotDmg = Math.max(1, dotDmg);

                text = `Кровотечение (${dotDmg} ур, ${val} ход)`; 
                if (isSusceptible) text += " <span style='color:#b19cd9; font-size:9px;'>(Восприимч.)</span>";

            } else if (effectBase) {
                // ИСПРАВЛЕНИЕ: Восприимчивость увеличивает длительность и жетоны (если это дебафф)
                if (isSusceptible && effectBase.type === 'debuff') val += 1;
                text = `${effectBase.name} (${val})`; 
                if (isSusceptible && effectBase.type === 'debuff') text += " <span style='color:#b19cd9; font-size:9px;'>(Восприимч.)</span>";
            } else {
                text = params[0];
            }

            let cssClass = 'tt-debuff'; 
            if (effectBase && effectBase.type === 'buff') cssClass = 'tt-buff';
            
            if (!effectId.includes('MOVE')) translated.push(`<span class="${cssClass}">${text}</span>`);
            else translated.push(text); 
        });

        return translated; 
    },

    getRangeHTML(skill) {
        if (skill.isMove || skill.isRest) return `<div style="color:#aaa; text-align: center; margin: 5px 0;">Обмен позицией с соседним союзником</div>`;
        let validHTML = ''; 
        const validPos = skill.validPos || [1,2,3,4];
        const targetPos = skill.targetPos || [];
        
        for (let i = 4; i >= 1; i--) {
            let cl = validPos.includes(i) ? 'pos-dot yellow' : 'pos-dot';
            validHTML += `<div class="${cl}"></div>`;
        }

        if (!skill.targetSelf && targetPos.length > 0) {
            let dots = '';
            let minT = Math.min(...targetPos); let maxT = Math.max(...targetPos);
            for (let i = 1; i <= 4; i++) {
                let colorClass = skill.targetAlly ? 'green' : 'red';
                dots += `<div class="pos-dot ${targetPos.includes(i) ? colorClass : ''} aoe-dot"></div>`;
            }
            
            let targetContent = skill.isAoE 
                ? `<div class="aoe-line-container"><div class="aoe-line" style="left:${(minT-1)*16+2}px; width:${(maxT-minT)*16+8}px;"></div>${dots}</div>`
                : `<div class="pos-group">${dots}</div>`;

            return `<div class="pos-container"><div class="pos-group">${validHTML}</div><span style="color:#555; margin: 0 4px;">»</span>${targetContent}</div>`;
        }
        return `<div class="pos-container"><div class="pos-group">${validHTML}</div></div>`;
    },

    getSkillDetailedHTML(skill, attacker) {
        let weaponBase = attacker?.equipment?.rightHand?.baseDamage || 10;
        let hasOffhandBonus = (attacker?.equipment && attacker.equipment.leftHand === null);
        let effectiveBase = hasOffhandBonus ? Math.round(weaponBase * 1.3) : weaponBase;

        // Формируем красивую базу для вывода
        let baseStr = `${weaponBase}`;
        if (hasOffhandBonus) baseStr += ` * 130%`;

        const formatReward = (reward) => {
            if (!reward) return "Нет данных";
            if (typeof reward === 'string') return reward;
            let p = [];
            if (reward.hits) p.push(`<span style="color:#ffbf00">Кол-во ударов: ${reward.hits}</span>`);
            if (reward.damageCoef) {
                let d = Math.round(effectiveBase * reward.damageCoef);
                let coefPct = Math.round(reward.damageCoef * 100); // Превращаем в проценты
                p.push(`Урон: ${skill.hits > 1 || reward.hits > 1 ? (reward.hits || skill.hits)+'x' : ''}${d} <small style="color:#888;">(База ${baseStr} * ${coefPct}%)</small>`);
            }
            if (reward.effect) p.push(...this.translateEffect(reward.effect));
            return p.length > 0 ? p.join(', ') : "Свойства улучшены";
        };

        if (skill.isMove || skill.isRest) {
            return { leftHTML: `<h4 style="color:#ffbf00; margin:0; text-transform:uppercase;">${skill.name}</h4><div class="tt-divider"></div><div class="tt-desc">${skill.description}</div>`, rightHTML: '' };
        }

        let finalDmg = Math.round(effectiveBase * (skill.damageCoef || 0));
        let coefPctMain = Math.round((skill.damageCoef || 0) * 100);
        let dmgDisplay = finalDmg > 0 ? `<div class="tt-dmg" style="margin:0; font-size:16px;">Урон: ${skill.hits > 1 ? skill.hits+'x' : ''}${finalDmg} <small style="color:#888; font-weight:normal; font-size:12px;">(База ${baseStr} * ${coefPctMain}%)</small></div>` : "";

        let leftHTML = `
            <div style="display:flex; justify-content:space-between; align-items: flex-start;">
                <h4 style="color:#ffbf00; margin:0; font-size:18px; text-transform:uppercase;">${skill.name}</h4>
                ${dmgDisplay}
            </div>
            <div class="tt-type" style="margin-top:2px; font-size:13px;">${skill.type === 'melee' ? '🗡 Ближний бой' : (skill.type === 'ranged' ? '🏹 Дальний бой' : '🛡 Поддержка')}</div>
            <div class="tt-divider"></div>
            ${this.getRangeHTML(skill)}
        `;

        let rightChunks = [];
        
        if (skill.id === 'flareBolt') {
            rightChunks.push(`<div style="font-size:13px; line-height:1.4;"><span style="color:#ffbf00; font-weight:bold;">По врагу:</span> <span class="tt-debuff">Уязвимость (1)</span>, <span class="tt-debuff">Метка (1)</span><br><span style="color:#ffbf00; font-weight:bold;">По союзнику:</span> <span class="tt-buff">Провокация (1)</span><br><span style="color:#ffbf00; font-weight:bold;">Ост. союзники:</span> <span class="tt-buff">Уклонение (1)</span></div>`);
        }
        else if (skill.id === 'invigoratingRicochet') {
            rightChunks.push(`<div style="font-size:13px; line-height:1.4;"><span style="color:#ffbf00; font-weight:bold;">Цель:</span> <span class="tt-debuff">Слабость (1)</span><br><span style="color:#ffbf00; font-weight:bold;">Зерк. союзник:</span> <span class="tt-buff">Сила (1)</span></div>`);
        }
        else if (skill.id === 'duck') {
            rightChunks.push(`<div style="font-size:13px; line-height:1.4;"><span style="color:#ffbf00; font-weight:bold;">Передовые союзники:</span> <span class="tt-buff">Комбо (1)</span></div>`);
        }
        else if (skill.id === 'sweep') {
            rightChunks.push(`<div style="font-size:13px; line-height:1.4;"><span style="color:#ffbf00; font-weight:bold;">Цель:</span> <span class="tt-move">Вперед 1</span></div>`);
        }
        else {
            let targetLine = []; let selfLine = []; let allyLine = [];
            let forceSelf = skill.targetSelf; 

            if (skill.effect) {
                let parts = skill.effect.split(',');
                parts.forEach(p => {
                    let clean = p.trim();
                    let translatedStr = this.translateEffect(clean)[0].replace('Погруженец: ', '').replace('Союзник: ', '');
                    
                    if (forceSelf) selfLine.push(translatedStr);
                    else if (clean.toLowerCase().startsWith('self ')) selfLine.push(translatedStr);
                    else if (clean.toLowerCase().startsWith('ally ')) allyLine.push(translatedStr);
                    else targetLine.push(translatedStr);
                });
            }

            if (skill.moveTarget) {
                let dir = skill.moveTarget > 0 ? 'Назад' : 'Вперед';
                let str = `<span class="tt-move">${dir} ${Math.abs(skill.moveTarget)}</span>`;
                if (forceSelf) selfLine.push(str); else targetLine.push(str);
            }
            if (skill.moveSelf) {
                let dir = skill.moveSelf > 0 ? 'Назад' : 'Вперед';
                selfLine.push(`<span class="tt-move">${dir} ${Math.abs(skill.moveSelf)}</span>`);
            }

            let combinedHTML = "";
            if (targetLine.length > 0) combinedHTML += `<span style="color:#ffbf00; font-weight:bold;">Цель:</span> ${targetLine.join(', ')}<br>`;
            if (selfLine.length > 0) combinedHTML += `<span style="color:#ffbf00; font-weight:bold;">Погруженец:</span> ${selfLine.join(', ')}<br>`;
            if (allyLine.length > 0) combinedHTML += `<span style="color:#ffbf00; font-weight:bold;">Союзник:</span> ${allyLine.join(', ')}<br>`;

            if (combinedHTML) {
                rightChunks.push(`<div style="font-size:13px; line-height:1.4;">${combinedHTML}</div>`);
            }
        }

        if (skill.uniqueCondition || (skill.comboOrMarkImproveable && skill.comboChanges)) {
            let blocks = [];
            if (skill.uniqueCondition) {
                blocks.push(`
                    <div class="tt-condition" style="flex:1; padding:3px 6px; background:rgba(255,191,0,0.05); border-left:2px solid #ffbf00; font-size: 11px; line-height: 1.2;">
                        <span style="color:#ffbf00; font-weight:bold;">Условие:</span> <span style="color:#ccc;">${skill.uniqueCondition}</span><br>
                        <span style="color:#4affab; font-weight:bold;">Награда:</span> <span style="color:#fff;">${formatReward(skill.uniqueConditionReward)}</span>
                    </div>
                `);
            }
            if (skill.comboOrMarkImproveable && skill.comboChanges) {
                blocks.push(`
                    <div class="tt-combo" style="flex:1; padding:3px 6px; background:rgba(74,255,171,0.05); border-left:2px solid #4affab; font-size: 11px; line-height: 1.2;">
                        <div style="color:#4affab; font-weight:bold;">Комбо:</div>
                        <div style="color:#fff;">${formatReward(skill.comboChanges)}</div>
                    </div>
                `);
            }
            rightChunks.push(`<div style="display:flex; gap:6px; width:100%; margin-top: 2px;">${blocks.join('')}</div>`);
        }

        if (skill.description) rightChunks.push(`<div class="tt-desc" style="font-size:12px; border:none; padding:0; line-height:1.2;">${skill.description}</div>`);
        let rightHTML = `<div style="display:flex; flex-direction:column; gap: 4px;">` + rightChunks.join('<div class="tt-divider" style="margin:2px 0;"></div>') + `</div>`;

        return { leftHTML, rightHTML };
    }
};