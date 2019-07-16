"use strict"
let Canvas = document.getElementById("main-canvas");
let Ctx = Canvas.getContext('2d');
Canvas.focus();

// MATH extension
Math.clamp = function(num, min, max) {
    return(Math.max(min, Math.min(num, max)));
}

// RENDER

const CanvasData = {
    BgColor: "#000000",
    Width: 512,
    Height: 512,
    Framerate: 60
};
CanvasData.Ratio = CanvasData.Width / CanvasData.Height;
const GridData = {
    Height: 32,
    Width: 32,
    Outline: 1,
    OutlineColor: "#303030"
}
const BlockColors = {
    Food: "#ff0000",
    Head: "#ffffff",
    Body: "#ffffff",
    Dead: "#314a3d"
}

Ctx.fillStyle = CanvasData.BgColor;
Ctx.fillRect(0, 0, CanvasData.Width, CanvasData.Height);


let RenderObjects = [];

function Rect(x, y, width, height, color="#ffffff", border=0) {
    this.X = x;
    this.Y = y;
    this.W = width;
    this.H = height;
    this.Color = color;
    this.Border = border;

    this.Draw = function() {
        if (this.Border > 0) {
            Ctx.fillStyle = GridData.OutlineColor;
        } else {
            Ctx.fillStyle = this.Color;
        }
        Ctx.fillRect(this.X, this.Y, this.W, this.H);
        if (this.Border > 0) {
            Ctx.fillStyle = this.Color;
            Ctx.fillRect(
                Math.clamp(this.X + this.Border, this.X, this.X + this.W / 2),
                Math.clamp(this.Y + this.Border, this.Y, this.Y + this.H / 2),
                Math.clamp(this.W - this.Border * 2, 0, this.W),
                Math.clamp(this.H - this.Border * 2, 0, this.H)
            );
        }
    }

    return this;
}


setInterval(function() { // Render loop
    Ctx.fillStyle = CanvasData.BgColor;
    Ctx.fillRect(0, 0, CanvasData.Width, CanvasData.Height);

    RenderObjects.forEach(function(Sprite) {
        Sprite.Draw();
    });

}, 1000 / CanvasData.Framerate);


// GAMEPLAY

// Base values
let Body = [];
const BaseLength = 4;
let Length = BaseLength;
let Direction = 0; // 0 - right, 1 - up, 2 - left, 3 - down
let PrevDirection = 0;
let Speed = 5;
let Alive = true;

// Constructors
function Block(type, x, y) {
    this.Type = type;
    this.X = x;
    this.Y = y;
    this.Move = function(x, y) {
        this.X = x;
        this.Y = y;
        this.Sprite.X = this.X * CanvasData.Width / GridData.Width;
        this.Sprite.Y = this.Y * CanvasData.Width / GridData.Width;
    }
    this.Delete = function() {
        RenderObjects.splice(RenderObjects.indexOf(this.Sprite), 1);
    }

    this.Sprite = new Rect(
        this.X * CanvasData.Width / GridData.Width,
        this.Y * CanvasData.Height / GridData.Height,
        CanvasData.Width / GridData.Width,
        CanvasData.Height / GridData.Height,
        BlockColors[this.Type],
        GridData.Outline);

    this.SetType = function(Type) {
        this.Type = Type;
        this.Sprite.Color = BlockColors[this.Type];
    }

    RenderObjects.push(this.Sprite);
    if (type == "Body") {
        Body.push(this);
    }
    return this;
}


let Player = new Block("Head",
    GridData.Width / 2 + Math.floor(GridData.Width / 2 * (Math.random() - 0.5)),
    GridData.Height / 2 + Math.floor(GridData.Height / 2 * (Math.random() - 0.5))
);

function CheckFreeSpace(x, y) {
    for (let i = 0; i < Body.length; ++i) {
        if (Body[i].X == x && Body[i].Y == y) return false;
    }
    if (Player.X == x && Player.Y == y) return false;
    else return true;
}

let Food;
{
    let FoodCoords;
    do {
        FoodCoords = {
            X: Math.floor(GridData.Width * Math.random()),
            Y: Math.floor(GridData.Height * Math.random())
        }
    } while (!CheckFreeSpace(FoodCoords.X, FoodCoords.Y));
    
    Food = new Block("Food", FoodCoords.X, FoodCoords.Y);
}


