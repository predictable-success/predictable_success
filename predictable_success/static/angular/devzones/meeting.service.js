angular
    .module('devzones')
    .factory('MeetingService', MeetingService);

function MeetingService($http, $log, MeetingResource) {
    return {
        activate: activate,
        create: create,
        update: update,
        get: get,
        getMyMeetings: getMyMeetings
    }

    function activate(meeting) {
        return MeetingResource.activate({id: meeting.id}, null, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('activate Meeting failed');
        }
    }

    function create(meeting) {
        return MeetingResource.create(meeting, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('create Meeting failed');
        }
    }

    function update(meeting) {
        return MeetingResource.update({id: meeting.id}, meeting, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('update Meeting failed');
        }
    }

    function get(meetingId) {
        return MeetingResource.get({id: meetingId}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('get failed');
        }
    }

    function getMyMeetings() {
        return MeetingResource.getMyMeetings(null, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getMyMeetings failed');
        }
    }
}