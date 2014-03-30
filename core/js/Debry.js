Debry = Entity.extend({
	physBody: null,
	render: null,
	zIndex: 0,
	color: '#574F3F',
	asset: null,
	debry_size: 5,
	debry_life: 150,
	init: function(inputx, inputy, entity, settings) {
		this._super(inputx, inputy, settings);

		this.color = entity.color;
		this.asset = entity.asset;
		// randomize life
		this.debry_life = Math.ceil(Math.random()*this.debry_life);
		if(this.debry_life<50){this.debry_life=50;}
		// randomize size
		this.debry_size = Math.ceil(Math.random()*this.debry_size);
		if(this.debry_size<2){this.debry_size=2;}
		this.pos = {x:inputx, y:inputy};
		this.render = render_engine.addDebry(this.getEntityDef());
		this.physBody = physics_engine.addBody(this.getEntityDef());
	},
	getEntityDef: function(){
		return {
			id: "debry",
			x: this.pos.x,
			y: this.pos.y,
			asset: this.asset,
			color: this.color,
			radius:this.debry_size*0.15/8,
			allowSleep: false,
			userData: {
				"id": "debry",
				"ent": this
			}
		}
	},
	onTouch: function(body, impulse) {
		var u = body?body.GetUserData():null;
		if(impulse>0.15 && u!==null){
			if(u.id=="player"){
				this.markForDeath = true;
			}
		}
	},
	kill: function(){
		// kill it with fire
		this.destroy();
		this.markForDeath = false;
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
	enablePhysics: function(){
		this.physBody.SetAwake(true);
	},
	disablePhysics: function(){
		this.physBody.SetAwake(false);
	},
	update: function(){
		this._super();
		if(this.render==null) return;
		var position = this.physBody.GetPosition();

		var pos = {
			x: position.x*64,
			y: position.y*64
		}

		var distance = game_engine.getPlayerDistance(pos,Config.DRAW_DISTANCE*17.5);

		if(distance<1){
			var opacity = 1-((distance*100)/100);
			if(opacity>0.55){opacity=1;}
			this.render.setOpacity(opacity);
			this.enablePhysics();
		} else {
			this.render.setOpacity(0);
			this.disablePhysics();
			this.markForDeath = true;
		}

		this.render.setPosition(pos);

		if(this.debry_life<=0){
			this.markForDeath = true;
		} else {
			this.debry_life--;
		}
	}
});