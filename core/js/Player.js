Player = Entity.extend({
	physBody: null,
	render: null,
	light: null,
	health: 100,
	maxHealth: 100,
	fuel: 100,
	maxFuel: 100,
	isDead:false,
	state: {},
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

		this.emitters.rocket.rate = new Proton.Rate(new Proton.Span(5, 5), new Proton.Span(.01));

		this.emitters.rocket.addInitialize(new Proton.ImageTarget(loader.resources.particle.texture));
		this.emitters.rocket.addInitialize(new Proton.Mass(1));
		this.emitters.rocket.addInitialize(new Proton.Life(0.1, 0.6));
		this.emitters.rocket.addInitialize(new Proton.Velocity(new Proton.Span(.5, .2), new Proton.Span(0, 0), 'polar'));
		this.emitters.rocket.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 1), 0));
		this.emitters.rocket.addBehaviour(new Proton.G(6));
		this.emitters.rocket.addBehaviour(new Proton.Alpha(0.28, 0));
		this.emitters.rocket.addBehaviour(new Proton.Color('#096680', ['#3ED1FA', '#D2B9ED'], Infinity, Proton.easeOutSine));
		this.emitters.rocket.p.x = 0;
		this.emitters.rocket.p.y = 0;
		this.emitters.rocket.rotation = 180;

		particle_engine.addEmitter(this.emitters.rocket);
	},
	diggingAnimation: function(){


		this.emitters.smoke = new Proton.BehaviourEmitter();
		this.emitters.debry = new Proton.BehaviourEmitter();

		this.emitters.smoke.rate = new Proton.Rate(new Proton.Span(5, 20), new Proton.Span(0.1));
		this.emitters.smoke.addInitialize(new Proton.Mass(1));
		this.emitters.smoke.addInitialize(new Proton.ImageTarget(loader.resources.smoke.texture));
		this.emitters.smoke.addInitialize(new Proton.Life(0.5, 1));
		this.emitters.smoke.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(0, 100, true), 'polar'));

		this.emitters.smoke.addBehaviour(new Proton.Gravity(3));
		this.emitters.smoke.addBehaviour(new Proton.Scale(new Proton.Span(0.01, 0.1), 0.5));
		this.emitters.smoke.addBehaviour(new Proton.Alpha(0.28, 0));
		this.emitters.smoke.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
		this.emitters.smoke.p.x = 0;
		this.emitters.smoke.p.y = 0;
		
		this.emitters.smoke.addSelfBehaviour(new Proton.RandomDrift(40, 20, .5));

		this.emitters.debry.rate = new Proton.Rate(new Proton.Span(1, 5), new Proton.Span(0.1));
		this.emitters.debry.addInitialize(new Proton.Mass(1));
		this.emitters.debry.addInitialize(new Proton.ImageTarget(loader.resources.debry.texture));
		this.emitters.debry.addInitialize(new Proton.Life(0.1, 0.6));
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
		if(this.emitters.debry.emitTime>0.60){
			audio_engine.playSound("drill");
			this.emitters.debry.emit(0.6);
		}
		if(this.emitters.smoke.emitTime>0.55){
			this.emitters.smoke.emit(0.5);
		}
		
	},
	trustAnim: function(){
		if(this.emitters.rocket.emitTime>0.3){
			audio_engine.playSound("thrust");
			this.emitters.rocket.emit(0.3);
		}
	},
	isDigging: function(){
		return this.state.digging;
	},
	stateMachine: function(){

		var velocity = this.physBody.GetLinearVelocity();
		if(velocity.x < 0.4 && velocity.x > -0.4) {
			this.state.right = false;
			this.state.left = false;
		} else if(velocity.x > 0.4) {
			this.state.right = true;
			this.state.left = false;
		} else {
			this.state.right = false;
			this.state.left = true;
		}

		if(velocity.y<=-1){
			this.state.flying = true;
			this.state.falling = false;
		} else if(velocity.y>0.8) {
			this.state.flying = false;
			this.state.falling = true;
		} else {
			this.state.flying = false;
			this.state.falling = false;
		}

		// DEFAULTS
		if(this.state.falling && this.state.flying && this.state.left && this.state.right){
			this.state.digging = false;
		} else {

			if(input_engine.state('digg') && !input_engine.state('move-up'))
			{
				this.state.digging = true;
			} else {
				this.state.digging = false;
			}
		}
	},
	anim: function(){

		if(this.state.digging){
			if(!this.is_digging){
				this.render.spine.state.setAnimationByName(0, 'digg_down', true);
			}
			this.is_digging = true;
			return;
		} else {
			this.is_digging = false;
		}

		if(this.state.flying){
			if(!this.is_flying){
        		this.render.spine.state.setAnimationByName(0, 'fly', true);
			}
			this.is_flying = true;
		} else {
			this.is_flying = false;
		}
		if(this.state.falling){
			if(!this.is_falling){
				this.render.spine.state.setAnimationByName(0, 'fall', true);
			}
			this.is_falling = true;
		} else {
			this.is_falling = false;
		}
		if(!this.is_falling && !this.is_flying){
			if(this.state.right){
				if(!this.is_right){
					this.render.spine.state.setAnimationByName(0, 'walk_right', true);
				}
				this.is_right = true;
			} else {
				this.is_right = false;
			}
			if(this.state.left){
				if(!this.is_left){
					this.render.spine.state.setAnimationByName(0, 'walk_left', true);
				}
				this.is_left = true;
			} else {
				this.is_left = false;
			}
		} else {
			this.is_right = false;
			this.is_left = false;
		}

		if(!this.is_flying && !this.is_falling && !this.is_left && !this.is_right && !this.is_digging){
			if(!this.is_idle){
				this.render.spine.state.setAnimationByName(0, 'standby', true);
			}
			this.is_idle = true;
		} else {
			this.is_idle = false;
		}

		if(this.is_idle && input_engine.state('move-up')){
			if(!this.is_jump){
				this.render.spine.state.setAnimationByName(0, 'jump', false);
			}
			this.is_jump = true;
		} else {
			this.is_jump = false;
		}
	},
	update: function(){
		//console.log(this.state);
		this.anim();
		var position = this.physBody.GetPosition();
		var player_size = 64;
		this.pos = {
			x: (position.x*player_size)+2,
			y: (position.y*player_size)+2
		}
		this.render.setPosition(this.pos);

		this.emitters.smoke.p.x = this.emitters.debry.p.x = this.pos.x;
		this.emitters.smoke.p.y = this.emitters.debry.p.y = this.pos.y;

		this.emitters.rocket.p.x = this.pos.x;
		this.emitters.rocket.p.y = this.pos.y + 12;

		this.light.setPosition(this.physBody.GetPosition());

		this.stateMachine();

	}
});