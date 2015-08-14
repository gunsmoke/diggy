AuidoLoader = Class.extend({
	_buffer: null,
	resources: null,
	init: function(){
		this.resources = {};
		this._buffer = new Array();
	},
	add: function(name, path){
		this._buffer.push({'name': name, 'path': path});
	},
	load: function(callback){
		this._cb = callback;
		for (var i = 0; i < this._buffer.length; i++) {
			this.assetRequest(this._buffer[i], i);
		};
	},
	createResource: function(buffer, name, url){
		return {
			'buffer': buffer,
			'error': null,
			'isAudio': true,
			'isDataUrl': false,
			'isImage': false,
			'isJson': false,
			'isVideo': false,
			'isXml': false,
			'name': name,
			'url': url
		};
	},
	loadComplete: function(){
		this._cb(this, this.resources);
	},
	requestDone: function(name){
		var index = _.findLastIndex(this._buffer, {'name': name});
		this._buffer.splice(index, 1);
		if(this._buffer.length==0){
			this.loadComplete();
		}
	},
	assetRequest: function(asset){
		var _self = this;
		var request = new XMLHttpRequest();
		request.responseType = 'arraybuffer';
		// Decode asynchronously
		request.onload = function() {
			audio_engine.context.decodeAudioData(request.response, function(buffer) {
				_self.resources[asset.name] = _self.createResource(buffer, asset.name, asset.path);
				_self.requestDone(asset.name);
			});
		}
		request.open('GET', asset.path, true);
		request.send();
	},
});

AudioEngine = Class.extend({
	context: null,
	available: false,
	loader: null,
	init: function(){
		this.loader = new AuidoLoader();
		try {
			// Fix up for prefixing
			window.AudioContext = window.AudioContext||window.webkitAudioContext;
			this.context = new AudioContext();
			this.available = true;
		} catch(e) {
			console.log('Web Audio API is not supported in this browser');
		}
	},
	createSource: function(buffer){
		var source = this.context.createBufferSource();
		source.buffer = buffer;   
		source.connect(this.context.destination);
		return source;
	},
	playSound: function(name, start){
		var source = this.createSource(this.loader.resources[name].buffer);
		source.start(0);
	}
});

var audio_engine = new AudioEngine();
