var spawnrate = 5;
var numberOfAIs = 15;
var alive = true;
var fps = 60;
var MouseX = 0;
var MouseY = 0;
var pCount = 0;
var paused = true;
var speedIncCost = 10;
var speedMult = 1.00;
var size = {height: 4000, width: 4000};
var pellets = [];
var notifications = [];
var c = document.getElementById("mycanvas");
var ctx = c.getContext("2d");
var player = {size:10, color:"red", speed:450, location:{x: size.width/2, y: size.height/2}, type: "player", style:"circle"};
function drawBackground() {
	ctx.beginPath();
	ctx.fillStyle = "#EAEAEA";
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.closePath();
}

// Sets the speed of given user
function setSpeed(user) {
	user.speed = Math.pow(Math.sqrt(player.size+190),-1)*4000*speedMult;
}

// Draws given user on the canvas
function drawUser(user) {
	ctx.beginPath();
	ctx.fillStyle = user.color;
	if (user.style == "circle") {
		radius = Math.sqrt(user.size/Math.PI) * 10;
		ctx.moveTo(user.location.x-player.location.x+c.width/2, user.location.y-player.location.y+c.height/2);
		ctx.arc(user.location.x-player.location.x+c.width/2, user.location.y-player.location.y+c.height/2, radius, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
	} else if (user.style == "square") {
		radius = Math.sqrt(user.size) * 10/2;
		ctx.moveTo(user.location.x-player.location.x+c.width/2-radius, user.location.y-player.location.y+c.height/2-radius);
		ctx.rect(user.location.x-player.location.x+c.width/2-radius, user.location.y-player.location.y+c.height/2-radius, radius*2,radius*2);
		ctx.fill();
		ctx.closePath();
	}
	if (user.type == "player") {
		for (i in pellets) {
			if (pellets[i].location.x < user.location.x + radius && pellets[i].location.x > user.location.x - radius) {
				if (pellets[i].location.y < user.location.y + radius && pellets[i].location.y > user.location.y - radius) {
					if (user.style == "square") {
						user.size += pellets[i].size;
						pellets.splice(i, 1);
						setSpeed(user);
					} else if (user.style == "circle") {
						if (Math.sqrt((pellets[i].location.y-user.location.y)*(pellets[i].location.y-user.location.y)+(pellets[i].location.x-user.location.x)*(pellets[i].location.x-user.location.x))<radius) {
							user.size += pellets[i].size;
							pellets.splice(i, 1);
							setSpeed(user);
						}
					}
				}
			}
		}
	}
}

// Moves the player based on the mouse coords
function moveUser() {
	// Calculates the distance between the player and mouse
	var distX = Math.abs(c.width/2 - MouseX);
	var distY = Math.abs(c.height/2 - MouseY);
	var dX = distX;
	var dY = distY;
	distX /= Math.sqrt((dX * dX) + (dY * dY));
	distY /= Math.sqrt((dX * dX) + (dY * dY));
	radius = Math.sqrt(player.size/Math.PI) * 10;
	// Gets slower as the mouse gets closer
	if (MouseX > c.width/2 - 120 && MouseX < c.width/2 + 120) {
		distX /= 120/ Math.abs(MouseX - c.width/2);
	}
	if (MouseY > c.height/2 - 120 && MouseY < c.height/2 + 120) {
		distY /= 120/ Math.abs(MouseY - c.height/2);
	}
	// Stops moving if mouse is within 10px of the center of the player
	// Moves player towards mouse
	if(!(MouseX > c.width/2 - 10 && MouseX < c.width/2 + 10 && MouseY > c.height/2 && MouseY < c.height/2 + 20)) {
		if (player.location.x > 0 && MouseX < c.width/2) {
			player.location.x -= player.speed/fps * distX;
		} else if (player.location.x < size.height && MouseX > c.width/2) {
			player.location.x += player.speed/fps * distX;
		}
		if (player.location.y > 0 && MouseY < c.width/2) {
			player.location.y -= player.speed/fps * distY;
		} else if (player.location.y < size.width && MouseY > c.width/2) {
			player.location.y += player.speed/fps * distY;
		}
	}
}

// Uses JQuery and html to find mouse coords
function setMousePosition(e) {
	MouseX = e.clientX - ($(window).width()/2 - c.width/2)+160;
	MouseY = e.clientY;
}

// Makes a random pellet on the screen
function makePellet() {
	var pX = Math.floor((Math.random()) * size.width);
	var pY = Math.floor((Math.random()) * size.height);
	var pellet = {location:{x: pX, y: pY}, size:1, type: "pellet", color:randRGB(), style: "circle"};
	pellets.push(pellet);
}

// Creates a random color for the pellets
function randRGB() {
	var r = Math.floor(Math.random()*255);
	var g = Math.floor(Math.random()*255);
	var b = Math.floor(Math.random()*255);
	return "rgb("+r+","+g+","+b+")";
}

// Makes 500 pellets at the start of the game
function makeGamePellets() {
	for (i = 0; i < 500; i++) {
		makePellet();
	}
}

var maxPellets = 2000;
// Makes a pellet every frame, maxing out at 2000
function makePellets() {
	if (pellets.length < maxPellets) {
		if (pCount == Math.floor(0)){
			pCount = 0;
			makePellet();
		} else {
			pCount++;
		}
	}
}

// Draws all the pellets around the player
function drawPellets() {
	for(i in pellets) {
		if (!(pellets[i].location.x > player.location.x + c.height/2 && pellets[i].location.x < player.location.x - c.height/2)) {
			if (!(pellets[i].location.y > player.location.y + c.width/2 && pellets[i].location.y < player.location.y - c.width/2)) {
				drawUser(pellets[i]);
			}
		}
	}
}

// Show's the player's mass in the bottom left corner of the canvas
function drawScore() {
	ctx.beginPath();
	ctx.fillStyle = "gray";
	ctx.font = "22px Arial";
	ctx.fillText("Size: " + player.size, 20, c.height - 25);
}

var pButtonLoc = {x: 540, y: 540};
//Draws the pause button
function drawPauseSymbol() {
	ctx.beginPath();
	ctx.moveTo(pButtonLoc.x - 30, pButtonLoc.y - 40);
	ctx.lineTo(pButtonLoc.x + 30, pButtonLoc.y - 40);
	ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y - 40, pButtonLoc.x + 40, pButtonLoc.y - 30);
	ctx.lineTo(pButtonLoc.x + 40, pButtonLoc.y + 30);
	ctx.quadraticCurveTo(pButtonLoc.x + 40, pButtonLoc.y + 40, pButtonLoc.x + 30, pButtonLoc.y + 40);
	ctx.lineTo(pButtonLoc.x - 30, pButtonLoc.y + 40);
	ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y + 40, pButtonLoc.x - 40, pButtonLoc.y + 30);
	ctx.lineTo(pButtonLoc.x - 40, pButtonLoc.y - 30);
	ctx.quadraticCurveTo(pButtonLoc.x - 40, pButtonLoc.y - 40, pButtonLoc.x - 30, pButtonLoc.y - 40);
	ctx.fillStyle = "gold";
	ctx.fill();
	ctx.fillStyle = "silver";
	ctx.fillRect(pButtonLoc.x - 27, pButtonLoc.y - 30, 20, 60);
	ctx.fillRect(pButtonLoc.x + 7, pButtonLoc.y - 30, 20, 60);
	ctx.rect(pButtonLoc.x - 27, pButtonLoc.y - 30, 20, 60);
	ctx.rect(pButtonLoc.x + 7, pButtonLoc.y - 30, 20, 60);
	ctx.stroke();
}

