import config from './config.js';
import GameScene from './gameScene.js';
import './audioControl.js';
import { setupAccessibility } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    setupAccessibility();
    initGame();
});

function initGame() {
    const gameConfig = {
        ...config.phaser,
        width: config.canvas.width(),
        height: config.canvas.height(),
        scene: [GameScene]
    };

    const game = new Phaser.Game(gameConfig);

    window.addEventListener('resize', () => {
        game.scale.resize(
            Math.max(config.canvas.width(), config.canvas.minWidth),
            Math.max(config.canvas.height(), config.canvas.minHeight)
        );
    });
    
    window.gameInstance = game;
}

// Add a beforeunload event listener to warn users before leaving
window.addEventListener('beforeunload', (event) => {
    // Check if game is in progress (defined by having plants)
    const gameScene = window.gameInstance?.scene.getScene('scene-game');
    
    if (gameScene && gameScene.plants && gameScene.plants.some(plant => plant)) {
        // Warn user before leaving if they have plants growing
        event.preventDefault();
        event.returnValue = 'You have plants growing! Are you sure you want to leave?';
        return event.returnValue;
    }
});
//for map
const images = [ new Image(), new Image()];
images[0].src = 'assets/images/level_0.png';
images[1].src = 'assets/images/level_1.png';