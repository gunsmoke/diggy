Player = Entity.extend({
	physBody: null,
	render: null,
	light: null,
	health: 100,
	maxHealth: 100,
	fuel: 100,
	maxFuel: 100,
	isDead:false,
	digging: false,
	touching_block: false,
	emitters: {},
	zIndex: 1,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		var entityDef = {
			id: "player",
			x: this.pos.x,
			y: this.pos.y,
			radius:0.48,
			allowSleep: false,
			userData: {
				"id": "player",
				"ent": this
			}
		};

		this.render = render_engine.addPlayer(entityDef);
		this.physBody = physics_engine.addBody(entityDef);
		this.light = light_engine.addLight(entityDef);




		this.diggingAnimation();

		this.rocketAnimation();
	},
	rocketAnimation: function(){
		this.emitters.rocket = new Proton.BehaviourEmitter();

		var particle = new PIXI.Texture.fromImage("assets/img/particle.png");

		this.emitters.rocket.rate = new Proton.Rate(new Proton.Span(5, 5), new Proton.Span(.01));

		this.emitters.rocket.addInitialize(new Proton.ImageTarget(particle));
		this.emitters.rocket.addInitialize(new Proton.Mass(1));
		this.emitters.rocket.addInitialize(new Proton.Life(0.5, 0.6));
		this.emitters.rocket.addInitialize(new Proton.Velocity(new Proton.Span(5, 2), new Proton.Span(0, 0), 'polar'));
		this.emitters.rocket.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 1), 0));
		this.emitters.rocket.addBehaviour(new Proton.G(6));
		this.emitters.rocket.addBehaviour(new Proton.Alpha(0.28, 0));
		this.emitters.rocket.addBehaviour(new Proton.Color('#826C2B', ['#EDCE72', '#5A7000'], Infinity, Proton.easeOutSine));
		this.emitters.rocket.p.x = 0;
		this.emitters.rocket.p.y = 0;
		this.emitters.rocket.rotation = 180;

		particle_engine.addEmitter(this.emitters.rocket);
	},
	diggingAnimation: function(){


		this.emitters.smoke = new Proton.BehaviourEmitter();
		this.emitters.debry = new Proton.BehaviourEmitter();

		var smoke_texture = new PIXI.Texture.fromImage("assets/img/smoke.png");

		this.emitters.smoke.rate = new Proton.Rate(new Proton.Span(5, 20), new Proton.Span(0.1));
		this.emitters.smoke.addInitialize(new Proton.Mass(1));
		this.emitters.smoke.addInitialize(new Proton.ImageTarget(smoke_texture));
		this.emitters.smoke.addInitialize(new Proton.Life(0.5, 1));
		this.emitters.smoke.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(0, 100, true), 'polar'));

		this.emitters.smoke.addBehaviour(new Proton.Gravity(3));
		this.emitters.smoke.addBehaviour(new Proton.Scale(new Proton.Span(0.01, 0.1), 0.5));
		this.emitters.smoke.addBehaviour(new Proton.Alpha(0.28, 0));
		this.emitters.smoke.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
		this.emitters.smoke.p.x = 0;
		this.emitters.smoke.p.y = 0;
		
		this.emitters.smoke.addSelfBehaviour(new Proton.RandomDrift(40, 20, .5));

		var debry_texture = new PIXI.Texture.fromImage("assets/img/debry1.png");

		this.emitters.debry.rate = new Proton.Rate(new Proton.Span(1, 5), new Proton.Span(0.1));
		this.emitters.debry.addInitialize(new Proton.Mass(1));
		this.emitters.debry.addInitialize(new Proton.ImageTarget(debry_texture));
		this.emitters.debry.addInitialize(new Proton.Life(0.4, 0.6));
		this.emitters.debry.addInitialize(new Proton.Velocity(new Proton.Span(1, 1), new Proton.Span(1, 42, true), 'polar'));

		this.emitters.debry.addBehaviour(new Proton.Gravity(3));
		this.emitters.debry.addBehaviour(new Proton.Scale(new Proton.Span(0.01, 0.08), 0.5));
		this.emitters.debry.addBehaviour(new Proton.Alpha(1, 0.15));
		this.emitters.debry.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-2, 3), 'add'));

		this.emitters.debry.p.x = 0;
		this.emitters.debry.p.y = 0;

		particle_engine.addEmitter(this.emitters.smoke);
		particle_engine.addEmitter(this.emitters.debry);
	},
	diggAnim: function(){
		if(this.emitters.smoke.emitTime>0.55){
			this.emitters.smoke.emit(0.5);
			this.emitters.debry.emit(0.4);
		}
	},
	trustAnim: function(){
		if(this.emitters.rocket.emitTime>0.3){
			this.emitters.rocket.emit(0.3);
		}
	},
	handleActions: function(){
		if(input_engine.state('digg') && !input_engine.state('move-up')){
			this.digging = true;
		} else {
			this.digging = false;
		}
	},
	isDigging: function(){
		return this.digging;
	},
	update: function(){
		this.handleActions();
		//var velocity = this.physBody.GetLinearVelocity();
		var position = this.physBody.GetPosition();
		var render = this.render;
		var player_size = 64;
		this.pos = {
			x: (position.x*player_size)+2,
			y: (position.y*player_size)+2
		}
		render.setPosition(this.pos);

		this.emitters.smoke.p.x = this.emitters.debry.p.x = this.pos.x;
		this.emitters.smoke.p.y = this.emitters.debry.p.y = this.pos.y;

		this.emitters.rocket.p.x = this.pos.x;
		this.emitters.rocket.p.y = this.pos.y + 28;

		this.light.setPosition(this.physBody.GetPosition());
	}
});