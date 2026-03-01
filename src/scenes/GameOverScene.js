// Сцена Game Over
import Storage from '../utils/Storage.js';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        // Фон и персонаж для экрана проигрыша
        this.load.image('background', 'assets/assetsImg/Sprites/Backgrounds/Default/background_solid_sky.png');
        this.load.image('player_hit', 'assets/assetsImg/Sprites/Characters/Default/character_pink_hit.png');
        this.load.image('star', 'assets/assetsImg/Sprites/Tiles/Default/star.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Фоновое изображение
        this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        // Получаем данные о счете (если переданы)
        const score = this.scene.settings.data?.score || 0;
        const previousBestScore = this.scene.settings.data?.bestScore || Storage.loadBestScore();

        // Проверяем и сохраняем новый рекорд
        const bestScore = Math.max(score, previousBestScore);
        if (score > previousBestScore) {
            Storage.saveBestScore(score);
        }

        // Добавляем персонажа в состоянии падения
        const player = this.add.image(width / 2, 120, 'player_hit');
        player.setScale(1.2);
        player.setAngle(-15);

        // Создаем надпись "Вы упали"
        const gameOverText = this.add.text(
            width / 2,
            200,
            'Вы упали!',
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ff4444',
                fontStyle: 'bold',
                stroke: '#880000',
                strokeThickness: 4
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 3);

        // Создаем текст с результатом
        const scoreText = this.add.text(
            width / 2,
            280,
            `Счёт: ${score}`,
            {
                fontSize: '36px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        );
        scoreText.setOrigin(0.5);
        scoreText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 3);

        // Показываем, если установлен новый рекорд
        if (score > previousBestScore) {
            // Добавляем звёздочки вокруг текста
            for (let i = 0; i < 5; i++) {
                const star = this.add.image(
                    width / 2 + (i - 2) * 25,
                    330,
                    'star'
                );
                star.setScale(0.6);
                star.setAngle(Phaser.Math.Between(0, 360));
                
                this.tweens.add({
                    targets: star,
                    angle: star.angle + 360,
                    duration: 2000,
                    repeat: -1,
                    ease: 'Linear'
                });
            }

            const newRecordText = this.add.text(
                width / 2,
                360,
                'НОВЫЙ РЕКОРД!',
                {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: '#ffd700',
                    fontStyle: 'bold',
                    stroke: '#ff6b00',
                    strokeThickness: 3
                }
            );
            newRecordText.setOrigin(0.5);
            newRecordText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 3);
        }

        // Отображение лучшего счёта
        const bestScoreText = this.add.text(
            width / 2,
            410,
            `Лучший: ${bestScore}`,
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffff00',
                fontStyle: 'bold'
            }
        );
        bestScoreText.setOrigin(0.5);
        bestScoreText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 3);

        // Создаем кнопку "Перезапустить игру"
        const restartButton = this.add.rectangle(
            width / 2,
            480,
            240,
            60,
            0x4ade80
        );
        restartButton.setInteractive({ useHandCursor: true });

        // Текст на кнопке
        const restartButtonText = this.add.text(
            width / 2,
            480,
            'Заново',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#000000',
                fontStyle: 'bold'
            }
        );
        restartButtonText.setOrigin(0.5);
        restartButtonText.setShadow(2, 2, 'rgba(0,0,0,0.3)', 2);

        // Обработка нажатия на кнопку
        restartButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        // Эффект при наведении на кнопку
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x00cc00);
        });

        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x00ff00);
        });

        // Добавляем инструкцию внизу экрана
        const instructionText = this.add.text(
            width / 2,
            560,
            'Нажмите ПРОБЕЛ или кликните для перезапуска',
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#cccccc',
                align: 'center'
            }
        );
        instructionText.setOrigin(0.5);
        instructionText.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);

        // Обработка нажатия пробела для перезапуска
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('MainScene');
        });

        // Обработка клика по экрану для перезапуска (кроме кнопки — она обрабатывается отдельно)
        this.input.on('pointerdown', (pointer) => {
            if (!restartButton.getBounds().contains(pointer.x, pointer.y)) {
                this.scene.start('MainScene');
            }
        });
    }
}

export default GameOverScene;