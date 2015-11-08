'use strict';

angular.module('verkamiExplorerApp')
  .directive('barchart', function () {
    return {
      //We restrict its use to an element
      //as usually  <bars-chart> is semantically
      //more understandable
      restrict: 'E',
      //this is important,
      //we don't want to overwrite our directive declaration
      //in the HTML mark-up
      replace: false, 
      // scope: { chartdata: '=' },
      // controller: 'KeywordsCtrl',
      link: function (scope, element, attrs) {
        var data = scope.data;
        // scope.$watch('data', function() {
        //   console.log(scope.data);
          
        // })

var width = 960,
    height = 200;

var y = d3.scale.linear()
    .range([height, 0]);

var chart = d3.select(element[0])
    .append("svg")
    .attr("width", width)
    .attr("height", height);

y.domain([0, d3.max(data, function(d) { return d.total_amount; })]);

var barWidth = width / data.length;

var bar = chart.selectAll("g")
    .data(data)
  .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

bar.append("rect")
    .attr("y", function(d) { return y(d.total_amount); })
    .attr("height", function(d) { return height - y(d.total_amount); })
    .attr("width", barWidth - 1);

bar.append("text")
    .attr("x", barWidth / 2)
    .attr("y", function(d) { return y(d.total_amount) + 3; })
    .attr("dy", ".75em")
    .text(function(d) { return d.total_amount; });

function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}
       
        } 
      }
  });
