LightRender = Class.extend({
    poly: null,
    body: null,
    radius: null,
    shineLight: true,
	init: function(entityDef){
		this.radius = entityDef.radius;
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
	setPosition: function(pos){
        this.poly.setFillRadialGradientStartPoint([pos.x,pos.y]);
        this.poly.setFillRadialGradientEndPoint([pos.x,pos.y]);
    },
	setPoints: function(path){
		this.poly.setPoints(path);
	}
});

RenderEngine = Class.extend({
	stage: null,
	layers: new Object(),
	stage_size: {width: 500, height:500, scale:0.8},
	init: function () {},
	build: function() {
		this.stage = new Kinetic.Stage({
			container: 'world_container',
			width: this.stage_size.width,
			height: this.stage_size.height,
			scale: this.stage_size.scale,
			offset: {x:-32,y:-32}
		});
		this.addLayer("light");
		this.addLayer("blocks");
		this.addLayer("player");
	},
	setWidth: function(width){
		this.stage_size.width = width;
		this.stage.setWidth(width);
	},
	setHeight: function(height){
		this.stage_size.height = height;
		this.stage.setHeight(height);
	},
	setScale: function(scale){
		this.stage_size.scale = scale;
		this.stage.setScale(scale);
	},
	stagePosition: function(pos){
		this.stage.setX(pos.x);
		this.stage.setY(pos.y);
	},
	addLayer: function(name){
		var layer = this.registerLayer(name, new Kinetic.Layer());
		this.stage.add(layer);
		return layer;
	},
	getLayer: function(name){
		return this.layers[name];
	},
	registerLayer: function(name,layer){
		this.layers[name] = layer;
		return layer;
	},
	addLight: function(entityDef){
		var light_layer = this.getLayer("light");
		var light = new LightRender(entityDef);
		light_layer.add(light.body);
		return light;
	},
	addPlayer: function(entityDef){
		var player_layer = this.getLayer("player");
		var player_size = 28;
		var group = new Kinetic.Group({
			x: entityDef.x,
	        y: entityDef.y,
	        //offset: {x:player_size,y:player_size},
		});

		var player = new Kinetic.Circle({
			x: 0,
	        y: 0,
	        radius: player_size,
	        fill: '#C9C0B1',
	        stroke: 'black',
	        strokeWidth: 2
    	});
		group.add(player);
		player_layer.add(group);
		return group;
	},
	addBlock: function(entityDef, color){
		var block_layer = this.getLayer("blocks");
		var block_size = 64;

		var group = new Kinetic.Group({
			x: entityDef.x*block_size,
	        y: entityDef.y*block_size,
	        offset: {x:block_size/2,y:block_size/2},
		});

		var block = new Kinetic.Rect({
			x: 0,
	        y: 0,
	        width: block_size,
	        height: block_size,
	        fill: color,
	        stroke: color,
	        strokeWidth: 1
    	});

		group.add(block);
		block_layer.add(group);
		return group;
	},
	registerBody: function (entity) {
		var entity = this.stage.add(entity);
		return entity;
	},
	unregisteBody: function (obj) {
		this.stage.DestroyBody(obj);
		return null;
	},
	update:function(){
		this.stage.draw();
	}
});

render_engine = new RenderEngine();