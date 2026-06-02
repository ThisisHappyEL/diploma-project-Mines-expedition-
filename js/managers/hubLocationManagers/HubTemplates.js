import { TooltipManager } from './TooltipManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { RecruitManager } from './RecruitManager.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { STAT_ICONS} from '../../data/workersData/labels.js';
import { HubManager } from './HubManager.js';
import { BattleUIHelper } from '../battleSceneManagers/BattleUIHelper.js';

export class HubTemplates {
    static getCharRowHTML(adv) {
        const traitDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
        const maxH = RecruitManager.getStat(adv, 'hp');
        const maxS = RecruitManager.getStat(adv, 'stamina');

        const zoomSize = "425px"; 
        const offsetX = "-190px";  
        const offsetY = "-40px";  

        const hpColor = adv.hp < maxH ? '#ff6666' : '#fff';
        const stColor = adv.stamina < maxS ? '#4affab' : '#fff';

        return `
            <div class="avatar-slice" style="width: 90px; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing:border-box; z-index: 15;">
                <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                    ${CharacterRenderer.getAvatarHTML(adv, zoomSize, true)}
                </div>
            </div>
            
            <div style="flex: 0 0 28%; display: flex; flex-direction: column; justify-content: center; gap:4px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; position: relative; z-index: 1;">
                <b style="color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.name}</b>
                <span style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 100%;">${adv.background} <span style="color:#555;">|</span> <b style="color:var(--color-success);">${traitDeclined}</b></span>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap:8px; height: 100%; padding: 5px 12px; min-width: 0; box-sizing: border-box; border-left: 2px solid var(--color-gold);">
                <div style="display:flex; gap:10px; font-size:13px; color:${hpColor}; font-weight:bold;">
                    <span style="color:${hpColor}">❤️ ${Math.floor(adv.hp)}/${maxH}</span>
                    <span style="color:${stColor}">💨 ${Math.floor(adv.stamina)}/${maxS}</span>
                </div>
                <div style="display:flex; gap:8px; font-size:13px; color:#ccc; flex-wrap:nowrap; align-items:center;">
                    <span>⚔️ ${RecruitManager.getStat(adv, 'battle')}</span>
                    <span>⛏️ ${RecruitManager.getStat(adv, 'mining')}</span>
                    <span>📚 ${RecruitManager.getStat(adv, 'research')}</span>
                    <span>🔨 ${RecruitManager.getStat(adv, 'construction')}</span>
                    <span>🪔 ${RecruitManager.getStat(adv, 'scouting')}</span>
                    <span style="color:var(--color-gold); font-weight:bold; margin-left:12px; font-size:13px;">🕯️ ${adv.salary}</span>
                </div>
            </div>
        `;
    }

    static getCardHTML(adv, isHire = false) {
        const bgData = BACKGROUNDS[adv.background];
        const maxH = RecruitManager.getStat(adv, 'hp');
        const maxS = RecruitManager.getStat(adv, 'stamina');

        const getHov = (s) => {
            const ttId = TooltipManager.registerTooltip(HubManager.getStatTooltip(adv, s));
            return `data-tooltip-id="${ttId}"`;
        };

        const traitNameDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);

        const bgT = `<b>Предыстория: ${adv.background}</b><br>${bgData.description}<br><br>Разброс базы:<br><center>${STAT_ICONS.battle} ${bgData.stats.battle.join('-')}</center><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.mining} ${bgData.stats.mining.join('-')}</span><span>${STAT_ICONS.research} ${bgData.stats.research.join('-')}</span></div><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.construction} ${bgData.stats.construction.join('-')}</span><span>${STAT_ICONS.scouting} ${bgData.stats.scouting.join('-')}</span></div><hr style='border:none; border-bottom:1px solid #444'><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.hp} ${bgData.stats.hp.join('-')}</span><span>${STAT_ICONS.stamina} ${bgData.stats.stamina.join('-')}</span></div>`;
        const trT = `<b>Черта: ${traitNameDeclined}</b><br>${Object.entries(adv.traits[0].effect||{}).map(([k,v])=>v!==0?STAT_ICONS[k]+' '+(v>0?'+'+v:v):'').filter(x=>x!=='').join('<br>')}`;
        
        const weaponTtId = adv.equipment.rightHand ? TooltipManager.registerTooltip(HubManager.getItemTooltip(adv.equipment.rightHand)) : '';
        const armorItem = adv.equipment.body || adv.civilBody;
        const armorTtId = armorItem ? TooltipManager.registerTooltip(HubManager.getItemTooltip(armorItem)) : '';

