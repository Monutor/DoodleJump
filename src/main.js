// Импорт сцен и конфигурации
import MenuScene from './scenes/MenuScene.js';
import MainScene from './scenes/MainScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import config from './config.js';

// Добавляем сцены: MenuScene первой — стартовый экран при запуске
// config.scene = [MainScene, GameOverScene];
config.scene = [MenuScene, MainScene, GameOverScene];

// Инициализация игры
const game = new Phaser.Game(config);