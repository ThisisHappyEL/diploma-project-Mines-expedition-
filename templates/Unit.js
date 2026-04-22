import { EFFECTS } from './effects.js';

export class Unit {
    constructor(config) {
        this.name = config.name;
        this.side = config.side; 
        this.posIdx = config.posIdx; 
        this.hp = config.hp;
        this.maxHp = config.maxHp || config.hp;
        
        this.x = this.side === 'player' ? -100 : 1100; 
        this.y = 250;
        this.width = 80;
        this.height = 120;
        this.targetX = 0; 
        this.offsetX = 0; // Для рывков при атаке/уроне
        
        this.isDead = false;
        this.skills = config.skills || []; // Для врагов
        this.activeEffects = []; // Хранилище жетонов
    }

    // Добавление эффекта
    addEffect(effectConfig, count = 1) {
        // Проверка: Ошеломление + Слабость = Оглушение
        if (effectConfig.id === 'weakness' && this.hasEffect('daze')) {
            this.removeEffect('daze'); this.addEffect(EFFECTS.STUN); return;
        }
        if (effectConfig.id === 'daze' && this.hasEffect('weakness')) {
            this.removeEffect('weakness'); this.addEffect(EFFECTS.STUN); return;
        }

        // Добавляем эффект в массив (если он уже есть, можно либо стакать, либо обновлять duration - пока стакаем как жетоны)
        for (let i = 0; i < count; i++) {
            this.activeEffects.push({ ...effectConfig });
        }
        return `Получил: ${effectConfig.name}`;
    }

    // Проверка наличия эффекта
    hasEffect(effectId) {
        return this.activeEffects.some(e => e.id === effectId);
    }

    // Удаление одного жетона эффекта (например, после удара снимается 1 Уклонение)
    removeEffect(effectId) {
        const index = this.activeEffects.findIndex(e => e.id === effectId);
        if (index > -1) {
            this.activeEffects.splice(index, 1);
            return true;
        }
        return false;
    }

    // Очистка эффектов в начале/конце хода (для DOT-ов)
    tickEffects() {
        // Собираем список уникальных ID эффектов, которые есть на юните
        const currentIds = [...new Set(this.activeEffects.map(e => e.id))];
        
        currentIds.forEach(id => {
            const effect = this.activeEffects.find(e => e.id === id);
            // Если эффект имеет пометку duration (т.е. он временный, а не триггерный как Блок)
            if (effect && effect.duration !== undefined) {
                this.removeEffect(id);
            }
        });
    }

    takeDamage(amt) {
        this.hp -= amt;
        this.offsetX = this.side === 'player' ? -20 : 20; // Отшатывается назад
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    update() {
        if (this.isDead) return;
        const baseX = 500;
        const spacing = 110;
        if (this.side === 'player') {
            this.targetX = baseX - 40 - (this.posIdx * spacing);
        } else {
            this.targetX = baseX + 40 + ((this.posIdx - 1) * spacing);
        }
        
        this.x += (this.targetX - this.x) * 0.1;
        this.offsetX *= 0.8; // Затухание рывка
    }

    draw(ctx, isSelected, isPotentialTarget = false) { // Добавили аргумент сюда!
        if (this.isDead) return;
        const drawX = this.x + this.offsetX;

        // 1. ПОДСВЕТКА (Аура)
        if (isPotentialTarget) {
            ctx.save(); // Сохраняем состояние контекста
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.side === 'player' ? '#4aa3df' : '#ff4444';
            ctx.strokeStyle = this.side === 'player' ? '#4aa3df' : '#ff4444';
            ctx.lineWidth = 4;
            ctx.strokeRect(drawX - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.restore(); // Возвращаем назад (убирает тени для остальных)
        }

        // 2. ТЕНЬ
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width/2, this.y + this.height, 40, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. ТЕЛО
        ctx.fillStyle = this.side === 'player' ? '#4a90e2' : '#e24a4a';
        ctx.strokeStyle = isSelected ? '#ffbf00' : '#fff';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.fillRect(drawX, this.y, this.width, this.height);
        ctx.strokeRect(drawX, this.y, this.width, this.height);

        // 4. ПОЛОСКА ЗДОРОВЬЯ
        ctx.fillStyle = '#333';
        ctx.fillRect(drawX, this.y - 15, this.width, 6);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(drawX, this.y - 15, this.width * (this.hp / this.maxHp), 6);
        
        // 5. ИМЯ
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.name} [P${this.posIdx}]`, drawX, this.y - 25);

        // 6. ЭФФЕКТЫ (Жетоны)
        if (this.activeEffects.length > 0) {
            let effectY = this.y - 45;
            let effectX = drawX;
            let displayEffects = {};
            
            this.activeEffects.forEach(e => {
                if (!displayEffects[e.icon]) displayEffects[e.icon] = 0;
                displayEffects[e.icon]++;
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            for (let [icon, count] of Object.entries(displayEffects)) {
                // Всегда рисуем иконку и количество жетонов под ней
                ctx.fillText(icon, effectX, effectY);
                ctx.font = '10px Arial';
                ctx.fillText(count, effectX + 12, effectY + 5);
                ctx.font = 'bold 16px Arial';
                effectX += 28;
            }
        }
    }

    isClicked(mx, my) {
        if (this.isDead) return false;
        return mx >= this.x && mx <= this.x + this.width &&
               my >= this.y && my <= this.y + this.height;
    }
}