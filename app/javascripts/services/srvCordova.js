'use strict';

angular.module('srvCordova', [])

.factory('srvCordova', function ($document, $q, srvAnalytics) {
  return new SrvCordova($document, $q, srvAnalytics);
});


var SrvCordova = (function() {



  function Service($document, $q, srvAnalytics) {


          var d = $q.defer(), resolved = false;

          var self = this;
          self.ready = d.promise;
          self.srvAnalytics = srvAnalytics;

          function successHandler() {

              var udid = self.getUDID();
              alert('Welcome in : '+udid);
              gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Button", "Click", "event only", 1);
          }
          function errorHandler() {

              var udid = self.getUDID();
              alert('one pb : '+udid);
          }


          //document.addEventListener("deviceready", onDeviceReady, true);

          document.addEventListener('deviceready',function() {

              //var udid = self.getUDID();
              var udid = self.getUDID();
              alert('Welcome !'+self);
              //gaPlugin = window.plugins.gaPlugin;
              //gaPlugin.init(successHandler, errorHandler, "UA-63329886-1", 10);

              //_gaq('send', 'pageview', {'page': '/itMLECordova'});

              //ga('create', ua, {'storage': 'none','clientId': udid});
              //ga('set','checkProtocolTask',null);
              //ga('set','checkStorageTask',null);
              //ga('send', 'pageview', {'page': '/itWorks!!!!'});
              self.srvAnalytics.init();
              alert('done');

              //
              resolved = true;
              d.resolve(window.cordova);
          });

          //document.addEventListener('deviceready', function() {
          //  resolved = true;
          //  d.resolve(window.cordova);
          //});



          // Check to make sure we didn't miss the
          // event (just in case)
          setTimeout(function() {
            if (!resolved) {
              if (window.cordova) d.resolve(window.cordova);
            }
          }, 3000);

  }



  Service.prototype.getUDID = function () {
    var UDID = 'UID-TEST';
    //if (window.cordova && window.device) UDID = window.device.uuid;
    if (window.device) UDID = window.device.uuid;

    return UDID;
  };

  Service.prototype.initAlreadyDone = function () {
    return true;
  };




  return Service;
})();
