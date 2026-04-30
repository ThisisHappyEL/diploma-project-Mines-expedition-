import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';

export const ExpeditionManager = {
    active: false,
    isPaused: false,
    timeElapsed: 0,
    maxTime: 12,
    pace: 'normal',
    priority: 'mining',
    threat: 0,
    
    progress: { mining: 0, scouting: 0, construction: 0, research: 0 },
    lastDeltas: { mining: 0, scouting: 0, construction: 0, research: 0, threat: 0 },
    
    loot: { minerals: 0, knowledge: 0, materials: 0 },

    start() {
        this.active = true;
        this.isPaused = false;
        this.timeElapsed = 0;
        this.threat = 0;
        this.progress = { mining: 0, scouting: 0, construction: 0, research: 0 };
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    },

    triggerBattle() {
        this.isPaused = true;
        this.active = false;
        
        console.log("УГРОЗА 100%! Враги атакуют!");

        import('../scenes/BattleScene.js').then(m => {
            SceneManager.changeScene(m.BattleScene);
        });
    },

    tick() {
        if (!this.active || this.isPaused) return "PAUSED";

        if (this.timeElapsed >= this.maxTime) {
            this.active = false;
            return "TIMEOUT";
        }

        this.timeElapsed++;
        const stats = this.getSquadTotalStats();
        const activities = ['mining', 'scouting', 'construction', 'research'];
        
        activities.forEach(type => {
            const sumSkill = stats[type] || 0;
            const isPrimary = this.priority === type;
            
            let efficiency = sumSkill * 0.75;

            if (this.pace === 'normal') {
                if (isPrimary) efficiency *= 1.5;
            } else if (this.pace === 'fast') {
                efficiency *= (isPrimary ? 2.0 : 1.25);
            } else if (this.pace === 'slow') {
                efficiency *= (isPrimary ? 1.25 : 0.5);
            }

            const gain = parseFloat((efficiency / 5).toFixed(1)); 
            this.lastDeltas[type] = gain;
            this.progress[type] += gain;

            if (this.progress[type] >= 100) {
                this.generateLoot(type);
                this.progress[type] -= 100;
            }
        });

        let threatGain = 0;
        if (this.pace === 'normal') threatGain = 2 + Math.random() * 3; // было 2 + Math.random() * 3
        else if (this.pace === 'fast') threatGain = 50 + Math.random() * 25; // было 5 + Math.random() * 5
        else if (this.pace === 'slow') threatGain = 0.5 + Math.random() * 1; // было 0.5 + Math.random() * 1

        this.lastDeltas.threat = parseFloat(threatGain.toFixed(1));
        this.threat += this.lastDeltas.threat;

        if (this.threat >= 100) {
            this.triggerBattle();
        }

        return "SUCCESS";
    },

    getSquadTotalStats() {
        return GameState.currentSquad.reduce((acc, adv) => {
            acc.mining += adv.mining || 0;
            acc.scouting += adv.scouting || 0;
            acc.construction += adv.building || 0;
            acc.research += adv.research || 0;
            return acc;
        }, { mining: 0, scouting: 0, construction: 0, research: 0 });
    },

    generateLoot(type) {
        if (type === 'mining') this.loot.minerals++;
        if (type === 'research') this.loot.knowledge++;
        if (type === 'construction') this.loot.materials++;
    }
};