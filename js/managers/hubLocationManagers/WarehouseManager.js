import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { ForgeManager } from './ForgeManager.js';
import { HubManager } from './HubManager.js';
import { OUTFITS } from '../../data/workersData/outfit.js';
import { STAT_NAMES, STAT_DESCRIPTIONS, WEAPON_LABELS, ARMOR_LABELS, STAT_LABELS, LOOT_LABELS } from '../../data/workersData/labels.js';

export class WarehouseManager {
    static tab = 'all';

    static subFilters = {
        weapon: { swords: true, spears: true, hammers: true, axes: true, slings: true, crossbows: true, bows: true, arquebuses: true },
        armor: {}, 
        loot: { 
            valuableTypesOfStone: true, 
            minerals: true, 
            preciousStones: true, 
            naturalResources: true, 
            gases: true, 
            researchResults: true, 
            scientificSamples: true,
            battlePrey: true 
        },
        supplies: { foodAndWater: true, miningMaterials: true, researchMaterials: true, buildingMaterials: true, scoutingMaterials: true }
    };

    static SUPPLIES_LABELS = {
        foodAndWater: "Еда/Вода",
        miningMaterials: "Добыча",
        researchMaterials: "Изыскания",
        buildingMaterials: "Стройка",
        scoutingMaterials: "Разведка"
    };

    static initFilters() {
        if (Object.keys(this.subFilters.armor).length === 0) {
            for (const key of Object.keys(OUTFITS)) {
                this.subFilters.armor[key] = true;
            }
        }
    }

