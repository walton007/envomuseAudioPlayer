'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.utilService
 * @description
 * # utilService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('utilService', ['$rootScope', function ($rootScope) {
    // Service logic
    // ...

    $rootScope.openDebugTool = function () {
      var win = require('nw.gui').Window.get();
      return win.showDevTools();
    }

    // Public API here
    return {
      toArrayBuffer: function(buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
          view[i] = buffer[i];
        }
        return ab;
      },

      toBuffer: function(ab) {
        var buffer = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
          buffer[i] = view[i];
        }
        return buffer;
      },

      isNW: function (argument) {
        var ua = navigator.userAgent.toLocaleLowerCase();
        return ua.indexOf('music') >= 0; 
      },

      showLoading: function () {
        if (!$rootScope.$$phase) {
          //$digest or $apply
          $rootScope.$apply(function () {
            $rootScope.showLoading = true;
          });
        } else {
          $rootScope.showLoading = true;
        }
      },

      hideLoading: function () {
        if (!$rootScope.$$phase) {
          //$digest or $apply
          $rootScope.$apply(function () {
            $rootScope.showLoading = false;
          });
        } else {
          $rootScope.showLoading = false;
        }
      }
    };
  }]);
