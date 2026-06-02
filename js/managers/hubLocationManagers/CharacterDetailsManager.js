import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { RecruitManager } from './RecruitManager.js';
import { ForgeManager } from './ForgeManager.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { STAT_ICONS, ARMOR_LABELS, WEAPON_LABELS } from '../../data/workersData/labels.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { HubTemplates } from './HubTemplates.js';
import { HubManager } from './HubManager.js';

export class CharacterDetailsManager {
    static inspectedAdv = null;
    static selectedSlot = 'rightHand';
    static activeModalFilter = 'all';

    static open(adv) {
        TooltipManager.clear();
        GameState.initDebugInventory(); 
        this.inspectedAdv = adv; 
        this.selectedSlot = 'rightHand';
        
        const modal = document.getElementById('char-details-modal');
        modal.classList.remove('hidden');
        
        document.getElementById('cd-name').innerText = adv.name;
        const nextLevelThreshold = GameState.getHoursThresholdForLevel(adv.level + 1);
        const expHours = adv.expHours || 0;
        
        const expT = `<b>🔼 Уровень: ${adv.level}</b><br>Проведено часов в экспедициях: ${expHours} / ${nextLevelThreshold} ч.<br><br>Показатель опытности погруженца. С достижением нового уровня он может улучшить одну из своих характеристик на выбор.`;
        
        const levelEl = document.getElementById('cd-level');
        levelEl.innerHTML = `🔼 ${adv.level} Уровень`;
        levelEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(expT));
        
        const bgData = BACKGROUNDS[adv.background];
        const bgT = `<b>Предыстория: ${adv.background}</b><br>${bgData ? bgData.description : ''}`;
            
