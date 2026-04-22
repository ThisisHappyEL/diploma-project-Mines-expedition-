import { EFFECTS } from './effects.js';

export class BattleManager {
    constructor(units, uiCallback) {
        this.units = units;
        this.turnIndex = 0;
        this.state = 'IDLE'; 
        this.selectedSkill = null;
        this.uiCallback = uiCallback; 
        this.logPanel = document.getElementById('log-panel');
        this.state = 'IDLE'; // IDLE, SELECT_TARGET, SELECT_MOVE, EXECUTING
    }

    log(msg) {
        this.logPanel.innerHTML = `<div style="margin-bottom: 4px;">> ${msg}</div>` + this.logPanel.innerHTML;
    }

    selectMoveAction() {
        this.state = 'SELECT_MOVE';
        this.log("Выберите союзника для смены позиции.");
        // Обновляем UI, чтобы кнопки стали неактивны/подсветились
    }

    getActiveUnit() {
        return this.units[this.turnIndex];
    }

    startBattle() {
        this.log("Бой начинается!");
        this.startTurn();
    }

    startTurn() {
        let active = this.getActiveUnit();
        if (active.isDead) { this.nextTurn(); return; }

        if (active.hasEffect('stun')) {
            this.log(`${active.name.toUpperCase()} ОГЛУШЕН И ПРОПУСКАЕТ ХОД!`);
            active.removeEffect('stun'); // Снимаем эффект после пропуска хода
            
            // Визуально показываем пропуск хода
            window.spawnDamageText("ПРОПУСК ХОДА", active.x, active.y - 60, "#aaa");
            
            setTimeout(() => this.nextTurn(), 1200);
            return; // Выходим из функции, не рисуя кнопки и не давая ходить
        }

        const bleedStacks = active.activeEffects.filter(e => e.id === 'bleed').length;
        if (bleedStacks > 0) {
            const totalBleedDmg = 2;
            active.takeDamage(totalBleedDmg);
            window.spawnDamageText(`-${totalBleedDmg}`, active.x + 20, active.y - 20, '#ff6666');
            this.log(`${active.name} истекает кровью: -${totalBleedDmg} (Жетонов: ${bleedStacks})`);
        }
        
        // Уменьшаем длительность эффектов
        active.tickEffects();

        this.log(`--- ХОД: ${active.name.toUpperCase()} ---`);
        this.state = 'IDLE';
        this.selectedSkill = null;

        // Перерисовываем UI
        this.uiCallback(active, active.side === 'player' ? active.getAvailableSkills() : [], this);

        if (active.side === 'enemy') {
            setTimeout(() => this.enemyTurn(active), 500);
        }
    }

    autoShiftUnits() {
        const sides = ['player', 'enemy'];
        
        sides.forEach(side => {
            // Берем всех живых с одной стороны и сортируем по текущей позиции
            let aliveUnits = this.units
                .filter(u => u.side === side && !u.isDead)
                .sort((a, b) => a.posIdx - b.posIdx);

            // Переназначаем им позиции по порядку (1, 2, 3...)
            aliveUnits.forEach((unit, index) => {
                const newPos = index + 1;
                if (unit.posIdx !== newPos) {
                    unit.posIdx = newPos;
                    // Не пишем в лог, чтобы не спамить, это происходит "естественно"
                }
            });
        });
    }

    selectSkill(skill) {
        let active = this.getActiveUnit();
        this.selectedSkill = skill;
        
        // Если навык применяется на себя (например, Ферзеццен)
        if (skill.targetSelf) {
            this.log(`${active.name} применяет ${skill.name} на себя.`);
            this.executeSkill(active, active);
            return;
        }

        this.state = 'SELECT_TARGET';
        this.log(`Выбран навык: ${skill.name}. Выберите цель!`);
    }

    handleCanvasClick(targetUnit) {
        let active = this.getActiveUnit();

        // ЛОГИКА АТАКИ
        if (this.state === 'SELECT_TARGET' && this.selectedSkill) {
            if (!this.selectedSkill.targetPos.includes(targetUnit.posIdx) || targetUnit.side === active.side) return;
            this.executeSkill(active, targetUnit);
        } 
        // ЛОГИКА ДВИЖЕНИЯ
        else if (this.state === 'SELECT_MOVE') {
            if (targetUnit.side !== active.side || targetUnit === active) return;
            this.performBasicMove(targetUnit);
        }
    }

