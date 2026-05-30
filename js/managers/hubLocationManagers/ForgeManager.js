import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { swords, spears, hammers, axes, slings, crossbows, bows, arquebuses } from '../../data/battleData/weapon.js';
import { OUTFITS } from '../../data/workersData/outfit.js';
import { STAT_NAMES, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS } from '../../data/workersData/labels.js';
import { HubManager } from './HubManager.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';

export class ForgeManager {
    static lastCycle = -1;
    static sessionBought = new Set(); 

    static mapWeaponCategory(dbObj) {
        if (!dbObj) return [];
        return Object.entries(dbObj).map(([key, val]) => {
            return { ...val, key: key }; 
        });
    }

    static WEAPONS_DB = {
        swords: ForgeManager.mapWeaponCategory(swords),
        spears: ForgeManager.mapWeaponCategory(spears),
        hammers: ForgeManager.mapWeaponCategory(hammers),
        axes: ForgeManager.mapWeaponCategory(axes),
        slings: ForgeManager.mapWeaponCategory(slings),
        crossbows: ForgeManager.mapWeaponCategory(crossbows),
        bows: ForgeManager.mapWeaponCategory(bows),
        arquebuses: ForgeManager.mapWeaponCategory(arquebuses),
    };

    static ARMOR_DB = {}; 

    static tabInv = 'weapon';
    static tabShop = 'weapon';

    static filters = {
        invWeapon: { swords: true, spears: true, hammers: true, axes: true, slings: true, crossbows: true, bows: true, arquebuses: true },
        shopWeapon: { swords: true, spears: true, hammers: true, axes: true, slings: true, crossbows: true, bows: true, arquebuses: true },
        invArmor: {}, shopArmor: {}
    };

    static invExpanded = true;
    static shopExpanded = true;
    static showMaxInvWeapon = false;
    static showMaxInvArmor = false;

    static initArmorDB() {
        if (Object.keys(this.ARMOR_DB).length > 0) return;
        for (const [name, data] of Object.entries(OUTFITS)) {
            this.ARMOR_DB[name] = [];
            this.filters.invArmor[name] = true;
            this.filters.shopArmor[name] = true;
            for (let lvl = 1; lvl <= HUB_BALANCE.forge.maxArmorLevel; lvl++) {
                if (data.levels && data.levels[lvl]) {
                    this.ARMOR_DB[name].push({
                        name: data.name,
                        type: 'armor',
                        key: name, 
                        level: lvl,
                        description: data.description,
                        stats: data.levels[lvl],
                        sprite: 'Нет спрайта'
                    });
                }
            }
        }
    }

    static itemMatchesTab(item, tab) {
        if (!item) return false;
        if (tab === 'weapon') return item.type === 'weapon';
        return item.type === 'armor' || item.type === 'body' || item.type === 'civil' || !item.type;
    }

    static toggleAll(filterObj, container) {
        const keys = Object.keys(filterObj);
        const anyInactive = keys.some(k => !filterObj[k]);
        keys.forEach(k => filterObj[k] = anyInactive);
        this.render(container);
    }

    static renderFilterHeader(columnDiv, titleText, activeTab, isInv, containerToReRender) {
        const headerBox = document.createElement('div');
        headerBox.style.cssText = "display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 15px; width: 100%;";

        const isExpanded = isInv ? this.invExpanded : this.shopExpanded;

        const titleRow = document.createElement('div');
        titleRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; width: 100%;";
        
        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';

        const toggleBtn = document.createElement('button');
        toggleBtn.style.cssText = "background: transparent; border: none; color: var(--color-gold); font-size: 20px; cursor: pointer; margin-right: 12px; padding: 0; line-height: 1;";
        toggleBtn.innerText = isExpanded ? '▼' : '►';
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            if (isInv) this.invExpanded = !this.invExpanded;
            else this.shopExpanded = !this.shopExpanded;
            this.render(containerToReRender);
        };
        leftSide.appendChild(toggleBtn);

        const title = document.createElement('h3');
        title.style.color = '#ffbf00';
        title.style.margin = '0';
        title.innerText = titleText;
        leftSide.appendChild(title);
        titleRow.appendChild(leftSide);

