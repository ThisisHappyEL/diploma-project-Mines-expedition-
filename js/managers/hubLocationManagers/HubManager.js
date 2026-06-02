import { GameState } from '../../core/GameState.js';
import { TooltipManager } from './TooltipManager.js';
import { RecruitManager } from './RecruitManager.js';
import { ArsenalManager } from './ArsenalManager.js';
import { BarracksManager } from './BarrackManager.js'; 
import { HospitalManager } from './HospitalManager.js';
import { ForgeManager } from './ForgeManager.js';
import { WarehouseManager } from './WarehouseManager.js';
import { BazaarManager } from './BazaarManager.js';
import { QuestManager } from './QuestManager.js';
import { CleatManager } from './CleatManager.js';
import { STAT_ICONS, STAT_LABELS, STAT_DESCRIPTIONS } from '../../data/workersData/labels.js';
import { TRAITS } from '../../data/workersData/traits.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { HubTemplates } from './HubTemplates.js';
import { CharacterDetailsManager } from './CharacterDetailsManager.js';

export class HubManager {
    static currentBuildingId = null;

    static getEncodedTooltip(html) {
        if (!html) return '';
        return encodeURIComponent(html).replace(/'/g, "%27");
    }

    static showEncodedTooltip(event, encoded) {
        const html = decodeURIComponent(encoded);
        const tooltipEl = document.getElementById('custom-tooltip');
        if (tooltipEl) {
            tooltipEl.innerHTML = html;
            tooltipEl.style.display = 'block';
            
            if (html.includes('unit-card-mini')) {
                tooltipEl.style.maxWidth = '580px';
                tooltipEl.style.width = '520px';
                tooltipEl.style.whiteSpace = 'normal';
            } else {
                tooltipEl.style.maxWidth = '300px';
                tooltipEl.style.width = 'auto';
                tooltipEl.style.whiteSpace = 'pre-line';
            }
            
            let x = event.pageX + 15;
            let y = event.pageY + 15;
            
            if (x + tooltipEl.offsetWidth > window.innerWidth) {
                x = window.innerWidth - tooltipEl.offsetWidth - 10;
            }
            
            tooltipEl.style.left = x + 'px';
            tooltipEl.style.top = y + 'px';
        }
    }

    static hideTooltip() {
        const tooltipEl = document.getElementById('custom-tooltip');
        if (tooltipEl) {
            tooltipEl.style.display = 'none';
        }
    }

    static getDeclinedTraitName(traitName, gender) {
        if (gender === 'm') return traitName;
        const traitObj = TRAITS.find(t => t.name === traitName);
        return (traitObj && traitObj.femaleName) ? traitObj.femaleName : traitName;
    }

    static getLocalCategory(item) {
        if (!item) return null;
        if (item.category) return item.category;

        const key = (item.key || item.name || '').toLowerCase();

        if (item.type === 'weapon') {
            if (key.includes('sword')) return 'swords';
            if (key.includes('spear') || key.includes('pike') || key.includes('halberd') || key.includes('glaive') || key.includes('trident') || key.includes('pilum')) return 'spears';
            if (key.includes('hammer') || key.includes('mace')) return 'hammers';
            if (key.includes('axe')) return 'axes';
            if (key.includes('sling')) return 'slings';
            if (key.includes('crossbow')) return 'crossbows';
            if (key.includes('bow')) return 'bows';
            if (key.includes('arquebus') || key.includes('caliver') || key.includes('musket') || key.includes('gun')) return 'arquebuses';
            return 'swords'; 
        }

        if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') {
            const armorKeys = ['lightArmor', 'middleArmor', 'heavyArmor', 'minerOutfit', 'scientistOutfit', 'builderOutfit', 'scoutOutfit'];
            for (const k of armorKeys) {
                if (item.key === k || item.name.includes(k) || key.includes(k.toLowerCase())) return k;
            }
            return 'lightArmor'; 
        }
        return null;
    }

    static openBuilding(locationData) {
        const ui = document.getElementById('building-ui');
        ui.classList.remove('hidden'); 
        document.getElementById('building-title').innerText = locationData.name;
        document.getElementById('building-description').innerText = locationData.description || "";
        document.getElementById('building-close-btn').onclick = () => ui.classList.add('hidden');
        this.refreshContent(locationData.id);
    }