    static getWarehouseIcon(item) {
        if (item.type === 'weapon') return '⚔️';
        if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') return '🛡️';
        if (item.type === 'supplies') {
            const map = { foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
            return map[item.category] || '📦';
        }
        if (item.type === 'loot') {
            const map = { valuableTypesOfStone: '🪨', minerals: '⛏️', preciousStones: '💎', naturalResources: '🧪', gases: '💨', researchResults: '📜', scientificSamples: '🧪', battlePrey: '💀' };
            return map[item.category] || '📦';
        }
        return '📦';
    }

    static toggleAll(container) {
        const group = this.subFilters[this.tab];
        if (group) {
            const keys = Object.keys(group);
            const anyInactive = keys.some(k => !group[k]);
            keys.forEach(k => group[k] = anyInactive);
            this.render(container);
        }
    }

    static render(container) {
        GameState.initDebugInventory();
        ForgeManager.initArmorDB(); 
        this.initFilters();         
        
        container.style.display = 'flex'; 
        container.style.flexDirection = 'column';
        container.style.padding = '0';
        container.style.height = '100%';
        container.style.minHeight = '0';
        container.innerHTML = '';

        const scrollWrapper = document.createElement('div');
        scrollWrapper.style.cssText = "flex: 1; overflow-y: auto; padding: 25px; min-height: 0; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;";
        container.appendChild(scrollWrapper);

        const header = document.createElement('div');
        header.style.cssText = "margin-bottom:15px; display:flex; gap:10px; border-bottom: 1px solid #555; justify-content: center; padding-bottom: 15px; width: 100%; flex-shrink: 0;";
        
        const tabs = [
            { id: 'all', name: 'Всё' },
            { id: 'weapon', name: 'Оружие' },
            { id: 'armor', name: 'Броня' },
            { id: 'loot', name: 'Ресурсы' },
            { id: 'supplies', name: 'Припасы' }
        ];

        tabs.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${this.tab === t.id ? 'active' : ''}`;
            btn.innerText = t.name;
            btn.onclick = () => { this.tab = t.id; this.render(container); };
            header.appendChild(btn);
        });
        scrollWrapper.appendChild(header);

        // Вторичные фильтры
        if (this.tab !== 'all') {
            const subHeader = document.createElement('div');
            subHeader.className = 'filter-btn-group';
            subHeader.style.cssText = "display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; margin-bottom: 25px; width: 100%; flex-shrink: 0;";

            const allBtn = document.createElement('button');
            allBtn.className = 'filter-toggle-btn';
            allBtn.style.borderColor = 'var(--border-main)';
            allBtn.innerText = '⭐ Все';
            allBtn.onclick = () => this.toggleAll(container);
            subHeader.appendChild(allBtn);

            const currentGroup = this.subFilters[this.tab];
            
            let labels = {};
            if (this.tab === 'weapon') labels = WEAPON_LABELS;
            else if (this.tab === 'armor') labels = ARMOR_LABELS;
            else if (this.tab === 'loot') labels = LOOT_LABELS;
            else if (this.tab === 'supplies') labels = this.SUPPLIES_LABELS;

            Object.keys(currentGroup).forEach(key => {
                const btn = document.createElement('button');
                btn.className = `filter-toggle-btn ${currentGroup[key] ? 'active' : ''}`;
                btn.innerText = labels[key] || key;
                btn.onclick = () => {
                    currentGroup[key] = !currentGroup[key];
                    this.render(container);
                };
                subHeader.appendChild(btn);
            });
            scrollWrapper.appendChild(subHeader);
        }

        const countText = document.createElement('p');
        countText.style.cssText = "text-align: center; margin-bottom: 20px; flex-shrink: 0; width: 100%;";
        countText.innerHTML = `Предметов на складе по фильтру: <b id="warehouse-count">0</b>`;
        scrollWrapper.appendChild(countText);

        const grid = document.createElement('div');
        grid.id = 'warehouse-grid';
        scrollWrapper.appendChild(grid);

        const filtered = GameState.inventory.filter(item => {
            if (!item) return false;
            
            if (this.tab !== 'all') {
                if (this.tab === 'armor') {
                    if (item.type !== 'armor' && item.type !== 'body' && item.type !== 'civil') return false;
                } else {
                    if (item.type !== this.tab) return false;
                }
            }

            if (this.tab === 'weapon') {
                const cat = HubManager.getLocalCategory(item);
                if (cat && !this.subFilters.weapon[cat]) return false;
            } else if (this.tab === 'armor') {
                const cat = HubManager.getLocalCategory(item);
                if (cat && !this.subFilters.armor[cat]) return false;
            } else if (this.tab === 'loot') {
                const cat = item.category;
                if (cat && !this.subFilters.loot[cat]) return false;
            } else if (this.tab === 'supplies') {
                const cat = item.category;
                if (cat && !this.subFilters.supplies[cat]) return false;
            }

            return true;
        });

        document.getElementById('warehouse-count').innerText = filtered.length;

        filtered.forEach(item => {
            const box = document.createElement('div'); 
            box.className = 'inv-item';
            box.style.overflow = 'hidden'; 
            
            const isLoot = item.type === 'loot'; 
            const isSupplies = item.type === 'supplies';
            const isArmor = item.type === 'armor' || item.type === 'body' || item.type === 'civil';
            const isWeapon = item.type === 'weapon';
            const icon = this.getWarehouseIcon(item);

            if (isLoot || isSupplies) {
                box.innerHTML = `
                    <div class="inv-fallback" style="display:flex; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                        <div class="inv-icon" style="font-size: 28px; line-height: 1;">${icon}</div>
                        <div class="inv-name" style="margin-top: 5px; color: #aaa; font-size: 10px; text-align: center; padding: 0 4px; box-sizing: border-box;">${item.name}</div>
                    </div>
                `;
            } else {
                const spriteKey = item.key || item.name;
                const folderName = isArmor ? 'outfit/outfitsForSale' : 'weapon/weaponForSale';
                
                const spritePath = `assets/img/${folderName}/${spriteKey}.png`;
                const spriteScale = 2.5; 
                const shiftX = '-5px';
                const shiftY = '10px';

                const levelBadge = item.level ? `<div style="position: absolute; top: 2px; right: 4px; font-size: 12px; font-weight: bold; color: var(--color-gold); text-shadow: 1px 1px 2px #000; z-index: 5;">${item.level}</div>` : '';

                box.innerHTML = `
                    ${levelBadge}
                    <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                        <img src="${spritePath}" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" style="max-width: 100%; max-height: 100%; transform: translate(${shiftX}, ${shiftY}) scale(${spriteScale}); transform-origin: center center; object-fit: contain; position: relative; z-index: 2;">
                    </div>
                    <div class="inv-fallback" style="display:none; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                        <div class="inv-icon">${icon}</div>
                        <div class="inv-name" style="margin-top: 2px;">${item.name}</div>
                    </div>
                `;
            }
            
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            grid.appendChild(box);
        });
    }
}