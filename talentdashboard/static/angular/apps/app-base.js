var app = angular.module('tdb', [
        'tdb.services', 'tdb.controllers', 'tdb.directives', 'tdb.filters',
        'tdb.activity.controllers', 'tdb.activity.services',
        'tdb.checkins.controllers', 'tdb.checkins.services',
        'tdb.comments.controllers', 'tdb.comments.services',
        'tdb.comp.services',
        'tdb.customers.services',
        'tdb.engagement.controllers', 'tdb.engagement.services',
        'tdb.import.controllers', 'tdb.import.services',
        'tdb.insights.controllers', 'tdb.insights.services',
        'tdb.kpi.services',
        'tdb.org.controllers', 'tdb.org.services',
        'tdb.preferences.services',
        'tdb.profile.controllers', 'tdb.profile.services',
        'tdb.pvp.controllers', 'tdb.pvp.services',
        'tdb.search.controllers', 'tdb.search.services',
        'tdb.tasks.controllers', 'tdb.tasks.services',
        'angular.filter',
        'angular-carousel', 'analytics', 'ui.bootstrap', 'ngCsv','ngImgCrop', 'ngRoute','ui-notification', 'ngMessages', 'readMore', 'ngCookies'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: '/static/angular/partials/profile.html', controller: 'ProfileCtrl', resolve: {authorizeRoute: authorizeRoute}}).
            when('/engagement-survey/:employeeId/:surveyId', {templateUrl: '/static/angular/partials/engagement-survey.html', controller: 'EngagementSurveyCtrl'}).
            when('/my-profile', {templateUrl: '/static/angular/partials/profile.html', controller: 'ProfileCtrl', resolve: {authorizeRoute: authorizeRoute}}).
            otherwise({redirectTo: '/'});
    }])
    .run(['$rootScope', 'User', 'TalentCategories', 'Customers', 'privacyMode', function($rootScope, User, TalentCategories, Customers, privacyMode) {
        User.get(function(data) {
            $rootScope.currentUser = data;
        });
        Customers.get(function(data) {
            $rootScope.customer = data;
        });
        $rootScope.talentCategories = TalentCategories.categories;

        $rootScope.$on('$routeChangeSuccess', function () {
            privacyMode($rootScope);
        });

    }]);

app.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
});

var authorizeRoute = function($http) {
    return $http.get("/api/v1/user-status/");
}