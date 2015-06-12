angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en_US', {"Big Jump !":"Let’s go","Compute":"Go","LoginSignin":"Welcooome","LoginWelcome":"Welcome to a housework fair share"});
    gettextCatalog.setStrings('fr_FR', {"<i class=\"glyphicon glyphicon-cog\"></i> Les amoureux.":"<i class=\"glyphicon glyphicon-cog\"></i> Les Zamoureux.","Big Jump !":"On y va !"});
/* jshint +W100 */
}]);