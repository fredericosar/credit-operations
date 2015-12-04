(function () {

	/* json for brazilian map - granularity: states */
	var mapStates = [];
	/* json for brazilian map - granularity: cities */
	var mapCities = [];
	/* json for credit operations */
	var creditOperations = [];
	/* json for hdi */
	var brazilHDI = [];
	var entitiesHDI = [];
	/* gompertz data */
	var gompertzData = [];

	/* brazilian states acronyms */
	var statesAcronyms = ["ac", "al", "am", "ap", "ba", "ce", "df", "es", "go", "ma", "mg", "ms", "mt", "pa", "pb", "pe", "pi", "pr", "rj", "rn", "ro", "rr", "rs", "sc", "se", "sp", "to"];
	var statesNames = ["Acre", "Alagoas", "Amazonas", "Amapa", "Bahia", "Ceara", "Distrito Federal", "Espirito Santo", "Goias", "Maranhao", "Minas Gerais", "Mato Grosso do Sul", "Mato Grosso", "Para", "Paraiba", "Pernambuco", "Piaui", "Parana", "Rio de Janeiro", "Rio Grande do Norte", "Rondonia", "Roraima", "Rio Grande do Sul", "Santa Catarina", "Sergipe", "Sao Paulo", "Tocantins"];
	/* date formater */
	var dateFormater = d3.time.format("%d/%m/%y");

	function start() {
		/* load files using d3 queue */
		queue()	
			.defer(d3.json, 'data/credit-operations.json')
			.defer(d3.json, 'data/brazil-states.json')
			.defer(d3.json, 'data/brazil-cities.json')
			.defer(d3.json, 'data/brazil-hdi.json')
			.defer(d3.json, 'data/credit-gompertz.json')
		    .await(dataLoaded);	
	}

	function dataLoaded(error, _creditOperations, _mapStates, _mapCities, _brazilHDI, _gompertzData) {
		creditOperations = _creditOperations;
		mapStates = _mapStates;
		mapCities = _mapCities;
		brazilHDI = _brazilHDI;
		gompertzData = _gompertzData;

		/* get date range */
		minMaxDate = d3.extent(d3.entries(creditOperations).map(function (d) {
			return new Date(d.value["Date"]);
		}));
		/* create selected states */
		self.selectedState = statesAcronyms;
		/* agregate */
		agregate();
		/* remove loading icon */
		d3.select("#loading").remove();
		/* add tutorial page */
		d3.select("#tutorial").style("display", "block");
		/* initialize visualization */
		initialize();
	}

	function agregate(){
		self.filteredOperations = [];

		creditOperations.forEach(function (d) {
			/* check if state is selected */
			if(self.selectedState.indexOf(d["State"].toLowerCase()) != -1){
				/* get date from operation */
				var date = new Date(d["Date"]);
				/* check if under the selected time */
				if(date <= self.minMaxDate[1] && date >= self.minMaxDate[0]){
					filteredOperations.push(d);
				}
			}
		});
	}

	function initialize() {
		/* event handler */
		var eventHandler = d3.dispatch("mapClicked", "dateChanged", "reset");
		/* initialize gompertz curve */
		var gompertzVis = new GompertzVis(d3.select("#gompertzVis"), eventHandler, statesAcronyms, creditOperations, gompertzData);
		/* Initialize creditorApplicantRelationVis Node-link diagram */
		// var creditorApplicantVis = new CreditorApplicantRelationVis(d3.select("#creditorApplicantVis"), eventHandler, statesAcronyms, creditOperations);
		
		/* initialize map */
		var mapVis = new MapVis(d3.select("#mapVis"), eventHandler, statesAcronyms, filteredOperations, mapStates);
		/* initialize credit operations category */
		var creditCategoryVis = new DonutsVis(statesAcronyms, filteredOperations, "Category");
		/* initialize credit operations type */
		var creditTypeChart = new DonutsVis(statesAcronyms, filteredOperations, "Creditor's type");
		/* initialize human index  */
		var indexVis = new IndexVis(statesAcronyms, statesNames, brazilHDI);
		/* initialize credit evolution operations */
		var evolutionVis = new EvolutionVis(statesAcronyms, filteredOperations);

		/* click event */
		eventHandler.on("mapClicked", function(states){
			self.selectedState = states;
			/* agregate data again */
			agregate();
			/* update info box */
			if(states.length == 1){
				d3.select("#infoName").html(statesNames[statesAcronyms.indexOf(states[0])]);
			} else {
				d3.select("#infoName").html("Brazil");
			}
			d3.select("#infoRequests").html("Number of Credit Requests: " + filteredOperations.length);
			/* update map */
			mapVis.updateOperations(self.filteredOperations);
			/* update credit category */
			creditCategoryVis.updateOperations(self.filteredOperations);
			/* update credit type */
			creditTypeChart.updateOperations(self.filteredOperations);
			/* update index chart */
			var indexNames = [];
			if(states.length == 1){
				indexNames.push(statesNames[statesAcronyms.indexOf(states[0])]);
			}
			indexVis.updateStateList(indexNames);
			/* update evolution chart */
			evolutionVis.updateOperations(self.filteredOperations);
		// 	/* update gompertz curve */
		// 	gompertzVis.updateStateList([state]);
		});

		/* data change event */
		eventHandler.on("dateChanged", function(startingDate, endingDate){
			self.minMaxDate[0] = startingDate;
			self.minMaxDate[1] = endingDate;
			/* update info box */
			d3.select("#infoDates").html("From " + dateFormater(startingDate) + " to " + dateFormater(endingDate));
			/* agregate data again */
			agregate();
			/* update map */
			mapVis.updateOperations(self.filteredOperations);
			/* update credit category type */
			creditCategoryVis.updateOperations(self.filteredOperations);
			/* update credit type */
			creditTypeChart.updateOperations(self.filteredOperations);
		// 	/* update evolution  */
		// 	evolutionVis.updateDate(startingDate, endingDate);
		});

	}

	/* let the show begin */
	start();

})();
