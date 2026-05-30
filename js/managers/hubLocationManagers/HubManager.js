import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { ExploreScene } from '../../scenes/ExploreScene.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { TooltipManager } from './TooltipManager.js';
import { RecruitManager } from './RecruitManager.js';
import { ArsenalManager } from './ArsenalManager.js';
import { BarracksManager } from './BarrackManager.js'; 
import { HospitalManager } from './HospitalManager.js';
import { ForgeManager } from './ForgeManager.js';
import { WarehouseManager } from './WarehouseManager.js';
import { BazaarManager } from './BazaarManager.js';
import { QuestManager } from './QuestManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { CleatManager } from './CleatManager.js';
import { STAT_ICONS, STAT_LABELS, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS } from '../../data/workersData/labels.js';
import { BattleUIHelper } from '../battleSceneManagers/BattleUIHelper.js';
import { TRAITS } from '../../data/workersData/traits.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { SaveManager } from '../SaveManager.js';

export class HubManager {
    static inspectedAdv = null; 
    static selectedSlot = null; 
    static currentBuildingId = null;
    static activeModalFilter = 'all';

    static getEncodedTooltip(html) {
        if (!html) return '';
        return encodeURIComponent(html).replace(/'/g, "%27");
    }

    static showEncodedTooltip(event, encoded) {
        const html = decodeURIComponent(encoded);
        const tooltipEl = document.getElementById('custom-tooltip');
        if (tooltipEl) {
            tooltipEl.innerHTML = html;
            tooltipEl.style.display = 'block';
            
            if (html.includes('unit-card-mini')) {
                tooltipEl.style.maxWidth = '580px';
                tooltipEl.style.width = '520px';
                tooltipEl.style.whiteSpace = 'normal';
            } else {
                tooltipEl.style.maxWidth = '300px';
                tooltipEl.style.width = 'auto';
                tooltipEl.style.whiteSpace = 'pre-line';
            }
            
            let x = event.pageX + 15;
            let y = event.pageY + 15;
            
            if (x + tooltipEl.offsetWidth > window.innerWidth) {
                x = window.innerWidth - tooltipEl.offsetWidth - 10;
            }
            
            tooltipEl.style.left = x + 'px';
            tooltipEl.style.top = y + 'px';
        }
    }

    static hideTooltip() {
        const tooltipEl = document.getElementById('custom-tooltip');
        if (tooltipEl) {
            tooltipEl.style.display = 'none';
        }
    }

    static getDeclinedTraitName(traitName, gender) {
        if (gender === 'm') return traitName;
        
        const traitObj = TRAITS.find(t => t.name === traitName);
        return (traitObj && traitObj.femaleName) ? traitObj.femaleName : traitName;
    }

    static getLocalCategory(item) {
        if (!item) return null;
        
        if (item.category) return item.category;

        // поиск по названию как альтернатива умному
        const key = (item.key || item.name || '').toLowerCase();

        if (item.type === 'weapon') {
            if (key.includes('sword')) return 'swords';
            if (key.includes('spear')) return 'spears';
            if (key.includes('hammer')) return 'hammers';
            if (key.includes('axe')) return 'axes';
            if (key.includes('sling')) return 'slings';
            if (key.includes('crossbow')) return 'crossbows';
            if (key.includes('bow')) return 'bows';
            if (key.includes('arquebus')) return 'arquebuses';
            return 'swords'; 
        }

        if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') {
            const armorKeys = ['lightArmor', 'middleArmor', 'heavyArmor', 'minerOutfit', 'scientistOutfit', 'builderOutfit', 'scoutOutfit'];
            for (const k of armorKeys) {
                if (item.key === k || item.name.includes(k) || key.includes(k.toLowerCase())) return k;
            }
            return 'lightArmor'; 
        }
        return null;
    }

    static openBuilding(locationData) {
        const ui = document.getElementById('building-ui');
        ui.classList.remove('hidden'); 
        document.getElementById('building-title').innerText = locationData.name;
        document.getElementById('building-description').innerText = locationData.description || "";
        document.getElementById('building-close-btn').onclick = () => ui.classList.add('hidden');
        this.refreshContent(locationData.id);
    }

    static refreshContent(buildingId) {
        TooltipManager.clear();
        const content = document.getElementById('building-content');
        content.innerHTML = ''; 
        content.style.display = 'flex';
        content.style.flexDirection = 'row'; 
        
        // записываем айди подлокации, чтобы корректно из них выходить
        this.currentBuildingId = buildingId;

        if (buildingId === 'tavern_recruits' || buildingId === 'tavern') RecruitManager.render(content);
        else if (buildingId === 'arsenal') ArsenalManager.render(content);
        else if (buildingId === 'barracks') BarracksManager.render(content);
        else if (buildingId === 'hospital') HospitalManager.render(content);
        else if (buildingId === 'forge') ForgeManager.render(content);
        else if (buildingId === 'bazaar') BazaarManager.render(content);
        else if (buildingId === 'warehouse') WarehouseManager.render(content);
        else if (buildingId === 'cleat') CleatManager.render(content);
        else if (buildingId.includes('office') || buildingId.includes('manager')) QuestManager.render(content);
    }

