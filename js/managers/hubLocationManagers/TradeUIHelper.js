import { OUTFITS } from '../../data/workersData/outfit.js';
import { TooltipManager } from './TooltipManager.js';

export const TradeUIHelper = {
    initArmorDB(targetDB, maxLevel = 4) {
        if (Object.keys(targetDB).length > 0) return;
        for (const [name, data] of Object.entries(OUTFITS)) {
            targetDB[name] = [];
            for (let lvl = 1; lvl <= maxLevel; lvl++) {
                if (data.levels && data.levels[lvl]) {
                    targetDB[name].push({
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
    },

    toggleAll(filterObj, onToggleCallback) {
        const keys = Object.keys(filterObj);
        const anyInactive = keys.some(k => !filterObj[k]);
        keys.forEach(k => filterObj[k] = anyInactive);
        if (onToggleCallback) onToggleCallback();
    },

    renderFilterHeader(config) {
        const {
            columnDiv, titleText, activeTab, isExpanded,
            onToggleExpand, onTabChange, filterObj, labelsObj,
            onFilterToggle, extraControlsHTML = ''
        } = config;

        const headerBox = document.createElement('div');
        headerBox.style.cssText = "display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 15px; width: 100%;";

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
            onToggleExpand();
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
            
            if (extraControlsHTML) {
                tabs.innerHTML += extraControlsHTML;
            }

            const tabsList = config.tabsList || [
                { id: 'weapon', name: 'Оружие' },
                { id: 'armor', name: 'Броня' }
            ];

            tabsList.forEach(t => {
                const btn = document.createElement('button');
                btn.className = `type-tab-btn ${activeTab === t.id ? 'active' : ''}`;
                btn.innerText = t.name;
                btn.onclick = () => onTabChange(t.id);
                tabs.appendChild(btn);
            });

            setTimeout(() => {
                const specBtn = tabs.querySelector('.special-filter-btn');
                if (specBtn && config.onExtraClick) {
                    specBtn.onclick = (e) => { e.stopPropagation(); config.onExtraClick(); };
                }
            }, 0);

            titleRow.appendChild(tabs);
        }

        headerBox.appendChild(titleRow);

        if (isExpanded && filterObj) {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'filter-btn-group';
            filterGroup.style.cssText = "display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; width: 100%; margin-top: 5px;";

            const allBtn = document.createElement('button');
            allBtn.className = 'filter-toggle-btn';
            allBtn.style.borderColor = 'var(--border-main)';
            allBtn.innerText = '⭐ Все';
            allBtn.onclick = () => this.toggleAll(filterObj, onFilterToggle);
            filterGroup.appendChild(allBtn);

            Object.keys(filterObj).forEach(key => {
                const btn = document.createElement('button');
                btn.className = `filter-toggle-btn ${filterObj[key] ? 'active' : ''}`;
                btn.innerText = labelsObj[key] || key;
                btn.onclick = () => { 
                    filterObj[key] = !filterObj[key]; 
                    onFilterToggle(); 
                };
                filterGroup.appendChild(btn);
            });

            headerBox.appendChild(filterGroup);
        }
        columnDiv.appendChild(headerBox);
    },

    attachSkillTooltips(container) {
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
};

window.TradeUIHelper = TradeUIHelper;
