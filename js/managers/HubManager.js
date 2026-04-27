import { GameState } from '../core/GameState.js';
import { BACKGROUNDS } from '../data/backgrounds.js';
import { TRAITS } from '../data/traits.js';

export class HubManager {
    static currentRecruits = [];
    static lastGeneratedCycle = -1;

    static openBuilding(locationData) {
        const ui = document.getElementById('building-ui');
        const desc = document.getElementById('building-description');
        
        ui.classList.remove('hidden'); 
        document.getElementById('building-title').innerText = locationData.name;
        if (desc) desc.innerText = locationData.description || "";

        document.getElementById('building-close-btn').onclick = () => {
            ui.classList.add('hidden');
        };

        this.refreshContent(locationData.id);
    }

    static refreshContent(buildingId) {
        const content = document.getElementById('building-content');
        content.innerHTML = ''; 

        if (buildingId === 'tavern_recruits') {
            this.renderTavern(content);
        } else if (buildingId === 'barracks') {
            this.renderBarracks(content);
        } else if (buildingId === 'cleat') {
            this.renderCleat(content);
        } else {
            content.innerHTML = `<p style="color: #aaa; padding: 20px;">Локация в разработке.</p>`;
        }
    }

    static generateRecruits() {
        if (this.lastGeneratedCycle === GameState.cycle) return;

        this.currentRecruits = []; 
        this.lastGeneratedCycle = GameState.cycle;

        const count = Math.floor(Math.random() * 3) + 2; 
        const names = ["Губерт", "Борс", "Ильза", "Клаус", "Мортимер", "Агата", "Рутгер", "Генрих"];
        const bgKeys = Object.keys(BACKGROUNDS);

        for (let i = 0; i < count; i++) {
            const bgName = bgKeys[Math.floor(Math.random() * bgKeys.length)];
            const bgData = BACKGROUNDS[bgName];
            const randomTrait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

            const recruit = {
                id: Date.now() + i,
                name: names[Math.floor(Math.random() * names.length)],
                background: bgName,
                traits: [randomTrait],
                level: 1,
                combat: (bgData.stats.battle || 0) + (randomTrait.effect.battle || 0),
                mining: (bgData.stats.mining || 0) + (randomTrait.effect.mining || 0),
                research: (bgData.stats.research || 0) + (randomTrait.effect.research || 0),
                building: (bgData.stats.construction || 0) + (randomTrait.effect.construction || 0),
                scouting: (bgData.stats.scouting || 0) + (randomTrait.effect.scouting || 0),
                maxHp: 40 + (bgData.stats.hp || 0) + (randomTrait.effect.hp || 0),
                stamina: 100,
                maxStamina: 100
            };
            recruit.hp = recruit.maxHp;

            const skillSum = recruit.combat + recruit.mining + recruit.research + recruit.building + recruit.scouting;
            recruit.salary = 5 + Math.floor(skillSum / 4);
            
            this.currentRecruits.push(recruit);
        }
    }