    static refreshContent(buildingId) {
        TooltipManager.clear();
        const content = document.getElementById('building-content');
        content.innerHTML = ''; 
        content.style.display = 'flex';
        content.style.flexDirection = 'row'; 
        
        this.currentBuildingId = buildingId;

        if (buildingId === 'tavern_recruits' || buildingId === 'tavern') RecruitManager.render(content);
        else if (buildingId === 'arsenal') ArsenalManager.render(content);
        else if (buildingId === 'barracks') BarracksManager.render(content);
        else if (buildingId === 'hospital') HospitalManager.render(content);
        else if (buildingId === 'forge') ForgeManager.render(content);
        else if (buildingId === 'bazaar') BazaarManager.render(content);
        else if (buildingId === 'warehouse') WarehouseManager.render(content);
        else if (buildingId === 'cleat') CleatManager.render(content);
        else if (buildingId.includes('office') || buildingId.includes('manager')) QuestManager.render(content);
    }

    static getCharRowHTML(adv) {
        return HubTemplates.getCharRowHTML(adv);
    }

    static getCardHTML(adv, isHire = false) {
        return HubTemplates.getCardHTML(adv, isHire);
    }

    static getRangeHTML(rankCounts, targetCounts, isSkill = false) {
        return HubTemplates.getRangeHTML(rankCounts, targetCounts, isSkill);
    }

    static getSkillTooltipHTML(skill, parentWeapon = null) {
        return HubTemplates.getSkillTooltipHTML(skill, parentWeapon);
    }

    static getSkillRangeHTML(validPos, targetPos, isAoE = false) {
        return HubTemplates.getSkillRangeHTML(validPos, targetPos, isAoE);
    }

    static getStat(adv, statName) {
        return RecruitManager.getStat(adv, statName);
    }

    static openCharacterDetails(adv) {
        CharacterDetailsManager.open(adv);
    }

    static getUnitRangeData(adv) {
        return CharacterDetailsManager.getUnitRangeData(adv);
    }

    static increaseStat(statName) {
        CharacterDetailsManager.increaseStat(statName);
    }

