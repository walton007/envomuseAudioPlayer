'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.backendService
 * @description
 * # backendService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('backendService', ['$http', '$q', '$log', 'utilService'
    , function ($http, $q, $log, utilService) {
    // Service logic
    // ...

    var BackendUrl = 'http://localhost:3000/terminal/';

    // may consider move track manage to another service
    var fs = require('fs-extra'), 
    path = require('path'),
    randomstring = require("randomstring");
    var TrackDataPath = path.join(require('nw.gui').App.dataPath, 'trackData');
    if (!fs.existsSync(TrackDataPath)) {
      fs.mkdirSync(TrackDataPath);
    }

    // Public API here
    return {
      login: function() {
        return $http.post(BackendUrl+'login', {
          mac: 'abc',
          uuid: 'wbc'
        });
      },

      getConfig: function() {
        return $http.get(BackendUrl+'config');
      },

      getJingoList: function() {
        return $http.get(BackendUrl+'jingoList');
      },

      getPrograms: function() {
        $log.info('get program general info');

        return $http.get(BackendUrl+'playlists')
        .then(function (resp) {
          $log.info('backend resp:', resp);
          var playlists = resp.data;
          return playlists;
        });
      },

      getProgramDetail: function(playlistId) {
        $log.info('sync program:', playlistId);
        
        return $http.get(BackendUrl+'playlists/'+playlistId)
        .then(function (resp) {

          $log.info('backend resp:', resp);
          var program = resp.data;
          return program;
        });
      },

      getTrack: function(trackId) {
        $log.info('getTrack:', trackId);

        var queryTrackMeta = $http.get(BackendUrl+'tracks/:trackId/meta'.replace(':trackId', trackId)),
          queryTrackData = $http.get(BackendUrl+'tracks/:trackId/hqfile'.replace(':trackId', trackId)
            ,{ responseType: 'arraybuffer'});
        return $q.all([queryTrackMeta, queryTrackData])
        .then(function (respArr) {
          var trackInfo = respArr[0].data,
            trackBinary = respArr[1].data,
            fileName = randomstring.generate()+trackInfo.name;
          
          // saveAs(trackBinary, 'a.mp3');

          var trackFilePath = path.join(TrackDataPath, fileName);
          fs.writeFileSync(trackFilePath, utilService.toBuffer(trackBinary), 'binary');
          // return program;
          $log.info('finish write file:', trackFilePath);
          trackInfo.trackFilePath = trackFilePath;
          return trackInfo;
        });
      },

      postHeartBeat: function() {
        return $http.post(BackendUrl+'login', {
          mac: 'abc',
          uuid: 'wbc'
        });
      }
     };
  }]);
