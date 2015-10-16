(function() {
angular
    .module('feedback')
    .factory('FeedbackAPI', FeedbackAPI);

FeedbackAPI.$inject = ['$http', '$log', 'FeedbackRequestResource'];

function FeedbackAPI($http, $log, FeedbackRequestResource) {
    return {
        getFeedbackRequest: getFeedbackRequest,
        sendFeedbackRequests: sendFeedbackRequests,
        getFeedbackRequests: getFeedbackRequests,
        getPotentialReviewers: getPotentialReviewers,
        getEmployees: getEmployees,
        respondToFeedbackRequest: respondToFeedbackRequest,
        giveUnsolicitedFeedback: giveUnsolicitedFeedback,
        getFeedbackProgressReportForEmployee: getFeedbackProgressReportForEmployee
    };

    function sendFeedbackRequests(reviewers, message) {
        var requests = [];

        for(var i=0; i < reviewers.length; i++) {
            requests.push({reviewer: reviewers[i].id, message: message});
        }

        return FeedbackRequestResource.sendFeedbackRequests(requests, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('sendFeedbackRequests failed');
        }
    }

    function getFeedbackRequest(id) {
        return FeedbackRequestResource.get({id: id}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getFeedbackRequest failed');
        }
    }

    function getFeedbackRequests() {
        return FeedbackRequestResource.getFeedbackRequests(null, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getFeedbackRequests failed');
        }
    }

    function getPotentialReviewers() {
        return $http.get('/api/v1/feedback/potential-reviewers/')
            .then(success)
            .catch(fail);

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('getPotentialReviewers failed');
        }
    }

    function getFeedbackProgressReportForEmployee(employee_id) {
        var url = '/api/v1/feedback/progress-reports/' + employee_id + '/';
        return $http.get(url)
            .then(success)
            .catch(fail);

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('getFeedbackProgressReportForEmployee failed');
        }
    }
}
})();