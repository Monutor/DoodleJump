// Сцена загрузки ресурсов
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;

        // Фон загрузки
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Заголовок
        const titleText = this.add.text(width / 2, 150, 'Загрузка...', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);

        // Прогресс-бар (фон)
        const progressBarBg = this.add.rectangle(width / 2, 300, 280, 30, 0x33334a);
        progressBarBg.setOrigin(0.5);

        // Прогресс-бар (заполнение)
        const progressBar = this.add.rectangle(width / 2 - 135, 300, 0, 20, 0x4ade80);
        progressBar.setOrigin(0, 0.5);

        // Процент загрузки
        const progressText = this.add.text(width / 2, 340, '0%', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        progressText.setOrigin(0.5);

        // Индикатор загрузки
        this.load.on('progress', (value) => {
            const percent = Math.round(value * 100);
            progressBar.width = 270 * value;
            progressText.setText(`${percent}%`);
        });

        // === Загрузка ресурсов для основной игры ===

        // Фон игры (облака)
        this.load.image('background', 'assets/background_clouds.png');

        // Платформы
        this.load.image('platform', 'assets/terrain_grass_cloud_middle.png');
        this.load.image('platform_normal', 'assets/assetsImg/Sprites/Tiles/Default/terrain_grass_cloud_middle.png');
        this.load.image('platform_moving', 'assets/assetsImg/Sprites/Tiles/Default/terrain_stone_cloud_middle.png');
        this.load.image('platform_spring', 'assets/assetsImg/Sprites/Tiles/Default/spring.png');
        this.load.image('platform_breaking', 'assets/assetsImg/Sprites/Tiles/Default/bridge_logs.png');
        this.load.image('platform_flashing', 'assets/assetsImg/Sprites/Tiles/Default/terrain_purple_cloud_middle.png');
        this.load.image('platform_boost', 'assets/assetsImg/Sprites/Tiles/Default/block_red.png');

        // Персонаж
        this.load.image('player', 'assets/character_pink_front.png');

        // Бонусы и препятствия
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('bonus_star', 'assets/bonus_star.png');

        // Звуки
        this.load.audio('sfx_jump', 'assets/assetsImg/Sounds/sfx_jump.ogg');
        this.load.audio('sfx_jump_high', 'assets/assetsImg/Sounds/sfx_jump-high.ogg');
        this.load.audio('sfx_coin', 'assets/assetsImg/Sounds/sfx_coin.ogg');
        this.load.audio('sfx_hurt', 'assets/assetsImg/Sounds/sfx_hurt.ogg');
        this.load.audio('sfx_disappear', 'assets/assetsImg/Sounds/sfx_disappear.ogg');
        this.load.audio('sfx_magic', 'assets/assetsImg/Sounds/sfx_magic.ogg');
        this.load.audio('sfx_bump', 'assets/assetsImg/Sounds/sfx_bump.ogg');
        this.load.audio('sfx_select', 'assets/assetsImg/Sounds/sfx_select.ogg');
        this.load.audio('sfx_throw', 'assets/assetsImg/Sounds/sfx_throw.ogg');
    }

    create() {
        // Задержка перед переходом, чтобы игрок успел увидеть загрузку
        this.time.delayedCall(2000, () => {
            this.scene.start('MainScene');
        });
    }
}

export default LoadingScene;
