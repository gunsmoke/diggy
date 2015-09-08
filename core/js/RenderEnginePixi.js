

PlayerRender = Class.extend({
	graphics: null,
	player_size: 28,
	spine: null,
	explosion: null,
	init: function(entityDef){

    	this.spine = new PIXI.spine.Spine(loader.resources.diggy.spineData);
		// set the position
		this.spine.position.x = 0;
		this.spine.position.y = 29;

		this.spine.scale.set(0.1);

    	this.spine.state.setAnimationByName(0, 'standby', true);

    	// SET MIXES
		this.spine.stateData.setMixByName('standby', 'jump', 0.2);
		this.spine.stateData.setMixByName('jump', 'fly', 0.2);
		this.spine.stateData.setMixByName('fly', 'standby', 0.2);
		this.spine.stateData.setMixByName('fly', 'fall', 0.2);
		this.spine.stateData.setMixByName('standby', 'fall', 0.2);
		// death mixes
		this.spine.stateData.setMixByName('standby', 'death', 0.2);
		this.spine.stateData.setMixByName('fly', 'death', 0.2);
		this.spine.stateData.setMixByName('fall', 'death', 0.2);
		this.spine.stateData.setMixByName('jump', 'death', 0.2);



		this.graphics = new PIXI.Container();
		this.graphics.addChild(this.spine);

		this.initExplosion();
    	/*
		var sprite = PIXI.Sprite.fromImage("assets/img/player.png");
		sprite.position.x = sprite.position.y = -35;
		sprite.scale.x = sprite.scale.y = 0.5;
		this.graphics = new PIXI.Container();

		var mask = new PIXI.Graphics();
		mask.beginFill(0xC9C0B1);
		mask.drawCircle(0, 0, this.player_size);
		//this.graphics.addChild(mask);

		this.graphics.addChild(spine);
		//this.graphics.addChild(sprite);
		//sprite.mask = mask;
		*/
	},
	initExplosion: function(){
		var explosionTextures = [];

		for (i = 0; i < 26; i++)
		{
			var texture = PIXI.Texture.fromFrame('Explosion_Sequence_A ' + (i+1) + '.png');
			explosionTextures.push(texture);
		}

		this.explosion = new PIXI.extras.MovieClip(explosionTextures);
		this.explosion.alpha = 0;
		this.explosion.position.x = 0;
		this.explosion.position.y = 0;
		this.explosion.anchor.x = 0.5;
		this.explosion.anchor.y = 0.5;
		this.explosion.rotation = 0;
		this.explosion.scale.set(0.75);
		this.graphics.addChild(this.explosion);
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	}
});

