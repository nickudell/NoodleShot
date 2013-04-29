function Sprite()
{
  this.x = 0; //the position on the image that this sprite begins
  this.y = 0; //the position on the image that this sprite begins
  this.centerX = 0;
  this.centerY = 0;
  this.test = Math.random();

  var that = this;

  this.setUp = function(image, spriteParams)
  {
    this.width = spriteParams.width; //the width of the subset of the image to use for our sprite
    this.height = spriteParams.height; //the height of the subset of the image to use for our sprite
    this.x = spriteParams.x || 0; //the position on the image that this sprite begins
    this.y = spriteParams.y || 0; //the position on the image that this sprite begins
    this.centerX = spriteParams.centerx || this.x + this.width / 2;
    this.centerY = spriteParams.centery || this.y + this.height / 2;
    this.test = Math.random();
    this.image = image;
  }

  this.draw = function(context, x, y, width, height, opacity)
  {
    var x = x - this.centerX || 0;
    var y = y - this.centerY || 0;
    var width = width || this.width;
    var height = height || this.height;
    //context.save();
    //context.globalAlpha = opacity;
    context.drawImage(this.image,
    this.x,
    this.y,
    this.width,
    this.height,
    x + width / 2,
    y + height / 2,
    width,
    height);
    //context.restore();
  };

  this.update = function(deltaTime)
  {
    //do nothing, exists for compatibility with animated_sprite.
  }
}