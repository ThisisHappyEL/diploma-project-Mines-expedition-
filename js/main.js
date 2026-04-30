import { SceneManager } from './core/SceneManager.js';
import { HubScene } from './scenes/HubScene.js';

SceneManager.init('mainCanvas');

SceneManager.changeScene(HubScene);