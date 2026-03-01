// Стартовый экран (меню) Doodle Jump
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Фон меню — нейтральное небо
        this.load.image('background', 'assets/assetsImg/Sprites/Backgrounds/Default/background_solid_sky.png');

        // Персонаж для меню
        this.load.image('player_idle', 'assets/assetsImg/Sprites/Characters/Default/character_pink_idle.png');

        // Звуки
        this.load.audio('sfx_select', 'assets/assetsImg/Sounds/sfx_select.ogg');
        this.load.audio('sfx_jump', 'assets/assetsImg/Sounds/sfx_jump.ogg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Фоновое изображение на весь экран
        this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        // Разблокировка звука при первом взаимодействии (для обхода политики автовоспроизведения браузеров)
        // https://developer.chrome.com/blog/autoplay/#web_audio
        const unlockAudio = () => {
            if (this.sound.locked) {
                this.sound.unlock();
            }
            this.input.off('pointerdown', unlockAudio);
            this.input.keyboard.off('keydown', unlockAudio);
        };

        this.input.on('pointerdown', unlockAudio);
        this.input.keyboard.on('keydown', unlockAudio);

        // Заголовок игры
        const titleText = this.add.text(width / 2, 120, 'Doodle Jump', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#333333',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);
        titleText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 4);

        // Добавляем персонажа по центру
        const player = this.add.image(width / 2, 200, 'player_idle');
        player.setScale(1.2);

        // Анимация персонажа (покачивание)
        this.tweens.add({
            targets: player,
            angle: 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Подзаголовок
        const subtitleText = this.add.text(width / 2, 260, 'Добро пожаловать!', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#e0e0e0'
        });
        subtitleText.setOrigin(0.5);

        // Кнопка «Играть»
        const playButton = this.add.rectangle(width / 2, 380, 220, 60, 0x4ade80);
        playButton.setInteractive({ useHandCursor: true });

        const playButtonText = this.add.text(width / 2, 380, 'Играть', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#1a1a1a',
            fontStyle: 'bold'
        });
        playButtonText.setOrigin(0.5);
        playButtonText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 2);

        // Запуск игры по клику по кнопке
        const startGame = () => {
            // Звук подтверждения при старте игры
            this.sound.play('sfx_jump', { volume: 0.6 });
            this.scene.start('MainScene');
        };

        playButton.on('pointerdown', startGame);

        // Подсветка кнопки при наведении со звуком
        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x22c55e);
            // Звук выбора при наведении
            if (!this.sound.get('sfx_select')?.isPlaying) {
                this.sound.play('sfx_select', { volume: 0.4 });
            }
        });

        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x4ade80);
        });

        // Запуск по пробелу или Enter
        this.input.keyboard.on('keydown-SPACE', () => {
            this.sound.play('sfx_select', { volume: 0.4 });
            startGame();
        });
        this.input.keyboard.on('keydown-ENTER', () => {
            this.sound.play('sfx_select', { volume: 0.4 });
            startGame();
        });

        // Подсказка внизу экрана
        const hintText = this.add.text(width / 2, 540, 'Нажмите ПРОБЕЛ, ENTER или кнопку «Играть»', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#999999',
            align: 'center'
        });
        hintText.setOrigin(0.5);
        hintText.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);
    }

    /**
     * Очистка при уходе со сцены — снимаем слушатели клавиатуры
     */
    shutdown() {
        this.input.keyboard?.off('keydown-SPACE');
        this.input.keyboard?.off('keydown-ENTER');
    }
}

export default MenuScene;
