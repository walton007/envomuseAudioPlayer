'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.configService
 * @description
 * # configService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('trackModelService', ['dbservice', 'backendService', '$q', '$log',
    function (dbservice, backendService, $q, $log) {
    // Service logic
    // ...
    var trackStore = dbservice.getDataStore('track');

    // Public API here
    return {
      getTrackById: function (trackId, callback) {
        var deferred = $q.defer();
        // trackStore.find({}, function(err, doc) {
          trackStore.findOne({_id: trackId}, function(err, doc) {
          if (angular.isFunction(callback)) {
            callback(err, doc);
          }
          if (err) {
            $log.error('failed to find track');
            deferred.reject();
            return;
          }
          if (doc) {
            deferred.resolve(doc);
            return;
          };
        });
        return deferred.promise;
      },

      getByIdArray: function (idArray, callback) {
        var deferred = $q.defer();
        trackStore.find(
          {_id: { $in: idArray}}, 

          function(err, docs) {
            if (angular.isFunction(callback)) {
              callback(err, docs);
            }
            if (err) {
              $log.error('failed to find tracks');
              deferred.reject();
              return;
            }
            if (docs) {
              deferred.resolve(docs);
              return;
            };
          });

        return deferred.promise;
      },

      insert: function (trackInfo, callback) {
        return dbservice.insert(trackStore, trackInfo, callback);
      },

      getTodayTracks: function () {
        var deferred = $q.defer();
        trackStore.findOne({_id: trackId}, function(err, doc) {
          if (angular.isFunction(callback)) {
            callback(err, doc);
          }
          if (err) {
            $log.error('failed to find track');
            deferred.reject();
            return;
          }
          if (doc) {
            deferred.resolve(doc);
            return;
          };
        });
        return deferred.promise;
      },

      clear: function (callback) {
        $log.info('clear programStore');
        // maybe also need to clear tracks
        return dbservice.clear(trackStore, callback);
      }

    };
  }]);
