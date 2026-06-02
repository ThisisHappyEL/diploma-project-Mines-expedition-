import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { swords, spears, hammers, axes, slings, crossbows, bows, arquebuses } from '../../data/battleData/weapon.js';
import { STAT_NAMES, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS } from '../../data/workersData/labels.js';
import { HubManager } from './HubManager.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { TradeUIHelper } from './TradeUIHelper.js';

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

    static itemMatchesTab(item, tab) {
        if (!item) return false;
        if (tab === 'weapon') return item.type === 'weapon';
        return item.type === 'armor' || item.type === 'body' || item.type === 'civil' || !item.type;
    }

    static render(container) {
        if (this.lastCycle !== GameState.cycle) {
            this.lastCycle = GameState.cycle;
            this.sessionBought.clear();
        }

        GameState.initDebugInventory(); 
        
        TradeUIHelper.initArmorDB(this.ARMOR_DB, HUB_BALANCE.forge.maxArmorLevel);
        
        if (Object.keys(this.filters.invArmor).length === 0) {
            Object.keys(this.ARMOR_DB).forEach(key => {
                this.filters.invArmor[key] = true;
                this.filters.shopArmor[key] = true;
            });
        }

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

        const showMax = this.tabInv === 'weapon' ? this.showMaxInvWeapon : this.showMaxInvArmor;
        const extraBtnHTML = `<button class="filter-toggle-btn special-filter-btn ${showMax ? 'active' : ''}" style="margin-right: 12px;">🔒 Максимум</button>`;

        TradeUIHelper.renderFilterHeader({
            columnDiv: leftCol,
            titleText: 'Имеющийся арсенал:',
            activeTab: this.tabInv,
            isInv: true,
            isExpanded: this.invExpanded,
            onToggleExpand: () => { this.invExpanded = !this.invExpanded; this.render(container); },
            onTabChange: (newTab) => { this.tabInv = newTab; this.render(container); },
            filterObj: this.tabInv === 'weapon' ? this.filters.invWeapon : this.filters.invArmor,
            labelsObj: this.tabInv === 'weapon' ? WEAPON_LABELS : ARMOR_LABELS,
            onFilterToggle: () => this.render(container),
            extraControlsHTML: extraBtnHTML,
            onExtraClick: () => {
                if (this.tabInv === 'weapon') this.showMaxInvWeapon = !this.showMaxInvWeapon;
                else this.showMaxInvArmor = !this.showMaxInvArmor;
                this.render(container);
            }
        });

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
                    row.querySelector('.btn-refund').onclick = (e) => { e.stopPropagation(); this.refundItem(item, container); };
                    row.querySelector('.btn-upgrade').onclick = (e) => { e.stopPropagation(); this.openUpgradeModal(item, container); };
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

        TradeUIHelper.renderFilterHeader({
            columnDiv: rightCol,
            titleText: 'Доступно к приобретению:',
            activeTab: this.tabShop,
            isInv: false,
            isExpanded: this.shopExpanded,
            onToggleExpand: () => { this.shopExpanded = !this.shopExpanded; this.render(container); },
            onTabChange: (newTab) => { this.tabShop = newTab; this.render(container); },
            filterObj: this.tabShop === 'weapon' ? this.filters.shopWeapon : this.filters.shopArmor,
            labelsObj: this.tabShop === 'weapon' ? WEAPON_LABELS : ARMOR_LABELS,
            onFilterToggle: () => this.render(container)
        });

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
        
        TradeUIHelper.attachSkillTooltips(container);
    }

    static getItemRowHTML(item, isUpgrade, isRefund = false) {
        if (!item) return '';
        const spriteScale = 3.0; const shiftX = '-5px'; const shiftY = '10px';
        const cost = item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel;
        const upgradeCost = item.level * HUB_BALANCE.forge.baseUpgradeCostPerLevel;
        const isArmor = this.itemMatchesTab(item, 'armor');
        const currentCandles = GameState.resources.candles;

        const spriteKey = item.key || item.name;
        const folderName = isArmor ? 'outfit/outfitsForSale' : 'weapon/weaponForSale';
        const spritePath = `assets/img/${folderName}/${spriteKey}.png`;

        let actionButtonHTML;

        if (isUpgrade) {
            let upgradeBtnHTML;
            let upgradeCostHTML = '';
            
            const maxLevelLimit = isArmor ? HUB_BALANCE.forge.maxArmorLevel : HUB_BALANCE.forge.maxWeaponLevel;
            if (item.level >= maxLevelLimit) {
                upgradeBtnHTML = `<button class="hub-btn btn-bold" style="padding: 5px 15px; margin: 0; opacity: 0.5;" disabled="true">МАКС.</button>`;
            } else {
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
                    const iconHtml = skillKey ? `<img class="skill-icon-img" src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.style.display='none'">` : '';
                    const ttId = TooltipManager.registerTooltip(HubManager.getSkillTooltipHTML(s, item));
                    detailBoxesHtml += `<div class="fr-skill-box" data-tooltip-id="${ttId}">${iconHtml}<span style="position: absolute; z-index: 0;">${s.name}</span></div>`;
                });
            }
        }

        return `
            <div class="fr-header">
                <div class="fr-name" style="width: auto; display: flex; align-items: baseline;">
                    ${item.name} 
                    <span style="font-size: 13px; color: var(--color-gold); margin-left: 8px; font-weight: normal;">ур. ${item.level || 1}</span>
                </div>
                <div class="fr-action">${actionButtonHTML}</div>
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

    static openUpgradeModal(oldItem, container) {
        TooltipManager.clear();
        const modalSpriteScale = 3; const modalShiftX = '0px'; const modalShiftY = '0px';
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
        document.getElementById('upgrade-close-btn').onclick = () => modal.classList.add('hidden');

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
                            <div class="fr-skill-box skill-icon-only" style="margin:2px;" data-tooltip-id="${ttId}"><img class="skill-icon-img" src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';"></div>
                            <div class="fr-skill-box text-fallback" style="display:none; margin:2px;" data-tooltip-id="${ttId}"><span>${s.name}</span></div>
                        `;
                    } else {
                        detailsHtml += `<div class="fr-skill-box text-fallback" style="margin:2px;" data-tooltip-id="${ttId}"><span>${s.name}</span></div>`;
                    }
                });
            }

            const canAfford = GameState.resources.candles >= cost;
            box.innerHTML = `
                <div class="fr-sprite-box" style="width: 150px; height: 150px; background: transparent !important; border: none !important; overflow: visible !important; position: relative; flex-shrink:0;">
                    <img src="${spritePath}" onerror="this.parentNode.innerHTML='Нет спрайта'" style="max-width:100%; max-height:100%; transform: translate(${modalShiftX}, ${modalShiftY}) scale(${modalSpriteScale}); transform-origin: center center; object-fit: contain;">
                </div>
                <h3>${variant.name}</h3>
                <div style="color:var(--text-muted); margin-bottom: 5px;">${isArmor ? `Защита: <b style="color:#fff">${variant.stats?.hp || 0} ХП</b>` : `Урон: <b style="color:#fff">${variant.baseDamage}</b>`}</div>
                ${variant.description ? `<div style="font-size:11px; color:#aaa; font-style:italic; text-align:center; padding: 0 10px; margin-bottom:10px;">${variant.description}</div>` : ''}
                <div style="width:100%; border-top:1px solid #555; padding-top:10px; margin-bottom:auto;"><div class="fr-skills-list" style="justify-content:center;">${detailsHtml}</div></div>
                <button class="hub-btn action-btn btn-bold btn-upgrade" style="width:100%; margin-top:20px; text-align:center; color:${canAfford ? 'inherit' : 'var(--color-danger)'};" ${canAfford ? '' : 'disabled="true"'}>Улучшить за ${cost} 🕯️</button>
            `;

            const btn = box.querySelector('.btn-upgrade');
            if(btn) btn.onclick = () => this.performUpgrade(oldItem, variant, cost, modal, container);
            splitContainer.appendChild(box);
        });

        TradeUIHelper.attachSkillTooltips(splitContainer);
    }

    static performUpgrade(oldItem, newItemDef, cost, modal, container) {
        if (GameState.resources.candles < cost) return;
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
        if (GameState.resources.candles < cost) { alert('Не хватает свечей!'); return; }
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
