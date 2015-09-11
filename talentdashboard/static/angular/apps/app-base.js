var app = angular.module('tdb', [
        'tdb.services', 'tdb.controllers', 'tdb.directives', 'tdb.filters',
        'tdb.activity.services', 'tdb.activity.controllers',
        'tdb.checkins.services', 'tdb.checkins.controllers',
        'tdb.comments.services', 'tdb.comments.controllers',
        'tdb.employees.controllers',
        'tdb.engagement.services',
        'tdb.preferences.services',
        'tdb.profile.controllers', 'tdb.profile.services',
        'tdb.reports.controllers',
        'tdb.search.controllers', 'tdb.search.services',
        'tdb.tasks.services', 'tdb.tasks.controllers',
        'angular.filter',
        'angular-carousel', 'analytics', 'ui.bootstrap', 'ngCsv','ngImgCrop', 'ngRoute','ui-notification', 'ngMessages', 'readMore'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: '/static/angular/partials/profile.html', controller: 'ProfileCtrl', resolve: {authorizeRoute: authorizeRoute}}).
            when('/engagement-survey/:employeeId/:surveyId', {templateUrl: '/static/angular/partials/engagement-survey.html', controller: 'EngagementSurveyCtrl'}).
            when('/my-profile', {templateUrl: '/static/angular/partials/profile.html', controller: 'ProfileCtrl', resolve: {authorizeRoute: authorizeRoute}}).
            otherwise({redirectTo: '/'});
    }])
    .run(['$rootScope', 'User', 'TalentCategories', 'Customers', function($rootScope, User, TalentCategories, Customers) {
        User.get(function(data) {
            $rootScope.currentUser = data;
        });
        Customers.get(function(data) {
            $rootScope.customer = data;
        });
        $rootScope.talentCategories = TalentCategories.categories;
    }]);

app.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
});

var authorizeRoute = function($http) {
    return $http.get("/api/v1/user-status/");
}