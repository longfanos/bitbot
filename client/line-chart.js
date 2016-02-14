var React = require('react');
var d3 = require('d3');

module.exports = React.createClass({
    componentWillReceiveProps: function(props, state) {
        var el = this.getDOMNode();
        el.innerHTML = "";

        var exchangers = ['Cex', 'Kraken', 'Btce', 'Hitbtc', 'Bitfinex'];

        for (var i = 0; i < exchangers.length; i++) {
            el.appendChild(createLineChart(el, props.data, exchangers[i]));
        }
    },

    render: function() {
        return <div className="chart" />
    }
});

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 140 - margin.top - margin.bottom;

function createLineChart(el, data, exchanger) {
    var formatDate = d3.time.format("%Y-%m-%d %H:%M");

    for (var i=0; i < data.length; i++) {
        var row = data[i];
        row.date = formatDate.parse(row.StartDate);
    }

    var svgRoot = document.createElementNS(d3.ns.prefix.svg, 'svg');

    var svg = d3.select(svgRoot)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = addLineChart(data, exchanger);
    svgRoot.appendChild(g);
    return svgRoot;
}

function addLineChart(data, exchanger) {
    // x axis
    var x = d3.time.scale().range([0, width]);
    x.domain(d3.extent(data, function(d) { return d.date; }));

    var xAxis = d3.svg
        .axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.minutes, 5)
        .tickFormat(d3.time.format("%H:%M"));

    // y axis
    var ymin = d3.min(data, function(d) { return d.Orderbooks[exchanger] ? d.Orderbooks[exchanger].Bids[0].Price: null }),
        ymax = d3.max(data, function(d) { return d.Orderbooks[exchanger] ? d.Orderbooks[exchanger].Asks[0].Price: null }),
        delta = (ymax - ymin) * 0.1;

    var y = d3.scale.linear()
        .domain([ymin - delta, ymax + delta])
        .range([height, 0]);

    var yAxis = d3.svg
        .axis()
        .scale(y)
        .orient("left")
        .ticks(4);

    var g = document.createElementNS(d3.ns.prefix.svg, 'g');

    var container = d3
        .select(g)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    container.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    container.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");
        // .text("Price ($)");

    function addLine(container, attr, color) {
        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.Orderbooks[exchanger] ? d.Orderbooks[exchanger][attr][0].Price : 0); });

        container.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", color);
    }

    addLine(container, 'Bids', 'steelblue');
    addLine(container, 'Asks', '#FC9E27');
    return g;
}


