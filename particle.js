function Particle(prototype, x, y)
{

	//clone the stored data
	var particle = extend(storedData);

	var adornedData = new(function() //slight misnomer, we put the enemy data INTO the adorned data
	{
		var active = true;
		var opacity = 1;
		var totalLife = this.life || 0;

		var that = this;

		this.setThat = function()
		{
			that = this;
		}

		this.draw = function(x, y)
		{
			this.sprite.draw(x, y, this.width, this.height);
		};

		this.update = function(deltaTime)
		{
			that.sprite.update(deltaTime);

			that.x += that.xVelocity * deltaTime;
			that.y += that.yVelocity * deltaTime;

			that.life -= deltaTime;
			if (that.fadeOut)
			{
				opacity = that.life / totalLife;
			}
			active = active && inBounds();
			if (that.life <= 0)
			{
				active = false;
			}
		};

		var inBounds = function()
		{
			return that.x >= -that.width && that.x <= CANVAS_WIDTH && that.y <= CANVAS_HEIGHT;
		};

		this.isActive = function()
		{
			return active;
		};

		this.kill = function()
		{
			active = false;
		};
	})();

	particle = extend(particle, adornedData);
	particle.x = x || particle.x;
	particle.y = y || particle.y;
	return particle;
}