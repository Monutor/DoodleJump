/**
 * Модуль для работы с localStorage
 * Инкапсулирует логику сохранения и загрузки данных игры
 */

const STORAGE_KEYS = {
    BEST_SCORE: 'doodleJumpBestScore',
    TOTAL_GAMES: 'doodleJumpTotalGames',
    TOTAL_SCORE: 'doodleJumpTotalScore',
    SOUND_MUTED: 'doodleJumpSoundMuted',
    SOUND_VOLUME: 'doodleJumpSoundVolume'
};

class Storage {
    /**
     * Проверяет доступность localStorage
     * @returns {boolean} Доступно ли хранилище
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage недоступен:', e);
            return false;
        }
    }

    /**
     * Загружает лучший счёт из localStorage
     * @returns {number} Лучший счёт или 0, если его нет или localStorage недоступен
     */
    static loadBestScore() {
        if (!this.isAvailable()) {
            return 0;
        }

        try {
            const saved = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('Не удалось загрузить лучший счёт:', e);
            return 0;
        }
    }

    /**
     * Сохраняет лучший счёт в localStorage
     * @param {number} score - Счёт для сохранения
     * @returns {boolean} Успешность сохранения
     */
    static saveBestScore(score) {
        if (!this.isAvailable()) {
            console.warn('Не удалось сохранить лучший счёт: localStorage недоступен');
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить лучший счёт:', e);
            return false;
        }
    }

    /**
     * Загружает статистику игр
     * @returns {{totalGames: number, totalScore: number}} Статистика игр
     */
    static loadGameStats() {
        if (!this.isAvailable()) {
            return { totalGames: 0, totalScore: 0 };
        }

        try {
            const totalGames = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES) || '0', 10);
            const totalScore = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_SCORE) || '0', 10);
            return { totalGames, totalScore };
        } catch (e) {
            console.warn('Не удалось загрузить статистику игр:', e);
            return { totalGames: 0, totalScore: 0 };
        }
    }

    /**
     * Сохраняет статистику игр
     * @param {number} totalGames - Общее количество игр
     * @param {number} totalScore - Общая сумма очков
     * @returns {boolean} Успешность сохранения
     */
    static saveGameStats(totalGames, totalScore) {
        if (!this.isAvailable()) {
            console.warn('Не удалось сохранить статистику: localStorage недоступен');
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.TOTAL_GAMES, totalGames.toString());
            localStorage.setItem(STORAGE_KEYS.TOTAL_SCORE, totalScore.toString());
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить статистику игр:', e);
            return false;
        }
    }

    /**
     * Увеличивает счётчик игр и общую сумму очков
     * @param {number} score - Очки последней игры
     * @returns {{totalGames: number, totalScore: number, averageScore: number}} Обновлённая статистика
     */
    static incrementGameStats(score) {
        const stats = this.loadGameStats();
        stats.totalGames += 1;
        stats.totalScore += score;
        stats.averageScore = Math.round(stats.totalScore / stats.totalGames);

        this.saveGameStats(stats.totalGames, stats.totalScore);
        return stats;
    }

    /**
     * Очищает все данные игры из localStorage
     * @returns {boolean} Успешность очистки
     */
    static clearAll() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.warn('Не удалось очистить данные:', e);
            return false;
        }
    }

    /**
     * Сохраняет настройки звука
     * @param {boolean} muted - Заглушен ли звук
     * @param {number} volume - Громкость от 0 до 1
     * @returns {boolean} Успешность сохранения
     */
    static saveSoundSettings(muted, volume) {
        if (!this.isAvailable()) {
            console.warn('Не удалось сохранить настройки звука: localStorage недоступен');
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, muted.toString());
            localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, volume.toString());
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить настройки звука:', e);
            return false;
        }
    }

    /**
     * Загружает настройки звука
     * @returns {{muted: boolean, volume: number}} Настройки звука
     */
    static loadSoundSettings() {
        if (!this.isAvailable()) {
            return { muted: false, volume: 1.0 };
        }

        try {
            const savedMuted = localStorage.getItem(STORAGE_KEYS.SOUND_MUTED);
            const savedVolume = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
            
            return {
                muted: savedMuted === 'true',
                volume: savedVolume ? parseFloat(savedVolume) : 1.0
            };
        } catch (e) {
            console.warn('Не удалось загрузить настройки звука:', e);
            return { muted: false, volume: 1.0 };
        }
    }
}

export default Storage;
