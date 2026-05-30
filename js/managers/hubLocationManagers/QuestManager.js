import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { QUESTS } from '../../data/hubData/questsData.js';
import { LOOT_LABELS } from '../../data/workersData/labels.js';

export class QuestManager {
    static availableQuests = [];
    static questsInitialized = false;
    
    static tabShop = 'all'; // фильтр доступных контрактов

    // данные о фракции-заказчике
    static ISSUERS = {
        managerQuests: { name: "Распорядитель", color: "var(--color-gold)", bg: "rgba(255, 191, 0, 0.05)" },
        scientificChambersQuests: { name: "Палаты науки", color: "#b19cd9", bg: "rgba(177, 156, 217, 0.05)" },
        masonsGuildQuests: { name: "Строители", color: "#ff7f50", bg: "rgba(255, 127, 80, 0.05)" },
        huntersCommonwealthQuests: { name: "Охотники", color: "#ff4444", bg: "rgba(255, 68, 68, 0.05)" }
    };

    static initQuests() {
        if (QuestManager.questsInitialized) return;
        QuestManager.questsInitialized = true;

        Object.entries(QUESTS).forEach(([issuerKey, categoryQuests]) => {
            Object.entries(categoryQuests).forEach(([questKey, questData]) => {
                QuestManager.availableQuests.push({
                    id: `${issuerKey}_${questKey}`,
                    issuer: issuerKey,
                    name: questData.name,
                    requirement: questData.requirement,
                    time: questData.time || 3,
                    reward: questData.reward || 100,
                    description: questData.description,
                    sprite: questData.sprite || 'Нет',
                    cooldown: questData.cooldown || 3,
                    unlockCycle: questData.unlockCycle,
                    unlockAfterQuest: questData.unlockAfterQuest 
                });
            });
        });
    }

    static getRequirementStatus(quest) {
        const req = quest.requirement;
        
        if (req.startsWith('progress-')) {
            const parts = req.split('-');
            const type = parts[1];
            const needed = parseFloat(parts[2]);
            const current = GameState.biomeProgress[type] || 0;
            
            const typeNames = { mining: 'Добыча', research: 'Изыскания', construction: 'Строительство', scouting: 'Разведка' };
            
            return {
                text: `Достичь: ${typeNames[type]} ${needed}%`,
                current: current.toFixed(1),
                needed: needed,
                isDone: current >= needed
            };
        }

        if (req === 'expedition_end' || req === 'expedition end') {
            const done = GameState.hasFinishedExpedition;
            return {
                text: 'Завершить первую экспедицию',
                current: done ? 1 : 0,
                needed: 1,
                isDone: done
            };
        }

        const parts = req.split('-');
        if (parts.length === 2) {
            const [category, qty] = parts;
            const needed = parseInt(qty);
            const current = (GameState.inventory || []).filter(item => item && item.category === category).length;
            
            const catName = LOOT_LABELS[category] || category;

            return {
                text: `Доставить: ${catName}`,
                current,
                needed,
                isDone: current >= needed
            };
        }

        return { text: req, current: 0, needed: 1, isDone: false };
    }

    static render(container) {
        GameState.initDebugInventory();
        QuestManager.initQuests();

        container.style.display = 'flex'; 
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden'; 
        container.innerHTML = '';

        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        container.appendChild(splitWrapper);

        const leftCol = document.createElement('div');
        leftCol.className = 'forge-column';
        splitWrapper.appendChild(leftCol);

        const leftHeader = document.createElement('div');
        leftHeader.style.cssText = "border-bottom: 1px solid #444; padding-bottom: 15px; margin-bottom: 15px;";
        leftHeader.innerHTML = `<h3 style="color:#ffbf00; margin:0;">Взятые контракты (${GameState.activeQuests.length}):</h3>`;
        leftCol.appendChild(leftHeader);

        const activeList = document.createElement('div');
        activeList.className = 'forge-column-list';
        leftCol.appendChild(activeList);

        if (GameState.activeQuests.length === 0) {
            activeList.innerHTML = '<p style="color:#aaa;">Нет активных контрактов. Возьмите новые задания в списке справа.</p>';
        } else {
            GameState.activeQuests.forEach(quest => {
                const row = document.createElement('div');
                row.className = 'forge-row';
                row.innerHTML = QuestManager.getQuestRowHTML(quest, true);
                
                const btn = row.querySelector('.action-btn');
                const reqStatus = QuestManager.getRequirementStatus(quest);
                
                if (btn) {
                    btn.disabled = !reqStatus.isDone;
                    btn.onclick = (e) => { e.stopPropagation(); QuestManager.completeQuest(quest, container); };
                }
                activeList.appendChild(row);
            });
        }

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column';
        splitWrapper.appendChild(rightCol);

        const rightHeader = document.createElement('div');
        rightHeader.style.cssText = "display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid #444; padding-bottom: 15px; margin-bottom: 15px;";
        
        const titleRow = document.createElement('div');
        titleRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; width:100%;";
        titleRow.innerHTML = `<h3 style="color:#ffbf00; margin:0;">Доступные заказы:</h3>`;
        
        const tabs = document.createElement('div');
        tabs.className = 'type-tabs';
        
        const btnAll = document.createElement('button');
        btnAll.className = `type-tab-btn ${QuestManager.tabShop === 'all' ? 'active' : ''}`;
        btnAll.innerText = 'Все';
        btnAll.onclick = () => { QuestManager.tabShop = 'all'; QuestManager.render(container); };
        tabs.appendChild(btnAll);

        Object.entries(QuestManager.ISSUERS).forEach(([key, value]) => {
            const btn = document.createElement('button');
            btn.className = `type-tab-btn ${QuestManager.tabShop === key ? 'active' : ''}`;
            btn.innerText = value.name.split(' ')[0];
            btn.style.borderColor = value.color;
            btn.onclick = () => { QuestManager.tabShop = key; QuestManager.render(container); };
            tabs.appendChild(btn);
        });

        titleRow.appendChild(tabs);
        rightHeader.appendChild(titleRow);
        rightCol.appendChild(rightHeader);

        const availableList = document.createElement('div');
        availableList.className = 'forge-column-list';
        rightCol.appendChild(availableList);

        // Логика фильтрации и открытия заказов
        const filteredQuests = QuestManager.availableQuests.filter(q => {
            if (QuestManager.tabShop !== 'all' && q.issuer !== QuestManager.tabShop) return false;
            if (GameState.activeQuests.some(active => active.id === q.id)) return false;
            
            if (GameState.questCooldowns && GameState.questCooldowns[q.id]) {
                const cyclesPassed = GameState.cycle - GameState.questCooldowns[q.id];
                if (cyclesPassed < q.cooldown) return false; 
            }

            if (q.unlockCycle !== undefined && GameState.cycle < q.unlockCycle) {
                return false;
            }

            if (q.unlockAfterQuest) {
                if (!GameState.questCooldowns || !GameState.questCooldowns[q.unlockAfterQuest]) {
                    return false;
                }
            }
            
            return true;
        });

        if (filteredQuests.length === 0) {
            availableList.innerHTML = '<p style="color:#aaa;">Нет доступных контрактов. Возвращайтесь позже.</p>';
        } else {
            filteredQuests.forEach(quest => {
                const row = document.createElement('div');
                row.className = 'forge-row';
                row.innerHTML = QuestManager.getQuestRowHTML(quest, false);
                
                const btn = row.querySelector('.action-btn');
                if (btn) {
                    btn.onclick = (e) => { e.stopPropagation(); QuestManager.acceptQuest(quest, container); };
                }
                availableList.appendChild(row);
            });
        }
    }

