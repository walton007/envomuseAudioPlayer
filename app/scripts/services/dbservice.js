'use strict';

/**
 * @ngdoc service
 * @name musicPlayerApp.dbservice
 * @description
 * # dbservice
 * Factory in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .factory('dbservice', ['$q', 'lodash', '$log', function ($q, _, $log) {
    // Service logic
    // ...
    var Datastore = require('nedb')
    , path = require('path');

    var DataPath = path.join(require('nw.gui').App.dataPath, 'privateData');
    var dataStoreCollection = {
    };

    // Public API here
    return {
      getDataStore: function (storeName) {
        if (storeName in dataStoreCollection) {
          return dataStoreCollection[storeName];
        };
        var db = new Datastore({ filename: path.join(DataPath, storeName),
            autoload: true });
        dataStoreCollection[storeName] = db;
        return db;
      },

      insert: function  (db, doc, callback) {
        var dtd = $q.defer();
        db.insert(doc, function (err, newDoc) {   // Callback is optional
          if (angular.isFunction(callback)) {
            callback(err, newDoc);
          }
          if (err) {
            dtd.reject(err);
            return;
          };
          
          dtd.resolve(newDoc);
        });

        return dtd.promise;
      },

      count: function  (argument) {
        // body...
        var dtd = $.Deferred();
        // db.count({}, function (err, count) {
        //   if (err) {
        //     dtd.reject(err);
        //     return;
        //   };
        //   dtd.resolve(count);
        // });

        return dtd.promise();
      },

      selectAll: function  (argument) {
        // body...
        var dtd = $.Deferred();
        // db.find({}, function (err, docs) {
        //   // body...
        //   if (err) {
        //     dtd.reject(err);
        //     return;
        //   };
        //   dtd.resolve(docs);
        // });

        return dtd.promise();
      },

      clear: function (db, callback) {
        $log.info('clear db:', db);

        var dtd = $q.defer();
        db.remove({}, function (err, numRemoved) {
          if (angular.isFunction(callback)) {
            callback(err, numRemoved);
          }
          if (err) {
            dtd.reject(err);
            return;
          };
          
          dtd.resolve(numRemoved);
        });

        return dtd.promise;
      },

      clearAll: function () {
        $log.info('clear all data');
        var deferArr = [];
        var self = this;
        var dbs = _.values(dataStoreCollection);
        _.each(dbs, function (db) {
            deferArr.push(self.clear(db));
        });

        return $q.all(deferArr);
      }
    };
  }]);
