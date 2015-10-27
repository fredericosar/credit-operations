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

		/* initialize visualization */
		initialize();
	}

	function filterStateOperations(){

	}

	function initialize() {
		/* event handler */
		var eventHandler = d3.dispatch("mapClicked");
		/* initialize gompertz curve */
		var gompertzVis = new GompertzVis(d3.select("#gompertzVis"), statesAcronyms, creditOperations);
		/* initialize map */
		var mapVis = new MapVis(d3.select("#mapVis"), eventHandler, statesAcronyms, creditOperations, mapStates, mapCities);
		/* initialize credit operations */
		var credVis = new CredVis(d3.select("#credVis"), statesAcronyms, creditOperations);

		/* main events */
		eventHandler.on("mapClicked", function(state){
			/* update state acronyms list */
			mapVis.update([state]);
			/* update gompertz curve */
			gompertzVis.update([state]);
			/* update credit  operation */
			credVis.update([state]);
		});
	}

	/* let the show begin */
	start();

})();