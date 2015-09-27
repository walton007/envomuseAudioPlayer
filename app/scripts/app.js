'use strict';

/**
 * @ngdoc overview
 * @name envomusPlayerApp
 * @description
 * # envomusPlayerApp
 *
 * Main module of the application.
 */
angular
  .module('musicPlayerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngLodash',
    'ui.bootstrap',
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls"
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/player', {
        templateUrl: 'views/player.html',
        controller: 'PlayerCtrl as controller'
      })
      .otherwise({
        redirectTo: '/player'
      });
  })
  .run(['$rootScope', '$interval', '$log', 'configService', 'syncService', 'backendService',
   function($rootScope, $interval, $log, configService, syncService, backendService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      
    });
    
    //Start Timer
    // configService.getConfig().
    // then(function(config) {
    //   $log.log(config);
    // });

    syncService.checkServerProgram()
    .then(function() {
      syncService.sync();
    });

  }]);


