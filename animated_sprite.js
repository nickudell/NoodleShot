function AnimatedSprite()
{
	this.x = 0;
	this.y = 0;
	this.frameCount = 1;
	this.frameColumns = 1;
	this.msPerFrame = 1;
	this.frame = 0;
	this.testy = Math.random();

	var msSinceLastFrame = 0;
	var that = this;

	this.setUp = function(sprite, animParams)
	{
		this.sprite = sprite;
		this.width = animParams.width;
		this.height = animParams.height;
		this.x = animParams.x;
		this.y = animParams.y;
		this.frameCount = animParams.frameCount;
		this.frameColumns = animParams.columnCount;
		this.msPerFrame = animParams.msPerFrame;
		this.frame = animParams.startingFrame;
		this.testy = Math.random();
		this.setFrame(this.frame);
	}

	this.update = function(deltaTime)
	{
		msSinceLastFrame += deltaTime;
		//Set the next frame
		while (msSinceLastFrame > this.msPerFrame)
		{
			msSinceLastFrame -= this.msPerFrame;
			this.frame++;
			//Loop frames back
			if (this.frame == this.frameCount)
			{
				this.frame = 0;
			}
		}
		//change internal sprite to point to correct frame
		this.setFrame(this.frame);
	};

	this.setThat = function()
	{
		that = this;
	};

	this.setFrame = function(frame)
	{
		//parse frame number into column and row
		var row = Math.floor(frame / this.frameColumns);
		var column = frame % this.frameColumns;
		var x = this.x + this.sprite.width * column;
		var y = this.y + this.sprite.height * row;
		this.sprite.x = x;
		this.sprite.y = y;
	};

	this.draw = function(context, x, y, width, height, opacity)
	{
		this.sprite.draw(context, x, y, width, height, opacity);
	};
}