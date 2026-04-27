export const EFFECTS = {
    BLOCK: { id: 'block', name: "Блок", type: 'buff', icon: '🛡️', duration: 1 },
    PARRY: { id: 'parry', name: "Паррирование", type: 'buff', icon: '⚔️', duration: 1 },
    DODGE: { id: 'dodge', name: "Уклонение", type: 'buff', icon: '💨', duration: 1 },
    POWER: { id: 'power', name: "Сила", type: 'buff', icon: '💪', duration: 1 },
    SPEED: { id: 'speed', name: "Ускорение", type: 'buff', icon: '⚡', duration: 1 },
    COMBO: { id: 'combo', name: "Комбо", type: 'buff', icon: '✨', duration: 1 },

    WEAKNESS: { id: 'weakness', name: "Слабость", type: 'debuff', icon: '📉', duration: 1 },
    STUN: { id: 'stun', name: "Оглушение", type: 'debuff', icon: '💫', duration: 1 },
    VULNERABLE: { id: 'vulnerable', name: "Уязвимость", type: 'debuff', icon: '💔', duration: 1 },
    MARK: { id: 'mark', name: "Метка", type: 'debuff', icon: '🎯', duration: 3 },
    BLEED: { id: 'bleed', name: "Кровотечение", type: 'dot', icon: '🩸', duration: 3 },
    DAZE: { id: 'daze', name: "Ошеломление", type: 'debuff', icon: '😵', duration: 1 }
};