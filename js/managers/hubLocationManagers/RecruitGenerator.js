import { GameState } from '../../core/GameState.js';
import { BACKGROUNDS } from '../../data/workersData/backgrounds.js';
import { TRAITS } from '../../data/workersData/traits.js';
import { NAMES_DATA } from '../../data/workersData/names.js';
import { STARTING_CLOTHES } from '../../data/workersData/outfit.js';
import { CharacterRenderer } from './CharacterRenderer.js';

export class RecruitGenerator {
    static generateRecruitsPool(count) {
        const pool = [];
        const bgKeys = Object.keys(BACKGROUNDS);
        
        const maxVariations = CharacterRenderer.MAX_SPRITE_VARIATIONS || 15; 

        const roll = (range) => {
            if (!range || !Array.isArray(range) || range.length < 2) return 10; 
            return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        };

        for (let i = 0; i < count; i++) {
            const bgName = bgKeys[Math.floor(Math.random() * bgKeys.length)];
            const bgData = BACKGROUNDS[bgName];
            if (!bgData) continue;

            const gender = Math.random() > 0.5 ? 'm' : 'f';
            
            const usedIndices = new Set();
            GameState.roster.forEach(adv => {
                if (adv.gender === gender && adv.spriteIndex !== undefined) {
                    usedIndices.add(parseInt(adv.spriteIndex));
                }
            });
            pool.forEach(rec => {
                if (rec.gender === gender && rec.spriteIndex !== undefined) {
                    usedIndices.add(parseInt(rec.spriteIndex));
                }
            });

            // подбор уникального свободного спрайт лица
            const availableIndices = [];
            for (let idx = 0; idx < maxVariations; idx++) {
                if (!usedIndices.has(idx)) {
                    availableIndices.push(idx);
                }
            }

            let spriteIndex;
            if (availableIndices.length > 0) {
                spriteIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            } else {
                spriteIndex = Math.floor(Math.random() * maxVariations);
            }

            let legalTraits = TRAITS.filter(t => !t.neverIn || !t.neverIn.some(f => bgData.category.includes(f)));
            let chosenTraits = [legalTraits[Math.floor(Math.random() * legalTraits.length)]];

            let nameCat = "common";
            if (bgData.category.includes("Элита") || bgData.category.includes("умс. труд")) nameCat = "elite";
            else if (bgData.category.includes("боев. труд")) nameCat = "martial";
            else if (bgData.category.includes("Маргинал") || bgData.category.includes("Незаконный")) nameCat = "outcast";
            
            const fNamePool = NAMES_DATA.firstNames[nameCat][gender];
            const firstName = fNamePool[Math.floor(Math.random() * fNamePool.length)];
            
            const lNamePool = NAMES_DATA.traitNicknames[chosenTraits[0].name] || NAMES_DATA.genericNicknames;
            const randomObj = lNamePool[Math.floor(Math.random() * lNamePool.length)];
            const lastName = randomObj[gender] || randomObj['m'];

            // одежда
            const clothesPool = Object.entries(STARTING_CLOTHES).filter(([, v]) => 
                v.category.some(c => bgData.category.includes(c))
            );

            let rndClothEntry;
            if (clothesPool.length > 0) {
                rndClothEntry = clothesPool[Math.floor(Math.random() * clothesPool.length)];
            } else {
                const fallbackKey = STARTING_CLOTHES.canvasShirt ? 'canvasShirt' : 'greasyRags';
                rndClothEntry = [fallbackKey, STARTING_CLOTHES[fallbackKey]];
            }

            const civilBody = rndClothEntry ? { key: rndClothEntry[0], name: rndClothEntry[1].name, ...rndClothEntry[1] } : null;

            let pureStats = {
                hp: roll(bgData.stats.hp),
                stamina: roll(bgData.stats.stamina),
                battle: roll(bgData.stats.battle),
                mining: roll(bgData.stats.mining),
                research: roll(bgData.stats.research),
                construction: roll(bgData.stats.construction),
                scouting: roll(bgData.stats.scouting)
            };

            const recruit = {
                id: Date.now() + i + Math.random(),
                name: `${firstName} ${lastName}`,
                gender,
                spriteIndex,
                background: bgName,
                traits: chosenTraits,
                pureStats,
                civilBody,
                equipment: { leftHand: null, rightHand: null, body: null },
                level: 1,
                expHours: 0,
                unspentPoints: 0,
                salary: bgData.salary 
            };

            let totalHp = recruit.pureStats.hp;
            recruit.traits.forEach(t => { if (t.effect && t.effect.hp) totalHp += t.effect.hp; });
            if (recruit.civilBody && recruit.civilBody.effect && recruit.civilBody.effect.hp) totalHp += recruit.civilBody.effect.hp;
            recruit.hp = totalHp;

            let totalStamina = recruit.pureStats.stamina;
            recruit.traits.forEach(t => { if (t.effect && t.effect.stamina) totalStamina += t.effect.stamina; });
            if (recruit.civilBody && recruit.civilBody.effect && recruit.civilBody.effect.stamina) totalStamina += recruit.civilBody.effect.stamina;
            recruit.stamina = totalStamina;

            pool.push(recruit);
        }

        return pool;
    }
}

window.RecruitGenerator = RecruitGenerator;
