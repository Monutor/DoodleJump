// Основной файл игры Doodle Jump
import VisualEffects from '../utils/VisualEffects.js';
import Storage from '../utils/Storage.js';
import SoundManager from '../utils/SoundManager.js';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // === ФОН ===
        this.load.image('background', 'assets/assetsImg/Sprites/Backgrounds/Default/background_solid_sky.png');

        // === ИГРОК (розовый персонаж) ===
        this.load.image('player', 'assets/assetsImg/Sprites/Characters/Default/character_pink_front.png');
        this.load.image('player_idle', 'assets/assetsImg/Sprites/Characters/Default/character_pink_idle.png');
        this.load.image('player_front', 'assets/assetsImg/Sprites/Characters/Default/character_pink_front.png');
        this.load.image('player_jump', 'assets/assetsImg/Sprites/Characters/Default/character_pink_jump.png');
        this.load.image('player_hit', 'assets/assetsImg/Sprites/Characters/Default/character_pink_hit.png');
        this.load.image('player_walk_a', 'assets/assetsImg/Sprites/Characters/Default/character_pink_walk_a.png');
        this.load.image('player_walk_b', 'assets/assetsImg/Sprites/Characters/Default/character_pink_walk_b.png');

        // === ПЛАТФОРМЫ (разные типы) ===
        // Обычная платформа — зелёная трава
        this.load.image('platform_normal', 'assets/assetsImg/Sprites/Tiles/Default/terrain_grass_cloud_middle.png');
        // Движущаяся платформа — серый камень
        this.load.image('platform_moving', 'assets/assetsImg/Sprites/Tiles/Default/terrain_stone_cloud_middle.png');
        // Пружинная платформа — с пружиной
        this.load.image('platform_spring', 'assets/assetsImg/Sprites/Tiles/Default/spring.png');
        // Разрушаемая платформа — коричневые доски
        this.load.image('platform_breaking', 'assets/assetsImg/Sprites/Tiles/Default/bridge_logs.png');
        // Мигающая платформа — фиолетовая
        this.load.image('platform_flashing', 'assets/assetsImg/Sprites/Tiles/Default/terrain_purple_cloud_middle.png');

        // === БОНУСЫ ===
        this.load.image('bonus_star', 'assets/assetsImg/Sprites/Tiles/Default/star.png');
        this.load.image('bonus_coin_gold', 'assets/assetsImg/Sprites/Tiles/Default/coin_gold.png');
        this.load.image('bonus_gem_blue', 'assets/assetsImg/Sprites/Tiles/Default/gem_blue.png');
        this.load.image('bonus_gem_green', 'assets/assetsImg/Sprites/Tiles/Default/gem_green.png');
        this.load.image('bonus_gem_red', 'assets/assetsImg/Sprites/Tiles/Default/gem_red.png');

        // === ВРАГИ (метеориты/препятствия) ===
        this.load.image('enemy_bee', 'assets/assetsImg/Sprites/Enemies/Default/bee_a.png');
        this.load.image('enemy_fly', 'assets/assetsImg/Sprites/Enemies/Default/fly_a.png');
        this.load.image('enemy_saw', 'assets/assetsImg/Sprites/Enemies/Default/saw_a.png');
        this.load.image('enemy_fireball', 'assets/assetsImg/Sprites/Tiles/Default/fireball.png');

        // === ЗВУКИ ===
        this.load.audio('sfx_jump', 'assets/assetsImg/Sounds/sfx_jump.ogg');
        this.load.audio('sfx_jump_high', 'assets/assetsImg/Sounds/sfx_jump-high.ogg');
        this.load.audio('sfx_coin', 'assets/assetsImg/Sounds/sfx_coin.ogg');
        this.load.audio('sfx_gem', 'assets/assetsImg/Sounds/sfx_gem.ogg');
        this.load.audio('sfx_hurt', 'assets/assetsImg/Sounds/sfx_hurt.ogg');
        this.load.audio('sfx_disappear', 'assets/assetsImg/Sounds/sfx_disappear.ogg');
        this.load.audio('sfx_magic', 'assets/assetsImg/Sounds/sfx_magic.ogg');
        this.load.audio('sfx_bump', 'assets/assetsImg/Sounds/sfx_bump.ogg');
    }

    create() {
        // Инициализируем SoundManager для применения настроек звука
        SoundManager.init(this);

        // Инициализация счета (0 в начале игры)
        this.score = 0;

        // Переменная для отслеживания бонуса за высоту
        this.heightBonusGiven = false;
        
        // Флаг для отслеживания бонуса за 100 очков (чтобы не спамить звуком)
        this.justScored100 = false;
        
        // Флаг для предотвращения повторного звука прыжка при зажатой клавише
        this.jumpKeyWasPressed = false;

        // Загрузка лучшего счёта из localStorage
        this.bestScore = Storage.loadBestScore();

        // Определение типа устройства (touch или desktop)
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // === СОЗДАНИЕ АНИМАЦИЙ ПЕРСОНАЖА ===
        this.createPlayerAnimations();

        // Добавляем фоновое изображение
        // Создаем тайлинговый фон, который будет повторяться
        this.background = this.add.tileSprite(200, 300, 400, 600, 'background');
        this.background.setScrollFactor(0); // Фон остается на месте при движении камеры

        // Создание пула платформ для оптимизации памяти
        // Используем пул объектов вместо постоянного создания/удаления
        this.platformPool = this.physics.add.staticGroup();

        // Типы платформ
        this.PLATFORM_TYPES = {
            NORMAL: 'normal',
            MOVING: 'moving',
            SPRING: 'spring',
            BREAKING: 'breaking',
            FLASHING: 'flashing'
        };

        // Маппинг типов платформ к текстурам
        this.PLATFORM_TEXTURES = {
            [this.PLATFORM_TYPES.NORMAL]: 'platform_normal',
            [this.PLATFORM_TYPES.MOVING]: 'platform_moving',
            [this.PLATFORM_TYPES.SPRING]: 'platform_spring',
            [this.PLATFORM_TYPES.BREAKING]: 'platform_breaking',
            [this.PLATFORM_TYPES.FLASHING]: 'platform_flashing'
        };

        // Предварительно создаем платформы в пуле (20 штук достаточно)
        for (let i = 0; i < 20; i++) {
            const platform = this.platformPool.create(0, 0, 'platform_normal');
            platform.setVisible(false);
            platform.setActive(false);
            platform.type = this.PLATFORM_TYPES.NORMAL;
            // Масштабируем платформу
            platform.setScale(1.2, 0.7);
            this.applyPlatformBodyShape(platform);

            // Добавляем свойства для разных типов платформ
            platform.speedX = 0;
            platform.originalX = 0;
            platform.moveRange = 0;
            platform.breakTimer = null;
            platform.isVisible = true;
            platform.flashTimer = null;
        }

        // Создание пула бонусов
        this.bonusPool = this.physics.add.group({
            defaultKey: 'bonus_star',
            maxSize: 10,
            runChildUpdate: true
        });

        // Типы бонусов
        this.BONUS_TYPES = {
            POINTS: 'points',       // +50 очков
            SPEED: 'speed',         // временное ускорение
            SHIELD: 'shield',       // щит от падающих объектов
            SLOWTIME: 'slowtime'    // замедление времени
        };

        // Маппинг типов бонусов к текстурам
        this.BONUS_TEXTURES = {
            [this.BONUS_TYPES.POINTS]: 'bonus_coin_gold',
            [this.BONUS_TYPES.SPEED]: 'bonus_gem_green',
            [this.BONUS_TYPES.SHIELD]: 'bonus_gem_blue',
            [this.BONUS_TYPES.SLOWTIME]: 'bonus_gem_red'
        };

        // Создание пула метеоритов/падающих препятствий
        this.meteorPool = this.physics.add.group({
            defaultKey: 'enemy_fireball',
            maxSize: 10,
            runChildUpdate: true
        });

        // Создание пула мигающих платформ
        this.flashingPlatformPool = this.physics.add.staticGroup();
        
        // Создание гарантированной начальной платформы под игроком
        const startY = 350;
        const startX = 200;
        // Y самой высокой платформы, за которую игрок уже получил очки (независимо от приземления)
        this.highestScoredPlatformY = startY;
        // Множество платформ, за которые уже начислены очки (чтобы не начислять дважды)
        this.scoredPlatforms = new Set();
        const startPlatform = this.getPlatformFromPool(startX, startY);
        // Добавляем начальную платформу в множество, чтобы за неё не начислялись очки
        this.scoredPlatforms.add(startPlatform);

        // Создание игрока — сначала создаём спрайт, настраиваем, затем ставим на платформу
        this.player = this.physics.add.sprite(startX, 0, 'player_idle');
        this.player.setBounce(0.2);
        this.player.setScale(0.8);
        // Коллайдер: верхнюю часть «подрезаем» (низ на месте), чтобы голова не цеплялась
        const COLLISION_HEIGHT_RATIO = 0.75;  // 0.75 = коллайдер только по нижним 75% спрайта (25% сверху без коллизии)
        const bodyW = this.player.width * 0.4;
        const bodyH = this.player.height * COLLISION_HEIGHT_RATIO;
        this.player.body.setSize(bodyW, bodyH, false);
        this.player.body.setOffset(
            (this.player.width - bodyW) / 2,   // центрирование по X
            this.player.height - bodyH         // сдвиг вниз: низ коллайдера остаётся на месте
        );
        this.player.setCollideWorldBounds(false);

        // Направление игрока (1 = вправо, -1 = влево)
        this.playerDirection = 1;

        // Реализация двойного прыжка
        this.jumpsLeft = 2; // Игрок может сделать 2 прыжка
        this.maxJumps = 2;
        this.isFirstJumpUsed = false;

        // Размещаем игрока ступнями на верхней грани платформы (ноги = низ спрайта)
        const platformTop = startPlatform.y - startPlatform.displayHeight / 2;
        this.player.y = platformTop - this.player.displayHeight / 2;
        this.player.setVelocityY(0);

        // Настройка камеры для следования за игроком
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, -10000, 400, 20000); // Расширяем границы камеры вверх
        this.physics.world.setBounds(0, -10000, 400, 20000); // Расширяем границы физики вверх
        // Самая «высокая» позиция камеры (минимальный scrollY): камера будет следовать только вверх.
        this.minScrollY = null;

        // Создание дополнительных начальных платформ
        for (let i = 1; i < 5; i++) {
            const x = Phaser.Math.Between(50, 350);
            const y = startY - (150 * i);
            this.getPlatformFromPool(x, y);
        }

        // Высота последней сгенерированной платформы (самая верхняя = -250)
        // Нужна для корректной генерации при подъёме: при startFollow scrollY ≈ player.y - 300,
        // поэтому условие player.y < scrollY + 200 почти всегда false
        this.lastSpawnY = -250;

        // Синхронизация static-тел с позициями спрайтов (нужно для Arcade StaticGroup)
        this.platformPool.refresh();
        this.platformPool.children.each((p) => {
            if (p.active) this.applyPlatformBodyShape(p);
        });

        // Коллизия между игроком и платформами из пула
        // processCallback: всегда true при падении — физика должна обрабатывать любое перекрытие (разделение тел).
        // collideCallback: touching.down и сброс velocity только при приземлении СВЕРХУ (низ игрока на верхней грани платформы).
        this.physics.add.collider(this.player, this.platformPool, (player, platform) => {
            const isTopLanding = this.isLandingOnTop(player, platform);
            if (isTopLanding) {
                player.body.touching.down = true;


                // Сбрасываем количество прыжков при приземлении на платформу
                this.jumpsLeft = this.maxJumps;
                this.isFirstJumpUsed = false;

                // Различные типы прыжков в зависимости от типа платформы
                switch(platform.type) {
                    case this.PLATFORM_TYPES.SPRING:
                        // Прыжок с пружины - увеличенная сила прыжка
                        player.setVelocityY(-700);
                        // Звук высокого прыжка с пружины
                        this.sound.play('sfx_jump_high', { volume: 0.5 });
                        break;
                    case this.PLATFORM_TYPES.BREAKING:
                        // Разрушаемая платформа - исчезает после приземления
                        this.time.delayedCall(100, () => {
                            this.removePlatform(platform);
                            // Звук разрушения платформы
                            this.sound.play('sfx_disappear', { volume: 0.4 });
                        });
                        // Fall through to normal platform
                    case this.PLATFORM_TYPES.MOVING:
                        // Двигающаяся платформа - добавляем горизонтальное движение игрока
                        player.setVelocityX(platform.body.velocity.x);
                        // Fall through to normal platform
                    case this.PLATFORM_TYPES.FLASHING:
                        // Мигающая платформа - обычный прыжок, но с визуальным эффектом
                        player.setVelocityY(-500);
                        // Звук прыжка
                        this.sound.play('sfx_jump', { volume: 0.5 });
                        break;
                    default:
                        // Обычная платформа - стандартный прыжок
                        player.setVelocityY(-500);
                        // Звук прыжка
                        this.sound.play('sfx_jump', { volume: 0.5 });
                }
            }
        }, (player, platform) => {
            const runPhysics = player.body.velocity.y >= 0 && platform.active;
            return runPhysics;
        }, this);

        // Коллизия между игроком и бонусами
        this.physics.add.overlap(this.player, this.bonusPool, this.collectBonus, null, this);

        // Коллизия между игроком и метеоритами
        this.physics.add.overlap(this.player, this.meteorPool, this.hitByMeteor, null, this);

        // Управление игроком
        this.cursors = this.input.keyboard.createCursorKeys();

        // Touch-управление для мобильных устройств
        // Автоматически определяет тип устройства
        if (this.isTouchDevice) {
            this.input.on('pointerdown', (pointer) => {
                // Если нажато в левую половину экрана - движение влево
                if (pointer.x < this.cameras.main.width / 2) {
                    if (this.player.getData('speedBoost')) {
                        this.player.setVelocityX(-300);
                    } else {
                        this.player.setVelocityX(-200);
                    }
                    this.playerDirection = -1; // Игрок смотрит влево
                } else {
                    // Иначе - движение вправо
                    if (this.player.getData('speedBoost')) {
                        this.player.setVelocityX(300);
                    } else {
                        this.player.setVelocityX(200);
                    }
                    this.playerDirection = 1; // Игрок смотрит вправо
                }

                // Прыжок, если игрок на платформе или еще не использовал двойной прыжок
                if (this.player.body.touching.down || this.jumpsLeft > 0) {
                    if (this.player.body.touching.down) {
                        // Первый прыжок
                        this.player.setVelocityY(-500);
                        this.jumpsLeft--;
                        this.isFirstJumpUsed = true;
                        // Звук прыжка
                        this.sound.play('sfx_jump', { volume: 0.5 });
                    } else if (this.jumpsLeft > 0) {
                        // Двойной прыжок
                        this.player.setVelocityY(-500);
                        this.jumpsLeft--;
                        // Звук двойного прыжка (более высокий тон)
                        this.sound.play('sfx_jump_high', { volume: 0.4 });
                    }
                }
            });

            // Остановка движения при отпускании касания
            this.input.on('pointerup', () => {
                this.player.setVelocityX(0);
            });
        } else {
            // Для десктопа - только клавиатура
            this.input.on('pointerdown', (pointer) => {
                // Прыжок при клике, если игрок на платформе или еще не использовал двойной прыжок
                if (this.player.body.touching.down || this.jumpsLeft > 0) {
                    if (this.player.body.touching.down) {
                        // Первый прыжок
                        this.player.setVelocityY(-500);
                        this.jumpsLeft--;
                        this.isFirstJumpUsed = true;
                        // Звук прыжка
                        this.sound.play('sfx_jump', { volume: 0.5 });
                    } else if (this.jumpsLeft > 0) {
                        // Двойной прыжок
                        this.player.setVelocityY(-500);
                        this.jumpsLeft--;
                        // Звук двойного прыжка (более высокий тон)
                        this.sound.play('sfx_jump_high', { volume: 0.4 });
                    }
                }
            });
        }

        // Отображение счета
        this.scoreText = this.add.text(10, 10, 'Счет: 0', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.scoreText.setScrollFactor(0); // Текст остается на экране при движении камеры
        
        // Отображение лучшего счёта
        this.bestScoreText = this.add.text(10, 45, `Лучший: ${this.bestScore}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffff00',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.bestScoreText.setScrollFactor(0); // Текст остается на экране при движении камеры
        
        // Индикатор двойного прыжка
        this.doubleJumpIndicator = this.add.text(10, 80, `Прыжки: ${this.jumpsLeft}/${this.maxJumps}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00ffff',
            backgroundColor: '#00000080',
            padding: { x: 10, y: 5 }
        });
        this.doubleJumpIndicator.setScrollFactor(0);
        
        // Отладочная информация
        // this.debugText = this.add.text(10, 40, 'Платформ: 0', {
        //     fontSize: '16px',
        //     fontFamily: 'Arial',
        //     color: '#ffff00',
        //     backgroundColor: '#00000080',
        //     padding: { x: 10, y: 5 }
        // });
        // this.debugText.setScrollFactor(0);
    }

    update() {
        // Камера следует только ВВЕРХ (как в Doodle Jump). При падении игрока камера не опускается —
        // иначе startFollow тянет scrollY вниз, игрок остаётся на экране и проигрыш не срабатывает.
        if (this.minScrollY == null) this.minScrollY = this.cameras.main.scrollY;
        this.minScrollY = Math.min(this.minScrollY, this.cameras.main.scrollY);
        this.cameras.main.scrollY = Math.min(this.cameras.main.scrollY, this.minScrollY);

        // Анимация фона (параллакс-эффект)
        // Фон движется медленнее, чем камера, создавая глубину
        this.background.tilePositionY = this.cameras.main.scrollY * 0.3;

        // Логика управления игроком (только для десктопа)
        if (!this.isTouchDevice) {
            if (this.cursors.left.isDown) {
                if (this.player.getData('speedBoost')) {
                    this.player.setVelocityX(-300);
                } else {
                    this.player.setVelocityX(-200);
                }
                this.playerDirection = -1; // Игрок смотрит влево
            } else if (this.cursors.right.isDown) {
                if (this.player.getData('speedBoost')) {
                    this.player.setVelocityX(300);
                } else {
                    this.player.setVelocityX(200);
                }
                this.playerDirection = 1; // Игрок смотрит вправо
            } else {
                this.player.setVelocityX(0);
            }

            // Прыжок только если игрок касается платформы
            if (this.cursors.up.isDown && this.player.body.touching.down && !this.jumpKeyWasPressed) {
                this.player.setVelocityY(-500);
                // Звук прыжка
                this.sound.play('sfx_jump', { volume: 0.5 });
                this.jumpKeyWasPressed = true;
            }
            
            // Сбрасываем флаг при отпускании клавиши
            if (!this.cursors.up.isDown) {
                this.jumpKeyWasPressed = false;
            }
        }

        // Обновляем анимацию игрока
        this.updatePlayerAnimation();
        
        // Проверка окончания временных эффектов
        if (this.player.getData('speedBoost') && this.game.getTime() > this.player.getData('speedBoostEnd')) {
            this.player.setData('speedBoost', false);
        }
        
        if (this.player.getData('shield') && this.game.getTime() > this.player.getData('shieldEnd')) {
            this.player.setData('shield', false);
        }

        // Генерация платформ заранее — буфер над верхом экрана (scrollY = верх видимой области)
        // Держим платформы вплоть до scrollY - SPAWN_BUFFER, чтобы игрок видел их до прыжка
        const SPAWN_BUFFER = 400;      // Высота «запаса» платформ над экраном (≈ 2/3 высоты экрана)
        const PLATFORM_SPACING = 120;  // Вертикальный шаг между платформами

        while (this.lastSpawnY > this.cameras.main.scrollY - SPAWN_BUFFER) {
            const y = this.lastSpawnY - PLATFORM_SPACING;
            const x = Phaser.Math.Between(50, 350);

            let canCreate = true;
            this.platformPool.children.each((existingPlatform) => {
                if (existingPlatform.active && Math.abs(existingPlatform.y - y) < 100) {
                    canCreate = false;
                }
            });

            if (!canCreate) break;

            // Определяем тип платформы случайным образом
            const platformType = this.getRandomPlatformType();
            
            const platform = this.getPlatformFromPool(x, y, platformType);
            if (!platform) break;

            // Дополнительная настройка платформы в зависимости от типа
            this.setupPlatformByType(platform, platformType);

            this.lastSpawnY = y;
            this.platformPool.refresh();
            this.platformPool.children.each((p) => {
                if (p.active) this.applyPlatformBodyShape(p);
            });
        }
        
        // Начисление очков за все пройденные платформы (включая перепрыгнутые)
        // Проверяем все активные платформы и начисляем очки, если игрок поднялся выше них
        this.platformPool.children.each((platform) => {
            if (platform.active && !this.scoredPlatforms.has(platform)) {
                // Платформа считается пройденной, если игрок поднялся выше её центра
                // Используем центр игрока (player.y) и центр платформы (platform.y)
                if (this.player.y < platform.y && platform.y < this.highestScoredPlatformY) {
                    this.scoredPlatforms.add(platform);
                    this.highestScoredPlatformY = platform.y;
                    
                    // Базовые очки за платформу
                    let points = 10;
                    
                    // Бонус за разные типы платформ
                    switch(platform.type) {
                        case this.PLATFORM_TYPES.SPRING:
                            points = 15; // Бонус за пружинную платформу
                            break;
                        case this.PLATFORM_TYPES.BREAKING:
                            points = 12; // Бонус за разрушаемую платформу
                            break;
                        case this.PLATFORM_TYPES.MOVING:
                            points = 13; // Бонус за движущуюся платформу
                            break;
                        case this.PLATFORM_TYPES.FLASHING:
                            points = 20; // Бонус за мигающую платформу (повышенное количество очков)
                            break;
                    }
                    
                    this.score += points;
                    this.scoreText.setText(`Счет: ${this.score}`);
                    
                    // Показываем всплывающий текст с бонусом
                    this.showFloatingText(platform.x, platform.y - 30, `+${points}`, '#ffff00');
                }
            }
        });
        
        // Обновляем движущиеся платформы
        this.updateMovingPlatforms();

        // Проверяем достижения для бонусов
        this.checkAchievements();

        // Обновляем отладочную информацию
        let activePlatforms = 0;
        this.platformPool.children.each((platform) => {
            if (platform.active) {
                activePlatforms++;
            }
        });
        // this.debugText.setText(`Платформ: ${activePlatforms} | Игрок Y: ${Math.round(this.player.y)}`);

        // Удаление старых платформ, ушедших ниже видимой области
        // Учитываем scrollY камеры: низ экрана = scrollY + height
        this.platformPool.children.each((platform) => {
            if (platform.active && platform.y > this.cameras.main.scrollY + 650) {
                this.removePlatform(platform);
            }
        });

        // Проверка падения игрока вниз (проигрыш)
        // Игрок упал, если ушёл ниже низа видимой области камеры (а не фиксированного Y).
        // Так игра завершается сразу при падении с любой высоты, без длительного полёта вниз.
        const bottomOfScreen = this.cameras.main.scrollY + this.cameras.main.height;
        const GAME_OVER_MARGIN = 50; // Небольшой запас под экраном для плавного ощущения
        if (this.player.y > bottomOfScreen + GAME_OVER_MARGIN) {
            // Сохраняем лучший счёт, если текущий результат лучше
            if (this.score > this.bestScore) {
                Storage.saveBestScore(this.score);
            }
            this.scene.start('GameOverScene', { score: this.score, bestScore: this.bestScore });
        }
        
        // Обновляем мигающие платформы
        this.updateFlashingPlatforms();

        // Обновляем бонусы
        this.updateBonuses();

        // Обновляем метеориты
        this.updateMeteors();

        // Вращаем пилы
        this.meteorPool.children.each((meteor) => {
            if (meteor.active && meteor.texture?.key === 'enemy_saw') {
                meteor.angle += 10; // Вращение по часовой стрелке
            }
        });

        // Обновляем индикатор двойного прыжка
        this.doubleJumpIndicator.setText(`Прыжки: ${this.jumpsLeft}/${this.maxJumps}`);

        // Оптимизация производительности для мобильных устройств
        // Если FPS ниже 30, упрощаем рендеринг
        // if (this.game.loop.actualFps < 30 && this.background.visible) {
        //     this.background.visible = false;
        // } else if (this.game.loop.actualFps >= 30 && !this.background.visible) {
        //     this.background.visible = true;
        // }
    }

    /**
     * Обновляет позиции движущихся платформ
     */
    updateMovingPlatforms() {
        this.platformPool.children.each((platform) => {
            if (platform.active && platform.type === this.PLATFORM_TYPES.MOVING) {
                // Движение платформы по горизонтали
                platform.x = platform.originalX + Math.sin(this.game.getTime() * 0.001) * platform.moveRange;

                // Обновляем физическое тело, чтобы коллизии соответствовали новой позиции
                if (platform.body) {
                    platform.body.x = platform.x;
                    platform.body.updateFromGameObject();
                }
            }
        });
    }

    /**
     * Создаёт анимации персонажа
     */
    createPlayerAnimations() {
        const anims = this.anims;

        // Анимация бездействия (idle) - покачивание
        if (!anims.exists('player_idle')) {
            anims.create({
                key: 'player_idle',
                frames: [
                    { key: 'player_idle' },
                    { key: 'player_front' }
                ],
                frameRate: 4,
                repeat: -1,
                yoyo: true
            });
        }

        // Анимация ходьбы/бега
        if (!anims.exists('player_walk')) {
            anims.create({
                key: 'player_walk',
                frames: [
                    { key: 'player_walk_a' },
                    { key: 'player_walk_b' }
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        // Анимация прыжка (статичная, но можно добавить кадр)
        if (!anims.exists('player_jump')) {
            anims.create({
                key: 'player_jump',
                frames: [{ key: 'player_jump' }],
                frameRate: 1
            });
        }

        // Анимация падения (hit)
        if (!anims.exists('player_hit')) {
            anims.create({
                key: 'player_hit',
                frames: [{ key: 'player_hit' }],
                frameRate: 1
            });
        }
    }

    /**
     * Обновляет анимацию игрока в зависимости от состояния
     */
    updatePlayerAnimation() {
        const isMoving = Math.abs(this.player.body.velocity.x) > 10;
        const isFalling = this.player.body.velocity.y > 0;
        const isJumping = this.player.body.velocity.y < 0 && !this.player.body.touching.down;

        // Определяем нужную анимацию
        let targetAnim = 'player_idle';

        if (isFalling) {
            targetAnim = 'player_hit';
        } else if (isJumping) {
            targetAnim = 'player_jump';
        } else if (isMoving) {
            targetAnim = 'player_walk';
        }

        // Применяем анимацию, если она изменилась
        if (this.player.anims.currentAnim?.key !== targetAnim) {
            this.player.play(targetAnim, true);
        }

        // Отражаем спрайт по горизонтали в зависимости от направления
        // Важно: устанавливаем flipX после play(), так как анимация может сбросить его
        this.player.setFlipX(this.playerDirection === -1);
    }

    /**
     * Приземление считается «сверху», только если низ коллайдера игрока достиг верхней грани платформы.
     * Исключает прыжок при касании сбоку или когда ноги ещё не дошли до поверхности.
     * @param {Phaser.Physics.Arcade.Sprite} player - Игрок
     * @param {Phaser.Physics.Arcade.Sprite} platform - Платформа
     * @returns {boolean}
     */
    isLandingOnTop(player, platform) {
        const TOLERANCE_ABOVE = 2;  // допуск «чуть выше» из‑за дискретных шагов физики
        const TOLERANCE_BELOW = 6;  // допуск «чуть ниже» — ноги могли слегка войти в платформу до разрешения
        return player.body.velocity.y >= 0 &&
            player.body.bottom >= platform.body.top - TOLERANCE_ABOVE &&
            player.body.bottom <= platform.body.top + TOLERANCE_BELOW;
    }

    /**
     * Применяет к платформе кастомное тело: тонкая полоска по верхней грани.
     * setSize(displayWidth, 8) — ширина как у спрайта, высота 8px.
     * setOffset смещает тело к верхнему левому углу спрайта (origin 0.5,0.5).
     * @param {Phaser.Physics.Arcade.Sprite} platform - Платформа
     */
    applyPlatformBodyShape(platform) {
        const stripHeight = 1;
        platform.body.setSize(platform.displayWidth, stripHeight, false);
        platform.body.setOffset(1, 1);
    }

    /**
     * Получает платформу из пула для повторного использования
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {string} type - Тип платформы (по умолчанию NORMAL)
     * @returns {Phaser.Physics.Arcade.Sprite} Платформа или null, если пул пуст
     */
    getPlatformFromPool(x, y, type = this.PLATFORM_TYPES.NORMAL) {
        // Сначала ищем неактивную платформу
        let platform = this.platformPool.getFirstDead();

        // Если не нашли, ищем любую неактивную платформу в пуле
        if (!platform) {
            this.platformPool.children.each((p) => {
                if (!platform && !p.active) {
                    platform = p;
                }
            });
        }

        if (platform) {
            platform.setPosition(x, y);
            platform.setVisible(true);
            platform.setActive(true);
            platform.body.updateFromGameObject();
            // Восстанавливаем тонкую полоску коллизии (updateFromGameObject сбрасывает setSize)
            this.applyPlatformBodyShape(platform);
            // Удаляем платформу из множества отслеживаемых при повторном использовании
            this.scoredPlatforms.delete(platform);

            // Настраиваем тип платформы
            this.setupPlatformByType(platform, type);
            return platform;
        }
        return null;
    }

    /**
     * Возвращает случайный тип платформы с определенной вероятностью
     * @returns {string} Тип платформы
     */
    getRandomPlatformType() {
        const rand = Math.random();
        if (rand < 0.65) {
            return this.PLATFORM_TYPES.NORMAL; // 65% обычных платформ
        } else if (rand < 0.80) {
            return this.PLATFORM_TYPES.MOVING; // 15% движущихся платформ
        } else if (rand < 0.90) {
            return this.PLATFORM_TYPES.SPRING; // 10% пружинных платформ
        } else if (rand < 0.95) {
            return this.PLATFORM_TYPES.BREAKING; // 5% разрушаемых платформ
        } else {
            return this.PLATFORM_TYPES.FLASHING; // 5% мигающих платформ
        }
    }

    /**
     * Настраивает платформу в зависимости от её типа
     * @param {Phaser.Physics.Arcade.Sprite} platform - Платформа
     * @param {string} type - Тип платформы
     */
    setupPlatformByType(platform, type) {
        platform.type = type;

        // Устанавливаем текстуру для типа платформы
        const texture = this.PLATFORM_TEXTURES[type];
        if (texture && platform.texture.key !== texture) {
            platform.setTexture(texture);
        }

        switch(type) {
            case this.PLATFORM_TYPES.MOVING:
                // Движущаяся платформа - движется горизонтально
                platform.speedX = Phaser.Math.Between(-50, 50);
                platform.originalX = platform.x;
                platform.moveRange = Phaser.Math.Between(50, 150);
                break;
            case this.PLATFORM_TYPES.SPRING:
                // Пружинная платформа - используем спрайт с пружиной
                platform.setScale(1.2, 0.5); // Пружина ниже платформ
                break;
            case this.PLATFORM_TYPES.BREAKING:
                // Разрушаемая платформа - коричневые доски
                platform.setScale(1.2, 0.6); // Тоньше обычных
                break;
            case this.PLATFORM_TYPES.FLASHING:
                // Мигающая платформа - стандартный размер
                platform.setScale(1.2, 0.7);
                break;
            case this.PLATFORM_TYPES.NORMAL:
            default:
                // Обычная платформа - стандартный размер
                platform.setScale(1.2, 0.7);
        }
    }

    getPlatformFromPool(x, y, type = this.PLATFORM_TYPES.NORMAL) {
        // Сначала ищем неактивную платформу
        let platform = this.platformPool.getFirstDead();
        
        // Если не нашли, ищем любую неактивную платформу в пуле
        if (!platform) {
            this.platformPool.children.each((p) => {
                if (!platform && !p.active) {
                    platform = p;
                }
            });
        }
        
        if (platform) {
            platform.setPosition(x, y);
            platform.setVisible(true);
            platform.setActive(true);
            platform.body.updateFromGameObject();
            // Восстанавливаем тонкую полоску коллизии (updateFromGameObject сбрасывает setSize)
            this.applyPlatformBodyShape(platform);
            // Удаляем платформу из множества отслеживаемых при повторном использовании
            this.scoredPlatforms.delete(platform);
            
            // Настраиваем тип платформы
            this.setupPlatformByType(platform, type);
            return platform;
        }
        return null;
    }

    /**
     * Деактивирует платформу для повторного использования
     * @param {Phaser.Physics.Arcade.Sprite} platform - Платформа для деактивации
     */
    removePlatform(platform) {
        if (platform && platform.active) {
            // Очищаем таймер мигающей платформы
            if (platform.flashTimer) {
                platform.flashTimer.destroy();
                platform.flashTimer = null;
            }
            platform.setActive(false);
            platform.setVisible(false);
            // Удаляем платформу из множества отслеживаемых (чтобы избежать утечек памяти)
            this.scoredPlatforms.delete(platform);
            // Статическое тело не имеет velocity — только обновляем геометрию
            platform.body.updateFromGameObject();
        }
    }
    
    /**
     * Обновляет мигающие платформы
     */
    updateFlashingPlatforms() {
        this.platformPool.children.each((platform) => {
            if (platform.active && platform.type === this.PLATFORM_TYPES.FLASHING) {
                // Управление видимостью мигающей платформы
                if (!platform.flashTimer) {
                    platform.flashTimer = this.time.addEvent({
                        delay: 500, // 0.5 секунды
                        callback: () => {
                            const isVisible = !platform.visible;
                            platform.setVisible(isVisible);
                            platform.setAlpha(isVisible ? 1 : 0.3);
                            // Отключаем коллизию, когда платформа невидима
                            platform.body.checkCollision.none = !isVisible;
                            platform.body.checkCollision.up = isVisible;
                            platform.body.checkCollision.down = isVisible;
                            platform.body.checkCollision.left = isVisible;
                            platform.body.checkCollision.right = isVisible;
                        },
                        loop: true
                    });
                }
            }
        });
    }
    
    /**
     * Обновляет бонусы
     */
    updateBonuses() {
        // Проверяем, нужно ли создать новые бонусы
        if (this.game.getTime() % 3000 < 16) { // Примерно каждые 3 секунды
            const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
            const spawnY = cameraBottom - 100; // Создаем немного выше нижней границы экрана
            
            if (spawnY < this.lastSpawnY) { // Только если выше последней созданной платформы
                this.spawnBonus(Phaser.Math.Between(50, 350), spawnY);
            }
        }
    }
    
    /**
     * Создает бонус в указанной позиции
     */
    spawnBonus(x, y) {
        const bonus = this.bonusPool.get(x, y, 'bonus_star');
        if (bonus) {
            bonus.setActive(true);
            bonus.setVisible(true);
            bonus.setBounce(0.4);
            bonus.setCollideWorldBounds(true);
            bonus.body.setAllowGravity(false);
            bonus.setVelocityX(Phaser.Math.Between(-50, 50));
            bonus.setVelocityY(Phaser.Math.Between(-50, -20));

            // Устанавливаем случайный тип бонуса
            const bonusTypes = Object.values(this.BONUS_TYPES);
            bonus.bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

            // Устанавливаем текстуру в зависимости от типа бонуса
            const texture = this.BONUS_TEXTURES[bonus.bonusType];
            if (texture) {
                bonus.setTexture(texture);
            }

            // Сбрасываем tint для корректного отображения текстуры
            bonus.clearTint();
        }
    }
    
    /**
     * Обработка сбора бонуса игроком
     */
    collectBonus(player, bonus) {
        // Воспроизводим звук в зависимости от типа бонуса
        if (bonus.bonusType === this.BONUS_TYPES.POINTS) {
            // Звук монеты
            this.sound.play('sfx_coin', { volume: 0.6 });
        } else {
            // Звук драгоценного камня для остальных бонусов
            this.sound.play('sfx_gem', { volume: 0.5 });
        }

        // Создаем визуальный эффект при сборе бонуса
        VisualEffects.createBonusEffect(this, bonus.x, bonus.y,
            bonus.bonusType === this.BONUS_TYPES.POINTS ? '+50' :
            bonus.bonusType === this.BONUS_TYPES.SPEED ? 'SPEED!' :
            bonus.bonusType === this.BONUS_TYPES.SHIELD ? 'SHIELD!' : 'SLOW TIME!',
            bonus.bonusType === this.BONUS_TYPES.POINTS ? '#ffff00' :
            bonus.bonusType === this.BONUS_TYPES.SPEED ? '#00ff00' :
            bonus.bonusType === this.BONUS_TYPES.SHIELD ? '#0088ff' : '#ff00ff');

        // Применяем эффект бонуса
        switch(bonus.bonusType) {
            case this.BONUS_TYPES.POINTS:
                this.score += 50;
                break;
            case this.BONUS_TYPES.SPEED:
                // Временное ускорение игрока
                // Временно увеличиваем скорость игрока
                player.setData('speedBoost', true);
                player.setData('speedBoostEnd', this.game.getTime() + 3000); // 3 секунды
                break;
            case this.BONUS_TYPES.SHIELD:
                // Эффект щита
                player.setData('shield', true);
                player.setData('shieldEnd', this.game.getTime() + 5000); // 5 секунд
                // Визуально показываем щит вокруг игрока
                player.setTint(0x0088ff);
                this.time.delayedCall(5000, () => {
                    if (player.active) {
                        player.clearTint();
                    }
                });
                break;
            case this.BONUS_TYPES.SLOWTIME:
                // Замедление времени
                this.time.timeScale = 0.5; // Замедляем время в 2 раза
                this.time.delayedCall(2000, () => { // Через 2 секунды
                    this.time.timeScale = 1.0; // Возвращаем нормальное время
                });
                break;
        }

        // Обновляем счёт
        this.scoreText.setText(`Счет: ${this.score}`);

        // Возвращаем бонус в пул
        bonus.setActive(false);
        bonus.setVisible(false);
    }
    
    /**
     * Обновляет метеориты
     */
    updateMeteors() {
        // Проверяем, нужно ли создать новые метеориты
        if (this.game.getTime() % 4000 < 16) { // Примерно каждые 4 секунды
            const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
            const spawnY = this.cameras.main.scrollY - 100; // Создаем выше верхней границы экрана
            
            this.spawnMeteor(Phaser.Math.Between(50, 350), spawnY);
        }
    }
    
    /**
     * Создает метеорит в указанной позиции
     */
    spawnMeteor(x, y) {
        // Выбираем случайный тип врага
        const enemyTypes = ['enemy_bee', 'enemy_fly', 'enemy_saw', 'enemy_fireball'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        const meteor = this.meteorPool.get(x, y, enemyType);
        if (meteor) {
            meteor.setActive(true);
            meteor.setVisible(true);
            meteor.setBounce(0.2);
            meteor.setCollideWorldBounds(false);
            meteor.setVelocityX(Phaser.Math.Between(-100, 100));
            meteor.setVelocityY(Phaser.Math.Between(100, 200)); // Падает вниз

            // Для пилы добавляем вращение
            if (enemyType === 'enemy_saw') {
                meteor.angle = 0;
            }
        }
    }

    /**
     * Показывает всплывающий текст
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {string} text - Текст
     * @param {string} color - Цвет текста
     */
    showFloatingText(x, y, text, color = '#ffffff') {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Анимация исчезновения
        this.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }

    /**
     * Проверяет достижения и начисляет бонусы
     */
    checkAchievements() {
        // Проверяем, не достиг ли игрок новых рекордов
        if (this.score > 0 && this.score % 100 === 0 && !this.justScored100) {
            // Бонус за каждые 100 очков
            this.justScored100 = true;
            this.showFloatingText(this.player.x, this.player.y - 100, '+50 BONUS!', '#ff6600');
            this.score += 50;
            this.scoreText.setText(`Счет: ${this.score}`);
            // Звук достижения
            this.sound.play('sfx_magic', { volume: 0.5 });
        }

        // Сбрасываем флаг justScored100, когда счет становится не кратным 100
        if (this.score % 100 !== 0) {
            this.justScored100 = false;
        }

        // Проверяем высоту для специального бонуса
        const heightBonusThreshold = -1000; // При достижении высоты -1000
        if (this.player.y < heightBonusThreshold && !this.heightBonusGiven) {
            this.heightBonusGiven = true;
            this.showFloatingText(this.player.x, this.player.y - 150, 'HIGH FLYER +100!', '#00ffff');
            this.score += 100;
            this.scoreText.setText(`Счет: ${this.score}`);
            // Звук высокого достижения
            this.sound.play('sfx_gem', { volume: 0.6 });
        }
    }
    
    /**
     * Обработка попадания метеорита в игрока
     */
    hitByMeteor(player, meteor) {
        // Проверяем, есть ли у игрока щит
        if (player.getData('shield')) {
            // Если у игрока есть щит, создаем визуальный эффект и уничтожаем метеорит
            VisualEffects.createFlashEffect(this, meteor.x, meteor.y, 0x0088ff);
            // Звук защиты щитом
            this.sound.play('sfx_magic', { volume: 0.4 });
            meteor.setActive(false);
            meteor.setVisible(false);
            return;
        }

        // Звук получения урона
        this.sound.play('sfx_hurt', { volume: 0.6 });

        // При попадании метеорита игрок падает вниз
        player.setVelocityY(300); // Направляем игрока вниз

        // Создаем эффект взрыва
        VisualEffects.createExplosionEffect(this, player.x, player.y);
        
        // Возвращаем метеорит в пул
        meteor.setActive(false);
        meteor.setVisible(false);
    }

    /**
     * Очистка ресурсов при завершении сцены
     * Предотвращает утечки памяти и висячие таймеры
     */
    shutdown() {
        // Очищаем все слушатели событий ввода
        this.input.removeAllListeners();

        // Проходим по всем платформам и корректно удаляем их
        this.platformPool.children.each((platform) => {
            this.removePlatform(platform);
        });

        // Очищаем пулы объектов
        this.bonusPool.clear(true, true);
        this.meteorPool.clear(true, true);
        this.flashingPlatformPool.clear(true, true);

        // Сбрасываем масштаб времени (если был замедлен бонусом SLOWTIME)
        this.time.timeScale = 1.0;

        // Сбрасываем флаги
        this.jumpKeyWasPressed = false;
    }
}

export default MainScene;