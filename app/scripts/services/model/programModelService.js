'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.programModelService
 * @description
 * # programModelService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('programModelService', ['dbservice', 'backendService', 'lodash', '$q', '$log',
    function (dbservice, backendService, _, $q, $log) {
    // Service logic
    // ...
    var programStore = dbservice.getDataStore('program');

    function convert(program) {
      if (typeof program.startDate === 'string') {
        program.startDate = new Date(program.startDate);
      }
      if (typeof program.endDate === 'string') {
        program.endDate = new Date(program.endDate);
      }
      _.each(program.dayPlaylistArr, function (dayPlaylist) {
        if (typeof dayPlaylist.date === 'string') {
          dayPlaylist.date = new Date(dayPlaylist.date);
        }
      });

      return program;
    }

    // Public API here
    return {
      getById: function (programId, callback) {
        $log.info('programModelService getById:', programId);
        var deferred = $q.defer();
        programStore.findOne({_id: programId}, function(err, doc) {
          if (angular.isFunction(callback)) {
            callback(err, doc);
          }
          if (err) {
            $log.error('failed to find program');
            deferred.reject();
            return;
          }
          return deferred.resolve(doc);
        });

        return deferred.promise;
      },

      insert: function (program, callback) {
        return dbservice.insert(programStore, convert(program), callback);
      },

      queryPrograms: function (beginDay, futureDay, callback) {
        $log.info('queryPrograms:', beginDay.format("dddd, MMMM Do YYYY"));

        var deferred = $q.defer();
        programStore.find({
          $or: [ {
            startDate: {
              $lte: beginDay
            },
            endDate: {
              $gte: futureDay
            }
          }, {startDate: {
            $gte: beginDay,
            $lte: futureDay,
          }}, {endDate: {
            $gte: beginDay,
            $lte: futureDay,
          }} ]
          
        })
// programStore.find({
//             // startDate: {
//             //   $lte: new Date()
//             // }
//           })
        .sort('-created')
        .exec(function(err, programs) {
          if (angular.isFunction(callback)) {
            callback(err, programs);
          }
          if (err) {
            $log.error('find programs error');
            deferred.reject(err);
            return;
          };

          // Sort Program if needed
          deferred.resolve(programs);
        });

        return deferred.promise;
      },

      getStore: function () {
        return programStore;
      },

      clear: function (callback) {
        $log.info('clear programStore');
        return dbservice.clear(programStore, callback);
      }
    };
  }]);
