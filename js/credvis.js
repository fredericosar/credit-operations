function CredVis(_parentElement, _statesAcronyms, _creditOperations) {
	var self = this;

	self.parentElement = _parentElement;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize operations visualization */
	self.initialize()
}

/* insights from http://bl.ocks.org/mbostock/3888852 */
CredVis.prototype.initialize = function () {
	var self = this;

	/* chart dimensions */
	var width = 350,
		height = 200;

	/* aggregate data */
	self.aggregateData();

	/* colors */
	var colors = ["#de2d26", "#fc8d59", "#1a9850", "#756bb1", "#3182bd", "#fdae6b"];

	/* arcs */
	var arc = d3.svg.arc()
	    .outerRadius(100 - 20)
	    .innerRadius(100 - 70);

	/* pie layout */
    var pie = d3.layout.pie()
   		.padAngle(.01)
        .value(function(d) {
        	return d.value; 
        });

	/* map svg */
	var svg = self.parentElement.append("svg").attr("id" , "creditors").attr("width", width).attr("height", height);

	/* draw arc */
	svg.selectAll(".arc")
		.data(pie(self.creditorEntries))
		.enter().append("g")
		.attr("class", "arc")
		.attr("transform", "translate(80, 100)")
		.append("path")
		.attr("d", arc)
		.style("fill", function(d, i){
			return colors[i];
		});

	/* draw legend */
	var legend = d3.select("#creditors").append("svg")
	  .selectAll("g")
	  .data(self.creditorEntries)
	  .enter().append("g")
	  .attr("transform", function(d, i) { 
	  	return "translate(190," + ((i * 20) + 30 )+ ")"; 
	  });

	legend.append("circle")
	  .attr("r", 6)
	  .style("fill", function(d, i) { 
	  	return colors[i]; 
	  });

	legend.append("text")
	  .attr("x", 12)
	  .attr("y", 0)
	  .attr("dy", ".35em")
	  .style("font-size","10px")
	  .attr("fill", "#fff")
	  .text(function(d) { 
	  	return d.key; 
	  });
}

CredVis.prototype.update = function (statesAcronyms) {
	var self = this;
	/* update state list */
	self.statesAcronyms = statesAcronyms;
	/* clear map */
	self.clearMap();
	/* draw the map again */
	self.initialize();
}

CredVis.prototype.clearMap = function () {
	/* remove map */
	d3.select("#creditors").remove()
}

CredVis.prototype.aggregateData = function () {
	var self = this;

	self.creditorType = {};

	for(var i = 0; i < self.creditOperations.length; i++){
		if(self.statesAcronyms.indexOf(self.creditOperations[i]["State"].toLowerCase()) != -1){
			var type = self.creditOperations[i]["Type of Creditor"];
			if (!self.creditorType.hasOwnProperty(type)) {
				self.creditorType[type] = [0];
			} else {
				self.creditorType[type] = parseInt(self.creditorType[type]) + 1;
			}
		}
	}

	self.creditorEntries = d3.entries(self.creditorType);
}