'use strict';
// Fonctions gestions taches

angular.module('myAngularApp.views.chore', []).config(function($routeProvider) {
	$routeProvider
	.when('/chore', {
		templateUrl: 'views/chore/choreAll.html',
		controller: 'ChoresCtrl'
	})
	.when('/chore/:choreId', {
		templateUrl: 'views/chore/choreDetail.html',
		controller: 'ChoresCtrl'
	});
})
.controller('ChoresCtrl', function ($scope, $timeout, $routeParams, $location, srvData, srvConfig) {

	$scope.choreErrMessage = "";
	$scope.Math = window.Math;

/*
	$scope.choreThumbPaths = [
		{name:'ch black', path:'images/chores/animaux.png'},
		{name:'white', path:'images/chores/aspirateur.png'},
		{name:'red', path:'images/chores/poussiere.png'},
		{name:'blue', path:'images/chores/baignoire.png'},
		{name:'yellow', path:'images/chores/baignoire.png'}
	];

	$scope.choreCategoryThumbPaths = [
	{name:'c black', path:'images/categories/maison.png', category:'03_Salon'},
	{name:'c white', path:'images/categories/cuisine.png', category:'06_Salle_de_bain'},
	{name:'red', path:'images/categories/cuisine.png', category:'01_Chambre'},
	{name:'blue', path:'images/categories/cuisine.png', category:'06_Salle_de_bain'},
	{name:'yellow', path:'images/categories/cuisine.png', category:'06_Salle_de_bain'}
	];
*/

$scope.getDateText = function(dateText) {
	var dateT = null;
	if (!dateText) return dateT;

	var date = new Date(dateText);
	dateT = ''+padInteger(date.getDate(),2)+'/'+padInteger(date.getMonth(),2)+'/'+padInteger(date.getFullYear(),4)+' '+padInteger(date.getHours(),2)+':'+padInteger(date.getMinutes(),2);
	return dateT;
};

function padInteger(num, size) {
	if (!size) size = 10;
	var s = "000000000" + num;
	return s.substr(s.length-size);
}




	$scope.choreInit = function() {
	};


	$scope.choreInitSpinnerStopped = false;
	$scope.afterNavigationInitSpinnerShow = function() {
		$scope.navInit();
		if (!$scope.isAppLogin()) return;

		$timeout(function() {
				if (!$scope.isAppLogin()) return;

				$scope.choreDataSync();
		},200);
	};

	// Synchronise DB
	$scope.choreDataSync = function() {
				//srvData.sync()
				//.then(function(msg){
					$scope.choreDataBind();
				//})
				//.catch(function(msg){
				//	$scope.choreErrMessage = msg;
				//	$scope.choreDataBind();
				//});

	};

	// Recherche données en BdD :
	$scope.choreDataBind = function() {

		var lang = srvConfig.getConfigLang();

		srvData.isEmpty().then(function(isE){
			if (isE) {
				//initAvec première données (fichier en dur)
				srvData.initWithFirstData(lang).then(function(ra) {
					// initialise données depuis bdd
					$scope.bindCouple().then(function(couple) {
						$scope.bindCategories().then(function(categories) {
							$scope.bindChores().then(function(chores) {
								$scope.choreInit();
								$scope.choreInitSpinnerStopped = true;
								$scope.choreErrMessage = ""; //Back to normality
							}).catch(function(err){
								$scope.choreErrMessage = err ? err : 'pb with getting chores';
								$scope.choreInitSpinnerStopped = true;
							});
						}).catch(function(err){
							$scope.choreErrMessage = err ? err : 'pb with getting categories';
							$scope.choreInitSpinnerStopped = true;
						});
					}).catch(function(err){
						$scope.choreErrMessage = err ? err : 'pb with getting couple';
						$scope.choreInitSpinnerStopped = true;
					});
				}).catch(function(err){
					$scope.choreErrMessage = err ? err : 'pb with getting data';
					$scope.choreInitSpinnerStopped = true;
				});
		 	} else {

				// initialise données depuis bdd
				$scope.bindCouple().then(function(couple) {
					$scope.bindCategories().then(function(categories) {
						$scope.bindChores().then(function(chores) {
							$scope.choreInit();
							$scope.choreInitSpinnerStopped = true;
							$scope.choreErrMessage = ""; //Back to normality
						}).catch(function(err){
							$scope.choreErrMessage = err ? err : 'pb with getting chores';
							$scope.choreInitSpinnerStopped = true;
						});
					}).catch(function(err){
						$scope.choreErrMessage = err ? err : 'pb with getting categories';
						$scope.choreInitSpinnerStopped = true;
					});
				}).catch(function(err){
					$scope.choreErrMessage = err ? err : 'pb with getting couple';
					$scope.choreInitSpinnerStopped = true;
				});

			}
		})
		.catch(function(err){
			$scope.choreErrMessage =  err ? err : 'pb with getting first data';
			$scope.choreInitSpinnerStopped = true;
		});
	};


	$scope.saveAllChores = function() {
		console.log('all saved');
	};

	$scope.choreSaveJeton = false;
	$scope.saveChore = function(chore, reBindData) {
		if (chore && !$scope.choreSaveJeton) {
			//$scope.safeApply(function(){
				$scope.choreSaveJeton = true;
				//chore[$scope.choreCols.percentAB] = chorePercent;


				srvData.Chore.set(chore)
				.then(function (res) {
					$scope.choreSaveJeton = false;
					$scope.choreResetEditModal();
					console.log('saved');

					// is it an add ? -> refresh chore list $scope.chores ?
					if (reBindData === true) $scope.choreDataSync();
				})
				.catch(function(err){
					$scope.choreSaveJeton = false;
					$scope.choreResetEditModal();
					$scope.choreErrMessage = err;
				});
			//});
		}
	};

	$scope.choreToEdit = null;
	$scope.choreEdit = function(chore) {
		$scope.choreToEdit = chore;

		// synchronise right thumbs
		var choreDescriptionCat = $scope.choreToEdit[$scope.choreCols.choreDescriptionCat];
		$scope.thumbChoreObj = $scope.categories[0];
		for (var j=0; j < $scope.categories.length; j++){
			var t = $scope.categories[j];
			if (t.categoryName == choreDescriptionCat) {
				$scope.thumbChoreObj = t;
				break;
			}
		}
		var category = $scope.choreToEdit[$scope.choreCols.category];
		$scope.thumbCategoryObj = $scope.categories[0];
		for (var i=0; i < $scope.categories.length; i++){
			var t2 = $scope.categories[i];
			if (t2.categoryName == category) {
				$scope.thumbCategoryObj = t2;
				break;
			}
		}

	};

	$scope.choreAddChore = function(category) {

		$scope.choreToEdit = {};
		$scope.choreToEdit[$scope.choreCols.category] = category;
		$scope.choreToEdit[$scope.choreCols.percentAB] = 50;
		$scope.choreToEdit[$scope.choreCols.timeInMn] = 5;
		$scope.choreToEdit[$scope.choreCols.frequencyDays] = 3;
		$scope.choreToEdit[$scope.choreCols.priority] = 5;
		$scope.choreToEdit[$scope.choreCols.priorityComputed] = 5;

		// synchronise right thumbs
		var thumb = $scope.categories[0];
		//$scope.choreToEdit[$scope.choreCols.choreDescriptionCat] = thumb.categoryName;
		$scope.thumbChoreObj = thumb;

		$scope.thumbCategoryObj = $scope.categories[0];
		for (var i=0; i < $scope.categories.length; i++){
			var t2 = $scope.categories[i];
			if (t2.categoryName == category) {
				$scope.thumbCategoryObj = t2;
				break;
			}
		}

	};

	$scope.choreAddCategory = function() {

	};


	$scope.choreDelete = function(chore, reBindData) {
		srvData.Chore.remove(chore).then(function(msg) {
			// is it an add ? -> refresh chore list $scope.chores ?
			if (reBindData === true) $scope.choreDataSync();
		}).catch(function(msg) {
			$scope.choreErrMessage = msg;
		});
	};


	$scope.choreTogglePriority = function(chore) {
		if (!chore) return;

		var prio = chore[$scope.choreCols.priority];
		if (prio == 1) prio = 5;
		else prio = 1;

		chore[$scope.choreCols.priority] = prio;
	};


	$scope.choreResetEditModal = function() {
		$scope.choreToEdit = null;
	};

	$scope.choreSetThumb = function(thumbObj){
		if (!thumbObj || !thumbObj[$scope.categoryCols.name] || !$scope.choreToEdit) return;
		$scope.choreToEdit[$scope.choreCols.choreDescriptionCat] = thumbObj[$scope.categoryCols.name];
	};

	$scope.choreCategorySetThumb = function(thumbObj){
		if (!thumbObj || !thumbObj[$scope.categoryCols.name] || !$scope.choreToEdit) return;
		$scope.choreToEdit[$scope.choreCols.category] = thumbObj[$scope.categoryCols.name];
	};


	$scope.choreShowLastHistoricDate = function(chore, previousValue) {

		//if (!dateH) return 'na';
		//var str = getDateText(dateH);
		//return str;
		if (!chore) return previousValue ? previousValue : 'na';
		var choreId = chore._id;
		if (!choreId) return previousValue ? previousValue : 'na';
		//var lastDate = srvData.getDateOfLastChoreDoneByType($scope.dashboardHistoricsDone, choreId);
		var lastDate = chore[$scope.choreCols.lastTimeDone];
		var str = getDateText(lastDate);
		return str;
	};

	//------------------
	// Initialization
	if ($scope.redirect) $scope.redirect();


});