    static getCharRowHTML(adv) {
        const traitDeclined = this.getDeclinedTraitName(adv.traits[0].name, adv.gender);
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
                <div style="display:flex; gap:10px; font-size:13px; color:#ccc; font-weight:bold;">
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

    static getStat(adv, statName) {
        return RecruitManager.getStat(adv, statName);
    }

    static getStatTooltip(adv, statName) {
        let pure = adv.pureStats[statName] || 0;
        let traitBonus = 0; adv.traits.forEach(t => { if (t.effect && t.effect[statName]) traitBonus += t.effect[statName]; });
        let gearBonus = 0;
        if (adv.equipment.body && adv.equipment.body.stats && adv.equipment.body.stats[statName]) gearBonus = adv.equipment.body.stats[statName];
        else if (!adv.equipment.body && adv.civilBody && adv.civilBody.effect && adv.civilBody.effect[statName]) gearBonus = adv.civilBody.effect[statName];
        
        let total = pure + traitBonus + gearBonus;
        return `<b>${STAT_ICONS[statName]} ${STAT_LABELS[statName]}: ${total}</b><br><span style='color:#aaa; font-size: 11px;'>${STAT_DESCRIPTIONS[statName]}</span><br><br>Врождённое: ${pure}<br>Черты: ${traitBonus}<br>Снаряжение: ${gearBonus}`;
    }

    static getStatColor(adv, statName, showColors) {
        if (!showColors) return "#e0d8c3";
        const bgData = BACKGROUNDS[adv.background];
        if (!bgData || !bgData.stats[statName]) return "#e0d8c3";
        const [min, max] = bgData.stats[statName];
        const val = adv.pureStats[statName];
        if (min === max) return "#e0d8c3";
        const step = (max - min) / 4;
        if (val <= min) return "#ff4444";
        if (val <= min + step) return "#ffaa44";
        if (val <= max - step) return "#e0d8c3";
        if (val < max) return "#aaffaa";
        return "#4affab";
    }

    static getItemTooltip(item) {
        if (!item) return "";
        
        let typeLabel = 'Ресурс';
        if (item.type === 'weapon') typeLabel = 'Оружие';
        else if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') typeLabel = 'Броня';
        else if (item.type === 'supplies') typeLabel = 'Припасы';

        let t = `<b>${item.name}</b><br>Тип: ${typeLabel}<br><br>`;
        
        if (item.type === 'weapon') {
            t += `Урон: ${item.baseDamage}<br>Навыки:<br>`;
            if (item.skills) {
                item.skills.forEach(s => t += ` - ${s.name}<br>`);
            }
        } else if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') {
            const stats = item.stats || item.effect || {};
            t += `<span style='color:#aaa; font-size:11px;'>${item.description || ""}</span><br><br>`;
            Object.entries(stats).forEach(([k, v]) => {
                if (v !== 0) t += `${STAT_ICONS[k] || k} +${v}<br>`;
            });
        } else if (item.type === 'supplies') {
            t += `<span style='color:#aaa; font-size:11px; font-style:italic;'>${item.description || ""}</span><br><br>`;
            if (item.usefulAt !== undefined) {
                t += `<span style="color:#ffaa44">💡 Дает бонус с: ${item.usefulAt}% прогресса</span><br>`;
                t += `<span style="color:#ff4444">⚠️ Обязателен с: ${item.requiredAt}% прогресса</span><br><br>`;
            }
            t += `💰 Базовая стоимость: ${item.price} 🕯️`;
        } else {
            t += `<span style='color:#aaa; font-size:11px; font-style:italic;'>${item.description || ""}</span><br><br>`;
            t += `💰 Базовая стоимость: ${item.price} 🕯️`;
        }
        return t;
    }

    static getCardHTML(adv, isHire = false) {
        const bgData = BACKGROUNDS[adv.background];
        const maxH = RecruitManager.getStat(adv, 'hp');
        const maxS = RecruitManager.getStat(adv, 'stamina');

        const getHov = (s) => {
            const ttId = TooltipManager.registerTooltip(this.getStatTooltip(adv, s));
            return `data-tooltip-id="${ttId}"`;
        };

        const traitNameDeclined = this.getDeclinedTraitName(adv.traits[0].name, adv.gender);

        const bgT = `<b>Предыстория: ${adv.background}</b><br>${bgData.description}<br><br>Разброс базы:<br><center>${STAT_ICONS.battle} ${bgData.stats.battle.join('-')}</center><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.mining} ${bgData.stats.mining.join('-')}</span><span>${STAT_ICONS.research} ${bgData.stats.research.join('-')}</span></div><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.construction} ${bgData.stats.construction.join('-')}</span><span>${STAT_ICONS.scouting} ${bgData.stats.scouting.join('-')}</span></div><hr style='border:none; border-bottom:1px solid #444'><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.hp} ${bgData.stats.hp.join('-')}</span><span>${STAT_ICONS.stamina} ${bgData.stats.stamina.join('-')}</span></div>`;
        const trT = `<b>Черта: ${traitNameDeclined}</b><br>${Object.entries(adv.traits[0].effect||{}).map(([k,v])=>v!==0?STAT_ICONS[k]+' '+(v>0?'+'+v:v):'').filter(x=>x!=='').join('<br>')}`;
        
        const weaponTtId = adv.equipment.rightHand ? TooltipManager.registerTooltip(this.getItemTooltip(adv.equipment.rightHand)) : '';
        const armorItem = adv.equipment.body || adv.civilBody;
        const armorTtId = armorItem ? TooltipManager.registerTooltip(this.getItemTooltip(armorItem)) : '';

        const weaponAttr = adv.equipment.rightHand ? `style="cursor:help; color:#4affab; border-bottom: 1px dotted" data-tooltip-id="${weaponTtId}"` : `style="color:#555"`;
        const armorAttr = armorItem ? `style="cursor:help; color:#aaa; border-bottom: 1px dotted" data-tooltip-id="${armorTtId}"` : `style="color:#555"`;

        const weaponLabel = adv.equipment.rightHand ? adv.equipment.rightHand.name : "Нет оружия";
        const armorLabel = armorItem ? armorItem.name : "Лохмотья";

        const rangeData = this.getUnitRangeData(adv);
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
            ${rangeWidget}
            <div class="hub-stats-container">
                <div class="hub-stats-center"><div class="hub-stats-item" ${getHov('battle')} style="color:${this.getStatColor(adv,'battle',isHire)}">${STAT_ICONS.battle} ${RecruitManager.getStat(adv,'battle')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('mining')} style="color:${this.getStatColor(adv,'mining',isHire)}">${STAT_ICONS.mining} ${RecruitManager.getStat(adv,'mining')}</div><div class="hub-stats-item" ${getHov('research')} style="color:${this.getStatColor(adv,'research',isHire)}">${STAT_ICONS.research} ${RecruitManager.getStat(adv,'research')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('construction')} style="color:${this.getStatColor(adv,'construction',isHire)}">${STAT_ICONS.construction} ${RecruitManager.getStat(adv,'construction')}</div><div class="hub-stats-item" ${getHov('scouting')} style="color:${this.getStatColor(adv,'scouting',isHire)}">${STAT_ICONS.scouting} ${RecruitManager.getStat(adv,'scouting')}</div></div>
                <div class="hub-stats-divider"></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('hp')} style="color:${this.getStatColor(adv,'hp',isHire)}">${STAT_ICONS.hp} ${adv.hp}/${maxH}</div><div class="hub-stats-item" ${getHov('stamina')} style="color:${this.getStatColor(adv,'stamina',isHire)}">${STAT_ICONS.stamina} ${adv.stamina}/${maxS}</div></div>
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

