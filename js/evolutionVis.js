function EvolutionVis(_statesAcronyms, _creditOperations) {
	var self = this;

	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* filter operations */
	self.filter();

	/* initialize operations visualization */
	self.initialize()
}

EvolutionVis.prototype.initialize = function () {
	var self = this;

	self.chart = c3.generate({
	    bindto: "#evolutionVis",
        data: {
	        json: self.categoryOperations,
	        keys: {
	        	x: 'Date',
	        	value: ['Infrastructure', 'Education', 'Other', 'Health and Sanitation', 'Fiscal', 'Environment', 'Multiple areas', 'Safety']
	        }
	    },
	    axis: {
	    	x: {
	    		type: 'category'
	    	},
	    	y: {
	    		label: 'Number of Operations'
	    	}
	    },
	    legend: {
	    	position: 'right'
        }
	});
}

EvolutionVis.prototype.filter = function () {
	var self = this;
	/* aggregate operations by date */
	var categoryOperations = {};

	self.creditOperations.forEach(function (d) {
		/* create a category key if not present */
		var dateFormater = d3.time.format("%Y");
		var date = dateFormater(new Date(d["Date"]));
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
	});

	self.categoryOperations = [];
	for (var year in categoryOperations) {
		var entry = {'Date' : year};
		for (var category in categoryOperations[year]){
			entry = $.extend({}, entry, {[category] : categoryOperations[year][category].length});
		}
		self.categoryOperations.push(entry);
	}

	console.log(self.categoryOperations);
}

EvolutionVis.prototype.updateOperations = function (operations) {
	var self = this;
	/* update operations based on filter */
	self.creditOperations = operations;
	/* filter data */
	self.filter();
	/* update visualization */
	self.updateEvolution();
}

EvolutionVis.prototype.updateEvolution = function () {
	var self = this;
	/* update data on chart */
	self.chart.load({
		json: self.categoryOperations,
		keys: {
			x: 'Date',
			value: ['Infrastructure', 'Education', 'Other', 'Health and Sanitation', 'Fiscal', 'Environment', 'Multiple areas', 'Safety']
		}
	});
}