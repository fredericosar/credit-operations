function MapVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations, _mapStates) {
	var self = this;

	/* save variables */
	self.parentElement = _parentElement;
	self.eventHandler = _eventHandler;
	self.mapStates = _mapStates;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize map visualization */
	self.initialize();
}

MapVis.prototype.initialize = function () {
	var self = this;

	/* map dimensions */
	self.width = 600;
	self.height = 550;

	/* get date range */
	self.minMaxDate = d3.extent(d3.entries(self.creditOperations).map(function (d) {
        return new Date(d.value["Date"]);
    }));

	/* aggregate data */
	self.aggregateData();

	/* num of operations */
	self.minMaxOperations = [d3.min(d3.entries(self.entityOperations), function(d){
		return d.value.length;
	}), d3.max(d3.entries(self.entityOperations), function(d){
		return d.value.length;
	})];

	/* scales */
	self.colorScale = d3.scale.linear()
	    .domain(self.minMaxOperations)
	    .range(["#feb24c","#800026"]);

	/* map svg */
	self.svg = self.parentElement.append("svg").attr("id" , "map").attr("width", self.width).attr("height", self.height);
	
	/* mercator projection */
	self.projection = d3.geo.mercator()
		.precision(.1)
		.center([-54, -15])	
		.scale(700)
		.translate([self.width / 2, self.height / 2]);

	/* path generator */
	self.path = d3.geo.path().projection(self.projection);

	/* define granulatiry */
	var map = self.mapStates;

	/* draw the map */
	for(var state of self.statesAcronyms) {
		self.svg.append("g")
			.attr("id", state)
			.attr("transform", "translate(50, 0)")
			.on("click", function(){
				/* get state acronym */
				var state = d3.select(this).attr("id");
				/* trigger the click event */
				self.eventHandler.mapClicked(state);
			})
			.selectAll()
			.data(topojson.feature(map, map.entities[state]).features)
			.enter()
			.append("path")
			.attr("fill", function() {
				return self.colorScale(self.entityOperations[state.toUpperCase()].length);
			})
			.attr("stroke-width", "0.3")
			.attr("stroke", "#333")
			.attr("d", self.path);
	}
}

MapVis.prototype.updateMap = function () {
	var self = this;

	/* update each state individualy */
	for(var state of self.statesAcronyms) {
		d3.select("#" + state)
			.selectAll("path")
			.attr("fill", function() {
				return self.colorScale(self.entityOperations[state.toUpperCase()].length);
			});
	}
}

MapVis.prototype.updateDate = function (startingDate, endingDate) {
	var self = this;
	/* update state list */
	self.minMaxDate[0] = startingDate;
	self.minMaxDate[1] = endingDate;
	/* aggredate data */
	self.aggregateData();	
	/* update vis */
	self.updateMap();
}

MapVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by state */
	self.entityOperations = {};

	self.creditOperations.forEach(function (d) {
		/* create a state key if not present */
		if (!self.entityOperations.hasOwnProperty(d["State"])) {
			self.entityOperations[d["State"]] = [];
		}
		/* filter using date */
		var date = new Date(d["Date"]);
		if(date <= self.minMaxDate[1] && date >= self.minMaxDate[0]){
			/* save this operation */
			self.entityOperations[d["State"]].push(d);
		}
	});
}
