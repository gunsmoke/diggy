WorldData = Class.extend({
	data: new Array(),
	init: function(){

	},
	get: function(x,y){
		if(this.data[y]!==undefined){
			if(this.data[y][x]!==undefined){
				return this.data[y][x];
			}
		}
		return null;
	},
	getType: function(x,y){
		data = this.get(x,y);
		return (data!==null) ? data.type : 0;
	},
	set: function(x,y,value){
		if(this.data[y]===undefined){this.data[y]=new Array();}
		try
		{
			delete this.data[y][x];
		}
		catch(err){}
		this.data[y][x] = this.entityFactory(x,y,value);
		return this.data[y][x];
	},
	getBlockThreshold: function(y){
		if(y<9) return [1];
		if(y<30) return [2,2,2,2,2,4,5];
		if(y<80) return [2,2,3,3,3,4,5,6];
		if(y<300) return [0,0,0,0,0,2,3,3,3,3,3,3,3,3,3,6];
		if(y<1200) [0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,5,5,5,5,5,6,6,6,6,7];
		if(y<2200) [0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,5,5,5,5,5,7];
		if(y<3200) [0,0,0,0,0,3,3,3,3,3,3,3,5,5,5,6];
		return [0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,7,7,7];
	},
	getNoiseThreshold: function(y){
		if(y<25) return 1;
		if(y<50) return 0.4;
		if(y<100) return 0.2;
		if(y<500) return 0;
		if(y<800) return 0.9;
		if(y<1200) return 0.4;
		return 0;
	},
	entityFactory: function(x,y,block_data){
		var block = null;
		switch(block_data){
			case 0:
				block = new Void(x,y);
				break;
			case 1:
				block = new Grass(x,y);
				break;
			case 2:
				block = new Dirt(x,y);
				break;
			case 3:
				block = new Stone(x,y);
				break;
			case 4:
				block = new Sand(x,y);
				break;
			case 5:
				block = new Gravel(x,y);
				break;
			case 6:
				block = new Water(x,y);
				break;
			case 7:
				block = new Lava(x,y);
				break;
			case 8:
				block = new BedRock(x,y);
				break;
			default:
				block = new Void(x,y);
		}
		return block;
	}
});

world_data = new WorldData();


