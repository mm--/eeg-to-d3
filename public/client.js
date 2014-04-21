// EEG Visualization

window.onload = function() {
    // This is how we'll communicate with the Node.js server
    var socket = io.connect('/', {
	'reconnect': true,
	'reconnection delay': 500,
	'max reconnection attempts': 100
    });

    // Here we receive data of the format of something like:
    // {"F3" :4505.34,
    //  "FC6":1592.22,
    //  "P7" :6375,
    //  "T8" :8116.14,
    //  "F7" :4936.29,
    //  "F8" :2235.33,
    //  "T7" :8208.45,
    //  "P8" :6806.97,
    //  "AF4":6066.45,
    //  "F4" :2110.38,
    //  "AF3":2064.02,
    //  "O2" :1646.28,
    //  "O1" :2889.15,
    //  "FC5":4991.88}

    // Where the key is the name of the channel, and the value is,
    // well, the value
    socket.on('newData', function(d) { 
	graphUpdate(d);
	});
};

// There are 14 channels that the Epoc provides
var nchannels = 14;

var alldata = d3.range(nchannels).map(function(i) {
    return({"name": i,
	    "values": d3.range(200).map(function(x) {return(x*i);})
	   }); 
} );

var eeggraph;
var color;

function graphUpdate(d) {
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
	.domain([0, alldata[0].values.length - 1])
	.range([0, w]);

    var datay = d3.range(nchannels).map(function(i) {
	return(d3.scale.linear()
	    .domain([0, 3000])
	    .rangeRound([h/nchannels, 0]));
    });

    var dataline = d3.range(nchannels).map(function(j) {
	return(d3.svg.line()
	.x(function(d, i) { return x(i); })
	.y(function(d, i) { return datay[j](d); }));
    });

    eeggraph = d3.select("#eeggraph").append("svg")
	.attr("class", "chart")
	.attr("width", w)
	.attr("height", h);

    eeggraph.append("defs").append("clipPath")
    	.attr("id", "clip")
    	.append("rect")
    	.attr("width", w)
    	.attr("height", h);


    color = d3.scale.category10();
    path = eeggraph.selectAll(".eegline")
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
	for (var i = 0; i < alldata.length; i++) {
	    var newmin = d3.min(alldata[i].values);
	    var newmax = d3.max(alldata[i].values);
	    datay[i].domain([newmin, newmax]);
	}

	path.selectAll("path")
	    .attr("d", function(d,i) { return dataline[i](d.values); });

	path.transition()
	    .duration(0)
	    .ease("linear")
	    .attr("transform", "translate(" + x(-1) + ",0)")
	    .each("end", tick);

    }

});