    static decreaseStat(statName) {
        CharacterDetailsManager.decreaseStat(statName);
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

    static getItemTooltip(item) {
        if (!item) return "";
        let typeLabel = 'Ресурс';
        if (item.type === 'weapon') typeLabel = 'Оружие';
        else if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') typeLabel = 'Броня';
        else if (item.type === 'supplies') typeLabel = 'Припасы';

        let t = `<b>${item.name}</b><br>Тип: ${typeLabel}<br><br>`;
        if (item.type === 'weapon') {
            t += `Урон: ${item.baseDamage}<br>Навыки:<br>`;
            if (item.skills) {
                item.skills.forEach(s => t += ` - ${s.name}<br>`);
            }
        } else if (item.type === 'armor' || item.type === 'body' || item.type === 'civil') {
            const stats = item.stats || item.effect || {};
            t += `<span style='color:#aaa; font-size:11px;'>${item.description || ""}</span><br><br>`;
            Object.entries(stats).forEach(([k, v]) => {
                if (v !== 0) t += `${STAT_ICONS[k] || k} +${v}<br>`;
            });
        } else {
            t += `<span style='color:#aaa; font-size:11px; font-style:italic;'>${item.description || ""}</span><br><br>`;
            t += `💰 Базовая стоимость: ${item.price} 🕯️`;
        }
        return t;
    }

    static hireFromTavern(id) {
        if (RecruitManager.hire(id)) {
            this.refreshContent('tavern');
        }
    }

    static showEndCycleModal() {
        const modal = document.getElementById('end-cycle-modal');
        const content = document.getElementById('end-cycle-content');

        let totalExpenses = 0;
        const COST_PER_REST = 5; const COST_PER_HEAL = 10;

        GameState.roster.forEach(adv => {
            totalExpenses += (adv.salary || 0);
            if (adv.isResting) totalExpenses += COST_PER_REST;
            if (adv.isHealing) totalExpenses += COST_PER_HEAL;
        });

        const expStatusText = GameState.hasFinishedExpedition 
            ? '<span style="color: var(--color-success);">✅ Вылазка была совершена. Погруженцы сделали своё дело.</span>' 
            : '<span style="color: var(--color-danger);">⚠️ В этом цикле отряд не спускался в клети. День потрачен впустую.</span>';

        const currentCandles = GameState.resources.candles;
        const projectedCandles = currentCandles - totalExpenses;
        const projectedColor = projectedCandles < 0 ? "var(--color-danger)" : "var(--color-success)";

        let questsHtml = '';
        if (GameState.activeQuests && GameState.activeQuests.length > 0) {
            questsHtml = '<div style="border-top: 1px solid #444; padding-top: 10px;"><h4>Активные контракты:</h4><ul style="padding-left: 20px; margin: 5px 0;">';
            GameState.activeQuests.forEach(q => {
                const timeColor = q.timeLeft <= 1 ? "var(--color-danger)" : (q.timeLeft <= 2 ? "var(--color-warning)" : "#aaa");
                questsHtml += `<li style="color: #ccc; margin-bottom: 5px;"><b>${q.name}</b> — осталось <span style="color: ${timeColor}; font-weight: bold;">${q.timeLeft} цикл.</span></li>`;
            });
            questsHtml += '</ul></div>';
        } else {
            questsHtml = '<div style="border-top: 1px solid #444; padding-top: 10px; color: #aaa;">Активных контрактов нет.</div>';
        }

        content.innerHTML = `
            <div style="font-size: 14px; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444;">${expStatusText}</div>
            <div style="font-size: 15px; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;"><span>Баланс свечей:</span> <b>${currentCandles} 🕯️</b></div>
                <div style="display: flex; justify-content: space-between; color: #aaa;"><span>Жалование и обслуживание:</span> <b style="color: var(--color-danger);">-${totalExpenses} 🕯️</b></div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #555; padding-top: 8px; margin-top: 2px;">
                    <span>Прогнозируемый остаток:</span> <b style="color: ${projectedColor}; font-size: 18px;">${projectedCandles} 🕯️</b>
                </div>
            </div>
            ${questsHtml}
        `;

        modal.classList.remove('hidden');
        document.getElementById('btn-cancel-cycle').onclick = () => { modal.classList.add('hidden'); };
        document.getElementById('btn-confirm-cycle').onclick = () => { modal.classList.add('hidden'); this.executeEndCycle(totalExpenses); };
    }

    static executeEndCycle(totalExpenses) {
        GameState.cycle++;

        GameState.roster.forEach(adv => {
            if (adv.isResting) {
                let maxS = window.RecruitManager ? window.RecruitManager.getStat(adv, 'stamina') : 100;
                adv.stamina = Math.min(maxS, adv.stamina + Math.floor(maxS * 0.5));
                if (adv.stamina >= maxS) adv.isResting = false;
            }
            if (adv.isHealing) {
                let maxH = window.RecruitManager ? window.RecruitManager.getStat(adv, 'hp') : 100;
                adv.hp = Math.min(maxH, adv.hp + Math.floor(maxH * 0.5));
                if (adv.hp >= maxH) adv.isHealing = false;
            }
        });

        GameState.resources.candles -= totalExpenses;

        if (GameState.resources.candles < 0) {
            if (GameState.debtCycles === undefined) GameState.debtCycles = 3;
            GameState.debtCycles--;
            if (GameState.debtCycles < 0) {
                document.getElementById('game-over-modal').classList.remove('hidden');
                return;
            }
        } else {
            GameState.debtCycles = 3;
        }

        GameState.hasFinishedExpedition = false;

        if (GameState.activeQuests) {
            for (let i = GameState.activeQuests.length - 1; i >= 0; i--) {
                let q = GameState.activeQuests[i]; q.timeLeft--;
                if (q.timeLeft < 0) GameState.activeQuests.splice(i, 1);
            }
        }

        GameState.updateTopBarUI();

        if (window.SaveManager && typeof window.SaveManager.saveGame === 'function') {
            window.SaveManager.saveGame();
        }
        
        if (this.currentBuildingId && !document.getElementById('building-ui').classList.contains('hidden')) {
            this.refreshContent(this.currentBuildingId);
        }
    }
}
window.HubManager = HubManager;