WorldChunk = Class.extend({
	index: 0,
	noise: true,
	graphics: null,
	is_loaded: false,
	data: null,
	index_offset_x: 0,
	index_offset_y: 0,
	entities: [],
	clock: 100,
	randomizer: 1,
	RDM: Math.random,
	init: function(index,add_noise){
		this.index = index;
		if(add_noise===undefined){add_noise = true;}
		this.noise = add_noise;
		this.data = null;
		this.is_loaded = false;
		this.index_offset_x = this.getXindex()*Config.CHUNK_SIZE;
		this.index_offset_y = this.getYindex()*Config.CHUNK_SIZE;

		if(Config.DEBUG) this.debug_render();

		Math.seedrandom(Config.SEED+"_"+this.index_offset_x+"_"+this.index_offset_y);
		this.RDM = Math.random;

		this.randomizer = this.RDM();

		this.setup();
	},
	getXindex: function(){
		return this.index-(this.getYindex()*Config.MAX_CHUNKS_SIZE.X);
	},
	getYindex: function(){
		return Math.floor(this.index/Config.MAX_CHUNKS_SIZE.X);
	},
	debug_render: function(){
		this.graphics = new PIXI.Graphics();
		var block_size = 64;
		var chunk_size = Config.CHUNK_SIZE*block_size;
		var offset = block_size/2;
		this.graphics.beginFill(0x00ff00, 0.08);
		this.graphics.lineStyle(2, 0x00ff00, 0.5);
		this.graphics.drawRect(this.getXindex()*chunk_size-offset, this.getYindex()*chunk_size-offset, chunk_size, chunk_size);
		var debug_layer = render_engine.getLayer("blocks");
		debug_layer.add(this);
	},
	setup: function(){
		var simplex_noise = new SimplexNoise(this.RDM);
		var size = Config.CHUNK_SIZE;
		var bound_size = Math.ceil(Config.DRAW_DISTANCE/2)+1;
		var max_y = Config.MAX_CHUNKS_SIZE.Y*size-bound_size;
		var max_x = Config.MAX_CHUNKS_SIZE.X*size-bound_size;
		var min_x = bound_size;

		for (var y = this.index_offset_y; y < (size + this.index_offset_y); y++) {
			for (var x = this.index_offset_x; x < (size + this.index_offset_x); x++) {
				var allowed_blocks = world_data.getBlockThreshold(y);
				var noise_block = allowed_blocks[Math.ceil(this.randomizer*allowed_blocks.length-1)];
				var block = allowed_blocks[Math.ceil(this.RDM()*allowed_blocks.length-1)];
				if(this.noise===true){
					var noise = simplex_noise.noise(x,y);
					var noise_treshold = world_data.getNoiseThreshold(y);
					if(noise>=noise_treshold){
						block = noise_block;
					}
				}
				if(y<8){block=0;}
				
				// create bounds
				if(y>max_y){block=8;} // floor
				if(x<min_x){block=8;} // left
				if(x>max_x){block=8;} // right

				world_data.set(x,y,block);
			}
		};
	},
	update: function(){
		var size = Config.CHUNK_SIZE;
		if(this.clock<=0){
			for (var y = this.index_offset_y; y < (size + this.index_offset_y); y++) {
				for (var x = this.index_offset_x; x < (size + this.index_offset_x); x++) {
					var block = world_data.get(x,y);
					if(block===null) continue;
					if(block.type==0) continue;
					// update fluid blocks
					if(block.type >= 6 && block.type <= 7) block.fluid_update();
				}
			};
			this.clock=100;
		} else {
			this.clock-=32;
		}
	}
});

