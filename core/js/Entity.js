Entity = Class.extend({
	id: 0,
	pos: {x: 0,y: 0},
	zIndex: 0,
	markForDeath:false,
	dead: false,
	init: function (x, y, settings) {
		this.id = ++Entity._lastId;
		this.pos.x = x;
		this.pos.y = y;
	},
	kill: function(){},
	update: function(){
		if(this.markForDeath == true) {
			this.kill();
			return;
		}
	},
	onTouch: function(body, impulse) {}
});

// Last used entity id; incremented with each spawned entity
Entity._lastId = 0;