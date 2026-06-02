import { GameState } from '../../core/GameState.js';
import { GLASS_FOREST_ENEMIES } from '../../data/battleData/enemies.js';

export const BiomeManager = {
    selectedBestiaryEnemy: null,

    BIOMES: [
        { id: 'glassForest', name: 'Стеклянный лес', active: true, desc: 'Обширная сеть пещер, где порода кристаллизовалась. Обитают существа из живого стекла и протекают опасные токи.' },
        { id: 'amberHives', name: 'Янтарные ульи', active: false },
        { id: 'graphiteHills', name: 'Графитовые горки', active: false },
        { id: 'rustyBramble', name: 'Ржавый терновник', active: false },
        { id: 'singingPipes', name: 'Поющие трубы', active: false },
        { id: 'fatSwamp', name: 'Сало-топь', active: false },
        { id: 'mercuryMirrors', name: 'Ртутные зеркала', active: false },
        { id: 'saltHalls', name: 'Солёные чертоги', active: false },
        { id: 'magneticGardens', name: 'Магнитные сады', active: false },
        { id: 'cryoGrottos', name: 'Крио-гроты', active: false },
        { id: 'seaOfDarkness', name: 'Море Мрака', active: false },
        { id: 'basaltForge', name: 'Базальтовая кузня', active: false },
        { id: 'mudCauldrons', name: 'Грязевые котлы', active: false },
        { id: 'chitinThickets', name: 'Хитиновые чащи', active: false },
        { id: 'copperCascades', name: 'Медные каскады', active: false },
        { id: 'shiningWastes', name: 'Сияющие Пустоши', active: false }
    ],

    openBiomeModal(mainContainer) {
        const modal = document.getElementById('biome-modal');
        const body = document.getElementById('biome-body');
        modal.classList.remove('hidden');
        document.getElementById('biome-close-btn').onclick = () => modal.classList.add('hidden');

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div');
        leftCol.className = 'forge-column';
        leftCol.style.flex = '0 0 35%'; leftCol.style.maxWidth = '35%';
        leftCol.innerHTML = '<h3 style="color:#ffbf00; margin:0 0 15px 0; border-bottom:1px solid #555; padding-bottom:10px;">Доступные маршруты:</h3>';
        
        const listDiv = document.createElement('div');
        listDiv.className = 'forge-column-list';
        listDiv.style.cssText = "flex: 1; overflow-y: auto; padding-right: 5px; min-height: 0; width: 100%; display: flex; flex-direction: column; gap: 5px;";
        leftCol.appendChild(listDiv);

        let tempSelectedBiome = GameState.selectedBiome || 'glassForest';

        const renderBiomes = () => {
            listDiv.innerHTML = '';
            this.BIOMES.forEach(biome => {
                const btn = document.createElement('div');
                const isActive = tempSelectedBiome === biome.id;
                const disabledStyle = biome.active ? '' : 'opacity: 0.4; filter: grayscale(1); cursor: not-allowed;';
                
                let bgHtml = '';
                if (biome.id === 'glassForest') {
                    bgHtml = `<div style="position: absolute; top: 0; right: 0; width: 70%; height: 100%; background: url('assets/img/backgrounds/${biome.id}/${biome.id}0.png') center/cover; -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%); mask-image: linear-gradient(to right, transparent 0%, black 40%); opacity: 0.5; z-index: 1; transition: 0.2s;"></div>`;
                }

                const borderCol = isActive ? 'var(--color-gold)' : '#555';
                const bgCol = isActive ? 'var(--bg-btn)' : 'var(--bg-panel)';

                btn.style.cssText = `position: relative; overflow: hidden; padding: 15px; border: 1px solid ${borderCol}; background: ${bgCol}; cursor: ${biome.active ? 'pointer' : 'not-allowed'}; ${disabledStyle} transition: 0.2s; min-height: 55px; flex-shrink: 0;`;
                
                btn.innerHTML = `
                    ${bgHtml}
                    <div style="position: relative; z-index: 2; font-size:18px; font-weight:bold; color:#fff;">
                        ${biome.name} ${biome.active ? '' : '<span style="color:#ff4444; font-size:9px; float:right; margin-top:4px; text-transform:uppercase;">[В разработке]</span>'}
                    </div>
                `;
                
                if (biome.active) {
                    btn.onmouseenter = () => { if (!isActive) btn.style.borderColor = '#fff'; };
                    btn.onmouseleave = () => { if (!isActive) btn.style.borderColor = '#555'; };
                    btn.onclick = () => { tempSelectedBiome = biome.id; renderBiomes(); renderRightPanel(); };
                }
                listDiv.appendChild(btn);
            });
        };

        const rightCol = document.createElement('div');
        rightCol.className = 'forge-column'; rightCol.style.flex = '1'; rightCol.style.maxWidth = '65%'; rightCol.style.display = 'flex'; rightCol.style.flexDirection = 'column';

        const renderRightPanel = () => {
            const selected = this.BIOMES.find(b => b.id === tempSelectedBiome);
            const p = GameState.biomeProgress;

            const makeBar = (label, icon, val, color) => `
                <div style="margin-bottom: 6px;">
                    <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>${icon} ${label}</span><b>${val}%</b></div>
                    <div style="width:100%; height:8px; background:#111; border:1px solid #444;"><div style="width:${val}%; height:100%; background:${color};"></div></div>
                </div>`;

            let tLevel = GameState.threatLevel || 0;
            let tColor, tText, tBg;
            if(tLevel < 30) { tColor = '#4affab'; tText = 'Фауна спокойна'; tBg = 'rgba(74,255,171,0.05)'; }
            else if(tLevel < 70) { tColor = '#ffbf00'; tText = 'Обитатели насторожены'; tBg = 'rgba(255,191,0,0.05)'; }
            else { tColor = '#ff4444'; tText = 'Твари в ярости!'; tBg = 'rgba(255,68,68,0.05)'; }

            rightCol.innerHTML = `
                <h2 style="color:var(--color-gold); margin:0 0 5px 0; font-size: 32px;">${selected.name}</h2>
                <p style="color:#ccc; font-style:italic; font-size: 14px; line-height:1.4; border-left: 2px solid #555; padding-left:10px; margin: 0 0 15px 0;">${selected.desc}</p>
                
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; margin-bottom: 15px; flex-shrink: 0;">
                    <h4 style="margin:0 0 10px 0; color:#fff; border-bottom:1px solid #555; padding-bottom:5px; font-size: 14px;">ПРОГРЕСС ИССЛЕДОВАНИЯ:</h4>
                    ${makeBar('Добыча', '⛏️', p.mining, '#ffbf00')}
                    ${makeBar('Изыскания', '📚', p.research, '#b19cd9')}
                    ${makeBar('Стройка', '🔨', p.construction, '#ff7f50')}
                    ${makeBar('Разведка', '🪔', p.scouting, '#4affab')}
                </div>

                <div style="display:flex; gap:15px; flex: 1; min-height: 0;">
                    <div style="flex: 1; background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; display: flex; flex-direction: column;">
                        <h4 style="margin:0 0 10px 0; color:#fff; border-bottom:1px solid #555; padding-bottom:5px; font-size: 14px;">ДОСТУПНЫЕ НАХОДКИ:</h4>
                        <ul style="color:#aaa; font-size:13px; padding-left:20px; line-height: 1.6; margin: 0;">
                            <li>💎 Необработанные минералы</li><li>📜 Научные образцы</li><li>💀 Трофеи чудищ</li>
                        </ul>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                        <div style="flex: 1; background: ${tBg}; padding: 15px; border: 1px solid ${tColor}; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <h4 style="margin:0 auto auto 0; width: 100%; color:${tColor}; border-bottom:1px solid ${tColor}; padding-bottom:5px; text-transform: uppercase; font-size: 14px;">⚠️ Уровень угрозы:</h4>
                            <div style="font-size:42px; font-weight:bold; color:${tColor}; text-align:center; margin-top:10px;">${tLevel}%</div>
                            <div style="font-size:13px; color:#aaa; text-align:center; margin-top:5px; margin-bottom: auto;">${tText}</div>
                        </div>

                        <button id="btn-open-bestiary" class="hub-btn action-btn" style="padding: 12px; font-size: 14px; border-color: #b19cd9; color: #b19cd9; flex-shrink: 0;">📖 Открыть Бестиарий</button>
                        <button id="btn-confirm-biome" class="hub-btn action-btn" style="padding: 15px; font-size: 16px; border-color: var(--color-success); color: var(--color-success); flex-shrink: 0;">✅ Подтвердить маршрут</button>
                    </div>
                </div>
            `;

            rightCol.querySelector('#btn-open-bestiary').onclick = () => this.openBestiaryModal();
            rightCol.querySelector('#btn-confirm-biome').onclick = () => { 
                GameState.selectedBiome = tempSelectedBiome; 
                modal.classList.add('hidden'); 
                window.CleatManager.render(mainContainer); 
            };
        };

        renderBiomes();
        renderRightPanel();
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);
    },

    openBestiaryModal() {
        const modal = document.getElementById('bestiary-modal');
        const body = document.getElementById('bestiary-body');
        modal.classList.remove('hidden');
        document.getElementById('bestiary-close-btn').onclick = () => modal.classList.add('hidden');

        const DEFAULT_CONFIG = {
            list: { size: "350px", offsetX: "-120px", offsetY: "-150px", scale: "1.0" },
            detail: { size: "400px", offsetX: "0px", offsetY: "-200px", scale: "1.0" }
        };

        const ENEMY_OVERRIDES = {
            piezoCrystal: { list: { size: "350px", offsetX: "-80px", offsetY: "-150px", scale: "1.0" }, detail: { size: "400px", offsetX: "0px", offsetY: "-220px", scale: "1.0" } },
            fritta: { list: { size: "400px", offsetX: "-150px", offsetY: "-250px", scale: "1.0" }, detail: { size: "500px", offsetX: "0px", offsetY: "-310px", scale: "1.0" } },
            glassSpider: { list: { size: "475px", offsetX: "-190px", offsetY: "-290px", scale: "1.0" }, detail: { size: "600px", offsetX: "0px", offsetY: "-370px", scale: "1.0" } },
            vitrailSpider: { list: { size: "300px", offsetX: "-100px", offsetY: "-135px", scale: "1.0" }, detail: { size: "380px", offsetX: "0px", offsetY: "-170px", scale: "1.0" } },
            glassMother: { list: { size: "280px", offsetX: "-50px", offsetY: "-80px", scale: "1.0" }, detail: { size: "400px", offsetX: "0px", offsetY: "-190px", scale: "1.0" } }
        };

        const getSpriteConfig = (enemyId, viewType) => {
            const override = ENEMY_OVERRIDES[enemyId]?.[viewType];
            return override ? { ...DEFAULT_CONFIG[viewType], ...override } : DEFAULT_CONFIG[viewType];
        };

        const getVariationUrl = (enemy) => {
            if (!enemy.spriteVariations || enemy.spriteVariations <= 1) return enemy.spriteUrl;
            const variant = Math.floor(Math.random() * enemy.spriteVariations);
            return enemy.spriteUrl.replace('.png', `${variant}.png`);
        };

        body.innerHTML = '';
        const splitWrapper = document.createElement('div');
        splitWrapper.className = 'forge-split-layout';
        body.appendChild(splitWrapper);

        const leftCol = document.createElement('div'); leftCol.className = 'forge-column'; leftCol.style.flex = '0 0 35%'; leftCol.style.maxWidth = '35%';
        const listDiv = document.createElement('div'); listDiv.className = 'forge-column-list'; listDiv.style.cssText = "flex: 1; overflow-y: auto; padding-right: 5px; min-height: 0;";
        const rightCol = document.createElement('div'); rightCol.className = 'forge-column'; rightCol.style.flex = '1'; rightCol.style.maxWidth = '65%';

        const enemies = Object.values(GLASS_FOREST_ENEMIES);
        if (!this.selectedBestiaryEnemy && enemies.length > 0) this.selectedBestiaryEnemy = enemies[0].id;

        const renderList = () => {
            listDiv.innerHTML = '';
            enemies.forEach(enemy => {
                const btn = document.createElement('div');
                btn.className = `char-row ${this.selectedBestiaryEnemy === enemy.id ? 'active-rest' : ''}`;
                btn.style.cssText = `padding: 0; border: 1px solid #555; background: var(--bg-panel); margin-bottom: 5px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; height: 75px; overflow: hidden;`;
                
                const titleColor = enemy.isBoss ? 'var(--color-danger)' : '#fff';
                const rndUrl = getVariationUrl(enemy);
                const cfg = getSpriteConfig(enemy.id, 'list');

                btn.innerHTML = `
                    <div style="padding-left: 15px; font-size: 16px; font-weight:bold; color:${titleColor}; z-index: 2;">${enemy.name}</div>
                    <div class="avatar-slice" style="width: 100px; height: 100%; position: relative; flex-shrink: 0; z-index: 1;">
                        <img src="${rndUrl}" style="position: absolute; width: ${cfg.size}; height: ${cfg.size}; top: ${cfg.offsetY}; right: ${cfg.offsetX}; transform: scale(${cfg.scale}); object-fit: contain; pointer-events: none; filter: drop-shadow(-5px 0 5px rgba(0,0,0,0.8)); transform-origin: right center;">
                    </div>
                `;
                
                btn.onclick = () => { this.selectedBestiaryEnemy = enemy.id; renderList(); renderDetails(); };
                listDiv.appendChild(btn);
            });
        };

        const renderDetails = () => {
            const enemy = enemies.find(e => e.id === this.selectedBestiaryEnemy);
            if (!enemy) return;

            const bossTag = enemy.isBoss ? '<span style="color:var(--color-danger); border: 1px solid var(--color-danger); padding: 2px 6px; font-size: 11px; text-transform: uppercase;">Вожак</span>' : '';
            const envTag = enemy.isEnvironment ? '<span style="color:#aaa; border: 1px solid #aaa; padding: 2px 6px; font-size: 11px; text-transform: uppercase;">Окружение</span>' : '';
            const rndUrl = getVariationUrl(enemy);
            const cfg = getSpriteConfig(enemy.id, 'detail');

            rightCol.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #444; padding-bottom: 10px;">
                    <div>
                        <h2 style="color: #b19cd9; margin: 0; font-size: 32px;">${enemy.name}</h2>
                        <div style="margin-top: 5px; display: flex; gap: 10px;">${bossTag}${envTag}</div>
                    </div>
                    <div style="text-align: right; font-size: 14px; color: #ccc;">
                        <div>❤️ Здоровье: <b style="color: #ff6666;">${enemy.hp}</b></div>
                        <div>⚔️ Угроза: <b style="color: #ffbf00;">${enemy.combat}</b></div>
                    </div>
                </div>
                <div style="width: 100%; height: 120px; display: flex; justify-content: center; align-items: center; background: #050403; border: 1px solid #333; margin: 15px 0; overflow: visible; position: relative; flex-shrink: 0;">
                    <div style="position: absolute; width: ${cfg.size}; height: ${cfg.size}; top: ${cfg.offsetY}; left: calc(50% + ${cfg.offsetX}); transform: translateX(-50%) scale(${cfg.scale}); transform-origin: center center; pointer-events: none; z-index: 10;">
                        <img src="${rndUrl}" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(177, 156, 217, 0.4));">
                    </div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border: 1px solid #444; margin-bottom: 15px; flex-shrink: 0;">
                    <h4 style="margin-top: 0; color: #fff; font-size: 14px; text-transform: uppercase;">Сводка наблюдений:</h4>
                    <p style="color: #aaa; font-style: italic; line-height: 1.4; margin-bottom: 0;">${enemy.lore}</p>
                </div>
                <div style="background: rgba(177, 156, 217, 0.05); padding: 15px; border: 1px solid #b19cd9; overflow-y: auto; flex: 1;">
                    <h4 style="margin-top: 0; color: #b19cd9; font-size: 14px; text-transform: uppercase;">Тактика и поведение:</h4>
                    <p style="color: #ccc; line-height: 1.5; margin-bottom: 0; white-space: pre-line;">${enemy.tactics}</p>
                </div>
            `;
        };

        renderList();
        renderDetails();
        leftCol.appendChild(listDiv);
        splitWrapper.appendChild(leftCol);
        splitWrapper.appendChild(rightCol);
    }
};

window.BiomeManager = BiomeManager;
