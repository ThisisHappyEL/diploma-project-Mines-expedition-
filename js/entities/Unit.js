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
        this.y = 700;
        this.scale = config.scale || 1.0;
        this.width = 80;
        this.height = 120;
        this.targetX = 0; 
        this.offsetX = 0;
        this.isDead = false;
        this.skills = config.skills || [];
        this.activeEffects = []; 
        this.effectHitboxes = [];
        this.queueYOffset = 0; 
        this.isEnvironment = config.isEnvironment || false;
        this.sprite = null;
        this.spriteLoaded = false
        if (config.spriteUrl) {
            this.sprite = new Image();
            this.sprite.onload = () => {
                this.spriteLoaded = true;
                this.width = this.sprite.width * this.scale;
                this.height = this.sprite.height * this.scale;
            };
            this.sprite.src = config.spriteUrl; 
        }
    }

    get combatStat() {
        return this.baseCombat;
    }

    get stats() {
        return { 
            battle: this.combatStat, 
            atkArmor: 0, 
            defArmor: 0 
        };
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
            this.addEffect(EFFECTS.STUN, combo);
            count -= combo; 
            if (count <= 0) return;
        }
        if (effectConfig.id === 'daze' && this.hasEffect('weakness')) {
            let combo = Math.min(count, this.getEffect('weakness').count);
            this.modifyEffect('weakness', -combo);
            this.addEffect(EFFECTS.STUN, combo);
            count -= combo; 
            if (count <= 0) return;
        }

        if (effectConfig.id === 'power' && this.hasEffect('speed')) {
            let combo = Math.min(count, this.getEffect('speed').count);
            this.modifyEffect('speed', -combo);
            this.addEffect(EFFECTS.COURAGE, combo); 
            count -= combo; 
            if (count <= 0) return;
        }
        if (effectConfig.id === 'speed' && this.hasEffect('power')) {
            let combo = Math.min(count, this.getEffect('power').count);
            this.modifyEffect('power', -combo);
            this.addEffect(EFFECTS.COURAGE, combo); 
            count -= combo; 
            if (count <= 0) return;
        }

        if (effectConfig.type === 'debuff' || effectConfig.id === 'dot') {
            if (this.hasEffect('susceptibility') && effectConfig.id !== 'susceptibility') {
                count += 1; 
                if (effectConfig.id === 'dot') {
                    if (!customParams.damagePerTurn) customParams.damagePerTurn = 2;
                    customParams.damagePerTurn += 1; 
                }
                if (customParams.duration) customParams.duration += 1; 
                else customParams.duration = (effectConfig.duration || 4) + 1; 
                
                this.modifyEffect('susceptibility', -1); 
                window.spawnDamageText("ВОСПРИИМЧИВОСТЬ", this.x + 10, this.y - 60, "#b19cd9");
            }
        }
        if (effectConfig.id === 'dot') {
            let ex = this.getEffect('dot');
            if (ex) {
                ex.duration = Math.max(ex.duration, customParams.duration);
                if (customParams.damagePerTurn > ex.damagePerTurn) ex.damagePerTurn = customParams.damagePerTurn;
            } else {
                this.activeEffects.push({ base: effectConfig, count: 1, duration: customParams.duration || 3, damagePerTurn: customParams.damagePerTurn || 2 });
            }
            return;
        }
        let existing = this.getEffect(effectConfig.id);
        if (existing) {
            existing.count += count;
            if (customParams.duration) existing.duration = Math.max(existing.duration, customParams.duration);
        } else {
            this.activeEffects.push({ base: effectConfig, count: count, duration: customParams.duration || effectConfig.duration || 99 });
        }
    }

    tickEffectsByTrigger(triggerType) {
        const manualTokens = ['block', 'parry', 'dodge', 'aGapingWound', 'ammo', 'noOneStepFurther', 'morePowder'];

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            let e = this.activeEffects[i];
            
            if (e.base.tickOn === triggerType) {
                if (triggerType === 'hitReceived' && manualTokens.includes(e.base.id)) {
                } else if (manualTokens.includes(e.base.id)) {
                } else {
                    e.count -= 1;
                }
            } 
            else if (triggerType === 'turnEnd' && e.duration !== undefined && e.base.id !== 'stun') {
                e.duration -= 1;
            }
            
            if (e.count <= 0 || (e.duration !== undefined && e.duration <= 0)) {
                this.activeEffects.splice(i, 1);
            }
        }
    }

    takeDamage(amt) {
        this.hp = Math.max(0, this.hp - amt);
        this.offsetX = this.side === 'player' ? -20 : 20;
        if (this.hp <= 0) {
            this.isDead = true;
            this.effectHitboxes = [];
        }
    }

    update() {
        if (this.isDead) return;
        const baseX = 960, gap = 220, spacing = 160; 
        const slotWidth = 80; 

        let slotCenterX = baseX;
        if (this.isEnvironment) {
            slotCenterX = baseX;
        } else if (this.side === 'player') {
            slotCenterX = baseX - gap - ((this.posIdx - 1) * spacing);
        } else {
            slotCenterX = baseX + gap + ((this.posIdx - 1) * spacing);
        }

        this.targetX = slotCenterX - (this.width / 2);
        
        this.x += (this.targetX - this.x) * 0.1;
        this.offsetX *= 0.8;
        this.queueYOffset *= 0.8; 
    }

    drawBody(ctx, isActiveTurn, isPotentialTarget = false, isHovered = false) {
        if (this.isDead) return;
        const drawX = this.x + this.offsetX;
        let centerX = drawX + this.width / 2; 
        const drawY = this.y - this.height;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(centerX, this.y, this.width * 0.35, 10, 0, 0, Math.PI * 2); ctx.fill();

        ctx.save(); 
        if (isActiveTurn || isPotentialTarget || isHovered) {
            let color = '#ffffff'; 
            let blur = 0;

            if (isActiveTurn) { 
                color = '#ffbf00'; 
                blur = 20; 
            }
            
            if (isPotentialTarget) {
                color = this.side === 'player' ? '#4affab' : '#ff4444';
                blur = 15;
            }

            if (isHovered) {
                if (isPotentialTarget) {
                    color = this.side === 'player' ? '#00ffaa' : '#ff0000';
                    blur = 35;
                } 
                else if (isActiveTurn) {
                    color = '#ffdf00'; 
                    blur = 30;
                }
                else {
                    color = '#ffffff';
                    blur = 25;
                }
            }

            ctx.shadowColor = color; 
            ctx.shadowBlur = blur;
            
            if (this.spriteLoaded) {
                ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
                ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
                ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
            }
        }

        if (this.spriteLoaded) {
            ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
        } else {
            ctx.fillStyle = this.isEnvironment ? '#88ccff' : (this.side === 'player' ? '#4a90e2' : '#e24a4a');
            ctx.fillRect(drawX, drawY, this.width, this.height);
            if (isActiveTurn || isPotentialTarget || isHovered) {
                ctx.strokeStyle = ctx.shadowColor; ctx.lineWidth = 2; ctx.strokeRect(drawX, drawY, this.width, this.height);
            }
        }
        ctx.restore(); 
    }

    drawUI(ctx, predictedDamage = 0) {
        if (this.isDead) return;
        const drawX = this.x + this.offsetX;
        let centerX = drawX + this.width / 2;
        const drawY = this.y - this.height;
        this.effectHitboxes = []; 

        if (!this.isEnvironment) {
            let hpPercent = this.maxHp > 0 ? (this.hp / this.maxHp) : 0;
            let hpY = this.y + 15; 
            let barW = 70; 
            let barX = centerX - (barW / 2); 
            
            ctx.fillStyle = '#333'; ctx.fillRect(barX, hpY, barW, 6); 
            ctx.fillStyle = '#ff4444'; 
            let currentHpWidth = barW * hpPercent;
            ctx.fillRect(barX, hpY, currentHpWidth, 6);

            if (predictedDamage > 0) {
                let dmgPercent = Math.min(this.hp, predictedDamage) / this.maxHp;
                let dmgWidth = barW * dmgPercent;
                if (Math.floor(Date.now() / 400) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 191, 0, 0.9)'; 
                    ctx.fillRect(barX + currentHpWidth - dmgWidth, hpY, dmgWidth, 6); 
                }
            }
        }

        if (this.activeEffects.length > 0) {
            let totalEffWidth = this.activeEffects.length * 28;
            let effectX = centerX - (totalEffWidth / 2) + 14; 
            let effectY = drawY - 15; 
            
            this.activeEffects.forEach(e => {
                ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
                ctx.fillText(e.base.icon, effectX - 10, effectY); 
                this.effectHitboxes.push({ x: effectX - 10, y: effectY - 20, width: 25, height: 25, data: e });
                effectX += 28;
            });
        }
    }

    getTooltipHTML() {
        return `
            <div class="unit-card-mini" style="position:relative; height:100%; display:flex; flex-direction:column; justify-content:center;">
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:36px; font-weight:900; color:rgba(255,191,0,0.05); white-space:nowrap; pointer-events:none; z-index:0; letter-spacing: 6px;">ПРОТИВНИК</div>
                <div style="position:relative; z-index:1;">
                    <h4 style="color: #ff4444; margin: 0 0 5px 0; text-transform:uppercase;">${this.name}</h4>
                    <div class="tt-divider"></div>
                    <div style="font-size:16px; color:#ffbf00;">⚔️ Бой: ${this.combatStat}</div>
                    <div style="font-size:16px; color:#ff6666; font-weight:bold;">❤️ HP: ${Math.floor(this.hp)}/${this.maxHp}</div>
                    <div class="tt-divider"></div>
                    <div style="font-size: 11px; color: #888;">Враждебная сущность недр.</div>
                </div>
            </div>`;
    }

    isClicked(mx, my) {
        if (this.isDead) return false;
        let drawX = this.x + this.offsetX;
        let centerX = drawX + this.width / 2;
        
        let hitboxWidth = 100;
        let hitboxHeight = 160;
        
        let left = centerX - (hitboxWidth / 2);
        let right = centerX + (hitboxWidth / 2);
        let top = this.y - hitboxHeight;
        let bottom = this.y + 25;

        return mx >= left && mx <= right && my >= top && my <= bottom;
    }
}