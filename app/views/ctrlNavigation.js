

function ctrlNavigation($scope,$log,$route,$routeParams,$location,$anchorScroll,$timeout,$q, srvCordova, srvAnalytics, srvData,srvConfig) {
  'use strict';

  //$scope.$route = $route;
  //$scope.$location = $location;
  //$scope.$routeParams = $routeParams;
  //$scope.$log = $log;


  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  // spinner
  $scope.afterNavigationInitSpinnerShow = function() {
    $scope.navInit();
    $timeout(function() {},100);
  };

  $scope.afterNavigationInitSpinnerHide = function() {
  };
  // spinner - end


  $scope.appLoggedIn = false;
  $scope.appFirstInitDone = false;
  $scope.appFirstInitDoneLevel = 0;

  $scope.isActive = function (viewLocation) {
     return viewLocation === $location.path();
  };


  $scope.navInit = function() {

  //  srvCordova.ready.then(function() {
  //    // Cordova is ready
  //    alert('Cordova Ready');
  //  });

  //  $scope.$watch(function() { return $location.path(); }, function(newValue, oldValue){
  //     if (!$scope.appLoggedIn && newValue != '/login'){
  //             $location.path('/login');
  //     }
  //  });

    $scope.navJustLogin();
  };

  $scope.navJustLogin = function(){

    var userLoggedIn = srvData.getUserLoggedIn();
    if (userLoggedIn) $scope.setAppLogin(true);

    $scope.appFirstInitDone = srvConfig.isAppFirstInitDone();
    if ($scope.appFirstInitDone) $scope.setAppFirstInit(2);
  };

  $scope.setAppLogin = function(b) {
    $scope.appLoggedIn = b;
    if (!$scope.appLoggedIn) {
      $scope.appFirstInitDone = false;
      $location.path('/login');
    }
  };

  $scope.isAppLogin = function(b) {

    //verify if it's just a refresh page
    if (!$scope.appLoggedIn) {
      $scope.navJustLogin();
    }

    return $scope.appLoggedIn;
  };

  $scope.setAppFirstInit = function(level) {
    $scope.appFirstInitDoneLevel = level;
    if ($scope.appFirstInitDoneLevel == 2) $scope.appFirstInitDone = true;
    srvConfig.setConfigAppFirstInitDone($scope.appFirstInitDone);
  };


  $scope.isAppFirstInitDone = function() {
    return $scope.appFirstInitDone;
  };



  $scope.redirect = function(pathToGo) {
    var url = $location.url();
    var path = $location.path();
    var loggedIn = $scope.isAppLogin();
    if (!loggedIn) $location.path('/login');
    else if (!$scope.appFirstInitDone && pathToGo == '/') $location.path('/user');
    else if (pathToGo) $location.path(pathToGo);
  };


  $scope.back = function(){
    history.back();
  };



  $scope.userA = null;
  $scope.couple = null;
  $scope.userB = null;
  $scope.chores = null;
  $scope.categories = null;
  $scope.userCols = [];
  $scope.coupleCols = [];
  $scope.historicCols = [];
  $scope.choreCols = [];
  $scope.categoryCols = [];
  $scope.choresAsJSON = {};




  $scope.bindUserLoggedIn = function() {
    var self = this;
    var deferred = $q.defer();
    $scope.userCols = srvData.User.columns;
    var userMain = srvData.getUserLoggedIn();

    if (userMain && userMain.email) {
      srvData.User.findOneByEmail(userMain.email)
      .then(function (user) {
        srvData.setUserLoggedIn(user);
        deferred.resolve(user);
      })
      .catch(function (msg) {
        deferred.reject(msg);
      });
    }
    else deferred.reject('No user to find');

    return deferred.promise;
  };


  $scope.bindCouple = function() {
    var self = this;
    var deferred = $q.defer();
    $scope.userCols = srvData.User.columns;
    $scope.coupleCols = srvData.Couple.columns;
    $scope.historicCols = srvData.Historic.columns;
    var userMain = srvData.getUserLoggedIn();

    if (userMain) {
      srvData.Couple.findOne(userMain)
      .then(function (couple) {
        $scope.couple = couple;

        if ($scope.couple) srvData.getUserAFromCouple($scope.couple).then(function(user){
          $scope.userA = user;
          srvData.getUserBFromCouple($scope.couple).then(function(user){
            $scope.userB = user;
            deferred.resolve($scope.couple);
          });
        });
      })
      .catch(function (msg) {
        $scope.couple = {};
        deferred.resolve($scope.couple);
      });
    }
    return deferred.promise;
  };

  $scope.bindChores = function() {
    var self = this;
    var deferred = $q.defer();
    //deferred.resolve($scope.chores);
    //deferred.reject(err);
    var userMain = srvData.getUserLoggedIn();

    $scope.choreCols = srvData.Chore.columns;

    if (userMain) srvData.Chore.findAll(userMain).then(function (chores) {
      $scope.chores = chores;
      $scope.choresAsJSON = JSON.stringify(chores);
      deferred.resolve($scope.chores);
    });

    return deferred.promise;
  };


  $scope.bindCategories = function() {
    var self = this;
    var deferred = $q.defer();
    $scope.categoryCols = srvData.Category.columns;
    srvData.Category.findAll().then(function (categories) {
      $scope.categories = categories;
      deferred.resolve($scope.categories);
    });
    return deferred.promise;
  };

  $scope.getNumberedId = function(idToTransform) {
    if (!idToTransform) return 0;

    //var numberExtracted = idToTransform.replace( /^\D+/g, '');
    //var numberExtracted = idToTransform.match(/\d+/);
    var numberExtracted = idToTransform.match(/\d/g);
    numberExtracted = numberExtracted.join("");

    if (!numberExtracted) {
      var asciiCode = idToTransform.charCodeAt(0);
      if (idToTransform.length > 1) asciiCode += idToTransform.charCodeAt(1);
      if (idToTransform.length > 10) asciiCode += idToTransform.charCodeAt(10);
      numberExtracted = asciiCode;
    }
    //var number = parseInt(numberExtracted);
    return numberExtracted;
  };

  $scope.getChoreCategoryName = function(choreGroup){

    if (!choreGroup) return 'na';
    var choreCategories = $scope.categories;
    for (var i = 0; i < choreCategories.length; i++){
      var cat = choreCategories[i];
      if (cat.categoryName == choreGroup)
        return cat.description;
    }
    return 'na';
  };

  $scope.getChoreCategoryThumbPath = function(choreGroup){

    if (!choreGroup) return 'na';
    var choreCategories = $scope.categories;
    for (var i = 0; i < choreCategories.length; i++){
      var cat = choreCategories[i];
      if (cat.categoryName == choreGroup)
        return cat.thumb;
    }
    return 'na';
  };

  $scope.getChoreCategoryColor = function(choreGroup){

    if (!choreGroup) return 'na';
    var choreCategories = $scope.categories;
    for (var i = 0; i < choreCategories.length; i++){
      var cat = choreCategories[i];
      if (cat.categoryName == choreGroup)
        return cat.color;
    }
    return 'na';
  };


  $scope.getChoreThumbPath = function(choreDescriptionCat){

    if (!choreDescriptionCat) return 'na';
    var choreCategories = $scope.categories;
    for (var i = 0; i < choreCategories.length; i++){
      var cat = choreCategories[i];
      if (cat.categoryName == choreDescriptionCat)
        return cat.thumb;
    }
    return 'na';
  };

  $scope.navigationTraceClick = function(event) {

    //ga('send','pageview','/test-'+event);

    //_gaq('send', 'pageview', {'page': '/itMLEWorks'+event});
    srvAnalytics.add('EventMLE', 'MLE-'+event);

    //return false;
  };

  $scope.navigLangs = [
                      {title:'English', code:'en'},
                      {title:'Français', code:'fr'},
                      {title:'Espagnol', code:'es'}
                      ];
  $scope.navigLang = $scope.navigLangs[0];
  $scope.navigationChangeLang = function(lang) {
    srvConfig.setConfigLang(lang);
  }

  //--------------------
  // INITIALIZATION
  //$scope.navInit();


}

angular.module('crtl.Navigation', []).controller('ctrlNavigation', ctrlNavigation);
//ctrlNavigation.$inject = ['$scope','$log','$route','$routeParams','$location','$anchorScroll','$timeout','$q','srvCordova','srvAnalytics', 'srvData'];
