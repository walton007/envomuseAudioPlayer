'use strict';

/**
 * @ngdoc function
 * @name musicPlayerApp.controller:PlayerCtrl
 * @description
 * # PlayerCtrl
 * Controller of the musicPlayerApp
 */
angular.module('musicPlayerApp')
  .controller('PlayerCtrl', ['$rootScope', '$scope', '$routeParams', '$sce', '$log', '$timeout', 'playerFacadeServie', 'dbservice',
    'trackModelService', 'APPSTATUS', 'utilService',
  	function ($rootScope, $scope, $routeParams, $sce, $log, $timeout, playerFacadeServie, dbservice, trackModelService,
     APPSTATUS, utilService) {
  		var controller = this;

      $scope.clearAll = function () {
        dbservice.clearAll();
      };

      $scope.printTodayPlaylist = function () {
        $log.info('printTodayPlaylist');
        playerFacadeServie.getTodayTrackList()
        .then(function (todayTrackList) {
          utilService.dumpPlaylist(todayTrackList);
        }, function (err) {
          alert('getTodayTrackList error');
        });
      };

      $scope.scheduleTrack = function () {
        $log.info('scheduleTrack');
        playerFacadeServie.getNextTrack()
        .then(function (track) {
          if (track) {
            var elapseMs = Number(track.exactPlayTime) - playerFacadeServie.getMsTimeInCurDay(new Date());
            $log.info('schedule elapseMs is: ', elapseMs);
            $timeout(function () {
              $scope.setVideo(track);
            }, elapseMs);
          } else {
            $log.error('getNextTrack track is null');
          }

        }, function (err) {
          $log.error('getNextTrack error:', err);
        });

      }

      $scope.tryPlayTrackInTime = function() {
        $log.info('tryPlayTrackInTime');
        playerFacadeServie.getCalcTrack()
        .then(function (track) {
          if (track) {
            $scope.setVideo(track);
          } else {
            $scope.scheduleTrack();
          }
        }, function (err) {
          // alert('Failed to get calc Track');
          $log.warn('Failed to get calc Track');
        });
      };

      $scope.setVideo = function(track) {
        if ( $scope.track === track) {
          $log.warn('setVideo same track return');
          return;
        }
        $log.info('setVideo', track.name, track.track, utilService.translateExactPlayTime(track.exactPlayTime));
        var trackFileUrl = 'file://'+track.trackFilePath;
        $scope.track = track;
        $scope.trackSource = [{src: $sce.trustAsResourceUrl(trackFileUrl), type: 'audio/mpeg'}];

        controller.API.stop();
        controller.config.sources = $scope.trackSource;
        $timeout(controller.API.play.bind(controller.API), 100);
      };
 
  		// videogular config
      controller.API = null;
  		
  		controller.onPlayerReady = function(API) {
  			$log.info('onPlayerReady:', API);
        controller.API = API;
        $scope.tryPlayTrackInTime();
      };

      controller.onCompleteVideo = function() {
          $log.info('onCompleteVideo');
          $scope.track = null;

          controller.isCompleted = true;
          $scope.tryPlayTrackInTime();
      };

      $rootScope.$watch('appStatus', function() {
        if ($rootScope.appStatus === APPSTATUS.IDLE) {
          $log.info('$rootScope.appStatus change to idle');
          if ($scope.track === null ) {
            $scope.tryPlayTrackInTime();
          }
        }
      });

      controller.config = {
          // preload: "none",
          // autoHide: false,
          // autoHideTime: 3000,
          autoPlay: true,
          sources: [],
          theme: {
          	url: "bower_components/videogular-themes-default/videogular.css"
          }
      };
  }]);
