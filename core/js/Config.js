var undefined;
ConfigClass = Class.extend({
	MAX_CHUNKS_SIZE: {X: 13, Y: 15},
	CHUNK_SIZE:25, // must be greated then the draw distnace
	GAME_UPDATES_PER_SEC: 7,
	GAME_LOOP_HZ: 1.0 / 10.0,

	PHYSICS_UPDATES_PER_SEC: 30,
	PHYSICS_LOOP_HZ: 1.0 / 30.0,

	SCALE: 1.5,

	PHYSICS_DISTANCE: 11,
	DRAW_DISTANCE: 17,
	BOUND_SIZE: 18,
	DRAW_RATIO: 1,
	LIGHTS: true,
	DEBUG: false,
	SEED: "13",
	TEXTURE_PACK_SCALE: 0.50,
	TEXTURE_PACK: 'packs/high'
});
var Config = new ConfigClass();
