export const QUESTS = {
    managerQuests: {
        firstQuest: { 
            name: 'Первая вылазка', 
            requirement: 'expedition_end', 
            time: 3, 
            reward: 100, 
            cooldown: 999, 
            description: 'Сначала давай посмотрим на то, что ты можешь. Возьми управление над вылазкой и вернись назад.' 
        },
        
        // --- Этап 1: 7.5% (Открываются после первой вылазки) ---
        mining_7_5: { 
            name: 'Первые сколы', requirement: 'progress-mining-7.5', time: 5, reward: 150, cooldown: 999, 
            unlockAfterQuest: 'managerQuests_firstQuest',
            description: 'Вы доказали, что умеете возвращаться живыми. Теперь докажите, что можете приносить пользу. Наладьте добычу до минимально рентабельного уровня.' 
        },
        research_7_5: { 
            name: 'Поверхностный анализ', requirement: 'progress-research-7.5', time: 5, reward: 150, cooldown: 999, 
            unlockAfterQuest: 'managerQuests_firstQuest',
            description: 'Мы не можем работать вслепую. Соберите базовые данные об аномалиях этого сектора.' 
        },
        construction_7_5: { 
            name: 'Закрепление сводов', requirement: 'progress-construction-7.5', time: 5, reward: 150, cooldown: 999, 
            unlockAfterQuest: 'managerQuests_firstQuest',
            description: 'Своды пещеры ненадежны. Организуйте установку первых несущих балок, чтобы избежать обвалов на основных маршрутах.' 
        },
        scouting_7_5: { 
            name: 'Прощупывание тьмы', requirement: 'progress-scouting-7.5', time: 5, reward: 150, cooldown: 999, 
            unlockAfterQuest: 'managerQuests_firstQuest',
            description: 'Прежде чем углубляться, нам нужна карта прилегающих туннелей. Проведите первичную разведку.' 
        },

        // --- Этап 2: 25% (Открываются по 1 каждый день, начиная со 2 цикла) ---
        mining_25: { 
            name: 'Промышленный масштаб', requirement: 'progress-mining-25', time: 7, reward: 250, cooldown: 999, 
            unlockCycle: 2,
            description: 'Базовых поставок недостаточно. Совет требует увеличения объемов добычи. Выведите выработку на четверть от потенциала жилы.' 
        },
        research_25: { 
            name: 'Глубинная физика', requirement: 'progress-research-25', time: 7, reward: 250, cooldown: 999, 
            unlockCycle: 3,
            description: 'Аномалии становятся всё агрессивнее. Нам нужна четверть всех доступных данных сектора для калибровки оборудования.' 
        },
        construction_25: { 
            name: 'Опорный пункт', requirement: 'progress-construction-25', time: 7, reward: 250, cooldown: 999, 
            unlockCycle: 4,
            description: 'Инженерам нужен перевалочный пункт внутри пещеры. Обеспечьте строительство безопасной зоны.' 
        },
        scouting_25: { 
            name: 'Картография недр', requirement: 'progress-scouting-25', time: 7, reward: 250, cooldown: 999, 
            unlockCycle: 5,
            description: 'Туннели ветвятся. Нанесите на карту основные разломы и спуски на нижние ярусы.' 
        },

        // --- Этап 3: 75% (Финальные вехи, доступны с 7 цикла) ---
        mining_75: { 
            name: 'Истощение жилы', requirement: 'progress-mining-75', time: 10, reward: 500, cooldown: 999, 
            unlockCycle: 7,
            description: 'Месторождение почти исчерпано. Выжмите из этих камней всё до последней крошки. Это приказ.' 
        },
        research_75: { 
            name: 'Абсолютное познание', requirement: 'progress-research-75', time: 10, reward: 500, cooldown: 999, 
            unlockCycle: 7,
            description: 'Мы стоим на пороге открытия. Соберите оставшиеся данные, чтобы мы могли полностью понять природу этого места.' 
        },
        construction_75: { 
            name: 'Монументальный труд', requirement: 'progress-construction-75', time: 10, reward: 500, cooldown: 999, 
            unlockCycle: 7,
            description: 'Сектор должен быть полностью укреплен и электрифицирован. Подготовьте биом к массовой колонизации.' 
        },
        scouting_75: { 
            name: 'Сердце Тьмы', requirement: 'progress-scouting-75', time: 10, reward: 500, cooldown: 999, 
            unlockCycle: 7,
            description: 'Остались лишь самые темные и опасные уголки. Разведайте их, чтобы на карте сектора не осталось белых пятен.' 
        }
    },
    scientificChambersQuests: {
        regularTask: { name: 'Исследование обитателей стеклянного леса', requirement: 'researchResults-1', time: 3,  reward: 100, cooldown: 3, description: 'Учёные мужи унии заинтригованы возможностью жизни теплиться в кусках стекла, по которым пробегает ток. Изучите их и принесите научный труд.', sprite: 'correctFilePath' }
    },
    masonsGuildQuests: {
        regularTask: { name: 'Гордый стройматериал', requirement: 'valuableTypesOfStone-1', time: 3, reward: 100, cooldown: 3, description: 'Обыкновенная осадочная порода уже давно не впечатляет знатока, а вот ценные породы, еще не выработанные на глубине, найдут своего покупателя.', sprite: 'correctFilePath' }
    },
    huntersCommonwealthQuests: {
        regularTask: { name: 'Трофеи с кварцитовых арахноидов', requirement: 'battlePrey-1', time: 3, reward: 100, cooldown: 3, description: 'Даже череп ныне вымерших оленей и кабанов не столь желанен в коллекции, как части тел этих занятных пауков из стеклянного леса. Принесите один такой.', sprite: 'correctFilePath' }
    }
};