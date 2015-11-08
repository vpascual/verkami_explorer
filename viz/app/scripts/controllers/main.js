'use strict';

angular.module('verkamiExplorerApp')
  .controller('MainCtrl', function ($scope, data) {
    $scope.categories = d3.set(data.map(function(d) {
      return d.category
    })).values();

    // remove the euro symbol and the dot in the total_amount value
    data.map(function(d) {
      d.total_amount = +d.total_amount.substring(0, d.total_amount.length - 1).replace('.', '');
      d.current_amount = +d.current_amount.substring(0, d.current_amount.length - 1).replace('.', '');
    })  

    $scope.data = data; 
  });

