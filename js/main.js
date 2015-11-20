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

	/* brazilian states acronyms */
	var statesAcronyms = ["ac", "al", "am", "ap", "ba", "ce", "df", "es", "go", "ma", "mg", "ms", "mt", "pa", "pb", "pe", "pi", "pr", "rj", "rn", "ro", "rr", "rs", "sc", "se", "sp", "to"];
	var states = ["Acré", "Alagoas", "Amazonas", "Amapá", "Bahia", "Ceára", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Minas Gerais", "Mato Grosso do Sul", "Mato Grosso", "Pará", "Paraíba", "Pernambuco", "Piauí", "Paraná", "Rio de Janeiro", "Rio Grande do Norte", "Rondônia", "Roraima", "Rio Grande do Sul", "Santa Catarina", "Sergipe", "São Paulo", "Tocantins"];
	/* date formater */
	var dateFormater = d3.time.format("%d/%m/%y");

	function start() {
		/* load files using d3 queue */
		queue()	
			.defer(d3.json, 'data/credit-operations.json')
			.defer(d3.json, 'data/brazil-states.json')
			.defer(d3.json, 'data/brazil-cities.json')
			.defer(d3.json, 'data/brazil-hdi.json')
		    .await(dataLoaded);	
	}

	function dataLoaded(error, _creditOperations, _mapStates, _mapCities, _brazilHDI) {
		creditOperations = _creditOperations;
		mapStates = _mapStates;
		mapCities = _mapCities;
		brazilHDI = _brazilHDI;

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
		/* initialize credit operations */
		var creditCategoryVis = new DonutsVis(statesAcronyms, creditOperations);
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
			creditCategoryVis.updateStateList([state]);
			/* update evolution chart */
			evolutionVis.updateStateList([state]);
			/* update index chart */
			indexVis.updateStateList(states[statesAcronyms.indexOf(state)]);
		});

		/* data event */
		eventHandler.on("dateChanged", function(startingDate, endingDate){
			/* update info box */
			d3.select("#infoDates").html(dateFormater(startingDate) + " to " + dateFormater(endingDate));
			/* update map */
			mapVis.updateDate(startingDate, endingDate);
			/* update credit category type */
			creditCategoryVis.updateDate(startingDate, endingDate);
			/* update evolution  */
			evolutionVis.updateDate(startingDate, endingDate);
		});

	}

	/* let the show begin */
	start();

})();
