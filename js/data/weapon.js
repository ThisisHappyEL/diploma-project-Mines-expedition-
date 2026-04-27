import { DEFAULT_SWORD_SKILL, SWORD_SKILLS } from '../../templates/weaponSkills/swordSkills.js';

export const sword = {
    rustySword: { 
        name: "Ржавый меч", 
        type: "weapon", 
        level: 1,
        baseDamage: 10,
        defaultSkillData: DEFAULT_SWORD_SKILL, 
        skills: [
            SWORD_SKILLS.dupliren, 
            SWORD_SKILLS.cleavingStrike, 
            SWORD_SKILLS.wideSwing,
            SWORD_SKILLS.thrust,
            SWORD_SKILLS.feint,
            SWORD_SKILLS.pommelStrike,
            SWORD_SKILLS.flatStrike,
            SWORD_SKILLS.mordhau,
            SWORD_SKILLS.bladeGrab,
            SWORD_SKILLS.versetzen
        ]
    }
};