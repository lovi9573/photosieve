/**
 * 
 */

define(['require','jquery','angular', 'angular-route', 'main','bs'], function(require,$, ng){
	
	require(['domReady'], function(document){
		
		ng.bootstrap(document,['mainApp']);
	});
	
});