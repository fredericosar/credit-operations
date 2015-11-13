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
	var width = 1400;

	/* aggregate data */
	self.aggregateData();

	/* entries */
	var entries = d3.entries(self.yearOperations);

	/* scales */
	var xScale = d3.time.scale().range([0, width]);
	var yScale = d3.scale.linear().range([0, 117]);

	/* domain */
	var minMaxX = d3.extent(entries.map(function (d) {
        return new Date(d.key);
    }));
	xScale.domain(minMaxX);

	var entries = d3.entries(self.yearOperations);
	var minMaxY = [d3.min(entries, function(d){
		return d.value.length;
	}), d3.max(entries, function(d){
		return d.value.length;
	})];
	yScale.domain(minMaxY);	

	/* axes */
	var xAxis = d3.svg.axis().ticks(14).tickSize(0, 0).scale(xScale);

	/* brush function */
	brushed = function () {
		/* trigger event for data change */
		if(self.brush.empty()){
            self.eventHandler.dataChanged(minMaxX[0], minMaxX[1]);
        }else{
            self.eventHandler.dataChanged(self.brush.extent()[0], self.brush.extent()[1]);
        }
	}

	/* create brush */
	self.brush = d3.svg.brush().on("brush", brushed);
	self.brush.x(xScale);

	/* zoomed function */
	var zoomed = function (){
	    console.log("?");
	}
	/* create zoom */
	self.zoom = d3.behavior.zoom().scaleExtent([1, 5]).on("zoom", zoomed);
	self.zoom.x(xScale);

	/* gompertz curve */
	var svg = self.parentElement.append("svg").attr("id" , "gompertzCurve").attr("width", width).attr("height", 150);

	/* clipping svg */
	var clipping = svg.append("clipPath")
	    .attr("id", "priority-clip") 
	    .append("rect")
	    .attr("width", width)
	    .attr("transform", "translate(" + width * 0.03 + ", 0)")
	    .attr("height", 130);

	/* add axes groups */
	svg.append("g").attr("class", "xAxis axis").attr("transform", "translate(" + width * 0.03 + ", 130)");

	/* draw axes */
	svg.select(".xAxis").call(xAxis);

	/* draw brush and zoom */
	svg.append("g")
		.attr("class", "brush").call(self.brush)
	    .selectAll("rect")
	    .attr("clip-path", "url(#priority-clip)")
	    .attr("height", 130)
	    .call(self.zoom)
        .on("mousedown.zoom", null);

	/* draw legend */
	svg.append("text")
		.attr("transform", "translate(" + width * 0.03 + ", 10)")
		.style("font-size","10px")
		.attr("fill", "#fff")
		.text("Number of Operations");

	/* bar group */
	var bars = svg.append("g").attr("id", "bars").attr("transform", "translate(" + width * 0.03 + ", 129) scale(1 -1)").selectAll(".bar").data(d3.entries(self.yearOperations));
	
	/* draw bars */
	bars.exit().remove();
	bars.enter().append("rect")
		.attr("y", 0)
		.attr("height", function(d){
			return yScale(d.value.length);
		})
		.attr("width", "1")
		.attr("x", function(d){
			return xScale(new Date(d.key));
		})
		.attr("fill", "#e88d0c");
}

GompertzVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by date */
	self.yearOperations = [];

	self.creditOperations.forEach(function (d) {
		/* check if state is on list */
		if(self.statesAcronyms.indexOf(d["State"].toLowerCase()) != -1){
			/* create a state key if not present */
			if (!self.yearOperations.hasOwnProperty(d["Date"])) {
				self.yearOperations[d["Date"]] = [];
			}
			/* save this operation */
			self.yearOperations[d["Date"]].push(d);
		}
	});
}