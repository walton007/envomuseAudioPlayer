'use strict';

/**
 * @ngdoc function
 * @name musicPlayerApp.decorator:Log
 * @description
 * # Log
 * Decorator of the musicPlayerApp
 */
angular.module('musicPlayerApp')
	.config(function($provide) {
		$provide.decorator('$log', function($delegate) {
			// decorate the $delegate
			var debugFn = $delegate.debug;
			$delegate.debug = function() {
				var args = [].slice.call(arguments);

				// Prepend timestamp
				// console.log('xxx');

				// Call the original with the output prepended with formatted timestamp
				debugFn.apply(null, args)
			};
			return $delegate;
		});
	});