// Сцена настроек игры
import SoundManager from '../utils/SoundManager.js';

class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    preload() {
        // Фон настроек
        this.load.image('background', 'assets/assetsImg/Sprites/Backgrounds/Default/background_solid_sky.png');
        
        // Звуки для интерфейса
        this.load.audio('sfx_select', 'assets/assetsImg/Sounds/sfx_select.ogg');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Инициализируем SoundManager для этой сцены
        SoundManager.init(this);

        // Фоновое изображение
        this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        // Заголовок
        const titleText = this.add.text(width / 2, 80, 'Настройки', {
            fontSize: '42px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#333333',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);
        titleText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 4);

        // === РАЗДЕЛ НАСТРОЙКИ ЗВУКА ===
        const soundSectionY = 180;
        
        // Заголовок раздела
        const soundTitleText = this.add.text(width / 2, soundSectionY, 'Настройка звука', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#2f2b2b',
            fontStyle: 'bold'
        });
        soundTitleText.setOrigin(0.5);

        // === КНОПКА MUTE (заглушить звук) ===
        const muteButtonY = 250;
        this.muteButton = this.add.rectangle(width / 2, muteButtonY, 280, 60, 0x4ade80);
        this.muteButton.setInteractive({ useHandCursor: true });

        this.muteButtonText = this.add.text(width / 2, muteButtonY, 'Звук: ВКЛ', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#1a1a1a',
            fontStyle: 'bold'
        });
        this.muteButtonText.setOrigin(0.5);
        this.muteButtonText.setShadow(1, 1, 'rgba(0,0,0,0.3)', 2);

        // Обновляем состояние кнопки mute
        this.updateMuteButton();

        // Обработчик кнопки mute
        this.muteButton.on('pointerdown', () => {
            const isMuted = SoundManager.toggleMute();
            this.updateMuteButton();
            
            // Звук переключения
            this.sound.play('sfx_select', { volume: 0.4 });
            
            // Визуальный эффект
            this.tweens.add({
                targets: this.muteButton,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true
            });
        });

        this.muteButton.on('pointerover', () => {
            this.muteButton.setFillStyle(0x22c55e);
            if (!this.sound.get('sfx_select')?.isPlaying) {
                this.sound.play('sfx_select', { volume: 0.3 });
            }
        });

        this.muteButton.on('pointerout', () => {
            this.muteButton.setFillStyle(0x4ade80);
        });

        // === ПОЛЗУНОК ГРОМКОСТИ ===
        const volumeSliderY = 350;
        
        // Текст "Громкость"
        const volumeLabelText = this.add.text(width / 2, volumeSliderY - 40, 'Громкость', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#2f2b2b'
        });
        volumeLabelText.setOrigin(0.5);

        // Фон ползунка
        const sliderWidth = 280;
        const sliderHeight = 20;
        this.volumeSliderBg = this.add.rectangle(width / 2, volumeSliderY, sliderWidth, sliderHeight, 0x333333);
        this.volumeSliderBg.setOrigin(0.5);

        // Заполнение ползунка (показывает текущий уровень громкости)
        const currentVolume = SoundManager.getVolume();
        this.volumeSliderFill = this.add.rectangle(
            width / 2 - sliderWidth / 2 + sliderHeight / 2, 
            volumeSliderY, 
            sliderWidth * currentVolume, 
            sliderHeight - 4, 
            0x4ade80
        );
        this.volumeSliderFill.setOrigin(0, 0.5);

        // Ползунок (кружок)
        this.volumeSliderHandle = this.add.circle(
            width / 2 - sliderWidth / 2 + sliderWidth * currentVolume,
            volumeSliderY,
            15,
            0xffffff
        );
        this.volumeSliderHandle.setInteractive({ useHandCursor: true });

        // Значения громкости
        this.volumeValueText = this.add.text(width / 2, volumeSliderY + 40, `${Math.round(currentVolume * 100)}%`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.volumeValueText.setOrigin(0.5);

        // Обработчики ползунка
        this.volumeSliderHandle.on('drag', (pointer, dragX, dragY) => {
            const minX = width / 2 - sliderWidth / 2;
            const maxX = width / 2 + sliderWidth / 2;
            
            // Ограничиваем движение ползунка
            const newX = Math.max(minX, Math.min(maxX, dragX));
            this.volumeSliderHandle.x = newX;
            
            // Вычисляем новую громкость
            const newVolume = (newX - minX) / sliderWidth;
            SoundManager.setVolume(newVolume);
            
            // Обновляем заполнение
            this.volumeSliderFill.width = sliderWidth * newVolume;
            
            // Обновляем текст
            this.volumeValueText.setText(`${Math.round(newVolume * 100)}%`);
        });

        this.volumeSliderHandle.on('pointerdown', () => {
            this.volumeSliderHandle.setFillStyle(0x22c55e);
        });

        this.volumeSliderHandle.on('pointerup', () => {
            this.volumeSliderHandle.setFillStyle(0xffffff);
            this.sound.play('sfx_select', { volume: 0.3 });
        });

        // Кнопки +/- для точной настройки
        const volumeButtonsY = volumeSliderY + 80;
        
        // Кнопка "-"
        this.volumeDownButton = this.add.circle(width / 2 - 60, volumeButtonsY, 25, 0x4ade80);
        this.volumeDownButton.setInteractive({ useHandCursor: true });
        
        const volumeDownText = this.add.text(width / 2 - 60, volumeButtonsY, '-', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#1a1a1a',
            fontStyle: 'bold'
        });
        volumeDownText.setOrigin(0.5);

        this.volumeDownButton.on('pointerdown', () => {
            SoundManager.decreaseVolume(0.1);
            this.updateVolumeSlider();
            this.sound.play('sfx_select', { volume: 0.3 });
        });

        this.volumeDownButton.on('pointerover', () => {
            this.volumeDownButton.setFillStyle(0x22c55e);
        });

        this.volumeDownButton.on('pointerout', () => {
            this.volumeDownButton.setFillStyle(0x4ade80);
        });

        // Кнопка "+"
        this.volumeUpButton = this.add.circle(width / 2 + 60, volumeButtonsY, 25, 0x4ade80);
        this.volumeUpButton.setInteractive({ useHandCursor: true });
        
        const volumeUpText = this.add.text(width / 2 + 60, volumeButtonsY, '+', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#1a1a1a',
            fontStyle: 'bold'
        });
        volumeUpText.setOrigin(0.5);

        this.volumeUpButton.on('pointerdown', () => {
            SoundManager.increaseVolume(0.1);
            this.updateVolumeSlider();
            this.sound.play('sfx_select', { volume: 0.3 });
        });

        this.volumeUpButton.on('pointerover', () => {
            this.volumeUpButton.setFillStyle(0x22c55e);
        });

        this.volumeUpButton.on('pointerout', () => {
            this.volumeUpButton.setFillStyle(0x4ade80);
        });

        // === КНОПКА "НАЗАД" ===
        const backButtonY = 520;
        const backButton = this.add.rectangle(width / 2, backButtonY, 220, 60, 0x6b7280);
        backButton.setInteractive({ useHandCursor: true });

        const backButtonText = this.add.text(width / 2, backButtonY, 'Назад', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        backButtonText.setOrigin(0.5);
        backButtonText.setShadow(1, 1, 'rgba(0,0,0,0.3)', 2);

        backButton.on('pointerdown', () => {
            this.sound.play('sfx_select', { volume: 0.4 });
            this.scene.start('MenuScene');
        });

        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x4b5563);
            if (!this.sound.get('sfx_select')?.isPlaying) {
                this.sound.play('sfx_select', { volume: 0.3 });
            }
        });

        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x6b7280);
        });

        // Подсказка
        const hintText = this.add.text(width / 2, 595, 'Нажмите для возврата в меню', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#999999'
        });
        hintText.setOrigin(0.5);
    }

    /**
     * Обновляет визуальное состояние кнопки mute
     */
    updateMuteButton() {
        const isMuted = SoundManager.isMuted();

        if (isMuted) {
            this.muteButton.setFillStyle(0xef4444);
            this.muteButtonText.setText('Звук: ВЫКЛ 🔇');
            this.muteButtonText.setColor('#ffffff');
        } else {
            this.muteButton.setFillStyle(0x4ade80);
            this.muteButtonText.setText('Звук: ВКЛ 🔊');
            this.muteButtonText.setColor('#1a1a1a');
        }
    }

    /**
     * Обновляет визуальное состояние ползунка громкости
     */
    updateVolumeSlider() {
        const width = this.cameras.main.width;
        const sliderWidth = 280;
        const volumeSliderY = 350;
        const currentVolume = SoundManager.getVolume();

        // Обновляем позицию ползунка
        this.volumeSliderHandle.x = width / 2 - sliderWidth / 2 + sliderWidth * currentVolume;

        // Обновляем заполнение
        this.volumeSliderFill.width = sliderWidth * currentVolume;

        // Обновляем текст
        this.volumeValueText.setText(`${Math.round(currentVolume * 100)}%`);
    }

    shutdown() {
        // Сохраняем настройки при уходе со сцены
        SoundManager.init(this);
    }
}

export default SettingsScene;
