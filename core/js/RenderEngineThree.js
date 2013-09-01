PlayerRender = Class.extend({
	mesh: null,
	sphere: null,
	material: null,
	player_size: 28,
	init: function(entityDef){
		var segments = 22, rings = 22;
		
		this.material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
		this.sphere = new THREE.SphereGeometry(this.player_size, segments, rings);
		this.sphere.castShadow=true;
		this.mesh = new THREE.Mesh(this.sphere, this.material);
	},
	setPosition: function(pos){
		this.mesh.position.x = pos.x;
		this.mesh.position.y = pos.y;
	}
});

BlockRender = Class.extend({
	mesh: null,
	cube: null,
	material: null,
	block_size: 64,
	init: function(entityDef, color){

		var offset = this.block_size/2;
		var color = parseInt('0x'+color.substr(1));
		this.material = new THREE.MeshLambertMaterial({ color: color, transparent:true });
		this.cube = new THREE.CubeGeometry(this.block_size+1, this.block_size+1, this.block_size);
		this.mesh = new THREE.Mesh(this.cube, this.material);

		this.mesh.position.x = entityDef.x*this.block_size;
		this.mesh.position.y = entityDef.y*this.block_size;
		this.mesh.position.z = Math.random()*(this.block_size/2);
	},
	setPosition: function(pos){
		this.mesh.position.x = pos.x;
		this.mesh.position.y = pos.y;
	},
	remove: function(){
		render_engine.stage.remove(this.mesh);
		this.mesh = null;
	},
	setOpacity: function(opacity){
		this.material.opacity = opacity;
	}
});

LightRender = Class.extend({
	point: null,
    color: 0xffffff,
	radius: null,
	shineLight: false,
	init: function(entityDef){
		this.point = new THREE.PointLight(this.color,1,300);
	},
    setPosition: function(pos){
    	this.point.position.x = pos.x;
		this.point.position.y = pos.y;
		this.point.position.z = -100;
    },
    setPoints: function(path){
    	return;
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
	position: function(pos){
		this.container.position = new PIXI.Point(pos.x,pos.y);
	}
});

RenderEngine = Class.extend({
	stage: null,
	camera: null,
	layers: new Object(),
	renderer: null,
	stage_size: {width: 500, height:500, scale:0.8},
	init: function () {},
	build: function() {
		this.stage = new THREE.Scene();
		this.stage.fog = new THREE.FogExp2( 0x0F0A00, 0.00005 );
		//	this.renderer = PIXI.autoDetectRenderer(this.stage_size.width, this.stage_size.height);
		this.renderer = new THREE.WebGLRenderer();
		
		$("#world_container").append(this.renderer.domElement);

		// build camera
		this.camera = new THREE.PerspectiveCamera(76, this.getAspect(), 0.1, 1000);

		this.camera.position.z = -500;
		this.camera.rotation.z = this.camera.rotation.y = Math.PI;
		this.camera.updateProjectionMatrix();
		this.stage.add(this.camera);

		this.renderer.setSize(this.stage_size.width, this.stage_size.height);
	},
	getAspect: function(){
		return 4/2;
	},
	setWidth: function(width){
		this.stage_size.width = width;
		this.renderer.setSize(width,this.stage_size.height);
		this.camera.aspect = this.getAspect();
	},
	setHeight: function(height){
		this.stage_size.height = height;
		this.renderer.setSize(this.stage_size.width,height);
		this.camera.aspect = this.getAspect();
	},
	setScale: function(scale){
		var scale = new PIXI.Point(scale,scale);
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.container.scale = scale;
		}
	},
	stagePosition: function(pos){
		return;
		for(var layer in this.layers){
			var layer = this.getLayer(layer);
			layer.position(pos);
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
		var light = new LightRender(entityDef);
		this.stage.add(light.point);
		return light;
	},
	addPlayer: function(entityDef){
		var player = new PlayerRender(entityDef);
		this.stage.add(player.mesh);
		return player;
	},
	addBlock: function(entityDef, color){
		var block = new BlockRender(entityDef, color);
		this.stage.add(block.mesh);
		return block;
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

		this.camera.position.x = game_engine.player.pos.x;
		this.camera.position.y = game_engine.player.pos.y;


		this.renderer.render(this.stage, this.camera);
	}
});

render_engine = new RenderEngine();