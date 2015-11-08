'use strict';

angular.module('verkamiExplorerApp')
  .directive('groupedbubblechart', function () {
    return {
      template: '<div id="vis"></div>',
      restrict: 'E',
      replace: false,
      scope: {
        'categories' : '=',
        'data' : '='
      },
      link: function postLink(scope, element, attrs) {
        console.log("directive")
        scope.$watch('data', function() {
          console.log("watch")
          if (scope.data === undefined) return;


          m = scope.categories.length; // number of distinct clusters
          color.domain(d3.range(m));
          clusters = new Array(m);

          nodes = scope.data;
          nodes.forEach(function(d, i) {
            d.radius = radius(d.total_amount);
            if (!clusters[d.category] || (d.radius > clusters[d.category].radius)) clusters[d.category] = d;
          });

          radius.domain([0, d3.max(scope.data.map(function(d) { return d.total_amount }))]);

          render();
        })

        // following example from http://bl.ocks.org/mbostock/7882658
        var width = 600,
            height = 500,
            padding = 1.5,      // separation between same-color nodes
            clusterPadding = 6, // separation between different-color nodes
            maxRadius = 12,
            nodes,
            node;

        var radius = d3.scale.sqrt()
           .range([0, 40]);

        var n = 200, // total number of nodes
            m; // number of distinct clusters

        var color = d3.scale.category20();

        // The largest node for each cluster.
        var clusters;



        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

      var svg = d3.select(element[0]).select("#vis").append("svg")
          .attr("width", width)
          .attr("height", height);
        console.log(svg)

      function render() {
        // Use the pack layout to initialize node positions.
        d3.layout.pack()
          .sort(null)
          .size([width, height])
          .children(function(d) { return d.values; })
          .value(function(d) { return d.radius * d.radius; })
          .nodes({values: d3.nest()
            .key(function(d) { return d.category; })
            .entries(nodes)});

        node = svg.selectAll("circle")
            .data(nodes)
          .enter()
          // .append("g")
          .append("circle")
            .style("fill", function(d) { return color(d.category); })
            .call(force.drag)
            .on("mouseover", function(d) {
              console.log(d)
              $scope.tooltip_data = d;
            })
          // .append("text")
          //   .text(function(d) { return d.category;});

        node.transition()
            .duration(750)
            .delay(function(d, i) { return i * 5; })
            .attrTween("r", function(d) {
              var i = d3.interpolate(0, d.radius);
              return function(t) { return d.radius = i(t); };
            });
      }


        function tick(e) {
          node
              .each(cluster(10 * e.alpha * e.alpha))
              .each(collide(.5))
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
          return function(d) {
            var cluster = clusters[d.category];
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              cluster.x += x;
              cluster.y += y;
            }
          };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
          var quadtree = d3.geom.quadtree(nodes);
          return function(d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + (d.category === quad.point.category ? padding : clusterPadding);
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
      }
    };
  });
