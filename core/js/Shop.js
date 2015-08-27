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
	itemsValue: function(item){
		if(item==10){ return 50; }
		if(item==11){ return 100; }
		if(item==12){ return 250; }
		if(item==13){ return 500; }
		if(item==14){ return 1000; }
		if(item==15){ return 5000; }
		return 0;
	},
	buyFrom: function(player){
		if(game_engine.tick - this.last_pur_tick < 10){return false;} // RATE LIMIT

		if(player.cargo.length>0){
			var item = player.cargo.pop();
			var value = this.itemsValue(item);
			player.cash+=value;
			game_engine.score+=value*2;
			this.createText(item);
		}
		this.last_pur_tick = game_engine.tick;
	},
	createText: function(item){
		if(this.render==null) return;
		var label = "";
		if(item==10){label="Coal";}
		if(item==11){label="Iron";}
		if(item==12){label="Gold";}
		if(item==13){label="Emerald";}
		if(item==14){label="Lapis";}
		if(item==15){label="Diamond";}
		var text = new RenderText("1x "+ label);
		text.graphics.x = -70;
		text.graphics.y = -30;
		this.addText(text);
	},
	addText: function(text){
		if(this.render==null) return;
		this.text_stack.push(text)
		this.render.graphics.addChild(text.graphics);
	},
	update: function(){
		if(this.render==null) return;
		var clear = new Array();
		for (var i = 0; i < this.text_stack.length; i++) {
			this.text_stack[i].update();
			if(this.text_stack[i].completed){
				clear.push(i);
			}
		};
		for (var i = 0; i < clear.length; i++) {
			this.render.graphics.removeChild(this.text_stack[clear[i]]);
			this.text_stack.splice(clear[i], 1);
		};
	}
});

FuelShop = Shop.extend({
	asset: 'fuelshop',
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
		var fuel_price = 10;
		if(player.fuel<player.maxFuel && player.cash>=fuel_price){
			player.fuel+=20;
			if(player.fuel>player.maxFuel){
				player.fuel = player.maxFuel;
			}
			player.cash-=fuel_price;
			game_engine.score+=50;
		}
		this.last_pur_tick = game_engine.tick;
	}
});