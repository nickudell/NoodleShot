//Canvas properties
var CANVAS_WIDTH = 420;
var CANVAS_HEIGHT = 800;

var canvas;
var context;

//File locations
var OBJECT_LOCATION = "objects";
var ENEMY_LOCATION = OBJECT_LOCATION + "/enemies/";
var PROJECTILE_LOCATION = OBJECT_LOCATION + "/projectiles/";
var COLLECTABLE_LOCATION = OBJECT_LOCATION + "/collectables/";
var WEAPON_LOCATION = OBJECT_LOCATION + "/weapons/";
var PARTICLE_LOCATION = OBJECT_LOCATION + "/particles/";

var OBJECT_FILES = {
	weapons: [WEAPON_LOCATION + "shotgun.json"],
	enemies: [ENEMY_LOCATION + "cFodder.json"],
	projectiles: [],
	collectables: [COLLECTABLE_LOCATION + "bronzeCoin.json",
                    COLLECTABLE_LOCATION + "silverCoin.json",
                    COLLECTABLE_LOCATION + "goldCoin.json"],
	particles: [PARTICLE_LOCATION + "explosion.json"]
};

var IMAGE_LOCATION = "images/"

var IMAGE_FILES = {
	players: [IMAGE_LOCATION + "player.png"],
	explosions: [IMAGE_LOCATION + "boom.png"]
}

var assets = new AssetLoader(OBJECT_FILES, IMAGE_FILES);

//Game loop properties
var loopTimeout;
var isPlaying;
var FPS = 30;
var prevTime;

var score, cash, health;

var gameObjects; //objects contained in here must support .isActive(), .draw(), .kill() and .update(deltaTime)
//Also, object category should be in draw order

var gameLength;

var gui;

var background = new Background(0.5);

function Player()
{
	var SPRITE = {
		image: assets.images.players[0],
		x: 0,
		y: 0,
		width: 32,
		height: 32,
		centerX: 0,
		centerY: 0
	};

	this.sprite = new Sprite();
	this.sprite.setUp(SPRITE.image, SPRITE);

	this.color = "#00A";
	this.width = 32;
	this.height = 32;
	this.x = CANVAS_WIDTH / 2 - 16;
	this.y = CANVAS_HEIGHT - gui.height - 32;
	this.weapons = [new Weapon(4, 0, 500, -1, 30, 3000),
                    new Weapon(28, 0, 300, -1, 10, 3000)];

	this.active = true;
	//draw the player as a blue square
	this.draw = function()
	{
		this.sprite.draw(context, this.x, this.y);
		this.weapons.forEach(function(weapon)
		{
			weapon.draw();
		});
	};

	this.isActive = function()
	{
		return this.active;
	};

	//Fire a projectile
	this.shoot = function()
	{
		var playerX = this.x;
		var playerY = this.y;
		this.weapons.forEach(function(weapon)
		{
			weapon.shoot(playerX, playerY);
		})
	};

	this.midpoint = function()
	{
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2
		};
	};

	this.update = function(deltaTime)
	{
		var HORIZ_SPEED = 0.25;
		//handle player controls
		if (keydown.left)
		{
			this.x -= deltaTime * HORIZ_SPEED;
		}
		if (keydown.right)
		{
			this.x += deltaTime * HORIZ_SPEED;
		}
		if (keydown.space)
		{
			this.shoot();
		}

		this.x = clamp(this.x, 0, CANVAS_WIDTH - this.width);

		this.weapons.forEach(function(weapon)
		{
			weapon.update(deltaTime);
		});
		this.handleCollisions();
	};

	this.handleCollisions = function()
	{};

	this.kill = function()
	{
		this.active = false;
		GameOver();

	};
};

var player;

