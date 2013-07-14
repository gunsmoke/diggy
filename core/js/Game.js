Math.seedrandom("cool seed");
var simple_noise = new SimplexNoise();

function init(){

	
	game_engine.setup(true); // activate with debug mode on

	(function gameloop(){
		requestAnimFrame(gameloop);
		game_engine.run();
		
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