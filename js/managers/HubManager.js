import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { ExploreScene } from '../scenes/ExploreScene.js';
import { BACKGROUNDS } from '../data/workersData/backgrounds.js';
import { TRAITS } from '../data/workersData/traits.js';
import { NAMES_DATA } from '../data/workersData/names.js';
import { STARTING_CLOTHES } from '../data/workersData/outfit.js';

const STAT_ICONS = { hp: '❤️', stamina: '💨', battle: '⚔️', mining: '⛏️', research: '📚', construction: '🔨', scouting: '🪔' };
const STAT_LABELS = { hp: 'Здоровье', stamina: 'Выносливость', battle: 'Бой', mining: 'Добыча', research: 'Изыскания', construction: 'Стройка', scouting: 'Разведка' };
const STAT_DESCRIPTIONS = {
    hp: 'Здоровье - Чем его больше, тем больше трав и урона может понести погруженец',
    stamina: 'Выносливость - Расходуется на любые виды работ и боевые навыки',
    battle: 'Бой - Влияет на то, насколько хорошо боец наносит и держит удары',
    mining: 'Добыча - Влияет на скорость и качество добычи ресурсов',
    research: 'Изыскания - Влияет на скорость исследований и понимание механизмов',
    construction: 'Строительство - Влияет на качество и безопасность постройки конструкций',
    scouting: 'Разведка - Влияет на обнаружение новых участков пещер и ловушек'
};

export class HubManager {
    static currentRecruits = [];
    static lastGeneratedCycle = -1;
    static inspectedAdv = null; 
    static selectedSlot = null; 
    static warehouseTab = 'all';

    static showTooltip(e, text) {
        const tooltip = document.getElementById('custom-tooltip');
        tooltip.innerHTML = text; tooltip.style.display = 'block';
        let x = e.pageX + 15, y = e.pageY + 15;
        if (x + tooltip.offsetWidth > window.innerWidth) x = window.innerWidth - tooltip.offsetWidth - 10;
        tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
    }
    static hideTooltip() { document.getElementById('custom-tooltip').style.display = 'none'; }
    static getEncodedTooltip(html) { return btoa(unescape(encodeURIComponent(html))); }
    static showEncodedTooltip(e, encodedHtml) { this.showTooltip(e, decodeURIComponent(escape(atob(encodedHtml)))); }

    static openBuilding(locationData) {
        const ui = document.getElementById('building-ui');
        ui.classList.remove('hidden'); 
        document.getElementById('building-title').innerText = locationData.name;
        document.getElementById('building-description').innerText = locationData.description || "";
        document.getElementById('building-close-btn').onclick = () => ui.classList.add('hidden');
        this.refreshContent(locationData.id);
    }

    static refreshContent(buildingId) {
        const content = document.getElementById('building-content');
        content.innerHTML = ''; 
        content.style.display = 'flex';
        content.style.flexDirection = 'row'; 

        if (buildingId === 'tavern_recruits' || buildingId === 'tavern') this.renderTavern(content);
        else if (buildingId === 'barracks') this.renderBarracks(content);
        else if (buildingId === 'cleat') this.renderCleat(content);
        else if (buildingId === 'warehouse') this.renderWarehouse(content);
    }

    static getStat(adv, statName) {
        let val = adv.pureStats[statName] || 0;
        adv.traits.forEach(t => { if (t.effect && t.effect[statName]) val += t.effect[statName]; });
        if (adv.equipment.body && adv.equipment.body.stats && adv.equipment.body.stats[statName]) val += adv.equipment.body.stats[statName];
        else if (!adv.equipment.body && adv.civilBody && adv.civilBody.effect && adv.civilBody.effect[statName]) val += adv.civilBody.effect[statName];
        return Math.max(0, val);
    }

    static getStatTooltip(adv, statName) {
        let pure = adv.pureStats[statName] || 0;
        let traitBonus = 0; adv.traits.forEach(t => { if (t.effect && t.effect[statName]) traitBonus += t.effect[statName]; });
        let gearBonus = 0;
        if (adv.equipment.body && adv.equipment.body.stats && adv.equipment.body.stats[statName]) gearBonus = adv.equipment.body.stats[statName];
        else if (!adv.equipment.body && adv.civilBody && adv.civilBody.effect && adv.civilBody.effect[statName]) gearBonus = adv.civilBody.effect[statName];
        
        let total = pure + traitBonus + gearBonus;
        return `<b>${STAT_ICONS[statName]} ${STAT_LABELS[statName]}: ${total}</b><br><span style='color:#aaa; font-size: 11px;'>${STAT_DESCRIPTIONS[statName]}</span><br><br>Врождённое: ${pure}<br>Черты: ${traitBonus}<br>Снаряжение: ${gearBonus}`;
    }

