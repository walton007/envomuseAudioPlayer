'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.playerServie
 * @description
 * # playerServie
 * Factory in the musicPlayerApp.
 */

angular.module('musicPlayerApp')
  .factory('playerServie', ['$q', '$log', 'lodash', 'utilService', 'programModelService', 'trackModelService'
    , function($q, $log, _, utilService, programModelService, trackModelService) {
    //registor window events 
    var win = require('nw.gui').Window.get();
    win.on('close', function(){
      releaseResource();
      this.close(true);
    });

    //
    var todayTrackListCache = null;

    //media player manage
    var mediaPlayerCache = {},
      assetCache = {},
      buzzSoundCache = {};

    function acquireMediaBuzzSound (filepath) {
      if (!(filepath in buzzSoundCache)) {
        var sources = 'file://'+filepath;
        buzzSoundCache[filepath] = new buzz.sound(sources);
      }
      
      return buzzSoundCache[filepath];
    };

    function acquireMediaAV (filepath) {
      // body...
      if (filepath in mediaPlayerCache) {
        return mediaPlayerCache[filepath];
      };
      var fs = require('fs');
      var buffer = utilService.toArrayBuffer(fs.readFileSync(filepath));
      var mediaPlayer = AV.Player.fromBuffer(buffer);
      mediaPlayerCache[filepath] = mediaPlayer;
      return mediaPlayer;
    }

    function acquireMediaAsset (filepath) {
      // body...
      if (filepath in assetCache) {
        return assetCache[filepath];
      };
      var fs = require('fs');
      var buffer = utilService.toArrayBuffer(fs.readFileSync(filepath));
      var asset = AV.Asset.fromBuffer(buffer);
      assetCache[filepath] = asset;
      return asset;
    }

    function releaseResource() {
      _.values(mediaPlayerCache, function(mediaPlayer) {
        mediaPlayer.stop()
      });
      mediaPlayerCache = {};
      
      _.values(assetCache, function(asset) {
        asset.stop()
      });
      assetCache = {};

      _.values(buzzSoundCache, function(sound) {
        sound.unbind('loadedmetadata');
      });
      buzzSoundCache = {};
    }

    // Public API here
    return {
      getTodayTrackList: function () {
        // just return the first track found in localdb
        var retPlaylist = null;
        var deferred = $q.defer();
        var todayStart = moment().startOf('day'),
         todayEnd = moment().endOf('day');

        if (todayTrackListCache) {
          deferred.resolve(todayTrackListCache);
          return deferred.promise;
        }

        async.waterfall([
          function (callback) {
            programModelService.queryPrograms(todayStart, todayEnd, callback);
          },
          function (programs, callback) {
            if (programs.length === 0) {
              return callback('no suitable program');
            }
            var dayPlaylist;
            var existValidPlaylist = _.any(programs, function (program) {
              dayPlaylist = _.find(program.dayPlaylistArr, function (dayPlaylist) {
                var searchDate = moment(dayPlaylist.date);
                return (searchDate.year() === todayStart.year()
                  && searchDate.month() === todayStart.month()
                  && searchDate.day() === todayStart.day());
              });

              return (dayPlaylist !== null);
            });

            if (existValidPlaylist) {
              retPlaylist = dayPlaylist.playlist;
              callback(null);
            } else {
              callback('no valid playlist');
            }
          },
          function (callback) {
            var trackIdArr = _.map(retPlaylist, 'track');
            trackModelService.getByIdArray(trackIdArr, callback);
          },
          function (tracks, callback) {
            var trackIdMap = {};
            _.each(tracks, function (track) {
              trackIdMap[track._id] = track;
            });
            _.each(retPlaylist, function (trackObj) {
              trackObj.trackFilePath = trackIdMap[trackObj.track].trackFilePath;
            });
            callback(null);
          }],
          function (err) {
            if (err) {
              alert(err);
              return deferred.reject(err);
            }
            deferred.resolve(retPlaylist);
          });

        return deferred.promise;
      },

      getCalcTrack: function () {
        var deferred = $q.defer();
        this.getTodayTrackList()
        .then(function (todayTrackList) {
          // just return the first one
          deferred.resolve(todayTrackList[2]);
        }, function (err) {
          $log.error('getNextTrack:', err);
          deferred.reject(err);
        })
        return deferred.promise;
      }
    };
  }]);