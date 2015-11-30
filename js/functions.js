$(document).ready(function() {
	$("#notutorial").click(function(){
		d3.select("#tutorial").remove();
	});
	$("#yestutorial").click(function(){
		d3.select("#tutorial").remove();
		introJs().start()
	});
});