export const BACKGROUNDS = {
    "Шахтёр": { 
        // Мы перенесли бонус hp внутрь stats
        stats: { battle: 5, mining: 10, research: 2, construction: 6, scouting: 3, hp: 5 } 
    },
    "Учёный": { 
        // Учёный хилый, поэтому у него штраф к базовому ХП
        stats: { battle: 2, mining: 2, research: 10, construction: 4, scouting: 6, hp: -5 } 
    }
};