    static hireFromTavern(id) {
        if (RecruitManager.hire(id)) {
            this.refreshContent('tavern');
        }
    }

    static renderTavern(container) { 
        RecruitManager.generateRecruits(); 
        RecruitManager.currentRecruits.forEach(r => { 
            const card = document.createElement('div'); 
            card.className = 'char-card'; 
            card.innerHTML = this.getCardHTML(r, true); 
            container.appendChild(card); 
        }); 
    }

    static openCharacterDetails(adv) {
        TooltipManager.clear();
        GameState.initDebugInventory(); 
        this.inspectedAdv = adv; 
        
        this.selectedSlot = 'rightHand';
        
        const modal = document.getElementById('char-details-modal');
        modal.classList.remove('hidden');
        
        document.getElementById('cd-name').innerText = adv.name;
        const nextLevelThreshold = GameState.getHoursThresholdForLevel(adv.level + 1);
        const expHours = adv.expHours || 0;
        
        const expT = `<b>🔼 Уровень: ${adv.level}</b><br>Проведено часов в экспедициях: ${expHours} / ${nextLevelThreshold} ч.<br><br>Абстрактный показатель опытности погруженца. С достижением нового уровня он может улучшить одну из своих характеристик на свой выбор.`;
        
        const levelEl = document.getElementById('cd-level');
        levelEl.innerHTML = `🔼 ${adv.level} Уровень`;
        levelEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(expT));
        
        const bgData = BACKGROUNDS[adv.background];
        const bgT = `
            <b>Предыстория: ${adv.background}</b><br>
            ${bgData ? bgData.description : ''}<br><br>
            Разброс базы:<br>
            <center>${STAT_ICONS.battle} ${bgData ? bgData.stats.battle.join('-') : '10-10'}</center>
            <div style='display:flex; justify-content:space-between;'>
                <span>${STAT_ICONS.mining} ${bgData ? bgData.stats.mining.join('-') : '10-10'}</span>
                <span>${STAT_ICONS.research} ${bgData ? bgData.stats.research.join('-') : '10-10'}</span>
            </div>
            <div style='display:flex; justify-content:space-between;'>
                <span>${STAT_ICONS.construction} ${bgData ? bgData.stats.construction.join('-') : '10-10'}</span>
                <span>${STAT_ICONS.scouting} ${bgData ? bgData.stats.scouting.join('-') : '10-10'}</span>
            </div>
            <hr style='border:none; border-bottom:1px solid #444'>
            <div style='display:flex; justify-content:space-between;'>
                <span>${STAT_ICONS.hp} ${bgData ? bgData.stats.hp.join('-') : '10-10'}</span>
                <span>${STAT_ICONS.stamina} ${bgData ? bgData.stats.stamina.join('-') : '10-10'}</span>
            </div>`;
            
