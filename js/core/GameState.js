export class GameState {
    static cycle = 1;
    static resources = { candles: 150 };
    static roster = [];
    static currentSquad = [];
    
    static getTotalSalary() {
        return this.roster.reduce((sum, adv) => sum + adv.salary, 0);
    }

    static updateTopBarUI() {
        document.getElementById('ui-cycle').innerText = this.cycle;
        document.getElementById('ui-candles').innerText = this.resources.candles;
        document.getElementById('ui-roster-count').innerText = this.roster.length;
        document.getElementById('ui-salary').innerText = this.getTotalSalary();
    }
}