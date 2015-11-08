'use strict';

angular.module('verkamiExplorerApp', [
  'ngResource',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: ['$http', function($http) {
            return $http.get('data/verkami_projects.json').then(function(response) {
              // console.log(response.data)
              return response.data;
            })
          }
          ]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
