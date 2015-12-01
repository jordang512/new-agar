var spawnrate = 5;
var numberOfAIs = 15;
var alive = true;
var currentFPS = 60;
var targetFPS = 60;
var MouseX = 0;
var MouseY = 0;
var pCount = 0;
var paused = true;
var speedIncCost = 10;
var speedMult = 1.00;
var size = {height: 2500, width: 2500};
var pellets = [];
var notifications = [];
var AIs = [];
var c = document.getElementById('mycanvas');
var ctx = c.getContext('2d');
var player = {
    size: 10,
    color: 'red',
    speed: 450,
    location: {x: size.width / 2, y: size.height / 2},
    type: 'player',
    style: 'circle',
    speedMult: 1
};
var sizeMult = 1;

function drawBackground() {
    ctx.beginPath();
    ctx.fillStyle = '#EAEAEA';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.closePath();
}

// Sets the speed of given user
function setSpeed(user) {
    user.speed = Math.pow(Math.sqrt(player.size + 190), -1) * 4000 * user.speedMult;
}

// Draws given user on the canvas
function drawUser(user) {
    ctx.beginPath();
    ctx.fillStyle = user.color;
    if (user.style == 'circle') {
        radius = Math.sqrt(user.size / Math.PI) * 10;
        ctx.moveTo((user.location.x - player.location.x) * sizeMult + c.width / 2,
            (user.location.y - player.location.y) * sizeMult + c.height / 2);
        ctx.arc((user.location.x - player.location.x) * sizeMult + c.width / 2,
            (user.location.y - player.location.y) * sizeMult + c.height / 2,
            radius*sizeMult, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    } else if (user.style == 'square') {
        radius = Math.sqrt(user.size) * 10 / 2;
        ctx.moveTo((user.location.x - player.location.x) * sizeMult + c.width / 2 - radius * sizeMult,
            (user.location.y - player.location.y) * sizeMult + c.height / 2 - radius * sizeMult);
        ctx.rect((user.location.x - player.location.x) * sizeMult + c.width / 2 - radius * sizeMult,
            (user.location.y - player.location.y) * sizeMult + c.height / 2 - radius * sizeMult,
            radius * 2 * sizeMult, radius * 2 * sizeMult);
        ctx.fill();
        ctx.closePath();
    }
    if (user.type == 'player' || user.type == 'AI') {
        for (i in pellets) {
            if (pellets[i].location.x < user.location.x + radius &&
                pellets[i].location.x > user.location.x - radius) {
                if (pellets[i].location.y < user.location.y + radius &&
                    pellets[i].location.y > user.location.y - radius) {
                    if (user.style == 'square') {
                        user.size += pellets[i].size;
                        pellets.splice(i, 1);
                        setSpeed(user);
                    } else if (user.style == 'circle') {
                        if (Math.sqrt(
                            (pellets[i].location.y - user.location.y) *
                            (pellets[i].location.y - user.location.y) +
                            (pellets[i].location.x - user.location.x) *
                            (pellets[i].location.x - user.location.x)) <
                            radius) {
                            user.size += pellets[i].size;
                            pellets.splice(i, 1);
                            setSpeed(user);
                        }
                    }
                }
            }
        }
        for (i in AIs) {
            if (user.size >= AIs[i].size * 1.414) {
                if (AIs[i].location.x < user.location.x + radius &&
                    AIs[i].location.x > user.location.x - radius) {
                    if (AIs[i].location.y < user.location.y + radius &&
                        AIs[i].location.y > user.location.y - radius) {
                        if (user.style == 'square') {
                            user.size += AIs[i].size;
                            AIs.splice(i, 1);
                            setSpeed(user);
                            targetNum = 0;
                        } else if (user.style == 'circle') {
                            if (Math.sqrt(
                                (AIs[i].location.y - user.location.y) *
                                (AIs[i].location.y - user.location.y) +
                                (AIs[i].location.x - user.location.x) *
                                (AIs[i].location.x - user.location.x)) <
                                radius) {
                                user.size += AIs[i].size;
                                AIs.splice(i, 1);
                                setSpeed(user);
                                targetNum = 0;
                            }
                        }
                    }
                }
            }
        }
        if (user.size >= player.size * 1.414) {
            if (player.location.x < user.location.x + radius &&
                player.location.x > user.location.x - radius) {
                if (player.location.y < user.location.y + radius &&
                    player.location.y > user.location.y - radius) {
                    if (user.style == 'square') {
                        user.size += player.size;
                        player.size = 0;
                        setSpeed(user);
                        targetNum = 0;
                    } else if (user.style == 'circle') {
                        if (Math.sqrt((player.location.y - user.location.y) *
                            (player.location.y - user.location.y) +
                            (player.location.x - user.location.x) *
                            (player.location.x - user.location.x)) < radius) {
                            user.size += player.size;
                            player.size = 0;
                            setSpeed(user);
                            targetNum = 0;
                        }
                    }
                }
            }
        }
    }
}


// Moves the player based on the mouse coords
function movePlayer() {
    // Calculates the distance between the player and mouse
    var distX = Math.abs(c.width / 2 - MouseX);
    var distY = Math.abs(c.height / 2 - MouseY);
    var dX = distX;
    var dY = distY;
    distX /= Math.sqrt((dX * dX) + (dY * dY));
    distY /= Math.sqrt((dX * dX) + (dY * dY));
    radius = Math.sqrt(player.size / Math.PI) * 10;
    // Gets slower as the mouse gets closer
    if (MouseX > c.width / 2 - 120 && MouseX < c.width / 2 + 120) {
        distX /= 120 / Math.abs(MouseX - c.width / 2);
    }
    if (MouseY > c.height / 2 - 120 && MouseY < c.height / 2 + 120) {
        distY /= 120 / Math.abs(MouseY - c.height / 2);
    }
    // Stops moving if mouse is within 10px of the center of the player
    // Moves player towards mouse
    if (!(MouseX > c.width / 2 - 10 && MouseX < c.width / 2 + 10 &&
        MouseY > c.height / 2 && MouseY < c.height / 2 + 20)) {
        if (player.location.x > 0 && MouseX < c.width / 2) {
            player.location.x -= player.speed / currentFPS * distX;
        } else if (player.location.x < size.height && MouseX > c.width / 2) {
            player.location.x += player.speed / currentFPS * distX;
        }
        if (player.location.y > 0 && MouseY < c.width / 2) {
            player.location.y -= player.speed / currentFPS * distY;
        } else if (player.location.y < size.width && MouseY > c.width / 2) {
            player.location.y += player.speed / currentFPS * distY;
        }
    }
}

// Moves the AI based on its direction
function moveAI(AI) {
    // Calculates the distance between the player and mouse
    var distX = Math.abs(c.width / 2 - AI.target.x);
    var distY = Math.abs(c.height / 2 - AI.target.y);
    var dX = distX;
    var dY = distY;
    distX /= Math.sqrt((dX * dX) + (dY * dY));
    distY /= Math.sqrt((dX * dX) + (dY * dY));
    radius = Math.sqrt(AI.size / Math.PI) * 10;
    // Moves AI towards target
    if (AI.location.x > 0 && AI.target.x < c.width / 2) {
        AI.location.x -= AI.speed / currentFPS * distX;
    } else if (AI.location.x < size.height && AI.target.x > c.width / 2) {
        AI.location.x += AI.speed / currentFPS * distX;
    }
    if (AI.location.y > 0 && AI.target.y < c.width / 2) {
        AI.location.y -= AI.speed / currentFPS * distY;
    } else if (AI.location.y < size.width && AI.target.y > c.width / 2) {
        AI.location.y += AI.speed / currentFPS * distY;
    }
}

function moveAIs() {
    for (i in AIs) {
        moveAI(AIs[i]);
    }
}

// Uses JQuery and html to find mouse coords
function setMousePosition(e) {
    MouseX = e.clientX - (window.innerWidth / 2 - c.width / 2) + 160;
    MouseY = e.clientY;
}

// Makes a random pellet on the screen
function makePellet() {
    var pX = Math.floor((Math.random()) * size.width);
    var pY = Math.floor((Math.random()) * size.height);
    var pellet = {
        location: {x: pX, y: pY},
        size: 1,
        type: 'pellet',
        color: randRGB(),
        style: 'circle'
    };
    pellets.push(pellet);
}

// Creates a random color for the pellets
function randRGB() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// Makes 500 pellets at the start of the game
function makeGamePellets() {
    for (i = 0; i < 500; i++) {
        makePellet();
    }
}

var maxPellets = 500;
// Makes a pellet every frame, maxing out at 2000
function makePellets() {
    if (pellets.length < maxPellets) {
        if (pCount == pelletSpawn) {
            pCount = 0;
            makePellet();
        } else {
            pCount++;
        }
    }
}

// Draws all the pellets around the player
function drawPellets() {
    for (i in pellets) {
        // Only draws pellets within the canvas
        if (!(pellets[i].location.x > player.location.x + c.height / 2 &&
            pellets[i].location.x < player.location.x - c.height / 2)) {
            if (!(pellets[i].location.y > player.location.y + c.width / 2 &&
                pellets[i].location.y < player.location.y - c.width / 2)) {
                drawUser(pellets[i]);
            }
        }
    }
}

// Show's the player's mass in the bottom left corner of the canvas
function drawScore() {
    ctx.beginPath();
    ctx.fillStyle = 'gray';
    ctx.font = '22px Arial';
    ctx.fillText('Size: ' + player.size, 20, c.height - 25);
}

var pButtonLoc = {x: 540, y: 540};
//Draws the pause button
function drawPauseSymbol() {
    ctx.beginPath();
    ctx.moveTo(pButtonLoc.x - 30, pButtonLoc.y - 40);
    ctx.lineTo(pButtonLoc.x + 30, pButtonLoc.y - 40);
    ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y - 40,
        pButtonLoc.x + 40, pButtonLoc.y - 30);
    ctx.lineTo(pButtonLoc.x + 40, pButtonLoc.y + 30);
    ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y + 40,
        pButtonLoc.x + 30, pButtonLoc.y + 40);
    ctx.lineTo(pButtonLoc.x - 30, pButtonLoc.y + 40);
    ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y + 40,
        pButtonLoc.x - 40, pButtonLoc.y + 30);
    ctx.lineTo(pButtonLoc.x - 40, pButtonLoc.y - 30);
    ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y - 40,
        pButtonLoc.x - 30, pButtonLoc.y - 40);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.fillStyle = 'silver';
    ctx.fillRect(pButtonLoc.x - 27, pButtonLoc.y - 30, 20, 60);
    ctx.fillRect(pButtonLoc.x + 7, pButtonLoc.y - 30, 20, 60);
    ctx.rect(pButtonLoc.x - 27, pButtonLoc.y - 30, 20, 60);
    ctx.rect(pButtonLoc.x + 7, pButtonLoc.y - 30, 20, 60);
    ctx.stroke();
}

