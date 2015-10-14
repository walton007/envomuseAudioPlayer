'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.syncService
 * @description
 * # syncService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('syncService', ['$log', '$q', '$rootScope', '$interval', 'lodash', 'backendService', 'programModelService','trackModelService', 'APPSTATUS'
    , function ($log, $q, $rootScope, $interval, _, backendService, programModelService, trackModelService, APPSTATUS) {
    // Service logic
    // ...

    var missingPrograms = [];
    var isSyncingProgram = false;
    var random = Math.random();
    random = random < 0.5 ? 0.5 : random;
    var periodCheckInterval = 6*random*60*60*1000; //6h
    random = Math.random();
    var periodHeartBeatInterval = 0.5*(1+random)*60*60*1000; //0.5h

    $log.info('<sync parameter> periodCheckInterval:', periodCheckInterval/(60*1000) );
    $log.info('<sync parameter> periodCheckInterval:', periodHeartBeatInterval/(60*1000));

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

        var deferred = $q.defer();

        if (isSyncingProgram) {
          deferred.resolve();
          return deferred.promise;
        }

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
        var self = this;
        if ($rootScope.appStatus !== APPSTATUS.IDLE && $rootScope.appStatus !== APPSTATUS.SYNC_FAILED) {
          return;
        };
        $rootScope.appStatus = APPSTATUS.TRY_SYNC_PROGRAM;
        self.checkServerProgram()
        .then(function() {
          $rootScope.appStatus = APPSTATUS.SYNC_PROGRAM;
          self.syncProgram()
          .then(function () {
            $rootScope.appStatus = APPSTATUS.SYNC_TRACK;
            return self.syncTrack();
          })
          .then(function () {
            $rootScope.appStatus = APPSTATUS.IDLE;
            $log.info('sync done.');
          })
          .catch(function (err) {
            $log.error('sync failed');
            $rootScope.appStatus = SYNC_FAILED;
          });
        }, function () {
          $rootScope.appStatus = SYNC_FAILED;
        });

      },

      //control logic
      startPeriodSync: function () {
        this.sync();
        $interval(this.sync , periodCheckInterval);
      },
      startPeriodHeartBeat: function () {
        $log.info('startPeriodHeartBeat');
        backendService.postHeartBeat();
        $interval(backendService.postHeartBeat , periodHeartBeatInterval);
      }
    };
  }]);
