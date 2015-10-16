(function() {
    angular
        .module('feedback')
        .controller('ProcessSubmissionController', ProcessSubmissionController);

    ProcessSubmissionController.$inject = ['FeedbackSubmissionService'];

    function ProcessSubmissionController($routeParams, FeedbackSubmissionService) {
        var vm = this;
        vm.submissionId = $routeParams.id;
        vm.submission = null;
        vm.addToDigest = addToDigest;
        vm.save = save;
        vm.cancel = cancel;
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
            return save()
                .then(function() {
                    return FeedbackSubmissionService.addSubmissionToDigest(vm.submission);
                });
        }

        function save() {
            return FeedbackSubmissionService.save(vm.submission);
        }

        function cancel() {

        }
    }
})();