    static getStatColor(adv, statName, showColors) {
        if (!showColors) return "#e0d8c3";
        const bgData = BACKGROUNDS[adv.background];
        if (!bgData || !bgData.stats[statName]) return "#e0d8c3";
        const [min, max] = bgData.stats[statName];
        const val = adv.pureStats[statName];
        if (min === max) return "#e0d8c3";
        const step = (max - min) / 4;
        if (val <= min) return "#ff4444";
        if (val <= min + step) return "#ffaa44";
        if (val <= max - step) return "#e0d8c3";
        if (val < max) return "#aaffaa";
        return "#4affab";
    }

    static generateRecruits() {
        if (this.lastGeneratedCycle === GameState.cycle) return;
        this.currentRecruits = []; 
        this.lastGeneratedCycle = GameState.cycle;

        const bgKeys = Object.keys(BACKGROUNDS);
        
        const roll = (range, statName, bgName) => {
            if (!range || !Array.isArray(range) || range.length < 2) {
                console.warn(`ВНИМАНИЕ: У предыстории "${bgName}" не найден или неверно описан стат "${statName}". Использовано дефолтное значение 10.`);
                return 10; 
            }
            return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        };

        const count = Math.floor(Math.random() * 3) + 2; 

        for (let i = 0; i < count; i++) {
            const bgName = bgKeys[Math.floor(Math.random() * bgKeys.length)];
            const bgData = BACKGROUNDS[bgName];
            if (!bgData) continue;

            const gender = Math.random() > 0.5 ? 'm' : 'f';

            let legalTraits = TRAITS.filter(t => !t.neverIn || !t.neverIn.some(f => bgData.category.includes(f)));
            let chosenTraits = [legalTraits[Math.floor(Math.random() * legalTraits.length)]];

            let nameCat = "common";
            if (bgData.category.includes("Элита") || bgData.category.includes("умс. труд")) nameCat = "elite";
            else if (bgData.category.includes("боев. труд")) nameCat = "martial";
            else if (bgData.category.includes("Маргинал") || bgData.category.includes("Незаконный")) nameCat = "outcast";
            
            const fNamePool = NAMES_DATA.firstNames[nameCat][gender];
            const firstName = fNamePool[Math.floor(Math.random() * fNamePool.length)];
            
            const lNamePool = NAMES_DATA.traitNicknames[chosenTraits[0].name] || NAMES_DATA.genericNicknames;
            const lastName = lNamePool[Math.floor(Math.random() * lNamePool.length)][gender];

            const clothesPool = Object.entries(STARTING_CLOTHES).filter(([k, v]) => v.category.some(c => bgData.category.includes(c)));
            const rndClothEntry = clothesPool.length > 0 ? clothesPool[Math.floor(Math.random() * clothesPool.length)] : null;
            const civilBody = rndClothEntry ? { name: rndClothEntry[0], ...rndClothEntry[1] } : null;

            let pureStats = {
                hp: roll(bgData.stats.hp, 'hp', bgName),
                stamina: roll(bgData.stats.stamina, 'stamina', bgName),
                battle: roll(bgData.stats.battle, 'battle', bgName),
                mining: roll(bgData.stats.mining, 'mining', bgName),
                research: roll(bgData.stats.research, 'research', bgName),
                construction: roll(bgData.stats.construction, 'construction', bgName),
                scouting: roll(bgData.stats.scouting, 'scouting', bgName)
            };

            const recruit = {
                id: Date.now() + i,
                name: `${firstName} ${lastName}`,
                gender,
                background: bgName,
                traits: chosenTraits,
                pureStats,
                civilBody,
                equipment: { leftHand: null, rightHand: null, body: null },
                level: 1,
                salary: bgData.salary + Math.floor((pureStats.battle + pureStats.mining) / 5)
            };

            recruit.hp = this.getStat(recruit, 'hp');
            recruit.stamina = this.getStat(recruit, 'stamina');
            
            this.currentRecruits.push(recruit);
        }
    }

