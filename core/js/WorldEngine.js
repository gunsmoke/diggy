WorldData = Class.extend({
	data: new Array(),

	init: function(){

	},
	get: function(x,y){
		return this.data[y][x];
	},
	set: function(x,y,value){
		if(this.data[y]===undefined){this.data[y]=new Array();}
		this.data[y][x] = value;
	},
	getBlockThreshold: function(y){
		if(y<9) return [1];
		if(y<30) return [2];
		if(y<80) return [2,3];
		if(y<300) return [2,3,4];
		return [3,4];
	},
	getNoiseThreshold: function(y){
		if(y<25) return 1;
		if(y<50) return 0.4;
		if(y<100) return 0.2;
		if(y<500) return 0;
		if(y<800) return -0.5;
		return 0;
	}
});

world_data = new WorldData();


WorldChunk = Class.extend({
	index: 0,
	noise: true,
	is_loaded: false,
	data: null,
	index_offset_x: 0,
	index_offset_y: 0,
	entities: new Array(),
	init: function(index,add_noise){
		this.index = index;
		if(add_noise===undefined){add_noise = true;}
		this.noise = add_noise;
		this.data = null;
		this.is_loaded = false;
		var index_y = Math.floor(this.index/Config.MAX_CHUNKS_SIZE.X);
		var index_x = this.index-(index_y*Config.MAX_CHUNKS_SIZE.X);
		var size = Config.CHUNK_SIZE;
		this.index_offset_x = (index_x*size);
		this.index_offset_y = (index_y*size);
		this.entities = new Array();
		this.setup();
	},
	setup: function(){
		var chunk = new Array();
		var size = Config.CHUNK_SIZE;


		for (var i = 0; i < size; i++) {
			for (var o = 0; o < size; o++) {
				var allowed_blocks = world_data.getBlockThreshold(y);
				var block = allowed_blocks[Math.ceil(Math.random()*allowed_blocks.length-1)];
				var x = o+this.index_offset_x;
				var y = i+this.index_offset_y;
				if(this.noise===true){
					var noise = simple_noise.noise(x,y);
					var noise_treshold = world_data.getNoiseThreshold(y);
					if(noise>=noise_treshold){
						block = 0;
					}
				}
				if(y<8){block=0;}
				world_data.set(x,y,block);

			}
		};

	},
	update: function(){
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].update();
		};
	}
});

WorldEngine = Class.extend({
	chunks: new Array(),
	active_blocks: new Array(),
	bounds: null,
	follow_entity: null,
	init: function () {
	},
	setup: function(settings) {
		if (settings.offset) this.offset = settings.offset;
	},
	build: function() {
		this.createBounds();
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
			var block_data = world_data.data[blocks[i].y][blocks[i].x];
			if(block_data>0 && this.isBlockActive(blocks[i])===false){

				// TODO: make a factory to spawn this crap
				switch(block_data){
					case 1:
						block = new Grass(blocks[i].x,blocks[i].y);
						break;
					case 2:
						block = new Dirt(blocks[i].x,blocks[i].y);
						break;
					case 3:
						block = new Stone(blocks[i].x,blocks[i].y);
						break;
					default:
						block = new Block(blocks[i].x,blocks[i].y);
				}


				this.active_blocks.push(block);
			}
		};
	},
	unloadBlocks: function(blocks){
		for (var i = 0; i < this.active_blocks.length; i++) {
			var active_block = this.active_blocks[i];
			var is_active = false;
			for (var o = 0; o < blocks.length; o++) {
				if(blocks[o].x == active_block.pos.x && blocks[o].y == active_block.pos.y){
					is_active = true;
				}
			};
			if(is_active){continue;}
			
			active_block.destroy();
			// remove from list
			this.active_blocks.splice(i,1);
		}
	},
	isBlockActive: function(pos){
		for (var i = 0; i < this.active_blocks.length; i++) {
			if(this.active_blocks[i].pos.x == pos.x && this.active_blocks[i].pos.y == pos.y){
				return true;
			}
		};
		return false;
	},
	removeBlock: function(pos){
		// remove from active blocks list
		for (var i = 0; i < this.active_blocks.length; i++) {
			if(this.active_blocks[i].pos.x == pos.x && this.active_blocks[i].pos.y == pos.y){
				this.active_blocks.splice(i,1);
				break;
			}
		};
		// remove from world data
		world_data.set(pos.x,pos.y,0);
	},
	getVisibleBlocks: function(x,y){
		var blocks = new Array();
		var distance = 5;
		var max_x = Config.MAX_CHUNKS_SIZE.X * Config.CHUNK_SIZE;
		var max_y = Config.MAX_CHUNKS_SIZE.Y * Config.CHUNK_SIZE;
		for (var i = x-distance; i < x+distance; i++) {
			for (var o = y-distance; o < y+distance; o++) {
				if(i<0 || i>max_x){continue};
				if(o<0 || o >max_y){continue};
				if(i>10 && i<17){continue};
				blocks.push({'x':i, 'y':o});
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
		// load visible chunks
		for (var i = 0; i < visible_chunks.length; i++) {
			this.loadChunk(visible_chunks[i]);
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
		for (var i = 0; i < this.active_blocks.length; i++) {
			this.active_blocks[i].update();
		};

		// update bounds position to follow entity
		this.updateBounds();

		// center the entity
		this.centerWorldToEntity(this.follow_entity);
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
		var stage = render_engine.stage;
		var position = this.getCenterXY(entity);
		stage.setX(position.x);
		stage.setY(position.y);
	}
});

world_engine = new WorldEngine();



//CREATE A SINGLE MATRIX FOR THE DATA MAP
//RENDER BLOCKS WITHIN A RADIOUS of the PLAYTER