function Weapon(rel_x, rel_y, msPerShot, ammo, capacity, msPerReload)
{
	this.rel_x = rel_x || 0;
	this.rel_y = rel_y || 0;

	this.msPerShot = msPerShot || 0;
	var msSinceShot = 0;

	this.msPerReload = msPerReload || 0;
	var msSinceReload = 0;
	this.ammo = ammo || -1; //default to unlimited
	this.capacity = capacity || -1; //default to unlimited
	this.clip = this.capacity;
	var bullets = [];
	this.reloading = false;

	this.shoot = function(x, y)
	{
		if (!this.reloading)
		{
			if (this.ammo > 0 || this.ammo == -1)
			{
				if (msSinceShot > this.msPerShot)
				{
					msSinceShot = 0;
					gameObjects.projectiles.push(new Projectile(x + this.rel_x, y + this.rel_y, 0.5));
					if (this.ammo != -1)
					{
						this.ammo--;
					}
					if (this.capacity != -1)
					{
						this.clip--;
						if (this.clip == 0)
						{
							this.reload();
						}
					}
				}
			}
		}
		else
		{}
	};
	this.reload = function()
	{
		msSinceReload = 0;
		this.reloading = true;
		this.clip = this.capacity;
	};

	this.update = function(deltaTime)
	{
		msSinceShot += deltaTime;
		msSinceReload += deltaTime;

		if (msSinceReload > this.msPerReload)
		{
			this.reloading = false;
		}

		handleCollisions();
	};

	this.draw = function()
	{};

	var handleCollisions = function()
	{};
}