    static getItemTooltip(item) {
        if (!item) return "";
        let t = `<b>${item.name}</b><br>Тип: ${item.type === 'weapon' ? 'Оружие' : 'Броня'}<br><br>`;
        
        if (item.type === 'weapon') {
            t += `Урон: ${item.baseDamage}<br>Навыки:<br>`;
            if (item.skills) {
                item.skills.forEach(s => t += ` - ${s.name}<br>`);
            }
        } else {
            const stats = item.stats || item.effect || {};
            t += `<span style='color:#aaa; font-size:11px;'>${item.description || ""}</span><br><br>`;
            Object.entries(stats).forEach(([k, v]) => {
                if (v !== 0) t += `${STAT_ICONS[k] || k} +${v}<br>`;
            });
        }
        return this.getEncodedTooltip(t);
    }

    static getCardHTML(adv, isHire = false) {
        const bgData = BACKGROUNDS[adv.background];
        const maxH = this.getStat(adv, 'hp'), maxS = this.getStat(adv, 'stamina');
        const getHov = (s) => `onmousemove="HubManager.showEncodedTooltip(event, '${this.getEncodedTooltip(this.getStatTooltip(adv, s))}')" onmouseout="HubManager.hideTooltip()"`;

        const bgT = `<b>Предыстория: ${adv.background}</b><br>${bgData.description}<br><br>Разброс базы:<br><center>${STAT_ICONS.battle} ${bgData.stats.battle.join('-')}</center><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.mining} ${bgData.stats.mining.join('-')}</span><span>${STAT_ICONS.research} ${bgData.stats.research.join('-')}</span></div><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.construction} ${bgData.stats.construction.join('-')}</span><span>${STAT_ICONS.scouting} ${bgData.stats.scouting.join('-')}</span></div><hr style='border:none; border-bottom:1px solid #444'><div style='display:flex; justify-content:space-between;'><span>${STAT_ICONS.hp} ${bgData.stats.hp.join('-')}</span><span>${STAT_ICONS.stamina} ${bgData.stats.stamina.join('-')}</span></div>`;
        const trT = `<b>Черта: ${adv.traits[0].name}</b><br>${Object.entries(adv.traits[0].effect||{}).map(([k,v])=>v!==0?STAT_ICONS[k]+' '+(v>0?'+'+v:v):'').filter(x=>x!=='').join('<br>')}`;
        
        const weaponAttr = adv.equipment.rightHand ? `style="cursor:help; color:#4affab; border-bottom: 1px dotted" onmousemove="HubManager.showEncodedTooltip(event, '${this.getItemTooltip(adv.equipment.rightHand)}')" onmouseout="HubManager.hideTooltip()"` : `style="color:#555"`;
        const armorItem = adv.equipment.body || adv.civilBody;
        const armorAttr = armorItem ? `style="cursor:help; color:#aaa; border-bottom: 1px dotted" onmousemove="HubManager.showEncodedTooltip(event, '${this.getItemTooltip(armorItem)}')" onmouseout="HubManager.hideTooltip()"` : `style="color:#555"`;

        const weaponLabel = adv.equipment.rightHand ? adv.equipment.rightHand.name : "Нет оружия";
        const armorLabel = armorItem ? armorItem.name : "Лохмотья";

        const rangeData = this.getUnitRangeData(adv);
        const hasRanks = Object.values(rangeData.ranks).some(v => v > 0);
        const rangeWidget = hasRanks ? `<div style="height: 20px; margin-bottom: 5px;">${this.getRangeHTML(rangeData.ranks, rangeData.targets)}</div>` : "";

        return `
            <div class="char-card-header">
                <div style="display:flex; justify-content:space-between;"><h3>${adv.name}</h3><span style="color:#aaa; font-size:12px;">ур. ${adv.level}</span></div>
                <div style="margin-top:5px; font-size:13px;"><span style="cursor:help; border-bottom: 1px dotted #888;" onmousemove="HubManager.showEncodedTooltip(event, '${this.getEncodedTooltip(bgT)}')" onmouseout="HubManager.hideTooltip()">${adv.background}</span> | <span style="color:#4affab; cursor:help; border-bottom: 1px dotted #4affab;" onmousemove="HubManager.showEncodedTooltip(event, '${this.getEncodedTooltip(trT)}')" onmouseout="HubManager.hideTooltip()">${adv.traits[0].name}</span></div>
            </div>
            ${rangeWidget}
            <div class="hub-stats-container">
                <div class="hub-stats-center"><div class="hub-stats-item" ${getHov('battle')} style="color:${this.getStatColor(adv,'battle',isHire)}">${STAT_ICONS.battle} ${this.getStat(adv,'battle')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('mining')} style="color:${this.getStatColor(adv,'mining',isHire)}">${STAT_ICONS.mining} ${this.getStat(adv,'mining')}</div><div class="hub-stats-item" ${getHov('research')} style="color:${this.getStatColor(adv,'research',isHire)}">${STAT_ICONS.research} ${this.getStat(adv,'research')}</div></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('construction')} style="color:${this.getStatColor(adv,'construction',isHire)}">${STAT_ICONS.construction} ${this.getStat(adv,'construction')}</div><div class="hub-stats-item" ${getHov('scouting')} style="color:${this.getStatColor(adv,'scouting',isHire)}">${STAT_ICONS.scouting} ${this.getStat(adv,'scouting')}</div></div>
                <div class="hub-stats-divider"></div>
                <div class="hub-stats-row"><div class="hub-stats-item" ${getHov('hp')} style="color:${this.getStatColor(adv,'hp',isHire)}">${STAT_ICONS.hp} ${adv.hp}/${maxH}</div><div class="hub-stats-item" ${getHov('stamina')} style="color:${this.getStatColor(adv,'stamina',isHire)}">${STAT_ICONS.stamina} ${adv.stamina}/${maxS}</div></div>
            </div>
            
            <div style="margin-top: 15px; font-size: 11px; text-align: center; border-top: 1px dotted #444; padding-top: 10px;">
                <div style="margin-bottom: 3px;">⚔️ <span ${weaponAttr}>${weaponLabel}</span></div>
                <div>🛡️ <span ${armorAttr}>${armorLabel}</span></div>
            </div>

            <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:flex-end; padding-top: 10px;">
                ${isHire ? `<button class="hub-btn action-btn" style="width: auto; padding: 5px 15px; margin:0;" onclick="HubManager.hireFromTavern(${adv.id})">Нанять</button>` : '<div></div>'}
                <div class="salary" style="margin: 0; padding: 0;">Плата: ${adv.salary} 🕯️</div>
            </div>
        `;
    }

