Player = Entity.extend({
	physBody: null,
	render: null,
	health: 100,
	maxHealth: 100,
	fuel: 100,
	maxFuel: 100,
	isDead:false,
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
	},
	update: function(){
		//var velocity = this.physBody.GetLinearVelocity();
		var position = this.physBody.GetPosition();
		var render = this.render;
		var player_size = 64;
		this.pos = {
			x: (position.x*player_size)+2,
			y: (position.y*player_size)+2
		}
		render.setX(this.pos.x);
		render.setY(this.pos.y);
	}
});