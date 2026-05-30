import { OUTFITS } from "../data/workersData/outfit.js";
import { test_weapon } from "../data/battleData/weapon.js";
import { LOOT } from "../data/expiditionData/lootData.js";
import { EQUIPMENT } from "../data/workersData/equipment.js";
import { HUB_BALANCE } from "../data/balanceFiles/hubBalance.js";

export class GameState {
    static isDebugMode = false; // Если включено - генерирует все варианты доспехов и дебаг-оружие
    static isDebugInitialized = false;
    static cycle = 1;
    static resources = { candles: 300 };
    static roster = [];
    static currentSquad = [];
    static inventory = [];
    static activeQuests = [];
    static hasFinishedExpedition = false;
    static debtCycles = HUB_BALANCE.bankruptcy.cyclesBeforeDefeat;
    static selectedBiome = 'glassForest';
    static expeditionInventory = [];
    static biomeProgress = {
        mining: 0,
        research: 0,
        construction: 0,
        scouting: 0
    };
    static threatLevel = 0;
    static questCooldowns = {};
    static selectedEncounter = null;// Какая группа врагов встретится
    static battleContext = null;// Причина боя ('preemptive', 'forced_timeout', 'forced_threat')
    static isReturningFromBattle = false; // Флаг возвращения в сцену исследования
    
    static getTotalSalary() {
        return this.roster.reduce((sum, adv) => sum + (adv.salary || 0), 0);
    }

    static updateTopBarUI() {
        document.getElementById('ui-cycle').innerText = this.cycle;
        
        const candlesEl = document.getElementById('ui-candles');
        candlesEl.innerText = this.resources.candles;
        
        if (this.resources.candles < 0) {
            candlesEl.style.color = 'var(--color-danger)';
            candlesEl.style.textShadow = '0 0 5px rgba(255, 68, 68, 0.5)';
        } else {
            candlesEl.style.color = '#ffbf00'; 
            candlesEl.style.textShadow = 'none';
        }

        const debtEl = document.getElementById('ui-debt-timer');
        if (this.resources.candles < 0) {
            debtEl.style.display = 'inline';
            debtEl.innerText = `[Банкротство через: ${this.debtCycles} цикл.]`;
        } else {
            debtEl.style.display = 'none';
            this.debtCycles = HUB_BALANCE.bankruptcy.cyclesBeforeDefeat; 
        }

        document.getElementById('ui-roster-count').innerText = this.roster.length;
        document.getElementById('ui-salary').innerText = this.getTotalSalary();

        // блокировка кнопки-локации клети в хабе
        const cleatBtn = document.querySelector('.btn-cleat') || 
                         Array.from(document.querySelectorAll('#hub-menu button, .menu-nav-btn'))
                              .find(btn => btn.textContent.includes('Клеть') || (btn.id && btn.id.includes('cleat')));

        if (cleatBtn) {
            if (this.hasFinishedExpedition) {
                cleatBtn.disabled = true;
                cleatBtn.style.opacity = '0.3';
                cleatBtn.style.cursor = 'not-allowed';
                cleatBtn.style.pointerEvents = 'none';

                const textSpan = cleatBtn.querySelector('span');
                if (textSpan && !textSpan.dataset.originalText) {
                    textSpan.dataset.originalText = textSpan.innerText;
                    textSpan.innerText = '🔒 Клеть (Вылазка совершена)';
                }
            } else {
                cleatBtn.disabled = false;
                cleatBtn.style.opacity = '1';
                cleatBtn.style.cursor = 'pointer';
                cleatBtn.style.pointerEvents = 'auto';

                const textSpan = cleatBtn.querySelector('span');
                if (textSpan && textSpan.dataset.originalText) {
                    textSpan.innerText = textSpan.dataset.originalText;
                    delete textSpan.dataset.originalText;
                }
            }
        }

        const activeProfileNameEl = document.getElementById('ui-active-profile-name');
        if (activeProfileNameEl && window.SaveManager) {
            const profiles = window.SaveManager.getProfiles();
            const activeProf = profiles.find(p => p.id === window.SaveManager.activeProfile);
            if (activeProf) {
                activeProfileNameEl.innerText = `ЭКСПЕДИЦИЯ: ${activeProf.name.toUpperCase()}`;
            }
        }
    }

