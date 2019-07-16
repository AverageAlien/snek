"use strict"
let Canvas = document.getElementById("main-canvas");
let Ctx = Canvas.getContext('2d');
Canvas.focus();


// RENDER

const CanvasData = {
    BgColor: "#000000",
    Width: 512,
    Height: 512,
    Framerate: 60
};
const GridData = {
    Height: 32,
    Width: 32
    //TODO: outline
}
const BlockColors = {
    Food: "#ff0000",
    Head: "#ffffff",
    Body: "#ffffff"
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
    return this;
}


setInterval(function() { // Render loop
    Ctx.fillStyle = CanvasData.BgColor;
    Ctx.fillRect(0, 0, CanvasData.Width, CanvasData.Height);

    RenderObjects.forEach(function(Sprite) {
        Ctx.fillStyle = Sprite.Color;
        Ctx.fillRect(Sprite.X, Sprite.Y, Sprite.W, Sprite.H);
    });

}, 1000 / CanvasData.Framerate);


// GAMEPLAY

function Block(type, x, y) {
    this.Type = type;
    this.X = x;
    this.Y = y;
    if (type == "Body") { 
        this.Age = 0;
    }
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
        0);
    RenderObjects.push(this.Sprite);
    return this;
}

let Blocks = [];

let Length = 4;
let Direction = 0; // 0 - right, 1 - up, 2 - left, 3 - down
let Speed = 3;

let Player = new Block("Head",
    GridData.Width / 2 + Math.floor(GridData.Width / 2 * (Math.random() - 0.5)),
    GridData.Height / 2 + Math.floor(GridData.Height / 2 * (Math.random() - 0.5))
);
Blocks.push(Player);

let Food = new Block("Food",
    Math.floor(GridData.Width * Math.random()),
    Math.floor(GridData.Height * Math.random())
);
Blocks.push(Food);
// TODO: check if food spawned on snake


setInterval(function() {
    let HeadX = Player.X;
    let HeadY = Player.Y;
    console.log("Direction: " + Direction);
    switch (Direction) {
        case 0:
            Player.Move(HeadX + 1, HeadY);
            break;
        case 1:
            Player.Move(HeadX, HeadY - 1);
            break;
        case 2:
            Player.Move(HeadX - 1, HeadY);
            break;
        case 3:
            Player.Move(HeadX, HeadY + 1);
            break;
    }
    if (Player.X == Food.X && Player.Y == Food.Y) {
        ++Length;
        console.log("Length: " + Length);
        Food.Move(
            Math.floor(GridData.Width * Math.random()),
            Math.floor(GridData.Height * Math.random())
        );
    }
    Blocks.forEach(function(b) { // TODO: optimize this shit, use queue instead of loop
        if (b.Type == "Body") {
            b.Age++;
            if (b.Age == Length) {
                b.Delete();
                Blocks.splice(Blocks.indexOf(b), 1); // TODO: move this inside Block object's Delete() method
            }
        }
    });
    Blocks.push(new Block("Body", HeadX, HeadY));
}, 1000 * (1 / Speed));






// INPUT

Canvas.addEventListener("keydown", function(event) {
    console.log(event.key);
    switch(event.key) {
        case 'd':
            Direction = 0;
            break;
        case 'w':
            Direction = 1;
            break;
        case 'a':
            Direction = 2;
            break;
        case 's':
            Direction = 3;
            break;
    }
});