function drawPlaySymbol() {
    ctx.beginPath();
    ctx.moveTo(pButtonLoc.x - 30, pButtonLoc.y - 40);
    ctx.lineTo(pButtonLoc.x + 30, pButtonLoc.y - 40);
    ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y - 40,
        pButtonLoc.x + 40, pButtonLoc.y - 30);
    ctx.lineTo(pButtonLoc.x + 40, pButtonLoc.y + 30);
    ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y + 40,
        pButtonLoc.x + 30, pButtonLoc.y + 40);
    ctx.lineTo(pButtonLoc.x - 30, pButtonLoc.y + 40);
    ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y + 40,
        pButtonLoc.x - 40, pButtonLoc.y + 30);
    ctx.lineTo(pButtonLoc.x - 40, pButtonLoc.y - 30);
    ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y - 40,
        pButtonLoc.x - 30, pButtonLoc.y - 40);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.fillStyle = 'silver';
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(pButtonLoc.x - 25, pButtonLoc.y - 28);
    ctx.lineTo(pButtonLoc.x + 25, pButtonLoc.y);
    ctx.lineTo(pButtonLoc.x - 25, pButtonLoc.y + 28);
    ctx.lineTo(pButtonLoc.x - 25, pButtonLoc.y - 28);
    ctx.fill();
    ctx.stroke();
}

