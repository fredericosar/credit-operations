(function () {

	/* json for brazilian map - granularity: states */
	var mapStates = [];
	/* json for brazilian map - granularity: cities */
	var mapCities = [];
	/* json for credit operations */
	var creditOperations = [];

	/* brazilian states acronyms */
	var statesAcronyms = ["ac", "al", "am", "ap", "ba", "ce", "df", "es", "go", "ma", "mg", "ms", "mt", "pa", "pb", "pe", "pi", "pr", "rj", "rn", "ro", "rr", "rs", "sc", "se", "sp", "to"];

	function start() {
		/* load files using d3 queue */
		queue()	
			.defer(d3.json, 'data/credit-operations.json')
			.defer(d3.json, 'data/brazil-states.json')
			.defer(d3.json, 'data/brazil-cities.json')
		    .await(dataLoaded);	
	}

	function dataLoaded(error, _creditOperations, _mapStates, _mapCities) {
		mapStates = _mapStates;
		mapCities = _mapCities;
		creditOperations = _creditOperations;

		/* remove loading icon */
		d3.select("#loading").remove();

		/* initialize visualization */
		initialize();
	}

	function initialize() {
		/* event handler */
		var eventHandler = d3.dispatch("mapClicked", "dateChanged");
		/* initialize gompertz curve */
		var gompertzVis = new GompertzVis(d3.select("#gompertzVis"), eventHandler, statesAcronyms, creditOperations);
		/* Initialize creditorApplicantRelationVis Node-link diagram */
		// var creditorApplicantVis = new CreditorApplicantRelationVis(d3.select("#creditorApplicantVis"), eventHandler, statesAcronyms, creditOperations);
		/* initialize map */
		var mapVis = new MapVis(d3.select("#mapVis"), eventHandler, statesAcronyms, creditOperations, mapStates);
		/* initialize credit operations type */
		var creditTypeVis = new DonutsVis(statesAcronyms, creditOperations, "Creditor's type");
		/* initialize credit operations */
		var creditCategoryVis = new DonutsVis(statesAcronyms, creditOperations, "Category");
		/* initialize credit evolution operations */
		var evolutionVis = new EvolutionVis(statesAcronyms, creditOperations);
		/* initialize human index  */
		var indexVis = new IndexVis(statesAcronyms, creditOperations);

		/* click event */
		eventHandler.on("mapClicked", function(state){
			/* update gompertz curve */
			gompertzVis.updateStateList([state]);
			/* update credit type donut */
			creditTypeVis.updateStateList([state]);
			/* update credit category type */
			creditCategoryVis.updateStateList([state]);
			/* update evolution  */
			evolutionVis.updateStateList([state]);
		});

		/* data event */
		eventHandler.on("dateChanged", function(startingDate, endingDate){
			/* update map */
			mapVis.updateDate(startingDate, endingDate);
			/* update credit type donut */
			creditTypeVis.updateDate(startingDate, endingDate);
			/* update credit category type */
			creditCategoryVis.updateDate(startingDate, endingDate);
			/* update evolution  */
			evolutionVis.updateDate(startingDate, endingDate);
		});

	}

	/* let the show begin */
	start();

})();
