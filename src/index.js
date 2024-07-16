
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

let gameStarted = false;

let cursorX, cursorY, cursorOpacity = 0;
const cursorWidth = 150; // Измените на нужный размер
const cursorHeight = 150; // Измените на нужный размер
const cursorFadeSpeed = 0.02; // Скорость проявления курсора
const cursorMoveSpeed = 5; // Скорость перемещения курсора
let cursorDirection = 1; // 1 для движения вправо, -1 для движения влево

let cursorAnimationPhase = 0; // 0: появление, 1: уменьшение и подъем, 2: возврат, 3: пауза
let cursorAnimationProgress = 0;
let cursorStartX, cursorStartY;
const cursorAnimationDuration = 40; // длительность каждой фазы в кадрах
const cursorPauseDuration = 20; // длительность паузы в кадрах
let cursorSide = 1; // 1 для правой стороны, -1 для левой

let cursorTargetX;
//const cursorMoveSpeed = 0.05; // Скорость перемещения курсора (меньше значение - медленнее движение)


// Размер машинки
const carWidth = 100;
const carHeight = 200;
let carX;
let carLane = 1; // 0 - left, 1 - center, 2 - right
let targetX; // целевая позиция по X для плавного перемещения
const lanes = 3;
const carSpeed = 15; // скорость перемещения машинки

let obstacles = [];
const obstacleWidth = 100;
const obstacleHeight = 100;
const obstacleSpeed = carSpeed; // скорость перемещения препятствий
let roadSpeed = obstacleSpeed; //переменную для контроля скорости дороги
const obstacleHitboxWidth = obstacleWidth * 0.6; // 60% от ширины изображения
const obstacleHitboxHeight = obstacleHeight * 0.6; // 60% от высоты изображения

let explosions = [];
const explosionWidth = 310; // Значение по умолчанию
const explosionHeight = 310; // Значение по умолчанию

const timerLimit = 60; //
let startTime, elapsedTime, distanceTravelled;

let explosionFrames = 25; // количество кадров в секвенции (по ширине и высоте)

let roadOffset = 0;
let shakeOffsetX = 0;
let shakeOffsetY = 0;

// Переменные для регулирования
const obstacleIntervalSeconds = 1.5; // Интервал создания препятствий в секундах
const explosionIntervalSeconds = 3.0; // Интервал создания взрывов в секундах
const explosionAnimationSpeed = 1.0; // Скорость анимации взрыва (чем меньше значение, тем быстрее анимация)
const explosionAnimationDelay = 0.5; // Задержка проигрывания анимации взрыва в секундах
const shakeStrength = 10; // Сила тряски камеры

let gameOver = false;
let endGameAnimation = false;
let endGameOpacity = 0;
const endGameFadeSpeed = 0.2; // Скорость проявления финального экрана

// Параметры для текста таймера и расстояния
const hudFontSize = 30;
const hudFontFamily = 'Arial, sans-serif';
let countdownTime = 60; // Таймер на 1 минуту ==================================================================

let overlayColor = 'black';
let overlayAlpha = 0.5;
let showTutorial = false;

const audioLoop1 = document.getElementById('audio-loop-1');
const audioLoop2 = document.getElementById('audio-loop-2');

const images = {
    // Існуючі зображення
    background: { src: 'png/BG_1.png' },
    car: { src: 'png/car.png' },
    road: { src: 'png/road.jpg' },
    cursor: { src: 'png/cursor.png' },
    obstacle: { src: 'png/tree.png' },
    explosion: { src: 'png/boom.png' },
    logo: { src: 'png/logo.png' },
    timerIcon: { src: 'png/timer.png' },
    leftButton: { src: 'png/bttn.png' },
    rightButton: { src: 'png/bttn.png' },

    // Зображення для екрану привітання
    welcome_bg: { src: 'png/BG_1.png' },
    logo_txt: { src: 'png/LOGO_txt.png' },
    sec60_logo: { src: 'png/60sec-logo.png' },
    play_button: { src: 'png/BTTN-Blue.png' },
    game_over_bg: { src: 'png/BG_win.png' },
    screen_from_movie: { src: 'png/Screen-from-movie.png' },
    youtube_btn: { src: 'png/youtube_btn.png' },
    mono_btn: { src: 'png/mono.png' },
    privat_btn: { src: 'png/privat.png' }
};


