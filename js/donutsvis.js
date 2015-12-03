function DonutsVis(_statesAcronyms, _creditOperations, _filterBy) {
	var self = this;
	
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;
	self.filterBy = _filterBy;

	/* initialize operations visualization */
	self.initialize()
}

DonutsVis.prototype.initialize = function () {
	var self = this;
	
	/* get date range */
	self.minMaxDate = d3.extent(d3.entries(self.creditOperations).map(function (d) {
		return new Date(d.value["Date"]);
	}));

	/* agregate Data */
	self.aggregateData();

	/* location */
	if(self.filterBy == "Category") {
		self.divId = "#creditCategoryChart";
	}

	if(self.filterBy == "Creditor's type"){
		self.divId = "#creditTypeChart";
	}

	/* C3 Library - Pie Chart */
	self.chart = c3.generate({
		bindto: self.divId,
		size: {
			width: 380
		},
		data: {
			json: self.creditorType,
			type : 'donut'
        },
        donut: {
        	label : {
        		show: false
        	}
        },
        tooltip: {
        	format: {
        		value: function (value) {
        			return value;
        		}
        	}
        },
        legend: {
            // show: false
            position: 'right'
        }
	});

	/* change chart */
	d3.select(self.divId)
		.selectAll("svg")
		.append("text")
		.attr("transform", "translate(7, 190)")
		.style("font-size","9px")
		.attr("fill", "#777");

}

DonutsVis.prototype.updateDonut = function () {
	var self = this;
	/* update data on chart */
	self.chart.load({
		json: self.creditorType
	});
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
}