// Checks if the player is dead
function isUserDead(user) {
    if (user.size < 1) {
        return true;
    } else {
        return false;
    }
}

// Attempts to increase the player's speed.
// Only increases if they have 10 more mass than the cost
function increaseSpeed() {
    if (player.size > 10 + speedIncCost) {
        player.speedMult *= 1.05;
        player.size -= Math.floor(speedIncCost);
        speedIncCost *= 1.1
        document.getElementById('speedIncreaseCost').innerHTML =
            Math.ceil(speedIncCost);
        setSpeed(player);
    } else {
        addNotification(
            'You need to have at least 10 mass left after the purchase!',
            targetFPS * 5, 20, 25);
    }
}

// Setter for player.style
function setPlayerStyle(style) {
    player.style = style;
}

// Setter for player.color
function setColor(color) {
    player.color = color;
}

// adds a notification to the notification array
function addNotification(message, ticks, x, y) {
    notification = {message: message, ticks: ticks, location: {x: x, y: y}};
    notifications.push(notification);
}

// Displays a notification
function notify() {
    ctx.beginPath();
    for (i in notifications) {
        ctx.fillStyle = 'gray';
        ctx.font = '15px Arial';
        ctx.fillText(notifications[i].message,
            notifications[i].location.x, notifications[i].location.y);
        notifications[i].ticks--;
        if (notifications[i].ticks == 0) {
            notifications.splice(i, 1);
        }
    }
}

