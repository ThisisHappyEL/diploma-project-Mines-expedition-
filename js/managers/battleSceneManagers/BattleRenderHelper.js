import { Adventurer } from '../../entities/Adventurer.js';
import { Unit } from '../../entities/Unit.js';
import { CharacterRenderer } from '../hubLocationManagers/CharacterRenderer.js';

function getLayersFromHTML(adv) {
    const html = CharacterRenderer.getAvatarHTML(adv, "100%", true);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const imgs = temp.querySelectorAll('img');
    return Array.from(imgs).map(img => img.getAttribute('src'));
}

export const BattleRenderHelper = {
    applyPatches() {
        Adventurer.prototype.drawBody = function(ctx, isActive, isValidTarget, isHovered) {
            if (this.isDead) {
                if (this.deathAnimProgress === undefined) this.deathAnimProgress = 0;
                if (this.deathAnimProgress < 1.0) this.deathAnimProgress += 0.05;
                else return;
            }

            ctx.save();
            const x = this.x; const y = this.y; const w = this.width; const h = this.height;

            if (!this._avatarLayersLoaded) {
                this._avatarLayersLoaded = [];
                try {
                    const paths = getLayersFromHTML(this);
                    paths.forEach(src => {
                        const img = new Image();
                        img.onload = () => { this._avatarLayersLoaded.push(img); };
                        img.src = src;
                    });
                } catch (e) {
                    console.error("Ошибка ленивой загрузки слоев аватара:", e);
                }
            }

            if (this._avatarLayersLoaded && this._avatarLayersLoaded.length > 0) {
                const scaleX = 1.75; const scaleY = 1.75; const offsetX = -10; const offsetY = 0;   
                const drawW = w * scaleX; const drawH = h * scaleY;
                const drawX = x + (w - drawW) / 2 + offsetX + (this.offsetX || 0);
                const drawY = y - drawH + offsetY;

                if (!this._offscreenCanvas) {
                    this._offscreenCanvas = document.createElement('canvas');
                    this._offscreenCtx = this._offscreenCanvas.getContext('2d');
                }
                this._offscreenCanvas.width = drawW; this._offscreenCanvas.height = drawH;
                this._offscreenCtx.clearRect(0, 0, drawW, drawH);

                this._avatarLayersLoaded.forEach(img => {
                    if (img.complete) this._offscreenCtx.drawImage(img, 0, 0, drawW, drawH);
                });

                if (this.isDead) {
                    const prog = this.deathAnimProgress; ctx.globalAlpha = Math.max(0, 1 - prog);
                    const centerX = drawX + drawW / 2; const centerY = drawY + drawH;
                    ctx.translate(centerX, centerY); ctx.rotate(-Math.PI / 2 * prog); ctx.translate(-centerX, -centerY);
                }

                let shadowColor = null; let shadowBlur = 0;
                if (!this.isDead) {
                    if (isActive) {
                        shadowColor = isHovered ? '#00f0ff' : '#ffbf00'; shadowBlur = isHovered ? 28 : 24; 
                    } else if (isValidTarget) {
                        shadowColor = '#4affab'; shadowBlur = isHovered ? 25 : 15; 
                    } else if (isHovered) {
                        shadowColor = '#ffffff'; shadowBlur = 15;
                    }
                }
                if (shadowColor) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; }
                ctx.drawImage(this._offscreenCanvas, drawX, drawY);
            } else {
                if (!this.isDead) {
                    ctx.fillStyle = isActive ? "rgba(255, 191, 0, 0.4)" : "rgba(74, 144, 226, 0.3)";
                    ctx.fillRect(x, y - h, w, h);
                }
            }
            ctx.restore();
        };

        Adventurer.prototype.drawUI = function(ctx, expectedDmg = 0, expectedStamina = 0) {
            if (typeof this.x === 'undefined' || typeof this.y === 'undefined' || this.isDead) return;
            ctx.save();
            const x = this.x; const y = this.y; const w = this.width;
            const maxHp = this.maxHp || 50; const maxStam = this.maxStamina || 50;
            const barW = 75; const barH = 5; const barX = x + (w - barW) / 2; const barY = y + 10; 

            ctx.fillStyle = '#1e1a15'; ctx.fillRect(barX, barY, barW, barH);
            const hpPct = Math.max(0, Math.min(1, this.hp / maxHp));
            ctx.fillStyle = '#ff4444'; ctx.fillRect(barX, barY, barW * hpPct, barH);

            if (expectedDmg > 0) {
                const dmgPct = Math.min(this.hp, expectedDmg) / maxHp;
                ctx.fillStyle = 'rgba(255, 191, 0, 0.85)';
                ctx.fillRect(barX + (barW * hpPct) - (barW * dmgPct), barY, barW * dmgPct, barH);
            }

            ctx.fillStyle = '#1e1a15'; ctx.fillRect(barX, barY + 8, barW, barH);
            const stamPct = Math.max(0, Math.min(1, this.stamina / maxStam));
            ctx.fillStyle = '#4affab'; ctx.fillRect(barX, barY + 8, barW * stamPct, barH);

            if (expectedStamina > 0) {
                const stamUsagePct = Math.min(this.stamina, expectedStamina) / maxStam;
                ctx.fillStyle = 'rgba(180, 40, 40, 0.9)';
                ctx.fillRect(barX + (barW * stamPct) - (barW * stamUsagePct), barY + 8, barW * stamUsagePct, barH);
            } else if (expectedStamina < 0) {
                const addedPct = Math.min(maxStam - this.stamina, Math.abs(expectedStamina)) / maxStam;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(barX + (barW * stamPct), barY + 8, barW * addedPct, barH);
            }

            this.effectHitboxes = [];
            if (this.activeEffects && this.activeEffects.length > 0) {
                const iconSize = 14; const gap = 3;
                const totalW = (this.activeEffects.length * iconSize) + ((this.activeEffects.length - 1) * gap);
                let startIconX = x + (w - totalW) / 2; let startIconY = barY + 18;
                const emojiMap = {
                    'swarm': '🐝', 'mites': '🐜', 'dot': '🩸', 'speed': '⚡', 'daze': '🌀',
                    'stun': '💫', 'armor': '🛡️', 'dodge': '💨', 'power': '💪', 'weakness': '🩹',
                    'mark': '🎯', 'block': '🧱', 'taunt': '🗣️'
                };

                this.activeEffects.forEach((eff, idx) => {
                    const iconX = startIconX + idx * (iconSize + gap); const iconY = startIconY;
                    this.effectHitboxes.push({ x: iconX, y: iconY, width: iconSize, height: iconSize, data: eff });
                    ctx.fillStyle = 'rgba(10, 8, 6, 0.85)'; ctx.strokeStyle = '#ffbf00'; ctx.lineWidth = 1;
                    ctx.fillRect(iconX, iconY, iconSize, iconSize); ctx.strokeRect(iconX, iconY, iconSize, iconSize);

                    const emoji = emojiMap[eff.base.id.toLowerCase()] || '❓';
                    ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(emoji, iconX + iconSize/2, iconY + iconSize/2 + 1);

                    if (eff.count > 1) {
                        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
                        ctx.fillText(eff.count, iconX + iconSize, iconY + iconSize + 1);
                    }
                });
            }
            ctx.restore();
        };

        Adventurer.prototype.isClicked = function(mx, my) {
            return mx >= this.x && mx <= this.x + this.width && my >= this.y - this.height && my <= this.y;
        };

        const originalUnitDrawBody = Unit.prototype.drawBody;
        Unit.prototype.drawBody = function(ctx, isActive, isValidTarget, isHovered) {
            if (this.isDead) {
                if (this.deathAnimProgress === undefined) this.deathAnimProgress = 0;
                if (this.deathAnimProgress < 1.0) this.deathAnimProgress += 0.05;
                else return;
            }
            ctx.save();
            if (this.isDead) {
                const prog = this.deathAnimProgress; ctx.globalAlpha = Math.max(0, 1 - prog);
                const centerX = this.x + this.width / 2; const centerY = this.y; 
                ctx.translate(centerX, centerY); ctx.rotate(Math.PI / 2 * prog); ctx.translate(-centerX, -centerY);
            }
            originalUnitDrawBody.call(this, ctx, isActive, isValidTarget, isHovered);
            ctx.restore();
        };

        const originalUnitTakeDamage = Unit.prototype.takeDamage;
        Unit.prototype.takeDamage = function(amount) {
            originalUnitTakeDamage.call(this, amount);
            if (!this.isDead) this.offsetX = this.side === 'player' ? -20 : 20;
        };

        if (Adventurer.prototype.takeDamage) {
            const originalAdvTakeDamage = Adventurer.prototype.takeDamage;
            Adventurer.prototype.takeDamage = function(amount) {
                originalAdvTakeDamage.call(this, amount);
                if (!this.isDead) this.offsetX = this.side === 'player' ? -20 : 20;
            };
        }
    }
};
