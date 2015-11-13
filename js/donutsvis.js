function DonutsVis(_parentElement, _statesAcronyms, _creditOperations, _filterBy) {
	var self = this;

	self.parentElement = _parentElement;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* define type of donut chart */
	self.filterBy = _filterBy;

	/* Type ID selector */
	if(self.filterBy == "Creditor's type"){
		self.divId = "creditorsType";
	}else if(self.filterBy == "Category"){
		self.divId = "creditorsCategory";
	}

	/* initialize operations visualization */
	self.initialize()
}

/* insights from http://bl.ocks.org/mbostock/3888852 */
DonutsVis.prototype.initialize = function () {
	var self = this;

	/* chart dimensions */
	var width = 350,
		height = 200,
		radius = 100;

	/* get date range */
	self.minMaxDate = d3.extent(d3.entries(self.creditOperations).map(function (d) {
        return new Date(d.value["Date"]);
    }));

	/* aggregate data */
	self.aggregateData();

	/* colors */
	self.colors = ["#de2d26", "#fc8d59", "#1a9850", "#756bb1", "#3182bd", "#8c510a", "#e9a3c9", "#a1d76a"];

	/* arcs */
	self.arc = d3.svg.arc()
	    .outerRadius(radius - 20)
	    .innerRadius(radius - 60);

	/* pie layout */
    self.pie = d3.layout.pie()
   		.padAngle(.01)
        .value(function(d) {
        	return d.value; 
        }).sort(null);

	/* map svg */
	self.svg = self.parentElement.append("svg").attr("id" , self.divId).attr("width", width).attr("height", height);

	/* update donut */
	self.updateDonut();

	/* append hover legend */
	self.hoverLegend = self.svg.append("text")
		.style("font-size", radius / 4 + "px")
		.attr("font-weight", "bold")
		.attr("transform", "translate(50, 100)");

	/* draw legend */
	var legend = d3.select("#" + self.divId).append("svg")
	  .selectAll("g")
	  .data(self.creditorEntries)
	  .enter().append("g")
	  .attr("transform", function(d, i) { 
	  	return "translate(190," + ((i * 20) + 30 )+ ")"; 
	  });

	legend.append("circle")
	  .attr("r", 6)
	  .style("fill", function(d, i) { 
	  	return self.colors[i]; 
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

DonutsVis.prototype.updateDonut = function () {
	var self = this;

	var chart = self.svg.selectAll("path").data(self.pie(self.creditorEntries));

	chart.enter().append("g")
		.attr("transform", "translate(80, 100)")
		.append("path")
		.attr("d", self.arc)
		.style("fill", function(d, i){
			return self.colors[i];
		});

	chart.exit().remove();

	chart.attr("d", self.arc)
		.on("mouseover", function(d, i){
			self.hoverLegend.text(d.value);
			self.hoverLegend.attr("fill", self.colors[i]);
        })
        .on("mouseout", function () {
        	self.hoverLegend.text("");
        })
}

DonutsVis.prototype.updateDate = function (startingDate, endingDate) {
	var self = this;
	/* update state list */
	self.minMaxDate[0] = startingDate;
	self.minMaxDate[1] = endingDate;
	/* aggredate data */
	self.aggregateData();	
	/* update vis */
	self.updateDonut();
}

DonutsVis.prototype.updateStateList = function (state) {
	var self = this;
	/* update state list */
	self.statesAcronyms = state;
	/* aggredate data */
	self.aggregateData();
	/* update vis */
	self.updateDonut();
}

DonutsVis.prototype.aggregateData = function () {
	var self = this;

	self.creditorType = {};

	for(var i = 0; i < self.creditOperations.length; i++){
		/* filter by the state acronyms list */
		if(self.statesAcronyms.indexOf(self.creditOperations[i]["State"].toLowerCase()) != -1){
			/* filter using date */
			var date = new Date(self.creditOperations[i]["Date"]);
			if(date <= self.minMaxDate[1] && date >= self.minMaxDate[0]){
				/* filter by given category */
				var type = self.creditOperations[i][self.filterBy];
				if (!self.creditorType.hasOwnProperty(type)) {
					self.creditorType[type] = 1;
				} else {
					self.creditorType[type] = parseInt(self.creditorType[type]) + 1;
				}
			}
		}
	}

	self.creditorEntries = d3.entries(self.creditorType);
}