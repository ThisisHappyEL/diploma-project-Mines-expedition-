import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { LOOT } from '../../data/expiditionData/lootData.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { swords, spears, hammers, axes, slings, crossbows, bows, arquebuses } from '../../data/battleData/weapon.js';
import { STAT_NAMES, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS, LOOT_LABELS, SUPPLIES_LABELS } from '../../data/workersData/labels.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';
import { HubManager } from './HubManager.js';
import { TradeUIHelper } from './TradeUIHelper.js';

export class BazaarManager {
    static tabInv = 'all';
    static tabShop = 'all';

    static invExpanded = true;
    static shopExpanded = true;

    static sessionBought = new Set(); 
    static sessionSold = [];        

    static merchantInventory = []; 
    static unlimitedSupplies = [];  
    static lastGeneratedCycle = -1;

    static mapWeaponCategory(dbObj) {
        if (!dbObj) return [];
        return Object.entries(dbObj).map(([key, val]) => {
            return { ...val, key: key };
        });
    }

    static WEAPONS_DB = {
        swords: BazaarManager.mapWeaponCategory(swords),
        spears: BazaarManager.mapWeaponCategory(spears),
        hammers: BazaarManager.mapWeaponCategory(hammers),
        axes: BazaarManager.mapWeaponCategory(axes),
        slings: BazaarManager.mapWeaponCategory(slings),
        crossbows: BazaarManager.mapWeaponCategory(crossbows),
        bows: BazaarManager.mapWeaponCategory(bows),
        arquebuses: BazaarManager.mapWeaponCategory(arquebuses),
    };

    static ARMOR_DB = {}; 

    static filters = {
        invWeapon: { swords: true, spears: true, hammers: true, axes: true, slings: true, crossbows: true, bows: true, arquebuses: true },
        shopWeapon: { swords: true, spears: true, hammers: true, axes: true, slings: true, crossbows: true, bows: true, arquebuses: true },
        invArmor: {}, shopArmor: {},
        invLoot: { valuableTypesOfStone: true, minerals: true, preciousStones: true, naturalResources: true, gases: true, researchResults: true, scientificSamples: true, battlePrey: true },
        shopLoot: { valuableTypesOfStone: true, minerals: true, preciousStones: true, naturalResources: true, gases: true, researchResults: true, scientificSamples: true, battlePrey: true },
        invSupplies: { foodAndWater: true, miningMaterials: true, researchMaterials: true, buildingMaterials: true, scoutingMaterials: true },
        shopSupplies: { foodAndWater: true, miningMaterials: true, researchMaterials: true, buildingMaterials: true, scoutingMaterials: true }
    };

    static initUnlimitedSupplies() {
        if (BazaarManager.unlimitedSupplies.length > 0) return;
        Object.entries(EQUIPMENT).forEach(([cat, list]) => {
            Object.entries(list).forEach(([key, item]) => {
                const mappedCategory = (cat === 'food' || cat === 'water') ? 'foodAndWater' : cat;
                BazaarManager.unlimitedSupplies.push({
                    ...item,
                    id: `bazaar_infinite_${cat}_${key}`,
                    category: mappedCategory,
                    key: key,
                    type: 'supplies',
                    isInfinite: true 
                });
            });
        });
    }

