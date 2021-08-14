let cvs = document.querySelector("#flappy-canvas"),
    ctx = cvs.getContext("2d");

let frames = 0;

// element image 
let sprite = new Image();
sprite.src = "/img/sprite.png";

// sound 

let Score = new Audio();
Score.src = './sound/score.wav';

let Die = new Audio();
Die.src = './sound/die.wav';

let Flap = new Audio();
Flap.src = './sound//flap.wav';

let Start = new Audio();
Start.src = './sound/start.wav';

let Hit = new Audio();
Hit.src = './sound/hit.wav';
 

// state of game 
var state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

 

function clickHandler() {
    switch (state.current) {
        case state.getReady:
            Start.play();
            state.current = state.game;
            break;
        case state.game:
            Flap.play();
            bird.flap();
            break;

        default:
            bird.speed =0 ;
            pipes.position = [];
            score.value = 0 ;
            state.current = state.getReady;
           
            break;
    }
}

// space event 
cvs.addEventListener('click', clickHandler);
document.addEventListener("keydown", function (e) {
    if (e.which == 32) {
        clickHandler();
    }
})

// background 
var bg = {
    sx: 0,
    sy: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,
    draw: function () {

        ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }

}


var fg = {
    sx: 276,
    sy: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx : 2,
    draw: function () {

        ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    update:function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx) % (this.w /2);
        }
    }

}
var pipes = {
    top: {
        sx: 553,
        sy: 0
    },
    bottom: {
        sx: 502,
        sy: 0
    },
    w: 53,
    h: 400,
    gap: 80,
    dx: 2,
    position: [],
    maxYPos: -150,
    drow: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            ctx.drawImage(sprite, this.top.sx, this.top.sy, this.w, this.h, p.x, topYPos, this.w, this.h)
            ctx.drawImage(sprite, this.bottom.sx, this.bottom.sy, this.w, this.h, p.x, bottomYPos, this.w, this.h)

        }
    },
    update: function () {
        if (state.current != state.game) return;
        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            })
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx;

            let bottomPipesPos = p.y + this.h + this.gap ;

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                    state.current = state.over ;
                   Hit.play();
            }

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > bottomPipesPos && bird.y - bird.radius < bottomPipesPos + this.h) {
                state.current = state.over;
                Hit.play();
            }

            if(p.x + this.w <=0){
                this.position.shift()
                score.value +=1 ; 
                score.best = Math.max(score.value , score.best);
                localStorage.setItem("best", "score.best");
                Score.play();
            }
        }
    }
}


var getReady = {
    sx: 0,
    sy: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,
    draw: function () {

        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }

}
var gameOver = {
    sx: 175,
    sy: 228,
    w: 235,
    h: 202,
    x: cvs.width / 2 - 235 / 2,
    y: 90,
    draw: function () {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }

}
var bird = {
    animation: [{
            sx: 276,
            sy: 112
        },
        {
            sx: 276,
            sy: 139
        },
        {
            sx: 276,
            sy: 164
        },
        {
            sx: 276,
            sy: 139
        },
    ],
    w: 34,
    h: 26,
    x: 50,
    y: 150,
    animationIndex: 0,
    speed:0,
    radius : 12,
    gravity:0.25,
    draw: function () {
        let bird = this.animation[this.animationIndex]
        ctx.drawImage(sprite, bird.sx, bird.sy, this.w, this.h, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)

    },
    update: function () {
        let period = state.current == state.getReady ?15 : 5;
        this.animationIndex += frames % period == 0 ? 1 : 0;
        this.animationIndex = this.animationIndex% this.animation.length ; 

        if(state.current == state.getReady){
            this.y = 150;
        }else{
            this.speed += this.gravity;
            this.y += this.speed
        }

        if(this.y + this.h/2 >=cvs.height - fg.h){
            this.y = cvs.height - fg.h -this.h/2;
            this.animationIndex =1 ;
            if(state.current == state.game){
                Die.play();
                state.current = state.over;
            }
        }
    },

    flap: function () {
        this.speed = - 4;
        
    }

}

var score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    draw : function(){

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#d17300"
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px IMPACT";

            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        }else if(state.current == state.over){
          
            ctx.font = "25px IMPACT";

            ctx.fillText(this.value, 225 , 186);
            ctx.strokeText(this.value, 225 , 186);

            ctx.fillText(this.best, 225 , 228);
            ctx.strokeText(this.best, 225 , 228);
        }
    },
}

function update() {
  bird.update();

  fg.update();
  pipes.update();
  
}

function draw() {
    ctx.fillStyle = " #70c5ce"
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    fg.draw();
    pipes.drow();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    
}

function animate() {
    update();
    draw();
    frames++;

    requestAnimationFrame(animate);
}
animate();