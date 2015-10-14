'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.selfCheckService
 * @description
 * # utilService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('selfCheckService', ['$rootScope', '$log', '$q', '$http', 'backendService', 'APPSTATUS', function ($rootScope, $log, $q, $http, backendService, APPSTATUS) {
    
    var fs = require('fs-extra'), 
        path = require('path'),
        randomstring = require("randomstring");
    // Service logic
    var license = '',
    mac = 123,
    version = '';

    // Public API here
    return {
      doSelfCheck: function() {
        $log.info('doSelfCheck');

        var deferred = $q.defer();
        var self = this;
        $rootScope.appStatus = APPSTATUS.SELFCHECKING;

        async.series([
          self._checkVersion,
          self._checkMac,
          self._checkLicense,
          self._checkPreStoreAsset,
          self._checkNetwork,
          ],
          function(err, results) {
            if (err) {
              $log.error('doSelfCheck failed error:', err);
              $rootScope.appStatus = APPSTATUS.SELFCHECKING_FAILED;
              $rootScope.failureReason = err;
              deferred.reject(err);
              return;
            }
            $rootScope.appStatus = APPSTATUS.IDLE;
            deferred.resolve();
          });

        return deferred.promise;
      },

      _checkVersion: function(callback) {
        $log.info('_checkVersion');
        var pjson = require('./package.json');
        version = $rootScope.version = pjson.version;
        callback(null);
      },

      _checkMac: function (callback) {
        $log.info('_checkMac');
        require('getmac').getMac(function(err,macAddress){
            if (err)  {
              return callback(err);
            }
            mac = macAddress;
            callback(null);
        })
      },

      _checkLicense: function (callback) {
        $log.info('_checkLicense');
        var licenseFile = path.join(process.env.PWD, 'license.dat');
        if (!fs.existsSync(licenseFile)) {
          callback('No LicenseFile');
        } else {
          license = fs.readFileSync(licenseFile);
          if (license.length < 5) {
            callback('Invalid License')
          } else {
            $rootScope.license = license;
            callback(null, license);
          }
        }
      },

      _checkPreStoreAsset: function (callback) {
        $log.info('_checkPreStoreAsset');
        var settingJsonFile = './setting.json';

        var settingJson = require(settingJsonFile);
        $log.info('settingJson:', settingJson);
        if (settingJson.preserveAssetProcessed) {
          return callback(null);
        }
        var trackCacheDir = path.join(process.env.PWD, 'trackCache');
        if (fs.existsSync(trackCacheDir)) {
          $log.info('consume cache track to local db');
          
        }
        //Mark preserveAssetProcessed to true
        settingJson.preserveAssetProcessed = 1;
        fs.writeJSONSync(settingJsonFile, settingJson);
        callback(null);

      },

      _checkNetwork: function(callback) {
        $log.info('_checkNetwork');

        $http.defaults.headers.common.envomuse = [version, license, mac].join('=');
        backendService.getConfig()
        .then(function () {
          callback(null);
        }, function (err) {
          callback(err);
        })
      }
    };
  }]);