    // Универсальная функция выполнения навыка
    executeSkill(attacker, target) {
        this.state = 'EXECUTING';
        this.uiCallback(attacker, [], this);

        let skill = this.selectedSkill;
        let baseDmg = attacker.equipment?.rightHand?.baseDamage || 10;
        attacker.offsetX = attacker.side === 'player' ? 30 : -30; 

        let finalDmg = Math.round(baseDmg * skill.damageCoef);
        
        // 1. ПРОВЕРКА УКЛОНЕНИЯ
        if (target.hasEffect('dodge') && !skill.effect?.includes('Игнор уклонения')) {
            target.removeEffect('dodge');
            this.log(`${target.name} уклонился от атаки!`);
            this.finalizeSkill(attacker, target, skill);
            return; 
        }

        if (skill.effect?.includes('Игнор уклонения')) {
            target.removeEffect('dodge');
        }

        // 3. ПРОВЕРКА АТАКУЮЩЕГО
        if (attacker.hasEffect('weakness')) {
            finalDmg = Math.floor(finalDmg / 2);
            attacker.removeEffect('weakness');
            this.log(`Атака ослаблена (Слабость).`);
        }
        if (attacker.hasEffect('power')) {
            finalDmg = finalDmg * 2;
            attacker.removeEffect('power');
            this.log(`Мощный удар! (Сила).`);
        }

        // 4. ПРОВЕРКА ЗАЩИТНИКА
        if (target.hasEffect('block') && !skill.effect?.includes('Игнор брони')) {
            finalDmg = Math.floor(finalDmg / 2);
            target.removeEffect('block');
            this.log(`${target.name} блокирует часть урона!`);
        }
        if (target.hasEffect('vulnerable')) {
            finalDmg = finalDmg * 2;
            target.removeEffect('vulnerable');
            this.log(`${target.name} получает двойной урон (Уязвимость)!`);
        }

        if (attacker.hasEffect('weakness')) {
            finalDmg = Math.floor(finalDmg * 0.5); 
            attacker.removeEffect('weakness'); // Снимаем только 1 жетон!
            this.log(`Атака ослаблена! Текущий урон: ${finalDmg}`);
        }

        // --- СИЛА (Модификатор 2.0) ---
        if (attacker.hasEffect('power')) {
            finalDmg = Math.floor(finalDmg * 2.0);
            attacker.removeEffect('power');
            this.log(`Удар усилен силой! Текущий урон: ${finalDmg}`);
        }

        // --- УЯЗВИМОСТЬ (Цель получает x2 урона) ---
        if (target.hasEffect('vulnerable')) {
            finalDmg = Math.floor(finalDmg * 2.0);
            target.removeEffect('vulnerable');
            this.log(`Цель уязвима! Получаемый урон: ${finalDmg}`);
        }

        // --- БЛОК (Цель получает 0.5 урона) ---
        if (target.hasEffect('block') && !skill.effect?.includes('Игнор брони')) {
            finalDmg = Math.floor(finalDmg * 0.5);
            target.removeEffect('block');
            this.log(`Удар заблокирован! Урон снижен до: ${finalDmg}`);
        }

        let totalDmg = finalDmg * (skill.hits || 1);

        // 5. НАНЕСЕНИЕ УРОНА
        if (skill.isAoE) {
            this.units.filter(u => u.side !== attacker.side && !u.isDead && skill.targetPos.includes(u.posIdx))
                .forEach(u => {
                    u.takeDamage(finalDmg);
                    window.spawnDamageText(`-${finalDmg}`, u.x + 20, u.y - 20, '#ff4444');
                });
        } else if (skill.damageCoef > 0) {
            target.takeDamage(totalDmg);
            window.spawnDamageText(`-${totalDmg}`, target.x + 20, target.y - 20, '#ff4444');
            this.log(`${attacker.name} использует ${skill.name}. Урон: ${totalDmg}.`);
        } else if (skill.targetSelf) {
            window.spawnDamageText(`+${skill.name.toUpperCase()}`, attacker.x, attacker.y - 40, '#4affab');
        } // <--- ВОТ ЭТА СКОБКА БЫЛА ПРОПУЩЕНА!

        // 6. НАЛОЖЕНИЕ ЭФФЕКТОВ
        if (skill.effect) {
            this.applySkillEffects(target, skill.effect);
        }

        // 7. ПАРРИРОВАНИЕ
        if (target.hasEffect('parry') && !skill.effect?.includes('Снятие паррирования') && attacker !== target) {
            target.removeEffect('parry');
            this.log(`[Паррирование!] ${target.name} бьет в ответ!`);
            let counterDmg = target.equipment?.rightHand?.baseDamage || 10;
            attacker.takeDamage(counterDmg);
            window.spawnDamageText(`-${counterDmg}`, attacker.x + 20, attacker.y - 20, '#ffbb00');
        }

        this.finalizeSkill(attacker, target, this.selectedSkill);
    }

