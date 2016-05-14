GameEngine = Class.extend({
	entities: [],
	player: null,
	score: 0,
	tick: 0,
	_lasthudtick: 0,
	init: function () {
	},
	setup: function () {
		// setup
		world_engine.setup({
			offset: {x:0, y:0}
		});
		// build
		this.build();
		// bind
		this.bindings();
		// register contact listeners
		this.contactListeners();
		// Debug Mode
		if(Config.DEBUG){
			physics_engine.debug(document.getElementById("debug_canvas").getContext("2d"), 7);
		}

		var total_possible_blocks = (Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE) * (Config.MAX_CHUNKS_SIZE.Y*Config.CHUNK_SIZE);
		$(".mpb").text(total_possible_blocks);
		
		this.player = new Player(Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE/2,6);

		world_engine.follow(this.player);


		this.shop_view = new ShopView();

		// INPUTS
		window.addEventListener('keydown', this.keydown, false);
    	window.addEventListener('keyup', this.keyup, false);

    	$(window).on("mousewheel DOMMouseScroll", function(event){
			event.preventDefault();	
			var delta = event.originalEvent.wheelDelta/120 || -event.originalEvent.detail/3;

			var current_scale = render_engine.stage_size.scale;
			if(delta>0){
				current_scale+=0.01;
			} else {
				current_scale-=0.01;
			}
			render_engine.setScale(current_scale);
		});
	},
	bindings: function() {
		// MOVEMENT WASD
		input_engine.bind(input_engine.KEYS.W, 'move-up');
		input_engine.bind(input_engine.KEYS.S, 'move-down');
		input_engine.bind(input_engine.KEYS.A, 'move-left');
		input_engine.bind(input_engine.KEYS.D, 'move-right');
		// MOVMENT ARROWS
		input_engine.bind(input_engine.KEYS.UP_ARROW, 'move-up');
		input_engine.bind(input_engine.KEYS.DOWN_ARROW, 'move-down');
		input_engine.bind(input_engine.KEYS.LEFT_ARROW, 'move-left');
		input_engine.bind(input_engine.KEYS.RIGHT_ARROW, 'move-right');

		input_engine.bind(input_engine.KEYS.SPACE, 'digg');
	},
	contactListeners: function() {
		physics_engine.addContactListener({
			PostSolve: function(bodyA, bodyB, impulse) {
				// TODO: do some logic to skip this with return false
				game_engine.onCollisionTouch(bodyA,bodyB,impulse);
			}
		});
	},
	build: function() {
		physics_engine.build();
		render_engine.build();
		particle_engine.build();
		world_engine.build();
		if(Config.LIGHTS){
			light_engine.build();
		}
	},
	run: function() {
		this.handleUserInteractions();
		this.update();
	},
	getPlayerDistance: function(pos,radius){
		var distance = Math.abs(lineDistance(pos,this.player.pos));
		var distance = (distance-64)/radius; if(distance<0) distance=0;
		return distance;
	},
	onCollisionTouch: function(bodyA, bodyB, impulse) {
		if(impulse<0.2) return;
		var uA = bodyA?bodyA.GetUserData():null;
		var uB = bodyB?bodyB.GetUserData():null;
		if (uA != null) {
			if (uA.ent != null && uA.ent.onTouch) {
				uA.ent.onTouch(bodyB, impulse);
			}
		}
		if (uB != null) {
			if (uB.ent != null && uB.ent.onTouch) {
				uB.ent.onTouch(bodyA, impulse);
			}
		}
	},
	handleUserInteractions: function() {
		var speed = 0.3;
		this.player.physBody.SetAngularVelocity(0);
		var vel = this.player.physBody.GetLinearVelocity();
		
		var limit_speed = 5;
		// limit
		if(vel.x > limit_speed){
			vel.x = limit_speed;
		}
		if(vel.x < -limit_speed){
			vel.x = -limit_speed;
		}

		if(this.player.isDead){
			return false;
		}

		// up/down arrow
		if (input_engine.state('move-up')){
			if(this.player.canFly()){
				vel.y-=speed*1;
				this.player.trustAnim();
			}
		}
		if (input_engine.state('move-down')){
			vel.y+=speed;	
		}

		// left/right arrows
		if (input_engine.state('move-left')){
			vel.x-=speed;
		}
		if (input_engine.state('move-right')){
			vel.x+=speed;
		}

	},
	get_player_depth: function(){
		var depth = Math.floor((Math.ceil(this.player.pos.y) - 768)/10);
		if(depth<0){depth=0;}
		return depth
	},
	open_shop: function(){
		this.shop_view.open();
	},
	close_shop: function(){
		this.shop_view.close();
	},
	updateHUD: function(){
		var hudtick = Math.floor(this.tick/15);
		if(hudtick>this._lasthudtick){
			// player health
			var health = this.player.health * 100 / this.player.maxHealth;
			$("#health .progress-bar").width(health+"%").text(this.player.health);

			// player fuel
			var fuel = Math.floor(this.player.fuel * 100 / this.player.maxFuel) + "%";
			$("#fuel .progress-bar").width(fuel).text(fuel);

			// player temprature
			var temp = this.player.temprature;
			var ptemp = Math.ceil(temp/this.player.maxTemprature*100);
			if(ptemp>100){
				ptemp = 100;
			}
			$("#temprature .progress-bar").width(ptemp+"%").text(temp+"C");

			// player depth
			var depth = this.player.depth;
			if(depth/1000>1){
				depth = (depth/1000).toFixed(2) + "km";
			} else {
				depth = depth + "m";
			}
			$("#depth").text(depth);

			// player cargo
			var cargo = this.player.cargo_sum();
			var pcargo = Math.ceil(cargo/this.player.cargoMax*100);
			if(pcargo>100){
				pcargo = 100;
			}
			$("#cargo .progress-bar").width(pcargo+"%").text(pcargo+"%");

			// cash
			$("#score").text(this.score);
			// score
			$("#cash").text(this.player.cash+" $");

			this._lasthudtick = hudtick;
		}
	},
	update: function () {
		this.player.update();
		this.shop_view.update();
		physics_engine.update();
		world_engine.update();	
		render_engine.update();
		particle_engine.update();	
		input_engine.update();

		this.player.depth = this.get_player_depth();
		if(this.player.markForDeath){
			console.log("GAME OVER")
			render_engine.deadFilter();
			this.player.kill();
		}

		this.updateHUD();
		this.tick++;
	},
	keydown: function (event) {
		if (event.target.type == 'text') {return;}
		// fire the input engine down event
		input_engine.onKeyDownEvent(event.keyCode, event);
	},
	keyup: function (event) {
		if (event.target.type == 'text') {return;}
		input_engine.onKeyUpEvent(event.keyCode, event);
	}
});

game_engine = new GameEngine();