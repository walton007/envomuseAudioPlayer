'use strict';

/**
 * @ngdoc filter
 * @name musicPlayerApp.filter:durationFilter
 * @function
 * @description
 * # durationFilter
 * Filter in the musicPlayerApp.
 */
angular.module('musicPlayerApp')
  .filter('durationFilter', function () {
  	function addZero(value) {
  		return value < 10 ? ('0'+value) : value;
  	}
    return function (_seconds) {
      var milliseconds = _seconds*1000;
    	var duration = moment.duration(milliseconds);
    	var days, hours, minutes, seconds;
    	days = duration.get('days');
    	hours = duration.get('hours');
		minutes = duration.get('minutes');
		seconds = duration.get('seconds');
		
		var basic = addZero(hours)+':' + addZero(minutes) + ':' + addZero(seconds);
		return days ? (days+'d '+ basic) : basic;
    };
  });
