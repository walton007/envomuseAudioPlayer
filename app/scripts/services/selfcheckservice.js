'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.selfCheckService
 * @description
 * # utilService
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('selfCheckService', ['$rootScope', '$q', '$http', 'backendService', function ($rootScope, $q, $http, backendService) {
    // Service logic
    var license = '',
    mac = 123,
    version = '';

    // Public API here
    return {
      doSelfCheck: function() {
        var deferred = $q.defer();
        var self = this;

        async.series([
          self._checkVersion,
          self._checkMac,
          self._checkLicense,
          self._checkNetwork,
          ],
          function(err, results) {
            if (err) {
              deferred.reject(err);
              return;
            }
            deferred.resolve();
          });

        return deferred.promise;
      },

      _checkVersion: function(callback) {
        var pjson = require('./package.json');
        version = $rootScope.version = pjson.version;
        callback(null);
      },

      _checkMac: function (callback) {
        require('getmac').getMac(function(err,macAddress){
            if (err)  {
              return callback(err);
            }
            mac = macAddress;
            callback(null);
        })
      },

      _checkLicense: function (callback) {
        var fs = require('fs-extra'), 
        path = require('path'),
        randomstring = require("randomstring");
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

      _checkNetwork: function(callback) {
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