DebryRender = Class.extend({
	graphics: null,
	init: function(entityDef){
		//this.graphics = new PIXI.Graphics();
		//var color = "0x"+color.substr(1);

		var sprite = PIXI.Sprite.fromImage("assets/"+Config.TEXTURE_PACK+"/textures/blocks/"+entityDef.asset+".png");
		sprite.position.x = sprite.position.y = -32;
		sprite.rotation = Math.random()-0.5;

		this.graphics = new PIXI.Container();

		var mask = new PIXI.Graphics();
		mask.beginFill(entityDef.color);
		mask.drawCircle(0, 0, entityDef.radius*124.5);

		this.graphics.addChild(mask);

		this.graphics.addChild(sprite);
		sprite.mask = mask;

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
	sprite: null,
	damage_sprite: null,
	block_size: 64,
	init: function(entityDef){
		this.graphics = new PIXI.Container();

		var offset = this.block_size/2;

		if(entityDef.asset!=null){
			this.sprite = PIXI.Sprite.fromImage("assets/"+Config.TEXTURE_PACK+"/textures/blocks/"+entityDef.asset+".png");
			this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
			this.sprite.scale.x = this.sprite.scale.y = Config.TEXTURE_PACK_SCALE;
		} else if(entityDef.color!=null){
			var color = "0x"+entityDef.color.substr(1);
		}


		this.setPosition({
			x: entityDef.x*this.block_size,
			y: entityDef.y*this.block_size
		})


		if(entityDef.asset!=null){
			this.graphics.addChild(this.sprite);
		} else if(entityDef.color!=null) {
			var box = new PIXI.Graphics();
			box.beginFill(color);
			box.lineStyle(0, color, 0.5);
			box.drawRect(-offset, -offset, this.block_size, this.block_size);
			this.graphics.addChild(box);
		}


		// add bound texture to the block
		var max_x = Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE-Config.BOUND_SIZE;
		var max_y = Config.MAX_CHUNKS_SIZE.Y*Config.CHUNK_SIZE-Config.BOUND_SIZE;
		var min_x = Config.BOUND_SIZE;

		if(entityDef.y <= max_y && (entityDef.x < min_x || entityDef.x > max_x || entityDef.y < 2)){
			var bound = PIXI.Sprite.fromImage("assets/img/bound.png");
			bound.position.x = bound.position.y = -32;
			this.graphics.addChild(bound);
		}
	},
	setDamageStage: function(stage){
		if(this.damage_sprite!=null){
			this.graphics.removeChild(this.damage_sprite);
		}
		this.damage_sprite = PIXI.Sprite.fromImage("assets/img/destroy_stage_"+stage+".png");
		this.damage_sprite.anchor.x = this.damage_sprite.anchor.y = 0.5;
		this.damage_sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
		this.damage_sprite.alpha = 0.5;
		this.damage_sprite.scale.x = this.damage_sprite.scale.y = Config.TEXTURE_PACK_SCALE;
		this.graphics.addChild(this.damage_sprite);
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

ShopRender = Class.extend({
	graphics: null,
	sprite: null,
	block_size: 64,
	init: function(entityDef){
		this.graphics = new PIXI.Container();

		var offset = this.block_size/2;

		if(entityDef.asset!=null){	
			this.sprite = new PIXI.Sprite();
			this.sprite.texture = loader.resources[entityDef.asset].texture;
			this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
			this.sprite.scale.x = this.sprite.scale.y = Config.TEXTURE_PACK_SCALE;
		}


		this.setPosition({
			x: entityDef.x*this.block_size,
			y: (entityDef.y*this.block_size)-93
		})


		if(entityDef.asset!=null){
			this.graphics.addChild(this.sprite);
		}
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	},
	remove: function(){
		var layer = render_engine.getLayer("shops");
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
		//this.color = "0x"+color.substr(1);
		
		//this.setVolume(0);


		if(entityDef.asset!=null){
			var texture = PIXI.Texture.fromImage("assets/"+Config.TEXTURE_PACK+"/textures/blocks/"+entityDef.asset+".png");
			this.sprite = new PIXI.extras.TilingSprite(texture, 64, 64);
			this.sprite.position.x = this.sprite.position.y = -32;
		} else {
			var color = "0x"+color.substr(1);
		}

		this.setPosition({
			x: entityDef.x*this.block_size,
			y: entityDef.y*this.block_size
		});

		if(entityDef.asset!=null){
			this.graphics.addChild(this.sprite);
		} else {
			box.beginFill(color);
			box.lineStyle(0, color, 0.5);
			box.drawRect(-offset, -offset, this.block_size, this.block_size);
			this.graphics.addChild(box);
		}
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
		return;
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
		this.graphics = new PIXI.Container();

		this.mask = new PIXI.Graphics();
		this.mask.beginFill(this.color);
		this.mask.lineStyle(0, this.color);
		this.mask.position = new PIXI.Point(0,0);

		this.graphics.addChild(this.mask);

		this.radius = entityDef.radius;

		this.sprite = PIXI.Sprite.fromImage("assets/img/light-mask.png");
		this.sprite.position.x = this.sprite.position.y = -280;
		this.graphics.addChild(this.sprite);
		this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
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
			this.mask.drawPolygon(path);
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

BackgorundRender = Class.extend({
	graphics: null,
	world_width: Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE*64,
	init: function(){
		this.graphics = new PIXI.Container();

		this.underground = new PIXI.extras.TilingSprite(loader.resources.underground.texture, this.world_width, 370);
		this.underground.position.x = -32;
		this.underground.position.y = 800;

		this.graphics.addChild(this.underground);
	},
});

LandscapeRender = Class.extend({
	graphics: null,
	sprite: null,
	clouds: new Array(),
	mountains: new Array(),
	world_width: Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE*64,
	RDM: Math.random,
	init: function(){
		Math.seedrandom(Config.SEED);
		this.RDM = Math.random;
		this.graphics = new PIXI.Container();

		var box = new PIXI.Graphics();
		var offset = this.block_size/2;

		this.land = new PIXI.extras.TilingSprite(loader.resources.land.texture, this.world_width, 50);
		this.land.position.x = 0;
		this.land.position.y = 751;

		this.setPosition({
			x: 0,
			y: 0
		})

		this.cloudGenerator();
		this.mountainGenerator();
		this.skyBox = new PIXI.Sprite();
		this.skyBox.texture = loader.resources.sky.texture;
		this.skyBox.position.x = this.skyBox.position.y = -100;

		this.graphics.addChild(this.skyBox);

		for (var i = 0; i < this.clouds.length; i++) {
			this.graphics.addChild(this.clouds[i]);
		};

		this.mountains = shuffle(this.mountains);

		for (var i = 0; i < this.mountains.length; i++) {
			this.graphics.addChild(this.mountains[i]);
		};

		this.graphics.addChild(this.land);
	},
	mountainGenerator: function(){
		var spacing = 580;
		var nr_mountains = Math.ceil(this.world_width/1220);
		var last_mountain = null;
		for (var i = 0; i < nr_mountains; i++) {
			var mountain_spacing = Math.ceil(this.RDM()*2580);
			var mountain_position = -500;
			if(mountain_spacing<spacing){mountain_spacing=spacing;}
			if(last_mountain!==null){
				mountain_position = last_mountain.position.x + mountain_spacing;
			}
			last_mountain = this.createMountain(mountain_position);
		};
	},
	createMountain: function(x){
		var altitude = Math.ceil(this.RDM()*400);
		if(altitude<220){altitude=220;}
		var length = 1400;
		var texture = loader.resources.mountain_pattern.texture;

		var mount = new PIXI.Container();

		var mountain = new PIXI.extras.TilingSprite(texture, length*2, altitude);
		mountain.tilePosition.x = this.RDM()*1200;
		mountain.tilePosition.y = this.RDM()*600;

		var mask = new PIXI.Graphics();
		mask.beginFill(0x000000);
		mask.position = new PIXI.Point(0,0);
		// CREATE RANDOM MASK
		mask.moveTo(0, 0);
		mask.lineTo(length, 0);
		var peaks = Math.ceil(this.RDM()*10);
		if(peaks<=5){peaks=5;}
		var last_altitude = altitude;
		for (var i = length/1.8; i > -length/1.8; i-=length/peaks) {
			var peak_altitude = this.RDM()*-altitude*1.2;
			if(Math.abs(last_altitude/peak_altitude)>3){
				peak_altitude = last_altitude-altitude/10;
			}
			mask.lineTo(i, peak_altitude);
			last_altitude = peak_altitude;
		};
		mask.lineTo(-length/1.5, 0);

		mountain.addChild(mask);

		mountain.anchor.x = 0.5;
		mountain.anchor.y = 1;
		mountain.position.x = x;
		mountain.position.y = 760;

		var grayFilter = new PIXI.filters.GrayFilter();
		var sepiaFilter = new PIXI.filters.SepiaFilter();
		grayFilter.gray = this.RDM()*1;
		sepiaFilter.sepia = this.RDM()*1;

		mount.addChild(mountain);
		mount.mask = mask;
		mount.filters = [grayFilter, sepiaFilter];

		this.mountains.push(mount);
		return mountain;
	},
	cloudGenerator: function(){
		var spacing = 580;
		var nr_clouds = Math.ceil(this.world_width/spacing);
		var last_cloud = null;
		for (var i = 0; i < nr_clouds; i++) {
			var cloud_spacing = Math.ceil(this.RDM()*2580);
			var cloud_position = -500;
			if(cloud_spacing<spacing){cloud_spacing=spacing;}
			if(last_cloud!==null){
				cloud_position = last_cloud.position.x + cloud_spacing;
			}
			last_cloud = this.createCloud(cloud_position);
		};
	},
	createCloud: function(x){


		var cloud = new PIXI.Sprite();
		cloud.texture = loader.resources["cloud"+Math.ceil(this.RDM()*3)].texture;
		cloud.position.x = x;

		var altitude = Math.round(this.RDM()*460);
		if(altitude<52){altitude=52;}
		cloud.position.y = altitude;

		var scale_factor = 5;
		var min_scale = 0.6;
		if(altitude>120){
			scale_factor = 2;
			min_scale = 0.4;
		} else if(altitude>260){
			scale_factor = 0.6;
			min_scale = 0.3;
		} else if(altitude>260){
			scale_factor = 0.1;
			min_scale = 0.2;
		}
		var scale = Math.round(this.RDM()*scale_factor);
		if(scale<min_scale){scale=min_scale;} else if(scale>1){scale=1;}
		cloud.scale.x = cloud.scale.y = scale;

		this.clouds.push(cloud);
		return cloud;
	},
	setPosition: function(pos){
		this.graphics.position = new PIXI.Point(pos.x,pos.y);
	},
	remove: function(){
		var layer = render_engine.getLayer("landscape");
		layer.container.removeChild(this.graphics);
		this.graphics = null;
	},
	update: function(){
		var player_pos = game_engine.player.physBody.GetPosition();
		var sky_size = 6800;
		var world_size = this.world_width;
		var center_sky = (world_size/2 - sky_size/2) - 32;

		var delta = (player_pos.x*64)/(world_size/2);
		var new_pos = center_sky * delta + 32;
		this.skyBox.position.x = new_pos;

		for (var i = 0; i < this.clouds.length; i++) {
			this.clouds[i].position.x-=0.1;
			if(this.clouds[i].position.x<-500){this.clouds[i].position.x=this.world_width+500;}
		};
	}
});

FogRender = Class.extend({
	graphics: null,
	sprite: null,
	init: function(){
		this.graphics = new PIXI.Container();

		this.sprite = new PIXI.Sprite();
		this.sprite.texture = loader.resources.fog.texture;
		this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
		this.sprite.scale.x = this.sprite.scale.y = 0.55;
		this.sprite.position.x = 0;
		this.sprite.position.y = 0;
		this.graphics.alpha = 0;
		this.graphics.addChild(this.sprite);
	},
	setPosition: function(pos){
        this.sprite.position.x = pos.x*64;
        this.sprite.position.y = pos.y*64;
    },
});

RenderText = Class.extend({
	graphics: null,
	completed: false,
	init: function(text){
		var style = {
		    font : 'bold 36px Arial',
		    fill : '#FFFFFF',
		    align: 'center',
		    stroke : '#333333',
		    strokeThickness : 4,
		    dropShadow : true,
		    dropShadowColor : '#000000',
		    dropShadowAngle : Math.PI / 2,
		    dropShadowDistance : 5,
		    wordWrap : true,
		    wordWrapWidth : 240
		};

		this.graphics = new PIXI.Text(text, style);

	},
	update: function(){
		if(this.graphics.alpha<=0){
			this.completed = true;
			return false;
		}
		this.graphics.y-=3;
		this.graphics.alpha-=0.02;
	}
});

RenderLayer = Class.extend({
	container: null,
	init: function(){
		this.container = new PIXI.Container();
	},
	add: function(object){
		this.container.addChild(object.graphics);
	},
	remove: function(object){
		this.container.removeChild(object.graphics);
	},
	position: function(pos){
		this.container.position = pos;
	}
});

RenderEngine = Class.extend({
	stage: null,
	layers: new Object(),
	renderer: null,
	stage_size: {width: 460, height:680, scale:Config.SCALE},
	particles: null,
	text_stack: new Array(),
	init: function () {},
	build: function() {
		this.stage = new PIXI.Container();
		
		this.renderer = PIXI.autoDetectRenderer(this.stage_size.width, this.stage_size.height, { transparent: true });
		$("#world_container").append(this.renderer.view);


		this.addLayer("background");
		this.addLayer("light");
		this.addLayer("landscape");
		this.addLayer("debug");

		
		this.particles = new PIXI.Container();
		this.particles.position.x = this.particles.position.y = 0;
		this.stage.addChild(this.particles);


		this.addLayer("shops");
		this.addLayer("player");
		this.addLayer("debry");
		this.addLayer("blocks");
		this.addLayer("fog");
		this.addLayer("text");

		this.applyScale();
	},
	setWidth: function(width){
		this.stage_size.width = width;
		this.renderer.resize(width,this.stage_size.height);
		//this.fog.update();
	},
	setHeight: function(height){
		this.stage_size.height = height;
		this.renderer.resize(this.stage_size.width,height);
		//this.fog.update();
	},
	setScale: function(scale){
		this.stage_size.scale = scale;
		this.applyScale();
		//this.fog.update();
	},
	applyScale: function(){
		var scale = new PIXI.Point(this.stage_size.scale,this.stage_size.scale);
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.container.scale = scale;
		}
		this.particles.scale = scale;
	},
	stagePosition: function(pos){
		var offset_value = this.stage_size.scale*32;
		var offset = {'x':offset_value, 'y':offset_value};
		var new_pos = new PIXI.Point(pos.x+offset.x,pos.y+offset.y);
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.position(new_pos);
		}
		this.particles.position = new_pos;
	},
	addParticle: function(particle){
		this.particles.addChild(particle);
	},
	removeParticle: function(particle){
		this.particles.removeChild(particle);
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
	addMask: function(){
		var mask = new WorldMask();
		this.stage.mask = mask.graphics;
		return mask;
	},
	addLight: function(entityDef){
		var light_layer = this.getLayer("light");
		var light = new LightRender(entityDef);
		light_layer.add(light);
		return light;
	},
	addFog: function(){
		var fog_layer = this.getLayer("fog");
		var fog = new FogRender();
		fog_layer.add(fog);
		return fog;
	},
	buildBackground: function(){
		var background_layer = this.getLayer("background");
		var background = new BackgorundRender();
		background_layer.add(background);
		return background;
	},
	buildLandscape: function(){
		var landscape_layer = this.getLayer("landscape");
		var landscape = new LandscapeRender();
		landscape_layer.add(landscape);
		return landscape;
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
	addShop: function(entityDef, color){
		var shop_layer = this.getLayer("shops");
		var shop = new ShopRender(entityDef, color);
		shop_layer.add(shop);
		return shop;
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
	addText: function(msg){
		var text_layer = this.getLayer("text");
		var text = new RenderText(msg);
		text_layer.add(text);
		this.text_stack.push(text);
		return text;
	},
	registerBody: function (entity) {
		var entity = this.stage.add(entity);
		return entity;
	},
	unregisteBody: function (obj) {
		this.stage.DestroyBody(obj);
		return null;
	},
	clearText: function(){
		var clear = new Array();
		var text_layer = this.getLayer("text");
		for (var i = 0; i < this.text_stack.length; i++) {
			this.text_stack[i].update();
			if(this.text_stack[i].completed){
				clear.push(i);
			}
		};
		for (var i = 0; i < clear.length; i++) {
			text_layer.remove(this.text_stack[clear[i]]);
			this.text_stack.splice(clear[i], 1);
		};
	},
	update:function(){
		this.clearText();
		this.renderer.render(this.stage);
	}
});

render_engine = new RenderEngine();