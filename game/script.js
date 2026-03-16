const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const gameOverOverlay = document.getElementById('game-over-overlay');
const scoreEl = document.getElementById('currentScore');
const highscoreEl = document.getElementById('highScore');

canvas.width = 800;
canvas.height = 400;

let score = 0;
let highScore = localStorage.getItem('cyberDashHS') || 0;
highscoreEl.innerText = highScore;

let isGameRunning = false;
let gameSpeed = 5;
let obstacles = [];

const player = {
    x: 80, y: 350, width: 30, height: 30,
    color: '#00f2fe', gravity: 0.8, velocity: 0, onTop: false,
    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    },
    update() {
        this.onTop ? this.velocity -= this.gravity : this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y < 0) { this.y = 0; this.velocity = 0; }
        if (this.y + this.height > canvas.height) { this.y = canvas.height - this.height; this.velocity = 0; }
    },
    flip() { if (isGameRunning) this.onTop = !this.onTop; }
};

class Obstacle {
    constructor() {
        this.width = 25;
        this.height = 40 + Math.random() * 80;
        this.x = canvas.width;
        this.atTop = Math.random() > 0.5;
        this.y = this.atTop ? 0 : canvas.height - this.height;
    }
    draw() {
        ctx.fillStyle = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0055';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    update() { this.x -= gameSpeed; }
}

function handleObstacles() {
    if (Math.random() < 0.02) {
        if (obstacles.length === 0 || obstacles[obstacles.length-1].x < canvas.width - 250) {
            obstacles.push(new Obstacle());
        }
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        if (player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y) {
            gameOver();
        }
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            scoreEl.innerText = score;
            gameSpeed += 0.05;
        }
    }
}

function gameOver() {
    isGameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('cyberDashHS', highScore);
        highscoreEl.innerText = highScore;
    }
    document.getElementById('game-over-score-val').textContent = score;
    document.getElementById('game-over-high-val').textContent = highScore;
    gameOverOverlay.style.display = 'flex';
}

function startGame() {
    isGameRunning = true;
    startScreen.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    resetGame();
    animate();
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    player.y = canvas.height - 50;
    player.onTop = false;
    player.velocity = 0;
    scoreEl.innerText = score;
}

function animate() {
    if (!isGameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    player.update();
    player.draw();
    handleObstacles();
    requestAnimationFrame(animate);
}

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

window.addEventListener('keydown', (e) => { if(e.code === 'Space') player.flip(); });
canvas.addEventListener('mousedown', () => player.flip());
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); player.flip(); });