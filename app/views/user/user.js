'use strict';

angular.module('myAngularApp.views.user', []).config(function($routeProvider) {
  $routeProvider
  .when('/user', {
    templateUrl: 'views/user/userAll.html',
    controller: 'UsersCtrl'
  })
  .when('/usercal', {
    templateUrl: 'views/user/userCalendar.html',
    controller: 'UsersCtrl'
  })
  .when('/user/:userId', {
    templateUrl: 'views/user/userDetail.html',
    controller: 'UsersCtrl'
  });
})
.controller('UsersCtrl', function ($scope, $timeout, $routeParams, $location, $q, srvData, srvConfig) {

  //$scope.userId = userId;
  $scope.userId = $routeParams.userId;
  $scope.userToConfig = {};
  $scope.userErrMessage = "";

  $scope.userInitSpinnerStopped = false;
  $scope.afterNavigationInitSpinnerShow = function() {
    $scope.navInit();
    if (!$scope.isAppLogin()) return;

    $timeout(function() {
      if (!$scope.isAppLogin()) return;

      if ($scope.userId) $scope.userBindById();
      else $scope.userDataSync();

    },1000);
  };


  $scope.logout = function(){
    srvData.setUserLoggedIn(null);
    srvData.becarefulClean();
    srvConfig.setConfigAppFirstInitDone(false);
    $scope.setAppLogin(false);

  };


  // Synchronise DB
  $scope.userDataSync = function() {
    srvData.sync()
    .then(function(msg){
      $scope.choreDataBind();
    })
    .catch(function(msg){
      $scope.userErrMessage = msg.statusText ? msg.statusText : 'Error in the first bind : '+msg;
      $scope.choreDataBind();
    });
  };

  $scope.userStopSpinnerWithMessage = function(msg) {
    $scope.userErrMessage = msg;
    $scope.userInitSpinnerStopped = true;
  };

  // Recherche données en BdD :
  $scope.choreDataBind = function() {
    var lang = srvConfig.getConfigLang();
    srvData.isEmpty()
    .then(function(isE){
      if (isE) {
        //initAvec première données (fichier en dur)
        srvData.initWithFirstData(lang)
        .then(function(ra) {
          $scope.bindUserLoggedIn().then(function(user) {
            $scope.bindCouple().then(function(couple) {
              $scope.userSave($scope.userA);
              $scope.userSave($scope.userB);

              $scope.bindCategories().then(function(categories) {
                $scope.bindChores().then(function(chores) {
                  //$scope.choreInit();
                  //if ($scope.userId) $scope.userBindById();
                  $scope.userInitSpinnerStopped = true;
                  $scope.userErrMessage = "";//back to normality
                }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting chores data');});
              }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting categories data');});
            }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting couple data');});
          }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting user data.');});
        })
        .catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting data.');});
      } else {
        $scope.bindUserLoggedIn().then(function(user) {
          $scope.bindCouple().then(function(couple) {
            $scope.userSave($scope.userA);
            $scope.userSave($scope.userB);
            $scope.bindCategories().then(function(categories) {
              $scope.bindChores().then(function(chores) {
                //$scope.choreInit();
                //if ($scope.userId) $scope.userBindById();
                $scope.userInitSpinnerStopped = true;
                $scope.userErrMessage = "";//back to normality
              }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting chores data');});
            }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting categories data');});
          }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting data ..');});
        }).catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting data .');});
      }
    })
    .catch(function(err){$scope.userStopSpinnerWithMessage(err ? err : 'pb with getting data');});

  };


  $scope.userBindById = function() {
    var self = this;
    var deferred = $q.defer();

    if ($scope.userId) {
      srvData.User.findOneById($scope.userId)
      .then(function (user) {
        $scope.userToConfig = user;
        $scope.userInitSpinnerStopped = true;
        $scope.userErrMessage = "";//back to normality
        deferred.resolve($scope.userToConfig);
      })
      .catch(function (err) {
        $scope.userErrMessage = "Can't init : "+err;
        $scope.userInitSpinnerStopped = true;
        deferred.resolve(null);
      });
    }
    else {
      $scope.userInitSpinnerStopped = true;
      $scope.userErrMessage = "No user found";
      deferred.resolve(null);
    }

    return deferred.promise;
  };



  $scope.userSaveEnable = {};
  $scope.userSave = function(user) {
    if (!user || !user._id) return;
    var uid = user._id;

    if (typeof $scope.userSaveEnable[uid] !== "undefined" && $scope.userSaveEnable[uid] === false) {
      console.log("already saving");
      return;
    }
    $scope.userSaveEnable[uid] = false;

    // synthetise timeInMnPerWeekTodo
    $scope.userUpdateTimePerWeek(user);

    // store & save user data
    srvData.User.set(user)
    .then(function(userSaved){
      console.log("user saved");
      $scope.userSaveEnable[uid] = true;})
    .catch(function(err){$scope.userSaveEnable[uid] = true;});
  };

  $scope.userAHasSameTimeEachDay = false;
  $scope.userBHasSameTimeEachDay = false;
  $scope.setUserASameTimeEachDay = function(val){
    //var value = val ? val : !$scope.userAHasSameTimeEachDay;
    //$scope.userAHasSameTimeEachDay = true;
    $scope.userUpdateTimePerWeek($scope.userA, true);
  };
  $scope.setUserBSameTimeEachDay = function(val){
    //var value = val ? val : !$scope.userBHasSameTimeEachDay;
    //$scope.userBHasSameTimeEachDay = true;
    $scope.userUpdateTimePerWeek($scope.userB, true);
  };

  $scope.userUpdateTimePerWeek = function(user, forceSameValue) {
    if (!user) return;

    var defaultValuePerDay = Math.round(user[$scope.userCols.timeInMnPerWeekTodo] / 7);

    // same value each days
    var shouldPutSameValueInEachDays = false;
    if ($scope.userA && $scope.userA._id == user._id && $scope.userAHasSameTimeEachDay) shouldPutSameValueInEachDays = true;
    else if ($scope.userB && $scope.userB._id == user._id && $scope.userBHasSameTimeEachDay) shouldPutSameValueInEachDays = true;

    // synthetise timeInMnPerWeekTodo
    var mond = user[$scope.userCols.timeInMnPerMond] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerMond]) : defaultValuePerDay;
    var tues = user[$scope.userCols.timeInMnPerTues] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerTues]) : defaultValuePerDay;
    var wedn = user[$scope.userCols.timeInMnPerWedn] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerWedn]) : defaultValuePerDay;
    var thur = user[$scope.userCols.timeInMnPerThur] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerThur]) : defaultValuePerDay;
    var frid = user[$scope.userCols.timeInMnPerFrid] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerFrid]) : defaultValuePerDay;
    var satu = user[$scope.userCols.timeInMnPerSatu] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerSatu]) : defaultValuePerDay;
    var sund = user[$scope.userCols.timeInMnPerSund] >= 0 ? Math.round(user[$scope.userCols.timeInMnPerSund]) : defaultValuePerDay;
    var weekSum = mond + tues + wedn + thur + frid + satu + sund;

    if (shouldPutSameValueInEachDays || (forceSameValue === true)) {
      tues = wedn = thur = frid = satu = sund = mond;
      weekSum = mond + tues + wedn + thur + frid + satu + sund;
    }

    if (weekSum != user[$scope.userCols.timeInMnPerWeekTodo])
      user[$scope.userCols.timeInMnPerWeekTodo] = weekSum;

    user[$scope.userCols.timeInMnPerMond] = mond;
    user[$scope.userCols.timeInMnPerTues] = tues;
    user[$scope.userCols.timeInMnPerWedn] = wedn;
    user[$scope.userCols.timeInMnPerThur] = thur;
    user[$scope.userCols.timeInMnPerFrid] = frid;
    user[$scope.userCols.timeInMnPerSatu] = satu;
    user[$scope.userCols.timeInMnPerSund] = sund;

    //var hasSameTimeEachDay = (mond == tues && tues == wedn && wedn == thur && thur == frid && frid == satu && satu == sund);
    //if ($scope.userA && $scope.userA._id == user._id) $scope.userAHasSameTimeEachDay = hasSameTimeEachDay;
    //else if ($scope.userB && $scope.userB._id == user._id) $scope.userBHasSameTimeEachDay = hasSameTimeEachDay;

  };

  $scope.userUpdateProfilColor = function(user,themeId) {

    user.profilColor = themeId;
    srvConfig.updateProfilColors($scope.userA,$scope.userB);

    $scope.userSave($scope.userA);
    $scope.userSave($scope.userB);
  };


  //------------------
  // Initialization
  if ($scope.redirect) $scope.redirect();

});