    static hireFromTavern(id) {
        const r = this.currentRecruits.find(x => x.id === id);
        if (r) { GameState.roster.push(r); this.currentRecruits = this.currentRecruits.filter(x => x.id !== id); GameState.updateTopBarUI(); this.refreshContent('tavern'); }
    }

    static renderTavern(container) { this.generateRecruits(); this.currentRecruits.forEach(r => { const card = document.createElement('div'); card.className = 'char-card'; card.innerHTML = this.getCardHTML(r, true); container.appendChild(card); }); }
    static renderBarracks(container) { GameState.roster.forEach(adv => { const card = document.createElement('div'); card.className = 'char-card'; card.style.cursor = 'pointer'; card.innerHTML = this.getCardHTML(adv, false); card.onclick = () => this.openCharacterDetails(adv); container.appendChild(card); }); }

    static renderCleat(container) {
        if (GameState.roster.length === 0) return container.innerHTML = '<p style="padding:20px;">Некого отправлять.</p>';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        let squadVisual = `<div style="display:flex; justify-content:center; gap:10px; margin-bottom:30px; background: rgba(0,0,0,0.3); padding: 20px; border: 1px solid #333; width: 100%;">`;
        for (let i = 4; i >= 1; i--) {
            const member = GameState.currentSquad[i - 1];
            squadVisual += `
                <div style="width:160px; height:180px; border: 2px solid ${member ? '#ffbf00' : '#444'}; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; background: ${member ? '#2a241e' : 'transparent'}">
                    <div style="font-size:10px; color:#666; position:absolute; top:5px;">ПОЗИЦИЯ ${i}</div>
                    ${member ? `
                        <div style="font-size:40px; margin-bottom:10px;">👤</div>
                        <div style="font-size:13px; font-weight:bold; text-align:center; color:#fff;">${member.name.split(' ')[0]}</div>
                        <div style="margin-top:10px;">${this.getRangeHTML(this.getUnitRangeData(member).ranks, this.getUnitRangeData(member).targets)}</div>
                    ` : '<div style="color:#444">ПУСТО</div>'}
                </div>
            `;
        }
        squadVisual += `</div>`;

        container.innerHTML = `
            ${squadVisual}
            <div style="margin-bottom: 20px; font-size: 18px;">Укомплектованность отряда: <b>${GameState.currentSquad.length} / 4</b></div>
            <div id="cleat-list" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; width: 100%;"></div>
            <button id="start-btn" class="hub-btn action-btn" style="width: 400px; padding: 20px; font-size: 20px; margin-top: 30px;" ${GameState.currentSquad.length === 0 ? 'disabled' : ''}>Спустить Клеть</button>
        `;

        const list = document.getElementById('cleat-list');
        GameState.roster.forEach(adv => {
            const isInSquad = GameState.currentSquad.some(s => s.id === adv.id);
            const card = document.createElement('div');
            card.className = 'char-card';
            if (isInSquad) card.style.borderColor = '#ffbf00';
            card.style.cursor = 'pointer';
            card.innerHTML = this.getCardHTML(adv, false);
            card.onclick = () => {
                const idx = GameState.currentSquad.findIndex(s => s.id === adv.id);
                if (idx > -1) GameState.currentSquad.splice(idx, 1);
                else if (GameState.currentSquad.length < 4) GameState.currentSquad.push(adv);
                this.refreshContent('cleat');
            };
            list.appendChild(card);
        });

        document.getElementById('start-btn').onclick = () => { 
            if (GameState.currentSquad.length > 0) {
                document.getElementById('building-ui').classList.add('hidden');
                SceneManager.changeScene(ExploreScene);
            }
        };
    }

