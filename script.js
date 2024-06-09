// !! Awesome 2D Enemy assets by https://bevouliin.com/  !!

const canvas = document.getElementById("mainCanvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
context.font = "50px Impact";

let timeToNextRaven = 0;
let ravenInterval = 1300;
let lastTime = 0;
let speedMultiplier = 0.4;
let levelUpDelay = 5000;
let timeSinceLevelUp = 0;

let score = 0;
let lives = 10;
let gameOver = false;

var enemySpriteAddresses = [
    "img/bee_yellow.png",
    "img/bee_red.png",
    "img/bee_purple.png"
]


let ravens = [];

class Raven{
    constructor(address){
        this.spriteWidth = 169;
        this.spriteHeight = 128;
        this.sizeModifier = Math.random() * 0.5 + 0.5;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = (Math.random() * 5 + 3) * speedMultiplier;
        this.directionY = (Math.random() * 5 - 2.5) * speedMultiplier;
        this.pendingDestroy = false;
        this.image = new Image();
        this.image.src = address
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.abs(this.directionX) * 20.0;
        
    }
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height)
        {
            this.directionY *= -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.pendingDestroy = true;

        this.timeSinceFlap += deltaTime;
        if(this.timeSinceFlap > this.flapInterval)
        {
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
        }
        if(this.x < 0 - this.width)
        {
            if(lives === 0)
            {
                gameOver = true;
            }
            else
            {
                lives--;
            }
        }
    }
    draw(){
        context.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
             this.x, this.y, this.width, this.height);
    }
}

let explosions = [];

class Explosion{
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = "img/boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = "audio/boom.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.pendingDestroy = false;
    }
    update(deltaTime){
        this.timeSinceLastFrame += deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval)
        {
            this.timeSinceLastFrame = 0;
            this.frame++;
            if(this.frame > 5) this.pendingDestroy = true;
        }
    }
    draw(){
        context.drawImage(this.image, this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size);
    }
    playAudio(){
        this.sound.play();
    }
}

function drawScore()
{
    context.fillStyle = "black";
    context.fillText("Score: " + score, 50, 75);
    context.fillStyle = "white";
    context.fillText("Score: " + score, 53, 77);

    context.fillStyle = "black";
    context.fillText("Lives: " + lives, 50, 130);
    context.fillStyle = "white";
    context.fillText("Lives: " + lives, 53, 133);

}

function drawGameOver(){
    context.textAlign = "center";
    context.fillStyle = "magenta";
    context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
    context.fillStyle = "magenta";
    context.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 50);

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeText("GAME OVER!", canvas.width / 2, canvas.height / 2);
    context.strokeText("Score: " + score, canvas.width / 2, canvas.height / 2 + 50);

    context.fillStyle = "black";
    context.save();
    context.font = "bold 16px Arial";
    context.fillText("Refresh the browser to try again.", canvas.width / 2, canvas.height / 2 + 80);
    context.restore();
}

window.addEventListener("click", function(e){
    if(gameOver) return;
    for(let i = 0; i < ravens.length; i++)
    {
        if(e.x > ravens[i].x && e.x < ravens[i].x + ravens[i].width)
        {
            if(e.y > ravens[i].y && e.y < ravens[i].y + ravens[i].height)
            {
                ravens[i].pendingDestroy = true;
                score++;
                let explosion = new Explosion(ravens[i].x, ravens[i].y, ravens[i].width);
                explosions.push(explosion);
                explosion.playAudio();
                break;
            }
        }
    }
})

function animate(timestamp){
    context.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;

    if(!gameOver && timeToNextRaven > ravenInterval)
    {
        timeToNextRaven = 0;

        let randomEnemy = Math.floor(Math.random() * enemySpriteAddresses.length)

        ravens.push(new Raven(enemySpriteAddresses[randomEnemy]));
    }

    timeSinceLevelUp += deltaTime;
    if(timeSinceLevelUp >= levelUpDelay)
    {
        timeSinceLevelUp = 0;
        speedMultiplier += 0.02;
        if(ravenInterval > 300)
        {
            ravenInterval -= 20;
        }
    }

    if(!gameOver) drawScore();
    else drawGameOver();

    [...ravens, ...explosions].forEach(obj => {
        obj.update(deltaTime),
        obj.draw()
    });

    ravens = ravens.filter(obj => !obj.pendingDestroy);
    explosions = explosions.filter(obj => !obj.pendingDestroy);


    requestAnimationFrame(animate);
}
animate(0);