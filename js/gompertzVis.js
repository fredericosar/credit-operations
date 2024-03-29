function GompertzVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations, _gompertzData) {
	var self = this;

	self.parentElement = _parentElement;
	self.eventHandler = _eventHandler;
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;
	self.gompertzData = _gompertzData;

	self.displayCurve = "AllOps";

		/* initialize time for autoplay */
	self.endingDate = new Date("Wed Oct 21 2015 00:00:00 GMT-0600 (MDT)");

	/* aggregate data */
	self.aggregateData();

	/* initialize operations visualization */
	self.initialize()
}

GompertzVis.prototype.initialize = function () {
	var self = this;

	/* map dimensions */
	self.width = $("#gompertzVis").width();

	/* scales */
	self.xScale = d3.time.scale().range([0, self.width]);
	self.yScale = d3.scale.linear().range([0, 120]);
	self.yScaleGompertz = d3.scale.linear().range([0, 120]);


	/* x */
	self.minMaxX = d3.extent(d3.entries(self.yearOperations).map(function (d) {
		return new Date(d.key);
    }));
	self.xScale.domain(self.minMaxX);

	/* y */
	var entries = d3.entries(self.yearOperations);
	self.minMaxY = [0, d3.max(entries, function(d){
		return d.value;
	})];
	self.yScale.domain(self.minMaxY);

	/* y gompertz */
	var entries = d3.entries(self.gompertzData);
	self.minMaxYGompertz = [0, d3.max(entries, function(d){
		return d.value["Operations"];
	})];
	self.yScaleGompertz.domain(self.minMaxYGompertz);	

	/* axes */
	self.xAxis = d3.svg.axis().ticks(15).tickSize(0, 0).scale(self.xScale);

	/* brush function */
	brushed = function () {
		/* trigger event for data change */
		if(self.brush.empty()){
            self.eventHandler.dateChanged(self.minMaxX[0], self.minMaxX[1]);
        }else{
            self.eventHandler.dateChanged(self.brush.extent()[0], self.brush.extent()[1]);
        }
	}

	/* create brush */
	self.brush = d3.svg.brush().on("brush", brushed);
	self.brush.x(self.xScale);

	/* gompertz curve */
	self.svg = self.parentElement.append("svg").attr("id" , "gompertzCurve").attr("width", self.width).attr("height", 150);

	/* add axes groups */
	self.svg.append("g").attr("class", "xAxis axis").attr("transform", "translate(0, 130)");

	/* draw axes */
	self.svg.select(".xAxis").call(self.xAxis);

	/* draw brush */
	self.g = self.svg.append("g")
		.attr("class", "brush").call(self.brush)
	    .selectAll("rect")
	    .attr("height", 130);

	/* append bar group */
	self.bar = self.svg.append("g").attr("id", "bars").attr("transform", "translate(0, 129) scale(1 -1)");

	/* draw legend */
	self.textDisplay = self.svg.append("text")
		.attr("transform", "translate(0, 10)")
		.style("font-size","9px")
		.attr("fill", "#fff")
		.text("Credit Requests per day");

	/* type changer */
	self.legendDisplay = self.svg.append("text")
		.attr("transform", "translate(0, 20)")
		.style("font-size","9px")
		.attr("fill", "#888")
		.text(function(){
			if(self.displayCurve == "AllOps") {
				return "[View Gompertz Function]";
			} else {
				return "[View Credit Requests per day]";
			}
		})
		.on("click", function(){
			if(self.displayCurve == "AllOps") {
				self.displayCurve = "Gompertz";
			}else {
				self.displayCurve = "AllOps";
			}
			/* aggregate data */
			self.aggregateData();
			/* update bars on click */
			self.updateBars();
		})

	var groupPlay = self.svg.append("g")
		.attr("data-step", 2)

    groupPlay.append("svg:image")
     	.attr("xlink:href", "images/play.png")
     	.attr('x',-9)
     	.attr('y',-12)
     	.attr('width', 13)
     	.attr('height', 13)
     	.attr("transform", "translate(10, 145)")
     	.on("click", function(){
     		self.autoPlay();
		});

    groupPlay.append("svg:image")
     	.attr("xlink:href", "images/stop.png")
     	.attr('x',-9)
     	.attr('y',-12)
     	.attr('width', 13)
     	.attr('height', 13)
     	.attr("transform", "translate(23, 145)")
     	.on("click", function(){
     		self.stopPlaying();
		});

	/* update bars */
	self.updateBars();

}

