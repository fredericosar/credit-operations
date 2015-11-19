function EvolutionVis( _statesAcronyms, _creditOperations) {
	var self = this;

	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize operations visualization */
	self.initialize()
}

EvolutionVis.prototype.initialize = function () {
	var self = this;

	/* get date range */
	self.minMaxDate = d3.extent(d3.entries(self.creditOperations).map(function (d) {
        return new Date(d.value["Date"]);
    }));

	/* aggregate data */
	self.aggregateData();

	self.chart = c3.generate({
	    bindto: "#evolutionVis",
        data: {
	        json: self.categoryOperations,
	        keys: {
	            x: 'date',
	            value: ['Infrastructure', 'Education', 'Other', 'Health', 'Fiscal', 'Environment', 'Multiple Areas', 'Safety']
	        }
	    },
	    axis: {
	    	x: {
	    		type: 'category'
	    	},
	    },
	    legend: {
	        show: false
	    }
	});
}

EvolutionVis.prototype.updateEvolution = function () {
	var self = this;
	/* update data on chart */
	self.chart.load({
		json: self.categoryOperations,
		keys: {
	            x: 'date',
	            value: ['Infrastructure', 'Education', 'Other', 'Health', 'Fiscal', 'Environment', 'Multiple Areas', 'Safety']
	        }
	});
}

EvolutionVis.prototype.updateDate = function (startingDate, endingDate) {
	var self = this;
	/* update state list */
	self.minMaxDate[0] = startingDate;
	self.minMaxDate[1] = endingDate;
	/* aggredate data */
	self.aggregateData();		
	/* update vis */
	self.updateEvolution();
}

EvolutionVis.prototype.updateStateList = function (state) {
	var self = this;
	/* update state list */
	self.statesAcronyms = state;
	/* aggredate data */
	self.aggregateData();
	/* update vis */
	self.updateEvolution();
}

EvolutionVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by date */
	var categoryOperations = {};

	self.creditOperations.forEach(function (d) {
		/* check if state is on list */
		if(self.statesAcronyms.indexOf(d["State"].toLowerCase()) != -1){
			/* filter using date */
			var date = new Date(d["Date"]);
			if(date <= self.minMaxDate[1] && date >= self.minMaxDate[0]){
				/* create a category key if not present */
				var formater = d3.time.format("%Y");
				var date = formater(new Date(d["Date"]));
				if (!categoryOperations.hasOwnProperty(date)) {
					categoryOperations[date] = {};
				}
				/* create the year key if not present */
				var category = d["Category"];
				if (!categoryOperations[date].hasOwnProperty(category)) {
					categoryOperations[date][category] = [];
				}
				/* save this operation */
				categoryOperations[date][category].push(d);
			}
		}
	});

	self.categoryOperations = [];
	for (var year in categoryOperations) {
		var entry = {'date' : year};
		for (var category in categoryOperations[year]){
			entry = $.extend({}, entry, {[category] : categoryOperations[year][category].length});
		}
		self.categoryOperations.push(entry);
	}
}