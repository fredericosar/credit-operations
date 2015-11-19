function IndexVis(_statesAcronyms, _creditOperations) {
	var self = this;
	
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize operations visualization */
	self.initialize()
}

IndexVis.prototype.initialize = function () {
	var self = this;

	/* get date range */
	self.minMaxDate = d3.extent(d3.entries(self.creditOperations).map(function (d) {
		return new Date(d.value["Date"]);
	}));

	/* agregate Data */
	self.aggregateData();

	/* C3 Library - Pie Chart */
	self.chart = c3.generate({
		bindto: "#indexVis",
		size: {
			width: 250
		},
		data: {
		        x: 'x',
		        columns: [
		            ['x',
		            new Date('2001-01-01'),
		            new Date('2011-01-01')],
		            ['data1', 0.8, 0.2]
		        ],
		        type: 'bar'
		    },
		    axis: {
		        x: {
		            type: 'timeseries',
		            tick: {
		                format: '%Y',
		                values: [
		                    new Date('2001-01-01'), 
		                    new Date('2011-01-01')
		                ]
		            }
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
            show: false
        }
	});

}

IndexVis.prototype.updateDonut = function () {
	var self = this;

	/* agregate Data */
	self.aggregateData();
	
	/* update data */
	self.chart.load({
		json: self.creditorType
	});
}

IndexVis.prototype.updateDate = function (startingDate, endingDate) {
	var self = this;
	/* update state list */
	self.minMaxDate[0] = startingDate;
	self.minMaxDate[1] = endingDate;
	/* aggredate data */
	self.aggregateData();	
	/* update vis */
	self.updateDonut();
}

IndexVis.prototype.updateStateList = function (state) {
	var self = this;
	/* update state list */
	self.statesAcronyms = state;
	/* aggredate data */
	self.aggregateData();
	/* update vis */
	self.updateDonut();
}

IndexVis.prototype.aggregateData = function () {
	var self = this;

	self.creditorType = {};

	for(var i = 0; i < self.creditOperations.length; i++){
		/* filter by the state acronyms list */
		if(self.statesAcronyms.indexOf(self.creditOperations[i]["State"].toLowerCase()) != -1){
			/* filter using date */
			var date = new Date(self.creditOperations[i]["Date"]);
			if(date <= self.minMaxDate[1] && date >= self.minMaxDate[0]){
				/* filter by given category */
				var type = self.creditOperations[i]["Category"];
				if (!self.creditorType.hasOwnProperty(type)) {
					self.creditorType[type] = 1;
				} else {
					self.creditorType[type] = parseInt(self.creditorType[type]) + 1;
				}
			}
		}
	}
}