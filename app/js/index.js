// Load common stuff and pass it to our definition function
require([ 'common' ], function(App){
    App.initialize();

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 300)
        .attr("height", 200);

    var text = svg
          .append("text")
          .text("hello from d3")
          .attr("x",10)
          .attr("y",50);

});

