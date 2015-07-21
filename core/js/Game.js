
var stats = new Stats();
stats.setMode( );
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
stats.domElement.style.zIndex = '1444';
document.body.appendChild( stats.domElement );

function onAssetsLoaded(loader, res){
	game_engine.setup();

	(function gameloop(){
		requestAnimFrame(gameloop);

		stats.begin();
		game_engine.run();
		stats.end();
		
	})();
}

function init(){

	loader.load(onAssetsLoaded);

}

$(document).ready(function(){
	$(".debug_physics .btn").click(function(){
		if($(".debug_physics").hasClass("opened")){
			$(".debug_physics").removeClass("opened");
		} else {
			$(".debug_physics").addClass("opened");
		}
	});
});

$(window).load(init);