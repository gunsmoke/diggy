var undefined;
ConfigClass = Class.extend({
	MAX_CHUNKS_SIZE: {X: 56, Y: 56},
	CHUNK_SIZE:28,
	GAME_UPDATES_PER_SEC: 5,
	GAME_LOOP_HZ: 1.0 / 10.0,

	PHYSICS_UPDATES_PER_SEC: 30,
	PHYSICS_LOOP_HZ: 1.0 / 30.0,

	DRAW_DISTANCE: 8,
	LIGHTS: true,
	DEBUG: false,
});
var Config = new ConfigClass();