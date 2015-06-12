'use strict';

angular.module('myAngularApp.views.dashboard', [])
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/dashboard/dashboardAll.html',
		controller: 'DashboardCtrl'
	});
	//.otherwise({ redirectTo: '/' });
	//.otherwise({
	//	templateUrl: 'views/dashboard/dashboardAll.html',
	//	controller: ''
	//});
})
.controller('DashboardCtrl', function ($scope, $timeout, $routeParams, $q, srvData, srvConfig) {


	$scope.Math = window.Math;
	$scope.dashboardErrorMsg = "";
	$scope.dashboardHistorics = [];
	$scope.dashboardHistoricsDone = [];
	$scope.dashboardSearch = {};
	$scope.dashboardHistoricDisplay = "prior";
	$scope.dashboardLastResetDate = "";
	$scope.dashboardChoresToAdd = {'':[]};
	$scope.dashboardChoresCategoriesToAdd = [''];


	function getDateText(dateText) {
		var dateT = null;
		if (!dateText) return dateT;

		var date = new Date(dateText);
		dateT = ''+padInteger(date.getDate(),2)+'/'+padInteger(date.getMonth(),2)+'/'+padInteger(date.getFullYear(),4)+' '+padInteger(date.getHours(),2)+':'+padInteger(date.getMinutes(),2);
		return dateT;
	}

	function padInteger(num, size) {
		if (!size) size = 10;
		var s = "000000000" + num;
		return s.substr(s.length-size);
	}



	$scope.dashboardShowLastHistoricDateWithChoreId = function(choreId) {
		if (!choreId) return 'na';
		var lastDate = srvData.getDateOfLastChoreDoneByType($scope.chores, $scope.dashboardHistoricsDone, choreId);
		var str = getDateText(lastDate);
		return str;
	};

	$scope.dashboardShowLastHistoricDate = function(historic) {
		if (!historic) return 'na';
		var choreId = historic[$scope.historicCols.choreId];
		var str = $scope.dashboardShowLastHistoricDateWithChoreId(choreId);
		return str;
	};

	$scope.dashboardGetTextIdentifier = function(text) {

		if (!text) return 'na';

	  var map = {
	    //'&': '&amp;',
	    //'<': '&lt;',
	    //'>': '&gt;',
	    //'"': '&quot;',
	    //"'": '&#039;',
		  '&': '',
		  '<': '',
		  '>': '',
		  '"': '',
		  "'": '',
			"/": ''
	  };

	  var str = text.replace(/[&<>/"']/g, function(m) { return map[m]; });

		return str;
	};

	// Spinner
	$scope.dashboardInitSpinnerStopped = false;
	$scope.afterNavigationInitSpinnerShow = function() {
		$scope.navInit();
		if (!$scope.isAppLogin()) return;

		$timeout(function() {
			if (!$scope.isAppLogin()) return;

			$scope.dashboardDataSync();
			$scope.dashboardLastResetDate = getDateText(srvData.getLastResetDate());
		},100);
	};



	// Synchronise DB
	$scope.dashboardReset = function() {
		srvData.reset();
		$scope.dashboardHistoricsDone = [];
		$scope.dashboardLastResetDate = getDateText(srvData.getLastResetDate());
	};

	$scope.dashboardShowReset = function() {
		$scope.dashboardShowResetVar = !$scope.dashboardShowResetVar;
	};


	$scope.dashboardShowMore = function() {
		$scope.dashboardShowMoreVar = !$scope.dashboardShowMoreVar;
	};



	// Synchronise DB
	$scope.dashboardDataSync = function() {
		srvData.sync()
		.then(function(msg){
			$scope.dashboardDataBind();
		})
		.catch(function(msg){
			$scope.dashboardErrorMsg = msg;
			$scope.dashboardDataBind();
		});

	};

	// Recherche données en BdD :
	$scope.dashboardDataBind = function() {
		srvData.isEmpty()
		.then(function(isE){
			if (!isE) {
				$scope.bindCouple().then(function(couple) {
					$scope.bindCategories().then(function(categories) {
						$scope.bindChores().then(function(chores) {

								$scope.dashboardSearch.userId = $scope.userA ? $scope.userA._id : 0;

								// Computes Chores
								$scope.dashboardComputeChoresToAdd();
								//$scope.dashboardComputeHistoricsByPrior()
								$scope.dashboardComputeHistoricsByWeek()
								.then(function (msg) {
									$scope.dashboardInitSpinnerStopped = true;
								})
								.catch(function (msg) {
									$scope.dashboardErrorMsg = "No chore to do. "+msg;
									$scope.dashboardInitSpinnerStopped = true;
								});

								// Compute Historics done
								$scope.dashboardComputeHistoricsDone()
								.then(function (historicsDone) {
									$scope.dashboardComputeIndicleanators();
								})
								.catch(function (msg) {
									$scope.dashboardErrorMsg = "No historic done. "+msg;
									$scope.dashboardInitSpinnerStopped = true;
								});
						}).catch(function(err){
							$scope.dashboardErrorMsg = err;
							$scope.dashboardInitSpinnerStopped = true;
						});
					}).catch(function(err){
						$scope.dashboardErrorMsg = err;
						$scope.dashboardInitSpinnerStopped = true;
					});
				}).catch(function(err){
					$scope.dashboardErrorMsg = err;
					$scope.dashboardInitSpinnerStopped = true;
				});
			}
			else {
				$scope.dashboardErrorMsg = "No data. Please contact support.";
				$scope.dashboardInitSpinnerStopped = true;
			}
		})
		.catch(function(err){
			$scope.dashboardErrorMsg = err;
			$scope.dashboardInitSpinnerStopped = true;
		});
	};



	$scope.dashboardComputeChoresToAdd = function() {
		if (!$scope.chores || $scope.chores.length == 0) return;

		$scope.dashboardChoresToAdd = {'':[]};
		$scope.dashboardChoresCategoriesToAdd = [''];

		$scope.dashboardChoresToAdd[''] = [];
		var arr = $scope.dashboardChoresToAdd[''];
		//arr = $scope.dashboardChoresToAdd['All'];
	//	if (arr) arr.push('test 1');
		//if (arr) arr.push('test 2');
		//if (arr) arr.push('test 3');

		//return;

		//$scope.dashboardChoresToAdd.push({dashboardSelectTitle : 'What are you doing ?'});
		for (var i = 0; i <  $scope.chores.length; i++){
			var choreToAdd = $scope.chores[i];
			var choreCategory = $scope.getChoreCategoryName(choreToAdd[$scope.choreCols.category]);
			var arrC = $scope.dashboardChoresToAdd[choreCategory];
			if (!arrC) {
				$scope.dashboardChoresCategoriesToAdd.push(choreCategory);
				arrC = $scope.dashboardChoresToAdd[choreCategory] = [];
			}
			choreToAdd.dashboardSelectTitle = choreToAdd.choreName;//''+choreCategory+' - '+choreToAdd.choreName;

			if (choreToAdd[$scope.choreCols.timeInMn] > 0) {
				arr.push(choreToAdd);
				arrC.push(choreToAdd);
			}
		}

		$scope.dashboardToAdd = {'chore':null};
	};


	// creation des listes
	// par priorités
	$scope.dashboardComputeHistoricsByPrior = function() {
		var self = this;
		var deferred = $q.defer();
		$scope.dashboardHistoricDisplay = "prior";

		// Init filtre par USer A
		//$scope.dashboardSearch.userId = $scope.userA ? $scope.userA._id : 0;

		// Creation de la liste
		srvData.computeHistoricsByPrior($scope.chores, $scope.userA, $scope.userB, 10)
		.then(function(historics, err){
				$scope.dashboardErrorMsg = err;
				$scope.dashboardHistorics = historics;
				//$scope.dashboardInitSpinnerStopped = true;
				deferred.resolve(err);
		})
		.catch(function(err){
			$scope.dashboardErrorMsg = err;
			//$scope.dashboardInitSpinnerStopped = true;
			deferred.reject(err);
		});

		return deferred.promise;
	};

	// par calendrier
	$scope.dashboardComputeHistoricsByWeek = function() {
		var self = this;
		var deferred = $q.defer();
		$scope.dashboardHistoricDisplay = "week";

		// Creation liste
		srvData.computeHistoricsByCalendar($scope.chores, $scope.dashboardHistoricsDone, $scope.userA, $scope.userB, 7)
		.then(function(historics, err){
			$scope.dashboardErrorMsg = err;
			$scope.dashboardHistorics = historics;
			deferred.resolve(err);
		})
		.catch(function(err){
			$scope.dashboardErrorMsg = err;
			deferred.reject(err);
		});

		return deferred.promise;
	};


	// Find and bind historics marked as "done" in db
	// into $scope.dashboardHistoricsDone
	$scope.dashboardComputeHistoricsDone = function() {
		var self = this;
		var deferred = $q.defer();

		srvData.Historic.findAll(true)
		.then(function (historicsSavedInDb) {
			$scope.dashboardHistoricsDone = historicsSavedInDb;
			$scope.dashboardErrorMsg = "";
			deferred.resolve(historicsSavedInDb);
		})
		.catch(function (msg) {
			$scope.dashboardHistoricsDone = [];
			$scope.dashboardErrorMsg = msg.message ? msg.message : msg;
			deferred.reject(msg);
		});

		return deferred.promise;
	};

	$scope.dashboardToAdd = {'chore':null};
	// Appelée sur "Done" pour enlever de la liste et gérer historique
	$scope.dashboardTerminateHistoric = function(historic) {
		if (!historic) return;

		var self = this;
		var deferred = $q.defer();
		var historicToAdd = {};

		// retrieve Historic in List
		var i = $scope.dashboardHistorics.indexOf(historic);
		if (i >= 0) {
			// remove from list
			$scope.dashboardHistorics.splice(i,1);
			historicToAdd = historic;
		}
		else {
			// copy chore to historic
			angular.copy(historic, historicToAdd);
			historicToAdd._id = null;
			historicToAdd[$scope.historicCols.choreId] = historic[$scope.historicCols.choreId];
			historicToAdd[$scope.historicCols.userId] = $scope.dashboardSearch[$scope.historicCols.userId];
			historicToAdd[$scope.historicCols.frequencyDays] = padInteger(historicToAdd[$scope.historicCols.frequencyDays]);
		}

		// historize what's done
		$scope.dashboardHistoricsDone.push(historicToAdd);

		srvData.terminateHistoric($scope.chores,historicToAdd)
		.then(function (historicsSavedInDb) {
			deferred.resolve(historicsSavedInDb);
		})
		.catch(function (msg) {
			$scope.dashboardErrorMsg = msg.message ? msg.message : msg;
			deferred.reject(msg);
		});

		$scope.dashboardToAdd = {'chore':null};
		return deferred.promise;
	};

	$scope.dashboardNotForMe = function(historic) {
		if (!historic) return;

		var self = this;
		var choreId = historic[$scope.historicCols.choreId];
		var choreToChange = null;
		// retrieve chore
		for (var i = 0; (i <  $scope.chores.length) && !choreToChange; i++){
			var c = $scope.chores[i];
			if (c._id == choreId) choreToChange = c;
		}

		// retrieve Historic in List
		var hi = $scope.dashboardHistorics.indexOf(historic);
		if (hi >= 0) {
			// remove from list
			$scope.dashboardHistorics.splice(hi,1);
		}

		// change chore percent_AB
		if ($scope.dashboardSearch.userId == $scope.userA._id) {
			if (choreToChange) choreToChange[$scope.choreCols.percentAB] = 100;
		}
		else {
			if (choreToChange) choreToChange[$scope.choreCols.percentAB] = 0;
		}

		// Save chore & Sync db
		srvData.Chore.set(choreToChange).then(function(choreSaved){
			srvData.sync().then(function(msg){console.log('pb sync : '+msg);})
			.catch(function(msg){$scope.dashboardErrorMsg = msg;});
		}).catch(function(msg){$scope.dashboardErrorMsg = msg;});

	};

	$scope.dashboardNotForUs = function(historic) {
		if (!historic) return;

		var self = this;
		var deferred = $q.defer();
		var choreId = historic[$scope.historicCols.choreId];
		var choreToChange = null;
		// retrieve chore
		for (var i = 0; (i <  $scope.chores.length) && !choreToChange; i++){
			var c = $scope.chores[i];
			if (c._id == choreId) choreToChange = c;
		}

		// retrieve Historic in List
		var hi = $scope.dashboardHistorics.indexOf(historic);
		if (hi >= 0) {
			// remove from list
			$scope.dashboardHistorics.splice(hi,1);
		}

		// change chore timeInMn
		if (choreToChange) choreToChange[$scope.choreCols.timeInMn] = 0;

		// Save chore & Sync db
		srvData.Chore.set(choreToChange).then(function(choreSaved){
			srvData.sync().then(function(msg){console.log('pb sync : '+msg);})
			.catch(function(msg){$scope.dashboardErrorMsg = msg;});
		}).catch(function(msg){$scope.dashboardErrorMsg = msg;});
	};


	$scope.dashboardDisplayHistoricFrequency = function(freqInDays){
		var i = parseInt(freqInDays);
		if (i <= 1) return "Frequently";
		if (i <= 10) return "When you can";
		if (i > 10) return "Why not now ?";
		return "";
	};

	$scope.dashboardDisplayHistoricDate = function(dateAsYYMMDD){

		var date = new Date(dateAsYYMMDD);
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

		var day = days[ date.getDay() ];
		var month = months[ date.getMonth() ];

		var now = new Date();
		var tomorrow = new Date(now);
		tomorrow.setDate(now.getDate() + 1);
		var isToday = ((date.getDate() ==  now.getDate()) &&(date.getMonth() ==  now.getMonth()) &&(date.getFullYear() ==  now.getFullYear()));
		var isTomorrow = ((date.getDate() ==  tomorrow.getDate()) &&(date.getMonth() ==  tomorrow.getMonth()) &&(date.getFullYear() ==  tomorrow.getFullYear()));
		if (isToday) day = 'Today, '+day;
		if (isTomorrow) day = 'Tomorrow, '+day;

		return day;
	};

	$scope.dashboardDisplayHistoricCalendar = function(dateAsYYMMDD){
		var display = "" + $scope.dashboardDisplayHistoricDate(dateAsYYMMDD) + " <small>"+dateAsYYMMDD+ "</small>";
		return display;
	};

	$scope.dashboardProfilFillColor = function(user) {
		if (!$scope.userA || !$scope.userB) return "#FFFFFF";
		if (user._id == $scope.userB._id)
			return srvConfig.getProfilColors(1).fill;
			return srvConfig.getProfilColors(0).fill;
	};
	$scope.dashboardProfilStrokeColor = function(user) {
		if (!$scope.userA || !$scope.userB) return "#FFFFFF";
		if (user._id == $scope.userB._id)
			return srvConfig.getProfilColors(1).stroke;
		return srvConfig.getProfilColors(0).stroke;
	};
	$scope.dashboardProfilHighlightColor = function(user) {
		if (!$scope.userA || !$scope.userB) return "#FFFFFF";
		if (user._id == $scope.userB._id)
			return srvConfig.getProfilColors(1).hightlight;
		return srvConfig.getProfilColors(0).hightlight;
	};

	$scope.dashboardProfilColor = function() {
		if (!$scope.userA || !$scope.userB) return "#FFFFFF";

		if ($scope.dashboardSearch.userId == $scope.userB._id)
		return $scope.dashboardProfilFillColor($scope.userB);

		return $scope.dashboardProfilFillColor($scope.userA);
	};



	// --------------------
	// Modals & Indicators display management
	// --------------------
	$scope.dashboardIndicleanator = 0;
	$scope.dashboardIndicleanatorSquare = 0;
	$scope.dashboardChartColours = [
		{ // userB
			fillColor: "rgba(100,100,100,0.1)",//"#fff",//$scope.dashboardProfilFillColor($scope.userB),
			strokeColor: "#bb2",//$scope.dashboardProfilStrokeColor($scope.userB),
			pointColor: "#bb3",//$scope.dashboardProfilFillColor($scope.userB),
			pointStrokeColor: "#fff",
			pointHighlightFill: "#bb4",
			pointHighlightStroke: "#bb5"//$scope.dashboardProfilHighlightColor($scope.userB)
		},
		{ // userA
			fillColor: "rgba(200,200,200,0.2)",//"#fff",//$scope.dashboardProfilFillColor($scope.userA),
			strokeColor: "#ee2",//$scope.dashboardProfilStrokeColor($scope.userA),
			pointColor: "#ee3",//$scope.dashboardProfilFillColor($scope.userA),
			pointStrokeColor: "#fff",
			pointHighlightFill: "#ee5",
			pointHighlightStroke: "#ee5"//$scope.dashboardProfilHighlightColor($scope.userA)
		}
	];

	$scope.dashboardModalDone = function(close) {
		if (close) {
			$scope.labelsDo = null;
			$scope.dataDo = null;
			return;
		}
		$timeout(function() {
			$scope.dashboardComputeDoneIndicators();
		},1000);
	};

	$scope.dashboardHistoricToConfirm = null;
	$scope.dashboardLaunchModalDone = function(historicToConfirm) {
		$scope.dashboardHistoricToConfirm = historicToConfirm;
	};


	$scope.dashboardComputeDoneIndicators = function() {

		$scope.labelsDo = [];//["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];
		$scope.dataDo = [[],[]];//= [
		//	[65, 59, 90, 81, 56, 55, 40],
		//	[28, 48, 40, 19, 96, 27, 100]
		//];

		for (var i = 0; i < $scope.dashboardHistoricsDone.length; i++) {
			var historic = $scope.dashboardHistoricsDone[i];
			var category = $scope.getChoreCategoryName(historic.choreCategory);
			var catIndex = $scope.labelsDo.indexOf(category);
			if (catIndex < 0) $scope.labelsDo.push(category);
		}

		for (var j = 0; j < $scope.labelsDo.length; j++) {
			$scope.dataDo[0].push(0);
			$scope.dataDo[1].push(0);
		}

		for (var k = 0; k < $scope.dashboardHistoricsDone.length; k++) {
			var historic = $scope.dashboardHistoricsDone[k];
			var category = $scope.getChoreCategoryName(historic.choreCategory);
			var labelIndex = $scope.labelsDo.indexOf(category);
			var userIndex = (historic[$scope.historicCols.userId] == $scope.userA._id) ? 1 : 0;
			var oldValue = $scope.dataDo[userIndex][labelIndex];
			$scope.dataDo[userIndex][labelIndex] = oldValue + 1;
		}
	};

	$scope.dashboardModalIndicleanator = function(close) {

		$scope.labelsIndicleanator = null;
		$scope.dataIndicleanator = null;
		$scope.labelsDo = null;
		$scope.dataDo = null;

		$scope.dashboardShowResetVar = close;
		$scope.dashboardShowMoreVar = close;

		var showLabel = !close;
		$timeout(function() {
			$scope.dashboardComputeIndicleanators(showLabel);
			$scope.dashboardComputeDoneIndicators(showLabel);
		},1000);
	};
	$scope.dashboardComputeIndicleanators = function(showLabels) {

		var userATimeSpent = 0;
		var userBTimeSpent = 0;
		var userATimeAvailable = $scope.userA[$scope.userCols.timeInMnPerWeekTodo];
		var userBTimeAvailable = $scope.userB[$scope.userCols.timeInMnPerWeekTodo];
		var period = 12; //TODO find vs reset

		for (var i = 0; i < $scope.dashboardHistoricsDone.length; i++) {
			var historic = $scope.dashboardHistoricsDone[i];
			if (historic[$scope.historicCols.userId] == $scope.userA._id) {
				userATimeSpent += historic[$scope.historicCols.timeInMn];
			}
			else {
				userBTimeSpent += historic[$scope.historicCols.timeInMn];
			}
		}
		var indicA = Math.round((userATimeSpent * period / userATimeAvailable)*10)/10;
		var indicB = Math.round((userBTimeSpent * period / userBTimeAvailable)*10)/10;
		var indicAPer = Math.round((indicA * 100 / (indicA+indicB)));
		var indicBPer = Math.round((indicB * 100 / (indicA+indicB)));

		// Abs : $scope.dashboardIndicleanator = Math.round(Math.pow(indicA - indicB, 2) * 10) / 10;
		$scope.dashboardIndicleanator = Math.round((indicA - indicB) * 10) / 10;
		$scope.dashboardIndicleanatorSquare = Math.pow($scope.dashboardIndicleanator,2);

		if (showLabels) $scope.labelsIndicleanator = [$scope.userB[$scope.userCols.firstName] , $scope.userA[$scope.userCols.firstName]];
		if (showLabels) $scope.dataIndicleanator = [indicBPer, indicAPer];

	};

	//------------------
	// Initialization
	if ($scope.redirect) $scope.redirect();
	//$scope.dashboardModalIndicleanator(true);

});
