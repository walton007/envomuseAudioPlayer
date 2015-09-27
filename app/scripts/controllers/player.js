'use strict';

/**
 * @ngdoc function
 * @name musicPlayerApp.controller:PlayerCtrl
 * @description
 * # PlayerCtrl
 * Controller of the musicPlayerApp
 */
angular.module('musicPlayerApp')
  .controller('PlayerCtrl', ['$scope', '$routeParams', '$sce', '$log', '$timeout', 'playerFacadeServie', 'dbservice',
    'trackModelService',
  	function ($scope, $routeParams, $sce, $log, $timeout, playerFacadeServie, dbservice, trackModelService) {
  		var controller = this;

      $scope.clearAll = function () {
        dbservice.clearAll();
      }

      $scope.scheduleTrack = function () {
        playerFacadeServie.getNextTrack()
        .then(function (track) {
          if (track) {
            var elapseMs = Number(track.exactPlayTime) - playerFacadeServie.getMsTimeInCurDay(new Date());
            $timeout(function () {
              $scope.setVideo(track);
            }, elapseMs);
          };

        });

      }

      $scope.tryPlayTrackInTime = function() {
        $log.info('tryPlayTrackInTime 2');
        playerFacadeServie.getCalcTrack()
        .then(function (track) {
          if (track) {
            $scope.setVideo(track);
          } else {
            $scope.scheduleTrack();
          }
        }, function (err) {
          alert('Failed to get calc Track');
        });
      };

      $scope.setVideo = function(track) {
        $log.info('setVideo', track);
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
          controller.isCompleted = true;
          $scope.tryPlayTrackInTime();
      };

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