    static generateWares() {
        if (BazaarManager.lastGeneratedCycle === GameState.cycle) return;
        BazaarManager.lastGeneratedCycle = GameState.cycle;

        BazaarManager.sessionBought.clear();
        BazaarManager.sessionSold = [];
        BazaarManager.merchantInventory = [];

        const allWeapons = Object.values(BazaarManager.WEAPONS_DB).flat();
        const allArmor = Object.values(BazaarManager.ARMOR_DB).flat();
        
        const countEquipment = Math.floor(Math.random() * (HUB_BALANCE.bazaar.maxEquipWares - HUB_BALANCE.bazaar.minEquipWares + 1)) + HUB_BALANCE.bazaar.minEquipWares;
        for (let i = 0; i < countEquipment; i++) {
            const isWeapon = Math.random() > 0.5;
            const pool = isWeapon ? allWeapons : allArmor;
            if (pool.length > 0) {
                const randomItem = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
                randomItem.id = `bazaar_shop_equip_${Date.now()}_${Math.random()}`;
                randomItem.price = Math.round((randomItem.level * HUB_BALANCE.forge.basePurchaseCostPerLevel) * HUB_BALANCE.bazaar.discountMultiplier);
                randomItem.isDiscounted = true;
                BazaarManager.merchantInventory.push(randomItem);
            }
        }

        const lootPool = [];
        Object.entries(LOOT).forEach(([cat, list]) => {
            Object.entries(list).forEach(([key, item]) => {
                lootPool.push({ ...item, key: key, category: cat, type: 'loot' });
            });
        });
        const countLoot = Math.floor(Math.random() * (HUB_BALANCE.bazaar.maxLootWares - HUB_BALANCE.bazaar.minLootWares + 1)) + HUB_BALANCE.bazaar.minLootWares;
        for (let i = 0; i < countLoot; i++) {
            const randomItem = JSON.parse(JSON.stringify(lootPool[Math.floor(Math.random() * lootPool.length)]));
            randomItem.id = `bazaar_shop_loot_${Date.now()}_${Math.random()}`;
            BazaarManager.merchantInventory.push(randomItem);
        }
    }

    static itemMatchesTab(item, tab) {
        if (!item) return false;
        if (tab === 'weapon') return item.type === 'weapon';
        return item.type === 'armor' || item.type === 'body' || item.type === 'civil' || !item.type;
    }

