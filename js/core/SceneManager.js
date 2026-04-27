export class SceneManager {
    static currentScene = null;
    static canvas = null;
    static ctx = null;

    static init(canvasId) {
        SceneManager.canvas = document.getElementById(canvasId);
        SceneManager.ctx = SceneManager.canvas.getContext('2d');
        SceneManager.loop();
    }

    static changeScene(newScene) {
        document.getElementById('ui-hub').classList.add('hidden');
        document.getElementById('ui-explore').classList.add('hidden');
        document.getElementById('ui-battle').classList.add('hidden');
        document.getElementById('top-bar').classList.add('hidden');

        if (SceneManager.currentScene && SceneManager.currentScene.destroy) {
            SceneManager.currentScene.destroy();
        }

        SceneManager.currentScene = newScene;

        if (SceneManager.currentScene && SceneManager.currentScene.init) {
            SceneManager.currentScene.init();
        }
    }

    static loop() {
        SceneManager.ctx.clearRect(0, 0, SceneManager.canvas.width, SceneManager.canvas.height);
        
        if (SceneManager.currentScene && SceneManager.currentScene.draw) {
            SceneManager.currentScene.draw(SceneManager.ctx, SceneManager.canvas);
        }

        requestAnimationFrame(() => SceneManager.loop());
    }
}