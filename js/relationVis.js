function CreditorApplicantRelationVis(_parentElement, _eventHandler, _statesAcronyms, _creditOperations) {
    var self = this;

    self.parentElement = _parentElement;
    self.eventHandler = _eventHandler;
    self.statesAcronyms = _statesAcronyms;
    self.creditOperations = _creditOperations;

    self.deriveCreditorApplicantData();

    /* initialize operations visualization */
    self.initialize()
}

// Currently each object has Applicant and Creditor information.
// There is no way to distinguish between creditor and applicants
// This function will create creditor and applicants data
CreditorApplicantRelationVis.prototype.deriveCreditorApplicantData = function() {
    var self = this;
    var creditors = {};
    var applicants = {};
    var count = 0;
    var credCount = 0;
    var appCount = 0;

    self.vertices = []
    self.edges = []


    console.log("In deriveCreditorApplicantData");
    for(var i=0; i<50; i++) {
        console.log(self.creditOperations[i]);
    }

    self.creditOperations.forEach( function(d) {
        if(creditors[d.Creditor] == undefined) {
            var creditOp = {};
            creditOp.type = "Creditor";
            creditOp.id = count;
            creditOp.node = d;
            creditors[d.Creditor] = count;
            count++;
            self.vertices.push(creditOp);
        }

        if(applicants[d.Entity] == undefined) {
            var creditOp = {};
            creditOp.type = "Applicant";
            creditOp.id = count;
            creditOp.node = d;
            applicants[d.Entity] = count;
            count++;
            self.vertices.push(creditOp);
        }
    });

    console.log("Total Records    = ", self.creditOperations.length)
    console.log("Total Vertices   = ", credCount, self.vertices.length)
    console.log("TOatl Applicants = ", appCount, applicants.length)
    console.log("TOatl Creditors  = ", appCount, creditors.length)
    console.log(creditors);

    /*
    var indexMap = {}
    creditors.forEach( function(d){
        var vertice;
        vertice = d;
        vertice.type = "Creditor";
        self.vertices.push(vertice)

        indexMap[vertice.Creditor] = count
        count++
    })

    applicants.forEach( function(d){
        var vertice;
        vertice = d;
        vertice.type = "Applicant";
        self.vertices.push(vertice)

        indexMap[vertice.Entity] = count
        count++
    })
    */

    console.log("Total vertices = ", self.vertices.length)

    self.vertices.forEach( function(d, i) {
        if(d.type == "Applicant") {
            var edge = {};
            edge.source = i;
            edge.target = creditors[d.node.Creditor];
            self.edges.push(edge)
            console.log("index = ", i, "Applicant Index = ", applicants[d.node.Entity]);

        }
    })


    for(var i=0; i<10; i++) {
        console.log("Vertices = ", self.vertices[i])
        console.log("Edges    = ", self.edges[i])
    }
}

function getIndexOfCreditor(creditorDB, creditorName) {
    console.log("Creditor Name = ", creditorName);

    for(var i=0; i<creditorDB.length; i++) {
        var obj = creditorDB[i]
        console.log(obj.Entity, obj.Creditor)
        if(obj.type == "Creditor" && obj.Creditor == creditorName) {
            return i;
        }
    }
    console.log("Creditor ***NOT*** found")
    return -1;
}

CreditorApplicantRelationVis.prototype.initialize = function (){
    var self = this;

    var width = 1500;
    var height = 1500;

    console.log("In creditorApplicantRelationVis...");

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

    var svg = d3.select("#creditorApplicantVis")
        .attr("width", width)
        .attr("height", height);

    force
        .nodes(self.vertices)
        .links(self.edges)
        .start();

    var link = d3.select("#links").selectAll("line")
        .data(self.edges);

    link
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        })
        .style("fill", function (d) {
            return '#006837';
        })   ;

    var nodes = d3.select("#nodes").selectAll("path")
        .data(self.vertices);

    nodes
        .enter().append("path")
        .attr("class", function (d) {
            if (d.type == "Creditor") {
                return "creditor";
            }
            else
                return "applicant";
        })
        .attr("d", d3.svg.symbol().type(function (d) {
            if(d.type == "Creditor") {

                return d3.svg.symbolTypes[5];
            }
            else
                return d3.svg.symbolTypes[0];
        }))
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(force.drag);

    force.on("tick", function () {
        link
            .attr("x1", function (d) {
            return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            })
            .style("fill", function (d) {
                return '#006837';
            });

        nodes
            .attr("transform", function (d) {
            var scaleSize = 2;
            return "translate(" + d.x + "," + d.y + ")  " + "scale("  + scaleSize + ")" ;
            })
            .style("fill", function (d) {
                return '#006837';
            })
            .call(force.drag);
    });

        force.start();
}