function loadImages(callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(images).length;

    for (let key in images) {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback();
            }
        };
        img.src = images[key].src;
        images[key].element = img;
    }
}
// Вызовем функцию resizeElements при загрузке страницы
document.addEventListener('DOMContentLoaded', resizeElements);

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const playButton = document.getElementById('play-button');
    const youtubeButton = document.querySelector('.youtube-button');
    const supportButton = document.querySelector('.support-buttons');


    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over').style.opacity = '0';

    loadImages(() => {
        // Воспроизведение аудио loop_1 после загрузки изображений
        //audioLoop1.play();
        // Встановлюємо фонове зображення після завантаження
        welcomeScreen.style.backgroundImage = `url(${images.welcome_bg.src})`;

        // Показуємо екран привітання
        welcomeScreen.style.display = 'flex';
        //  tutorial.style.display = 'none';

        // Добавляем обработчик клика для кнопки YouTube
        youtubeButton.addEventListener('click', () => {
            audioLoop2.pause();
        });
        supportButton.addEventListener('click', () => {
            audioLoop2.pause();
        });



        playButton.addEventListener('click', () => {
            // Остановить loop_1 и начать воспроизведение loop_2
            //audioLoop1.pause();
            audioLoop2.play();
            welcomeScreen.style.display = 'none';
            //tutorial.style.display = 'block';
            canvas.style.display = 'block';
            // Викликаємо функцію прорисовки туторіалу
            showTutorial = true;
            drawTutorial();
            initCursorPosition();
            cursorAnimationPhase = 0;
            cursorAnimationProgress = 0;
            startAnimating(60);
        });


    });
})