        const bgEl = document.getElementById('cd-bg');
        bgEl.innerText = adv.background;
        bgEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(bgT));

        const traitNameDeclined = this.getDeclinedTraitName(adv.traits[0].name, adv.gender);

        const trT = `
            <b>Черта: ${traitNameDeclined}</b><br>
            ${Object.entries(adv.traits[0].effect || {})
                .map(([k, v]) => v !== 0 ? STAT_ICONS[k] + ' ' + (v > 0 ? '+' + v : v) : '')
                .filter(x => x !== '')
                .join('<br>')}`;
                
        const trEl = document.getElementById('cd-trait');
        trEl.innerText = traitNameDeclined;
        trEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(trT));

        document.getElementById('cd-close-btn').onclick = () => { 
            modal.classList.add('hidden'); 
            this.refreshContent(this.currentBuildingId); 
        };

        const dismissBtn = document.getElementById('cd-dismiss-btn');
        if (dismissBtn) {
            const multiplier = HUB_BALANCE.tavern.dismissalSalaryMultiplier || 3;
            const dismissalCost = adv.salary * multiplier;

            // увольнение в минус
            dismissBtn.disabled = false;
            dismissBtn.style.opacity = '1';
            dismissBtn.style.cursor = 'pointer';
            dismissBtn.style.borderColor = 'var(--color-danger)';
            dismissBtn.style.color = 'var(--color-danger)';
            dismissBtn.style.backgroundColor = 'transparent';

            dismissBtn.setAttribute('data-confirm', 'false');
            dismissBtn.innerText = `УВОЛИТЬ: -${dismissalCost} 🕯️`;

            dismissBtn.onclick = () => {
                const isConfirmed = dismissBtn.getAttribute('data-confirm') === 'true';

                if (!isConfirmed) {
                    dismissBtn.setAttribute('data-confirm', 'true');
                    dismissBtn.innerText = `ТОЧНО УВОЛИТЬ?`;
                    dismissBtn.style.backgroundColor = 'rgba(255, 68, 68, 0.15)';
                } else {
                    
                    GameState.resources.candles -= dismissalCost;
                    
                    if (GameState.resources.candles < 0 && GameState.debtCycles === undefined) {
                        GameState.debtCycles = HUB_BALANCE.bankruptcy.cyclesBeforeDefeat;
                    }
                    GameState.updateTopBarUI();

                    const rosterIdx = GameState.roster.findIndex(a => a.id === adv.id);
                    if (rosterIdx > -1) GameState.roster.splice(rosterIdx, 1);

                    const squadIdx = GameState.currentSquad.findIndex(s => s && s.id === adv.id);
                    if (squadIdx > -1) GameState.currentSquad[squadIdx] = null;

                    modal.classList.add('hidden');
                    this.refreshContent(this.currentBuildingId);
                }
            };

            dismissBtn.onmouseleave = () => {
                dismissBtn.setAttribute('data-confirm', 'false');
                dismissBtn.innerText = `УВОЛИТЬ: -${dismissalCost} 🕯️`;
                dismissBtn.style.backgroundColor = 'transparent';
            };
        }
        
        this.updateDetailsStats(); 
        this.updateDetailsSlots(); 
        this.renderDetailsInventory();
    }

    static updateDetailsStats() {
        const adv = this.inspectedAdv;
        const s = document.getElementById('cd-stats');
        
        const scaleValue = "1.8"; 
        const offsetY = "40px";  
        const offsetX = "-30px";    

        const portraitEl = document.getElementById('cd-portrait');
        portraitEl.className = ''; 
        portraitEl.style.cssText = "flex: 1; border: none; position: relative; overflow: visible; background: transparent; height: 350px;";

        portraitEl.innerHTML = `
            <div style="
                position: absolute; 
                width: 100%; 
                height: 100%; 
                top: ${offsetY}; 
                left: ${offsetX}; 
                transform: scale(${scaleValue}); 
                transform-origin: center center; 
                pointer-events: none;
            ">
                ${CharacterRenderer.getAvatarHTML(adv, '100%', true)}
            </div>
        `;

        const maxH = RecruitManager.getStat(adv, 'hp');
        const maxS = RecruitManager.getStat(adv, 'stamina');

        const getHov = (statName) => `data-tooltip-id="${TooltipManager.registerTooltip(this.getStatTooltip(adv, statName))}"`;

        if (!adv.allocatedPoints) {
            adv.allocatedPoints = { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 };
        }
        if (adv.unspentPoints === undefined) adv.unspentPoints = 0;

        const hasUnspent = adv.unspentPoints > 0;

        const statRow = (statName, icon, val, max, tooltip, color) => {
            const allocated = adv.allocatedPoints[statName] || 0;
            
            const minusBtn = allocated > 0 
                ? `<span class="stat-minus-btn" style="color: var(--color-danger); cursor: pointer; font-size: 16px; margin-right: 8px; font-weight:bold;" onclick="event.stopPropagation(); HubManager.decreaseStat('${statName}')">➖</span>` 
                : '';
                
            const plusBtn = hasUnspent 
                ? `<span class="stat-plus-btn" style="color: var(--color-gold); cursor: pointer; font-size: 16px; font-weight:bold;" onclick="event.stopPropagation(); HubManager.increaseStat('${statName}')">➕</span>` 
                : `<span class="stat-plus-btn disabled" style="color: #444; cursor: not-allowed; font-size: 16px; font-weight:bold;">➕</span>`;

            return `
                <div class="stat-row-flex" ${tooltip} style="color: ${color}">
                    <span>${icon} ${val}${max ? '/' + max : ''}</span>
                    <div style="display: flex; align-items: center; user-select: none;">
                        ${minusBtn}
                        ${plusBtn}
                    </div>
                </div>
            `;
        };

        const hpColor = adv.hp < maxH ? '#ff6666' : '#fff';
        const stColor = adv.stamina < maxS ? '#4affab' : '#fff';

        const statsHtml = `
            <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
                <div style="color:#aaa; font-size:11px; margin-bottom:5px; text-transform:uppercase; text-align:center;">
                    Характеристики ${adv.unspentPoints > 0 ? `<b style="color:var(--color-success); blink">(${adv.unspentPoints} очков!)</b>` : ''}
                </div>
                ${statRow('hp', STAT_ICONS.hp, Math.floor(adv.hp), maxH, getHov('hp'), hpColor)}
                ${statRow('stamina', STAT_ICONS.stamina, Math.floor(adv.stamina), maxS, getHov('stamina'), stColor)}
                ${statRow('battle', STAT_ICONS.battle, RecruitManager.getStat(adv,'battle'), null, getHov('battle'), this.getStatColor(adv,'battle', false))}
                ${statRow('mining', STAT_ICONS.mining, RecruitManager.getStat(adv,'mining'), null, getHov('mining'), this.getStatColor(adv,'mining', false))}
                ${statRow('research', STAT_ICONS.research, RecruitManager.getStat(adv,'research'), null, getHov('research'), this.getStatColor(adv,'research', false))}
                ${statRow('construction', STAT_ICONS.construction, RecruitManager.getStat(adv,'construction'), null, getHov('construction'), this.getStatColor(adv,'construction', false))}
                ${statRow('scouting', STAT_ICONS.scouting, RecruitManager.getStat(adv,'scouting'), null, getHov('scouting'), this.getStatColor(adv,'scouting', false))}
            </div>
        `;

        const rangeData = this.getUnitRangeData(adv);
        const hasWeapon = adv.equipment.rightHand;
        const rangeWidget = hasWeapon 
            ? this.getRangeHTML(rangeData.ranks, rangeData.targets) 
            : "<div style='height:20px; color:#555; font-size:10px; text-align:center;'>Оружие не экипировано</div>";

        s.innerHTML = `
            ${statsHtml}
            <div style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border: 1px solid #444; display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:10px; color:#aaa; margin-bottom:5px; text-transform:uppercase;">Эффективные позиции</div>
                ${rangeWidget}
            </div>
            <div style="margin-top: 15px; text-align: center; color: #ffbf00; font-weight: bold; font-size: 16px;">
                Содержание: ${adv.salary} 🕯️
            </div>
        `;

        const rightPanel = document.getElementById('cd-slot-wrap-rightHand').parentElement.parentElement;
        rightPanel.style.background = 'var(--bg-panel)';
        rightPanel.style.padding = '20px';
        rightPanel.style.border = '1px solid var(--border-main)';
    }


    static updateDetailsSlots() {
        const adv = this.inspectedAdv;
        const slots = ['rightHand', 'body', 'leftHand'];
        const slotTitles = { rightHand: "Оружие", body: "Одежда", leftHand: "Вспомог." };

        slots.forEach(slot => {
            const wrapEl = document.getElementById(`cd-slot-wrap-${slot}`);
            const item = adv.equipment[slot];
            
            let currentItemForTooltip = item;
            if (slot === 'body' && !item) currentItemForTooltip = adv.civilBody;

            let ttAttr = '';
            if (currentItemForTooltip) {
                ttAttr = `data-tooltip-id="${TooltipManager.registerTooltip(this.getItemTooltip(currentItemForTooltip))}"`;
            }

            const spriteKey = currentItemForTooltip ? (currentItemForTooltip.key || currentItemForTooltip.name) : '';
            const folderName = slot === 'body' ? 'outfit' : 'weapon';
            const spritePath = spriteKey ? `assets/img/${folderName}/${spriteKey}.png` : '';

            const isFilledClass = item ? 'filled' : '';
            
            // быстрое улучшение предмета из инвентаря погруженца
            let upgradeBtnHtml = '';
            if (item && item.level < 4) {
                const cost = item.level * 100;
                const canAfford = GameState.resources.candles >= cost;
                const costColor = canAfford ? 'inherit' : 'var(--color-danger)';
                const disabledAttr = canAfford ? '' : 'disabled="true"';
                const opacityStyle = canAfford ? '1' : '0.5';

                upgradeBtnHtml = `
                    <button class="hub-btn btn-bold cd-slot-upgrade-btn" 
                        style="margin-top:8px; padding:4px 8px; font-size:10px; width:110px; color: ${costColor}; opacity: ${opacityStyle};" 
                        data-slot="${slot}" 
                        data-cost="${cost}"
                        ${disabledAttr}>
                        Улучшить: ${cost} 🕯️
                    </button>
                `;
            }

            if (slot === 'body' && !item && adv.civilBody) {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper" style="display:flex; flex-direction:column; align-items:center;">
                        <div class="equip-label-top">${slotTitles[slot]}</div>
                        <div class="equip-slot-square" ${ttAttr} id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''} padding: 0px !important;">
                            <img src="${spritePath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 100%; height: 100%; object-fit: contain; transform: scale(2.0); transform-origin: center center;">
                            <span style="display:none; color:#aaa; font-size:10px; text-align:center;">${adv.civilBody.name}</span>
                        </div>
                    </div>
                `;
            } else if (item) {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper" style="display:flex; flex-direction:column; align-items:center;">
                        <div class="equip-label-top">${slotTitles[slot]}</div>
                        <div class="equip-slot-square filled" ${ttAttr} id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''} padding: 0px !important;">
                            <img src="${spritePath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 100%; height: 100%; object-fit: contain; transform: scale(2.2); transform-origin: center center;">
                            <span style="display:none; color:#fff; font-size:10px; text-align:center;">${item.name}</span>
                            <div class="equip-remove-overlay" id="cd-rm-${slot}">СНЯТЬ</div>
                        </div>
                        ${upgradeBtnHtml}
                    </div>
                `;
            } else {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper" style="display:flex; flex-direction:column; align-items:center;">
                        <div class="equip-label-top">${slotTitles[slot]}</div>
                        <div class="equip-slot-square" id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''}">
                            <span style="color:#555; font-size:12px;">Пусто</span>
                        </div>
                    </div>
                `;
            }

            const sqEl = document.getElementById(`cd-sq-${slot}`);
            if (sqEl) {
                sqEl.onclick = () => {
                    if (item) this.unequipItem(slot);
                    else {
                        this.selectedSlot = slot;
                        this.updateDetailsSlots();
                        this.renderDetailsInventory();
                    }
                };
            }

            const upBtn = wrapEl.querySelector('.cd-slot-upgrade-btn');
            if (upBtn) {
                upBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (upBtn.hasAttribute('disabled')) return; 

                    const cost = parseInt(upBtn.getAttribute('data-cost'));
                    if (GameState.resources.candles < cost) return;

                    GameState.resources.candles -= cost;
                    GameState.updateTopBarUI();

                    const isArmor = slot === 'body';
                    const activeDB = isArmor ? ForgeManager.ARMOR_DB : ForgeManager.WEAPONS_DB;
                    let nextVariant = null;

                    for (const category of Object.values(activeDB)) {
                        if (category && category.some(i => i && i.key === item.key)) {
                            nextVariant = category.find(i => i && i.level === item.level + 1);
                            break;
                        }
                    }

                    if (nextVariant) {
                        const newItem = JSON.parse(JSON.stringify(nextVariant));
                        newItem.id = Date.now() + Math.random();

                        let oldH = RecruitManager.getStat(adv, 'hp'), oldS = RecruitManager.getStat(adv, 'stamina');
                        adv.equipment[slot] = newItem;
                        
                        let newH = RecruitManager.getStat(adv, 'hp'), newS = RecruitManager.getStat(adv, 'stamina');
                        adv.hp += (newH - oldH);
                        adv.stamina += (newS - oldS);

                        this.updateDetailsStats();
                        this.updateDetailsSlots();
                    }
                };
            }
        });

        const panel = document.getElementById('cd-skills-panel');
        panel.innerHTML = '';
        if (adv.equipment.rightHand && adv.equipment.rightHand.skills) {
            adv.equipment.rightHand.skills.forEach(s => {
                const skillKey = s.id || s.key || '';
                const htmlStr = HubManager.getSkillTooltipHTML(s, adv.equipment.rightHand);
                const ttId = TooltipManager.registerTooltip(htmlStr);
                
                panel.innerHTML += `
                    <div class="cd-skill-square" data-tooltip-id="${ttId}">
                        ${skillKey ? `<img src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <span class="cd-skill-text-fallback" style="${skillKey ? 'display:none;' : ''}">${s.name}</span>
                    </div>
                `;
            });
        } else {
            panel.innerHTML = '<span style="color:#555; width:100%; text-align:center;">Оружие не экипировано</span>';
        }
    }

    static unequipItem(slot) {
        if(TooltipManager.tooltipEl) TooltipManager.tooltipEl.style.display = 'none';

        const adv = this.inspectedAdv;
        const item = adv.equipment[slot];
        if (!item) return;

        let oldH = RecruitManager.getStat(adv, 'hp'), oldS = RecruitManager.getStat(adv, 'stamina');
        GameState.inventory.push(item);
        adv.equipment[slot] = null;
        
        this.selectedSlot = slot;

        let newH = RecruitManager.getStat(adv, 'hp'), newS = RecruitManager.getStat(adv, 'stamina');
        adv.hp = Math.max(1, adv.hp - (oldH - newH));
        adv.stamina = Math.max(0, adv.stamina - (oldS - newS));

        this.updateDetailsStats();
        this.updateDetailsSlots();
        this.renderDetailsInventory();
    }

    static renderDetailsInventory() {
        GameState.initDebugInventory();
        const container = document.getElementById('cd-inventory');
        const filterContainer = document.getElementById('cd-inv-filters');
        container.innerHTML = '';
        filterContainer.innerHTML = '';

        const slot = this.selectedSlot;
        if (!slot) return;

        const labelsObj = slot === 'body' ? ARMOR_LABELS : WEAPON_LABELS;
        const availableCategories = new Set();
        
        GameState.inventory.forEach(i => {
            if (slot === 'body' && (i.type === 'armor' || i.type === 'body' || i.type === 'civil')) {
                const cat = HubManager.getLocalCategory(i);
                if (cat) availableCategories.add(cat);
            } else if (slot === 'rightHand' && i.type === 'weapon') {
                const cat = HubManager.getLocalCategory(i);
                if (cat) availableCategories.add(cat);
            }
        });

        if (availableCategories.size > 0) {
            filterContainer.className = 'filter-btn-group';
            
            const btnAll = document.createElement('button');
            btnAll.className = `filter-toggle-btn ${this.activeModalFilter === 'all' ? 'active' : ''}`;
            btnAll.style.borderColor = 'var(--border-main)';
            btnAll.innerText = '⭐ Все';
            btnAll.onclick = () => { this.activeModalFilter = 'all'; this.renderDetailsInventory(); };
            filterContainer.appendChild(btnAll);

            availableCategories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = `filter-toggle-btn ${this.activeModalFilter === cat ? 'active' : ''}`;
                btn.innerText = labelsObj[cat] || cat;
                btn.onclick = () => { this.activeModalFilter = cat; this.renderDetailsInventory(); };
                filterContainer.appendChild(btn);
            });
        }

        const filtered = GameState.inventory.filter(i => {
            let matchesSlot = false;
            if (slot === 'body') matchesSlot = (i.type === 'armor' || i.type === 'body' || i.type === 'civil');
            else if (slot === 'rightHand') matchesSlot = (i.type === 'weapon');
            else matchesSlot = (i.type === 'offhand');

            if (!matchesSlot) return false;
            if (this.activeModalFilter !== 'all') {
                const cat = HubManager.getLocalCategory(i);
                if (cat !== this.activeModalFilter) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p style="color:#888; padding:10px; width: 100%; text-align:center;">Нет подходящих предметов по фильтру.</p>`;
            return;
        }

        filtered.forEach(item => {
            const box = document.createElement('div');
            box.className = 'inv-item';
            box.style.position = 'relative';
            box.style.overflow = 'hidden';
            
            const isArmor = item.type === 'armor' || item.type === 'body' || item.type === 'civil';
            const isWeapon = item.type === 'weapon';

            const spriteKey = item.key || item.name;
            const folderName = isWeapon ? 'weapon/weaponForSale' : 'outfit/outfitsForSale';
            const spritePath = `assets/img/${folderName}/${spriteKey}.png`;
            
            // Скейлинг вещей в слотах-кнопках в инвентаре погруженца
            const spriteScale = 2.5; 
            const shiftX = '-5px';
            const shiftY = '10px';

            const levelBadge = item.level ? `<div style="position: absolute; top: 2px; right: 4px; font-size: 11px; font-weight: bold; color: var(--color-gold); z-index: 5; text-shadow: 1px 1px 2px #000;">${item.level}</div>` : '';
            
            box.innerHTML = `
                ${levelBadge}
                <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                    <img src="${spritePath}" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" style="max-width: 100%; max-height: 100%; transform: translate(${shiftX}, ${shiftY}) scale(${spriteScale}); transform-origin: center center; object-fit: contain; position: relative; z-index: 2;">
                </div>
                <div class="inv-fallback" style="display:none; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%;">
                    <div class="inv-icon">${isWeapon ? '⚔️' : '🛡️'}</div>
                    <div class="inv-name" style="margin-top:2px;">${item.name}</div>
                </div>
            `;
            
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(this.getItemTooltip(item)));

            box.onclick = () => {
                TooltipManager.clear();
                if(TooltipManager.tooltipEl) TooltipManager.tooltipEl.style.display = 'none';
                
                let oldH = RecruitManager.getStat(this.inspectedAdv, 'hp'), oldS = RecruitManager.getStat(this.inspectedAdv, 'stamina');
                
                const oldEquippedItem = this.inspectedAdv.equipment[slot];
                if (oldEquippedItem) {
                    GameState.inventory.push(oldEquippedItem);
                }

                this.inspectedAdv.equipment[slot] = item;
                
                GameState.inventory.splice(GameState.inventory.findIndex(i => i.id === item.id), 1);
                
                let newH = RecruitManager.getStat(this.inspectedAdv, 'hp'), newS = RecruitManager.getStat(this.inspectedAdv, 'stamina');
                this.inspectedAdv.hp += (newH - oldH); 
                this.inspectedAdv.stamina += (newS - oldS);
                
                this.updateDetailsStats(); 
                this.updateDetailsSlots(); 
                this.renderDetailsInventory();
            };
            container.appendChild(box);
        });
    }

    static getUnitRangeData(adv) {
        const weapon = adv.equipment.rightHand;
        if (!weapon || !weapon.skills) {
            return { ranks: {1:0, 2:0, 3:0, 4:0}, targets: {1:0, 2:0, 3:0, 4:0} };
        }

        let ranks = {1:0, 2:0, 3:0, 4:0};
        let targets = {1:0, 2:0, 3:0, 4:0};

        weapon.skills.forEach(skill => {
            const vPos = skill.validPos || weapon.defaultSkillData?.validPos || [1, 2];
            const tPos = skill.targetPos || weapon.defaultSkillData?.targetPos || [1, 2];

            vPos.forEach(p => { if(ranks[p] !== undefined) ranks[p]++; });
            tPos.forEach(p => { if(targets[p] !== undefined) targets[p]++; });
        });

        return { ranks, targets };
    }

    static getRangeHTML(rankCounts, targetCounts, isSkill = false) {
        let html = `<div class="range-display">`;
        
        // Позиции бойца справа налево для игрока: 4 3 2 1
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

        // Позиции врага слева направо: 1 2 3 4
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

        // Расчет силы атаки на основе бонуса левой руки
        const baseDmg = parentWeapon?.baseDamage || 10;
        const hasOffhandBonus = !this.inspectedAdv || (this.inspectedAdv.equipment && this.inspectedAdv.equipment.leftHand === null);
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
        
        // Позиции Погруженца (справа налево): 4, 3, 2, 1
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

        // Позиции Врагов (слева направо): 1, 2, 3, 4
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

    static processEndCycle() {
        if (!confirm("Вы уверены, что хотите завершить цикл? Будут списаны свечи на содержание базы и жалование.")) {
            return;
        }

        GameState.cycle++;

        let totalExpenses = 0;
        const COST_PER_REST = HUB_BALANCE.upkeep.costPerRestingCycle;
        const COST_PER_HEAL = HUB_BALANCE.upkeep.costPerHealingCycle;

        GameState.roster.forEach(adv => {
            totalExpenses += (adv.salary || 0);

            if (adv.isResting) {
                totalExpenses += COST_PER_REST;
                const maxS = RecruitManager.getStat(adv, 'stamina');
                adv.stamina = Math.min(maxS, adv.stamina + Math.floor(maxS * HUB_BALANCE.upkeep.staminaRecoveryPercent));
                // Автопрерывание отдыха. Ниже тоже самое для госпиталя
                if (adv.stamina >= maxS) adv.isResting = false;
            }

            if (adv.isHealing) {
                totalExpenses += COST_PER_HEAL;
                const maxH = RecruitManager.getStat(adv, 'hp');
                adv.hp = Math.min(maxH, adv.hp + Math.floor(maxH * HUB_BALANCE.upkeep.hpRecoveryPercent));
                if (adv.hp >= maxH) adv.isHealing = false;
            }
        });


        GameState.resources.candles -= totalExpenses;

        for (let i = GameState.activeQuests.length - 1; i >= 0; i--) {
            let q = GameState.activeQuests[i];
            q.timeLeft--;
            if (q.timeLeft < 0) {
                // удаляем просроченные задания
                GameState.activeQuests.splice(i, 1);
            }
        }

        GameState.updateTopBarUI();
        
        if (this.currentBuildingId && !document.getElementById('building-ui').classList.contains('hidden')) {
            this.refreshContent(this.currentBuildingId);
        }

        console.log(`Цикл ${GameState.cycle} начат. Списано свечей: ${totalExpenses}.`);
    }

    static showEndCycleModal() {
        const modal = document.getElementById('end-cycle-modal');
        const content = document.getElementById('end-cycle-content');

        let totalExpenses = 0;
        const COST_PER_REST = 5;
        const COST_PER_HEAL = 10;

        GameState.roster.forEach(adv => {
            totalExpenses += (adv.salary || 0);
            if (adv.isResting) totalExpenses += COST_PER_REST;
            if (adv.isHealing) totalExpenses += COST_PER_HEAL;
        });

        const expStatusText = GameState.hasFinishedExpedition 
            ? '<span style="color: var(--color-success);">✅ Вылазка была совершена. Погруженцы сделали своё дело.</span>' 
            : '<span style="color: var(--color-danger);">⚠️ В этом цикле отряд не спускался в клети. День потрачен впустую.</span>';

        const currentCandles = GameState.resources.candles;
        const projectedCandles = currentCandles - totalExpenses;
        const projectedColor = projectedCandles < 0 ? "var(--color-danger)" : "var(--color-success)";

        let questsHtml = '';
        if (GameState.activeQuests && GameState.activeQuests.length > 0) {
            questsHtml = '<div style="border-top: 1px solid #444; padding-top: 10px;"><h4>Активные контракты:</h4><ul style="padding-left: 20px; margin: 5px 0;">';
            GameState.activeQuests.forEach(q => {
                const timeColor = q.timeLeft <= 1 ? "var(--color-danger)" : (q.timeLeft <= 2 ? "var(--color-warning)" : "#aaa");
                questsHtml += `<li style="color: #ccc; margin-bottom: 5px;"><b>${q.name}</b> — осталось <span style="color: ${timeColor}; font-weight: bold;">${q.timeLeft} цикл.</span></li>`;
            });
            questsHtml += '</ul></div>';
        } else {
            questsHtml = '<div style="border-top: 1px solid #444; padding-top: 10px; color: #aaa;">Активных контрактов нет.</div>';
        }

        content.innerHTML = `
            <div style="font-size: 14px; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444;">
                ${expStatusText}
            </div>
            <div style="font-size: 15px; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;"><span>Баланс свечей:</span> <b>${currentCandles} 🕯️</b></div>
                <div style="display: flex; justify-content: space-between; color: #aaa;"><span>Жалование и обслуживание:</span> <b style="color: var(--color-danger);">-${totalExpenses} 🕯️</b></div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #555; padding-top: 8px; margin-top: 2px;">
                    <span>Прогнозируемый остаток:</span> <b style="color: ${projectedColor}; font-size: 18px;">${projectedCandles} 🕯️</b>
                </div>
            </div>
            ${questsHtml}
        `;

        modal.classList.remove('hidden');

        document.getElementById('btn-cancel-cycle').onclick = () => {
            modal.classList.add('hidden');
        };

        document.getElementById('btn-confirm-cycle').onclick = () => {
            modal.classList.add('hidden');
            this.executeEndCycle(totalExpenses);
        };
    }

    static executeEndCycle(totalExpenses) {
        GameState.cycle++;

        const COST_PER_REST = 5;
        const COST_PER_HEAL = 10;

        GameState.roster.forEach(adv => {
            if (adv.isResting) {
                let maxS = 100;
                if (window.RecruitManager) maxS = window.RecruitManager.getStat(adv, 'stamina');
                adv.stamina = Math.min(maxS, adv.stamina + Math.floor(maxS * HUB_BALANCE.upkeep.staminaRecoveryPercent));
                // аналогичная выше автоснималка отдыха
                if (adv.stamina >= maxS) adv.isResting = false;
            }

            if (adv.isHealing) {
                let maxH = 100;
                if (window.RecruitManager) maxH = window.RecruitManager.getStat(adv, 'hp');
                adv.hp = Math.min(maxH, adv.hp + Math.floor(maxH * HUB_BALANCE.upkeep.hpRecoveryPercent));
                if (adv.hp >= maxH) adv.isHealing = false;
            }
        });

        GameState.resources.candles -= totalExpenses;

        if (GameState.resources.candles < 0) {
            if (GameState.debtCycles === undefined) GameState.debtCycles = 3;
            GameState.debtCycles--;
            
            if (GameState.debtCycles < 0) {
                document.getElementById('game-over-modal').classList.remove('hidden');
                return;
            }
        } else {
            GameState.debtCycles = 3;
        }

        GameState.hasFinishedExpedition = false;

        if (GameState.activeQuests) {
            for (let i = GameState.activeQuests.length - 1; i >= 0; i--) {
                let q = GameState.activeQuests[i];
                q.timeLeft--;
                if (q.timeLeft < 0) {
                    // Квест провален - удаляем
                    GameState.activeQuests.splice(i, 1);
                }
            }
        }

        GameState.updateTopBarUI();

        if (this.currentBuildingId && !document.getElementById('building-ui').classList.contains('hidden')) {
            this.refreshContent(this.currentBuildingId);
        }

        SaveManager.saveGame();
    }

    static increaseStat(statName) {
        const adv = this.inspectedAdv;
        if (!adv || !adv.unspentPoints || adv.unspentPoints <= 0) return;

        const isVital = (statName === 'hp' || statName === 'stamina');
        const gain = isVital 
            ? (HUB_BALANCE.leveling.vitalGainPerPoint || 10) 
            : (HUB_BALANCE.leveling.statGainPerPoint || 2);

        adv.pureStats[statName] = (adv.pureStats[statName] || 0) + gain;
        adv.allocatedPoints[statName] = (adv.allocatedPoints[statName] || 0) + 1;
        adv.unspentPoints--;

        if (statName === 'hp') adv.hp += gain;
        if (statName === 'stamina') adv.stamina += gain;

        this.updateDetailsStats();
    }

    static decreaseStat(statName) {
        const adv = this.inspectedAdv;
        if (!adv || !adv.allocatedPoints || !adv.allocatedPoints[statName] || adv.allocatedPoints[statName] <= 0) return;

        const isVital = (statName === 'hp' || statName === 'stamina');
        const gain = isVital 
            ? (HUB_BALANCE.leveling.vitalGainPerPoint || 10) 
            : (HUB_BALANCE.leveling.statGainPerPoint || 2);

        adv.pureStats[statName] = Math.max(0, (adv.pureStats[statName] || 0) - gain);
        adv.allocatedPoints[statName]--;
        adv.unspentPoints++;

        if (statName === 'hp') adv.hp = Math.max(1, adv.hp - gain);
        if (statName === 'stamina') adv.stamina = Math.max(0, adv.stamina - gain);

        this.updateDetailsStats();
    }
}
window.HubManager = HubManager;