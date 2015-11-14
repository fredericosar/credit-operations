function EvolutionVis( _statesAcronyms, _creditOperations) {
	var self = this;

	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;

	/* initialize operations visualization */
	self.initialize()
}

EvolutionVis.prototype.initialize = function () {
	var self = this;

	/* aggregate data */
	self.aggregateData();

	var test = [{
            date: '2012',
            Infrastructure: 200,
            Education: 200
        }, {
            date: '2012',
            Infrastructure: 100,
            Education: 300
        }, {
            date: '2013',
            Infrastructure: 300,
            Education: 200
        }, {
            date: '2014',
            Infrastructure: 400,
            Education: 100
        }];

	console.log(self.categoryOperations);
	console.log(test);

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
	    }
	});
}

EvolutionVis.prototype.aggregateData = function () {
	var self = this;

	/* aggregate operations by date */
	var categoryOperations = {};

	self.creditOperations.forEach(function (d) {
		/* check if state is on list */
		if(self.statesAcronyms.indexOf(d["State"].toLowerCase()) != -1){
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
	});

	self.categoryOperations = [];
	for (var year in categoryOperations) {
		var entry = {'date' : year};
		for (var category in categoryOperations[year]){
			entry = $.extend({}, entry, {[category] : categoryOperations[year][category].length});
		}
		self.categoryOperations.push(entry);
	}

	// self.educationOperations = [];
	// for (var key in categoryOperations["Infrastructure"]) {
	// 	if (categoryOperations["Education"][key]) {
	// 		var entry = {'Year' : key, 'Total' : categoryOperations["Education"][key].length} 
	// 		self.educationOperations.push(entry);
	//     }
	// }
}