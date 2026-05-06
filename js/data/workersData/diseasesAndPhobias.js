export const DISEASES_AND_PHOBIAS = [
    {
        name: "Алкоголизм", tier: -1, curable: "Терапия", atStart: true,
        description: "Ищет спасение от мрака на дне бутылки.",
        effect: { stamina: -10, research: -1, construction: -1, scouting: -1 },
        globalEffect: "В трезвом виде -2 ко всем характеристикам. В пьяном виде расход выносливости х0.5.",
        combatEffect: "Аналогично глобальному эффекту."
    },
    {
        name: "Альбинизм", tier: -1, curable: false, atStart: true,
        description: "Отсутствие пигмента делает кожу и глаза крайне чувствительными.",
        effect: { hp: -5, scouting: 1 },
        globalEffect: "Нет.",
        combatEffect: "Хуже переносит ДОТ огня и яркие вспышки."
    },
    {
        name: "Анемия", tier: -1, curable: true, atStart: true,
        description: "Слабость из-за нехватки железа в крови.",
        effect: { hp: -5, stamina: -15, battle: -1, mining: -1 },
        globalEffect: "Устаёт в 1.5 раза быстрее от любой деятельности.",
        combatEffect: "Аналогично глобальному эффекту."
    },
    {
        name: "Артрит", tier: -2, curable: false, atStart: true,
        description: "Воспаление суставов от постоянной пещерной сырости.",
        effect: { stamina: -20, battle: -2, mining: -1, construction: -1 },
        globalEffect: "В периоды обострений и без отдыха - огромный дебафф к проф. статам.",
        combatEffect: "Аналогично глобальному эффекту."
    },
    {
        name: "Астматик", tier: -2, curable: false, atStart: true,
        description: "Хронические проблемы с дыханием. Пещерная пыль только ухудшает дело.",
        effect: { hp: -5, stamina: -30, battle: -1, mining: -2 },
        globalEffect: "При низком уровне обустройства шахты теряет здоровье и выносливость.",
        combatEffect: "Не определено."
    },
    {
        name: "Аутизм", tier: 0, curable: false, atStart: true,
        description: "Своеобразное восприятие мира. Трудности в общении, но высочайшая концентрация.",
        effect: { research: 2, construction: 1, scouting: -2 },
        globalEffect: "Не может участвовать в социальных активностях. Игнорирует насмешки.",
        combatEffect: "Аналогично глобальному эффекту."
    },
    {
        name: "Безумие", tier: -3, curable: "Терапия", atStart: "Редко",
        description: "Разум окончательно треснул под давлением подземелий.",
        effect: { battle: -3, mining: -3, research: -4, construction: -3, scouting: -3 },
        globalEffect: "Каждый час работ может откатить прогресс в одном из прогресс-баров.",
        combatEffect: "Неконтролируем. Ходит сам, может атаковать союзника."
    },
    {
        name: "Бессонница", tier: -1, curable: true, atStart: true,
        description: "Сон поверхностный и тревожный. Кажется, камни шепчут.",
        effect: { hp: -5, stamina: -20, research: -1, scouting: -2 },
        globalEffect: "В два раза хуже восстанавливается при отдыхе в хабе/на привале.",
        combatEffect: "Иммунитет к усыплению."
    },
    {
        name: "Биполярное расстройство", tier: -2, curable: "Терапия", atStart: true,
        description: "Чередование периодов мании и глубокой депрессии.",
        effect: { battle: 0 },
        globalEffect: "Каждый чётный/нечётный час работы получает бонус или штраф +/- 3 к статам.",
        combatEffect: "Каждый нечётный ход бонус +3 ко всем статам, каждый чётный ход - штраф -3."
    },
    {
        name: "Близорукий", tier: -1, curable: false, atStart: true,
        description: "Плохо видит вдаль. Во тьме пещер это не так критично, но всё же...",
        effect: { battle: -1, scouting: -4 },
        globalEffect: "Нет.",
        combatEffect: "Дальнобойные навыки имеют штраф к броску на попадание."
    },
    {
        name: "Боязнь боли (Альгофобия)", tier: -2, curable: "Терапия", atStart: true,
        description: "Панический страх физических страданий.",
        effect: { stamina: -10, battle: -2 },
        globalEffect: "При получении травм во время работы теряет выносливость.",
        combatEffect: "При получении удара автоматически отступает на позицию назад."
    },
    {
        name: "Вегетарианец", tier: 0, curable: false, atStart: true,
        description: "Отказ от мяса. Найти в пещарах зелень — та еще задача.",
        effect: { },
        globalEffect: "Дебафф к приёму пищи (ест хуже или требует особую еду).",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Гастрит", tier: -1, curable: true, atStart: true,
        description: "Желудок сорван гнилой водой и сомнительными грибами.",
        effect: { hp: -10, stamina: -10, mining: -1 },
        globalEffect: "Нуждается в качественной пище. От плохой еды теряет выносливость.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Гигантизм", tier: 0, curable: false, atStart: true,
        description: "Аномальный рост костей. Силен, но сердце работает на износ.",
        effect: { hp: -10, stamina: -20, battle: 2, mining: 2, research: -1, scouting: -1 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Бонус к попаданию по нему. Удары ближнего боя: +1 к отбросу и +30% к урону."
    },
    {
        name: "Гиперсомния", tier: -1, curable: true, atStart: true,
        description: "Патологическая сонливость. Спит на ходу.",
        effect: { stamina: -30, battle: -1, mining: -1, research: -1, construction: -1, scouting: -2 },
        globalEffect: "Дольше лежит в бараке. Хуже отдыхает в перерывах.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Глисты", tier: -1, curable: true, atStart: true,
        description: "Паразиты, подхваченные от подземных свиней или крыс.",
        effect: { hp: -5, stamina: -15 },
        globalEffect: "Потребляет больше еды.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Грипп", tier: -1, curable: true, atStart: true,
        description: "Классическая лихорадка, кашель и ломота в теле.",
        effect: { hp: -10, stamina: -20, battle: -1, mining: -1, research: -1, construction: -1, scouting: -1 },
        globalEffect: "Нет.",
        combatEffect: "Доступно действие 'Прокашляться' (риск заразить соседей, но дает бафф)."
    },
    {
        name: "Дальнозоркий", tier: -1, curable: false, atStart: true,
        description: "Плохо видит вблизи. В тесных туннелях это проблема.",
        effect: { battle: -1, mining: -1, research: -2, construction: -2 },
        globalEffect: "Нет.",
        combatEffect: "Штраф к точности навыков ближнего боя."
    },
    {
        name: "Депрессия", tier: -2, curable: "Терапия", atStart: true,
        description: "Полная апатия. Не видит смысла бороться за выживание.",
        effect: { stamina: -20, battle: -1, mining: -2, research: -1, construction: -2, scouting: -2 },
        globalEffect: "Отказывается работать до прохождения реабилитации.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Дерматит", tier: -1, curable: true, atStart: true,
        description: "Кожа покрыта зудящими язвами от пещерной сырости и пыли.",
        effect: { hp: -5, research: -1, scouting: -1 },
        globalEffect: "Хуже восстанавливается в казарме.",
        combatEffect: "Каждые 3 хода тратит действие на чесотку."
    },
    {
        name: "Диабет", tier: -2, curable: false, atStart: true,
        description: "Проблемы с сахаром. Под землей сложно найти нужную диету.",
        effect: { hp: -15, stamina: -20, battle: -1, mining: -1 },
        globalEffect: "Пропуск питания крайне чреват.",
        combatEffect: "Лечение в бою эффективно только на 50%."
    },
    {
        name: "Жидкокровие (Гемофилия)", tier: -3, curable: false, atStart: true,
        description: "Кровь не сворачивается. Царапина может стать фатальной.",
        effect: { hp: -10, battle: -2, mining: -1 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Кровотечение наносит х2 урона и длится на 1 ход дольше."
    },
    {
        name: "Игровая зависимость", tier: -1, curable: "Терапия", atStart: true,
        description: "Готов проиграть последние сапоги в кости.",
        effect: { research: -1, scouting: -1 },
        globalEffect: "В конце экспедиции крадёт часть ресурсов.",
        combatEffect: "Шанс аннулировать атаку или сделать её критической (х2)."
    },
    {
        name: "Камни в почках", tier: -2, curable: true, atStart: true,
        description: "Мучительная боль из-за плохой подземной воды.",
        effect: { hp: -10, stamina: -15, battle: -1, mining: -1 },
        globalEffect: "В периоды обострения не способен выходить на вылазки.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Карликовость", tier: 0, curable: false, atStart: true,
        description: "Аномально низкий рост. Слабее, но юрче.",
        effect: { hp: -5, battle: -1, mining: -1, scouting: 2 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Штраф к попаданию по нему. Его удары: -1 к отбросу и -30% к урону."
    },
    {
        name: "Метеоризм", tier: -1, curable: true, atStart: true,
        description: "Серьезные проблемы с пищеварением. Воздух вокруг него всегда... спертый.",
        effect: { },
        globalEffect: "Ускоряет накопление Угрозы. Хуже отдых для товарищей.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Нарколепсия", tier: -2, curable: false, atStart: true,
        description: "Мозг внезапно 'отключается', погружая человека в сон.",
        effect: { battle: -1, research: -1, construction: -1, scouting: -2 },
        globalEffect: "Каждый час работы есть шанс уснуть.",
        combatEffect: "Если не получает урон 2 хода - пропускает следующий."
    },
    {
        name: "Оспа", tier: -3, curable: true, atStart: "Редко",
        description: "Страшная болезнь прошлого. Лицо покрывается рубцами.",
        effect: { hp: -20, stamina: -40, battle: -2, mining: -2, research: -2, construction: -2, scouting: -2 },
        globalEffect: "Крайне заразна! Оставляет уродливые шрамы (минус к соц. навыкам).",
        combatEffect: "Нет."
    },
    {
        name: "Паранойя", tier: -2, curable: "Терапия", atStart: true,
        description: "Уверен, что все вокруг строят козни.",
        effect: { research: -1, scouting: 2 },
        globalEffect: "Не отдыхает в перерывах. Плохо спит в бараке. Отказ от лазарета.",
        combatEffect: "Отказывается от любого лечения и баффов союзников."
    },
    {
        name: "Пацифизм", tier: -1, curable: "Терапия", atStart: true,
        description: "Полный отказ от насилия. Даже против монстров.",
        effect: { battle: -10 },
        globalEffect: "Нет эффекта.",
        combatEffect: "Штраф к попаданию. Модификатор урона -50%."
    },
    {
        name: "Проказа (Лепра)", tier: -3, curable: false, atStart: false,
        description: "Заживо гниющая плоть. Страшное клеймо.",
        effect: { hp: -20, stamina: -20, battle: -2, mining: -2, construction: -2, scouting: -1 },
        globalEffect: "Ежесуточный шанс ухудшения всех характеристик.",
        combatEffect: "Длительность дебаффов и ДОТов на нём уменьшена на 1 (минимум 1)."
    },
    {
        name: "Простуда", tier: 0, curable: true, atStart: true,
        description: "Обычные сопли и кашель. Неприятно, но терпимо.",
        effect: { hp: -5, stamina: -10, scouting: -1 },
        globalEffect: "Ускоряет Угрозу. Дебафф ко всем проф. характеристикам.",
        combatEffect: "Нет (кроме дебаффа статов)."
    },
    {
        name: "Псориаз", tier: -1, curable: false, atStart: true,
        description: "Хроническое шелушение кожи на нервной почве.",
        effect: { hp: -5 },
        globalEffect: "Влияние в событиях.",
        combatEffect: "Не определено."
    },
    {
        name: "Птичий грипп", tier: -2, curable: true, atStart: "Редко",
        description: "Подхватывается от зараженных подземных птиц/летучих мышей.",
        effect: { hp: -15, stamina: -20, battle: -1, mining: -1, research: -1, construction: -1, scouting: -1 },
        globalEffect: "Общие дебаффы.",
        combatEffect: "Заражение при контакте с животными."
    },
    {
        name: "Ревматизм", tier: -2, curable: true, atStart: true,
        description: "Болезнь стариков и тех, кто долго спал на холодных камнях.",
        effect: { stamina: -15, battle: -1, mining: -1 },
        globalEffect: "При плохом обустройстве шахты получает дебаффы к статам.",
        combatEffect: "Плохо переносит воду и облитие жидкостями."
    },
    {
        name: "Синдром дефицита внимания", tier: -1, curable: false, atStart: true,
        description: "Не может долго концентрироваться на одной задаче.",
        effect: { research: -2, construction: -2, scouting: 1 },
        globalEffect: "Штраф выносливости вне пещер. Постоянно ранжирует статы в исследовании.",
        combatEffect: "Штраф выносливости при повторе действий или целей."
    },
    {
        name: "Синдром саванта", tier: 0, curable: false, atStart: true,
        description: "Гений в одном деле, абсолютно беспомощен в других.",
        effect: { },
        globalEffect: "Один случайный навык становится 20, остальные падают до 2.",
        combatEffect: "Нет (кроме дебаффа боя)."
    },
    {
        name: "Синдром самозванца", tier: -1, curable: "Терапия", atStart: true,
        description: "Считает, что не заслуживает своего места и успеха.",
        effect: { research: -1, construction: -1, scouting: -1 },
        globalEffect: "Потеря выносливости при достижении контрольных точек прогресса.",
        combatEffect: "Убийство врага вызывает потерю выносливости."
    },
    {
        name: "Синдром Туретта", tier: -1, curable: false, atStart: true,
        description: "Неконтролируемые нервные тики и выкрикивания.",
        effect: { construction: -1, scouting: -2 },
        globalEffect: "Заметно увеличивает рост Угрозы.",
        combatEffect: "Перманентно провоцирует всех противников (Агро)."
    },
    {
        name: "Стокгольмский синдром", tier: -1, curable: "Терапия", atStart: false,
        description: "Сочувствует врагам или бандитам, взявшим его в плен.",
        effect: { battle: -2 },
        globalEffect: "Нет.",
        combatEffect: "Удар по обидчику наносит только 50% урона."
    },
    {
        name: "Страх высоты (Акрофобия)", tier: -1, curable: "Терапия", atStart: true,
        description: "Боится бездонных подземных пропастей.",
        effect: { },
        globalEffect: "В начале экспедиции теряет выносливость (спуск в клети).",
        combatEffect: "Доп. утрата выносливости при падении в обрыв."
    },
    {
        name: "Страх животных (Зоофобия)", tier: -1, curable: "Терапия", atStart: true,
        description: "Боится подземных свиней, коз и крыс.",
        effect: { battle: -1, scouting: -1 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Удар от 'Животных' провоцирует отступ и стресс. Штраф к точности по ним."
    },
    {
        name: "Страх замкнутых пространств (Клаустрофобия)", tier: -3, curable: "Терапия", atStart: true,
        description: "Худшая фобия для жителя подземелий.",
        effect: { stamina: -10, battle: -1, mining: -2, scouting: -1 },
        globalEffect: "Устаёт под землёй в х2 раза быстрее. Зависит от обустройства шахт.",
        combatEffect: "Нет (кроме дебаффа боя)."
    },
    {
        name: "Страх костей и внутренностей", tier: -1, curable: "Терапия", atStart: true,
        description: "Тошнота от вида крови и разделки трупов.",
        effect: { battle: -1, research: -1 },
        globalEffect: "Не определено.",
        combatEffect: "Потеря выносливости после каждой смерти в бою."
    },
    {
        name: "Страх крови (Гемофобия)", tier: -2, curable: "Терапия", atStart: true,
        description: "Падает в обморок при виде открытых ран.",
        effect: { battle: -2, research: -1 },
        globalEffect: "Не определено.",
        combatEffect: "Теряет выносливость при кровотечении (своем или чужом)."
    },
    {
        name: "Страх людей (Антропофобия)", tier: -2, curable: "Терапия", atStart: true,
        description: "Тяжелая форма социофобии. Избегает толпы.",
        effect: { research: -1, scouting: 2 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Удар от 'Людей' провоцирует отступ и стресс. Штраф к точности по ним."
    },
    {
        name: "Страх насекомых (Инсектофобия)", tier: -1, curable: "Терапия", atStart: true,
        description: "Истерика при виде пещерных жуков и многоножек.",
        effect: { battle: -1, mining: -1, scouting: -1 },
        globalEffect: "Особые реакции в событиях.",
        combatEffect: "Удар от 'Насекомых' провоцирует отступ и стресс. Штраф к точности по ним."
    },
    {
        name: "Страх открытых пространств (Агорафобия)", tier: -1, curable: "Терапия", atStart: true,
        description: "Боится гигантских пещер-каверн и поверхности.",
        effect: { battle: 2, mining: 2, research: 2, construction: 2, scouting: 3 },
        globalEffect: "Плохо отдыхает в хабе, теряет выносливость ежесуточно.",
        combatEffect: "Бонусы к характеристикам под землей."
    },
    {
        name: "Страх скоплений людей (Демофобия)", tier: -1, curable: "Терапия", atStart: true,
        description: "Боится толпы и бунтов.",
        effect: { },
        globalEffect: "Не способен нормально отдохнуть в хабе.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Страх смерти (Танатофобия)", tier: -2, curable: "Терапия", atStart: true,
        description: "Навязчивый, парализующий страх гибели.",
        effect: { battle: -2 },
        globalEffect: "Не способен работать, если HP ниже 50%.",
        combatEffect: "При HP < 50% получает огромные штрафы."
    },
    {
        name: "Страх темноты (Никтофобия)", tier: -3, curable: "Терапия", atStart: true,
        description: "Первобытный ужас перед неосвещенными пещерами.",
        effect: { battle: -3, mining: -2, research: -1, construction: -1, scouting: -3 },
        globalEffect: "Штрафы к работе в плохо освещенных шахтах.",
        combatEffect: "Не определено."
    },
    {
        name: "Тиф", tier: -3, curable: true, atStart: "Редко",
        description: "Тяжелейшая лихорадка с помутнением рассудка. Заразно.",
        effect: { hp: -15, stamina: -30, battle: -2, mining: -2, research: -2, construction: -2, scouting: -2 },
        globalEffect: "Крайне заразен. Персонаж бредит и не может работать.",
        combatEffect: "Не определено."
    },
    {
        name: "Токсоплазмоз", tier: -1, curable: false, atStart: true,
        description: "Паразит в мозге. Притупляет чувство страха.",
        effect: { stamina: 10, battle: 1, research: -1, scouting: -2 },
        globalEffect: "Нет.",
        combatEffect: "После получения удара всегда движется вперёд."
    },
    {
        name: "Туберкулёз (Чахотка)", tier: -3, curable: true, atStart: true,
        description: "Кровавый кашель, сжигающий легкие.",
        effect: { hp: -20, stamina: -40, battle: -2, mining: -2, construction: -1 },
        globalEffect: "Заразно. Постоянно теряет HP. Риск захлебнуться кровью при нагрузке.",
        combatEffect: "Не определено."
    },
    {
        name: "Холера", tier: -3, curable: true, atStart: "Редко",
        description: "Смертельное обезвоживание от грязной воды.",
        effect: { hp: -25, stamina: -50, battle: -3, mining: -3, research: -3, construction: -3, scouting: -3 },
        globalEffect: "Заражает источники воды. Прикован к постели.",
        combatEffect: "Не определено."
    },
    {
        name: "Чесотка", tier: -1, curable: true, atStart: true,
        description: "Подкожный клещ. Зуд сводит с ума.",
        effect: { hp: -5, stamina: -10, battle: -1, mining: -1, research: -1, construction: -1, scouting: -1 },
        globalEffect: "Снижает настроение окружающих.",
        combatEffect: "Не определено."
    },
    {
        name: "Чума", tier: -3, curable: true, atStart: false,
        description: "Чёрная смерть. Бич тесных подземных городов.",
        effect: { hp: -30, stamina: -50, battle: -3, mining: -3, research: -3, construction: -3, scouting: -3 },
        globalEffect: "Максимальная заразность. Выкашивает унии без лечения.",
        combatEffect: "Не определено."
    },
    {
        name: "Шизофрения", tier: -3, curable: "Терапия", atStart: true,
        description: "Слышит голоса. Видит то, чего нет во тьме.",
        effect: { battle: -1, mining: -1, research: -2, construction: -2, scouting: 2 },
        globalEffect: "Шанс походить автоматически или атаковать союзника.",
        combatEffect: "Не определено."
    },
    {
        name: "Споровая гниль", tier: -2, curable: true, atStart: false,
        description: "Грибок прорастает прямо в дыхательных путях.",
        effect: { hp: -15, stamina: -20, battle: -1, mining: -2, scouting: -1 },
        globalEffect: "Заражение в грибных биомах.",
        combatEffect: "Не определено."
    },
    {
        name: "Глубинная тоска", tier: -2, curable: "Терапия", atStart: false,
        description: "Специфическая депрессия от отсутствия неба и солнца.",
        effect: { hp: -10, stamina: -20, battle: -1, mining: -1, research: -1, construction: -1, scouting: -1 },
        globalEffect: "Постоянные дебаффы из-за тоски по поверхности.",
        combatEffect: "Нет эффекта."
    },
    {
        name: "Люменная слепота", tier: -1, curable: true, atStart: false,
        description: "Ожог роговицы от ярких био-ламп и мхов.",
        effect: { battle: -2, research: -1, construction: -1, scouting: -3 },
        globalEffect: "Бонусы в неосвещенных шахтах, дебаффы в освещенных.",
        combatEffect: "Не определено."
    }
];