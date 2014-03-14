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

Void = Entity.extend({
	type: 0,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
	enable: function(){},
	disable: function(){},
	update:function(){}
});

Block = Entity.extend({
	physBody: null,
	render: null,
	health: 100,
	maxHealth: 100,
	zIndex: 0,
	parentChunk: null,
	dataIndex: null,
	highlight: false,
	debryAmount:2.7,
	color: '#574F3F',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		this.pos = {x:inputx, y:inputy};
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
		
		if(impulse>0.35 && u!==null){
			this.highlight = true;
			if(u.id=="player" && u.ent.isDigging()){
				this.takeDamage();
				if(this.health<=0){
					this.markForDeath = true;
				}
			}
		}
	},
	takeDamage: function(){
		this.health-=5;
	},
	remove: function(){
		world_engine.removeBlock(this.pos);
	},
	enable: function(){
		this.render = render_engine.addBlock(this.getEntityDef(), this.color);
		this.physBody = physics_engine.addBody(this.getEntityDef());
	},
	disable: function(){
		// remove physics body
		if(this.physBody==null) return;
		physics_engine.unregisterBody(this.physBody);
		this.physBody = null;
		// remove render object
		if(this.render==null) return;
		this.render.remove();
		this.render = null;
	},
	createDebry: function(){
		var size = this.debryAmount;
		for (var y = -size; y < size; y++) {
			for (var x = -size; x < size; x++) {
				var offset_x = x*0.1;
				var offset_y = y*-0.1;
				world_engine.addDebry(new Debry(this.pos.x+offset_x, this.pos.y+offset_y, this.color));
			}
		};
	},
	kill: function(){
		// spawn debry at current position
		this.createDebry();
		// kill it with fire
		this.disable();
		this.remove();
		this.markForDeath = false;
	},
	update: function(){
		this._super();
		if(this.render==null) return;

		if(this.highlight){
			//this.render.graphics.tint = 0x999999;
		} else {
			//this.render.graphics.tint = 0xFFFFFF;
		}

		var distance = game_engine.getPlayerDistance(this.getPosition(),Config.DRAW_DISTANCE*19.5);

		if(distance<1){
			var opacity = 1-((distance*100)/100);
			if(opacity>0.55){opacity/=.7;}
			this.render.setOpacity(opacity);
			this.enablePhysics();
		} else {
			this.render.setOpacity(0);
			this.disablePhysics();
		}

		this.highlight = false;
	}
});

