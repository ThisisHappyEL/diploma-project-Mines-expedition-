import { SceneManager } from './core/SceneManager.js';
import { HubScene } from './scenes/HubScene.js';
import { TooltipManager } from './managers/hubLocationManagers/TooltipManager.js';
import { SaveManager } from './managers/SaveManager.js';
import { GameState } from './core/GameState.js';

SceneManager.init('mainCanvas');
TooltipManager.init();

const activeProfileId = SaveManager.getActiveProfileId();
SaveManager.loadGame(activeProfileId);

SceneManager.changeScene(HubScene);
GameState.updateTopBarUI(); 

document.getElementById('btn-profiles-open').onclick = () => {
    SaveManager.showProfileSelector();
};
