'use strict';

angular.module('verkamiExplorerApp')
  .controller('MainCtrl', function ($scope, data) {
    // $scope.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];

    console.log(data)

    var categories = d3.set(data.map(function(d) {
      return d.category
    })).values();

    // remove the euro symbol and the dot in the total_amount value
    data.map(function(d) {
      d.total_amount = +d.total_amount.substring(0, d.total_amount.length - 1).replace('.', '');
      d.current_amount = +d.current_amount.substring(0, d.current_amount.length - 1).replace('.', '');
    })
    // var categoriesObj = [];
    // categories.forEach(function(d) {
    //   var obj = {};
    //   obj.category = d;
    //   obj.total_amount = 0;
    //   obj.current_amount = 0;
    //   obj.num_projects = 0;

    //   categoriesObj.push(obj);
    // })  
    
    // data.forEach(function(d) {      
    //   var cat = categoriesObj.filter(function(p) { return p.category == d.category })[0];      
    //   cat.total_amount += +d.total_amount.substring(0, d.total_amount.length - 1).replace('.', '');
    //   cat.current_amount += +d.current_amount.substring(0, d.current_amount.length - 1).replace('.', '');
    //   cat.num_projects++;
    //   console.log("*************")
    //   console.log(d)
    //   console.log(cat)
    // });

    // console.log(categoriesObj)

    // following example from http://bl.ocks.org/mbostock/7882658
    var width = 600,
        height = 500,
        padding = 1.5,      // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

    var radius = d3.scale.sqrt() 
       .domain([0, d3.max(data.map(function(d) { return d.total_amount }))]) 
       .range([0, 40]); 

    var n = 200, // total number of nodes
        m = categories.length; // number of distinct clusters

    var color = d3.scale.category20()
        .domain(d3.range(m));

    // The largest node for each cluster.
    var clusters = new Array(m);


    // var nodes = d3.range(n).map(function() {
    //   var i = Math.floor(Math.random() * m),
    //       r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
    //       d = {cluster: i, radius: r};
    //   if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    //   return d;
    // });
    // console.log(nodes)
    var nodes = data;
    nodes.forEach(function(d, i) {
      d.radius = radius(d.total_amount);
      if (!clusters[d.category] || (d.radius > clusters[d.category].radius)) clusters[d.category] = d;
    })

    console.log(clusters)

    // Use the pack layout to initialize node positions.
    d3.layout.pack()
        .sort(null)
        .size([width, height])
        .children(function(d) { return d.values; })
        .value(function(d) { return d.radius * d.radius; })
        .nodes({values: d3.nest()
          .key(function(d) { return d.category; })
          .entries(nodes)});

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();

    var svg = d3.select("#vis").append("svg")
        .attr("width", width)
        .attr("height", height);

    var node = svg.selectAll("circle")
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
  });