// Listens for keypresses
document.addEventListener('keydown', function(event) {
    // p
    if (event.keyCode == 80) {
        if (paused) {
            paused = false;
        } else {
            paused = true;
        }
    }
    // i
    if (event.keyCode == 73) {
        increaseSpeed();
    }
    // 1
    if (event.keyCode == 49) {
        setPlayerStyle('circle');
    }
    // 2
    if (event.keyCode == 50) {
        setPlayerStyle('square');
    }
});

// Finds what direction an AI should go
function findTarget(AI) {
    var greatest = 0.0;
    var greatestX = 1;
    var greatestY = 1;
    for (i in pellets) {
        if (1 / Math.sqrt(pellets[i].location.x *
            pellets[i].location.x + pellets[i].location.y *
            pellets[i].location.y) > greatest /
            Math.sqrt(greatestX * greatestX + greatestY * greatestY)) {
            greatest = 1;
            greatestX = pellets[i].location.x;
            greatestY = pellets[i].location.y;
        }
    }
    for (i in AIs) {
        if (AIs[i].size / Math.sqrt(AIs[i].location.x * AIs[i].location.x +
            AIs[i].location.y * AIs[i].location.y) >
            greatest /
            Math.sqrt(greatestX * greatestX + greatestY * greatestY)) {
            if (AIs[i].size < AI.size / 1.41) {
                greatest = AIs[i].size;
                greatestX = AIs[i].location.x;
                greatestY = AIs[i].location.y;
            } else if (AIs[i].size > AI.size * 1.41) {
                greatest = AIs[i].size;
                greatestX = 2 * AI.location.x - AIs[i].location.x;
                greatestY = 2 * AI.location.y - AIs[i].location.y;
            }
        }
    }
    if (player.size / Math.sqrt(
        player.location.x * player.location.x +
        player.location.y * player.location.y) >
        greatest / Math.sqrt(greatestX * greatestX + greatestY * greatestY)) {
        if (player.size < AI.size / 1.41) {
            greatest = player.size;
            greatestX = player.location.x;
            greatestY = player.location.y;
        } else if (player.size > AI.size * 1.41) {
            greatest = player.size;
            greatestX = 2 * AI.location.x - player.location.x;
            greatestY = 2 * AI.location.y - player.location.y;
        }
    }
    AI.target.x = greatestX;
    AI.target.y = greatestY;
}

