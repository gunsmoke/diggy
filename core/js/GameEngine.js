GameEngine = Class.extend({
	entities: [],
	player: null,
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
			physics_engine.debug(document.getElementById("debug_canvas").getContext("2d"),2);
		}
		
		this.player = new Player();

		world_engine.follow(this.player);

		// INPUTS
		window.addEventListener('keydown', this.keydown, false);
    	window.addEventListener('keyup', this.keyup, false);
	},
	bindings: function() {
		input_engine.bind(input_engine.KEYS.W, 'move-up');
		input_engine.bind(input_engine.KEYS.S, 'move-down');
		input_engine.bind(input_engine.KEYS.A, 'move-left');
		input_engine.bind(input_engine.KEYS.D, 'move-right');
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
		world_engine.build();
		render_engine.build();
		if(Config.LIGHTS){
			light_engine.build();
		}
	},
	run: function() {
		this.handleUserInteractions();
		this.update();
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
		var speed = 0.4;
		this.player.physBody.SetAngularVelocity(0);
		var vel = this.player.physBody.GetLinearVelocity();
		// up/down arrow
		if (input_engine.state('move-up')){
			vel.y-=speed;
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
	update: function () {
		this.player.update();
		physics_engine.update();
		world_engine.update();
		if(Config.LIGHTS){
			light_engine.update();
		}
		
		render_engine.update();
		input_engine.update();
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