// The function calls that happen every frame
function intervalFunctionCalls() {
	if (!isUserDead(player)) {
		drawBackground();
		if(!paused) {
			moveUser();
			makePellets();
		}
		drawUser(player);
		drawPellets();
		notify();
		drawScore();
		if (paused) {
			drawPauseSymbol();
		}
	}
}

// Checks if the player is dead
function isUserDead(user) {
	if (user.size < 1) {
		return true;
	} else {
		return false;
	}
}

// Attempts to increase the player's speed. Only increases if they have 10 more mass than the cost
function increaseSpeed() {
	if (player.size > 10 + speedIncCost) {
		speedMult += 0.05;
		player.size -= Math.floor(speedIncCost);
		speedIncCost *= 1.2;
		document.getElementById('speedIncreaseCost').innerHTML = Math.ceil(speedIncCost);
		setSpeed(player);
	} else {
		addNotification("You need to have at least 10 mass left after the purchase!", fps*5, 20, 25);
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
	notification = {message: message, ticks: ticks, location:{x: x, y: y}};
	notifications.push(notification);
}

// Displays a notification
function notify() {
	ctx.beginPath();
	for (i in notifications) {
		ctx.fillStyle = "gray";
		ctx.font = "15px Arial";
		ctx.fillText(notifications[i].message, notifications[i].location.x, notifications[i].location.y);
		notifications[i].ticks--;
		if (notifications[i].ticks == 0) {
			notifications.splice(i, 1);
		}
	}
}

// Listens for keypresses
document.addEventListener('keydown', function(event) {
	// p
	if(event.keyCode == 80) {
		if(paused) {
			paused = false;
		} else {
			paused = true;
		}
	}
	// i
	if(event.keyCode == 73) {
		increaseSpeed();
	}
	// 1
	if(event.keyCode == 49) {
		setPlayerStyle('circle');
	}
	// 2
	if(event.keyCode == 50) {
		setPlayerStyle('square');
	}
});

setSpeed(player);
makeGamePellets();
setInterval(function() {intervalFunctionCalls();}, 1000/fps);
