
angular.module('srvAuth.token', [])

.run(function (api) {
  api.init();
})

.factory('authorization', function ($http, WS_URL_LOCAL, WS_URL_ONLINE) {
  //var url = config.analytics.url;

  return {
      login: function (credentials) {
          var url  = WS_URL_LOCAL + '/auth/token';

          return $http.post(url, credentials);
      },
      user: function (credentials) {
          var url  = WS_URL_LOCAL + '/user/mine';

          return $http.get(url, credentials);
      }
  };
})

.factory('httpInterceptor', function httpInterceptor ($q, $window, $location) {
  return function (promise) {
      var success = function (response) {
          return response;
      };

      var error = function (response) {
          if (response.status === 401) {
              $location.url('/login');
          }

          return $q.reject(response);
      };

      return promise.then(success, error);
  };
})

.factory('api', function ($http, $cookies) {
  return {
      init: function (token) {
          $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
          $http.defaults.headers.common['X-Auth-Token'] = token || $cookies.token;
          $http.defaults.headers.common['Authorization'] = token || $cookies.token;

      }
  };
})
