'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.syncService
 * @description
 * # syncService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('syncService', ['$log', '$q', 'lodash', 'backendService', 'programModelService','trackModelService'
    , function ($log, $q, _, backendService, programModelService, trackModelService) {
    // Service logic
    // ...

    var missingPrograms = [];
    var isSyncingProgram = false;

    // Public API here
    return {
      checkServerProgram: function () {
        $log.info('checkServerProgram');

        var deferred = $q.defer();

        backendService.getPrograms()
        .then(function(programs) {
          async.each(programs
            ,function (program, callback) {
              programModelService.getById(program._id)
              .then(function (programRec) {
                if (!programRec) {
                  if (missingPrograms.indexOf(program._id) < 0) {
                    missingPrograms.push(program);
                  };
                };
                callback(null);
              });
            }, function (err) {
              if (err) {
                $log.error(err);
                return deferred.reject(err);
              };
              $log.info('after checkServer missingPrograms:', missingPrograms);
              deferred.resolve();
            });
        });

        return deferred.promise;
      },

      syncProgram: function () {
        $log.info('syncProgram', missingPrograms);

        if (isSyncingProgram) {
          return ;
        }

        var deferred = $q.defer();
        if (missingPrograms.length) {
          async.whilst(
            function () { return missingPrograms.length > 0; },
            function (callback) {
                var tobeSyncProgram = missingPrograms.pop(0);
                backendService.getProgramDetail(tobeSyncProgram._id)
                .then(function (program) {
                  // store it to db
                  programModelService.insert(program, callback);
                });
            },
            function (err) {
              if (err) {
                $log.error(err);
                return deferred.reject(err);
              }

              return deferred.resolve();
            }
          );
        } else {
          $log.info('no missingPrograms');
          deferred.resolve();
        }

        return deferred.promise;
      },

      syncTrack: function () {
        $log.info('syncTrack');

        // find programs between [yesterday, later)
        var today = moment().startOf('day'),
        yesterday = moment(today).subtract(1, 'days'),
        futureDay = moment(yesterday).add(1, 'months');

        programModelService.queryPrograms(yesterday, futureDay)
        .then(function (programs) {
          $log.info('gather tracks from programs');
          var trackArr = [];
          _.each(programs, function (program) {
            var playlistInCurProgram = _.pluck(program.dayPlaylistArr, 'playlist');
            _.each(playlistInCurProgram, function (playlist) {
              trackArr = trackArr.concat(playlist);
            });
          });

          var idArray = _.pluck(trackArr, 'track'),
          uniqIdArray =_.uniq(idArray);

          return trackModelService.getByIdArray(uniqIdArray)
          .then(function (tracks) {
            var existingIdArray = _.pluck(tracks, '_id'),
            missingTracks = _.difference(uniqIdArray, existingIdArray);

            return missingTracks;
          });
        })
        .then(function (missingTracks) {
          $log.info('get missing tracks from server:', missingTracks);
          var i = -1;
          async.whilst(
              function () {
                i = i+1;
                return i < missingTracks.length; 
              },
              function (callback) {
                  var trackId = missingTracks[i];
                  backendService.getTrack(trackId).then(function (trackInfo) {
                    $log.info('trackInfo is:', trackInfo);
                    // store it to db
                    trackModelService.insert(trackInfo, callback);
                  });
              },
              function (err) {
                if (err) {
                  $log.error(err);
                  return deferred.reject(err);
                }

                return deferred.resolve();
              }
          );
        });


        var deferred = $q.defer();
        

        return deferred.promise;
      },

      sync: function () {
        $log.info('sync');
        var that = this;
        this.syncProgram()
        .then(function () {
          return that.syncTrack();
        })
        .then(function () {
          $log.info('sync done.');
        });
      }
    };
  }]);
