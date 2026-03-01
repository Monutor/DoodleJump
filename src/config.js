const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }, // Уменьшили гравитацию для более плавного падения
            debug: false // Отключаем debug режим для лучшей производительности
        }
    },
    scene: [],
    // Настройки аудио
    audio: {
        disableWebAudio: false, // Не отключаем Web Audio API
        noAudio: false // Включаем звук по умолчанию
    },
    // Оптимизация производительности
    fps: {
        target: 60, // Целевой FPS
        forceSetTimeOut: true // Использовать setTimeout для стабильности
    },
    // Оптимизация рендеринга
    render: {
        pixelArt: true, // Включаем pixel art для лучшего качества спрайтов
        antialias: false, // Отключаем сглаживание для пиксельных игр
        roundPixels: true, // Округляем пиксели для более четкого отображения
        batchSize: 2048 // Оптимизация batch рендеринга
    },
    // Оптимизация памяти
    texture: {
        filterMode: 0 // Используем nearest neighbor для пиксельных игр
    }
};

export default config;