        const bgEl = document.getElementById('cd-bg');
        bgEl.innerText = adv.background;
        bgEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(bgT));

        const traitNameDeclined = HubManager.getDeclinedTraitName(adv.traits[0].name, adv.gender);
        const trT = `<b>Черта: ${traitNameDeclined}</b><br>${Object.entries(adv.traits[0].effect || {}).map(([k, v]) => v !== 0 ? STAT_ICONS[k] + ' ' + (v > 0 ? '+' + v : v) : '').filter(x => x !== '').join('<br>')}`;
                
        const trEl = document.getElementById('cd-trait');
        trEl.innerText = traitNameDeclined;
        trEl.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(trT));

        document.getElementById('cd-close-btn').onclick = () => { 
            modal.classList.add('hidden'); 
            HubManager.refreshContent(HubManager.currentBuildingId); 
        };

        const dismissBtn = document.getElementById('cd-dismiss-btn');
        if (dismissBtn) {
            const multiplier = HUB_BALANCE.tavern.dismissalSalaryMultiplier || 3;
            const dismissalCost = adv.salary * multiplier;
            dismissBtn.disabled = false;
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
                    HubManager.refreshContent(HubManager.currentBuildingId);
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
        const scaleValue = "1.8"; const offsetY = "40px"; const offsetX = "-30px";    

        const portraitEl = document.getElementById('cd-portrait');
        portraitEl.className = ''; 
        portraitEl.style.cssText = "flex: 1; border: none; position: relative; overflow: visible; background: transparent; height: 350px;";
        portraitEl.innerHTML = `<div style="position: absolute; width: 100%; height: 100%; top: ${offsetY}; left: ${offsetX}; transform: scale(${scaleValue}); transform-origin: center center; pointer-events: none;">${CharacterRenderer.getAvatarHTML(adv, '100%', true)}</div>`;

        const maxH = RecruitManager.getStat(adv, 'hp');
        const maxS = RecruitManager.getStat(adv, 'stamina');
        const getHov = (statName) => `data-tooltip-id="${TooltipManager.registerTooltip(HubManager.getStatTooltip(adv, statName))}"`;

        if (!adv.allocatedPoints) {
            adv.allocatedPoints = { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 };
        }
        if (adv.unspentPoints === undefined) adv.unspentPoints = 0;
        const hasUnspent = adv.unspentPoints > 0;

        const statRow = (statName, icon, val, max, tooltip, color) => {
            const allocated = adv.allocatedPoints[statName] || 0;
            const minusBtn = allocated > 0 ? `<span class="stat-minus-btn" style="color: var(--color-danger); cursor: pointer; font-size: 16px; margin-right: 8px; font-weight:bold;" onclick="event.stopPropagation(); HubManager.decreaseStat('${statName}')">➖</span>` : '';
            const plusBtn = hasUnspent ? `<span class="stat-plus-btn" style="color: var(--color-gold); cursor: pointer; font-size: 16px; font-weight:bold;" onclick="event.stopPropagation(); HubManager.increaseStat('${statName}')">➕</span>` : `<span class="stat-plus-btn disabled" style="color: #444; cursor: not-allowed; font-size: 16px; font-weight:bold;">➕</span>`;
            return `<div class="stat-row-flex" ${tooltip} style="color: ${color}"><span>${icon} ${val}${max ? '/' + max : ''}</span><div style="display: flex; align-items: center; user-select: none;">${minusBtn}${plusBtn}</div></div>`;
        };

        const hpColor = adv.hp < maxH ? '#ff6666' : '#fff';
        const stColor = adv.stamina < maxS ? '#4affab' : '#fff';

        s.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
                <div style="color:#aaa; font-size:11px; margin-bottom:5px; text-transform:uppercase; text-align:center;">Характеристики ${adv.unspentPoints > 0 ? `<b style="color:var(--color-success);">${adv.unspentPoints} очков!</b>` : ''}</div>
                ${statRow('hp', STAT_ICONS.hp, Math.floor(adv.hp), maxH, getHov('hp'), hpColor)}
                ${statRow('stamina', STAT_ICONS.stamina, Math.floor(adv.stamina), maxS, getHov('stamina'), stColor)}
                ${statRow('battle', STAT_ICONS.battle, RecruitManager.getStat(adv,'battle'), null, getHov('battle'), HubManager.getStatColor(adv,'battle', false))}
                ${statRow('mining', STAT_ICONS.mining, RecruitManager.getStat(adv,'mining'), null, getHov('mining'), HubManager.getStatColor(adv,'mining', false))}
                ${statRow('research', STAT_ICONS.research, RecruitManager.getStat(adv,'research'), null, getHov('research'), HubManager.getStatColor(adv,'research', false))}
                ${statRow('construction', STAT_ICONS.construction, RecruitManager.getStat(adv,'construction'), null, getHov('construction'), HubManager.getStatColor(adv,'construction', false))}
                ${statRow('scouting', STAT_ICONS.scouting, RecruitManager.getStat(adv,'scouting'), null, getHov('scouting'), HubManager.getStatColor(adv,'scouting', false))}
            </div>
            <div style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border: 1px solid #444; display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:10px; color:#aaa; margin-bottom:5px; text-transform:uppercase;">Эффективные позиции</div>
                ${adv.equipment.rightHand ? HubTemplates.getRangeHTML(this.getUnitRangeData(adv).ranks, this.getUnitRangeData(adv).targets) : "<div style='height:20px; color:#555; font-size:10px; text-align:center;'>Оружие не экипировано</div>"}
            </div>
            <div style="margin-top: 15px; text-align: center; color: #ffbf00; font-weight: bold; font-size: 16px;">Содержание: ${adv.salary} 🕯️</div>
        `;
    }

    static updateDetailsSlots() {
        const adv = this.inspectedAdv;
        const slots = ['rightHand', 'body', 'leftHand'];
        const slotTitles = { rightHand: "Оружие", body: "Одежда", leftHand: "Вспомог." };

        slots.forEach(slot => {
            const wrapEl = document.getElementById(`cd-slot-wrap-${slot}`);
            const item = adv.equipment[slot];
            let currentItemForTooltip = item || (slot === 'body' ? adv.civilBody : null);

            let ttAttr = currentItemForTooltip ? `data-tooltip-id="${TooltipManager.registerTooltip(HubManager.getItemTooltip(currentItemForTooltip))}"` : '';
            const spriteKey = currentItemForTooltip ? (currentItemForTooltip.key || currentItemForTooltip.name) : '';
            let folderName = 'weapon/weaponForSale';
            if (slot === 'body') {
                const isCivil = currentItemForTooltip && (!item || currentItemForTooltip.type === 'civil');
                folderName = isCivil ? 'outfit' : 'outfit/outfitsForSale';
            }
            
            const spritePath = spriteKey ? `assets/img/${folderName}/${spriteKey}.png` : '';

            let upgradeBtnHtml = '';
            if (item && item.level < 4) {
                const cost = item.level * 100;
                const canAfford = GameState.resources.candles >= cost;
                upgradeBtnHtml = `<button class="hub-btn btn-bold cd-slot-upgrade-btn" style="margin-top:8px; padding:4px 8px; font-size:10px; width:110px; color: ${canAfford ? 'inherit' : 'var(--color-danger)'}; opacity: ${canAfford ? '1' : '0.5'};" data-slot="${slot}" data-cost="${cost}" ${canAfford ? '' : 'disabled="true"'}>Улучшить: ${cost} 🕯️</button>`;
            }

            if (slot === 'body' && !item && adv.civilBody) {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper"><div class="equip-label-top">${slotTitles[slot]}</div>
                    <div class="equip-slot-square" ${ttAttr} id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''} padding:0 !important;"><img src="${spritePath}" style="width:100%; height:100%; object-fit:contain; transform:scale(2.0); transform-origin:center center;"></div></div>
                `;
            } else if (item) {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper"><div class="equip-label-top">${slotTitles[slot]}</div>
                    <div class="equip-slot-square filled" ${ttAttr} id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''} padding:0 !important;"><img src="${spritePath}" style="width:100%; height:100%; object-fit:contain; transform:scale(2.2); transform-origin:center center;"><div class="equip-remove-overlay" id="cd-rm-${slot}">СНЯТЬ</div></div>${upgradeBtnHtml}</div>
                `;
            } else {
                wrapEl.innerHTML = `
                    <div class="equip-wrapper"><div class="equip-label-top">${slotTitles[slot]}</div><div class="equip-slot-square" id="cd-sq-${slot}" style="${this.selectedSlot === slot ? 'border-color:#ffbf00;' : ''}"><span style="color:#555; font-size:12px;">Пусто</span></div></div>
                `;
            }

            const sqEl = document.getElementById(`cd-sq-${slot}`);
            if (sqEl) {
                sqEl.onclick = () => {
                    if (item) this.unequipItem(slot);
                    else { this.selectedSlot = slot; this.updateDetailsSlots(); this.renderDetailsInventory(); }
                };
            }

            const upBtn = wrapEl.querySelector('.cd-slot-upgrade-btn');
            if (upBtn) {
                upBtn.onclick = (e) => {
                    e.stopPropagation();
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
                        adv.hp += (newH - oldH); adv.stamina += (newS - oldS);
                        this.updateDetailsStats(); this.updateDetailsSlots();
                    }
                };
            }
        });

        const panel = document.getElementById('cd-skills-panel');
        panel.innerHTML = '';
        if (adv.equipment.rightHand && adv.equipment.rightHand.skills) {
            adv.equipment.rightHand.skills.forEach(s => {
                const skillKey = s.id || s.key || '';
                const ttId = TooltipManager.registerTooltip(HubTemplates.getSkillTooltipHTML(s, adv.equipment.rightHand));
                panel.innerHTML += `<div class="cd-skill-square" data-tooltip-id="${ttId}">${skillKey ? `<img src="assets/img/weaponSkillsIcons/${skillKey}.png">` : ''}<span class="cd-skill-text-fallback" style="${skillKey ? 'display:none;' : ''}">${s.name}</span></div>`;
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

        this.updateDetailsStats(); this.updateDetailsSlots(); this.renderDetailsInventory();
        if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
            window.SaveManager.saveGame();
        }
    }

    static renderDetailsInventory() {
        const container = document.getElementById('cd-inventory');
        const filterContainer = document.getElementById('cd-inv-filters');
        container.innerHTML = ''; filterContainer.innerHTML = '';

        const slot = this.selectedSlot;
        if (!slot) return;

        const labelsObj = slot === 'body' ? ARMOR_LABELS : WEAPON_LABELS;
        const availableCategories = new Set();
        
        GameState.inventory.forEach(i => {
            if (slot === 'body' && (i.type === 'armor' || i.type === 'body' || i.type === 'civil')) {
                const cat = HubManager.getLocalCategory(i); if (cat) availableCategories.add(cat);
            } else if (slot === 'rightHand' && i.type === 'weapon') {
                const cat = HubManager.getLocalCategory(i); if (cat) availableCategories.add(cat);
            }
        });

        if (availableCategories.size > 0) {
            filterContainer.className = 'filter-btn-group';
            const btnAll = document.createElement('button');
            btnAll.className = `filter-toggle-btn ${this.activeModalFilter === 'all' ? 'active' : ''}`;
            btnAll.style.borderColor = 'var(--border-main)'; btnAll.innerText = '⭐ Все';
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
            let matchesSlot = slot === 'body' ? (i.type === 'armor' || i.type === 'body' || i.type === 'civil') : (slot === 'rightHand' ? i.type === 'weapon' : i.type === 'offhand');
            if (!matchesSlot) return false;
            if (this.activeModalFilter !== 'all' && HubManager.getLocalCategory(i) !== this.activeModalFilter) return false;
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p style="color:#888; padding:10px; width: 100%; text-align:center;">Нет подходящих предметов по фильтру.</p>`;
            return;
        }

        filtered.forEach(item => {
            const box = document.createElement('div');
            box.className = 'inv-item'; box.style.position = 'relative'; box.style.overflow = 'hidden';
            
            const isWeapon = item.type === 'weapon';
            const spriteKey = item.key || item.name;
            const folderName = isWeapon ? 'weapon/weaponForSale' : 'outfit/outfitsForSale';
            const spritePath = `assets/img/${folderName}/${spriteKey}.png`;
            
            const spriteScale = 2.5; const shiftX = '-5px'; const shiftY = '10px';
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
            
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            box.onclick = () => {
                TooltipManager.clear();
                if(TooltipManager.tooltipEl) TooltipManager.tooltipEl.style.display = 'none';
                let oldH = RecruitManager.getStat(this.inspectedAdv, 'hp'), oldS = RecruitManager.getStat(this.inspectedAdv, 'stamina');
                const oldEquippedItem = this.inspectedAdv.equipment[slot];
                if (oldEquippedItem) GameState.inventory.push(oldEquippedItem);
                this.inspectedAdv.equipment[slot] = item;
                GameState.inventory.splice(GameState.inventory.findIndex(i => i.id === item.id), 1);
                let newH = RecruitManager.getStat(this.inspectedAdv, 'hp'), newS = RecruitManager.getStat(this.inspectedAdv, 'stamina');
                this.inspectedAdv.hp += (newH - oldH); this.inspectedAdv.stamina += (newS - oldS);
                this.updateDetailsStats(); this.updateDetailsSlots(); this.renderDetailsInventory();

                if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
                    window.SaveManager.saveGame();
                }
            };
            container.appendChild(box);
        });
    }

    static getUnitRangeData(adv) {
        const weapon = adv.equipment.rightHand;
        if (!weapon || !weapon.skills) return { ranks: {1:0, 2:0, 3:0, 4:0}, targets: {1:0, 2:0, 3:0, 4:0} };

        let ranks = {1:0, 2:0, 3:0, 4:0}, targets = {1:0, 2:0, 3:0, 4:0};
        weapon.skills.forEach(skill => {
            const vPos = skill.validPos || weapon.defaultSkillData?.validPos || [1, 2];
            const tPos = skill.targetPos || weapon.defaultSkillData?.targetPos || [1, 2];
            vPos.forEach(p => { if(ranks[p] !== undefined) ranks[p]++; });
            tPos.forEach(p => { if(targets[p] !== undefined) targets[p]++; });
        });
        return { ranks, targets };
    }

    static increaseStat(statName) {
        const adv = this.inspectedAdv;
        if (!adv || !adv.unspentPoints || adv.unspentPoints <= 0) return;

        const isVital = (statName === 'hp' || statName === 'stamina');
        const gain = isVital ? (HUB_BALANCE.leveling.vitalGainPerPoint || 10) : (HUB_BALANCE.leveling.statGainPerPoint || 2);

        adv.pureStats[statName] = (adv.pureStats[statName] || 0) + gain;
        adv.allocatedPoints[statName] = (adv.allocatedPoints[statName] || 0) + 1;
        adv.unspentPoints--;

        if (statName === 'hp') adv.hp += gain;
        if (statName === 'stamina') adv.stamina += gain;
        this.updateDetailsStats();
        if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
            window.SaveManager.saveGame();
        }
    }

    static decreaseStat(statName) {
        const adv = this.inspectedAdv;
        if (!adv || !adv.allocatedPoints || !adv.allocatedPoints[statName] || adv.allocatedPoints[statName] <= 0) return;

        const isVital = (statName === 'hp' || statName === 'stamina');
        const gain = isVital ? (HUB_BALANCE.leveling.vitalGainPerPoint || 10) : (HUB_BALANCE.leveling.statGainPerPoint || 2);

        adv.pureStats[statName] = Math.max(0, (adv.pureStats[statName] || 0) - gain);
        adv.allocatedPoints[statName]--;
        adv.unspentPoints++;

        if (statName === 'hp') adv.hp = Math.max(1, adv.hp - gain);
        if (statName === 'stamina') adv.stamina = Math.max(0, adv.stamina - gain);
        this.updateDetailsStats();
        if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
            window.SaveManager.saveGame();
        }
    }
}

window.CharacterDetailsManager = CharacterDetailsManager;