/**
 * 
 */

requirejs.config({
	baseUrl: 'scripts/lib',
	paths: {
		app: '..',
		jquery: 'jquery-2.1.1',
		angular: 'angular',
		'angular-route': 'angular-route',
		main: '../main',
		bs: 'bootstrap'
	},
	
	shim: {
		'angular': {
			deps: ['jquery'],
			exports: 'angular'
		},
		'angular-route':{
			deps: ['angular']
		},
		'bs':{
			deps: ['jquery']
		},
		'main':{
			deps: ['jquery']
		}
		
	},
	
	deps: ['jquery-2.1.1','../appbootstrap' ]
	
});

//requirejs(['app/main']);