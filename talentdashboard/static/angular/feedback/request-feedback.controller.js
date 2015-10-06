(function() {
    angular
        .module('feedback')
        .controller('RequestFeedbackController', RequestFeedbackController);

    RequestFeedbackController.$inject = ['FeedbackAPI', 'CoachService', 'Notification', '$location', '$modal'];

    function RequestFeedbackController(FeedbackAPI, CoachService, Notification, $location, $modal) {
        var vm = this;
        // Properties
        vm.potentialReviewers = [];
        vm.selectedReviewers = [];
        vm.message = '';
        vm.currentCoach = null;
        // Methods
        vm.sendFeedbackRequests = sendFeedbackRequests;
        vm.changeCoach = changeCoach;

        activate();

        function activate() {
            getPotentialReviewers();
            getCurrentCoach();
        }

        function getPotentialReviewers() {
            return FeedbackAPI.getPotentialReviewers()
                .then(function (data) {
                    vm.potentialReviewers = data;
                    return vm.potentialReviewers;
                });
        }

        function sendFeedbackRequests() {
            FeedbackAPI.sendFeedbackRequests(vm.selectedReviewers, vm.message)
                .then(function() {
                    $location.path("/feedback");
                    Notification.success("Success!");
                });
        }

        function getCurrentCoach() {
            CoachService.getCurrentCoach()
                .then(function(data) {
                    vm.currentCoach = data;
                    return vm.currentCoach;
                });
        }

        function changeCoach() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/static/angular/partials/_modals/change-coach.html',
                controller: 'ChangeCoachController',
                controllerAs: 'changeCoach',
                resolve: {
                    currentCoach: function () {
                        return vm.currentCoach;
                    }
                }
            });
            modalInstance.result.then(
                function (newCoach) {
                    vm.currentCoach = newCoach;
                }
            );
        }
    }
})();