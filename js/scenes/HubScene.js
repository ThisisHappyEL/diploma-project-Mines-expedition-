import { HUB_LOCATIONS } from '../data/hubLocations.js';
import { GameState } from '../core/GameState.js';
import { SceneManager } from '../core/SceneManager.js';
import { HubManager } from '../managers/HubManager.js';
import { ExploreScene } from './ExploreScene.js'; 

export const HubScene = {
    init() {
        document.getElementById('ui-hub').classList.remove('hidden');
        document.getElementById('top-bar').classList.remove('hidden');
        
        GameState.updateTopBarUI();
        this.renderMenu();
    },

    renderMenu() {
        const menuContainer = document.getElementById('hub-menu');
        menuContainer.innerHTML = '';

        HUB_LOCATIONS.forEach(loc => {
            let btn = document.createElement('button');
            btn.className = 'hub-btn';
            btn.innerText = loc.name;
            
            btn.onclick = () => HubManager.openBuilding(loc);
            
            menuContainer.appendChild(btn);
        });
    },

    showLocationInfo(loc) {
        const infoPanel = document.getElementById('hub-info');
        infoPanel.style.display = 'block';
        
        document.getElementById('hub-info-title').innerText = loc.name;
        document.getElementById('hub-info-desc').innerText = loc.description;
        
        const actionBtn = document.getElementById('hub-action-btn');
        
        actionBtn.onclick = () => {
            if (loc.action === 'OPEN_EXPEDITION') {
                SceneManager.changeScene(ExploreScene);
            } else {
                HubManager.openBuilding(loc);
            }
        };
    },

    draw(ctx, canvas) {
        const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grd.addColorStop(0, "#1a1612");
        grd.addColorStop(1, "#0a0806");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.font = "bold 80px Arial";
        ctx.fillText("КЛЕТЬЕВОЙ ДВОР", 280, 100);
    },

    destroy() {
        const infoPanel = document.getElementById('hub-info');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }

        const buildingUI = document.getElementById('building-ui');
        if (buildingUI) {
            buildingUI.classList.add('hidden');
        }
        
        document.getElementById('ui-hub').classList.add('hidden');
    }
};