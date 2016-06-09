angular
    .module('profile')
    .controller('ProfileController', ProfileController);

function ProfileController(Employee, EmployeeSearch, Profile, SalaryReport, TalentReport, ThirdParties, analytics, $location, $modal, $rootScope, $routeParams, $scope) {
    /* Since this page can be the root for some users let's make sure we capture the correct page */
    var location_url = $location.url().indexOf('/profile') < 0 ? '/profile' : $location.url();
    analytics.trackPage($scope, $location.absUrl(), location_url);
    var vm = this;
    vm.employee = null;
    vm.moreInfoCollapse = true;
    vm.teamMembers = [];
    vm.coachees = [];
    vm.filterCommentsByType = filterCommentsByType;
    vm.filterCommentsByView = filterCommentsByView;
    vm.filterCommentsByThirdParty = filterCommentsByThirdParty;
    vm.requestFeedback = requestFeedback;
    vm.requestCheckIn = requestCheckIn;
    vm.filter = {type: null, view: null, third_party: null, employee: null};
    vm.third_parties = [];

    activate();

    function activate() {
        getEmployee();
        getThirdParties();
    };

    function getEmployee() {
        var id;
        if ($routeParams.id) {
            Employee.get(
                {id: $routeParams.id},
                function (data) {
                    vm.employee = data;
                    vm.employee.hire_date = $rootScope.parseDate(vm.employee.hire_date);
                    vm.filter.view = 'employee';
                    vm.filter.employee = vm.employee;
                }
            );
        } else {
            Profile.get(
                null,
                function (data) {
                    vm.employee = data;
                    vm.employee.hire_date = $rootScope.parseDate(vm.employee.hire_date);
                    vm.filter.view = 'me';
                    vm.filter.employee = vm.employee;
                }
            );
        }

    }

    function getThirdParties() {
        ThirdParties.query(
            null,
            function (data) {
                vm.third_parties = data;
            }
        )
    }

    function getTeamSummary() {
        vm.teamMembers = EmployeeSearch.leadEmployees({id: $routeParams.id});
        $scope.talentReport = TalentReport.leadEmployees({id: $routeParams.id});
        $scope.salaryReport = SalaryReport.leadEmployees({id: $routeParams.id});
    }

    function getCoachSummary() {
        vm.coachees = EmployeeSearch.coachEmployees({id: $routeParams.id});
        $scope.talentReport = TalentReport.coachEmployees({id: $routeParams.id});
    }

    function filterCommentsByType(type) {
        vm.filter.type = type;
        vm.filter.third_party = null;
        filterComments();
    }

    function filterCommentsByView(view) {
        switch(view) {
            case 'coach':
                getCoachSummary();
                break;
            case 'leader':
                getTeamSummary();
                break;
        }
        vm.filter.view = view;
        filterComments();
    }

    function filterCommentsByThirdParty(third_party) {
        vm.filter.type = 'thirdpartyevent';
        vm.filter.third_party = third_party;
        filterComments();

    }

    function filterComments() {
        $scope.$broadcast('filterComments', vm.filter);
    }

    function requestCheckIn() {
        var modalInstance = $modal.open({
            animation: true,
            windowClass: 'xx-dialog fade zoom',
            backdrop: 'static',
            templateUrl: '/static/angular/checkins/partials/_modals/request-checkin.html',
            controller: 'RequestCheckInController as request',
            resolve: {

            }
        });
        modalInstance.result.then(
            function (request) {
                console.log(request);
                vm.myRequests.push(request);
            }
        );
    }

    function requestFeedback() {
        var modalInstance = $modal.open({
            animation: true,
            windowClass: 'xx-dialog fade zoom',
            backdrop: 'static',
            templateUrl: '/static/angular/feedback/partials/_modals/request-feedback.html',
            controller: 'RequestFeedbackController as request',
            resolve: {

            }
        });
        modalInstance.result.then(
            function (sentFeedbackRequests) {
                getMyRecentlySentRequests();
            }
        );
    }
}