        const weaponAttr = adv.equipment.rightHand ? `style="cursor:help; color:#4affab; border-bottom: 1px dotted" data-tooltip-id="${weaponTtId}"` : `style="color:#555"`;
        const armorAttr = armorItem ? `style="cursor:help; color:#aaa; border-bottom: 1px dotted" data-tooltip-id="${armorTtId}"` : `style="color:#555"`;

        const weaponLabel = adv.equipment.rightHand ? adv.equipment.rightHand.name : "Нет оружия";
        const armorLabel = armorItem ? armorItem.name : "Лохмотья";

        const rangeData = HubManager.getUnitRangeData(adv);
        const hasRanks = Object.values(rangeData.ranks).some(v => v > 0);
        const rangeWidget = hasRanks ? `<div style="height: 20px; margin-bottom: 5px;">${this.getRangeHTML(rangeData.ranks, rangeData.targets)}</div>` : "";

        const bgTtId = TooltipManager.registerTooltip(bgT);
        const trTtId = TooltipManager.registerTooltip(trT);

        const avatarHtml = CharacterRenderer.getAvatarHTML(adv, 90);

        return `
            <div class="char-card-header" style="display: flex; gap: 15px; height: 95px; margin-bottom: 10px;">
                ${avatarHtml}
                <div style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; min-width: 0;">
                    <div style="display:flex; justify-content:space-between; align-items: baseline;">
                        <h3 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${adv.name}</h3>
                        <span style="color:#aaa; font-size:12px;">ур. ${adv.level}</span>
                    </div>
                    <div style="font-size:12px; margin-top: 2px;"><span style="cursor:help; border-bottom: 1px dotted #888;" data-tooltip-id="${bgTtId}">${adv.background}</span></div>
                    <div style="font-size:12px; margin-top: 2px; color:#4affab;"><span style="cursor:help; border-bottom: 1px dotted #4affab;" data-tooltip-id="${trTtId}">${adv.traits[0].name}</span></div>
                </div>
            </div>
            ${rangeWidget}
            <div class="hub-stats-container">
                <div class="hub-stats-center"><div class="hub-stats-item" ${getHov('battle')} style="color:${HubManager.getStatColor(adv,'battle',isHire)}">${STAT_ICONS.battle} ${RecruitManager.getStat(adv,'battle')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('mining')} style="color:${HubManager.getStatColor(adv,'mining',isHire)}">${STAT_ICONS.mining} ${RecruitManager.getStat(adv,'mining')}</div><div class="hub-stats-item" ${getHov('research')} style="color:${HubManager.getStatColor(adv,'research',isHire)}">${STAT_ICONS.research} ${RecruitManager.getStat(adv,'research')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('construction')} style="color:${HubManager.getStatColor(adv,'construction',isHire)}">${STAT_ICONS.construction} ${RecruitManager.getStat(adv,'construction')}</div><div class="hub-stats-item" ${getHov('scouting')} style="color:${HubManager.getStatColor(adv,'scouting',isHire)}">${STAT_ICONS.scouting} ${RecruitManager.getStat(adv,'scouting')}</div></div>
                <div class="hub-stats-divider"></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('hp')} style="color:${HubManager.getStatColor(adv,'hp',isHire)}">${STAT_ICONS.hp} ${adv.hp}/${maxH}</div><div class="hub-stats-item" ${getHov('stamina')} style="color:${HubManager.getStatColor(adv,'stamina',isHire)}">${STAT_ICONS.stamina} ${adv.stamina}/${maxS}</div></div>
            </div>
            
            <div style="margin-top: 15px; font-size: 11px; text-align: center; border-top: 1px dotted #444; padding-top: 10px;">
                <div style="margin-bottom: 3px;">⚔️ <span ${weaponAttr}>${weaponLabel}</span></div>
                <div>🛡️ <span ${armorAttr}>${armorLabel}</span></div>
            </div>

            <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:flex-end; padding-top: 10px;">
                ${isHire ? `<button class="hub-btn action-btn" style="width: auto; padding: 5px 15px; margin:0;" onclick="HubManager.hireFromTavern(${adv.id})">Нанять</button>` : '<div></div>'}
                <div class="salary" style="margin: 0; padding: 0;">Плата: ${adv.salary} 🕯️</div>
            </div>
        `;
    }

    static getRangeHTML(rankCounts, targetCounts, isSkill = false) {
        let html = `<div class="range-display">`;
        
        html += `<div class="range-group">`;
        [4, 3, 2, 1].forEach(i => {
            let status = '';
            if (isSkill) {
                if (Array.isArray(rankCounts) && rankCounts.includes(i)) status = 'active high';
            } else {
                const count = rankCounts[i] || 0;
                if (count > 0) status = 'active ' + (count >= 3 ? 'high' : 'low');
            }
            html += `<div class="range-dot rank ${status}"></div>`;
        });
        html += `</div>`;

        html += `<div style="color: #555; font-weight: bold; margin: 0 4px;"> > </div>`;

        html += `<div class="range-group">`;
        [1, 2, 3, 4].forEach(i => {
            let status = '';
            if (isSkill) {
                if (Array.isArray(targetCounts) && targetCounts.includes(i)) status = 'active high';
            } else {
                const count = targetCounts[i] || 0;
                if (count > 0) status = 'active ' + (count >= 3 ? 'high' : 'low');
            }
            html += `<div class="range-dot target ${status}"></div>`;
        });
        html += `</div>`;

        html += `</div>`;
        return html;
    }

    static getSkillTooltipHTML(skill, parentWeapon = null) {
        if (!skill) return '';

        const defaults = parentWeapon?.defaultSkillData || {
            type: 'melee',
            validPos: [1, 2],
            targetPos: [1, 2],
            hits: 1,
            damageCoef: 1.0,
            moveSelf: 0,
            moveTarget: 0,
            isAoE: false
        };

        const type = skill.type || defaults.type;
        const validPos = skill.validPos || defaults.validPos || [1, 2];
        const targetPos = skill.targetPos || defaults.targetPos || [1, 2];
        const hits = skill.hits !== undefined ? skill.hits : (defaults.hits || 1);
        const damageCoef = skill.damageCoef !== undefined ? skill.damageCoef : (defaults.damageCoef || 1.0);
        const moveSelf = skill.moveSelf !== undefined ? skill.moveSelf : (defaults.moveSelf || 0);
        const moveTarget = skill.moveTarget !== undefined ? skill.moveTarget : (defaults.moveTarget || 0);
        const isAoE = skill.isAoE !== undefined ? skill.isAoE : (defaults.isAoE || false);

        const baseDmg = parentWeapon?.baseDamage || 10;
        const hasOffhandBonus = !HubManager.inspectedAdv || (HubManager.inspectedAdv.equipment && HubManager.inspectedAdv.equipment.leftHand === null);
        const effectiveBase = hasOffhandBonus ? Math.round(baseDmg * 1.3) : baseDmg;

        let baseStr = `${baseDmg}`;
        if (hasOffhandBonus) baseStr += ` * 130%`;

        const singleHitDmg = Math.round(effectiveBase * damageCoef);
        const totalDmg = singleHitDmg * hits;

        let h = `<div class="unit-card-mini" style="width: 100%; font-family: 'Segoe UI', sans-serif; text-align: left; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">`;

        h += `<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">`;
        h += `<div>`;
        h += `  <h3 style="color: var(--color-gold); margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${skill.name}</h3>`;
        
        let typeLabel = '🗡️ Ближний бой';
        if (type === 'ranged') typeLabel = '🏹 Дальний бой';
        else if (type === 'support' || type === 'none') typeLabel = '🛡️ Поддержка';
        h += `  <div style="color: #888; font-size: 12px; font-style: italic; margin-top: 2px;">${typeLabel}</div>`;
        h += `</div>`;

        if (damageCoef > 0) {
            h += `<div style="text-align: right;">`;
            h += `  <span style="color: #fff; font-size: 16px; font-weight: bold;">Урон: ${hits > 1 ? hits+'x' : ''}${totalDmg}</span>`;
            h += `  <span style="display: block; color: #777; font-size: 10px; margin-top: 2px;">(База ${baseStr} * ${Math.round(damageCoef * 100)}%)</span>`;
            h += `</div>`;
        }
        h += `</div>`;

        h += `<div class="tt-divider" style="height: 1px; background: linear-gradient(to right, #ffbf00, transparent); margin: 6px 0;"></div>`;

        h += `<div style="margin: 12px 0; display: flex; justify-content: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; border: 1px solid #222;">`;
        h += this.getSkillRangeHTML(validPos, targetPos, isAoE);
        h += `</div>`;

        let effectsArray = [];
        if (skill.effect) {
            effectsArray.push(...BattleUIHelper.translateEffect(skill.effect));
        }

        if (moveSelf !== 0) {
            let dir = moveSelf > 0 ? 'Назад' : 'Вперед';
            effectsArray.push(`<span class="tt-move">Погруженец: ${dir} ${Math.abs(moveSelf)}</span>`);
        }
        if (moveTarget !== 0) {
            let dir = moveTarget > 0 ? 'Назад' : 'Вперед';
            effectsArray.push(`<span class="tt-move">Цель: ${dir} ${Math.abs(moveTarget)}</span>`);
        }

        if (effectsArray.length > 0) {
            h += `<div style="font-size: 13px; color: #fff; background: rgba(255, 255, 255, 0.03); padding: 5px 8px; border-radius: 3px; margin-bottom: 8px; border-left: 2px solid #555;">`;
            h += effectsArray.join(' <span style="color: #444; margin: 0 6px;">|</span> ');
            h += `</div>`;
        }

        const hasCondition = skill.uniqueCondition !== undefined && skill.uniqueCondition !== false;
        const hasCombo = skill.comboOrMarkImproveable || skill.comboChanges;

        if (hasCondition || hasCombo) {
            h += `<div style="display: flex; gap: 8px; margin-bottom: 8px;">`;
            
            if (hasCondition) {
                const condText = skill.uniqueCondition;
                const rewardHTML = BattleUIHelper.formatReward(skill.uniqueConditionReward, baseStr, effectiveBase, skill);
                
                h += `
                <div style="flex: 1; border-left: 2px solid var(--color-warning); background: rgba(255, 170, 68, 0.04); padding: 6px 10px; border-radius: 0 4px 4px 0; font-size: 11px; line-height: 1.3;">
                    <div style="color: var(--color-warning); font-weight: bold; margin-bottom: 2px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Условие:</div>
                    <div style="color: #ddd; margin-bottom: 3px;">${condText}</div>
                    <div style="color: var(--color-success); font-weight: bold; font-size: 9px; text-transform: uppercase;">Награда:</div>
                    <div style="color: #4affab;">${rewardHTML}</div>
                </div>`;
            }

            if (hasCombo) {
                const comboContent = BattleUIHelper.formatReward(skill.comboChanges, baseStr, effectiveBase, skill);

                h += `
                <div style="flex: 1; border-left: 2px solid var(--color-success); background: rgba(74, 255, 171, 0.04); padding: 6px 10px; border-radius: 0 4px 4px 0; font-size: 11px; line-height: 1.3; display: flex; flex-direction: column; justify-content: center;">
                    <div style="color: var(--color-success); font-weight: bold; margin-bottom: 2px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Комбо:</div>
                    <div style="color: #ccc;">${comboContent}</div>
                </div>`;
            }

            h += `</div>`;
        }

        h += `<div class="tt-divider" style="height: 1px; background: #222; margin: 8px 0;"></div>`;
        h += `<div class="tt-desc" style="color: #aaa; font-style: italic; font-size: 12px; line-height: 1.4; padding-left: 4px;">`;
        h += `  ${skill.description || 'Описание действия отсутствует.'}`;
        h += `</div>`;

        h += `</div>`;
        return h;
    }

    static getSkillRangeHTML(validPos, targetPos, isAoE = false) {
        let html = `<div style="display: flex; align-items: center; gap: 15px; width: 100%; justify-content: center; user-select: none;">`;
        
        html += `<div style="display: flex; gap: 5px;">`;
        [4, 3, 2, 1].forEach(pos => {
            const isActive = validPos.includes(pos);
            const dotColor = isActive ? '#ffbf00' : 'transparent';
            const borderColor = isActive ? '#ffbf00' : '#444';
            html += `
                <div style="
                    width: 12px; height: 12px; 
                    border-radius: 50%; 
                    border: 1.5px solid ${borderColor}; 
                    background: ${dotColor}; 
                    box-shadow: ${isActive ? '0 0 4px rgba(255,191,0,0.5)' : 'none'};
                "></div>`;
        });
        html += `</div>`;

        html += `<span style="color: #666; font-size: 14px; font-weight: bold;">»</span>`;

        html += `<div style="position: relative; display: flex; gap: 5px; align-items: center;">`;
        
        if (isAoE && targetPos.length > 1) {
            const activeSorted = [...targetPos].sort((a, b) => a - b);
            const minPos = activeSorted[0];
            const maxPos = activeSorted[activeSorted.length - 1];
            const leftPx = (minPos - 1) * 17 + 6;
            const rightPx = (4 - maxPos) * 17 + 6;
            
            html += `
                <div style="
                    position: absolute; 
                    left: ${leftPx}px; 
                    right: ${rightPx}px; 
                    height: 2px; 
                    background: #ff4444; 
                    z-index: 1; 
                    box-shadow: 0 0 3px #ff4444;
                    pointer-events: none;
                "></div>`;
        }

        [1, 2, 3, 4].forEach(pos => {
            const isActive = targetPos.includes(pos);
            const dotColor = isActive ? '#ff4444' : 'transparent';
            const borderColor = isActive ? '#ff4444' : '#444';
            html += `
                <div style="
                    width: 12px; height: 12px; 
                    border-radius: 50%; 
                    border: 1.5px solid ${borderColor}; 
                    background: ${dotColor}; 
                    z-index: 2; 
                    position: relative;
                    box-shadow: ${isActive ? '0 0 4px rgba(255,68,68,0.5)' : 'none'};
                "></div>`;
        });
        html += `</div>`;

        html += `</div>`;
        return html;
    }
}

window.HubTemplates = HubTemplates;