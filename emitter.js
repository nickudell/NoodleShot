function Emitter(sprite, x, y, xVelocity, yVelocity, particleLife, msPerEmit, pVelX, pVelY, manualEmit)
{
	this.sprite = sprite;
	this.x = x || 0;
	this.y = y || 0;
	this.xVelocity = xVelocity || 0;
	this.yVelocity = yVelocity || 0;
	this.msPerEmit = msPerEmit || 0;
	this.particleLife = particleLife || 0;
	this.manualEmitter = manualEmit || false;
	this.particleVelocityX = pVelX || 0;
	this.particleVelocityY = pVelY || 0;
	var msSinceEmit = 0;
	var particles = [];

	this.emit = function(particleVelocityX, particleVelocityY)
	{
		if (msSinceEmit > this.msPerEmit)
		{
			particles.push(new Particle(this.sprite, this.x, this.y, particleVelocityX, particleVelocityY, this.particleLife));
			msSinceEmit -= this.msPerEmit;
		}
	};

	this.update = function(deltaTime)
	{
		this.x += this.xVelocity * deltaTime;
		this.y += this.yVelocity * deltaTime;

		msSinceEmit += deltaTime;

		if (!this.manualEmitter)
		{
			this.emit(this.pVelX, this.pVelY);
		}

		particles.forEach(function(particle)
		{
			particle.update(deltaTime);
		});

		particles.filter(function(particle)
		{
			return particle.active;
		});
	};

	this.draw = function()
	{
		particles.forEach(function(particle)
		{
			particle.draw();
		});
	};
}