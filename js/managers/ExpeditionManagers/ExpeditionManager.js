import { GameState } from '../../core/GameState.js';
import { SceneManager } from '../../core/SceneManager.js';
import { EQUIPMENT } from '../../data/workersData/equipment.js';
import { ExpeditionLootManager } from './ExpeditionLootManager.js';
import { ExpeditionCampManager } from './ExpeditionCampManager.js';
import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';

export const ExpeditionManager = {
    active: false,
    isPaused: false,
    isResting: false,
    battleCompleted: false, 
    timeElapsed: 0,
    workTimeElapsed: 0,
    maxTime: EXPEDITION_BALANCE.maxTime,
    pace: 'normal',
    priority: null,
    threat: 0,
    
    progress: { mining: 0, scouting: 0, construction: 0, research: 0 },
    completed: { mining: false, scouting: false, construction: false, research: false },
    lastDeltas: { mining: 0, scouting: 0, construction: 0, research: 0, threat: 0 },
    haltReasons: { mining: null, scouting: null, construction: null, research: null },
    
    foundItems: [],
    activeToolsCache: { mining: [], scouting: [], construction: [], research: [] },
    catMap: { mining: 'miningMaterials', research: 'researchMaterials', construction: 'buildingMaterials', scouting: 'scoutingMaterials' },

    start() {
        this.active = true;
        this.isPaused = false;
        this.isResting = false;
        this.battleCompleted = false; 
        this.timeElapsed = 0;
        this.workTimeElapsed = 0; // сбрасываем рабочие часы при новой экспедиции
        this.threat = 0;

        // загузка прогресса в работах
        this.progress = { 
            mining: GameState.biomeProgress.mining || 0, 
            scouting: GameState.biomeProgress.scouting || 0, 
            construction: GameState.biomeProgress.construction || 0, 
            research: GameState.biomeProgress.research || 0 
        };

        // какие работы завершены ранее
        this.completed = { 
            mining: this.progress.mining >= 100, 
            scouting: this.progress.scouting >= 100, 
            construction: this.progress.construction >= 100, 
            research: this.progress.research >= 100 
        };

        this.haltReasons = { mining: null, scouting: null, construction: null, research: null };
        this.foundItems = [];

        GameState.currentSquad.forEach(adv => {
            if (!adv) return;
            adv.minExpeditionHp = adv.hp;
            adv.minExpeditionStamina = adv.stamina;
            adv.hasEatenThisExpedition = false;
            adv.expeditionHealQuality = 'none';
        });

        this.evaluateTools(); 
    },

    saveProgressToGameState() {
        GameState.biomeProgress.mining = this.progress.mining;
        GameState.biomeProgress.scouting = this.progress.scouting;
        GameState.biomeProgress.construction = this.progress.construction;
        GameState.biomeProgress.research = this.progress.research;
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    },

    toggleRest() {
        this.isResting = !this.isResting;
        return this.isResting;
    },

    evaluateTools() {
        const inv = GameState.expeditionInventory || [];
        const activities = ['mining', 'scouting', 'construction', 'research'];
        
        activities.forEach(type => {
            this.activeToolsCache[type] = [];
            const toolsData = EQUIPMENT[this.catMap[type]];
            let isHalted = false;
            let missingName = "";

            if (toolsData) {
                for (const [key, t] of Object.entries(toolsData)) {
                    const itemInInv = inv.find(item => item.key === key);
                    
                    if (this.progress[type] >= t.requiredAt) {
                        if (!itemInInv) {
                            isHalted = true;
                            missingName = t.name;
                            break; 
                        } else {
                            if(!this.activeToolsCache[type].some(i => i.key === key)) {
                                this.activeToolsCache[type].push({ ...t, isBoost: false });
                            }
                        }
                    } else if (this.progress[type] >= t.usefulAt && itemInInv) {
                        if(!this.activeToolsCache[type].some(i => i.key === key)) {
                            this.activeToolsCache[type].push({ ...t, isBoost: true });
                        }
                    }
                }
            }

            if (isHalted) {
                if (this.priority === type) {
                    this.priority = null;
                    this.isPaused = true;
                }
                this.haltReasons[type] = `Требуется: ${missingName}`;
            } else {
                this.haltReasons[type] = null;
            }
        });
    },

    // выбор группы противниках от накопленной сложности
    getEncounterComposition() {
        const val = this.threat;
        
        if (val >= 100) {
            const pool = ['boss_mother', 'boss_mother_2', 'boss_mother_3'];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        if (val >= 90) {
            const pool = ['hard_1', 'hard_2', 'hard_3', 'hard_4', 'hard_5'];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        if (val >= 70) {
            const pool = ['medium_1', 'medium_2', 'medium_3', 'medium_4', 'medium_5'];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        const pool = ['easy_1', 'easy_2', 'easy_3'];
        return pool[Math.floor(Math.random() * pool.length)];
    },

    triggerBattle(context = 'preemptive') {
        const isWiped = GameState.currentSquad.every(adv => adv.hp <= 0);
        if (isWiped) {
            this.active = false;
            import('../../scenes/ExploreScene.js').then(m => {
                m.ExploreScene.showSummary("ALL_DEAD");
            });
            return;
        }

        this.isPaused = true;
        this.active = false;

        GameState.battleContext = context;
        GameState.selectedEncounter = this.getEncounterComposition();

        const overlay = document.getElementById('battle-transition-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            void overlay.offsetWidth;
            overlay.classList.add('active');
        }

        // переход на сцену боя в конце затемнения
        setTimeout(() => {
            import('../../scenes/BattleScene.js').then(m => {
                SceneManager.changeScene(m.BattleScene);
            });
        }, 1200);
    },

    tick() {
        if (!this.active || this.isPaused) return "PAUSED";

        this.timeElapsed++;

        if (this.isResting) {
            ExpeditionCampManager.handleRestTick(this);
        } else {
            this.workTimeElapsed++; // рабочее время за работу, а не отдых
            this.handleWorkTick();
        }

        const isWiped = GameState.currentSquad.every(adv => adv.hp <= 0);
        if (isWiped) {
            this.active = false;
            this.saveProgressToGameState();
            import('../../scenes/ExploreScene.js').then(m => {
                m.ExploreScene.showSummary("ALL_DEAD");
            });
            return "DEFEAT";
        }

        if (this.timeElapsed >= this.maxTime) {
            if (this.threat >= 50 && !this.battleCompleted) {
                this.triggerBattle('forced_timeout');
                return "SUCCESS";
            }
            this.active = false;
            this.saveProgressToGameState();
            return "TIMEOUT";
        }

        return "SUCCESS";
    },

    handleWorkTick() {
        this.evaluateTools();
        const stats = this.getSquadTotalStats();
        const activities = ['mining', 'scouting', 'construction', 'research'];
        const fatigueBal = EXPEDITION_BALANCE.fatigue;
        const constBal = EXPEDITION_BALANCE.construction.milestones;
        const scoutBal = EXPEDITION_BALANCE.scouting.milestones;

        const fatigueRedCount = Math.floor(this.progress.construction / constBal.fatigueReduction.interval);
        const activeFlatReduction = fatigueRedCount * constBal.fatigueReduction.flatReduction;
        const activePercentReduction = fatigueRedCount * constBal.fatigueReduction.percentReduction;

        const paceFatigueMult = fatigueBal.paceFatigueMultipliers[this.pace] || 1.0;

        GameState.currentSquad.forEach(adv => {
            if (!adv || adv.hp <= 0 || adv.stamina <= 0) return; 

            const maxHp = window.HubManager.getStat(adv, 'hp');
            const maxStamina = window.HubManager.getStat(adv, 'stamina');

            const finalHpLossPercent = Math.max(0, fatigueBal.maxHpPercentLoss - activePercentReduction);
            const finalStamLossPercent = Math.max(0, fatigueBal.maxStaminaPercentLoss - activePercentReduction);

            const hpLoss = Math.max(0, Math.round(((fatigueBal.baseHpLoss - activeFlatReduction) + Math.round(maxHp * finalHpLossPercent)) * paceFatigueMult));
            const stamLoss = Math.max(0, Math.round(((fatigueBal.baseStaminaLoss - activeFlatReduction) + Math.round(maxStamina * finalStamLossPercent)) * paceFatigueMult));

            adv.hp = Math.max(0, adv.hp - hpLoss);
            adv.stamina = Math.max(0, adv.stamina - stamLoss);

            adv.minExpeditionHp = Math.min(adv.minExpeditionHp, adv.hp);
            adv.minExpeditionStamina = Math.min(adv.minExpeditionStamina, adv.stamina);
        });


        const speedupCount = Math.floor(this.progress.construction / constBal.speedup.interval);
        const activeDividerReduction = speedupCount * constBal.speedup.dividerReduction;
        const activeDivider = Math.max(1, EXPEDITION_BALANCE.progress.baseDivider - activeDividerReduction);

        const progBal = EXPEDITION_BALANCE.progress;
        activities.forEach(type => {
            if (this.completed[type] || this.haltReasons[type]) {
                this.lastDeltas[type] = 0;
                return; 
            }

            const sumSkill = stats[type] || 0;
            const isPrimary = this.priority === type;
            let efficiency = sumSkill * EXPEDITION_BALANCE.progress.skillModifier;

            const modifiers = progBal.paceModifiers[this.pace];
            efficiency *= (isPrimary ? modifiers.primary : modifiers.secondary);

            if (this.activeToolsCache[type].some(t => t.isBoost)) {
                efficiency *= progBal.toolBoostMultiplier; 
            }

            const gain = parseFloat((efficiency / activeDivider).toFixed(2));
            this.lastDeltas[type] = gain;
            
            const oldProg = this.progress[type];
            this.progress[type] += gain;

            ExpeditionLootManager.processMilestones(type, oldProg, this.progress[type], this);

            if (this.progress[type] >= 100) {
                this.progress[type] = 100;
                this.completed[type] = true;
                this.priority = null; 
            }
        });

        // 3. после боя угроза не растёт
        if (this.battleCompleted) {
            this.threat = 0;
            this.lastDeltas.threat = 0;
            return;
        }

        const threatRedCount = Math.floor(this.progress.scouting / scoutBal.threatReduction.interval);
        const activeThreatReduction = threatRedCount * scoutBal.threatReduction.reduction;

        const threatBal = EXPEDITION_BALANCE.threat;
        let threatGain = 0;
        
        if (this.pace === 'slow') {
            threatGain = threatBal.slowMin + Math.random() * (threatBal.slowMax - threatBal.slowMin);
        } else if (this.pace === 'normal') {
            threatGain = threatBal.normalMin + Math.random() * (threatBal.normalMax - threatBal.normalMin);
        } else if (this.pace === 'fast') {
            threatGain = threatBal.fastMin + Math.random() * (threatBal.fastMax - threatBal.fastMin);
        }

        this.lastDeltas.threat = parseFloat(Math.max(0, threatGain - activeThreatReduction).toFixed(2));
        this.threat += this.lastDeltas.threat;

        if (this.threat >= 100) {
            this.triggerBattle('forced_threat');
        }
    },

    getSquadTotalStats() {
        return GameState.currentSquad.reduce((acc, adv) => {
            if (!adv || adv.hp <= 0 || adv.stamina <= 0) return acc;

            acc.mining += window.HubManager.getStat(adv, 'mining') || 0;
            acc.scouting += window.HubManager.getStat(adv, 'scouting') || 0;
            acc.construction += window.HubManager.getStat(adv, 'construction') || 0;
            acc.research += window.HubManager.getStat(adv, 'research') || 0;
            return acc;
        }, { mining: 0, scouting: 0, construction: 0, research: 0 });
    }
};