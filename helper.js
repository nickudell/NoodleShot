function clamp(value, min, max)
{
	if (value < min)
	{
		return min;
	}
	if (value > max)
	{
		return max;
	}
	return value;
};

function collides(a, b)
{
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

// extends 'from' object with members from 'to'. If 'to' is null, a deep clone of 'from' is returned

function extend(from, to)
{
	if (from == null || typeof from != "object") return from;
	//if (from.constructor != Object && from.constructor != Array) return from;
	if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function || from.constructor == String || from.constructor == Number || from.constructor == Boolean) return new from.constructor(from);
	try
	{
		to = to || new from.constructor();

		for (var name in from)
		{
			to[name] = extend(from[name], null);
		}
		if (to.setThat)
		{
			to.setThat();
		}
	}
	catch (err)
	{
		return from;
	}

	return to;
};