// Spawns an AI
function spawnAI() {
    var pX = Math.floor((Math.random()) * size.width);
    var pY = Math.floor((Math.random()) * size.height);
    var AI = {
        location: {x: pX, y: pY},
        size: 10,
        type: 'AI',
        color: randRGB(),
        style: 'circle',
        speed: 50,
        target: {x: 0, y: 0},
        speedMult: 1
    };
    AIs.push(AI);
}

var maxAIs = 20;
// Spawns starting AIs
function spawnAIs() {
    for (i = 0; i < maxAIs; i++) {
        spawnAI();
    }
}

// Draws AIs
function drawAIs() {
    for (i in AIs) {
        drawUser(AIs[i]);
        setSpeed(AIs[i]);
    }
}

function spawnNewAIs() {
    if (AIs.length < maxAIs) {
        spawnAI();
    }
}

function findAllTargets() {
    for (i in AIs) {
        findTarget(AIs[i]);
    }
}

var targetNum = 0;
function findTargets() {
    if (AIs.length > 0) {
        findTarget(AIs[targetNum]);
        if (targetNum < AIs.length - 1) {
            targetNum++;
        } else {
            targetNum = 0;
        }
    }
}

function setSizeMult() {
    if (player.size < 100) {
        sizeMult = 1;
    } else {
        sizeMult = 1 / Math.sqrt(player.size / 100);
    }
}

var pelletSpawn = 2;
function setPelletsPerSecond(a) {
    pelletSpawn = Math.floor(60/a);
    document.getElementById('pelletsPerSecond').innerHTML = a;
}

function setMaxPellets(a) {
    maxPellets = Math.floor(a);
    document.getElementById('maxPellets').innerHTML = a;
}

function setTotalAIs(a) {
    maxAIs = Math.floor(a);
    document.getElementById('totalAIs').innerHTML = a;
}

function setTargetFPS(a) {
    targetFPS = a;
    document.getElementById('fps').innerHTML = a;
}

var mouse;
function getCursorPosition(event) {
    var rect = c.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    mouse = {x: x, y: y};
}

function checkClickLoc(event) {
    getCursorPosition(event);
    if (mouse.x >= 500 &&
        mouse.x <= 580 &&
        mouse.y >= 500 &&
        mouse.y <= 580) {
        if (paused == false) {
            paused = true;
        } else {
            paused = false;
        }
    }
}

// The function calls that happen every frame
function gameLoop() {
        if (!isUserDead(player)) {
        drawBackground();
        if (!paused) {
            currentFPS = targetFPS;
            setSizeMult();
            movePlayer();
            makePellets();
            moveAIs();
            findTargets();
            spawnNewAIs();
        }
        drawPellets();
        drawAIs();
        drawUser(player);
        notify();
        drawScore();
        if (paused) {
            currentFPS = 5;
            drawPlaySymbol();
        } else {
            drawPauseSymbol();
        }
    }
}

var supportsPerformance = ('performance' in window) && ('now' in window.performance);
function now() {
    return (supportsPerformance ? performance.now() : Date.now());
}

function intervalFunctionCalls() {
    var start = now();
    gameLoop();
    var offset = now() - start;
    setTimeout(function() {intervalFunctionCalls();}, (1000 / currentFPS) - offset);
    if (offset > 12) {
        console.log('not hitting fps');
    }
}

setSpeed(player);
makeGamePellets();
spawnAIs();
findAllTargets();
intervalFunctionCalls();

