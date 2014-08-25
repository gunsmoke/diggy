GameEngine = Class.extend({
	entities: [],
	player: null,
	tick: 0,
	init: function () {},
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
			physics_engine.debug(document.getElementById("debug_canvas").getContext("2d"),12);
		}

		var total_possible_blocks = (Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE) * (Config.MAX_CHUNKS_SIZE.Y*Config.CHUNK_SIZE);
		$(".mpb").text(total_possible_blocks);
		
		this.player = new Player(Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE/2,6);

		world_engine.follow(this.player);

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
		// up/down arrow
		if (input_engine.state('move-up')){
			vel.y-=speed*0.7;
			this.player.trustAnim();
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

		var limit_speed = 5;
		// limit
		if(vel.x > limit_speed){
			vel.x = limit_speed;
		}
		if(vel.x < -limit_speed){
			vel.x = -limit_speed;
		}
	},
	get_player_depth: function(){
		var depth = Math.floor((Math.ceil(this.player.pos.y) - 452)/10);
		if(depth<0){depth=0;}
		return depth
	},
	debug_monitor: function() {

		var depth = this.get_player_depth();
		/*
		if(depth>50){
			Config.DRAW_DISTANCE = 13;
		} else if(depth>250){
			Config.DRAW_DISTANCE = 11;
		} else {
			Config.DRAW_DISTANCE = 17;
		}
		*/
		if(depth/1000>1){
			depth = (depth/1000).toFixed(2) + "km";
		} else {
			depth = depth + "m";
		}

		$("#debug_monitor .depth").text(depth);
	},
	update: function () {
		this.player.update();
		physics_engine.update();
		world_engine.update();	
		render_engine.update();
		particle_engine.update();	
		input_engine.update();

		this.debug_monitor();
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