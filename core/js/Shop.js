Shop = Entity.extend({
	physBody: null,
	render: null,
	asset: null,
	init: function(inputx, inputy, settings) {
		this._super(inputx, inputy, settings);
		this.pos = {x:inputx, y:inputy};
	},
	getEntityDef: function(){
		return {
			id: "shop",
			x: this.pos.x,
			y: this.pos.y,
			asset: this.asset,
			type: "static",
			width: 1.5,
			height: 0.5,
			userData: {
				"id": "shop",
				"ent": this
			}
		}
	},
	onTouch: function(body, impulse) {},
	enable: function(){
		this.enableRender();
		this.enablePhysics();
	},
	disable: function(){
		this.disablePhysics();
		this.disableRender();
	},
	enablePhysics: function(){
		if(this.physBody!=null) return;
		this.physBody = physics_engine.addBody(this.getEntityDef());
	},
	disablePhysics: function(){
		// remove physics body
		if(this.physBody==null) return;
		physics_engine.unregisterBody(this.physBody);
		this.physBody = null;
	},
	enableRender: function(){
		if(this.render!=null) return;
		this.render = render_engine.addShop(this.getEntityDef());
	},
	disableRender: function(){
		// remove render object
		if(this.render==null) return;
		this.render.remove();
		this.render = null;
	},
	update: function(){
		this._super();
		if(this.render==null) return;
	}
});

SellShop = Shop.extend({
	asset: 'sellshop',
	text_stack: new Array(),
	onTouch: function(body, impulse) {
		var u = body?body.GetUserData():null;
		if(u!==null){
			if(u.id=="player"){

				
				if(impulse>1){
					audio_engine.playSound("land1");
				}
				
				if(u.ent.is_idle && impulse<0.3){
					this.buyFrom(u.ent);
				}
			}
		}
		
	},
	itemsValue: function(item, quantity){
		if(item==10){ return 50 * quantity; }
		if(item==11){ return 100 * quantity; }
		if(item==12){ return 250 * quantity; }
		if(item==13){ return 500 * quantity; }
		if(item==14){ return 1000 * quantity; }
		if(item==15){ return 5000 * quantity; }
		return 0;
	},
	buyFrom: function(player){
		if(game_engine.tick - this.last_pur_tick < 10){return false;} // RATE LIMIT

		if(player.cargo.length>0){
			var object = player.cargo.pop();
			var item = object['item'];
			var quantity = object['quantity'];
			var value = this.itemsValue(item, quantity);
			player.cash+=value;
			game_engine.score+=value*2;
			this.createText(item, quantity);
		}
		this.last_pur_tick = game_engine.tick;
	},
	createText: function(item, quantity){
		if(this.render==null) return;
		var label = "";
		if(item==10){label="Coal";}
		if(item==11){label="Iron";}
		if(item==12){label="Gold";}
		if(item==13){label="Emerald";}
		if(item==14){label="Lapis";}
		if(item==15){label="Diamond";}
		var text = render_engine.addText(quantity+"x "+ label);
		text.graphics.x = game_engine.player.pos.x-70;
		text.graphics.y = game_engine.player.pos.y-32;
		audio_engine.playSound("collect");
	}
});

FuelShop = Shop.extend({
	asset: 'fuelshop',
	text_stack: new Array(),
	onTouch: function(body, impulse) {
		var u = body?body.GetUserData():null;
		if(u!==null){
			if(u.id=="player"){

				
				if(impulse>1){
					audio_engine.playSound("land1");
				}
				
				if(u.ent.is_idle && impulse<0.3){
					this.refuel(u.ent);
				}
			}
		}
		
	},
	refuel: function(player){
		if(game_engine.tick - this.last_pur_tick < 10){return false;} // RATE LIMIT
		var fuel_price = 1;
		var fuel_price_quantity = 20;
		var fuel_quantity = player.maxFuel/fuel_price_quantity;
		var fuel_cost = parseFloat(Math.round((fuel_quantity*fuel_price) * 100) / 100).toFixed(2);
		if(player.fuel<player.maxFuel && player.cash>=fuel_cost){
			player.fuel+=fuel_quantity;
			if(player.fuel>player.maxFuel){
				player.fuel = player.maxFuel;
			}
			player.cash-=fuel_cost;
			game_engine.score+=fuel_quantity*5;
			this.createText(fuel_cost);
		}
		this.last_pur_tick = game_engine.tick;
	},
	createText: function(cost){
		if(this.render==null) return;
		var text = render_engine.addText("-"+ cost + "$");
		text.graphics.x = game_engine.player.pos.x-52;
		text.graphics.y = game_engine.player.pos.y-32;
		audio_engine.playSound("refuel");
	}
});