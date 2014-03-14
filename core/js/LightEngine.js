Light = Entity.extend({
	render: null,
	radius: 0,
	zIndex: 1,
	p1: new b2Vec2(),
	p2: new b2Vec2(),
	input: new b2RayCastInput(),
	output: new b2RayCastOutput(),
	path: new Array(),
	init: function(radius, settings) {
		this._super(0, 0, settings);
		this.radius = radius;
		var entityDef = {
			id: "light",
			x: this.pos.x,
			y: this.pos.y,
			radius:radius
		};
		this.render = render_engine.addLight(entityDef);
	},
	setPoints: function(points){
		this.render.setPoints(points);
	},
	setPosition: function(pos){
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.render.setPosition(this.pos);
	},
   	begin: function(){
   		this.path = new Array();
        //this.setPosition(game_engine.player.physBody.GetPosition());
      	// TODO: not all lights follow the player, do a player light entity.
   	},
   	end: function(){
   		this.render.setPath(this.path);  		
   	},
	rayCast: function(angle){
		//calculate points of ray

		this.p1.x = this.pos.x + 0.001 * Math.sin(angle);
		this.p1.y = this.pos.y + 0.001 * Math.cos(angle);

		this.p2.x = this.pos.x + (this.radius/64) * Math.sin(angle);
		this.p2.y = this.pos.y + (this.radius/64) * Math.cos(angle);

		this.input.p1 = this.p1;
		this.input.p2 = this.p2;
		this.input.maxFraction = 1;
		
		var closestFraction = 1;
		for(b = physics_engine.world.GetBodyList(); b; b = b.GetNext()){
			var bD = b?b.GetUserData():null;
			if(bD!=null){if(bD.id=="player"){continue;}}
			for(f = b.GetFixtureList(); f; f = f.GetNext()) {
				if(!f.RayCast(this.output, this.input))
					continue;
				else if(this.output.fraction < closestFraction)  {
					closestFraction = this.output.fraction;
				}
			}
		}

      	this.path.push((this.pos.x + closestFraction * (this.p2.x - this.pos.x))*64);
      	this.path.push((this.pos.y + closestFraction * (this.p2.y - this.pos.y))*64);
	}
});

LightEngine = Class.extend({
	canvas: null,
    layer: null,
	lights: new Array(),
	context: null,
    offset: {"x":0, "y":0},
	init: function(){
		// add lights to the build
	},
	build: function(){
    },
    addLight: function(entityDef){
    	var light = null;
    	if(entityDef.id == "player"){
    		light = this.add(new Light(342));
    	}
    	return light;
    },
    add: function(light){
    	this.lights.push(light);
    	return light;
    },
	update: function(){
		for(var i = 0; i < this.lights.length; i++){
    		this.lights[i].begin();
			for(var curAngle = 0; curAngle < Math.PI*2; curAngle += (Math.PI / 180)){
	        	this.lights[i].rayCast(curAngle);
	    	}
	    	this.lights[i].end();
	    }
    }
});

light_engine = new LightEngine();