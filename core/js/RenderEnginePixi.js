PlayerRender = Class.extend({
	graphics: null,
	player_size: 28,
	init: function(entityDef){
		this.graphics = new PIXI.Graphics();
		this.graphics.beginFill(0xC9C0B1);
		this.graphics.lineStyle(2, 0x000000);
		this.graphics.drawCircle(0, 0, this.player_size);
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	}
});

DebryRender = Class.extend({
	graphics: null,
	init: function(entityDef, size, color){
		this.graphics = new PIXI.Graphics();
		var color = "0x"+color.substr(1);
		//this.graphics.beginFill(color);
		var alpha = Math.random();
		if(alpha<0.5) alpha=0.5;
		this.graphics.lineStyle(12, color, alpha);
		this.graphics.drawCircle(0, 0, size);
		//this.graphics.drawRect(0, 0, size, size);
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	},
	remove: function(){
		var layer = render_engine.getLayer("debry");
		layer.container.removeChild(this.graphics);
		this.graphics = null;
	},
	setOpacity: function(opacity){
		this.graphics.alpha = opacity;
	}
});

BlockRender = Class.extend({
	graphics: null,
	block_size: 64,
	init: function(entityDef, color){
		this.graphics = new PIXI.Graphics();
		var offset = this.block_size/2;
		var color = "0x"+color.substr(1);
		this.setPosition({
			x: entityDef.x*this.block_size,
			y: entityDef.y*this.block_size
		})
		this.graphics.beginFill(color);
		this.graphics.lineStyle(-1, color, 0.5);
		this.graphics.drawRect(-offset, -offset, this.block_size, this.block_size);
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	},
	remove: function(){
		var layer = render_engine.getLayer("blocks");
		layer.container.removeChild(this.graphics);
		this.graphics = null;
	},
	setOpacity: function(opacity){
		this.graphics.alpha = opacity;
	}
});

FluidRender = Class.extend({
	graphics: null,
	block_size: 64,
	color: 0x0000ff,
	init: function(entityDef, color){
		this.graphics = new PIXI.Graphics();
		var offset = this.block_size/2;
		this.color = "0x"+color.substr(1);
		this.setPosition({
			x: entityDef.x*this.block_size,
			y: entityDef.y*this.block_size
		})
		this.setVolume(0);
	},
	setDirection: function(value){
		if(value!=null && Config.DEBUG){
			this.graphics.beginFill(0xFFFFFF);
			if(value=="right"){
				this.graphics.drawRect(0, -5, 40, 10);
			} else if(value=="left"){
				this.graphics.drawRect(0, -5, -40, 10);
			} else if(value=="down"){
				this.graphics.drawRect(-5, 0, 10, 40);
			}

		}
	},
	setVolume: function(value){
		var level = (this.block_size*value/100);
		if(value>0){ level = 64; }
		this.graphics.clear();
		this.graphics.beginFill(this.color, 0.8);
		this.graphics.lineStyle(0, 0xFFFFFF, 1);
		this.graphics.drawRect(-this.block_size/2, -level+this.block_size/2, this.block_size, level);
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	},
	remove: function(){
		var layer = render_engine.getLayer("blocks");
		layer.container.removeChild(this.graphics);
		this.graphics = null;
	},
	setOpacity: function(opacity){
		this.graphics.alpha = opacity;
	}
});

LightRender = Class.extend({
	graphics: null,
	mask: null,
	sprite: null,
    color: 0xffffff,
	radius: null,
	shineLight: true,
	init: function(entityDef){
		this.graphics = new PIXI.DisplayObjectContainer();

		this.mask = new PIXI.Graphics();
		this.mask.beginFill(this.color);
		this.mask.lineStyle(0, this.color);
		this.mask.position = new PIXI.Point(0,0);

		this.graphics.addChild(this.mask);

		this.radius = entityDef.radius;

		this.sprite = PIXI.Sprite.fromImage("assets/img/light-mask.png");
		this.sprite.position.x = this.sprite.position.y = -280;
		this.graphics.addChild(this.sprite);
		this.sprite.mask = this.mask;
	},
    setPosition: function(pos){
        this.sprite.position.x = pos.x*64 - 280;
        this.sprite.position.y = pos.y*64 - 280;
    },
    setPath: function(path){
    	this.mask.clear();
    	this.mask.beginFill(this.color);
		this.mask.lineStyle(0, this.color);
		if(path.length!=0){
			this.mask.graphicsData[0].points = path;
		} else {
			this.mask.drawCircle(0,0,300);
		}
    },
    setPoints: function(path){
    	this.mask.clear();
    	this.mask.beginFill(this.color);
		this.mask.lineStyle(0, this.color);
		if(path.length!=0){
			this.mask.graphicsData[0].points = path;
		} else {
			this.mask.drawCircle(0,0,300);
		}
    }
});

RenderLayer = Class.extend({
	container: null,
	init: function(){
		this.container = new PIXI.DisplayObjectContainer();
	},
	add: function(object){
		this.container.addChild(object.graphics);
	},
	position: function(pos,offset){
		this.container.position = new PIXI.Point(pos.x+offset.x,pos.y+offset.y);
	}
});

RenderEngine = Class.extend({
	stage: null,
	layers: new Object(),
	renderer: null,
	stage_size: {width: 500, height:500, scale:0.8},
	init: function () {},
	build: function() {
		this.stage = new PIXI.Stage(0x0F0A00);

		this.renderer = PIXI.autoDetectRenderer(this.stage_size.width, this.stage_size.height);
		$("#world_container").append(this.renderer.view);

		this.addLayer("debug");
		this.addLayer("player");
		this.addLayer("light");
		this.addLayer("debry");
		this.addLayer("blocks");

		this.setScale(this.stage_size.scale);
	},
	setWidth: function(width){
		this.stage_size.width = width;
		this.renderer.resize(width,this.stage_size.height);
	},
	setHeight: function(height){
		this.stage_size.height = height;
		this.renderer.resize(this.stage_size.width,height);
	},
	setScale: function(scale){
		var scale = new PIXI.Point(scale,scale);
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.container.scale = scale;
		}
	},
	stagePosition: function(pos){
		var offset_value = this.stage_size.scale*32;
		var offset = {'x':offset_value, 'y':offset_value};
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.position(pos,offset);
		}
	},
	addLayer: function(name){
		var layer = this.registerLayer(name, new RenderLayer());
		this.stage.addChild(layer.container);
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
		light_layer.add(light);
		return light;
	},
	addPlayer: function(entityDef){
		var player_layer = this.getLayer("player");
		var player = new PlayerRender(entityDef);
		player_layer.add(player);
		return player;
	},
	addBlock: function(entityDef, color){
		var block_layer = this.getLayer("blocks");
		var block = new BlockRender(entityDef, color);
		block_layer.add(block);
		return block;
	},
	addFluid: function(entityDef, color){
		var block_layer = this.getLayer("blocks");
		var block = new FluidRender(entityDef, color);
		block_layer.add(block);
		return block;
	},
	addDebry: function(entityDef, size, color){
		var debry_layer = this.getLayer("debry");
		var debry = new DebryRender(entityDef, size, color);
		debry_layer.add(debry);
		return debry;
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
		this.renderer.render(this.stage);
	}
});

render_engine = new RenderEngine();