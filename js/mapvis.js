function MapVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations, _mapStates, _mapCities) {
	var self = this;

	self.parentElement = _parentElement;
	self.eventHandler = _eventHandler;
	self.mapStates = _mapStates;
	self.mapCities = _mapCities;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize map visualization only showing states */
	self.initialize(false);
}

MapVis.prototype.initialize = function (showCities) {
	var self = this;

	/* map dimensions */
	var width = 600,
		height = 550,
		scale = 700;

	/* aggregate data */
	self.aggregateData();

	/* scales */
	var entries = d3.entries(self.stateOperations);
	var minMaxOperations = [d3.min(entries, function(d){
		return d.value.length;
	}), d3.max(entries, function(d){
		return d.value.length;
	})];

	var colorScale = d3.scale.linear()
	    .domain(minMaxOperations)
	    .range(["#feb24c","#800026"]);

	/* map svg */
	var svg = self.parentElement.append("svg").attr("id" , "map").attr("width", width).attr("height", height);

	/* mercator projection */
	var projection = d3.geo.mercator()
		.precision(.1)
		.center([-54, -15])	
		.scale(scale)
		.translate([width / 2, height / 2]);

	/* path generator */
	var path = d3.geo.path().projection(projection);

	/* define granulatiry */
	var map = (showCities) ? self.mapCities : self.mapStates;

	/* draw the map */
	for(var state of self.statesAcronyms) {
		svg.append("g")
			.attr("acronym", state)
			.attr("transform", "translate(50, 0)")
			.on("click", function(){
				var state = d3.select(this).attr("acronym");
				/* trigger the main event */
				self.eventHandler.mapClicked(state);
			})
			.selectAll()
			.data(topojson.feature(map, map.entities[state]).features)
			.enter()
			.append("path")
			.attr("fill", function() {
				return colorScale(self.stateOperations[state.toUpperCase()].length);
			})
			.attr("stroke-width", "0.3")
			.attr("stroke", "#333")
			.attr("d", path)
	}
}

MapVis.prototype.update = function (statesAcronyms) {
	var self = this;
	/* update state list */
	self.statesAcronyms = statesAcronyms;
	/* clear map */
	self.clearMap();
	/* draw the map again */
	self.initialize(true);
}

MapVis.prototype.clearMap = function () {
	/* remove map */
	d3.select("#map").remove()
}

MapVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by state */
	self.stateOperations = {};

	self.creditOperations.forEach(function (d) {
		/* create a state key if not present */
		if (!self.stateOperations.hasOwnProperty(d["State"])) {
			self.stateOperations[d["State"]] = [];
		}
		/* save this operation */
		self.stateOperations[d["State"]].push(d);
	});
}
