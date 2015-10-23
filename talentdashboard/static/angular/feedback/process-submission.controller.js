    angular
        .module('feedback')
        .controller('ProcessSubmissionController', ProcessSubmissionController);

    function ProcessSubmissionController($routeParams, $location, $window, Notification, FeedbackSubmissionService, FeedbackDigestService) {
        var vm = this;
        vm.submissionId = $routeParams.id;
        vm.submission = null;
        vm.form = null;
        vm.addToDigest = addToDigest;
        vm.save = save;
        vm.close = close;
        activate();

        function activate() {
            getSubmission();
        }

        function getSubmission() {
            return FeedbackSubmissionService.getFeedbackSubmission(vm.submissionId)
                .then(function (data) {
                    vm.submission = data;
                    return vm.submission;
                });
        }

        function addToDigest() {
            if(vm.form.$dirty) {
                if($window.confirm("You have unsaved changes. Would you like to save your changes before closing?")) {
                    save();
                }
            }
            FeedbackDigestService.addSubmissionToCurrentDigest(vm.submission)
                .then(function() {
                    Notification.success("The feedback has been added to the digest.");
                    close();
            });
        }

        function save() {
            FeedbackSubmissionService.updateCoachSummary(vm.submission)
                .then(function() {
                    vm.form.$setPristine();
                    Notification.success("Your changes were saved.");
                });
        }

        function close() {
            if(vm.form.$dirty) {
                if($window.confirm("You have unsaved changes. Would you like to save your changes before closing?")) {
                    save();
                }
            }
            $location.path('/feedback/' + vm.submission.subject.id + '/worksheet');
        }
    }