WorldEngine = Class.extend({
	chunks: new Array(),
	visible_blocks: new Array(),
	bounds: null,
	follow_entity: null,
	entities: new Array(),
	init: function () {
	},
	setup: function(settings) {
		if (settings.offset) this.offset = settings.offset;
	},
	build: function() {
		this.createBounds();

		setTimeout(function(){
			world_data.set(10,5,6);
			world_data.set(19,5,7);
		},100);
	},
	createBounds: function(){
		var size_threshold = 1.5;

		var width = (Config.CHUNK_SIZE/size_threshold);
		var height = 2;

		var top = -(2.5)+this.offset.y;
		var left = -(2.5)+this.offset.x;
		var right = Config.MAX_CHUNKS_SIZE.X*Config.CHUNK_SIZE+size_threshold;
		var bottom = Config.MAX_CHUNKS_SIZE.Y*Config.CHUNK_SIZE+size_threshold;

		this.bounds = {
			'ceiling': new Bound(0,top,width,height),
			'floor': new Bound(0,bottom,width,height),
			'left': new Bound(left,0,height,width),
			'right': new Bound(right,0,height,width),
		}
	},
	loadChunk: function(index){
		if(this.chunks[index]===undefined){
			return this.createChunk(index);
		}
		return this.chunks[index];
	},
	createChunk: function(index,add_noise){
		if(index===undefined){index = this.curr_chunk;}
		if(add_noise===undefined){add_noise = true;}
		var chunk = new WorldChunk(index,add_noise);
		// add to chunks
		this.chunks[index] = chunk;
		return chunk;
	},
	getIndex: function(x,y){
		if(x>=Config.MAX_CHUNKS_SIZE.X) return null;
		if(y<0 || x<0) return null;
		var index = (y*Config.MAX_CHUNKS_SIZE.X)+x;
		if(index<0){index=0;}
		if(index>(Config.MAX_CHUNKS_SIZE.X*Config.MAX_CHUNKS_SIZE.Y)) return null;
		return index;
	},
	loadBlocks: function(blocks){
		for (var i = 0; i < blocks.length; i++) {
			var block_data = world_data.get(blocks[i].x,blocks[i].y);
			if(block_data===null){return;}
			if(this.isBlockActive(blocks[i])===false){
				block_data.enable();
				this.visible_blocks.push(block_data);
			}
		};
	},
	unloadBlocks: function(blocks){
		for (var i = 0; i < this.visible_blocks.length; i++) {
			var active_block = this.visible_blocks[i];
			var is_active = false;
			for (var o = 0; o < blocks.length; o++) {
				if(blocks[o].x == active_block.pos.x && blocks[o].y == active_block.pos.y){
					is_active = true;
				}
			};
			if(is_active){continue;}
			
			active_block.disable();
			// remove from list
			this.visible_blocks.splice(i,1);
		}
	},
	isBlockActive: function(pos){
		for (var i = 0; i < this.visible_blocks.length; i++) {
			if(this.visible_blocks[i].pos.x == pos.x && this.visible_blocks[i].pos.y == pos.y){
				return true;
			}
		};
		return false;
	},
	removeBlock: function(pos){
		// remove from active blocks list
		for (var i = 0; i < this.visible_blocks.length; i++) {
			if(this.visible_blocks[i].pos.x == pos.x && this.visible_blocks[i].pos.y == pos.y){
				this.visible_blocks.splice(i,1);
				break;
			}
		};

		// remove from world data
		world_data.set(pos.x,pos.y, 0);
	},
	getVisibleBlocks: function(x,y){
		var blocks = new Array();
		var distance = parseFloat(Config.DRAW_DISTANCE) / 2;
		var maxblocks = Math.ceil(distance) * 2;
		var max_x = Config.MAX_CHUNKS_SIZE.X * Config.CHUNK_SIZE;
		var max_y = Config.MAX_CHUNKS_SIZE.Y * Config.CHUNK_SIZE;
		for (var ny = -maxblocks/2+1; ny < maxblocks/2-1; ny++) {
			for (var nx = -maxblocks/2+1; nx < maxblocks/2-1; nx++) {
				// circlify
				if(ratioDistance(nx, ny, 1.23) > distance){continue;}
				// bounds
				var relative_x = x + nx;
				var relative_y = y + ny;
				if(relative_x<0 || relative_x>max_x){continue;}
				if(relative_y<0 || relative_y >max_y){continue;}
				// create pit hole
				if(relative_x>20 && relative_x<23){continue;}
				// add block
				blocks.push({'x':relative_x, 'y':relative_y});
			};
		};
		return blocks;
	},
	update: function(){
		if (this.follow_entity==null) return;
		var stage_size = render_engine.stage_size;
		var block_size = (64*stage_size.scale);
		var entity_size_x = 0;
		var entity_size_y = 0;

		var entity_x = (this.follow_entity.pos.x*stage_size.scale);
		var entity_y = (this.follow_entity.pos.y*stage_size.scale);

		var chunk_x = entity_x/((Config.CHUNK_SIZE * block_size) - entity_size_x);
		var chunk_y = entity_y/((Config.CHUNK_SIZE * block_size) - entity_size_y);

		var chunk_index_x = Math.floor(chunk_x);
		var chunk_index_y = Math.floor(chunk_y);

		var chunk_percent_x = Math.round((chunk_x-chunk_index_x)*100);
		var chunk_percent_y = Math.round((chunk_y-chunk_index_y)*100);
		

		// load chuncks
		this.curr_chunk = this.getIndex(chunk_index_x,chunk_index_y);
		if(this.curr_chunk==null) return;

		var visible_chunks = new Array();
		visible_chunks.push(this.curr_chunk);
		if (chunk_percent_x>=50){
			var east = this.getIndex(chunk_index_x+1,chunk_index_y);
			if(east!=null && east!=this.curr_chunk) visible_chunks.push(east); // east
		} else {
			var west = this.getIndex(chunk_index_x-1,chunk_index_y)
			if(west!=null && west!=this.curr_chunk) visible_chunks.push(west); // west
		}

		if (chunk_percent_y>=50){
			var south = this.getIndex(chunk_index_x,chunk_index_y+1);
			if(south!=null && south!=this.curr_chunk) visible_chunks.push(south); // south
		} else {
			var north = this.getIndex(chunk_index_x,chunk_index_y-1);
			if(north!=null && north!=this.curr_chunk) visible_chunks.push(north); // north
		}

		if (chunk_percent_x>=50 && chunk_percent_y>=50){
			var south_east = this.getIndex(chunk_index_x+1,chunk_index_y+1);
			if(south_east!=null && south_east!=this.curr_chunk) visible_chunks.push(south_east); // south east
		} else if(chunk_percent_x<=50 && chunk_percent_y>=50){
			var south_west = this.getIndex(chunk_index_x-1,chunk_index_y+1);
			if(south_west!=null && south_west!=this.curr_chunk) visible_chunks.push(south_west); // south west
		} else if(chunk_percent_x>=50 && chunk_percent_y<=50){
			var north_east = this.getIndex(chunk_index_x+1,chunk_index_y-1);
			if(north_east!=null && north_east!=this.curr_chunk) visible_chunks.push(north_east); // north east
		} else if(chunk_percent_x<=50 && chunk_percent_y<=50){
			var north_west = this.getIndex(chunk_index_x-1,chunk_index_y-1);
			if(north_west!=null && north_west!=this.curr_chunk) visible_chunks.push(north_west); // north west
		}
		// load visible chunks and update
		for (var i = 0; i < visible_chunks.length; i++) {
			this.loadChunk(visible_chunks[i]).update();
		};

		// get blocks
		var block_x = Math.ceil(entity_x / block_size);
		var block_y = Math.ceil(entity_y / block_size);

		var blocks = this.getVisibleBlocks(block_x,block_y);

		// load new blocks
		this.loadBlocks(blocks);
		// unload old blocks
		this.unloadBlocks(blocks);
		// update current blocks
		for (var i = 0; i < this.visible_blocks.length; i++) {
			this.visible_blocks[i].update();
		};

		// update bounds position to follow entity
		this.updateBounds();

		// center the entity
		this.centerWorldToEntity(this.follow_entity);

		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].update();
		};
	},
	follow: function(entity){
		this.follow_entity = entity;
	},
	updateBounds: function(){
		if (this.follow_entity==null) return;
		var block_size = (64*render_engine.stage_size.scale);
		var entity_x = this.follow_entity.pos.x / block_size;
		var entity_y = this.follow_entity.pos.y / block_size;
		this.bounds.ceiling.setX(entity_x);
		this.bounds.floor.setX(entity_x);
		this.bounds.left.setY(entity_y);
		this.bounds.right.setY(entity_y);
	},
	getCenterXY:function(entity){
		if(entity==null) return;
		var stage_size = render_engine.stage_size;
		var block_size = (64*stage_size.scale);
		var max_x = ((Config.CHUNK_SIZE * block_size) * Config.MAX_CHUNKS_SIZE.X) - stage_size.width;
		var max_y = ((Config.CHUNK_SIZE * block_size) * Config.MAX_CHUNKS_SIZE.Y) - stage_size.height;
		var center_x = (stage_size.width/2)-(block_size/2);
		var center_y = (stage_size.height/2)-(block_size/2);
		var x = -(entity.pos.x*stage_size.scale)+center_x;
		var y = -(entity.pos.y*stage_size.scale)+center_y;
		// limit
		if(x>=0){ x=0; } else if(x<-max_x){ x=-max_x; }
		if(y>=0){ y=0; } else if(y<-max_y){ y=-max_y; }
		return {x:x,y:y};
	},
	centerWorldToEntity: function(entity){
		if(entity==null) return;
		var position = this.getCenterXY(entity);
		render_engine.stagePosition(position);
	},
	addDebry: function(debry){
		this.entities.push(debry);
	}
});

world_engine = new WorldEngine();