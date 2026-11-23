import { EXPEDITION_BALANCE } from '../../data/balanceFiles/expiditionBalance.js';

const SIDE_EVENT_TEMPLATES = [
    { kind: 'mining',   icon: '⛏️', title: 'Рудная жила',        stat: 'mining',       desc: 'Порода богата минералами.' },
    { kind: 'research', icon: '📚', title: 'Стеклянная аномалия', stat: 'research',     desc: 'Хрустальные наросты с остаточным током.' },
    { kind: 'supply',   icon: '🔨', title: 'Заброшенный штрек',  stat: 'construction', desc: 'Старая выработка с обломками крепей.' },
    { kind: 'hazard',   icon: '🕷️', title: 'Кокон стеклороя',    stat: 'battle',       desc: 'Внутри шевелится фауна — опасность боя и трофеи.' }
];

export const MineGenerator = {
    createSideStages(depth, baseWork) {
        const stageCount = depth >= 4 ? 3 : 2;
        const stages = [];
        for (let s = 0; s < stageCount; s++) {
            const tpl = SIDE_EVENT_TEMPLATES[Math.floor(Math.random() * SIDE_EVENT_TEMPLATES.length)];
            stages.push({
                kind: tpl.kind,
                icon: tpl.icon,
                title: tpl.title,
                stat: tpl.stat,
                desc: tpl.desc,
                workDone: 0,
                workRequired: Math.round(baseWork * (0.45 + s * 0.15)),
                progress: 0,
                completed: false
            });
        }
        return stages;
    },

    createMine(biomeId = 'glassForest') {
        const maxDepth = EXPEDITION_BALANCE.maxDepth || 10;
        const baseWork = EXPEDITION_BALANCE.mine?.baseNodeWork || 100;
        const scale = EXPEDITION_BALANCE.mine?.depthWorkScale || 0.25;

        const depths = [];

        for (let d = 1; d <= maxDepth; d++) {
            const workMult = 1 + (d - 1) * scale;
            const centerWork = Math.round(baseWork * workMult);
            const sideBaseWork = Math.round(baseWork * workMult);

            const makeSideNode = () => {
                const stages = this.createSideStages(d, sideBaseWork);
                return {
                    depth: d,
                    stages,
                    currentStageIdx: 0,
                    progress: 0,
                    completed: false,
                    revealed: false
                };
            };

            const isBossDepth = d === maxDepth;
            const isMidGate = d === 5;

            depths.push({
                depth: d,
                west: makeSideNode(),
                center: {
                    depth: d,
                    stages: [{
                        kind: isBossDepth ? 'boss' : (isMidGate ? 'gate' : 'breach'),
                        icon: isBossDepth ? '👑' : (isMidGate ? '🧱' : '⬇️'),
                        title: isBossDepth ? 'Логово Матери Роя' : (isMidGate ? 'Плотный кварцевый затор' : `Проход на глубину ${d + 1}`),
                        stat: 'mining',
                        desc: isBossDepth
                            ? 'Сердце гнезда на самом дне литосферного слоя.'
                            : 'Центральный ствол Клети. Пробейте брешь, чтобы спуститься ниже.',
                        workDone: 0,
                        workRequired: centerWork,
                        progress: 0,
                        completed: false
                    }],
                    currentStageIdx: 0,
                    progress: 0,
                    completed: false,
                    revealed: d === 1
                },
                east: makeSideNode()
            });
        }

        return {
            biomeId,
            maxDepth,
            cageDepth: 1,
            maxReachedDepth: 1,
            visibleMaxDepth: EXPEDITION_BALANCE.initialVisibleDepths || 3,
            droppedCaches: [],
            // Состояние активной смены хранится прямо в шахте, чтобы не теряться при уходе в Хаб
            shiftWorkHours: 0,
            shiftFoundItems: [],
            shiftSpentItems: [],
            depths
        };
    }
};
