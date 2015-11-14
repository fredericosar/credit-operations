function DonutsVis(_statesAcronyms, _creditOperations, _filterBy) {
	var self = this;
	
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* define type of donut chart */
	self.filterBy = _filterBy;

	/* div selector */
	if(self.filterBy == "Creditor's type"){
		self.divId = "#creditTypeChart";
	}else if(self.filterBy == "Category"){
		self.divId = "#creditCategoryChart";
	}

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

	/* C3 Library - Pie Chart */
	self.chart = c3.generate({
		bindto: self.divId,
		size: {
			height: 175,
			width: 280
		},
		data: {
			json: self.creditorType,
			type : 'donut'
        	// onclick: function (d, i) { console.log("onclick", d, i); },
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
            position: 'right'
        },
	});

}

DonutsVis.prototype.updateDonut = function () {
	var self = this;

	/* agregate Data */
	self.aggregateData();
	
	/* update data */
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