GompertzVis.prototype.updateBars = function () {
	var self = this;

	var entries = d3.entries(self.yearOperations);

	/* update x scale */
	self.minMaxY = [0, d3.max(entries, function(d){
		return d.value;
	})];
	self.yScale.domain(self.minMaxY);	

	/* bar group */
	var bars = self.bar.selectAll("rect").data(entries);

	/* draw bars */
	bars.enter()
		.append("rect")
		.attr("y", 0)
		.attr("height", 0)
		.attr("width", "0.6")
		.attr("x", function(d){
			return self.xScale(new Date(d.key));
		})
		.attr("fill", "#e88d0c");

	bars.exit().remove();

	bars.attr("height", function(d){
			return self.yScale(d.value);
		})
		.attr("x", function(d){
			return self.xScale(new Date(d.key));
		})

	/* update text */
	self.legendDisplay.text(function(){
		if(self.statesAcronyms.length == 1){
			return ""
		} else if(self.displayCurve == "AllOps") {
			return "[View Gompertz Function]"
		} else {
			return "[View Credit Requests per day]"
		}
	})

	self.textDisplay.text(function(){
		if(self.displayCurve == "AllOps" || self.statesAcronyms.length == 1) {
			return "Credit Requests per day"
		} else {
			return "Credit Requests on Gompertz Curve"
		}
	})

	/* gompertz curve */
	if(self.displayCurve == "Gompertz" && self.statesAcronyms.length != 1){
		/* draw lines */
		self.line = d3.svg.line()
			.x(function(d){
				return self.xScale(new Date(d.value["Date"]));
			})
			.y(function(d){
				return 130 - self.yScaleGompertz(d.value["Operations"]);
			});

		self.svg
			.append("g").attr("id", "lines")
			.append("path")
			.datum(d3.entries(self.gompertzData))
		    .attr("class", "gompertzLine")
			.attr("d", self.line);
	} else{
		d3.select("#lines").remove();
	}
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

GompertzVis.prototype.autoPlay = function () {
	var self = this;

	/* dates */
	self.startingDate = new Date("Tue Mar 19 2002 00:00:00 GMT-0700 (MST)");
	self.endingDate = new Date("Tue Mar 19 2002 00:00:00 GMT-0700 (MST)");
	self.finalDate = new Date("Wed Oct 21 2015 00:00:00 GMT-0600 (MDT)");

	/* check if should stop */
	self.keepPlaying = true;

	function updateDay() {
		if(self.keepPlaying){
			setTimeout(changeDate, 10);
	    }
	}

	function changeDate() {
		self.eventHandler.dateChanged(self.startingDate, self.endingDate);
		self.endingDate.setDate(self.endingDate.getDate() + 15);
		if(self.endingDate < self.finalDate){
	    	updateDay();
	    	self.aggregateData();
	    	self.updateBars();
	    }
	}

	updateDay();
}

GompertzVis.prototype.stopPlaying = function () {
	var self = this;
	self.keepPlaying = false;
	self.endingDate = self.finalDate;
	/* aggregate data */
	setTimeout(self.aggregateData(), 1000);
	/* update bars on click */
	setTimeout(self.updateBars(), 1200);
}

GompertzVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by date */
	self.yearOperations = [];

	self.creditOperations.forEach(function (d) {
		/* check if state is on list */
		if(self.statesAcronyms.indexOf(d["State"].toLowerCase()) != -1){
			var date = new Date(d["Date"]);
			/* filter date by autoplay */
			if(date <= self.endingDate){
				/* create a state key if not present */
				if (!self.yearOperations.hasOwnProperty(date)) {
					self.yearOperations[date] = 1;
				} else {
					self.yearOperations[date] = self.yearOperations[date] + 1;
				}
			}
		}
	});

	/* create accumulated array if Gompertz*/
	if(self.displayCurve == "Gompertz" && self.statesAcronyms.length != 1){
		/* get first year and initialize accumulated */
		var year = 2002;
		var accumulated = 0;
		/* start acumulating */
		for (var d = new Date("Tue Mar 19 2002 00:00:00 GMT-0700 (MST)"); d <= new Date("Wed Oct 21 2015 00:00:00 GMT-0600 (MDT)"); d.setDate(d.getDate() + 1)) {
			/* reset accumulated if year changes */
			if(d.getFullYear() != year){
				year = d.getFullYear();
				accumulated = 0;
			}
			/* accumulate */
			var dayTotal = self.yearOperations[d];
			if(dayTotal != undefined){
				accumulated += self.yearOperations[d];
			}
			self.yearOperations[d] = accumulated;
		}
	}
}