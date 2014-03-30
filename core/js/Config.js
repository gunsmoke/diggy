var undefined;
ConfigClass = Class.extend({
	MAX_CHUNKS_SIZE: {X: 8, Y: 64},
	CHUNK_SIZE:42, // must be greated then the draw distnace
	GAME_UPDATES_PER_SEC: 7,
	GAME_LOOP_HZ: 1.0 / 10.0,

	PHYSICS_UPDATES_PER_SEC: 30,
	PHYSICS_LOOP_HZ: 1.0 / 30.0,

	SCALE: 1,
	DRAW_DISTANCE: 15,
	LIGHTS: true,
	DEBUG: false,
	SEED: "123",
	TEXTURE_PACK: 'packs/default'
});
var Config = new ConfigClass();