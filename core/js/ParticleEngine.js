ParticleEngine = Class.extend({
	proton: null,
	renderer: null,
	init: function(){
		this.proton = new Proton();
	},
	build: function(){
		var _self = this;
		_self.renderer = new Proton.Renderer('other', this.proton);

		_self.renderer.onParticleCreated = function(particle) {
			var particleSprite = new PIXI.Sprite(particle.target);
			particle.sprite = particleSprite;
			render_engine.addParticle(particle.sprite);
		};

		_self.renderer.onParticleUpdate = function(particle) {
			_self.transformSprite(particle.sprite, particle);
		};

		_self.renderer.onParticleDead = function(particle) {
			render_engine.removeParticle(particle.sprite);
		};

		_self.renderer.start();
		_self.renderer.blendFunc("SRC_ALPHA", "ONE");
	},
	transformSprite: function(particleSprite, particle) {
		particleSprite.position.x = particle.p.x;
		particleSprite.position.y = particle.p.y;
		particleSprite.scale.x = particle.scale;
		particleSprite.scale.y = particle.scale;
		particleSprite.anchor.x = 0.5;
		particleSprite.anchor.y = 0.5;
		particleSprite.alpha = particle.alpha;
		particleSprite.rotation = particle.rotation*Math.PI/180;
		particleSprite.tint = '0x' + rgbToHex(particle.transform.rgb.r, particle.transform.rgb.g, particle.transform.rgb.b);
	},
	update: function () {
		this.proton.update();
	},
	addEmitter: function(emitter){
		this.proton.addEmitter(emitter);
	}
});

var particle_engine = new ParticleEngine();