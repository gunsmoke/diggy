Light = Entity.extend({
	render: null,
	radius: 0,
	angle_spread: 360,
	angle: 0,
	zIndex: 1,
	init: function(radius, settings) {
		this._super(0, 0, settings);
		this.radius = radius;
		var entityDef = {
			id: "light",
			x: this.pos.x,
			y: this.pos.y,
			radius:radius
		};
		this.render = render_engine.addLight(entityDef);
	},
	setPoints: function(points){
		this.render.setPoints(points);
	},
	setPosition: function(pos){
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.render.setPosition(pos);
	},
	update: function(){
	
	}
});