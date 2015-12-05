$(document).ready(function() {
	$("#notutorial").click(function(){
		d3.select("#tutorial").style("display", "none");
	});
	$("#yestutorial").click(function(){
		d3.select("#tutorial").style("display", "none");
		introJs().start();
	});
});