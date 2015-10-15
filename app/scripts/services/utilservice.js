'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.utilService
 * @description
 * # utilService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('utilService', ['$log', '$rootScope', function ($log, $rootScope) {
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
      },

      translateExactPlayTime: function (exactPlayTime) {
        var seconds = Math.floor(exactPlayTime/1000) % 60;
        var minutes = Math.floor(exactPlayTime/(60*1000) ) % 60;
        var hours = Math.floor( exactPlayTime/(60 * 60*1000) );
        var timeArr = [hours, minutes, seconds].map(function (v) {
          if (v < 10) v = '0'+v;
          return ''+v;
        });

        var retStr = timeArr.join(':');
        $log.info('ExactPlayTime- ', exactPlayTime, ' translate to:', retStr);

        return retStr;
      },

      dumpPlaylist: function (playlist) {
        $log.info('dumpPlaylist:', playlist);
        var self = this;
        var filename = playlist.date.format("dddd, MMMM Do YYYY") + '-PL.log';
        var fs = require('fs');
        var stream = fs.createWriteStream(filename);
        stream.once('open', function(fd) {
          stream.write("TimeMs  ExactPlayTime   Track    Name   \n");
          playlist.data.forEach(function (track) {
            var lineStr = [track.exactPlayTime, track.exactPlayTimeself.translateExactPlayTime(track.exactPlayTime), track.name, track.track, '\n'].join('  ');
            stream.write(lineStr);
          });
          
          stream.end();
        });

      }
    };
  }]);
