var undefined;
ConfigClass = Class.extend({
	MAX_CHUNKS_SIZE: {X: 20, Y: 50},
	CHUNK_SIZE:32, // must be greated then the draw distnace
	GAME_UPDATES_PER_SEC: 7,
	GAME_LOOP_HZ: 1.0 / 10.0,

	PHYSICS_UPDATES_PER_SEC: 30,
	PHYSICS_LOOP_HZ: 1.0 / 30.0,

	DRAW_DISTANCE: 13,
	LIGHTS: true,
	DEBUG: false,
});
var Config = new ConfigClass();