    static renderWarehouse(container) {
        GameState.initDebugInventory();
        
        container.style.display = 'block'; 
        container.style.padding = '25px';

        container.innerHTML = `
            <div style="margin-bottom:20px; display:flex; gap:10px; border-bottom: 1px solid #555; justify-content: center; padding-bottom: 15px;">
                <button class="tab-btn ${this.warehouseTab==='all'?'active':''}" onclick="HubManager.setWarehouseTab('all')">Всё</button>
                <button class="tab-btn ${this.warehouseTab==='weapon'?'active':''}" onclick="HubManager.setWarehouseTab('weapon')">Оружие</button>
                <button class="tab-btn ${this.warehouseTab==='armor'?'active':''}" onclick="HubManager.setWarehouseTab('armor')">Броня</button>
            </div>
            <p style="text-align: center; margin-bottom: 20px;">Предметов на складе: <b>${GameState.inventory.length}</b></p>
            <div id="warehouse-grid"></div>
        `;

        const grid = document.getElementById('warehouse-grid');
        if (!grid) return;

        const filtered = GameState.inventory.filter(i => this.warehouseTab === 'all' || i.type === this.warehouseTab);
        
        filtered.forEach(item => {
            const box = document.createElement('div'); 
            box.className = 'inv-item';
            box.innerHTML = `<div class="inv-icon">${item.type==='weapon'?'⚔️':'🛡️'}</div><div class="inv-name">${item.name}</div>`;
            
            box.onmousemove = (e) => this.showEncodedTooltip(e, this.getItemTooltip(item));
            box.onmouseout = () => this.hideTooltip();
            grid.appendChild(box);
        });
    }

    static setWarehouseTab(tab) { this.warehouseTab = tab; this.refreshContent('warehouse'); }

    static openCharacterDetails(adv) {
        GameState.initDebugInventory(); this.inspectedAdv = adv; this.selectedSlot = null;
        document.getElementById('char-details-modal').classList.remove('hidden');
        document.getElementById('cd-name').innerText = adv.name;
        document.getElementById('cd-info').innerText = `${adv.background} | ${adv.traits[0].name}`;
        document.getElementById('cd-close-btn').onclick = () => { document.getElementById('char-details-modal').classList.add('hidden'); this.refreshContent('barracks'); };
        this.updateDetailsStats(); this.updateDetailsSlots(); this.renderDetailsInventory();
    }

