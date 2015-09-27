'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.logService
 * @description
 * # logService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('logService', ['$log', function ($log) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      info: function (msg) {
        var args = [].slice.call(arguments);
        $log.info.apply(null, args);
      }
    };
  }]);
