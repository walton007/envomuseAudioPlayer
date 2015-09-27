'use strict';

/**
 * @ngdoc service
 * @name envomusPlayerApp.authServie
 * @description
 * # authServie
 * Factory in the envomusPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('authServie',['$resource',  function ($resource) {
    // Service logic
    // ...
    var path = require('path');
    var shell = require('nw.gui').Shell;

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return process.cwd();
      }
    };
  }]);