    static initDebugInventory() {
        if (this.isDebugInitialized) return;
        this.isDebugInitialized = true;

        // срартовый набор нового игрока
        if (!this.isDebugMode) {
            this.initStarterInventory();
            return;
        }

        // дебаг привилегии
        // Броня и проф. одежда всех уровней
        for (const [outfitName, outfitData] of Object.entries(OUTFITS)) {
            for (let level = 1; level <= 4; level++) {
                if (outfitData.levels[level]) {
                    for (let i = 0; i < 4; i++) {
                        this.inventory.push({
                            id: `armor_${Date.now()}_${Math.random()}`,
                            type: 'armor',
                            key: outfitName, 
                            name: outfitData.name,
                            level: level,
                            stats: outfitData.levels[level],
                            description: outfitData.description
                        });
                    }
                }
            }
        }

        // дебаг-пушки
        for (const [weaponKey, weaponObj] of Object.entries(test_weapon)) {
            for (let i = 0; i < 4; i++) {
                this.inventory.push({
                    id: `weapon_${Date.now()}_${Math.random()}`,
                    key: weaponKey,
                    ...weaponObj
                });
            }
        }

        // все виды ценностей
        for (const [categoryKey, categoryItems] of Object.entries(LOOT)) {
            for (const [itemKey, itemData] of Object.entries(categoryItems)) {
                this.inventory.push({
                    id: `loot_${categoryKey}_${itemKey}_${Date.now()}_${Math.random()}`,
                    type: 'loot',
                    category: categoryKey,
                    key: itemKey, 
                    name: itemData.name,
                    price: itemData.price,
                    foundIn: itemData.foundIn,
                    description: itemData.description,
                    sprite: itemData.sprite || 'Нет спрайта'
                });
            }
        }

        // все виды припасов и расходников
        for (const [categoryKey, categoryItems] of Object.entries(EQUIPMENT)) {
            for (const [itemKey, itemData] of Object.entries(categoryItems)) {
                const mappedCategory = (categoryKey === 'food' || categoryKey === 'water') ? 'foodAndWater' : categoryKey;
                this.inventory.push({
                    id: `supplies_${categoryKey}_${itemKey}_${Date.now()}_${Math.random()}`,
                    type: 'supplies',
                    category: mappedCategory,
                    key: itemKey, 
                    name: itemData.name,
                    price: itemData.price,
                    description: itemData.description || 'Полезное экспедиционное снаряжение.',
                    usefulAt: itemData.usefulAt,
                    requiredAt: itemData.requiredAt,
                    sprite: itemData.sprite || 'Нет спрайта'
                });
            }
        }
    }

    static initStarterInventory() {
        this.inventory = [
            {
                id: "starter_supplies_1",
                type: "supplies",
                category: "foodAndWater",
                key: "scantyRation",
                name: "Скудный рацион",
                price: 10,
                description: "Черствые корки хлеба и сушеное мясо пещерных жуков."
            },
            {
                id: "starter_supplies_2",
                type: "supplies",
                category: "foodAndWater",
                key: "scantyRation",
                name: "Скудный рацион",
                price: 10,
                description: "Черствые корки хлеба и сушеное мясо пещерных жуков."
            },
            {
                id: "starter_supplies_3",
                type: "supplies",
                category: "foodAndWater",
                key: "wasteWater",
                name: "Сточные воды",
                price: 10,
                description: "Техническая вода слабой пещерной фильтрации."
            },
            {
                id: "starter_supplies_4",
                type: "supplies",
                category: "foodAndWater",
                key: "wasteWater",
                name: "Сточные воды",
                price: 10,
                description: "Техническая вода слабой пещерной фильтрации."
            }
        ];
    }

    static getHoursThresholdForLevel(level) {
        if (level <= 1) return 0;
        const base = HUB_BALANCE.leveling.baseHoursForLevel2 || 6;
        const multiplier = HUB_BALANCE.leveling.hoursMultiplierPerLevel || 2;
        return base * Math.pow(multiplier, level - 2); // рост требований к левелапу
    }

    static addExpHours(adv, hours) {
        if (!adv.expHours) adv.expHours = 0;
        if (!adv.level) adv.level = 1;
        if (!adv.unspentPoints) adv.unspentPoints = 0;

        adv.expHours += hours;

        while (true) {
            const nextLevel = adv.level + 1;
            const threshold = this.getHoursThresholdForLevel(nextLevel);
            if (adv.expHours >= threshold) {
                adv.level = nextLevel;
                adv.unspentPoints += (HUB_BALANCE.leveling.pointsPerLevel || 1);
                adv.allocatedPoints = { hp: 0, stamina: 0, battle: 0, mining: 0, research: 0, construction: 0, scouting: 0 };
            } else {
                break;
            }
        }
    }
}