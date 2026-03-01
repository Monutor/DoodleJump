/**
 * Вспомогательные функции для создания визуальных эффектов
 */

class VisualEffects {
    /**
     * Создает вспышку в указанной точке
     * @param {Phaser.Scene} scene - Сцена Phaser
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {string} color - Цвет вспышки (hex)
     */
    static createFlashEffect(scene, x, y, color = 0xffffff) {
        const flash = scene.add.circle(x, y, 20, color);
        flash.setAlpha(0.8);
        
        scene.tweens.add({
            targets: flash,
            radius: 40,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        return flash;
    }
    
    /**
     * Создает взрывной эффект
     * @param {Phaser.Scene} scene - Сцена Phaser
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     */
    static createExplosionEffect(scene, x, y) {
        // В Phaser 3.86.0+ используем make.particles для создания эмиттера частиц
        const config = {
            x: x,
            y: y,
            texture: 'platform',
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 10,
            onParticleEmit: (particle) => {
                particle.setTint(0xffaa00);
            },
            active: true
        };
        
        const emitter = scene.make.particles(config);
        scene.add.existing(emitter);
        
        // Запускаем эмиттер на короткое время
        scene.time.delayedCall(100, () => {
            emitter.setActive(false);
            scene.time.delayedCall(1000, () => {
                emitter.destroy();
            });
        });
    }
    
    /**
     * Создает эффект получения бонуса
     * @param {Phaser.Scene} scene - Сцена Phaser
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {string} text - Текст бонуса
     * @param {string} color - Цвет текста
     */
    static createBonusEffect(scene, x, y, text, color = '#ffffff') {
        // Создаем вспышку
        this.createFlashEffect(scene, x, y, Phaser.Display.Color.HexStringToRGB(color).color);
        
        // Создаем всплывающий текст
        const floatingText = scene.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Анимация текста
        scene.tweens.add({
            targets: floatingText,
            y: y - 60,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy();
            }
        });
        
        return floatingText;
    }
}

export default VisualEffects;