        if (isExpanded) {
            const tabs = document.createElement('div');
            tabs.className = 'type-tabs';
            tabs.style.display = 'flex';
            tabs.style.alignItems = 'center';
            
            if (isInv) {
                const maxBtn = document.createElement('button');
                const showMax = activeTab === 'weapon' ? this.showMaxInvWeapon : this.showMaxInvArmor;
                maxBtn.className = `filter-toggle-btn special ${showMax ? 'active' : ''}`;
                maxBtn.style.marginRight = '12px'; 
                maxBtn.innerText = '🔒 Максимум';
                maxBtn.onclick = () => { 
                    if (activeTab === 'weapon') this.showMaxInvWeapon = !this.showMaxInvWeapon;
                    else this.showMaxInvArmor = !this.showMaxInvArmor;
                    this.render(containerToReRender); 
                };
                tabs.appendChild(maxBtn);
            }

            const btnW = document.createElement('button');
            btnW.className = `type-tab-btn ${activeTab === 'weapon' ? 'active' : ''}`;
            btnW.innerText = 'Оружие';
            btnW.onclick = () => { if (isInv) this.tabInv = 'weapon'; else this.tabShop = 'weapon'; this.render(containerToReRender); };
            
            const btnA = document.createElement('button');
            btnA.className = `type-tab-btn ${activeTab === 'armor' ? 'active' : ''}`;
            btnA.innerText = 'Броня';
            btnA.onclick = () => { if (isInv) this.tabInv = 'armor'; else this.tabShop = 'armor'; this.render(containerToReRender); };

            tabs.appendChild(btnW);
            tabs.appendChild(btnA);
            titleRow.appendChild(tabs);
        }

        headerBox.appendChild(titleRow);

