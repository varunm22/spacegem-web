(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 800,
    height = 600,
    player = {
        x: width / 2,
        y: height - 15,
        width: 5,
        height: 5,
        speed: 3,
        velX: 0,
        velY: 0,
        jumping: false,
        grounded: false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.3,
    r = 1.0,
    world = 0,
    level = 0;


canvas.width = width;
canvas.height = height;

var screen = 0;

function update() {
    ctx.clearRect(0, 0, width, height);
    if (screen === 0) {
        update_title()
    } else if (screen === 1) {
        update_worlds()
    } else if (screen === 2) {
        update_levels()
    } else if (screen === 3) {
        update_platformer()
    } else if (screen === 4) {
        update_spaceships()
    } else if (screen === 5) {
        update_intervals()
    } else if (screen === 6) {
        update_narrative() // TODO: make external thing for this
    }
}

function update_title() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = 60*r + "px Monospace";
    ctx.fillText("SPACEGEM", 400*r, 200*r);
    ctx.font = 40*r + "px Monospace";
    ctx.fillText("click anywhere to begin", 400*r, 400*r);
}

function update_worlds() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = 60*r + "px Monospace";
    ctx.fillText("Select World", 400*r, 200*r);
    ctx.textAlign = "left";
    ctx.font = 40*r + "px Monospace";
    ctx.fillText("World 1", 50*r, 400*r);
    ctx.fillText("World 2", 300*r, 400*r);
    ctx.fillText("World 3", 550*r, 400*r);
}

function update_levels() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = 60*r + "px Monospace";
    ctx.fillText("World " + (world+1) + " Levels", 400*r, 200*r);
    ctx.font = 40*r + "px Monospace";
    ctx.strokeStyle = "white";
    var i;
    for (i = 0; i < leveldata.world[world].level.length; i++) {
        ctx.fillText(i+1, 100+i*100*r, 400*r);
        ctx.beginPath();
        ctx.arc(100+i*100*r, 385*r, 30, 0, Math.PI * 2, true); // Outer circle
        ctx.stroke();
    }
}

function update_platformer() {
    // check keys
    if (keys[38] || keys[32]) {
        // up arrow or space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 2;
        }
    }
    if (keys[39]) {
        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys[37]) {
        // left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;
    player.velY += gravity;

    ctx.fillStyle = "black";
    ctx.beginPath();

    var boxes = leveldata.world[0].level[level].boxes;

    player.grounded = false;
    for (var i = 0; i < boxes.length; i++) {
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);

        var dir = colCheck(player, boxes[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }

    }

    if(player.grounded){
         player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});


window.addEventListener("load", function () {
    update();
});

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function isInside(mouseX, mouseY, x, y, width, height){
    return mouseX > x && mouseX < x+width && mouseY < y+height && mouseY > y;
}

canvas.addEventListener('click', function(event) {
    var mousePos = getMousePos(canvas, event);
    if (screen === 0) {
        screen = 1;
        update();
    } else if (screen === 1) {
        if (isInside(mousePos.x % 250*r, mousePos.y, 50*r, 360*r, 200*r, 40*r)) {
            screen = 2;
            world = Math.floor(mousePos.x/250)
            update();
        }
    } else if (screen === 2) {
        if (isInside(mousePos.x % 100*r, mousePos.y, 50*r, 360*r, 200*r, 40*r)) {
            screen = 3;
            level = Math.floor(mousePos.x/100)
            update();
        }
    }
}, false);
