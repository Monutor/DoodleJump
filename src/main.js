// Импорт сцен и конфигурации
import MenuScene from './scenes/MenuScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import MainScene from './scenes/MainScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import config from './config.js';

// Добавляем сцены: MenuScene первой — стартовый экран при запуске
config.scene = [MenuScene, LoadingScene, MainScene, GameOverScene, SettingsScene];

// Инициализация игры
const game = new Phaser.Game(config);