    // Вспомогательная функция (чтобы код executeSkill не был бесконечным)
    applySkillEffects(target, effectString) {
        // Добавляем распознавание Кровотечения
        if (effectString.includes('Кровотечение')) {
            target.addEffect(EFFECTS.BLEED, 3);
        }
        if (effectString.includes('Ошеломление')) target.addEffect(EFFECTS.DAZE);
        if (effectString.includes('Слабость')) target.addEffect(EFFECTS.WEAKNESS);
        if (effectString.includes('Паррирование (2)')) {
            target.addEffect(EFFECTS.PARRY); // Добавляем 2 жетона
            target.addEffect(EFFECTS.PARRY);
        }
        this.log(`[Эффект] Наложен: ${effectString}`);
    }

    finalizeSkill(attacker, target, skill) {
        if (skill.moveSelf) this.moveUnit(attacker, skill.moveSelf);
        if (skill.moveTarget && target !== attacker) this.moveUnit(target, skill.moveTarget);
        
        this.state = 'IDLE';
        this.selectedSkill = null;
        setTimeout(() => this.nextTurn(), 500);
    }

    performBasicMove(targetAlly) {
        let active = this.getActiveUnit();
        this.state = 'EXECUTING';
        
        // Свапаем позиции
        let oldActivePos = active.posIdx;
        active.posIdx = targetAlly.posIdx;
        targetAlly.posIdx = oldActivePos;

        this.log(`${active.name} поменялся местами с ${targetAlly.name}`);
        
        this.uiCallback(null, [], this); // Прячем кнопки
        setTimeout(() => this.nextTurn(), 400);
    }

    // Логика перемещения (свап позиций)
    moveUnit(unit, offset) {
        let newPos = unit.posIdx + offset;
        if (newPos < 1) newPos = 1;
        if (newPos > 4) newPos = 4;

        if (newPos !== unit.posIdx) {
            let occupier = this.units.find(u => u.side === unit.side && u.posIdx === newPos && !u.isDead);
            if (occupier) {
                occupier.posIdx = unit.posIdx; 
                this.log(`${occupier.name} сдвинут на позицию ${occupier.posIdx}`);
            }
            unit.posIdx = newPos;
            this.log(`${unit.name} перемещается на позицию ${unit.posIdx}`);
        }
    }

    enemyTurn(enemy) {
        this.state = 'EXECUTING';
        let skill = enemy.skills[0]; 
        enemy.offsetX = -30; 
        
        let target = this.units.find(u => u.side === 'player' && !u.isDead);
        if (target) {
            target.takeDamage(skill.damage);
            window.spawnDamageText(`-${skill.damage}`, target.x + 20, target.y - 20, '#ff4444');
            this.log(`${enemy.name} кусает ${target.name} на ${skill.damage} урона!`);
        }
        setTimeout(() => this.nextTurn(), 1000);
    }

    nextTurn() {
        // Сначала смыкаем ряды
        this.autoShiftUnits();

        this.turnIndex++;
        if (this.turnIndex >= this.units.length) {
            this.turnIndex = 0; 
        }
        
        let playersAlive = this.units.filter(u => u.side === 'player' && !u.isDead).length;
        let enemiesAlive = this.units.filter(u => u.side === 'enemy' && !u.isDead).length;

        if (playersAlive === 0) {
            this.log("ОТРЯД ПОГИБ...");
            return; 
        } else if (enemiesAlive === 0) {
            this.log("ПОБЕДА! Враги повержены.");
            return; 
        }

        this.startTurn();
    }
}