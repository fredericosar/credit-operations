function IndexVis(_statesAcronyms, _states, _brazilHDI) {
	var self = this;
	
	self.statesAcronyms = _statesAcronyms;
	self.brazilHDI = _brazilHDI;
	self.states = _states;

	/* display states */
	self.displayStates = self.states.slice();
	self.displayStates.push("Brazil");

	/* initialize operations visualization */
	self.initialize()
}

IndexVis.prototype.initialize = function () {
	var self = this;

	/* color scale */
	var colorScale = d3.scale.linear()
        .domain([0.3, 0.739])
        .range(["#fee5d9","#99000d"]);

	/* C3 Library - Line Chart */
	self.chart = c3.generate({
		bindto: "#indexVis",
        data: {
	        json: self.brazilHDI,
	        keys:{
	        	x: "Year",
	        	value: self.displayStates
	        },
	        type: 'bar',
	        color: function (color, data) {
	        	if(data.id == "Brazil") {
	        		return "#fcb04c";
	        	} else {
	        		return colorScale(data.value);
	        	}
	        }
	    },
	    axis: {
	    	x: {
	    		type: "category"
	    	},
	    	y: {
	    		label: 'Human Development Index'
	    	}
	    },
	    legend : {
	    	show: false
	    }
	});

	/* hide all other states */
	self.chart.hide(self.states);

}

IndexVis.prototype.updateChart = function () {
	var self = this;
	/* hide everything */
	self.chart.hide(self.states);
	/* show new entity */
	self.chart.show(self.entities);
}

IndexVis.prototype.updateStateList = function (entities) {
	var self = this;
	/* update paralel state */
	self.entities = entities;
	/* update vis */
	self.updateChart();
}