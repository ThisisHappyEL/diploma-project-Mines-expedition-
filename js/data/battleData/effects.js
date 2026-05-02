export const EFFECTS = {
    BLOCK: { id: 'block', name: "Блок", type: 'buff', icon: '🛡️', tickOn: 'hitReceived', duration: 3, description: "Снижает урон на 50%" },
    PARRY: { id: 'parry', name: "Паррирование", type: 'buff', icon: '⚔️', tickOn: 'hitReceived', duration: 3, description: "Ответный удар при получении урона" },
    DODGE: { id: 'dodge', name: "Уклонение", type: 'buff', icon: '💨', tickOn: 'hitReceived', duration: 3, description: "Уворот от следующей атаки" },
    POWER: { id: 'power', name: "Сила", type: 'buff', icon: '💪', tickOn: 'hitGiven', duration: 3, description: "Урон в 1.5 раза выше" },
    WEAKNESS: { id: 'weakness', name: "Слабость", type: 'debuff', icon: '📉', tickOn: 'hitGiven', duration: 3, description: "Урон в 2 раза ниже" },
    
    SPEED: { id: 'speed', name: "Ускорение", type: 'buff', icon: '⚡', tickOn: 'turnEnd', duration: 3, description: "Бонус к Инициативе и характеристике Бой" },
    DAZE: { id: 'daze', name: "Ошеломление", type: 'debuff', icon: '😵', tickOn: 'turnEnd', duration: 3, description: "Штраф к Инициативе и характеристике Бой" },
    STUN: { id: 'stun', name: "Оглушение", type: 'debuff', icon: '💫', tickOn: 'turnEnd', duration: 3, description: "Пропуск хода" },
    
    TAUNT: { id: 'taunt', name: "Провокация", type: 'buff', icon: '🤹‍♂️', tickOn: 'turnEnd', duration: 2, description: "Заставляет врагов атаковать этого юнита" },
    MARK: { id: 'mark', name: "Метка", type: 'debuff', icon: '🎯', tickOn: 'skillReceived', duration: 2, description: "Уязвимость для спец-атак" },
    BLEED: { id: 'bleed', name: "Кровотечение", type: 'dot', icon: '🩸', tickOn: 'turnStart', duration: 3, description: "Урон в начале хода" },
    
    COMBO: { id: 'combo', name: "Комбо", type: 'buff', icon: '✨', tickOn: 'skillUsed', duration: 2 },
    PROTECTION: { id: 'protection', name: "Защита", type: 'buff', icon: '🧙‍♂️', tickOn: 'turnEnd', duration: 2 },
    UNDERPROTECTION: { id: 'underProtection', name: "Под защитой", type: 'buff', icon: '👨‍👦', tickOn: 'turnEnd', duration: 2 },
    MOREGUNPOWDER: { id: 'moreGunpowder', name: "Больше пороха!", type: 'buff', icon: '💣', tickOn: 'hitGiven', duration: 2 },
    NOONESTEPFURTHER: { id: 'noOneStepFurther', name: "Ни шагу дальше!", type: 'buff', icon: '✋', tickOn: 'turnEnd', duration: 1 },
    BONUSDAMAGE: { id: 'bonusDamage', name: "Бонусный урон", type: 'buff', icon: '🗡', tickOn: 'hitGiven', duration: 2 },
    COURAGE: { id: 'courage', name: "Кураж", type: 'buff', icon: '😈', tickOn: 'turnEnd', duration: 1 },
    VULNERABLE: { id: 'vulnerable', name: "Уязвимость", type: 'debuff', icon: '💔', tickOn: 'turnEnd', duration: 1 },
    AGAPINGWOUND: { id: 'aGapingWound', name: "Зияющая рана", type: 'debuff', icon: '💘', tickOn: 'hitReceived', duration: 2 },
    SUSCEPTIBILITY: { id: 'susceptibility', name: "Восприимчивость", type: 'debuff', icon: '🎈', tickOn: 'effectReceived', duration: 1 },
    FEAR: { id: 'fear', name: "Испуг", type: 'debuff', icon: '😱', tickOn: 'turnEnd', duration: 1 },
    INSTABILITY: { id: 'instability', name: "Неустойчивость", type: 'debuff', icon: '💃', tickOn: 'hitReceived', duration: 2 },
    INWEB: { id: 'inWeb', name: "В паутине", type: 'debuff', icon: '🕸', tickOn: 'manual', duration: 1 },
};