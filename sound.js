function Sound()
{
	this.context;
	this.master;

	this.init = function()
	{
		try
		{
			context = new AudioContext();

			this.master = new Channel();
			this.master.addNode(context.createGainNode());
			this.master.connect(context.destination);
		}
		catch (e)
		{
			console.log("ERROR: Cannot initialize sound API.");
			console.log(e.message);
		}

	}();

	this.load = function(url, callBack)
	{
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function()
		{
			context.decodeAudioData(request.response, callBack, onError);
		}
		request.send();
	};

	this.play = function(buffer)
	{
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(this.master);
		source.noteOn(0);
	};

	this.setMasterVolume = function(volume)
	{
		this.master.
	}

}

function Channel()
{
	this.nodes = [];
	this.nodeCount = 0;
	this.entrance;
	this.addNode = function(node, position)
	{
		this.nodes.splice(position, 0, node);
		this.nodeCount++;
		this.entrance = nodes[0];
		reconnectNodes();
	};

	function reconnectNodes()
	{
		//reconnect nodes
		for (var i = 0; i < nodeCount - 1; i++)
		{
			nodes[i].connect(nodes[i + 1]);
		}
	};
	this.removeNode = function(position)
	{
		this.nodes.splice(position, 1);
		this.nodeCount--;
		if (this.nodeCount > 0)
		{
			this.entrance = nodes[0];
		}
		reconnectNodes();
	};
	this.connect = function(destination)
	{
		if (nodeCount > 0)
		{
			nodes[nodeCount - 1].connect(destination);
		}
	};
}