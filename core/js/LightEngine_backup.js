// TODO REMOVE THIS VECTOR
LightVector = Class.extend({
	init: function(x,y){
		this.x = x;
		this.y = y;
	},
});

Light = Entity.extend({
	render: null,
	radius: 0,
	angle_spread: 360,
	angle: 0,
	zIndex: 1,
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
		this.render.setPosition(pos);
	},
	update: function(){
	
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
		this.lights.push(new Light(370));
    },
	findDistance: function(light, block, angle, rLen, start, shortest, closestBlock){
		var block_size = 64;
		var half_block = block_size/2;
		var block_x = ((block.pos.x) * block_size) - half_block;
		var block_y = ((block.pos.y) * block_size) - half_block;
		var x = (block_x + half_block) - light.pos.x;
		var y = (block_y + half_block) - light.pos.y;
		dist = Math.sqrt((x * x) + (y * y));
		if(light.radius >= dist)
		{
			var rads = angle * (Math.PI / 180),
			pointPos = new LightVector(light.pos.x, light.pos.y);

			pointPos.x += Math.cos(rads) * dist;
			pointPos.y += Math.sin(rads) * dist;

			if(pointPos.x > block_x && pointPos.x < block_x + block_size && pointPos.y > block_y && pointPos.y < block_y + block_size)
			{
				if(start || dist < shortest){
					start = false;
					shortest = dist;
					rLen= dist;
					closestBlock = block;
				}

				return {'start' : start, 'shortest' : shortest, 'rLen' : rLen, 'block' : closestBlock};
			}
		}
	
		return {'start' : start, 'shortest' : shortest, 'rLen' : rLen, 'block' : closestBlock};
	},
	shineLight: function(light){

		var curAngle = light.angle - (light.angle_spread/2),
			dynLen = light.radius,
			addTo = 1/light.radius,
            light_path = new Array();

		for(curAngle; curAngle < light.angle + (light.angle_spread/2); curAngle += (addTo * (180/Math.PI))*8){
    		dynLen = light.radius;
    		
    		var findDistRes = {};
			findDistRes.start = true;
			findDistRes.shortest = 0;
			findDistRes.rLen = dynLen;
			findDistRes.block = {};
		    
		    for(var i = 0; i < world_engine.visible_blocks.length; i++)
		    {
				findDistRes = this.findDistance(light, world_engine.visible_blocks[i], curAngle, findDistRes.rLen, findDistRes.start, findDistRes.shortest, findDistRes.block);
		    }
	    	
    		var rads = curAngle * (Math.PI / 180),
        	end = new LightVector(light.pos.x, light.pos.y);
   
    		end.x += Math.cos(rads) * findDistRes.rLen;
    		end.y += Math.sin(rads) * findDistRes.rLen;
            
            light_path.push(end.x);
            light_path.push(end.y);
    		
  		}

        light.setPoints(light_path);
	},
	update: function(){
        //this.offset = {'x':render_engine.stage.getX(), 'y':render_engine.stage.getY(), 'scale': render_engine.stage_size.scale};
        this.offset = {'x':0, 'y':0, 'scale': 1}
        var x = game_engine.player.pos.x;
        var y = game_engine.player.pos.y;

        for(var i = 0; i < this.lights.length; i++){
        	this.lights[i].setPosition(new LightVector(x,y));
        	if(this.lights[i].render.shineLight){
        		this.shineLight(this.lights[i]);
        	}
        } 

    }
});

light_engine = new LightEngine();