'use strict';

describe('srvConfig', function () {

    var log = null, gettextCatalog = null;

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

      inject(function($injector) {
        log = $injector.get('$log');
        gettextCatalog = $injector.get('gettextCatalog');
      });

    });

    afterEach(function () {
    });


    it('should be correctly initialized', function () {

        var srv = new SrvConfig(log, gettextCatalog);

        expect(srv.isLoggedIn()).toBe(false);
        //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
        //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

    });


    it('should return correct getter', function () {

      var srv = new SrvConfig(log, gettextCatalog);

      expect(srv.isLoggedIn()).toBe(false);
      srv.setLoggedIn(true);
      expect(srv.isLoggedIn()).toBe(true);

      expect(srv.isAppFirstInitDone()).toBe(false);
      srv.setConfigAppFirstInitDone(true);
      expect(srv.isAppFirstInitDone()).toBe(true);


      expect(srv.getConfigLang()).toBe('en');
      srv.setConfigLang('my_test_lang');
      expect(srv.getConfigLang()).toBe('my_test_lang');

    });

});