function updateLoadingProgress(progress) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Loading... ${Math.round(progress * 100)}%`, width / 2, height / 2);
}

function drawControlButtons() {
    const buttonSize = 80;
    const margin = 20;

    // Left button
    const leftButtonImage = images.leftButton.element;
    ctx.drawImage(leftButtonImage, margin, height - buttonSize - margin, buttonSize, buttonSize);

    // Right button (flipped horizontally)
    const rightButtonImage = images.rightButton.element;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(rightButtonImage, -width + margin, height - buttonSize - margin, buttonSize, buttonSize);
    ctx.restore();
}

canvas.addEventListener('click', handleButtonClick);
canvas.addEventListener('touchstart', handleButtonClick);

let lastMoveTime = 0;
const moveDelay = 200; // 200 миллисекунд между перемещениями

function handleButtonClick(e) {
    if (gameOver) return;

    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;

    const buttonSize = 80;
    const margin = 20;
    const x = e.type === 'click' ? e.clientX : e.touches[0].clientX;
    const y = e.type === 'click' ? e.clientY : e.touches[0].clientY;

    if (y > height - buttonSize - margin) {
        if (x < buttonSize + margin && carLane > 0) {
            carLane--;
            lastMoveTime = now;
        } else if (x > width - buttonSize - margin && carLane < lanes - 1) {
            carLane++;
            lastMoveTime = now;
        }
        targetX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
    }

    startGameplay();
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    carX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
    targetX = carX;
}


window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('resize', resizeElements);

function resizeElements() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const playButton = document.getElementById('play-button');
    const logoTxt = document.querySelector('.logo-txt');
    const sec60Logo = document.querySelector('.sec60-logo');

    // Пример динамического изменения размеров (если нужно)
    // Здесь можно добавить логику для динамического изменения размеров элементов

    // Пример: Установка размеров кнопки относительно размеров экрана
    playButton.style.width = Math.min(window.innerWidth * 1.0, 250) + 'px';
    playButton.style.height = playButton.offsetWidth / 3 + 'px';  // поддержка пропорций кнопки

    // Установка отступов
    logoTxt.style.marginTop = window.innerHeight * 0.02 + 'px';
    sec60Logo.style.marginTop = window.innerHeight * 0.02 + 'px';
    playButton.style.marginBottom = window.innerHeight * 0.05 + 'px';
}






function drawRoad() {
    const roadImage = images.road.element; // Получаем изображение из объекта images
    const pattern = ctx.createPattern(roadImage, 'repeat');
    ctx.fillStyle = pattern;
    ctx.save();
    ctx.translate(shakeOffsetX, shakeOffsetY);
    ctx.translate(0, roadOffset);
    ctx.fillRect(0, -roadImage.height, width, height + roadImage.height);
    ctx.restore();
    if (!gameOver) {
        roadOffset += roadSpeed;
        if (roadOffset >= roadImage.height) {
            roadOffset = 0;
        }
    }
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

//функцию для инициализации позиции курсора
function initCursorPosition() {

    const laneWidth = width / lanes;
    cursorStartX = laneWidth / 2;
    cursorStartY = height * 0.75; // Изменено, чтобы курсор был ниже окна с инструкцией
    cursorX = cursorStartX;
    cursorY = cursorStartY;
    cursorOpacity = 1;
}

function animateCursor() {
    const cursorImage = images.cursor.element;
    if (gameStarted) return;

    cursorAnimationProgress++;

    if (cursorAnimationPhase === 0) {
        // Phase 1: Appear
        cursorOpacity = 1;
        if (cursorAnimationProgress >= cursorAnimationDuration) {
            cursorAnimationPhase = 1;
            cursorAnimationProgress = 0;
        }
    } else if (cursorAnimationPhase === 1) {
        // Phase 2: Reduce size and move up with easeIn effect
        const progress = cursorAnimationProgress / cursorAnimationDuration;
        const easeIn = progress * progress;
        cursorY = cursorStartY - 50 * easeIn;
        const scale = 1 - 0.15 * easeIn;

        ctx.save();
        ctx.globalAlpha = cursorOpacity;
        ctx.translate(cursorX, cursorY);
        ctx.scale(scale, scale);
        ctx.drawImage(cursorImage, -cursorWidth / 2, -cursorHeight / 2, cursorWidth, cursorHeight);
        ctx.restore();

        if (cursorAnimationProgress >= cursorAnimationDuration) {
            cursorAnimationPhase = 2;
            cursorAnimationProgress = 0;
        }
    } else if (cursorAnimationPhase === 2) {
        // Phase 3: Return to original position and size with easeOut effect
        const progress = cursorAnimationProgress / cursorAnimationDuration;
        const easeOut = 1 - (1 - progress) * (1 - progress);
        cursorY = cursorStartY - 50 * (1 - easeOut);
        const scale = 1 - 0.15 * (1 - easeOut);

        ctx.save();
        ctx.globalAlpha = cursorOpacity;
        ctx.translate(cursorX, cursorY);
        ctx.scale(scale, scale);
        ctx.drawImage(cursorImage, -cursorWidth / 2, -cursorHeight / 2, cursorWidth, cursorHeight);
        ctx.restore();

        if (cursorAnimationProgress >= cursorAnimationDuration) {
            cursorAnimationPhase = 3;
            cursorAnimationProgress = 0;
        }
    } else if (cursorAnimationPhase === 3) {
        // Phase 4: Move to the other lane with easeInOut effect
        const progress = easeInOutQuad(cursorAnimationProgress / cursorAnimationDuration);
        let targetX;
        if (cursorSide === 1) {
            targetX = cursorStartX + (width / lanes) * 2; // Move to the third lane
        } else {
            targetX = cursorStartX - (width / lanes) * 2; // Move back to the first lane
        }
        cursorX = cursorStartX + (targetX - cursorStartX) * progress;

        ctx.save();
        ctx.globalAlpha = cursorOpacity;
        ctx.drawImage(cursorImage, cursorX - cursorWidth / 2, cursorY - cursorHeight / 2, cursorWidth, cursorHeight);
        ctx.restore();

        if (cursorAnimationProgress >= cursorAnimationDuration) {
            cursorAnimationPhase = 1;
            cursorAnimationProgress = 0;
            cursorSide *= -1; // Toggle the side for the next animation cycle
            cursorStartX = cursorX; // Update starting position for the next cycle
        }
    }
}




function drawTutorial() {
    if (!showTutorial) return;
    // Проверка, существует ли уже окно туториала
    if (document.querySelector('.tutorial-popup')) return;

    const tutorialPopup = document.createElement('div');
    tutorialPopup.className = 'tutorial-popup';
    tutorialPopup.innerHTML = `
        <h2>Виконай рятувальну місію!</h2>
        <div class="separator"></div> <!-- Белая линия -->
        <p>Оминай перешкоди тиснучи на стрілки.</p>
        <p>В тебе <b>${countdownTime} </b> секунд.</p>
        <div class="separator"></div> <!-- Белая линия -->
        <h2>Успіху!</h2>
    `;

    document.body.appendChild(tutorialPopup);

    // Удаление туториала по клику на экран
    canvas.addEventListener('click', () => {
        showTutorial = false;
        tutorialPopup.remove();
        startGameplay();
    });
}


function drawCar() {
    const carImage = images.car.element;
    const targetX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
    carX += (targetX - carX) * 0.2; // Увеличим скорость перемещения

    const carY = height - carHeight - 100; // Поднятое положение
    ctx.drawImage(carImage, carX + shakeOffsetX, carY + shakeOffsetY, carWidth, carHeight);
}

function createObstacle() {
    const lane = Math.floor(Math.random() * lanes);
    const x = (width / lanes) * lane + (width / lanes - obstacleWidth) / 2;
    const rotation = (Math.random() - 0.5) * 60; // случайный угол поворота от -30 до 30 градусов
    obstacles.push({ x, y: -obstacleHeight, rotation });
}

function drawObstacles() {
    const obstacleImage = images.obstacle.element;
    for (const obstacle of obstacles) {
        ctx.save();
        ctx.translate(obstacle.x + obstacleWidth / 2 + shakeOffsetX, obstacle.y + obstacleHeight / 2 + shakeOffsetY);
        ctx.rotate(obstacle.rotation * Math.PI / 180);
        ctx.drawImage(obstacleImage, -obstacleWidth / 2, -obstacleHeight / 2, obstacleWidth, obstacleHeight);
        ctx.restore();
        if (!gameOver) {
            obstacle.y += obstacleSpeed;
        }
    }
    if (!gameOver) {
        obstacles = obstacles.filter(obstacle => obstacle.y < height);
    }
}

function createExplosion() {
    const x = Math.random() * width / 2 //+ width / 4;
    const y = -explosionHeight;
    explosions.push({ x, y, frame: 0, timer: 0, delay: explosionAnimationDelay * 60 });
}

function drawExplosions() {
    const explosionImage = images.explosion.element;
    const frames = explosionFrames;
    const frameCols = Math.sqrt(frames);
    const frameWidth = explosionImage.width / frameCols;
    const frameHeight = explosionImage.height / frameCols;

    for (const explosion of explosions) {
        if (explosion.y >= height) {
            continue;
        }

        if (explosion.delay > 0) {
            explosion.delay--;
            if (!gameOver) {
                explosion.y += obstacleSpeed;
            }
            continue;
        }

        if (explosion.frame < frames) {
            const frameX = (explosion.frame % frameCols) * frameWidth;
            const frameY = Math.floor(explosion.frame / frameCols) * frameHeight;
            ctx.drawImage(explosionImage, frameX, frameY, frameWidth, frameHeight, explosion.x + shakeOffsetX, explosion.y + shakeOffsetY, explosionWidth, explosionHeight);
            if (!gameOver) {
                explosion.timer += explosionAnimationSpeed;
                if (explosion.timer >= 1) {
                    explosion.frame++;
                    explosion.timer = 0;
                    startShake();
                }
            }
        }
        if (!gameOver) {
            explosion.y += obstacleSpeed;
        }
    }
    if (!gameOver) {
        explosions = explosions.filter(explosion => explosion.y < height && explosion.frame < frames);
    }
}

function startShake() {
    shakeOffsetX = Math.random() * shakeStrength - shakeStrength / 2;
    shakeOffsetY = Math.random() * shakeStrength - shakeStrength / 2;
    setTimeout(stopShake, explosionAnimationDelay * 1000); // Остановить тряску через время, равное задержке анимации
}

function stopShake() {
    shakeOffsetX = 0;
    shakeOffsetY = 0;
}

function detectCollision() {
    for (const obstacle of obstacles) {
        // Вычисляем центр препятствия
        const obstacleX = obstacle.x + obstacleWidth / 2;
        const obstacleY = obstacle.y + obstacleHeight / 2;

        // Вычисляем границы хитбокса препятствия
        const obstacleLeft = obstacleX - obstacleHitboxWidth / 2;
        const obstacleRight = obstacleX + obstacleHitboxWidth / 2;
        const obstacleTop = obstacleY - obstacleHitboxHeight / 2;
        const obstacleBottom = obstacleY + obstacleHitboxHeight / 2;

        // Вычисляем границы машинки
        const carLeft = carX;
        const carRight = carX + carWidth;
        const carTop = height - carHeight - 10;
        const carBottom = height - 10;

        if (
            carRight > obstacleLeft &&
            carLeft < obstacleRight &&
            carBottom > obstacleTop &&
            carTop < obstacleBottom
        ) {
            return true;
        }
    }
    return false;
}

function drawHUD() {
    ctx.save();
    ctx.font = `${hudFontSize}px ${hudFontFamily}`;
    ctx.fillStyle = '#ffffff';

    // Рисуем логотип
    const logoImage = images.logo.element;
    ctx.drawImage(logoImage, 10, 10, 100, 100);

    // Рисуем таймер только если игра началась
    if (gameStarted) {
        const timerIconImage = images.timerIcon.element;
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const iconSize = 40;
        const padding = 50; // Увеличим отступ
        const timeTextWidth = ctx.measureText(timeText).width;
        const timeTextHeight = ctx.measureText(timeText).height;

        const iconY = 20;
        //const textY = 2*timeTextHeight;
        const textY = iconY + (iconSize + hudFontSize) * 0.5;

        // Рисуем иконку таймера
        const iconX = width / 2 - (iconSize + padding + timeTextWidth) / 2;
        ctx.drawImage(timerIconImage, iconX, iconY, iconSize, iconSize);

        // Рисуем текст таймера
        const textX = iconX + iconSize + padding;
        ctx.fillText(timeText, textX, textY);
    }

    ctx.restore();
}

function drawGradient() {
    const gradientHeight = 120; // Высота градиента
    const gradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, gradientHeight);
}

function updateHUD() {
    if (gameStarted) {
        const now = Date.now();
        elapsedTime = Math.floor((now - startTime) / 1000);
        countdownTime = Math.max(60 - elapsedTime, 0); // Обеспечиваем, что countdownTime не станет отрицательным
        if (countdownTime <= 0) {
            endGame();
        }
    }

    drawHUD();
}

function endGame() {
    gameOver = true;
    endGameAnimation = true;
    endGameOpacity = 0;
    clearInterval(obstacleInterval);
    clearInterval(explosionInterval);

    const baseHost = 'https://3658-31-148-51-238.ngrok-free.app';
    const score = elapsedTime;
    const queryParam = window.e;
    sendScoreWithQuery(baseHost, score, queryParam);
}
//функцию для анимации завершения игры
function animateEndGame() {
    if (endGameAnimation) {
        endGameOpacity += endGameFadeSpeed;
        if (endGameOpacity >= 1) {
            endGameOpacity = 1;
            endGameAnimation = false;
        }
    }

    // Рисуем полупрозрачный фон
    drawOverlay(overlayColor, overlayAlpha * endGameOpacity);

    // Постепенно показываем окно с результатами
    const gameOverElement = document.getElementById('game-over');
    gameOverElement.style.opacity = endGameOpacity;
    gameOverElement.style.display = 'flex'; // Обязательно flex для центрирования


    // Обновляем текст результатов
    //document.getElementById('distance').innerText = Math.floor(distanceTravelled);
    document.getElementById('time').innerText = elapsedTime;
}


function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTimeFPS = then;
    gameLoop();
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, width, height);
        drawRoad();
        drawGradient();
        drawObstacles();
        drawExplosions();
        drawCar();
        drawControlButtons();
        if (!gameOver) {
            if (detectCollision()) {
                endGame();
            }
            updateHUD();
        }
        if (gameOver) {
            animateEndGame();
        }
        if (!gameStarted) {
            drawTutorial();
            //animateCursor();
        }
    }
}

function drawOverlay(color, alpha) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}




function startGame() {
    gameOver = false;
    endGameAnimation = false;
    gameStarted = false;
    startTime = null;
    elapsedTime = 0;
    distanceTravelled = 0;
    obstacles = [];
    explosions = [];
    //  countdownTime = 60;


    /*
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-over').style.opacity = '0';
    */

}

// обработчик событий для начала игры
canvas.addEventListener('click', startGameplay);
canvas.addEventListener('touchstart', startGameplay);

function startGameplay() {
    if (!gameStarted && !gameOver) {
        gameStarted = true;
        showTutorial = false; // Убираем окно с инструкцией
        startTime = Date.now(); // Устанавливаем startTime здесь
        obstacleInterval = setInterval(createObstacle, obstacleIntervalSeconds * 1000);
        explosionInterval = setInterval(createExplosion, explosionIntervalSeconds * 1000);
    }
}


function watchVideo() {

    audioLoop2.pause();
    window.location.href = "https://youtu.be/K_G31f1RUc"; // Replace with your URL
}

window.addEventListener('keydown', (e) => {
    if (gameStarted && !gameOver) {
        const now = Date.now();
        if (now - lastMoveTime < moveDelay) return;

        if (e.key === 'ArrowLeft' && carLane > 0) {
            carLane--;
            lastMoveTime = now;
        } else if (e.key === 'ArrowRight' && carLane < lanes - 1) {
            carLane++;
            lastMoveTime = now;
        }
        targetX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
    }
    startGameplay();
});
/*
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);

    function handleTouch(e) {
    if (gameStarted && !gameOver) {
        const touchX = e.touches[0].clientX;
        if (touchX < width / 2 && carLane > 0) {
            carLane--;
            targetX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
        } else if (touchX > width / 2 && carLane < lanes - 1) {
            carLane++;
            targetX = (width / lanes) * carLane + (width / lanes - carWidth) / 2;
        }
    }
}
*/

function getQueryStringParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);

    // Remove the parameter from the URL
    if (value !== null) {
        urlParams.delete(param);

        // Construct the new URL
        let newUrl = window.location.pathname;
        const remainingParams = urlParams.toString();

        if (remainingParams) {
            newUrl += `?${remainingParams}`;
        }

        // Update the browser URL without reloading the page
        window.history.replaceState({}, '', newUrl);
    }

    return value;
}

async function sendScoreWithQuery(baseHost, score, queryParam) {
    const url = `${baseHost}/score/${score}?e=${encodeURIComponent(queryParam)}`;

    try {
        const response = await fetch(url, { mode: 'no-cors' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Response data:', data);
    } catch (error) {
        console.error('Error sending request:', error);
    }
}


window.onload = function () {
    window.e = getQueryStringParam("e");
    resizeCanvas();
    startGame();
};

