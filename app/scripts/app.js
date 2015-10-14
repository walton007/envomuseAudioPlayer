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
  .constant("APPSTATUS", {
        "SELFCHECKING": "Self Checking",
        "SELFCHECKING_FAILED": "Self Checking Failed",
        "TRY_SYNC_PROGRAM": "Try Syncing Program",
        "SYNC_PROGRAM": "Syncing Program",
        "SYNC_TRACK": "Syncing Track",
        "SYNC_FAILED": "Sync failed",
        "IDLE": "IDLE"
      })
  .constant("PLAYERSTATUS", {
        "LOADING": "Loading Track",
        "LOCAL_BACKUP_TRACK": "Play backup track",
        "ONLINE_TRACK": "Play online track"
      })
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
  .run(['$rootScope', '$log', 'syncService', 'backendService', 'selfCheckService',
   function($rootScope, $log, syncService, backendService, selfCheckService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      
    });

    selfCheckService.doSelfCheck()
    .then(function () {
      syncService.startPeriodSync();
    }, function () {

    });

  }]);