    static updateDetailsStats() {
        const adv = this.inspectedAdv;
        const s = document.getElementById('cd-stats');
        
        const rangeData = this.getUnitRangeData(adv);
        const hasWeapon = adv.equipment.rightHand;
        
        const rangeWidget = hasWeapon 
            ? this.getRangeHTML(rangeData.ranks, rangeData.targets) 
            : "<div style='height:20px; color:#555; font-size:10px; text-align:center;'>Оружие не экипировано</div>";

        const temp = document.createElement('div');
        temp.innerHTML = this.getCardHTML(adv, false);
        const statsHtml = temp.querySelector('.hub-stats-container').outerHTML;

        s.innerHTML = `
            ${statsHtml}
            <div style="margin-top: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:10px; color:#888; margin-bottom:5px; text-transform:uppercase;">Эффективные позиции</div>
                ${rangeWidget}
            </div>
            <div style="margin-top: 15px; text-align: center; color: #ffbf00; font-weight: bold; font-size: 16px;">
                Содержание: ${adv.salary} 🕯️
            </div>
        `;
    }

    static updateDetailsSlots() {
        const adv = this.inspectedAdv;
        const slots = ['rightHand', 'body', 'leftHand'];
        const slotNames = { rightHand: "Основное оружие", body: "Тело", leftHand: "Вспомогательное" };

        slots.forEach(slot => {
            const el = document.getElementById(`cd-slot-${slot}`);
            const item = adv.equipment[slot];
            
            let currentItemForTooltip = item;
            if (slot === 'body' && !item) currentItemForTooltip = adv.civilBody;

            if (currentItemForTooltip) {
                const encoded = this.getItemTooltip(currentItemForTooltip);
                el.setAttribute('onmousemove', `HubManager.showEncodedTooltip(event, '${encoded}')`);
                el.setAttribute('onmouseout', `HubManager.hideTooltip()`);
            } else {
                el.removeAttribute('onmousemove');
                el.removeAttribute('onmouseout');
            }

            if (slot === 'body' && !item && adv.civilBody) {
                el.innerHTML = `<b>${slotNames[slot]}</b><br><span style="color:#aaa">${adv.civilBody.name}</span>`;
                el.className = 'equip-slot';
            } else if (item) {
                el.innerHTML = `<b>${slotNames[slot]}</b><br><span>${item.name}</span><br><small style="color:#ff4444">[ СНЯТЬ ]</small>`;
                el.className = 'equip-slot filled';
            } else {
                el.innerHTML = `<b>${slotNames[slot]}</b><br><span style="color:#555">Пусто</span>`;
                el.className = 'equip-slot';
            }

            if (this.selectedSlot === slot) el.style.borderColor = '#ffbf00';

            el.onclick = () => {
                this.hideTooltip();
                if (item) {
                    let oldH = this.getStat(adv, 'hp'), oldS = this.getStat(adv, 'stamina');
                    GameState.inventory.push(item);
                    adv.equipment[slot] = null;
                    this.selectedSlot = null;
                    let newH = this.getStat(adv, 'hp'), newS = this.getStat(adv, 'stamina');
                    adv.hp = Math.max(1, adv.hp - (oldH - newH));
                    adv.stamina = Math.max(0, adv.stamina - (oldS - newS));
                } else {
                    this.selectedSlot = slot;
                }
                this.updateDetailsStats();
                this.updateDetailsSlots();
                this.renderDetailsInventory();
            };
        });

        const panel = document.getElementById('cd-skills-panel');
        panel.innerHTML = '';
        if (adv.equipment.rightHand && adv.equipment.rightHand.skills) {
            adv.equipment.rightHand.skills.forEach(s => {
                const b = document.createElement('div');
                b.className = 'cd-skill-btn';
                let d = Math.round(adv.equipment.rightHand.baseDamage * (s.damageCoef || 0) * (s.hits || 1));
                b.innerHTML = `<b>${s.name}</b><br><span style="color:#ffaa44">${d > 0 ? 'Урон: '+d : 'Бафф'}</span>`;
                
                const vPos = s.validPos || adv.equipment.rightHand.defaultSkillData?.validPos || [1,2];
                const tPos = s.targetPos || adv.equipment.rightHand.defaultSkillData?.targetPos || [1,2];
                const sRange = this.getRangeHTML(vPos, tPos, true);
                const encoded = btoa(unescape(encodeURIComponent(`<b>${s.name}</b><br>${sRange}<br><span style='color:#aaa'>${s.description}</span>`)));
                
                b.setAttribute('onmousemove', `HubManager.showEncodedTooltip(event, '${encoded}')`);
                b.setAttribute('onmouseout', `HubManager.hideTooltip()`);
                panel.appendChild(b);
            });
        } else panel.innerHTML = '<span style="color:#555">Оружие не экипировано</span>';
    }

