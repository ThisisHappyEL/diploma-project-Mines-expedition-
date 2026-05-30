import { HUB_LOCATIONS } from '../data/hubData/hubLocations.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { HubManager } from '../managers/hubLocationManagers/HubManager.js';
import { ExploreScene } from './ExploreScene.js'; 

export const HubScene = {
    keydownRef: null,
    contextmenuRef: null,
    
    // Кэш для картинок, чтобы не загружать их каждый кадр
    bgImages: {}, 

    init() {
        document.getElementById('ui-hub').classList.remove('hidden');
        document.getElementById('top-bar').classList.remove('hidden');
        
        GameState.updateTopBarUI();
        this.renderMenu();

        this.loadBackgrounds();

        this.keydownRef = this.handleGlobalKeydown.bind(this);
        this.contextmenuRef = this.handleGlobalContextmenu.bind(this);

        document.addEventListener('keydown', this.keydownRef);
        document.addEventListener('contextmenu', this.contextmenuRef);
    },

    loadBackgrounds() {
        const fileNames = [
            'mainBackground', 'arsenal', 'barracks', 'cleat', 
            'manager', 'tavern_recruits', 'warehouse',
            'hospital', 'bazaar', 'forge'
        ];

        fileNames.forEach(name => {
            const img = new Image();
            img.src = `assets/img/backgrounds/hubLocations/${name}.png`;
            this.bgImages[name] = img;
        });
    },

    renderMenu() {
        const menuContainer = document.getElementById('hub-menu');
        menuContainer.innerHTML = '';

        const getImageName = (id) => {
            if (id.includes('office') || id.includes('manager')) return 'manager';
            if (id === 'tavern') return 'tavern_recruits';
            return id;
        };

        const createRichButton = (id, name, isMajor = false, customClass = '') => {
            const btn = document.createElement('button');
            btn.className = `menu-nav-btn ${isMajor ? 'hub-btn-major ' + customClass : ''}`;
            
            let bgName = getImageName(id);
            let bgHtml = '';
            
            if (id !== 'end_cycle') {
                bgHtml = `<div class="menu-btn-bg" style="background-image: url('assets/img/backgrounds/hubLocations/${bgName}.png');"></div>`;
            }

            btn.innerHTML = `
                ${bgHtml}
                <span style="position: relative; z-index: 2; font-size: ${isMajor ? '20px' : '16px'}; text-transform: uppercase; letter-spacing: 1px;">${name}</span>
            `;
            return btn;
        };

        HUB_LOCATIONS.forEach((loc) => {
            if (loc.id === 'cleat') return;

            let btn = createRichButton(loc.id, loc.name);
            btn.onclick = () => HubManager.openBuilding(loc);
            menuContainer.appendChild(btn);
        });


        const cleatLoc = HUB_LOCATIONS.find(loc => loc.id === 'cleat');
        if (cleatLoc) {
            let btnCleat = createRichButton(cleatLoc.id, cleatLoc.name, true, 'btn-cleat');
            btnCleat.onclick = () => HubManager.openBuilding(cleatLoc);
            menuContainer.appendChild(btnCleat);
        }

        let btnEndCycle = createRichButton('end_cycle', 'Завершить цикл', true, 'btn-end-cycle');
        btnEndCycle.onclick = () => HubManager.showEndCycleModal();
        menuContainer.appendChild(btnEndCycle);
    },


    handleGlobalKeydown(e) {
        const modal = document.getElementById('char-details-modal');
        const upgradeModal = document.getElementById('upgrade-modal');
        const biomeModal = document.getElementById('biome-modal');
        const equipModal = document.getElementById('equip-modal');
        const bestiaryModal = document.getElementById('bestiary-modal');
        const buildingUI = document.getElementById('building-ui');

        if (e.key === 'Escape') {
            if (bestiaryModal && !bestiaryModal.classList.contains('hidden')) {
                bestiaryModal.classList.add('hidden');
            } else if (equipModal && !equipModal.classList.contains('hidden')) {
                equipModal.classList.add('hidden');
            } else if (biomeModal && !biomeModal.classList.contains('hidden')) {
                biomeModal.classList.add('hidden');
            } else if (upgradeModal && !upgradeModal.classList.contains('hidden')) {
                upgradeModal.classList.add('hidden');
                HubManager.refreshContent(HubManager.currentBuildingId);
            } else if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                HubManager.refreshContent(HubManager.currentBuildingId);
            } else if (buildingUI && !buildingUI.classList.contains('hidden')) {
                buildingUI.classList.add('hidden');
            }
            return;
        }

        if (e.key === 'l') {
            e.preventDefault();
            HubManager.openBuilding({ id: 'cleat', name: 'Клеть', description: 'Огромное колесо-подъемник. Путь в недра начинается здесь.' });
            return;
        }

        const num = parseInt(e.key);
        if (num >= 1 && num <= 8) {
            const menuContainer = document.getElementById('hub-menu');
            if (menuContainer) {
                const buttons = menuContainer.querySelectorAll('.hub-btn:not(.hub-btn-major)');
                if (buttons && buttons[num - 1]) buttons[num - 1].click(); 
            }
        }
    },

    handleGlobalContextmenu(e) {
        e.preventDefault(); 
        const modal = document.getElementById('char-details-modal');
        const upgradeModal = document.getElementById('upgrade-modal');
        const biomeModal = document.getElementById('biome-modal');
        const equipModal = document.getElementById('equip-modal');
        const bestiaryModal = document.getElementById('bestiary-modal');
        const buildingUI = document.getElementById('building-ui');
        
        const clickedInteractive = e.target.closest('.char-row, .char-card, .equip-slot-square, .inv-item, .hub-btn, #building-content');
        
        if (!clickedInteractive) {
            if (bestiaryModal && !bestiaryModal.classList.contains('hidden')) {
                bestiaryModal.classList.add('hidden');
            } else if (equipModal && !equipModal.classList.contains('hidden')) {
                equipModal.classList.add('hidden');
            } else if (biomeModal && !biomeModal.classList.contains('hidden')) {
                biomeModal.classList.add('hidden');
            } else if (upgradeModal && !upgradeModal.classList.contains('hidden')) {
                upgradeModal.classList.add('hidden');
                HubManager.refreshContent(HubManager.currentBuildingId);
            } else if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                HubManager.refreshContent(HubManager.currentBuildingId);
            } else if (buildingUI && !buildingUI.classList.contains('hidden')) {
                buildingUI.classList.add('hidden');
            }
        }
    },

    draw(ctx, canvas) {
        let bgKey = 'mainBackground';
        const buildingUI = document.getElementById('building-ui');
        
        if (buildingUI && !buildingUI.classList.contains('hidden') && HubManager.currentBuildingId) {
            bgKey = HubManager.currentBuildingId;
            
            if (bgKey.includes('office') || bgKey.includes('manager')) {
                bgKey = 'manager';
            }
            
            if (!this.bgImages[bgKey] || !this.bgImages[bgKey].complete || this.bgImages[bgKey].naturalWidth === 0) {
                bgKey = 'mainBackground';
            }
        }

        const img = this.bgImages[bgKey];

        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(15, 12, 10, 0.65)"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grd.addColorStop(0, "#1a1612");
            grd.addColorStop(1, "#0a0806");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    destroy() {
        document.removeEventListener('keydown', this.keydownRef);
        document.removeEventListener('contextmenu', this.contextmenuRef);

        const buildingUI = document.getElementById('building-ui');
        if (buildingUI) buildingUI.classList.add('hidden');
        
        document.getElementById('ui-hub').classList.add('hidden');
    }
};