import { GameState } from '../../core/GameState.js';
import { HubManager } from './HubManager.js';
import { TooltipManager } from './TooltipManager.js';
import { WarehouseManager } from './WarehouseManager.js';
import { LOOT } from '../../data/expiditionData/lootData.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { OUTFITS } from '../../data/workersData/outfit.js';
import { swords, spears, hammers, axes, slings, crossbows, bows, arquebuses } from '../../data/battleData/weapon.js';
import { STAT_NAMES, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS, LOOT_LABELS, SUPPLIES_LABELS } from '../../data/workersData/labels.js';
import { HUB_BALANCE } from '../../data/balanceFiles/hubBalance.js';

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

    static initArmorDB() {
        if (Object.keys(BazaarManager.ARMOR_DB).length > 0) return;
        
        for (const [name, data] of Object.entries(OUTFITS)) {
            BazaarManager.ARMOR_DB[name] = [];
            BazaarManager.filters.invArmor[name] = true;
            BazaarManager.filters.shopArmor[name] = true;

            for (let lvl = 1; lvl <= 4; lvl++) {
                if (data.levels && data.levels[lvl]) {
                    BazaarManager.ARMOR_DB[name].push({
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

    static initBazaarFilters() {
        if (Object.keys(BazaarManager.filters.invArmor).length > 0) return;
        for (const name of Object.keys(OUTFITS)) {
            BazaarManager.filters.invArmor[name] = true;
            BazaarManager.filters.shopArmor[name] = true;
        }
    }

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

    static toggleAll(filterObj, container) {
        const keys = Object.keys(filterObj);
        const anyInactive = keys.some(k => !filterObj[k]);
        keys.forEach(k => filterObj[k] = anyInactive);
        BazaarManager.render(container);
    }

    static itemMatchesTab(item, tab) {
        if (!item) return false;
        if (tab === 'weapon') {
            return item.type === 'weapon';
        } else {
            return item.type === 'armor' || item.type === 'body' || item.type === 'civil' || !item.type;
        }
    }

    static renderFilterHeader(columnDiv, titleText, activeTab, isInv, containerToReRender) {
        const headerBox = document.createElement('div');
        headerBox.style.cssText = "display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 15px; width: 100%;";

        const isExpanded = isInv ? BazaarManager.invExpanded : BazaarManager.shopExpanded;

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
            if (isInv) BazaarManager.invExpanded = !BazaarManager.invExpanded;
            else BazaarManager.shopExpanded = !BazaarManager.shopExpanded;
            BazaarManager.render(containerToReRender);
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
            
            const btnList = [
                { id: 'all', name: 'Всё' },
                { id: 'weapon', name: 'Оружие' },
                { id: 'armor', name: 'Броня' },
                { id: 'loot', name: 'Ресурсы' },
                { id: 'supplies', name: 'Припасы' }
            ];

            btnList.forEach(t => {
                const btn = document.createElement('button');
                btn.className = `type-tab-btn ${activeTab === t.id ? 'active' : ''}`;
                btn.innerText = t.name;
                btn.onclick = () => { 
                    if (isInv) BazaarManager.tabInv = t.id; else BazaarManager.tabShop = t.id; 
                    BazaarManager.render(containerToReRender); 
                };
                tabs.appendChild(btn);
            });
            titleRow.appendChild(tabs);
        }

        headerBox.appendChild(titleRow);

        if (isExpanded && activeTab !== 'all') {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'filter-btn-group';
            filterGroup.style.cssText = "display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; width: 100%; margin-top: 5px;";

            let filterObj, labelsObj;
            if (activeTab === 'weapon') {
                filterObj = isInv ? BazaarManager.filters.invWeapon : BazaarManager.filters.shopWeapon;
                labelsObj = WEAPON_LABELS;
            } else if (activeTab === 'armor') {
                filterObj = isInv ? BazaarManager.filters.invArmor : BazaarManager.filters.shopArmor;
                labelsObj = ARMOR_LABELS;
            } else if (activeTab === 'loot') {
                filterObj = isInv ? BazaarManager.filters.invLoot : BazaarManager.filters.shopLoot;
                labelsObj = LOOT_LABELS;
            } else if (activeTab === 'supplies') {
                filterObj = isInv ? BazaarManager.filters.invSupplies : BazaarManager.filters.shopSupplies;
                labelsObj = SUPPLIES_LABELS;
            }

            const allBtn = document.createElement('button');
            allBtn.className = 'filter-toggle-btn';
            allBtn.style.borderColor = 'var(--border-main)';
            allBtn.innerText = '⭐ Все';
            allBtn.onclick = () => BazaarManager.toggleAll(filterObj, containerToReRender);
            filterGroup.appendChild(allBtn);

            Object.keys(filterObj).forEach(key => {
                const btn = document.createElement('button');
                btn.className = `filter-toggle-btn ${filterObj[key] ? 'active' : ''}`;
                btn.innerText = labelsObj[key] || key;
                btn.onclick = () => { 
                    filterObj[key] = !filterObj[key]; 
                    BazaarManager.render(containerToReRender); 
                };
                filterGroup.appendChild(btn);
            });

            headerBox.appendChild(filterGroup);
        }

        columnDiv.appendChild(headerBox);
    }

    static render(container) {
        GameState.initDebugInventory(); 

        BazaarManager.generateWares(); 
        BazaarManager.initArmorDB();
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

        BazaarManager.renderFilterHeader(leftCol, 'Ваши запасы на складе:', BazaarManager.tabInv, true, container);

        const invList = document.createElement('div');
        invList.className = 'forge-column-list';
        leftCol.appendChild(invList);

        if (BazaarManager.invExpanded) {
            const inventoryItems = (GameState.inventory || []).filter(item => {
                if (!item) return false;
                
                if (BazaarManager.tabInv !== 'all') {
                    if (BazaarManager.tabInv === 'armor') {
                        if (item.type !== 'armor' && item.type !== 'body' && item.type !== 'civil') return false;
                    } else {
                        if (item.type !== BazaarManager.tabInv) return false;
                    }
                }

                const cat = HubManager.getLocalCategory(item) || item.category;
                if (BazaarManager.tabInv === 'weapon' && cat && !BazaarManager.filters.invWeapon[cat]) return false;
                if (BazaarManager.tabInv === 'armor' && cat && !BazaarManager.filters.invArmor[cat]) return false;
                if (BazaarManager.tabInv === 'loot' && cat && !BazaarManager.filters.invLoot[cat]) return false;
                if (BazaarManager.tabInv === 'supplies' && cat && !BazaarManager.filters.invSupplies[cat]) return false;

                return true;
            });

            if (inventoryItems.length === 0) {
                invList.innerHTML = '<p style="color:#aaa;">Нет подходящих предметов для продажи.</p>';
            } else {
                const refundItems = [];
                const regularItems = [];

                inventoryItems.forEach(item => {
                    if (BazaarManager.sessionBought.has(item.id)) refundItems.push(item);
                    else regularItems.push(item);
                });

                refundItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row refund-row'; 
                    row.innerHTML = BazaarManager.getBazaarRowHTML(item, true); 
                    const btn = row.querySelector('.btn-sell');
                    if (btn) btn.onclick = (e) => { e.stopPropagation(); BazaarManager.sellItem(item, container); };
                    invList.appendChild(row);
                });

                regularItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = BazaarManager.getBazaarRowHTML(item, true); 
                    const btn = row.querySelector('.btn-sell');
                    if (btn) btn.onclick = (e) => { e.stopPropagation(); BazaarManager.sellItem(item, container); };
                    invList.appendChild(row);
                });
            }
        }

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column';
        splitWrapper.appendChild(rightCol);

        BazaarManager.renderFilterHeader(rightCol, 'Лавка торговца:', BazaarManager.tabShop, false, container);

        const shopList = document.createElement('div');
        shopList.className = 'forge-column-list';
        rightCol.appendChild(shopList);

        if (BazaarManager.shopExpanded) {
            const filteredBuyback = BazaarManager.sessionSold.filter(item => {
                if (!item) return false;
                if (BazaarManager.tabShop !== 'all' && item.type !== BazaarManager.tabShop) return false;

                const cat = HubManager.getLocalCategory(item) || item.category;
                if (BazaarManager.tabShop === 'weapon' && cat && !BazaarManager.filters.shopWeapon[cat]) return false;
                if (BazaarManager.tabShop === 'armor' && cat && !BazaarManager.filters.shopArmor[cat]) return false;
                if (BazaarManager.tabShop === 'loot' && cat && !BazaarManager.filters.shopLoot[cat]) return false;
                if (BazaarManager.tabShop === 'supplies' && cat && !BazaarManager.filters.shopSupplies[cat]) return false;

                return true;
            });
            
            const shopItems = BazaarManager.merchantInventory.filter(item => {
                if (!item) return false;
                if (BazaarManager.tabShop !== 'all' && item.type !== BazaarManager.tabShop) return false;

                const cat = HubManager.getLocalCategory(item) || item.category;
                if (BazaarManager.tabShop === 'weapon' && cat && !BazaarManager.filters.shopWeapon[cat]) return false;
                if (BazaarManager.tabShop === 'armor' && cat && !BazaarManager.filters.shopArmor[cat]) return false;
                if (BazaarManager.tabShop === 'loot' && cat && !BazaarManager.filters.shopLoot[cat]) return false;
                if (BazaarManager.tabShop === 'supplies' && cat && !BazaarManager.filters.shopSupplies[cat]) return false;

                return true;
            });

            let filteredSupplies = [];
            if (BazaarManager.tabShop === 'all' || BazaarManager.tabShop === 'supplies') {
                filteredSupplies = BazaarManager.unlimitedSupplies.filter(item => {
                    const cat = item.category;
                    if (BazaarManager.tabShop === 'supplies' && cat && !BazaarManager.filters.shopSupplies[cat]) return false;
                    return true;
                });
            }

            if (filteredBuyback.length === 0 && shopItems.length === 0 && filteredSupplies.length === 0) {
                shopList.innerHTML = '<p style="color:#aaa;">У торговца закончился товар.</p>';
            } else {
                filteredBuyback.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row buyback-row'; 
                    row.innerHTML = BazaarManager.getBazaarRowHTML(item, false, true); 
                    const btn = row.querySelector('.btn-buy');
                    if (btn) btn.onclick = (e) => { e.stopPropagation(); BazaarManager.buyItem(item, true, container); };
                    shopList.appendChild(row);
                });

                shopItems.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = BazaarManager.getBazaarRowHTML(item, false, false); 
                    const btn = row.querySelector('.btn-buy');
                    if (btn) btn.onclick = (e) => { e.stopPropagation(); BazaarManager.buyItem(item, false, container); };
                    shopList.appendChild(row);
                });

                filteredSupplies.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'forge-row';
                    row.innerHTML = BazaarManager.getBazaarRowHTML(item, false, false); 
                    const btn = row.querySelector('.btn-buy');
                    if (btn) btn.onclick = (e) => { e.stopPropagation(); BazaarManager.buyItem(item, false, container); };
                    shopList.appendChild(row);
                });
            }
        }

        BazaarManager.attachSkillTooltips(container);
    }

    static getBazaarRowHTML(item, isSelling, isBuyback = false) {
        if (!item) return '';
        
        // Скейлинг и смещение спрайтов оружия и брони
        const bazaarSpriteScale = 3.0; 
        const bazaarShiftX = '-15px';
        const bazaarShiftY = '15px';

        const isLoot = item.type === 'loot'; 
        const isSupplies = item.type === 'supplies';
        const isArmor = item.type === 'armor' || item.type === 'body' || item.type === 'civil';
        const isWeapon = item.type === 'weapon';
        const currentCandles = GameState.resources.candles;

        let spriteHtml = '';
        
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
            const spriteKey = item.key || item.name;
            const folderName = isArmor ? 'outfit/outfitsForSale' : 'weapon/weaponForSale';
            const spritePath = `assets/img/${folderName}/${spriteKey}.png`;
            
            spriteHtml = `
                <img src="${spritePath}" onerror="this.parentNode.innerHTML='Нет спрайта'" style="max-width:100%; max-height:100%; transform: translate(${bazaarShiftX}, ${bazaarShiftY}) scale(${bazaarSpriteScale}); transform-origin: center center; object-fit: contain;">
            `;
        }

        let price = 0;
        let actionButtonHTML = '';

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
                <div class="fr-action">
                    ${actionButtonHTML}
                </div>
            </div>
            <div class="fr-details">
                <div class="fr-sprite-box" style="background: transparent !important; background-color: transparent !important; border: none !important; overflow: visible !important; position: relative; flex-shrink:0;">
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

        if (GameState.resources.candles < price) {
            alert('Не хватает свечей для покупки!');
            return;
        }

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
        let price = 0;
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
}

BazaarManager.initArmorDB();
BazaarManager.initBazaarFilters(); 
BazaarManager.initUnlimitedSupplies();