    static renderDetailsInventory() {
        GameState.initDebugInventory();
        const container = document.getElementById('cd-inventory');
        container.innerHTML = '';
        const slot = this.selectedSlot;
        
        if (!slot) {
            container.innerHTML = '<p style="color:#888; padding:10px; width: 100%; text-align: center;">Выберите пустой слот выше...</p>';
            return;
        }

        const filtered = GameState.inventory.filter(i => {
            if (slot === 'body') return i.type === 'armor';
            if (slot === 'rightHand') return i.type === 'weapon';
            return i.type === 'offhand';
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p style="color:#888; padding:10px; width: 100%;">На складе нет подходящих предметов.</p>`;
            return;
        }

        filtered.forEach(item => {
            const box = document.createElement('div');
            box.className = 'inv-item';
            box.innerHTML = `<div class="inv-icon">${item.type === 'weapon' ? '⚔️' : '🛡️'}</div><div class="inv-name">${item.name}</div>`;
            
            const tooltipData = this.getItemTooltip(item); 
            box.onmousemove = (e) => this.showEncodedTooltip(e, tooltipData);
            box.onmouseout = () => this.hideTooltip();

            box.onclick = () => {
                this.hideTooltip();
                let oldH = this.getStat(this.inspectedAdv, 'hp'), oldS = this.getStat(this.inspectedAdv, 'stamina');
                this.inspectedAdv.equipment[slot] = item;
                GameState.inventory.splice(GameState.inventory.findIndex(i => i.id === item.id), 1);
                let newH = this.getStat(this.inspectedAdv, 'hp'), newS = this.getStat(this.inspectedAdv, 'stamina');
                this.inspectedAdv.hp += (newH - oldH); this.inspectedAdv.stamina += (newS - oldS);
                this.selectedSlot = null;
                this.updateDetailsStats(); this.updateDetailsSlots(); this.renderDetailsInventory();
            };
            container.appendChild(box);
        });
    }

    static getUnitRangeData(adv) {
        const weapon = adv.equipment.rightHand;
        if (!weapon || !weapon.skills) {
            return { ranks: {1:0, 2:0, 3:0, 4:0}, targets: {1:0, 2:0, 3:0, 4:0} };
        }

        let ranks = {1:0, 2:0, 3:0, 4:0};
        let targets = {1:0, 2:0, 3:0, 4:0};

        weapon.skills.forEach(skill => {
            const vPos = skill.validPos || weapon.defaultSkillData?.validPos || [1, 2];
            const tPos = skill.targetPos || weapon.defaultSkillData?.targetPos || [1, 2];

            vPos.forEach(p => { if(ranks[p] !== undefined) ranks[p]++; });
            tPos.forEach(p => { if(targets[p] !== undefined) targets[p]++; });
        });

        return { ranks, targets };
    }

    static getRangeHTML(rankCounts, targetCounts, isSkill = false) {
        let html = `<div class="range-display">`;
        
        // Позиции бойца справа налево для игрока: 4 3 2 1
        html += `<div class="range-group">`;
        [4, 3, 2, 1].forEach(i => {
            let status = '';
            if (isSkill) {
                if (Array.isArray(rankCounts) && rankCounts.includes(i)) status = 'active high';
            } else {
                const count = rankCounts[i] || 0;
                if (count > 0) status = 'active ' + (count >= 3 ? 'high' : 'low');
            }
            html += `<div class="range-dot rank ${status}"></div>`;
        });
        html += `</div>`;

        html += `<div style="color: #555; font-weight: bold; margin: 0 4px;"> > </div>`;

        // Позиции врага слева направо: 1 2 3 4
        html += `<div class="range-group">`;
        [1, 2, 3, 4].forEach(i => {
            let status = '';
            if (isSkill) {
                if (Array.isArray(targetCounts) && targetCounts.includes(i)) status = 'active high';
            } else {
                const count = targetCounts[i] || 0;
                if (count > 0) status = 'active ' + (count >= 3 ? 'high' : 'low');
            }
            html += `<div class="range-dot target ${status}"></div>`;
        });
        html += `</div>`;

        html += `</div>`;
        return html;
    }
}
window.HubManager = HubManager;