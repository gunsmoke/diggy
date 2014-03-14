Player = Entity.extend({
	physBody: null,
	render: null,
	light: null,
	health: 100,
	maxHealth: 100,
	fuel: 100,
	maxFuel: 100,
	isDead:false,
	digging: false,
	zIndex: 1,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		var entityDef = {
			id: "player",
			x: this.pos.x,
			y: this.pos.y,
			radius:0.48,
			allowSleep: false,
			userData: {
				"id": "player",
				"ent": this
			}
		};

		this.render = render_engine.addPlayer(entityDef);
		this.physBody = physics_engine.addBody(entityDef);
		this.light = light_engine.addLight(entityDef);
	},
	handleActions: function(){
		if(input_engine.state('digg') && !input_engine.state('move-up')){
			this.digging = true;
		} else {
			this.digging = false;
		}
	},
	isDigging: function(){
		return this.digging;
	},
	update: function(){
		this.handleActions();
		//var velocity = this.physBody.GetLinearVelocity();
		var position = this.physBody.GetPosition();
		var render = this.render;
		var player_size = 64;
		this.pos = {
			x: (position.x*player_size)+2,
			y: (position.y*player_size)+2
		}
		render.setPosition(this.pos);

		this.light.setPosition(this.physBody.GetPosition());
		
	}
});