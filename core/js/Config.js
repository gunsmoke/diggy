var undefined;
ConfigClass = Class.extend({
	MAX_CHUNKS_SIZE: {X: 1024, Y: 1024},
	CHUNK_SIZE : 25,
	GAME_UPDATES_PER_SEC : 5,
	GAME_LOOP_HZ : 1.0 / 10.0,

	PHYSICS_UPDATES_PER_SEC : 30,
	PHYSICS_LOOP_HZ : 1.0 / 30.0
});
var Config = new ConfigClass();