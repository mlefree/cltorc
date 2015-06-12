
// Controllers

angular.module('myAngularApp.controllers', [
        'crtl.Navigation']);


// Demonstrate how to register services
// In this case it is a simple value service.
//myAngularApp.module('myAngularApp.services', []).
//  value('version', '0.1');



//var serviceModule = angular.module('myAngularApp.services', ['angular-data.DS', 'angular-data.DSCacheFactory']);

//
// // Providers
// // ie https://docs.angularjs.org/guide/providers
// serviceModule.value('appVersion', '0.1');
//
// serviceModule.factory('srvAnalytics', function ($log,srvData) {
//   return new srvAnalytics($log, srvData,'UA-33541085-XXXXX');
// });
//
// //
// // serviceModule.factory('srvData', function ($rootScope,$q,$resource,$log,DS,DSHttpAdapter,DSCacheFactory) {
// //
// //   return new srvData($rootScope,$q,$resource,$log,DS,DSHttpAdapter,DSCacheFactory);
// //
// //   //return DS.defineResource('srvData');
// // });
//
// serviceModule.factory('srvCordova', function ($document, $q) {
//   return new srvCordova($document, $q);
// });


// Services
