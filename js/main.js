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
	var states = ["Acre", "Alagoas", "Amazonas", "Amapa", "Bahia", "Ceara", "Distrito Federal", "Espirito Santo", "Goias", "Maranhao", "Minas Gerais", "Mato Grosso do Sul", "Mato Grosso", "Para", "Paraiba", "Pernambuco", "Piaui", "Parana", "Rio de Janeiro", "Rio Grande do Norte", "Rondonia", "Roraima", "Rio Grande do Sul", "Santa Catarina", "Sergipe", "Sao Paulo", "Tocantins"];
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

		/* remove loading icon */
		d3.select("#loading").remove();
		// /* add tutorial page */
		d3.select("#tutorial").style("display", "block");
		/* initialize visualization */
		initialize();
	}

	function initialize() {
		/* event handler */
		var eventHandler = d3.dispatch("mapClicked", "dateChanged");
		/* initialize gompertz curve */
		var gompertzVis = new GompertzVis(d3.select("#gompertzVis"), eventHandler, statesAcronyms, creditOperations, gompertzData);
		/* Initialize creditorApplicantRelationVis Node-link diagram */
		// var creditorApplicantVis = new CreditorApplicantRelationVis(d3.select("#creditorApplicantVis"), eventHandler, statesAcronyms, creditOperations);
		/* initialize map */
		var mapVis = new MapVis(d3.select("#mapVis"), eventHandler, statesAcronyms, creditOperations, mapStates);
		/* initialize credit operations category */
		var creditCategoryVis = new DonutsVis(statesAcronyms, creditOperations, "Category");
		/* initialize credit operations type */
		var creditTypeChart = new DonutsVis(statesAcronyms, creditOperations, "Creditor's type");
		/* initialize credit evolution operations */
		var evolutionVis = new EvolutionVis(statesAcronyms, creditOperations);
		/* initialize human index  */
		var indexVis = new IndexVis(statesAcronyms, states, brazilHDI);

		/* click event */
		eventHandler.on("mapClicked", function(state){
			/* update info box */
			d3.select("#infoName").html(states[statesAcronyms.indexOf(state)]);
			/* update gompertz curve */
			gompertzVis.updateStateList([state]);
			/* update credit category type */
			// creditCategoryVis.updateStateList([state]);
			/* update evolution chart */
			evolutionVis.updateStateList([state]);
			/* update index chart */
			indexVis.updateStateList(states[statesAcronyms.indexOf(state)]);
		});

		/* data event */
		eventHandler.on("dateChanged", function(startingDate, endingDate){
			/* update info box */
			// d3.select("#infoDates").html(dateFormater(startingDate) + " to " + dateFormater(endingDate));
			/* update map */
			// mapVis.updateDate(startingDate, endingDate);
			/* update credit category type */
			// creditCategoryVis.updateDate(startingDate, endingDate);
			/* update evolution  */
			// evolutionVis.updateDate(startingDate, endingDate);
		});

	}

	/* let the show begin */
	start();

})();