    static renderTavern(container) {
        this.generateRecruits();

        if (this.currentRecruits.length === 0) {
            container.innerHTML = `<div style="width:100%; text-align:center; padding: 50px; color: #888;">В этом цикле больше нет желающих...</div>`;
            return;
        }

        this.currentRecruits.forEach((recruit) => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <h3 style="margin:0;">${recruit.name}</h3>
                    <span style="color:#aaa;">ур. ${recruit.level}</span>
                </div>
                <div class="bg-trait">Опыт: ${recruit.background}</div>
                <div class="bg-trait" style="color: #4affab;">${recruit.traits[0].name}</div>
                <div style="font-size:11px; color:#888; margin-bottom:10px;">${recruit.traits[0].desc}</div>
                <div class="stats">
                    <span>⚔️ Бой: ${recruit.combat}</span>
                    <span>⛏️ Добыча: ${recruit.mining}</span>
                    <span>🔍 Разв.: ${recruit.scouting}</span>
                    <span>📚 Изыск: ${recruit.research}</span>
                    <span>🔨 Строй: ${recruit.building}</span>
                    <span style="color:#ff6666">❤️ HP: ${recruit.hp}</span>
                </div>
                <div class="salary">Плата: ${recruit.salary} 🕯️</div>
            `;

            const hireBtn = document.createElement('button');
            hireBtn.className = 'hub-btn action-btn';
            hireBtn.innerText = 'Заключить контракт';
            
            hireBtn.onclick = () => this.hireRecruit(recruit);

            card.appendChild(hireBtn);
            container.appendChild(card);
        });
    }

    static hireRecruit(recruit) {
        GameState.roster.push(recruit);
        
        this.currentRecruits = this.currentRecruits.filter(r => r.id !== recruit.id);
        
        GameState.updateTopBarUI();
        this.refreshContent('tavern_recruits');
    }

    static renderBarracks(container) {
        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px;">В казармах пусто. Только эхо и пустые койки.</p>';
            return;
        }

        GameState.roster.forEach(adv => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <h3 style="margin:0;">${adv.name}</h3>
                    <span style="color:#aaa;">ур. ${adv.level}</span>
                </div>
                <div class="bg-trait">Предыстория: ${adv.background}</div>
                <div class="bg-trait" style="color: #4affab;">Особенность: ${adv.traits[0].name}</div>
                <div style="font-size:11px; color:#888; margin-bottom:10px;">${adv.traits[0].desc}</div>
                
                <div class="stats">
                    <span>⚔️ Бой: ${adv.combat}</span>
                    <span>⛏️ Добыча: ${adv.mining}</span>
                    <span>🔍 Разв.: ${adv.scouting}</span>
                    <span>📚 Изыск: ${adv.research}</span>
                    <span>🔨 Строй: ${adv.building}</span>
                    <span style="color:#ff6666">❤️ HP: ${adv.hp}/${adv.maxHp}</span>
                    <span style="color:#66ff66">💨 Сил: ${adv.stamina}/${adv.maxStamina}</span>
                </div>
                
                <div class="salary" style="border-top: 1px solid #444; padding-top:10px; margin-top:10px;">
                    Содержание: ${adv.salary} 🕯️
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    static renderCleat(container) {
        if (GameState.roster.length === 0) {
            container.innerHTML = '<p style="padding:20px;">Некого отправлять в бездну. Наймите людей в Потоке авантюристов.</p>';
            return;
        }

        container.style.flexDirection = 'column';
        container.innerHTML = `
            <div id="squad-info" style="background: rgba(255,191,0,0.1); padding: 15px; border: 1px solid #ffbf00; margin-bottom: 20px; width: 100%; box-sizing: border-box;">
                Укомплектованность отряда: <b>${GameState.currentSquad.length} / 4</b>
                <p style="font-size: 12px; margin: 5px 0 0 0;">Выберите от 1 до 4 специалистов для спуска в текущую пещеру.</p>
            </div>
            <div id="cleat-list" style="display: flex; flex-wrap: wrap; gap: 15px;"></div>
            <div style="margin-top: 20px; width: 100%; text-align: center;">
                <button id="start-expedition-btn" class="hub-btn action-btn" 
                    ${GameState.currentSquad.length === 0 ? 'disabled' : ''} 
                    style="font-size: 20px; padding: 20px; width: 400px;">
                    Спустить Клеть
                </button>
            </div>
        `;

        const listContainer = document.getElementById('cleat-list');

        GameState.roster.forEach(adv => {
            const isInSquad = GameState.currentSquad.some(s => s.id === adv.id);
            
            const card = document.createElement('div');
            card.className = 'char-card';
            if (isInSquad) card.style.borderColor = '#ffbf00';
            if (isInSquad) card.style.background = '#3d352e';

            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <h3 style="margin:0;">${adv.name}</h3>
                    <span>${isInSquad ? '✅' : ''}</span>
                </div>
                <div class="bg-trait">${adv.background}</div>
                <div class="stats">
                    <span>⚔️ Бой: ${adv.combat}</span>
                    <span>⛏️ Добыча: ${adv.mining}</span>
                    <span>🔍 Разв.: ${adv.scouting}</span>
                    <span style="color:#ff6666">❤️ HP: ${adv.hp}</span>
                </div>
            `;

            card.onclick = () => this.toggleSquadMember(adv, container);
            listContainer.appendChild(card);
        });

        document.getElementById('start-expedition-btn').onclick = () => {
            if (GameState.currentSquad.length > 0) {
                document.getElementById('building-ui').classList.add('hidden');
                import('../core/SceneManager.js').then(m => {
                    import('../scenes/ExploreScene.js').then(e => {
                        m.SceneManager.changeScene(e.ExploreScene);
                    });
                });
            }
        };
    }

    static toggleSquadMember(adv, container) {
        const index = GameState.currentSquad.findIndex(s => s.id === adv.id);
        
        if (index > -1) {
            GameState.currentSquad.splice(index, 1);
        } else {
            if (GameState.currentSquad.length < 4) {
                GameState.currentSquad.push(adv);
            } else {
                alert("В Клети всего 4 посадочных места!");
            }
        }
        
        this.renderCleat(container);
    }
}