function Projectile(x, y, speed)
{
	var active = true;

	this.x = x;
	this.y = y;

	this.xVelocity = 0;
	this.yVelocity = -speed;
	this.width = 3;
	this.height = 3;
	this.colour = "#FFFF00";

	var that = this;

	//check whether this projectile is in bounds
	var inBounds = function()
	{
		return that.x >= 0 && that.x <= CANVAS_WIDTH && that.y >= 0 && that.y <= CANVAS_HEIGHT;
	};

	//draw this instance
	this.draw = function()
	{
		context.fillStyle = this.colour;
		context.fillRect(this.x, this.y, this.width, this.height);
	};

	//update this instance
	this.update = function(deltaTime)
	{
		this.x += this.xVelocity * deltaTime;
		this.y += this.yVelocity * deltaTime;
		active = active && inBounds();
		handleCollisions();
	};

	var handleCollisions = function()
	{
		var bullet = that;
		gameObjects.enemies.forEach(function(enemy)
		{
			if (enemy.collideable && collides(bullet, enemy))
			{
				console.log("boom!");
				enemy.kill();
				bullet.kill();
				score += 5;
				gameObjects.effects.push(Explosion(assets.prototypes.particles[0], enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
			}
		});
	};

	this.isActive = function()
	{
		return active;
	}

	this.kill = function()
	{
		active = false;
	};
}

function Coin(storedData, x, y)
{
	//clone the file data
	var coin = extend(storedData);
	coin.sprite.test = Math.random();
	coin.x = x || 0;
	coin.y = y || 0;

	var adornedData = new(function() //slight misnomer - we actuaklly add the stored data TO this
	{
		var that;
		var active = true;

		this.postMerge = function()
		{
			that = this;
		};

		var inBounds = function()
		{
			return that.x >= -that.width && that.x <= CANVAS_WIDTH && that.y >= 0 && that.y <= CANVAS_HEIGHT;
		};

		this.isActive = function()
		{
			return active;
		};

		this.kill = function()
		{
			active = false;
		};

		this.update = function(deltaTime)
		{
			that.x += that.xVelocity * deltaTime;
			that.y += that.yVelocity * deltaTime;
			that.sprite.update(deltaTime);
			handleCollisions();
			active = active && inBounds();
		};

		this.draw = function()
		{
			that.sprite.draw(context, that.x, that.y);
		};

		var handleCollisions = function()
		{
			if (collides(that, player))
			{
				cash += that.value;
				score += that.value * 5;
				that.kill();
			}
		};

	})();

	coin = extend(coin, adornedData);
	coin.postMerge();
	return coin;
};

function Enemy(storedData, x, y)
{
	//clone the stored data
	var enemy = extend(storedData);

	var adornedData = new(function() //slight misnomer, we put the enemy data INTO the adorned data
	{
		var active = true;

		this.collideable = true;

		var deathMs = 0;
		var dieTime = 500;

		var dying = false;

		var that = this;

		this.setThat = function()
		{
			that = this;
		};

		var inBounds = function()
		{
			return that.x >= -that.width && that.x <= CANVAS_WIDTH && that.y <= CANVAS_HEIGHT;
		};

		this.draw = function()
		{
			context.save();
			if (dying)
			{
				context.globalAlpha = (dieTime - deathMs) / dieTime;
			}
			that.sprite.draw(context, that.x, that.y);
			context.restore();
		};

		this.update = function(deltaTime)
		{

			if (dying)
			{

				deathMs += deltaTime;
				if (deathMs > dieTime)
				{
					active = false;
				}
			}

			that.x += that.xVelocity * deltaTime;
			that.y += that.yVelocity * deltaTime;

			active = active && inBounds();

			that.sprite.update(deltaTime);

			handleCollisions();

		};

		var handleCollisions = function()
		{
			if (that.collideable && collides(that, player))
			{
				gameObjects.effects.push(Explosion(assets.prototypes.particles[0], that.x + that.width / 2, that.y + that.height / 2));
				that.kill();
				health -= 15;
				if (health <= 0)
				{
					player.kill();
				}
			}
		};

		this.isActive = function()
		{
			return active;
		}

		this.kill = function()
		{
			that.collideable = false;
			var rand = Math.random();
			if (rand > 0.975)
			{
				gameObjects.coins.push(Coin(assets.prototypes.collectables[2], that.x, that.y));
				console.log("Go GOLD coin!");
			}
			else if (rand > 0.90)
			{
				gameObjects.coins.push(Coin(assets.prototypes.collectables[1], that.x, that.y));
				console.log("Go SILVER coin!");
			}
			else if (rand > 0.75)
			{
				gameObjects.coins.push(Coin(assets.prototypes.collectables[0], that.x, that.y));
				console.log("Go BRONZE coin!");
			}
			dying = true;
		};
	});

	enemy = extend(enemy, adornedData);
	enemy.x = x || enemy.x;
	enemy.y = y || enemy.y;
	return enemy;

}

function Explosion(storedData, x, y)
{
	//clone the stored data
	var explosion = extend(storedData);

	var adornedData = new(function() //slight misnomer, we put the enemy data INTO the adorned data
	{
		var life = 500;
		var active = true;

		var that = this;

		this.setThat = function()
		{
			that = this;
		};

		this.update = function(deltaTime)
		{
			life -= deltaTime;
			if (life <= 0)
			{
				active = false;
			}
			that.sprite.update(deltaTime);
		};

		this.draw = function()
		{
			that.sprite.draw(context, that.x - that.width / 2, that.y - that.height / 2, that.width, that.height);
		};

		this.kill = function()
		{
			active = false;
		};

		this.isActive = function()
		{
			return active;
		};
	})();

	explosion = extend(explosion, adornedData);
	explosion.x = x || explosion.x;
	explosion.y = y || explosion.y;
	return explosion;
}

//Initialize variables and start the game
var Init = function()
{
	console.log("Initialization entered.")
	//Get the canvas
	var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
		"' height='" + CANVAS_HEIGHT + "'></canvas");
	context = canvasElement.get(0).getContext("2d");
	canvasElement.appendTo('body');
	gui = new GUI();
	awaitAssets();
	console.log("Initialization exited.")
};

var SetVariables = function() //call this function on a reset
{
	var MAX_HEALTH = 100;
	console.log("Restarting.");
	isPlaying = true;
	prevTime = Date.now();

	score = 0;
	cash = 0;
	health = MAX_HEALTH;

	gameObjects = {
		projectiles: [],
		enemies: [],
		coins: [],
		effects: [],
		miscellaneous: []
	};

	gameLength = 0;
	Tick();
}

function awaitAssets()
{
	var BAR_WIDTH = 200;
	var BAR_HEIGHT = 32;
	var BAR_COLOUR = '5FF';
	var barX = CANVAS_WIDTH / 2 - BAR_WIDTH / 2;
	var barY = CANVAS_HEIGHT / 2 - BAR_HEIGHT / 2;
	var tick = 0;
	if (assets.isFinished())
	{
		//Start game loop
		player = new Player();
		SetVariables();
	}
	else
	{
		Clear('000');
		context.fillStyle = BAR_COLOUR;
		context.fillRect(barX, barY, BAR_WIDTH * (assets.assetsLoaded() / assets.totalAssets()), BAR_HEIGHT);
		var loadText = "LOADING";
		for (var i = 0; i < tick; i += FPS)
		{
			loadText += ".";
		}
		context.save();
		context.textAlign = "center";
		context.font = "18pt Helvetica";
		context.fillText(loadText, CANVAS_WIDTH / 2, barY - 24);
		context.restore();
		tick = (tick + 1) % (3 * FPS);
		loopTimeout = setTimeout(awaitAssets, 1000 / FPS);
	}
};

function GUI()
{
	this.height = 50;
	var backGradient, healthGradient, shieldGradient;

	backGradient = context.createLinearGradient(0, 0, 0, 100);
	backGradient.addColorStop(0, "white");
	backGradient.addColorStop(1, "lightgrey");

	healthGradient = context.createLinearGradient(0, 0, CANVAS_WIDTH - 20, 0);
	healthGradient.addColorStop(0, "red");
	healthGradient.addColorStop(0.5, "yellow");
	healthGradient.addColorStop(0.75, "green");

	shieldGradient = context.createLinearGradient(0, 0, CANVAS_WIDTH - 20, 0);
	shieldGradient.addColorStop(0.3, "blue");
	shieldGradient.addColorStop(0.5, "white");
	shieldGradient.addColorStop(0.7, "blue");

	this.draw = function()
	{
		//draw GUI
		//background
		context.fillStyle = backGradient;
		context.fillRect(0, CANVAS_HEIGHT - this.height, CANVAS_WIDTH, this.height);

		//health bar
		context.fillStyle = healthGradient;
		context.fillRect(10, CANVAS_HEIGHT - this.height + 15, (CANVAS_WIDTH - 20) * Math.max(health / 100, 0), 10);

		//shield bar
		context.fillStyle = shieldGradient;
		context.fillRect(10, CANVAS_HEIGHT - this.height + 3, (CANVAS_WIDTH - 20) * Math.max(100 / 100, 0), 10);

		//stats
		context.fillStyle = "black";
		context.fillText("Money: " + cash + " points.", 10, CANVAS_HEIGHT - 5);
		context.fillText("Score: " + score + " points.", 160, CANVAS_HEIGHT - 5);
	};

};

function Background(parallaxSpeed)
{
	var stars = [];
	var NUM_STARS = 500;
	var parallaxSpeed = parallaxSpeed || 0.5;

	this.draw = function()
	{
		stars.forEach(function(star)
		{
			star.draw();
		});
	};

	function init()
	{
		for (var i = 0; i < NUM_STARS; i++)
		{
			stars.push(new Star(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT));
		}
	};

	init();

	this.update = function(deltaTime)
	{
		var parallaxTime = deltaTime * parallaxSpeed;
		stars.forEach(function(star)
		{
			star.update(parallaxTime);
		});
		stars = stars.filter(function(star)
		{
			return star.isAlive();
		});
		for (var i = 0; i < NUM_STARS - stars.length; i++)
		{
			stars.push(new Star(Math.random() * CANVAS_WIDTH, 0));
		}
	};
};

function Star(x, y)
{
	this.x = x || 0;
	this.y = y || 0;
	this.radius = Math.random() * 1.25;
	//var colours = [

	//];
	//this.colour = colours[Math.floor(Math.random() * colours.length)];
	this.colour = 'rgba(' + Math.floor(Math.random() * 55) + 100 + ',' + Math.floor(Math.random() * 55) + 100 + ',' + Math.floor(Math.random() * 55) + 100 + ',' + Math.floor(Math.random() * 55) + 200 + ')';
	this.yVelocity = Math.random() * 0.02;
	var alive = true;
	var that = this;

	this.isAlive = function()
	{
		return alive;
	}

	var inBounds = function()
	{
		return that.x >= -that.radius && that.x <= CANVAS_WIDTH && that.y <= CANVAS_HEIGHT;
	};

	this.draw = function()
	{
		context.fillStyle = this.colour;
		context.beginPath();
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	};
	this.update = function(deltaTime)
	{
		this.y += this.yVelocity * deltaTime;
		alive = alive && inBounds();
	};

};

//The game loop
var Tick = function()
{
	//Update time difference
	var now = Date.now();
	var deltaTime = now - prevTime;
	prevTime = now;

	Clear('000000');
	Update(deltaTime);
	Draw()

	if (isPlaying)
	{
		loopTimeout = setTimeout(Tick, 1000 / FPS);
	}
	else
	{
		console.log('Exiting normally.');
	}
};

var GameOver = function()
{
	isPlaying = false;
	clearTimeout(loopTimeout);

	loopTimeout = setTimeout(function()
	{
		Clear('000000');
		context.fillStyle = "White";
		context.textAlign = "center";
		context.font = "18pt Helvetica";
		context.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
		context.fillText("YOUR SCORE: " + score + " POINTS.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.font = "14pt Helvetica";
		context.fillText("Press ENTER to restart.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
		if (keydown.enter)
		{
			clearTimeout(loopTimeout);
			SetVariables();
		}
	}, 1000 / FPS);
};

//Clear the screen
var Clear = function(colour)
{
	//Set active colour to specified parameter
	context.fillStyle = colour;
	//start drawing
	context.beginPath();
	//draw rectangle from point (0,0) to (width, height)
	context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	//end drawing
	context.closePath();
	//Fill the rectangle with the active colour
	context.fill();
};

var Update = function(deltaTime)
{
	player.update(deltaTime);

	background.update(deltaTime);
	//update all game objects and filter them
	Object.keys(gameObjects).forEach(function(arr)
	{
		gameObjects[arr].forEach(function(gameObject)
		{
			gameObject.update(deltaTime);
		});
		gameObjects[arr] = gameObjects[arr].filter(function(gameObject)
		{
			return gameObject.isActive();
		});
	});
	//generate new enemies
	if (Math.random() < 0.01 * gameLength / 10000)
	{
		gameObjects.enemies.push(Enemy(assets.prototypes.enemies[0],
		Math.random() * (CANVAS_WIDTH - assets.prototypes.enemies[0].width)));
	}
	gameLength += deltaTime;
}

var Draw = function()
{
	background.draw();

	player.draw();

	Object.keys(gameObjects).forEach(function(arr)
	{
		gameObjects[arr].forEach(function(gameObject)
		{
			gameObject.draw();
		});
	});

	gui.draw();

};

function Shop()
{
	var WEAPONS = "objects/weapons/";
	var files = {
		weapons: ["shotgun.json"],
		ammo: [],
		repairs: []
	};
	this.purchases = {
		weapons: [],
		ammo: [],
		repairs: []
	};

	function init()
	{
		//load purchase info
		//weapons
		console.log(WEAPONS + "shotgun.json");
		$.getJSON(WEAPONS + "shotgun.json", function(obj)
		{
			console.log(obj.name);
			var obj2 = extend(obj);
			obj2.name = "Seymour";
			console.log(obj.name);
			console.log(obj2.name);
		});
	};
	init();
}

Init();
var shop = new Shop();