function AssetLoader(objectFiles, imageFiles, soundFiles, finishedCallBack)
{
	this.sounds = new Object();
	this.images = new Object();
	this.prototypes = new Object();
	var totalAssets = 0;
	var assetsLoaded = 0;
	var callBack = finishedCallBack;
	var queuedFinished = false;
	var finished = false;
	var that = this;

	this.isFinished = function()
	{
		return finished;
	};

	this.totalAssets = function()
	{
		return totalAssets;
	};

	this.assetsLoaded = function()
	{
		return assetsLoaded;
	};

	function Init()
	{
		Object.keys(objectFiles).forEach(function(key)
		{
			that.prototypes[key] = [];
			objectFiles[key].forEach(function(item)
			{
				totalAssets++;
				$.getJSON(item, function(obj)
				{
					if ("spriteParams" in obj)
					{
						totalAssets++;
						var image = new Image();
						image.onload = function()
						{
							var sprite = new Sprite();
							sprite.setUp(image, obj.spriteParams);
							if ("animParams" in obj)
							{
								obj.sprite = new AnimatedSprite();
								obj.sprite.setUp(sprite, obj.animParams);
							}
							else
							{
								obj.sprite = sprite;
							}
							loaded();
						};;
						image.src = obj.spriteParams.image;
					}
					that.prototypes[key].push(obj);
					loaded();
				});
			});
		});

		Object.keys(imageFiles).forEach(function(key)
		{
			that.images[key] = [];
			imageFiles[key].forEach(function(item)
			{
				totalAssets++;
				var img = new Image();
				img.onload = loaded;
				img.src = item;
				that.images[key].push(img);
			})
		});

		queuedFinished = true;
	};

	function loaded()
	{
		assetsLoaded++;
		if (queuedFinished && assetsLoaded == totalAssets)
		{
			if (callBack)
			{
				callBack();
			}
			finished = true;
		}
	}

	Init();
}