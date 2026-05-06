import { OUTFITS } from "../data/workersData/outfit.js";
import { test_weapon } from "../data/battleData/weapon.js";

export class GameState {
    static cycle = 1;
    static resources = { candles: 150 };
    static roster = [];
    static currentSquad = [];
    static inventory = [];
    static isDebugInitialized = false;
    
    static getTotalSalary() {
        return this.roster.reduce((sum, adv) => sum + adv.salary, 0);
    }

    static updateTopBarUI() {
        document.getElementById('ui-cycle').innerText = this.cycle;
        document.getElementById('ui-candles').innerText = this.resources.candles;
        document.getElementById('ui-roster-count').innerText = this.roster.length;
        document.getElementById('ui-salary').innerText = this.getTotalSalary();
    }

    static initDebugInventory() {
        if (this.isDebugInitialized) return;
        this.isDebugInitialized = true;

        for (const [outfitName, outfitData] of Object.entries(OUTFITS)) {
            for (let level = 1; level <= 4; level++) {
                if (outfitData.levels[level]) {
                    for (let i = 0; i < 4; i++) {
                        this.inventory.push({
                            id: `armor_${Date.now()}_${Math.random()}`,
                            type: 'armor',
                            name: `${outfitName} (Ур.${level})`,
                            level: level,
                            stats: outfitData.levels[level],
                            description: outfitData.description
                        });
                    }
                }
            }
        }

        for (const [weaponKey, weaponObj] of Object.entries(test_weapon)) {
            for (let i = 0; i < 4; i++) {
                this.inventory.push({
                    id: `weapon_${Date.now()}_${Math.random()}`,
                    ...weaponObj
                });
            }
        }
    }
}