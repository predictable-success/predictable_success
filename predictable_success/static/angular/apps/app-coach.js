app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {templateUrl: '/static/angular/profile/partials/profile.html', controller: 'ProfileController as profile', resolve: {authorizeRoute: authorizeRoute}}).
      when('/employees/my-coachees', {templateUrl: '/static/angular/partials/employee-list.html', controller: 'EmployeeSearchCtrl', resolve: {authorizeRoute: authorizeRoute, view: function() {return 'my-coachees';}}}).
      when('/employees/:id', {templateUrl: '/static/angular/partials/employee-detail.html', controller: 'EmployeeDetailCtrl', resolve: {authorizeRoute: authorizeRoute}}).
      when('/devzones/meetings/:meetingId', {templateUrl: '/static/angular/devzones/partials/conversations.html', controller: 'MeetingController as meeting', resolve: {authorizeRoute: authorizeRoute}}).
      when('/my-coachees', {templateUrl: '/static/angular/partials/coach-overview.html', controller: 'CoachDetailCtrl', resolve: {authorizeRoute: authorizeRoute}}).
      when('/tasks', {templateUrl: '/static/angular/partials/tasks.html', controller: 'TasksCtrl', resolve: {authorizeRoute: authorizeRoute}}).
      when('/checkin/:id', {templateUrl: '/static/angular/checkins/partials/checkin.html', controller: 'CheckInController as viewCheckin', resolve: {authorizeRoute: authorizeRoute}}).
      when('/checkin', {templateUrl: '/static/angular/checkins/partials/checkin.html', controller: 'CheckInController as viewCheckin', resolve: {authorizeRoute: authorizeRoute}}).
      otherwise({redirectTo: '/'});
}]);