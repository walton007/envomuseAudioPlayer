'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.configService
 * @description
 * # configService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('configService', ['dbservice', 'backendService', '$q', '$log',
    function (dbservice, backendService, $q, $log) {
    // Service logic
    // ...
    var configStore = dbservice.getDataStore('config');

    // Public API here
    return {
      getConfig: function () {
        var deferred = $q.defer(),
        self = this;
        configStore.findOne({}, function(err, doc) {
          if (err) {
            $log.error('failed to find config');
            deferred.reject();
            return;
          }
          if (doc) {
            deferred.resolve(doc);
            return;
          };
          //Query from server
          return self.syncFromServer();
        });
        return deferred.promise;
      },

      syncFromServer: function (argument) {
        // body...
        var deferred = $q.defer();

        backendService.getConfig().
        success(function(data, status, headers, config) {
          //cache data to configStore
          configStore.insert(data, function (err, newDoc) {   // Callback is optional
            if (err) {
              $log.error('configStore.insert err', err);
              dtd.reject(err);
              return;
            };
            dtd.resolve(newDoc);
          });
        }).
        error(function(data, status, headers, config) {
          $log.error('syncFromServer',data, status, headers);
          deferred.reject();
        });

        return deferred.promise;
      }
    };
  }]);