    static render(container) {
        GameState.initDebugInventory(); 
        BazaarManager.generateWares(); 
        
        TradeUIHelper.initArmorDB(this.ARMOR_DB);

        if (Object.keys(this.filters.invArmor).length === 0) {
            Object.keys(this.ARMOR_DB).forEach(key => {
                this.filters.invArmor[key] = true;
                this.filters.shopArmor[key] = true;
            });
        }
        BazaarManager.initUnlimitedSupplies(); 

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

        let activeInvFilterObj = null;
        let activeInvLabelsObj = null;
        if (this.tabInv === 'weapon') { activeInvFilterObj = this.filters.invWeapon; activeInvLabelsObj = WEAPON_LABELS; }
        else if (this.tabInv === 'armor') { activeInvFilterObj = this.filters.invArmor; activeInvLabelsObj = ARMOR_LABELS; }
        else if (this.tabInv === 'loot') { activeInvFilterObj = this.filters.invLoot; activeInvLabelsObj = LOOT_LABELS; }
        else if (this.tabInv === 'supplies') { activeInvFilterObj = this.filters.invSupplies; activeInvLabelsObj = SUPPLIES_LABELS; }

        TradeUIHelper.renderFilterHeader({
            columnDiv: leftCol,
            titleText: 'Ваши запасы на складе:',
            activeTab: this.tabInv,
            isInv: true,
            isExpanded: this.invExpanded,
            onToggleExpand: () => { this.invExpanded = !this.invExpanded; this.render(container); },
            onTabChange: (newTab) => { this.tabInv = newTab; this.render(container); },
            filterObj: activeInvFilterObj,
            labelsObj: activeInvLabelsObj,
            onFilterToggle: () => this.render(container),
            tabsList: [
                { id: 'all', name: 'Всё' },
                { id: 'weapon', name: 'Оружие' },
                { id: 'armor', name: 'Броня' },
                { id: 'loot', name: 'Ресурсы' },
                { id: 'supplies', name: 'Припасы' }
            ]
        });

        const invList = document.createElement('div');
        invList.className = 'forge-column-list';
        leftCol.appendChild(invList);

        if (this.invExpanded) {
            const inventoryItems = (GameState.inventory || []).filter(item => {
                if (!item) return false;
                if (this.tabInv !== 'all') {
                    if (this.tabInv === 'armor') {
                        if (item.type !== 'armor' && item.type !== 'body' && item.type !== 'civil') return false;
                    } else {
                        if (item.type !== this.tabInv) return false;
                    }
                }
                const cat = HubManager.getLocalCategory(item) || item.category;
                if (this.tabInv === 'weapon' && cat && !this.filters.invWeapon[cat]) return false;
                if (this.tabInv === 'armor' && cat && !this.filters.invArmor[cat]) return false;
                if (this.tabInv === 'loot' && cat && !this.filters.invLoot[cat]) return false;
                if (this.tabInv === 'supplies' && cat && !this.filters.invSupplies[cat]) return false;
                return true;
            });

            if (inventoryItems.length === 0) {
                invList.innerHTML = '<p style="color:#aaa;">Нет подходящих предметов для продажи.</p>';
            } else {
                const refundItems = inventoryItems.filter(i => this.sessionBought.has(i.id));
                const regularItems = inventoryItems.filter(i => !this.sessionBought.has(i.id));

                refundItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row refund-row'; 
                    row.innerHTML = this.getBazaarRowHTML(item, true); 
                    row.querySelector('.btn-sell').onclick = (e) => { e.stopPropagation(); this.sellItem(item, container); };
                    invList.appendChild(row);
                });

                regularItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = this.getBazaarRowHTML(item, true); 
                    row.querySelector('.btn-sell').onclick = (e) => { e.stopPropagation(); this.sellItem(item, container); };
                    invList.appendChild(row);
                });
            }
        }

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column';
        splitWrapper.appendChild(rightCol);

        let activeShopFilterObj = null;
        let activeShopLabelsObj = null;
        if (this.tabShop === 'weapon') { activeShopFilterObj = this.filters.shopWeapon; activeShopLabelsObj = WEAPON_LABELS; }
        else if (this.tabShop === 'armor') { activeShopFilterObj = this.filters.shopArmor; activeShopLabelsObj = ARMOR_LABELS; }
        else if (this.tabShop === 'loot') { activeShopFilterObj = this.filters.shopLoot; activeShopLabelsObj = LOOT_LABELS; }
        else if (this.tabShop === 'supplies') { activeShopFilterObj = this.filters.shopSupplies; activeShopLabelsObj = SUPPLIES_LABELS; }

        TradeUIHelper.renderFilterHeader({
            columnDiv: rightCol,
            titleText: 'Лавка торговца:',
            activeTab: this.tabShop,
            isInv: false,
            isExpanded: this.shopExpanded,
            onToggleExpand: () => { this.shopExpanded = !this.shopExpanded; this.render(container); },
            onTabChange: (newTab) => { this.tabShop = newTab; this.render(container); },
            filterObj: activeShopFilterObj,
            labelsObj: activeShopLabelsObj,
            onFilterToggle: () => this.render(container),
            tabsList: [
                { id: 'all', name: 'Всё' },
                { id: 'weapon', name: 'Оружие' },
                { id: 'armor', name: 'Броня' },
                { id: 'loot', name: 'Ресурсы' },
                { id: 'supplies', name: 'Припасы' }
            ]
        });

        const shopList = document.createElement('div');
        shopList.className = 'forge-column-list';
        rightCol.appendChild(shopList);

        if (this.shopExpanded) {
            const filteredBuyback = this.sessionSold.filter(item => {
                if (!item) return false;
                if (this.tabShop !== 'all' && item.type !== this.tabShop) return false;
                const cat = HubManager.getLocalCategory(item) || item.category;
                if (this.tabShop === 'weapon' && cat && !this.filters.shopWeapon[cat]) return false;
                if (this.tabShop === 'armor' && cat && !this.filters.shopArmor[cat]) return false;
                if (this.tabShop === 'loot' && cat && !this.filters.shopLoot[cat]) return false;
                if (this.tabShop === 'supplies' && cat && !this.filters.shopSupplies[cat]) return false;
                return true;
            });
            
            const shopItems = this.merchantInventory.filter(item => {
                if (!item) return false;
                if (this.tabShop !== 'all' && item.type !== this.tabShop) return false;
                const cat = HubManager.getLocalCategory(item) || item.category;
                if (this.tabShop === 'weapon' && cat && !this.filters.shopWeapon[cat]) return false;
                if (this.tabShop === 'armor' && cat && !this.filters.shopArmor[cat]) return false;
                if (this.tabShop === 'loot' && cat && !this.filters.shopLoot[cat]) return false;
                if (this.tabShop === 'supplies' && cat && !this.filters.shopSupplies[cat]) return false;
                return true;
            });

            let filteredSupplies = [];
            if (this.tabShop === 'all' || this.tabShop === 'supplies') {
                filteredSupplies = this.unlimitedSupplies.filter(item => {
                    const cat = item.category;
                    if (this.tabShop === 'supplies' && cat && !this.filters.shopSupplies[cat]) return false;
                    return true;
                });
            }

            if (filteredBuyback.length === 0 && shopItems.length === 0 && filteredSupplies.length === 0) {
                shopList.innerHTML = '<p style="color:#aaa;">У торговца закончился товар.</p>';
            } else {
                filteredBuyback.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row buyback-row'; 
                    row.innerHTML = this.getBazaarRowHTML(item, false, true); 
                    row.querySelector('.btn-buy').onclick = (e) => { e.stopPropagation(); this.buyItem(item, true, container); };
                    shopList.appendChild(row);
                });

                shopItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = this.getBazaarRowHTML(item, false, false); 
                    row.querySelector('.btn-buy').onclick = (e) => { e.stopPropagation(); this.buyItem(item, false, container); };
                    shopList.appendChild(row);
                });

                filteredSupplies.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = this.getBazaarRowHTML(item, false, false); 
                    row.querySelector('.btn-buy').onclick = (e) => { e.stopPropagation(); this.buyItem(item, false, container); };
                    shopList.appendChild(row);
                });
            }
        }

        TradeUIHelper.attachSkillTooltips(container);
    }

    static getBazaarRowHTML(item, isSelling, isBuyback = false) {
        if (!item) return '';
        const bazaarSpriteScale = 3.0; const bazaarShiftX = '-15px'; const bazaarShiftY = '15px';
        const isArmor = item.type === 'armor' || item.type === 'body' || item.type === 'civil';
        const isWeapon = item.type === 'weapon';
        const currentCandles = GameState.resources.candles;

        const spriteKey = item.key || item.name;
        let folderName = 'loot';
        if (isArmor) folderName = 'outfit/outfitsForSale';
        else if (isWeapon) folderName = 'weapon/weaponForSale';
        else if (item.type === 'supplies') folderName = 'supplies';  
        
        const spritePath = `assets/img/${folderName}/${spriteKey}.png`;

        let price;
        let actionButtonHTML;

        if (isSelling) {
            if (BazaarManager.sessionBought.has(item.id)) {
                price = item.price || (item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel);
                actionButtonHTML = `
                    <div style="text-align: right;">
                        <span class="refund-text" style="display:block; margin-bottom:4px;">Возврат: ${price} 🕯️</span>
                        <button class="hub-btn btn-bold btn-sell" style="padding: 5px 15px; margin: 0; border-color: var(--color-success); color: var(--color-success);">Вернуть</button>
                    </div>`;
            } else {
                price = Math.round((item.price || (item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel)) * HUB_BALANCE.bazaar.sellPriceMultiplier);
                actionButtonHTML = `
                    <div style="text-align: right;">
                        <span class="fr-cost" style="display:block; margin-bottom:4px;">Продажа: ${price} 🕯️</span>
                        <button class="hub-btn btn-bold btn-sell" style="padding: 5px 15px; margin: 0;">Продать</button>
                    </div>`;
            }
        } else {
            if (isBuyback) {
                price = Math.round((item.price || (item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel)) * HUB_BALANCE.bazaar.buybackMultiplier);
                const canAfford = currentCandles >= price;
                const costColor = canAfford ? 'var(--color-success)' : 'var(--color-danger)';
                const disabledAttr = canAfford ? '' : 'disabled="true" style="opacity:0.5;"';

                actionButtonHTML = `
                    <div style="text-align: right;">
                        <span class="refund-text" style="display:block; margin-bottom:4px; color: ${costColor} !important;">Выкуп: ${price} 🕯️</span>
                        <button class="hub-btn btn-bold btn-buy" style="padding: 5px 15px; margin: 0; border-color: var(--color-warning); color: var(--color-warning);" ${disabledAttr}>Выкупить</button>
                    </div>`;
            } else {
                price = item.price || (item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel);
                const canAfford = currentCandles >= price;
                const costColor = canAfford ? 'var(--color-gold)' : 'var(--color-danger)';
                const disabledAttr = canAfford ? '' : 'disabled="true" style="opacity:0.5;"';
                const discountHTML = item.isDiscounted ? `<span style="color:var(--color-success); font-size:11px; margin-right:5px;">-20%</span>` : '';

                actionButtonHTML = `
                    <div style="text-align: right;">
                        <span class="fr-cost" style="display:block; margin-bottom:4px; color: ${costColor};">${discountHTML}Цена: ${price} 🕯️</span>
                        <button class="hub-btn btn-bold btn-buy" style="padding: 5px 15px; margin: 0;" ${disabledAttr}>Купить</button>
                    </div>`;
            }
        }

        let labelText = isWeapon ? `урон: ${item.baseDamage || 0}` : '';
        if (isArmor) {
            const stats = item.stats || item.levels?.[item.level] || item.effect || {};
            labelText = `защита: ${stats.hp || 0} ХП`;
        }

        const isLoot = item.type === 'loot'; 
        const isSupplies = item.type === 'supplies'; 

        let spriteHtml;
        if (isLoot || isSupplies) {
            let lootIcon = '📦';
            if (isLoot) {
                const iconMap = { 
                    valuableTypesOfStone: '🪨', minerals: '⛏️', preciousStones: '💎', 
                    naturalResources: '🧪', gases: '💨', researchResults: '📜', 
                    scientificSamples: '🧪', battlePrey: '💀' 
                };
                lootIcon = iconMap[item.category] || '📦';
            } else if (isSupplies) {
                const iconMap = {
                    foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', 
                    buildingMaterials: '🔨', scoutingMaterials: '🪔'
                };
                lootIcon = iconMap[item.category] || '📦';
            }
            
            spriteHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                    <div style="font-size: 32px; line-height: 1;">${lootIcon}</div>
                </div>
            `;
        } else {
            spriteHtml = `
                <img src="${spritePath}" onerror="this.parentNode.innerHTML='Нет спрайта'" style="max-width:100%; max-height:100%; transform: translate(${bazaarShiftX}, ${bazaarShiftY}) scale(${bazaarSpriteScale}); transform-origin: center center; object-fit: contain;">
            `;
        }

        let detailBoxesHtml = '';
        if (isArmor) {
            const statsObj = item.stats || item.levels?.[item.level] || item.effect || {};
            Object.entries(statsObj).forEach(([k, v]) => {
                if (v !== 0 && STAT_NAMES[k]) {
                    detailBoxesHtml += `<div class="fr-skill-box text-fallback" style="border-color:#555;" data-name="${STAT_NAMES[k]}" data-desc="${STAT_DESCRIPTIONS[k] || ''}">${STAT_NAMES[k]}: +${v}</div>`;
                }
            });
        } else if (isWeapon) {
            if (item.skills) {
                item.skills.forEach(s => {
                    if (!s) return;
                    const skillKey = s.id || s.key || '';
                    const iconHtml = skillKey ? `<img class="skill-icon-img" src="assets/img/weaponSkillsIcons/${skillKey}.png" onerror="this.style.display='none'">` : '';
                    const ttId = TooltipManager.registerTooltip(HubManager.getSkillTooltipHTML(s, item));
                    detailBoxesHtml += `<div class="fr-skill-box" data-tooltip-id="${ttId}">${iconHtml}<span style="position: absolute; z-index: 0;">${s.name}</span></div>`;
                });
            }
        } else if (item.type === 'supplies' && item.usefulAt !== undefined) {
            detailBoxesHtml += `<div class="fr-skill-box text-fallback" style="border-color:#ffaa44;">💡 Бонус с ${item.usefulAt}%</div>`;
            detailBoxesHtml += `<div class="fr-skill-box text-fallback" style="border-color:#ff4444;">⚠️ Нужен с ${item.requiredAt}%</div>`;
        }

        return `
            <div class="fr-header">
                <div class="fr-name" style="width: auto; display: flex; align-items: baseline; flex-direction: column;">
                    <div style="display:flex; align-items:baseline;">
                        <b>${item.name}</b>
                        ${item.level ? `<span style="font-size: 11px; color: var(--color-gold); margin-left: 6px;">ур. ${item.level}</span>` : ''}
                    </div>
                    <span style="font-size:11px; color:#888; font-weight:normal; margin-top:2px;">${labelText}</span>
                </div>
                <div class="fr-action">${actionButtonHTML}</div>
            </div>
            <div class="fr-details">
                <div class="fr-sprite-box" style="background: transparent !important; border: none !important; overflow: visible !important; position: relative; flex-shrink:0;">
                    ${spriteHtml}
                </div>
                <div style="display:flex; flex-direction:column; flex:1;">
                    ${detailBoxesHtml ? `
                        <div style="color:#aaa; font-size:12px; margin-bottom:5px;">${isArmor ? 'Характеристики:' : 'Свойства/Навыки:'}</div>
                        <div class="fr-skills-list" style="margin-bottom: 10px;">${detailBoxesHtml}</div>
                    ` : ''}
                    ${item.description ? `<div class="fr-desc">${item.description}</div>` : ''}
                </div>
            </div>
        `;
    }

    static buyItem(itemDef, isBuyback, container) {
        let price = itemDef.price || (itemDef.level * HUB_BALANCE.forge.basePurchaseCostPerLevel);
        if (isBuyback) {
            price = Math.round(price * 0.5); 
        }

        if (GameState.resources.candles < price) { alert('Не хватает свечей для покупки!'); return; }
        GameState.resources.candles -= price;
        GameState.updateTopBarUI();

        const newItem = JSON.parse(JSON.stringify(itemDef));
        newItem.id = `item_${Date.now()}_${Math.random()}`; 
        
        if (newItem.isInfinite) delete newItem.isInfinite;
        GameState.inventory.push(newItem);

        if (!isBuyback && !itemDef.isInfinite) {
            BazaarManager.sessionBought.add(newItem.id);
        }

        if (isBuyback) {
            const idx = BazaarManager.sessionSold.findIndex(i => i.id === itemDef.id);
            if (idx > -1) BazaarManager.sessionSold.splice(idx, 1);
        } else if (!itemDef.isInfinite) {
            const idx = BazaarManager.merchantInventory.findIndex(i => i.id === itemDef.id);
            if (idx > -1) BazaarManager.merchantInventory.splice(idx, 1);
        }

        BazaarManager.render(container);
    }

    static sellItem(item, container) {
        let price;
        const isRefund = BazaarManager.sessionBought.has(item.id);

        if (isRefund) {
            price = item.price || (item.level * 50);
        } else {
            price = Math.round((item.price || (item.level * HUB_BALANCE.forge.basePurchaseCostPerLevel)) * HUB_BALANCE.bazaar.sellPriceMultiplier);
        }

        GameState.resources.candles += price;
        GameState.updateTopBarUI();

        const idx = GameState.inventory.findIndex(i => i.id === item.id);
        if (idx > -1) GameState.inventory.splice(idx, 1);

        if (isRefund) {
            BazaarManager.sessionBought.delete(item.id);
        } else {
            BazaarManager.sessionSold.push(item);
        }

        BazaarManager.render(container);
    }
}