Grass = Block.extend({
	type: 1,
	color: '#00ff00',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Dirt = Block.extend({
	type: 2,
	color: '#784800',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Stone = Block.extend({
	type: 3,
	color: '#888888',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

/*******************************************************************/
/**FALLING BLOCKS**/
/*******************************************************************/
GravityBlock = Block.extend({
	color: '#ff0000',
	decayClock: 100,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
	update: function(){
		this._super();
		if(world_data.get(this.pos.x,this.pos.y+1)===null){return;}
		if(world_data.get(this.pos.x,this.pos.y+1).type==0){
			if(this.decayClock<=0){
				this.markForDeath = true;
			} else {
				this.decayClock--;
			}
		} else {
			this.decayClock = 100;
		}
	}
});

Sand = GravityBlock.extend({
	type: 4,
	color: '#ECDCAB',
	debryAmount:1.7,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Gravel = GravityBlock.extend({
	type: 5,
	color: '#5E5748',
	debryAmount:1.2,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

/*******************************************************************/
/**FLUID BLOCKS**/
/*******************************************************************/
FluidBlock = Entity.extend({
	type:0,
	color: '#0000ff',
	clock: 100,
	clockSpeed: 80,
	volume: 10,
	last: 0,
	active: 0,
	direction: null,
	isSource: true,
	hasSource: null,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		this.pos = {x:inputx, y:inputy};
		if(this.isSource){
			this.setVolume(100);
			this.setDirection(null);
		} else {
			this.setDirection("down");
			this.setVolume(0);
		}
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
	remove: function(){
		world_engine.removeBlock(this.pos);
	},
	enable: function(){
		this.render = render_engine.addFluid(this.getEntityDef(), this.color);
	},
	disable: function(){
		// remove render object
		if(this.render==null) return;
		this.render.remove();
		this.render = null;
	},
	getVolume: function(){
		return this.volume;
	},
	setVolume: function(value){
		if(value<0) value=0;
		if(value>100) value=100;
		this.volume = value;
		this.active+=value/100;
	},
	getDirection: function(){
		return this.direction;
	},
	setDirection: function(value){
		this.direction = value;
	},
	kill: function(){
		// kill it with fire
		this.disable();
		this.remove();
		this.markForDeath = false;
	},
	tapTop: function(tapped, tap_value){
		// check top
		var source = world_data.get(this.pos.x,this.pos.y-1);
		var source_reduce = 1;
		if(source!==null){
			if(source.type==this.type && !tapped){
				if(source.getDirection()!="down" && source.getDirection()!=this.getDirection()){
					if(!source.isSource) source.setDirection("down");
					source_reduce = 5;
				}
				if(source.getVolume()>this.getVolume()){
					source.setVolume(source.getVolume()-tap_value/source_reduce);
					this.setVolume(this.volume+tap_value);
					return true;
				}
			}
		}
		return false;
	},
	tapLeft: function(tapped, tap_value, keep_direction){
		// check left
		if(keep_direction===undefined) keep_direction=false;
		var source = world_data.get(this.pos.x-1,this.pos.y);
		if(source!==null){
			if(source.type==this.type && !tapped){
				if((source.getDirection()=="down" && this.getDirection()=="down") || this.getDirection()=="left"){return false;}
				if(!keep_direction && (source.getDirection()!="down" && source.getDirection()!=null) && source.getDirection()!=this.getDirection()){
					this.setDirection(source.getDirection());
					return false;
				}
				if(source.getVolume()>this.getVolume()){
					source.setVolume(source.getVolume()-tap_value);
					this.setVolume(this.volume+tap_value);
					return true;
				}
			}
		}
		return false;
	},
	tapRight: function(tapped, tap_value, keep_direction){
		if(keep_direction===undefined) keep_direction=false;
		var source = world_data.get(this.pos.x+1,this.pos.y);
		if(source!==null){

			if(source.type==this.type && !tapped){
				if((source.getDirection()=="down" && this.getDirection()=="down") || this.getDirection()=="right"){return false;}

				if(!keep_direction && (source.getDirection()!="down" && source.getDirection()!=null)  && source.getDirection()!=this.getDirection()){
					this.setDirection(source.getDirection());
					return false;
				}

				if(source.getVolume()>this.getVolume()){
					source.setVolume(source.getVolume()-tap_value);
					this.setVolume(this.volume+tap_value);
					return true;
				}
			}
		}
		return false;
	},
	spawnLeft: function(){
		var source = world_data.get(this.pos.x-1,this.pos.y);
		if(source!==null){
			if(source.type==0){
				var block = world_data.set(this.pos.x-1, this.pos.y, this.type);
				block.isSource = false;
				block.setVolume(0);
				block.setDirection("left");
			}
		}
	},
	spawnRight: function(){
		var source = world_data.get(this.pos.x+1,this.pos.y);
		if(source!==null){
			if(source.type==0){
				var block = world_data.set(this.pos.x+1, this.pos.y, this.type);
				block.isSource = false;
				block.setVolume(0);
				block.setDirection("right");
			}
		}
	},
	spawnBottom: function(){
		var source = world_data.get(this.pos.x, this.pos.y+1);
		if(source!==null){
			if(source.type==0){
				var block = world_data.set(this.pos.x, this.pos.y+1, this.type);
				block.isSource = false;
				block.setVolume(0);
				block.setDirection("down");
			}
		}
	},
	checkAdjacent: function(){
		var right_bottom = world_data.getType(this.pos.x+1, this.pos.y+1);
		var left_bottom = world_data.getType(this.pos.x-1, this.pos.y+1);
		var left = world_data.getType(this.pos.x-1, this.pos.y);
		var right = world_data.getType(this.pos.x+1, this.pos.y);
		if(this.isSource){return false;}
		if(((left==0 || left==this.type) && (right==0 || right==this.type)) && ((right_bottom==0 || right_bottom==this.type) && (left_bottom==0 || left_bottom==this.type))){
			this.setDirection("down");
		} else if(right_bottom==this.type){
			this.setDirection("right");
		} else if(left_bottom==this.type){
			this.setDirection("left");
		}


	},
	fluid_update: function(){
		var tapped = false;
		if(this.isSource){
			this.setVolume(100);
			tapped = true;
		}
		if(this.clock<=0){
			var tap_value = 8;
			var gravity_presure = 2.88;
			var spawn_value = tap_value*5;
			var current_active = this.active;

			// replicate
			var bottom_source = world_data.get(this.pos.x,this.pos.y+1);
			if(bottom_source==null){return false;}
			if(bottom_source.type==0){
				if(this.getVolume()>spawn_value) this.spawnBottom();
				tapped = this.tapTop(tapped, (tap_value*gravity_presure)*1.36);
				if(this.getDirection()=="left"){
					tapped = this.tapRight(false, tap_value);
				} else if(this.getDirection()=="right"){
					tapped = this.tapLeft(false, tap_value);
				}
			} else if(bottom_source.type>=6 && bottom_source.type<=7) {
				if(this.getDirection()=="down"){
					tapped = this.tapTop(tapped, (tap_value*gravity_presure)*1.36);
					if(!tapped){
						this.tapLeft(tapped, tap_value*1.36, true);
						this.tapRight(tapped, tap_value*1.36, true);
					}
				} else if(this.getDirection()=="left"){
					tapped = this.tapRight(false, tap_value);
				} else if(this.getDirection()=="right"){
					tapped = this.tapLeft(false, tap_value);
				}

			} else {
				tapped = this.tapTop(false, (tap_value*gravity_presure)*1.36);
				// check flow
				if(this.getDirection()=="left"){
					if(this.getVolume()>spawn_value) this.spawnLeft();
					if(this.getVolume()>spawn_value) this.spawnRight();
					tapped = this.tapRight(false, tap_value);
				} else if(this.getDirection()=="right"){
					if(this.getVolume()>spawn_value) this.spawnRight();
					if(this.getVolume()>spawn_value) this.spawnLeft();
					tapped = this.tapLeft(false, tap_value);
				} else if(this.getDirection()=="down"){
					if(this.getVolume()>spawn_value) this.spawnLeft();
					tapped = this.tapLeft(false, tap_value, true);
					if(this.getVolume()>spawn_value) this.spawnRight();
					tapped = this.tapRight(false, tap_value, true);
				} else if(this.getDirection()==null){
					if(this.getVolume()>spawn_value) this.spawnLeft();
					if(this.getVolume()>spawn_value) this.spawnRight();
				}

				// drain
				if(!this.isSource && this.getVolume()>0 && this.active<=0){
					this.setVolume(this.volume-gravity_presure);
				} else {

					this.checkAdjacent();
				}

			}

			if(current_active==this.active){
				this.active-=Math.random()*spawn_value;
			}
			// fluid logic
			if(!this.isSource && this.volume <= 0){
				this.markForDeath = true;
			}


			this.clock = 100;
		} else {
			this.clock-= this.clockSpeed;
		}

	},
	update: function(){
		this._super();
		if(this.render==null) return;

		this.render.setVolume(this.getVolume());
		this.render.setDirection(this.getDirection());

		var distance = game_engine.getPlayerDistance(this.getPosition(),Config.DRAW_DISTANCE*19.5);
		if(distance<1){
			var opacity = 1-((distance*100)/100);
			if(opacity>0.85){opacity=0.85;}
			this.render.setOpacity(opacity);
		} else {
			this.render.setOpacity(0);
		}
	}
});

Water = FluidBlock.extend({
	type: 6,
	color: '#B0D2FF',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});

Lava = FluidBlock.extend({
	type: 7,
	clockSpeed:10,
	color: '#FF9245',
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
	},
});
