function DonutsVis(_statesAcronyms, _creditOperations, _filterBy) {
	var self = this;
	
	self.statesAcronyms = _statesAcronyms;
	self.creditOperations = _creditOperations;
	self.filterBy = _filterBy;

	/* set creditor type variable */
	self.creditorType = [];

	/* filter operations */
	self.filter();

	/* initialize operations visualization */
	self.initialize()
}

DonutsVis.prototype.initialize = function () {
	var self = this;

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
            position: 'right'
        }
	});
}

DonutsVis.prototype.filter = function () {
	var self = this;

	for(var type in self.creditorType){
		self.creditorType[type] = 0;
	}

	for(var i = 0; i < self.creditOperations.length; i++){
		/* filter by given category */
		var type = self.creditOperations[i][self.filterBy];
		if (!self.creditorType.hasOwnProperty(type)) {
			self.creditorType[type] = 1;
		} else {
			self.creditorType[type] = parseInt(self.creditorType[type]) + 1;
		}
	}
}

DonutsVis.prototype.updateOperations = function (operations) {
	var self = this;
	/* update operations based on filter */
	self.creditOperations = operations;
	/* filter data */
	self.filter();
	/* update visualization */
	self.updateDonut();
}

DonutsVis.prototype.updateDonut = function () {
	var self = this;
	/* update data on chart */
	self.chart.load({
		json: self.creditorType
	});
}