    static getQuestRowHTML(quest, isActive) {
        const issuerData = QuestManager.ISSUERS[quest.issuer] || { name: "Неизвестно", color: "#888", bg: "transparent" };
        const reqStatus = QuestManager.getRequirementStatus(quest);
        const actionText = isActive ? 'Сдать контракт' : 'Принять контракт';

        const reqClass = reqStatus.isDone ? 'ready' : '';
        const reqCheck = reqStatus.isDone ? '✓ ГОТОВО' : `⚙ ${reqStatus.current}/${reqStatus.needed}`;

        const currentActiveQuest = GameState.activeQuests.find(q => q.id === quest.id);
        const timeDisplay = currentActiveQuest ? currentActiveQuest.timeLeft : quest.time;
        const timeColor = currentActiveQuest && timeDisplay <= 1 ? "var(--color-danger)" : (currentActiveQuest && timeDisplay <= 2 ? "var(--color-warning)" : "#888");
        const timeLabel = currentActiveQuest ? `Осталось: ${timeDisplay} цикл.` : `Срок: ${timeDisplay} цикл.`;

        return `
            <div class="fr-header" style="background: ${issuerData.bg};">
                <div class="fr-name" style="width: auto; display: flex; align-items: baseline; flex-direction: column;">
                    <div style="display:flex; align-items:center;">
                        <b>${quest.name}</b>
                        <span class="quest-tag" style="color: ${issuerData.color};">${issuerData.name}</span>
                    </div>
                    <span style="font-size:12px; color:${timeColor}; font-weight:bold; margin-top:4px;">${timeLabel}</span>
                </div>
                <div class="fr-action">
                    <span class="fr-cost" style="color: var(--color-success);">${quest.reward} 🕯️</span>
                    <button class="hub-btn btn-bold action-btn" style="padding: 5px 15px; margin: 0;">${actionText}</button>
                </div>
            </div>
            <div class="fr-details">
                <div style="display:flex; flex-direction:column; flex:1;">
                    <div class="fr-desc">${quest.description}</div>
                    
                    <div style="color:#aaa; font-size:11px; margin-bottom:5px; text-transform:uppercase;">Требования:</div>
                    <div class="quest-requirement-box ${reqClass}">
                        <span>${reqStatus.text}</span>
                        <b>${reqCheck}</b>
                    </div>
                </div>
            </div>
        `;
    }

    static acceptQuest(quest, container) {
        GameState.activeQuests.push({
            ...quest,
            timeLeft: quest.time 
        });
        QuestManager.render(container);
    }

    static completeQuest(quest, container) {
        const reqStatus = QuestManager.getRequirementStatus(quest);
        if (!reqStatus.isDone) return;

        const req = quest.requirement;
        
        if (req !== 'expedition_end' && !req.startsWith('progress-')) {
            const parts = req.split('-');
            const [category, qty] = parts;
            let needed = parseInt(qty);

            for (let i = GameState.inventory.length - 1; i >= 0; i--) {
                if (needed <= 0) break;
                const item = GameState.inventory[i];
                if (item && item.category === category) {
                    GameState.inventory.splice(i, 1);
                    needed--;
                }
            }
        }

        GameState.resources.candles += quest.reward;
        GameState.updateTopBarUI();

        // убираем из активных квестов
        const idx = GameState.activeQuests.findIndex(q => q.id === quest.id);
        if (idx > -1) GameState.activeQuests.splice(idx, 1);

        if (!GameState.questCooldowns) GameState.questCooldowns = {};
        GameState.questCooldowns[quest.id] = GameState.cycle;

        QuestManager.render(container);
    }
}