

angular.module('myAngularApp.views.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	'use strict';
	$routeProvider
	.when('/login', {
		templateUrl: 'views/login/loginIn.html',
		//template: '<h1>Login!</h1>',
		controller: 'LoginCtrl'
	});
}])

.controller('LoginCtrl', function ($scope,$http, $location, srvCordova, srvConfig, srvData) {
	'use strict';

	$scope.loginSetLogin = function(user) {

		srvData.setUserLoggedIn(user);
		$scope.setAppLogin(true);
		$scope.navJustLogin();
		$scope.redirect('/');
	};

	$scope.loginSubmit = function (email, validForm) {
		if (!validForm) return;

		var userCols = srvData.User.columns;
		srvData.User.findOneByEmail(email)
		.then(function(user){
			$scope.loginSetLogin(user);
		})
		.catch(function(err){
			// Set a new user
			var newUser = {};
			newUser[userCols.email] = email;
			//srvData.User.set(newUser)
			//.then(function(user){
				$scope.loginSetLogin(newUser);
			//})
			//.catch(function(err){
			//	alert("Bad login :"+err);
			//});
		});
	};



	// Init
	$scope.navInit();
	$scope.redirect();

});
