Light = Class.extend({
	radius: null,
	angle_spread: 360,
	position: null,
	angle: 0,
    poly: null,
    body: null,
	init: function(position,radius){
		this.position = position;
		this.radius = radius;
        this.body = new Kinetic.Group({x:0,y:0});
	    this.poly = new Kinetic.Polygon({
            points: [0,0],
            fillRadialGradientStartPoint: 0,
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: 0,
            fillRadialGradientEndRadius: this.radius,
            fillRadialGradientColorStops: [0, 'rgba(255,255,255,0.2)', 1, 'rgba(0,0,0,0)'],
            strokeWidth: 0
        });
        this.body.add(this.poly);
	},
    setPosition: function(x,y){
        this.position.x = x;
        this.position.y = y;
        this.poly.setFillRadialGradientStartPoint([x,y]);
        this.poly.setFillRadialGradientEndPoint([x,y]);
    },
});

LightVector = Class.extend({
	x: 0,
	y: 0,
	init: function(x,y){
		this.x = x;
		this.y = y;
	},
});

LightEngine = Class.extend({
	canvas: null,
    layer: null,
	lights: new Array(),
	context: null,
    offset: {"x":0, "y":0},
	init: function(){
		var light_position = new LightVector(0,0);
		this.lights.push(new Light(light_position, 370));
	},
	build: function(){
        this.layer = render_engine.layers["light"];
		this.canvas = this.layer.canvas;
		this.context = this.canvas.getContext("2d");
        this.addLights();
	},
    addLights: function(){
        for (var i = 0; i < this.lights.length; i++) {
            this.layer.add(this.lights[i].body);
        };
    },
	findDistance: function(light, block, angle, rLen, start, shortest, closestBlock){

		var block_size = 64;
		var half_block = block_size/2;
		var offset = 0.1;
		var block_x = ((block.pos.x) * block_size) - half_block;
		var block_y = ((block.pos.y) * block_size) - half_block;
		var radius = light.radius;
		var y = (block_y + half_block) - light.position.y;
		var x = (block_x + half_block) - light.position.x;
		dist = Math.sqrt((y * y) + (x * x));
		if(radius >= dist)
		{
			var rads = angle * (Math.PI / 180),
			pointPos = new LightVector(light.position.x, light.position.y);

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
		    
		    for(var i = 0; i < world_engine.active_blocks.length; i++)
		    {
				findDistRes = this.findDistance(light, world_engine.active_blocks[i], curAngle, findDistRes.rLen, findDistRes.start, findDistRes.shortest, findDistRes.block);
		    }
	    	
    		var rads = curAngle * (Math.PI / 180),
        	end = new LightVector(light.position.x, light.position.y);
    
    		findDistRes.block.visible = true;
    		end.x += Math.cos(rads) * findDistRes.rLen ;
    		end.y += Math.sin(rads) * findDistRes.rLen;
            
            light_path.push(end.x);
            light_path.push(end.y);
    		
  		}

        light.poly.setPoints(light_path);
	},
	update: function(){
        this.offset = {'x':render_engine.stage.getX(), 'y':render_engine.stage.getY(), 'scale': render_engine.stage_size.scale};
        var x = (game_engine.player.pos.x*render_engine.stage_size.scale)/this.offset.scale;
        var y = (game_engine.player.pos.y*render_engine.stage_size.scale)/this.offset.scale;
        for(var i = 0; i < this.lights.length; i++){
        	this.lights[i].setPosition(x,y);
        	this.shineLight(this.lights[i]);
        } 

    }
});

light_engine = new LightEngine();