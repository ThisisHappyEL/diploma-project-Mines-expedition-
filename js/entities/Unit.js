import { EFFECTS } from '../data/battleData/effects.js';

export class Unit {
    constructor(config) {
        this.name = config.name;
        this.side = config.side; 
        this.posIdx = config.posIdx; 
        
        this.maxHp = Number(config.maxHp) || Number(config.hp) || 40;
        this.hp = Number(config.hp) || this.maxHp;  
        this.maxStamina = Number(config.maxStamina) || Number(config.stamina) || 100;
        this.stamina = Number(config.stamina) || this.maxStamina;
        this.baseCombat = Number(config.combat) || 10; 

        this.x = this.side === 'player' ? -100 : 1100; 
        this.y = 600;
        this.width = 80;
        this.height = 120;
        this.targetX = 0; 
        this.offsetX = 0;
        this.isDead = false;
        this.skills = config.skills || [];
        this.activeEffects = []; 
        this.effectHitboxes = [];
        this.queueYOffset = 0; 
    }

    get combatStat() {
        return (this.stats && this.stats.battle !== undefined) ? this.stats.battle : this.baseCombat;
    }

    getAvailableSkills() { return []; }

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
            let combo = Math.min(count, this.getEffect('daze').count);
            this.modifyEffect('daze', -combo);
            this.addEffect(EFFECTS.STUN, combo * 2); 
            count -= combo; if (count <= 0) return;
        }
        if (effectConfig.id === 'daze' && this.hasEffect('weakness')) {
            let weak = this.getEffect('weakness');
            this.modifyEffect('weakness', -combo);
            this.addEffect(EFFECTS.STUN, combo * 2);
            count -= combo; if (count <= 0) return;
        }
        if (effectConfig.id === 'dot') {
            let ex = this.getEffect('dot');
            if (ex) {
                ex.duration += 1;
                ex.damagePerTurn = (ex.damagePerTurn || 2) + 1;
                if (customParams.damagePerTurn > ex.damagePerTurn) ex.damagePerTurn = customParams.damagePerTurn;
            } else {
                this.activeEffects.push({ base: effectConfig, count: 1, duration: customParams.duration || 3, damagePerTurn: customParams.damagePerTurn || 2 });
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
            if (e.base.tickOn === triggerType) e.count -= 1;
            else if (triggerType === 'turnEnd' && e.duration !== undefined && e.base.id !== 'stun') e.duration -= 1;
            if (e.count <= 0 || (e.duration !== undefined && e.duration <= 0)) this.activeEffects.splice(i, 1);
        }
    }

    takeDamage(amt) {
        this.hp = Math.max(0, this.hp - amt);
        this.offsetX = this.side === 'player' ? -20 : 20;
        if (this.hp <= 0) this.isDead = true;
    }

    update() {
        if (this.isDead) return;
        const baseX = 960, gap = 60, spacing = 130;
        if (this.side === 'player') this.targetX = baseX - gap - this.width - ((this.posIdx - 1) * spacing);
        else this.targetX = baseX + gap + ((this.posIdx - 1) * spacing);
        this.x += (this.targetX - this.x) * 0.1;
        this.offsetX *= 0.8;
        this.queueYOffset *= 0.8; 
    }

    draw(ctx, isActiveTurn, isPotentialTarget = false, isHovered = false) {
        if (this.isDead) return;
        const drawX = this.x + this.offsetX;
        const nameOnly = this.name.split(' ')[0];
        this.effectHitboxes = []; 

        if (isActiveTurn) {
            ctx.save();
            ctx.shadowBlur = isHovered ? 40 : 20; 
            ctx.shadowColor = "#ffbf00";
            ctx.strokeStyle = isHovered ? "#ffffff" : "#ffbf00"; 
            ctx.lineWidth = isHovered ? 6 : 4;
            ctx.strokeRect(drawX - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.restore();
        }

        if ((isPotentialTarget || isHovered) && !isActiveTurn) {
            ctx.save();
            let color = isPotentialTarget ? (this.side === 'player' ? '#00ccff' : '#ff0000') : '#ffffff';
            if (isHovered) color = '#ffffff'; 
            ctx.shadowColor = color; ctx.shadowBlur = 25; ctx.strokeStyle = color; ctx.lineWidth = 4;
            ctx.strokeRect(drawX - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.restore();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(drawX + this.width/2, this.y + this.height, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this.side === 'player' ? '#4a90e2' : '#e24a4a';
        ctx.strokeStyle = isActiveTurn ? '#ffbf00' : '#fff'; ctx.lineWidth = 2;
        ctx.fillRect(drawX, this.y, this.width, this.height);
        ctx.strokeRect(drawX, this.y, this.width, this.height);

        let hpPercent = this.maxHp > 0 ? (this.hp / this.maxHp) : 0;
        ctx.fillStyle = '#333'; ctx.fillRect(drawX, this.y - 15, this.width, 6);
        ctx.fillStyle = '#ff4444'; ctx.fillRect(drawX, this.y - 15, this.width * hpPercent, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial';
        ctx.fillText(nameOnly, drawX, this.y - 25);

        if (this.activeEffects.length > 0) {
            let effectY = this.y - 45, effectX = drawX;
            this.activeEffects.forEach(e => {
                ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
                ctx.fillText(e.base.icon, effectX, effectY);
                this.effectHitboxes.push({ x: effectX, y: effectY - 20, width: 25, height: 25, data: e });
                effectX += 28;
            });
        }
    }

    getTooltipHTML() {
        return `<div class="unit-card-mini">
                <h4 style="color: #ff4444; margin-bottom: 5px; text-transform:uppercase;">${this.name}</h4>
                <div class="tt-divider"></div>
                <div style="font-size:16px; color:#ffbf00;">⚔️ Бой: ${this.combatStat}</div>
                <div style="font-size:16px; color:#ff6666; font-weight:bold;">❤️ HP: ${Math.floor(this.hp)}/${this.maxHp}</div>
                <div class="tt-divider"></div>
                <div style="font-size: 11px; color: #888;">Враждебная сущность недр.</div>
            </div>`;
    }

    isClicked(mx, my) {
        if (this.isDead) return false;
        return mx >= (this.x - 10) && mx <= (this.x + this.width + 10) && my >= (this.y - 10) && my <= (this.y + this.height + 10);
    }
}