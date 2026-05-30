export const EQUIPMENT = {
  food: {
    scantyRation: { name: 'Скудный рацион', price: 10, sprite: 'correctFilePath' },
    normalRation: { name: 'Нормированный рацион', price: 25, sprite: 'correctFilePath' },
    generousRation: { name: 'Щедрый рацион', price: 50, sprite: 'correctFilePath' },
  },
  water: {
    wasteWater: { name: 'Кипячённая отходная вода', price: 5, sprite: 'correctFilePath' },
    meltSnow: { name: 'Топлённый снег', price: 15, sprite: 'correctFilePath' },
    springWater: { name: 'Родниковая вода', price: 35, sprite: 'correctFilePath' },
  },

  miningMaterials: {
    pickaxes: { name: 'Кирки', price: 20, usefulAt: 0, requiredAt: 20, sprite: 'correctFilePath' },
    mattocks: { name: 'Кайла', price: 40, usefulAt: 20, requiredAt: 40, sprite: 'correctFilePath' },
    crowbarsAndHammers: { name: 'Ломы и кувалды', price: 75, usefulAt: 40, requiredAt: 55, sprite: 'correctFilePath' },
    hammerAndWedges: { name: 'Молот и клинья', price: 120, usefulAt: 55, requiredAt: 70, sprite: 'correctFilePath' },
    handDrills: { name: 'Ручные буры', price: 180, usefulAt: 70, requiredAt: 80, sprite: 'correctFilePath' },
    explosiveCharges: { name: 'Взрывные заряды', price: 300, usefulAt: 80, requiredAt: 90, sprite: 'correctFilePath' },
  },

  researchMaterials: {
    stationery: { name: 'Чернила, перья и бумага', price: 20, usefulAt: 0, requiredAt: 20, sprite: 'correctFilePath' },
    fieldManuals: { name: 'Полевые справочники', price: 40, usefulAt: 20, requiredAt: 40, sprite: 'correctFilePath' },
    glassware: { name: 'Мерные ёмкости и колбы', price: 75, usefulAt: 40, requiredAt: 55, sprite: 'correctFilePath' },
    reagents: { name: 'Реагенты и растворители', price: 120, usefulAt: 55, requiredAt: 70, sprite: 'correctFilePath' },
    opticalInstruments: { name: 'Оптические приборы', price: 180, usefulAt: 70, requiredAt: 80, sprite: 'correctFilePath' },
    scientificApparatus: { name: 'Сложная аппаратура', price: 300, usefulAt: 80, requiredAt: 90, sprite: 'correctFilePath' },
  },

  buildingMaterials: {
    lightingKit: { name: 'Фонари и масло', price: 20, usefulAt: 0, requiredAt: 20, sprite: 'correctFilePath' },
    scaffolding: { name: 'Строительные леса и крепежи', price: 40, usefulAt: 20, requiredAt: 40, sprite: 'correctFilePath' },
    mineProps: { name: 'Опоры для шахт', price: 75, usefulAt: 40, requiredAt: 55, sprite: 'correctFilePath' },
    railKit: { name: 'Рельсы и вагонетки', price: 120, usefulAt: 55, requiredAt: 70, sprite: 'correctFilePath' },
    winches: { name: 'Лебёдки и тросы', price: 180, usefulAt: 70, requiredAt: 80, sprite: 'correctFilePath' },
    pumps: { name: 'Шахтные насосы', price: 300, usefulAt: 80, requiredAt: 90, sprite: 'correctFilePath' },
  },

  scoutingMaterials: {
    chalkAndCompass: { name: 'Мел для отметок и компас', price: 20, usefulAt: 0, requiredAt: 20, sprite: 'correctFilePath' },
    expeditionBoots: { name: 'Экспедиционная обувь', price: 40, usefulAt: 20, requiredAt: 40, sprite: 'correctFilePath' },
    qualityTorches: { name: 'Качественные факела', price: 75, usefulAt: 40, requiredAt: 55, sprite: 'correctFilePath' },
    ropesAndHooks: { name: 'Верёвки и крюки', price: 120, usefulAt: 55, requiredAt: 70, sprite: 'correctFilePath' },
    cartographyKit: { name: 'Набор картоделания', price: 180, usefulAt: 70, requiredAt: 80, sprite: 'correctFilePath' },
    cagedCanaries: { name: 'Клетки с канарейками', price: 300, usefulAt: 80, requiredAt: 90, sprite: 'correctFilePath' },
  }
};