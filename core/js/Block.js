Bound = Entity.extend({
	physBody: null,
	zIndex: 0,
	init: function(inputx, inputy, width, height, settings) {
		this._super(inputx, inputy, settings);
		var entityDef = {
			id: "bound",
			x: this.pos.x,
			y: this.pos.y,
			type: "static",
			width: width,
			height: height,
			userData: {
				"id": "bound",
				"ent": this
			}
		};

		this.physBody = physics_engine.addBody(entityDef);
	},
	setX: function(x){
		var pos = this.physBody.GetPosition();
		var position = physics_engine.vec(x,pos.y);
		this.physBody.SetPosition(position);
	},
	setY: function(y){
		var pos = this.physBody.GetPosition();
		var position = physics_engine.vec(pos.x,y);
		this.physBody.SetPosition(position);
	},
	update: function(){
		
	}
});

Block = Entity.extend({
	physBody: null,
	render: null,
	health: 100,
	maxHealth: 100,
	zIndex: 0,
	parentChunk: null,
	dataIndex: null,
	color: '#574F3F',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		this.pos = {x:inputx, y:inputy};
		this.render = render_engine.addBlock(this.getEntityDef(), this.color);
		this.physBody = physics_engine.addBody(this.getEntityDef());
	},
	getEntityDef: function(){
		return {
			id: "block",
			x: this.pos.x,
			y: this.pos.y,
			type: "static",
			width: 0.5,
			height: 0.5,
			userData: {
				"id": "block",
				"ent": this
			}
		}
	},
	onTouch: function(body, impulse) {
		var u = body?body.GetUserData():null;
		if(impulse>5 && u!==null){
			if(u.id=="player"){
				this.markForDeath = true;
			}
		}
	},
	remove: function(){
		world_engine.removeBlock(this.pos);
	},
	destroy: function(){
		// remove physics body
		if(this.physBody==null) return;
		physics_engine.unregisterBody(this.physBody);
		this.physBody = null;
		// remove render object
		if(this.render==null) return;
		this.render.remove();
		this.render = null;
	},
	kill: function(){
		this.destroy();
		this.remove();
		this.markForDeath = false;
	},
	getBlockData: function(){
		return world_data.get(this.pos.x,this.pos.y);
	},
	update: function(){
		this._super();
		if(this.render==null) return;
		var pos = {x: this.pos.x*64, y: this.pos.y*64}
		var radius = 350;
		var distance = Math.abs(lineDistance(pos,game_engine.player.pos));
		var distance = (distance-64)/radius; if(distance<0) distance=0;
		this.render.setOpacity(0);
		//var block = this.render.getChildren()[0];
		if(distance<1){
			var opacity = 1-((distance*100)/100);
			if(opacity>0.55){opacity/=.7;}
			this.render.setOpacity(opacity);
		}
	}
});


Grass = Block.extend({
	color: '#00ff00',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Dirt = Block.extend({
	color: '#784800',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Stone = Block.extend({
	color: '#888888',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});