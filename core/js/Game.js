Math.seedrandom("cool seed");
var simple_noise = new SimplexNoise();
var stats = new Stats();
stats.setMode( );
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
stats.domElement.style.zIndex = '1444';
document.body.appendChild( stats.domElement );



function init(){

	game_engine.setup(true); // activate with debug mode on

	(function gameloop(){
		requestAnimFrame(gameloop);

		stats.begin();
		game_engine.run();
		stats.end();
		
	})();


}

function fitCanvasToWindow(){
	render_engine.setWidth($(window).width());
	render_engine.setHeight($(window).height()-40); // remove 40 pixels due to the bar in the bottom
}
$(window).load(init);
$(window).resize(fitCanvasToWindow);
$(document).ready(function(){
	setTimeout(fitCanvasToWindow, 10);
	// DO INPUT ENGINE
	//window.addEventListener('keydown',handleKeyDown,true);
	//window.addEventListener('keyup',handleKeyUp,true);

	$(".debug_physics .btn").click(function(){
		if($(".debug_physics").hasClass("opened")){
			$(".debug_physics").removeClass("opened");
		} else {
			$(".debug_physics").addClass("opened");
		}
	});
});
