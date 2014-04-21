// Urn game
// Joshua Moller-Mara
// 2014
window.onload = function() {
    var socket = io.connect('/', {
	'reconnect': true,
	'reconnection delay': 500,
	'max reconnection attempts': 100
    });
    socket.on('newData', function(d) { 
	netUpdate(d);
	});
};

var nchannels = 14;
var alldata = d3.range(nchannels).map(function(i) {
    return({"name": i,
	    "values": d3.range(200).map(function(x) {return(x*i);})
	   }); 
} );

var netgraph;

var nt = 0;
var netdata = d3.range(200).map(function(x) {return(x*2);});
var netdataup = d3.range(200).map(function(x) {return(x);});
var oldmin = 0;
var oldmax = 1;

var color;
var line;

function netUpdate(d) {
    var up = d.F3;
    // netdata.shift();
    netdataup.shift();
    // netdata.push(down);
    netdataup.push(up);
    var keys = Object.keys(d);
    for (var i = 0; i < alldata.length; i++) {
	alldata[i].values.shift();
	alldata[i].values.push(d[keys[i]] + i * 50);
    }
}

var path;
window.addEventListener('load', function() {
    //////////////////////////////
    // Line graph
    //////////////////////////////

    var w = 1000,
	h = 800;

    var x = d3.scale.linear()
	.domain([0, netdata.length - 1])
	.range([0, w]);

    var y = d3.scale.linear()
	.domain([0, 3000])
	.rangeRound([h/nchannels, 0]);

    var y2 = d3.scale.linear()
	.domain([0, 3000])
	.rangeRound([h, h/2]);

    var datay = d3.range(nchannels).map(function(i) {
	return(d3.scale.linear()
	    .domain([0, 3000])
	    .rangeRound([h/nchannels, 0]));
    });

    var dataline = d3.range(nchannels).map(function(i) {
	return(d3.svg.line()
	.x(function(d, i) { return x(i); })
	.y(function(d, i) { return datay[i](d); }));
    });

    netgraph = d3.select("#netgraph").append("svg")
	.attr("class", "chart")
	.attr("width", w)
	.attr("height", h);

    netgraph.append("defs").append("clipPath")
    	.attr("id", "clip")
    	.append("rect")
    	.attr("width", w)
    	.attr("height", h);

    line = d3.svg.line()
	.x(function(d, i) { return x(i); })
	.y(function(d, i) { return y(d); });

    var line2 = d3.svg.line()
	.x(function(d, i) { return x(i); })
	.y(function(d, i) { return y2(d); });


    // var line = d3.svg.line()
    // 	.interpolate("basis")
    // 	.x(function(d) { return x(d.t); })
    // 	.y(function(d) { return y(d.value); });

    // var path = netgraph.append("g")
    // 	.attr("clip-path", "url(#clip)")
    // 	.append("path")
    // 	.datum(netdata)
    // 	.attr("class", "line")
    // 	.style("stroke", "blue")
    // 	.attr("d", line);


    color = d3.scale.category10();
    path = netgraph.selectAll(".eegline")
	.data(alldata)
	.enter()
	.append("g")
	.attr("class", "eegline");

    path.append("path")
	.attr("class", "line")
	.style("stroke", function(d) { return color(d.name); })
	.attr("d", function(d,i) { return dataline[i](d.values); })
	.attr("transform", function(d, i) { return("translate(0," + (h/nchannels * i)  + ")"); });

    tick();

    function tick() {
	// redraw the line, and slide it to the left
	oldmin = d3.min(netdataup.concat(netdata));
	oldmax = d3.max(netdataup.concat(netdata));
	y.domain([oldmin, oldmax]);
	y2.domain([oldmin, oldmax]);

	path.selectAll("path")
	    .attr("d", function(d,i) { return dataline[i](d.values); });

	path.transition()
	    .duration(0)
	    .ease("linear")
	    .attr("transform", "translate(" + x(-1) + ",0)")
	    .each("end", tick);

    }

});
