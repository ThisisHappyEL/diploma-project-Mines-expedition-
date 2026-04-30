import { EFFECTS } from '../data/effects.js';

export class Unit {
    constructor(config) {
        this.name = config.name;
        this.side = config.side; 
        this.posIdx = config.posIdx; 
        this.hp = config.hp;
        this.maxHp = config.maxHp || config.hp;
        this.baseCombat = config.combat || 5; 
        this.x = this.side === 'player' ? -100 : 1100; 
        this.y = 600;
        this.width = 80;
        this.height = 120;
        this.targetX = 0; 
        this.offsetX = 0;
        this.isDead = false;
        this.skills = config.skills || [];
        this.activeEffects = []; // [{ base: EFFECT, count: X, duration: Y, damagePerTurn: Z }]
        this.effectHitboxes = [];
    }

    get combatStat() {
        return (this.stats && this.stats.battle !== undefined) ? this.stats.battle : this.baseCombat;
    }

    hasEffect(effectId) { return this.activeEffects.some(e => e.base.id === effectId); }
    getEffect(effectId) { return this.activeEffects.find(e => e.base.id === effectId); }

    modifyEffect(effectId, countDelta) {
        let eff = this.getEffect(effectId);
        if (eff) {
            eff.count += countDelta;
            if (eff.count <= 0) this.activeEffects = this.activeEffects.filter(e => e.base.id !== effectId);
            return true;
        }
        return false;
    }

    addEffect(effectConfig, count = 1, customParams = {}) {
        if (!effectConfig) return;

        const antagonists = { 'power': 'weakness', 'weakness': 'power', 'speed': 'daze', 'daze': 'speed', 'courage': 'stun', 'stun': 'courage' };
        let antId = antagonists[effectConfig.id];
        if (antId && this.hasEffect(antId)) {
            let ant = this.getEffect(antId);
            let cancel = Math.min(count, ant.count);
            this.modifyEffect(antId, -cancel);
            count -= cancel;
            if (count <= 0) return;
        }

        if (effectConfig.id === 'weakness' && this.hasEffect('daze')) {
            let daze = this.getEffect('daze');
            let combo = Math.min(count, daze.count);
            this.modifyEffect('daze', -combo);
            this.addEffect(EFFECTS.STUN, combo);
            count -= combo; if (count <= 0) return;
        }
        if (effectConfig.id === 'daze' && this.hasEffect('weakness')) {
            let weak = this.getEffect('weakness');
            let combo = Math.min(count, weak.count);
            this.modifyEffect('weakness', -combo);
            this.addEffect(EFFECTS.STUN, combo);
            count -= combo; if (count <= 0) return;
        }

        if (effectConfig.id === 'bleed') {
            let ex = this.getEffect('bleed');
            if (ex) {
                ex.duration += 1;
                ex.damagePerTurn = (ex.damagePerTurn || 2) + 1;
                if (customParams.damagePerTurn > ex.damagePerTurn) ex.damagePerTurn = customParams.damagePerTurn;
            } else {
                this.activeEffects.push({ base: effectConfig, count: 1, duration: count, damagePerTurn: customParams.damagePerTurn || 2 });
            }
            return;
        }

        let existing = this.getEffect(effectConfig.id);
        if (existing) {
            existing.count += count;
            if (customParams.duration) existing.duration = customParams.duration;
        } else {
            this.activeEffects.push({ base: effectConfig, count: count, duration: customParams.duration || effectConfig.duration || 99 });
        }
    }

    tickEffectsByTrigger(triggerType) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            let e = this.activeEffects[i];
            
            if (e.base.tickOn === triggerType) {
                e.count -= 1;
            } 
            else if (triggerType === 'turnEnd' && e.duration !== undefined) {
                e.duration -= 1;
            }

            if (e.count <= 0 || (e.duration !== undefined && e.duration <= 0)) {
                this.activeEffects.splice(i, 1);
            }
        }
    }

    takeDamage(amt) {
        this.hp -= amt;
        this.offsetX = this.side === 'player' ? -20 : 20;
        if (this.hp <= 0) { this.hp = 0; this.isDead = true; }
    }

    update() {
        if (this.isDead) return;
        const baseX = 960;
        const gap = 60;
        const spacing = 130;
        
        if (this.side === 'player') this.targetX = baseX - gap - this.width - ((this.posIdx - 1) * spacing);
        else this.targetX = baseX + gap + ((this.posIdx - 1) * spacing);
        
        this.x += (this.targetX - this.x) * 0.1;
        this.offsetX *= 0.8;
    }

    draw(ctx, isSelected, isPotentialTarget = false, isHovered = false) {
        if (this.isDead) return;
        const drawX = this.x + this.offsetX;
        this.effectHitboxes = []; 

        if (isPotentialTarget || isHovered) {
            ctx.save();
            ctx.shadowColor = isPotentialTarget ? (this.side === 'player' ? '#4aa3df' : '#ff4444') : '#ffffff';
            ctx.shadowBlur = isHovered ? 25 : 15; 
            ctx.strokeStyle = ctx.shadowColor;
            ctx.lineWidth = isHovered ? 6 : 4;
            ctx.strokeRect(drawX - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.restore();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(drawX + this.width/2, this.y + this.height, 40, 10, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = this.side === 'player' ? '#4a90e2' : '#e24a4a';
        ctx.strokeStyle = isSelected ? '#ffbf00' : '#fff';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.fillRect(drawX, this.y, this.width, this.height);
        ctx.strokeRect(drawX, this.y, this.width, this.height);

        ctx.fillStyle = '#333'; ctx.fillRect(drawX, this.y - 15, this.width, 6);
        ctx.fillStyle = '#ff4444'; ctx.fillRect(drawX, this.y - 15, this.width * (this.hp / this.maxHp), 6);
        
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
        ctx.fillText(`${this.name} [P${this.posIdx}]`, drawX, this.y - 25);

        if (this.activeEffects.length > 0) {
            let effectY = this.y - 45;
            let effectX = drawX;
            
            this.activeEffects.forEach(e => {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Arial';
                ctx.fillText(e.base.icon, effectX, effectY);
                this.effectHitboxes.push({ x: effectX, y: effectY - 20, width: 25, height: 25, data: e });
                effectX += 28;
            });
        }
    }

    isClicked(mx, my) {
        if (this.isDead) return false;
        const p = 20;
        return mx >= (this.x - p) && mx <= (this.x + this.width + p) && my >= (this.y - p) && my <= (this.y + this.height + p);
    }
}