angular
    .module('qualities')
    .factory('PerceivedQualityService', PerceivedQualityService);

function PerceivedQualityService($http, $log, PerceivedQualityResource) {
    return {
        createPerceivedQualities: createPerceivedQualities,
        getMyQualities: getMyQualities
    };

    function createPerceivedQualities(qualities, subject, cluster, perception_request_id) {
        var requests = [];

        for (var i = 0; i < qualities.length; i++) {
            requests.push({quality: qualities[i].id, subject: subject.id, cluster: cluster.id, perception_request: perception_request_id});
        }
        return PerceivedQualityResource.createPerceivedQualities(requests, success, fail).$promise;

        function success(sentFeedbackRequests) {
            return sentFeedbackRequests;
        }

        function fail(response) {
            $log.error('createPerceivedQualities failed');
        }
    }

    function getMyQualities() {
        return PerceivedQualityResource.get({id: 'my'}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getMyQualities failed');
        }
    }
}