        if (isExpanded) {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'filter-btn-group';

            const filterObj = isInv ? (activeTab === 'weapon' ? this.filters.invWeapon : this.filters.invArmor) : (activeTab === 'weapon' ? this.filters.shopWeapon : this.filters.shopArmor);
            const labelsObj = activeTab === 'weapon' ? WEAPON_LABELS : ARMOR_LABELS;

            const allBtn = document.createElement('button');
            allBtn.className = 'filter-toggle-btn';
            allBtn.style.borderColor = 'var(--border-main)';
            allBtn.innerText = '⭐ Все';
            allBtn.onclick = () => this.toggleAll(filterObj, containerToReRender);
            filterGroup.appendChild(allBtn);

            Object.keys(filterObj).forEach(key => {
                const btn = document.createElement('button');
                btn.className = `filter-toggle-btn ${filterObj[key] ? 'active' : ''}`;
                btn.innerText = labelsObj[key] || key;
                btn.onclick = () => { filterObj[key] = !filterObj[key]; this.render(containerToReRender); };
                filterGroup.appendChild(btn);
            });

            headerBox.appendChild(filterGroup);
        }
        columnDiv.appendChild(headerBox);
    }

    static render(container) {
        if (this.lastCycle !== GameState.cycle) {
            this.lastCycle = GameState.cycle;
            this.sessionBought.clear();
        }

        GameState.initDebugInventory(); 
        this.initArmorDB();

        (GameState.inventory || []).forEach(item => {
            if (item && (item.type === 'armor' || item.type === 'body' || item.type === 'civil' || !item.type)) {
                for (const key of Object.keys(this.ARMOR_DB)) {
                    if (item.name && item.name.includes(key)) {
                        item.name = key;
                        item.type = 'armor';
                        break;
                    }
                }
            }
        });

        container.style.display = 'flex'; 
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '0'; 
        container.style.overflow = 'hidden'; 
        container.innerHTML = '';

        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        container.appendChild(splitWrapper);

        const leftCol = document.createElement('div');
        leftCol.className = 'forge-column';
        splitWrapper.appendChild(leftCol);

        this.renderFilterHeader(leftCol, 'Имеющийся арсенал:', this.tabInv, true, container);

        const invList = document.createElement('div');
        invList.className = 'forge-column-list';
        leftCol.appendChild(invList);

        if (this.invExpanded) {
            const currentInvFilters = this.tabInv === 'weapon' ? this.filters.invWeapon : this.filters.invArmor;
            const currentShowMax = this.tabInv === 'weapon' ? this.showMaxInvWeapon : this.showMaxInvArmor;

            const inventoryItems = (GameState.inventory || []).filter(item => {
                if (!item || !this.itemMatchesTab(item, this.tabInv)) return false;
                const cat = HubManager.getLocalCategory(item);
                if (cat && !currentInvFilters[cat]) return false;
                
                const isSessionBought = ForgeManager.sessionBought.has(item.id);

                const currentShowMax = this.tabInv === 'weapon' ? this.showMaxInvWeapon : this.showMaxInvArmor;
                
                // исправление проблемы с неотображением предметов 4 уровня из-за невозможности их улучшить
                if (item.level >= 4 && !currentShowMax && !isSessionBought) return false;
                return true;
            });


            if (inventoryItems.length === 0) {
                invList.innerHTML = '<p style="color:#aaa;">Нет подходящих предметов на складе.</p>';
            } else {
                const refundItems = inventoryItems.filter(i => this.sessionBought.has(i.id));
                const regularItems = inventoryItems.filter(i => !this.sessionBought.has(i.id));

                refundItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row refund-row';
                    row.innerHTML = this.getItemRowHTML(item, true, true);
                    
                    const btnRefund = row.querySelector('.btn-refund');
                    if (btnRefund) btnRefund.onclick = (e) => { e.stopPropagation(); this.refundItem(item, container); };
                    
                    const btnUpgrade = row.querySelector('.btn-upgrade');
                    if (btnUpgrade) btnUpgrade.onclick = (e) => { e.stopPropagation(); this.openUpgradeModal(item, container); };
                    
                    invList.appendChild(row);
                });

                regularItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = this.getItemRowHTML(item, true, false);
                    
                    const btnUpgrade = row.querySelector('.btn-upgrade');
                    if (btnUpgrade) btnUpgrade.onclick = (e) => { e.stopPropagation(); this.openUpgradeModal(item, container); };
                    
                    invList.appendChild(row);
                });
            }
        }

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column';
        splitWrapper.appendChild(rightCol);

        this.renderFilterHeader(rightCol, 'Доступно к приобретению:', this.tabShop, false, container);

        const shopList = document.createElement('div');
        shopList.className = 'forge-column-list';
        rightCol.appendChild(shopList);

        if (this.shopExpanded) {
            const activeDB = this.tabShop === 'weapon' ? this.WEAPONS_DB : this.ARMOR_DB;
            const currentShopFilters = this.tabShop === 'weapon' ? this.filters.shopWeapon : this.filters.shopArmor;

            Object.entries(activeDB).forEach(([key, categoryList]) => {
                if (!categoryList || !currentShopFilters[key]) return;

                categoryList.forEach(itemDef => {
                    if (!itemDef) return;
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = this.getItemRowHTML(itemDef, false, false);
                    
                    const btnBuy = row.querySelector('.btn-buy');
                    if (btnBuy) btnBuy.onclick = (e) => { e.stopPropagation(); this.buyItem(itemDef, container); };
                    
                    shopList.appendChild(row);
                });
            });
        }
        
        this.attachSkillTooltips(container);
    }

    static getItemRowHTML(item, isUpgrade, isRefund = false) {
        if (!item) return '';
        const spriteScale = 3.0;
        const shiftX = '-5px';
        const shiftY = '10px';
        const cost = item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel;
        const upgradeCost = item.level * HUB_BALANCE.forge.baseUpgradeCostPerLevel;
        const isArmor = this.itemMatchesTab(item, 'armor');
        const currentCandles = GameState.resources.candles;

        const spriteKey = item.key || item.name;
        const folderName = isArmor ? 'outfit/outfitsForSale' : 'weapon/weaponForSale';
        const spritePath = `assets/img/${folderName}/${spriteKey}.png`;

        let actionButtonHTML = '';

        if (isUpgrade) {
            let upgradeBtnHTML = '';
            let upgradeCostHTML = '';
            
            const maxLevelLimit = isArmor ? HUB_BALANCE.forge.maxArmorLevel : HUB_BALANCE.forge.maxWeaponLevel;
            if (item.level >= maxLevelLimit) {
                upgradeBtnHTML = `<button class="hub-btn btn-bold" style="padding: 5px 15px; margin: 0; opacity: 0.5;" disabled="true">МАКС.</button>`;
            } else {
                const currentCandles = GameState.resources.candles;
                const canAfford = currentCandles >= upgradeCost;
                const costColor = canAfford ? 'var(--color-gold)' : 'var(--color-danger)';
                const disabledAttr = canAfford ? '' : 'disabled="true" style="opacity:0.5;"';

                upgradeCostHTML = `<span class="fr-cost" style="display:block; margin-bottom:4px; color:${costColor};">Улучшение: ${upgradeCost} 🕯️</span>`;
                upgradeBtnHTML = `<button class="hub-btn btn-bold action-btn btn-upgrade" style="padding: 5px 15px; margin: 0; color:${costColor};" ${disabledAttr}>Улучшить</button>`;
            }

            if (isRefund) {
                const refundCostHTML = `<span class="refund-text" style="display:block; margin-bottom:4px;">Возврат: ${cost} 🕯️</span>`;
                const refundBtnHTML = `<button class="hub-btn btn-bold action-btn btn-refund" style="padding: 5px 15px; margin: 0; border-color: var(--color-success); color: var(--color-success);">Вернуть</button>`;
                actionButtonHTML = `
                    <div style="display:flex; gap:15px; align-items:flex-end;">
                        <div style="text-align: right;">${refundCostHTML}${refundBtnHTML}</div>
                        <div style="text-align: right;">${upgradeCostHTML}${upgradeBtnHTML}</div>
                    </div>`;
            } else {
                actionButtonHTML = `<div style="text-align: right;">${upgradeCostHTML}${upgradeBtnHTML}</div>`;
            }
        } else {
            const canAfford = currentCandles >= cost;
            const costColor = canAfford ? 'var(--color-gold)' : 'var(--color-danger)';
            const disabledAttr = canAfford ? '' : 'disabled style="opacity:0.5;"';

            actionButtonHTML = `
                <div style="text-align: right;">
                    <span class="fr-cost" style="display:block; margin-bottom:4px; color:${costColor};">Цена: ${cost} 🕯️</span>
                    <button class="hub-btn btn-bold action-btn btn-buy" style="padding: 5px 15px; margin: 0;" ${disabledAttr}>Купить</button>
                </div>`;
        }

        let detailBoxesHtml = '';
        if (isArmor) {
            const statsObj = item.stats || item.levels?.[item.level] || item.effect || {};
            Object.entries(statsObj).forEach(([k, v]) => {
                if (v !== 0 && STAT_NAMES[k]) {
                    detailBoxesHtml += `<div class="fr-skill-box text-fallback" style="border-color:#555;" data-name="${STAT_NAMES[k]}" data-desc="${STAT_DESCRIPTIONS[k] || ''}">${STAT_NAMES[k]}: +${v}</div>`;
                }
            });
        } else {
            if (item.skills) {
                item.skills.forEach(s => {
                    if (!s) return;
                    const skillKey = s.id || s.key || '';
                    const iconHtml = skillKey 
                        ? `<img class="skill-icon-img" src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.style.display='none'">` 
                        : '';
                    
                    const ttId = TooltipManager.registerTooltip(HubManager.getSkillTooltipHTML(s, item));
                    
                    detailBoxesHtml += `
                        <div class="fr-skill-box" data-tooltip-id="${ttId}">
                            ${iconHtml}
                            <span style="position: absolute; z-index: 0;">${s.name}</span>
                        </div>`;
                });
            }
        }

        return `
            <div class="fr-header">
                <div class="fr-name" style="width: auto; display: flex; align-items: baseline;">
                    ${item.name} 
                    <span style="font-size: 13px; color: var(--color-gold); margin-left: 8px; font-weight: normal;">ур. ${item.level || 1}</span>
                </div>
                <div class="fr-action">
                    ${actionButtonHTML}
                </div>
            </div>
            <div class="fr-details">
                <div class="fr-sprite-box" style="background: transparent !important; background-color: transparent !important; border: none !important; overflow: visible !important; position: relative; flex-shrink:0;">
                    <img src="${spritePath}" onerror="this.parentNode.innerHTML='Нет спрайта'" style="max-width:100%; max-height:100%; transform: translate(${shiftX}, ${shiftY}) scale(${spriteScale}); transform-origin: center center; object-fit: contain;">
                </div>
                <div style="display:flex; flex-direction:column; flex:1;">
                    <div style="color:#aaa; font-size:12px; margin-bottom:5px;">${isArmor ? 'Характеристики:' : 'Боевые навыки:'}</div>
                    <div class="fr-skills-list" style="margin-bottom: 15px;">${detailBoxesHtml}</div>
                    ${item.description ? `<div class="fr-desc">${item.description}</div>` : ''}
                </div>
            </div>
        `;
    }

    static attachSkillTooltips(container) {
        const skillBoxes = container.querySelectorAll('.fr-skill-box[data-name]');
        skillBoxes.forEach(box => {
            const name = box.getAttribute('data-name');
            const desc = box.getAttribute('data-desc');
            if (name) {
                const html = `<b>${name}</b><br><span style='color:#aaa'>${desc}</span>`;
                const ttId = TooltipManager.registerTooltip(html);
                box.setAttribute('data-tooltip-id', ttId);
            }
        });
    }

    static openUpgradeModal(oldItem, container) {
        TooltipManager.clear();
        const modalSpriteScale = 3;
        const modalShiftX = '0px';
        const modalShiftY = '0px';
        
        let nextLevelVariants = [];
        const isArmor = this.itemMatchesTab(oldItem, 'armor');
        const activeDB = isArmor ? this.ARMOR_DB : this.WEAPONS_DB;

        for (const category of Object.values(activeDB)) {
            if (category && category.some(i => i && i.key === oldItem.key)) {
                nextLevelVariants = category.filter(i => i && i.level === oldItem.level + 1);
                break;
            }
        }

        if (nextLevelVariants.length === 0) return alert('Улучшений не найдено.');

        const modal = document.getElementById('upgrade-modal');
        modal.classList.remove('hidden');
        document.getElementById('upgrade-title').innerText = `Улучшение: ${oldItem.name} ➔ Ур. ${oldItem.level + 1}`;
        
        document.getElementById('upgrade-close-btn').onclick = () => {
            modal.classList.add('hidden');
        };

        const modalBody = document.getElementById('upgrade-body');
        modalBody.innerHTML = '<div class="upgrade-split-container"></div>';
        const splitContainer = modalBody.querySelector('.upgrade-split-container');

        nextLevelVariants.forEach(variant => {
            if (!variant) return;
            const cost = oldItem.level * HUB_BALANCE.forge.baseUpgradeCostPerLevel;
            const box = document.createElement('div');
            box.className = 'upgrade-variant';
            
            const spriteKey = variant.key || variant.name;
            const folderName = isArmor ? 'outfit/outfitsForSale' : 'weapon/weaponForSale';
            const spritePath = `assets/img/${folderName}/${spriteKey}.png`;
            
            let detailsHtml = '';
            if (isArmor) {
                const statsObj = variant.stats || variant.levels?.[variant.level] || variant.effect || {};
                Object.entries(statsObj).forEach(([k, v]) => {
                    if (v !== 0 && STAT_NAMES[k]) {
                        detailsHtml += `<div class="fr-skill-box text-fallback" style="margin:2px; border-color:#555;" data-name="${STAT_NAMES[k]}" data-desc="${STAT_DESCRIPTIONS[k]}">${STAT_NAMES[k]}: +${v}</div>`;
                    }
                });
            } else {
                variant.skills.forEach(s => {
                    if (!s) return;
                    const skillKey = s.id || s.key || '';
                    const ttId = TooltipManager.registerTooltip(HubManager.getSkillTooltipHTML(s, variant));
                    
                    if (skillKey) {
                        detailsHtml += `
                            <div class="fr-skill-box skill-icon-only" style="margin:2px;" data-tooltip-id="${ttId}">
                                <img class="skill-icon-img" src="assets/img/weaponSkillsIcons/${skillKey}.png" 
                                     onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';">
                            </div>
                            <div class="fr-skill-box text-fallback" style="display:none; margin:2px;" data-tooltip-id="${ttId}">
                                <span>${s.name}</span>
                            </div>
                        `;
                    } else {
                        detailsHtml += `<div class="fr-skill-box text-fallback" style="margin:2px;" data-tooltip-id="${ttId}"><span>${s.name}</span></div>`;
                    }
                });
            }

            // проверяем баланс и красим ценник, если не хватает
            const canAfford = GameState.resources.candles >= cost;
            const costColor = canAfford ? 'inherit' : 'var(--color-danger)';
            const disabledAttr = canAfford ? '' : 'disabled="true" style="opacity:0.5;"';

            box.innerHTML = `
                <div class="fr-sprite-box" style="width: 150px; height: 150px; background: transparent !important; background-color: transparent !important; border: none !important; overflow: visible !important; position: relative; flex-shrink:0;">
                    <img src="${spritePath}" onerror="this.parentNode.innerHTML='Нет спрайта'" style="max-width:100%; max-height:100%; transform: translate(${modalShiftX}, ${modalShiftY}) scale(${modalSpriteScale}); transform-origin: center center; object-fit: contain;">
                </div>
                <h3>${variant.name}</h3>
                <div style="color:var(--text-muted); margin-bottom: 5px;">${isArmor ? `Защита: <b style="color:#fff">${variant.stats?.hp || 0} ХП</b>` : `Урон: <b style="color:#fff">${variant.baseDamage}</b>`}</div>
                ${variant.description ? `<div style="font-size:11px; color:#aaa; font-style:italic; text-align:center; padding: 0 10px; margin-bottom:10px;">${variant.description}</div>` : ''}
                
                <div style="width:100%; border-top:1px solid #555; padding-top:10px; margin-bottom:auto;">
                    <div class="fr-skills-list" style="justify-content:center;">${detailsHtml}</div>
                </div>
                <button class="hub-btn action-btn btn-bold btn-upgrade" style="width:100%; margin-top:20px; text-align:center; color:${costColor};" ${disabledAttr}>Улучшить за ${cost} 🕯️</button>
            `;

            const btn = box.querySelector('.btn-upgrade');
            if(btn) btn.onclick = () => this.performUpgrade(oldItem, variant, cost, modal, container);
            splitContainer.appendChild(box);
        });

        this.attachSkillTooltips(splitContainer);
    }

    static performUpgrade(oldItem, newItemDef, cost, modal, container) {
        if (GameState.resources.candles < cost) {
            return;
        }
        
        GameState.resources.candles -= cost;
        GameState.updateTopBarUI();

        const index = GameState.inventory.findIndex(i => i.id === oldItem.id);
        if (index > -1) GameState.inventory.splice(index, 1);

        const newItemInstance = JSON.parse(JSON.stringify(newItemDef));
        newItemInstance.id = Date.now() + Math.random();
        GameState.inventory.push(newItemInstance);

        modal.classList.add('hidden');
        this.render(container);
    }

    static buyItem(itemDef, container) {
        const cost = itemDef.level * HUB_BALANCE.forge.basePurchaseCostPerLevel;
        if (GameState.resources.candles < cost) {
            alert('Не хватает свечей!');
            return;
        }
        GameState.resources.candles -= cost;
        GameState.updateTopBarUI();

        const newItemInstance = JSON.parse(JSON.stringify(itemDef));
        newItemInstance.id = `item_${Date.now()}_${Math.random()}`;
        GameState.inventory.push(newItemInstance);

        this.sessionBought.add(newItemInstance.id);
        this.render(container);
    }

    static refundItem(item, container) {
        const cost = item.level * 50;
        GameState.resources.candles += cost;
        GameState.updateTopBarUI();

        const idx = GameState.inventory.findIndex(i => i.id === item.id);
        if (idx > -1) GameState.inventory.splice(idx, 1);

        this.sessionBought.delete(item.id);
        this.render(container);
    }
}