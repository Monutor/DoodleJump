/**
 * Менеджер звука для управления громкостью и mute
 * Работает в связке с Phaser SoundManager
 */

import Storage from './Storage.js';

const STORAGE_KEYS = {
    SOUND_MUTED: 'doodleJumpSoundMuted',
    SOUND_VOLUME: 'doodleJumpSoundVolume'
};

class SoundManager {
    /**
     * Инициализация менеджера звука
     * @param {Phaser.Scene} scene - Сцена Phaser для доступа к звуку
     */
    static init(scene) {
        this.scene = scene;
        this.loadSettings();
        this.applySettings();
    }

    /**
     * Загружает настройки звука из localStorage
     */
    static loadSettings() {
        if (!Storage.isAvailable()) {
            this.muted = false;
            this.volume = 1.0;
            return;
        }

        try {
            const savedMuted = localStorage.getItem(STORAGE_KEYS.SOUND_MUTED);
            const savedVolume = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
            
            this.muted = savedMuted === 'true';
            this.volume = savedVolume ? parseFloat(savedVolume) : 1.0;
            
            // Ограничиваем громкость от 0 до 1
            this.volume = Math.max(0, Math.min(1, this.volume));
        } catch (e) {
            console.warn('Не удалось загрузить настройки звука:', e);
            this.muted = false;
            this.volume = 1.0;
        }
    }

    /**
     * Сохраняет настройки звука в localStorage
     */
    static saveSettings() {
        if (!Storage.isAvailable()) {
            console.warn('Не удалось сохранить настройки звука: localStorage недоступен');
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, this.muted.toString());
            localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, this.volume.toString());
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить настройки звука:', e);
            return false;
        }
    }

    /**
     * Применяет текущие настройки к звуковой системе Phaser
     */
    static applySettings() {
        if (!this.scene?.sound) {
            return;
        }

        // Устанавливаем общую громкость
        this.scene.sound.volume = this.muted ? 0 : this.volume;
    }

    /**
     * Включает/выключает звук (mute)
     * @param {boolean} [muted] - Если не передано, переключает текущее состояние
     */
    static toggleMute(muted) {
        if (muted !== undefined) {
            this.muted = muted;
        } else {
            this.muted = !this.muted;
        }
        
        this.saveSettings();
        this.applySettings();
        
        return this.muted;
    }

    /**
     * Проверяет, включен ли mute
     * @returns {boolean} Текущее состояние mute
     */
    static isMuted() {
        return this.muted;
    }

    /**
     * Устанавливает громкость
     * @param {number} volume - Громкость от 0 до 1
     */
    static setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.applySettings();
    }

    /**
     * Получает текущую громкость
     * @returns {number} Громкость от 0 до 1
     */
    static getVolume() {
        return this.volume;
    }

    /**
     * Увеличивает громкость на шаг
     * @param {number} step - Шаг увеличения (по умолчанию 0.1)
     */
    static increaseVolume(step = 0.1) {
        this.setVolume(this.volume + step);
    }

    /**
     * Уменьшает громкость на шаг
     * @param {number} step - Шаг уменьшения (по умолчанию 0.1)
     */
    static decreaseVolume(step = 0.1) {
        this.setVolume(this.volume - step);
    }

    /**
     * Сбрасывает настройки звука к значениям по умолчанию
     */
    static reset() {
        this.muted = false;
        this.volume = 1.0;
        this.saveSettings();
        this.applySettings();
    }
}

export default SoundManager;
