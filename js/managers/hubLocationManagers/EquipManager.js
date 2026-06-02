import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { HubManager } from './HubManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';

export const EquipManager = {
    equipFilter: 'all',

    openEquipModal(mainContainer) {
        GameState.initDebugInventory(); 
        TooltipManager.clear();
        const modal = document.getElementById('equip-modal');
        const body = document.getElementById('equip-body');
        modal.classList.remove('hidden');
        document.getElementById('equip-close-btn').onclick = () => {
            modal.classList.add('hidden');
            window.CleatManager.render(mainContainer);
        };

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div'); leftCol.className = 'forge-column';
        const rightCol = document.createElement('div'); rightCol.className = 'forge-column';
        
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);

        this.renderEquipLists(leftCol, rightCol);
    },

    renderEquipLists(leftCol, rightCol) {
        const renderFilterBtn = (id, text) => `<button class="filter-toggle-btn ${this.equipFilter === id ? 'active' : ''}" data-f="${id}">${text}</button>`;
        
        leftCol.innerHTML = `
            <div style="margin-bottom: 15px; border-bottom:1px solid #555; padding-bottom:10px;">
                <h3 style="color:#ffbf00; margin:0 0 10px 0;">Склад:</h3>
                <div class="filter-btn-group" id="equip-filters" style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${renderFilterBtn('all', '⭐ Все')}
                    ${renderFilterBtn('foodAndWater', 'Еда/Вода')}
                    ${renderFilterBtn('miningMaterials', 'Добыча')}
                    ${renderFilterBtn('researchMaterials', 'Изыскания')}
                    ${renderFilterBtn('buildingMaterials', 'Стройка')}
                    ${renderFilterBtn('scoutingMaterials', 'Разведка')}
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const btns = leftCol.querySelectorAll('#equip-filters .filter-toggle-btn');
            btns.forEach(b => { b.onclick = () => { this.equipFilter = b.getAttribute('data-f'); this.renderEquipLists(leftCol, rightCol); }; });
        }, 0);

        const leftList = document.createElement('div');
        leftList.className = 'forge-column-list';
        leftList.style.display = 'flex'; leftList.style.flexWrap = 'wrap'; leftList.style.gap = '5px'; leftList.style.alignContent = 'flex-start';

        const availableItems = GameState.inventory.filter(i => {
            if (i.type !== 'supplies') return false;
            if (this.equipFilter !== 'all' && i.category !== this.equipFilter) return false;
            return true;
        });
        
        availableItems.forEach(item => {
            const box = document.createElement('div'); box.className = 'inv-item'; box.style.cursor = 'pointer';
            const iconMap = { foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
            const icon = iconMap[item.category] || '📦';

            box.innerHTML = `
                <div class="inv-fallback" style="display:flex; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="inv-icon" style="font-size: 28px; line-height: 1;">${icon}</div>
                    <div class="inv-name" style="margin-top: 5px; color: #aaa; font-size: 10px; text-align: center; padding: 0 4px; box-sizing: border-box;">${item.name}</div>
                </div>
            `;
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            box.onclick = () => { GameState.inventory.splice(GameState.inventory.findIndex(i => i.id === item.id), 1); GameState.expeditionInventory.push(item); this.renderEquipLists(leftCol, rightCol); };
            leftList.appendChild(box);
        });
        if (availableItems.length === 0) leftList.innerHTML = '<p style="color:#aaa;">На складе нет подходящего снаряжения.</p>';
        leftCol.appendChild(leftList);

        rightCol.innerHTML = '<h3 style="color:#4affab; margin-top:0; margin-bottom:10px; border-bottom:1px solid #555; padding-bottom:10px;">Рюкзак экспедиции:</h3>';
        const rightList = document.createElement('div');
        rightList.className = 'forge-column-list';
        rightList.style.display = 'flex'; rightList.style.flexWrap = 'wrap'; rightList.style.gap = '5px'; rightList.style.alignContent = 'flex-start';

        GameState.expeditionInventory.forEach(item => {
            const box = document.createElement('div'); box.className = 'inv-item'; box.style.cursor = 'pointer'; box.style.borderColor = '#4affab';
            const iconMap = { foodAndWater: '🍞', miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
            const icon = iconMap[item.category] || '📦';

            box.innerHTML = `
                <div class="inv-fallback" style="display:flex; width: 100%; height: 100%; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="inv-icon" style="font-size: 28px; line-height: 1;">${icon}</div>
                    <div class="inv-name" style="margin-top: 5px; color: #aaa; font-size: 10px; text-align: center; padding: 0 4px; box-sizing: border-box;">${item.name}</div>
                </div>
            `;
            box.setAttribute('data-tooltip-id', TooltipManager.registerTooltip(HubManager.getItemTooltip(item)));
            box.onclick = () => { GameState.expeditionInventory.splice(GameState.expeditionInventory.findIndex(i => i.id === item.id), 1); GameState.inventory.push(item); this.renderEquipLists(leftCol, rightCol); };
            rightList.appendChild(box);
        });
        if (GameState.expeditionInventory.length === 0) rightList.innerHTML = '<p style="color:#aaa;">Инвентарь пуст. Кликните по предмету слева.</p>';
        rightCol.appendChild(rightList);

        const hintsBox = document.createElement('div');
        hintsBox.style.cssText = "background: rgba(0,0,0,0.4); border: 1px solid #555; padding: 15px; margin-top: auto; flex-shrink:0;";
        
        const p = GameState.biomeProgress;
        const iconMap = { miningMaterials: '⛏️', researchMaterials: '📚', buildingMaterials: '🔨', scoutingMaterials: '🪔' };
        let hintsHtml = '<h4 style="color:var(--color-gold); margin-top:0;">Аналитика для текущего прогресса:</h4><ul style="color:#ccc; font-size:13px; padding-left:20px; margin:0; line-height: 1.5;">';
        let foundHint = false;

        Object.entries(EQUIPMENT).forEach(([cat, items]) => {
            Object.values(items).forEach(item => {
                const progTypeMap = { miningMaterials: p.mining, researchMaterials: p.research, buildingMaterials: p.construction, scoutingMaterials: p.scouting };
                const currentProg = progTypeMap[cat];
                const catIcon = iconMap[cat] || '💡';
                
                if (currentProg !== undefined) {
                    if (item.requiredAt !== undefined && currentProg >= item.requiredAt) {
                        hintsHtml += `<li style="color:#ff4444; margin-bottom:5px;">${catIcon} Строго необходимо: <b>${item.name}</b></li>`;
                        foundHint = true;
                    } else if (item.usefulAt !== undefined && currentProg >= item.usefulAt) {
                        hintsHtml += `<li style="color:#ffbf00; margin-bottom:5px;">${catIcon} Сильно ускорит: <b>${item.name}</b></li>`;
                        foundHint = true;
                    }
                }
            });
        });

        if (!foundHint) hintsHtml += '<li>Специфические инструменты пока не требуются. Берите еду и освещение.</li>';
        hintsHtml += '</ul>';
        hintsBox.innerHTML = hintsHtml;
        rightCol.appendChild(hintsBox);
    }
};

window.EquipManager = EquipManager;