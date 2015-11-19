function GompertzVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations) {
	var self = this;

	self.parentElement = _parentElement;
	self.eventHandler = _eventHandler;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize operations visualization */
	self.initialize()
}

GompertzVis.prototype.initialize = function () {
	var self = this;

	/* map dimensions */
	self.width = 1400;

	/* aggregate data */
	self.aggregateData();

	/* scales */
	self.xScale = d3.time.scale().range([0, self.width]);
	self.yScale = d3.scale.linear().range([0, 117]);

	/* domain */
	var minMaxX = d3.extent(d3.entries(self.yearOperations).map(function (d) {
        return new Date(d.key);
    }));
	self.xScale.domain(minMaxX);

	var entries = d3.entries(self.yearOperations);
	var minMaxY = [d3.min(entries, function(d){
		return d.value.length;
	}), d3.max(entries, function(d){
		return d.value.length;
	})];
	self.yScale.domain(minMaxY);	

	/* axes */
	self.xAxis = d3.svg.axis().ticks(14).tickSize(0, 0).scale(self.xScale);

	/* brush function */
	brushed = function () {
		/* trigger event for data change */
		if(self.brush.empty()){
            self.eventHandler.dateChanged(minMaxX[0], minMaxX[1]);
        }else{
            self.eventHandler.dateChanged(self.brush.extent()[0], self.brush.extent()[1]);
        }
	}

	/* create brush */
	self.brush = d3.svg.brush().on("brush", brushed);
	self.brush.x(self.xScale);

	/* zoomed function */
	var zoomed = function (){
	    console.log("to implement");
	}
	/* create zoom */
	self.zoom = d3.behavior.zoom().scaleExtent([1, 5]).on("zoom", zoomed);
	self.zoom.x(self.xScale);

	/* gompertz curve */
	self.svg = self.parentElement.append("svg").attr("id" , "gompertzCurve").attr("width", self.width).attr("height", 150);

	// /* clipping svg */
	// var clipping = svg.append("clipPath")
	//     .attr("id", "priority-clip") 
	//     .append("rect")
	//     .attr("width", width)
	//     .attr("transform", "translate(" + width * 0.03 + ", 0)")
	//     .attr("height", 130);

	/* add axes groups */
	self.svg.append("g").attr("class", "xAxis axis").attr("transform", "translate(" + self.width * 0.03 + ", 130)");

	/* draw axes */
	self.svg.select(".xAxis").call(self.xAxis);

	/* draw brush and zoom */
	self.svg.append("g")
		.attr("class", "brush").call(self.brush)
	    .selectAll("rect")
	    .attr("clip-path", "url(#priority-clip)")
	    .attr("height", 130)
	    .call(self.zoom)
        .on("mousedown.zoom", null);

	/* draw legend */
	self.svg.append("text")
		.attr("transform", "translate(" + self.width * 0.03 + ", 10)")
		.style("font-size","9px")
		.attr("fill", "#fff")
		.text("Number of Operations per day");

	/* append bar group */
	self.bar = self.svg.append("g").attr("id", "bars").attr("transform", "translate(" + self.width * 0.03 + ", 129) scale(1 -1)");

	/* update bars */
	self.updateBars();

}

GompertzVis.prototype.updateBars = function () {
	var self = this;

	/* bar group */
	var bars = self.bar.selectAll("rect").data(d3.entries(self.yearOperations));

	/* draw bars */
	// bars.exit().remove();
	bars.data(d3.entries(self.yearOperations)).enter().append("rect")
		.attr("y", 0)
		.attr("height", function(d){
			return self.yScale(d.value.length);
		})
		.attr("width", "1")
		.attr("x", function(d){
			return self.xScale(new Date(d.key));
		})
		.attr("fill", "#e88d0c");
}

GompertzVis.prototype.updateStateList = function (state) {
	var self = this;
	/* update state list */
	self.statesAcronyms = state;
	/* aggredate data */
	self.aggregateData();
	/* update vis */
	self.updateBars();
}

GompertzVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by date */
	self.yearOperations = {};

	self.creditOperations.forEach(function (d) {
		/* check if state is on list */
		if(self.statesAcronyms.indexOf(d["State"].toLowerCase()) != -1){
			var date = new Date(d["Date"]);
			/* create a state key if not present */
			if (!self.yearOperations.hasOwnProperty(date)) {
				self.yearOperations[date] = [];
			}
			/* save this operation */
			self.yearOperations[date].push(d);
		}
	});
}