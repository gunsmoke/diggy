Component = Class.extend({
	name: 'undefined',
	description: '',
	costBase: 30000,
	icon: '',
	tier: 1,
	maxTier: 5,
	$el: undefined,
	init: function(settings) {
		var _self = this;
		this.button = $('<button class="btn btn-default btn-lg btn-block"></button>')
		this.$el = $('<div class="col-md-6"></div>');
		this.button.on('click', function(){
			_self.purshase();
		});
	},
	cost: function(){
		return Math.round(this.costBase * Math.exp(this.tier-this.maxTier))
	},
	purshase: function(){
		if(this.tier > this.maxTier){return false;}
		if(game_engine.player.cash<this.cost()){return false}
		game_engine.player.cash-=this.cost();
		var text = render_engine.addText("-"+ this.cost() + "$");
		text.graphics.x = game_engine.player.pos.x-52;
		text.graphics.y = game_engine.player.pos.y-32;
		this.upgrade();
	},
	upgrade: function(){
		if(this.tier > this.maxTier){return false;}
		this.tier++;
		this.upgradePlayer();
		this.button.html(this.renderButtonText());
	},
	renderButtonText: function(){
		if(this.tier > this.maxTier){
			this.button.attr("disabled", true);
			return '<span class="label label-default">tier '+ this.maxTier +'</span> '+ this.name ;
		}
		this.button.attr("disabled", false);
		return '<span class="label label-info">tier '+ this.tier +'</span> '+ this.name + ': <span>' + this.cost() + '</span>$';
	},
	upgradePlayer: function(){

	},
	render: function(){
		this.button.html(this.renderButtonText());
		this.$el.append(this.button);
		return this;
	},
});


DrillComponent = Component.extend({
	name: 'Drill',
	description: '',
	costBase: 50000,
	upgradePlayer: function(){
		var tierValues = [1, 2, 3, 4, 5];
		var value = tierValues[this.tier-2];
		game_engine.player.damageModifier = value;
	},
});


FuelComponent = Component.extend({
	name: 'Fuel Cell',
	costBase: 60000,
	upgradePlayer: function(){
		var tierValues = [250, 600, 1000, 1500, 2000];
		var value = tierValues[this.tier-2];
		game_engine.player.maxFuel = value;
		game_engine.player.fuel = value;
	},
});


HullComponent = Component.extend({
	name: 'Hull Armor',
	upgradePlayer: function(){
		var tierValues = [200, 350, 500, 1000, 2000];
		var value = tierValues[this.tier-2];
		game_engine.player.maxHealth = value;
		game_engine.player.health = value;
	},
});


CoolantComponent = Component.extend({
	name: 'Coolant',
	upgradePlayer: function(){
		var tierValues = [100, 250, 500, 1000, 3000];
		var value = tierValues[this.tier-2];
		game_engine.player.maxTemprature = value;
	},
});


CargoComponent = Component.extend({
	name: 'Cargo Hull',
	upgradePlayer: function(){
		var tierValues = [20, 50, 150, 500, 1000];
		var value = tierValues[this.tier-2];
		game_engine.player.cargoMax = value;
	},
});


RadarComponent = Component.extend({
	name: 'Radar',
	costBase: 30000,
	maxTier: 3,
	upgradePlayer: function(){
		var tierValues = [2.1, 1.8, 1.5];
		var value = tierValues[this.tier-2];
		game_engine.player.radarModifier = value;
	},
});