let GameLoop = setInterval(function() {
    let HeadX = Player.X;
    let HeadY = Player.Y;
    console.log("Direction: " + Direction);
    switch (Direction) {
        case 0:
            if (HeadX == GridData.Width - 1) Lose();
            Body.forEach(function(b) {
                if (b.X == HeadX + 1 && b.Y == HeadY) Lose();
            });
            if (!Alive) return;
            Player.Move(HeadX + 1, HeadY);
            break;
        case 1:
            if (HeadY == 0) Lose();
            Body.forEach(function(b) {
                if (b.X == HeadX && b.Y == HeadY - 1) Lose();
            });
            if (!Alive) return;
            Player.Move(HeadX, HeadY - 1);
            break;
        case 2:
            if (HeadX == 0) Lose();
            Body.forEach(function(b) {
                if (b.X == HeadX - 1 && b.Y == HeadY) Lose();
            });
            if (!Alive) return;
            Player.Move(HeadX - 1, HeadY);
            break;
        case 3:
            if (HeadY == GridData.Height - 1) Lose();
            Body.forEach(function(b) {
                if (b.X == HeadX && b.Y == HeadY + 1) Lose();
            });
            if (!Alive) return;
            Player.Move(HeadX, HeadY + 1);
            break;
    }
    PrevDirection = Direction;
    if (Player.X == Food.X && Player.Y == Food.Y) {
        ++Length;
        let FoodCoords;
        do {
            FoodCoords = {
                X: Math.floor(GridData.Width * Math.random()),
                Y: Math.floor(GridData.Height * Math.random())
            }
        } while (!CheckFreeSpace(FoodCoords.X, FoodCoords.Y));
        Food.Move(FoodCoords.X, FoodCoords.Y);
    }
    if (Body.length == Length) {
        Body.shift().Delete();
    } else if (Body.length > Length) {
        throw new Error("Body array length is larger than Snake length value.");
    }
    new Block("Body", HeadX, HeadY);
}, 1000 * (1 / Speed));

function Lose() {
    if (!Alive) return;
    Alive = false;
    Player.SetType("Dead");
    Body.forEach(b => b.SetType("Dead"));
    clearInterval(GameLoop);
    alert("Game over! Your score: " + (Length - BaseLength));
}




// INPUT

document.body.addEventListener("keydown", function(event) {
    if (document.activeElement == Canvas && event.key == ' ') {
        event.preventDefault();
    }
});
Canvas.addEventListener("keydown", function(event) { // WASD keyboard input
    switch(event.key) {
        case 'd':
            if (PrevDirection != 2) Direction = 0;
            break;
        case 'w':
            if (PrevDirection != 3) Direction = 1;
            break;
        case 'a':
            if (PrevDirection != 0) Direction = 2;
            break;
        case 's':
            if (PrevDirection != 1) Direction = 3;
            break;
        case ' ': // stop game (for debug)
            clearInterval(GameLoop);
            break;
    }
});

document.body.addEventListener("touchstart", function(event) { // prevent touch gestures
    if (event.target == Canvas) event.preventDefault();
});
Canvas.addEventListener("touchstart", function(event) { // touch input
    let Rect = Canvas.getBoundingClientRect();
    let Touch = {
        X: event.touches[0].clientX - Rect.left,
        Y: event.touches[0].clientY - Rect.top
    }
    if (Touch.X > Touch.Y * CanvasData.Ratio) { // top right triangle
        if (Touch.Y > CanvasData.Height - Touch.X / CanvasData.Ratio) { // bottom right triangle
            if (PrevDirection != 2) Direction = 0;
        } else { // top left triangle
            if (PrevDirection != 3) Direction = 1;
        }
    } else { // bottom left triangle
        if (Touch.Y > CanvasData.Height - Touch.X / CanvasData.Ratio) { // bottom right triangle
            if (PrevDirection != 1) Direction = 3;
        } else { // top left triangle
            if (PrevDirection != 0) Direction = 2;
        }
    }
});
