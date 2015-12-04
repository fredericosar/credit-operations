function MapVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations, _mapStates) {
	var self = this;

	/* save variables */
	self.parentElement = _parentElement;
	self.eventHandler = _eventHandler;
	self.mapStates = _mapStates;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* filter operations */
	self.filter();

	/* initialize map visualization */
	self.initialize();
}

MapVis.prototype.initialize = function () {
	var self = this;

	/* map dimensions */
	self.width = $("#mapVis").width();
	self.height = 500;

	/* scales */
	self.minMaxOperations = [d3.min(d3.entries(self.operationCount), function(d){
		return parseInt(d.value);
	}), d3.max(d3.entries(self.operationCount), function(d){
		return parseInt(d.value);
	})];

	self.colorScale = d3.scale.linear()
	    .domain(self.minMaxOperations)
	    .range(["#feb24c","#800026"]);

	/* map svg */
	self.svg = self.parentElement.append("svg").attr("id" , "map").attr("width", self.width).attr("height", self.height);

	/* left click */
	self.svg.on("contextmenu", function (d, i) {
		d3.event.preventDefault();
		/* trigger the click event */
		self.eventHandler.mapClicked(self.statesAcronyms);
	});
	
	/* mercator projection */
	self.projection = d3.geo.mercator()
		.precision(.1)
		.center([-54, -15])	
		.scale(650)
		.translate([self.width / 2, self.height / 2]);

	/* path generator */
	self.path = d3.geo.path().projection(self.projection);

	/* define granulatiry */
	var map = self.mapStates;

	/* draw the map */
	for(var state of self.statesAcronyms) {
		self.svg.append("g")
			.attr("id", state)
			.attr("transform", "translate(10, 0)")
			.on("click", function(){
				/* get state acronym */
				var state = d3.select(this).attr("id");
				/* trigger the click event */
				self.eventHandler.mapClicked([state]);
			})
			.selectAll()
			.data(topojson.feature(map, map.entities[state]).features)
			.enter()
			.append("path")
			.attr("fill", function() {
				return self.colorScale(self.operationCount[state.toUpperCase()]);
			})
			.attr("stroke-width", "0.1")
			.attr("stroke", "#333")
			.attr("d", self.path);
	}

	/* gradient scale */
	var gradient = self.svg.append("defs")
	  .append("linearGradient")
	    .attr("id", "gradient")
	    .attr("x1", "100%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "100%")
	    .attr("spreadMethod", "pad");

	gradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", "#800026")
	    .attr("stop-opacity", 1);

	gradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", "#feb24c")
	    .attr("stop-opacity", 1);

	/* draw the color scale */
	self.scaleRect = self.svg.append("g").attr("id", "scale");
	
	self.scaleRect
		.append("rect")
		.attr("transform", "translate(400, 380)")
    	.attr("width", 15)
    	.attr("height", 100)
    	.style("fill", "url(#gradient)");
    
    self.maxOps = self.scaleRect
		.append("text")
		.attr("transform", "translate(418, 390)")
		.text(self.minMaxOperations[1])
		.style("font-size","9px")
		.attr("fill", "#fff");

    self.minOps = self.scaleRect
		.append("text")
		.attr("transform", "translate(418, 480)")
		.text(1)
		.style("font-size","9px")
		.attr("fill", "#fff");
}

MapVis.prototype.filter = function (){
	var self = this;
	
	self.operationCount = {};

	self.creditOperations.forEach(function (d) {
		/* create a state key if not present */
		if (!self.operationCount.hasOwnProperty(d["State"])) {
			self.operationCount[d["State"]] = 0;
		}
		/* count operation */
		self.operationCount[d["State"]] += 1;
	});
}

MapVis.prototype.updateOperations = function (operations) {
	var self = this;
	/* update operations based on filter */
	self.creditOperations = operations;
	/* filter data */
	self.filter();	
	/* update visualization */
	self.updateMap();
}

MapVis.prototype.updateMap = function () {
	var self = this;
	/* update each state individualy */
	for(var state of self.statesAcronyms) {
		d3.select("#" + state)
			.selectAll("path")
			.attr("fill", function() {
				if(self.operationCount[state.toUpperCase()] === undefined){
					return "#555";
				}else {
					return self.colorScale(self.operationCount[state.toUpperCase()]);
				}
			});
	}
}