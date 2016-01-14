angular
    .module('checkins')
    .factory('CheckInsService', CheckInsService);

function CheckInsService($http, $log, CheckInsResource) {
    return {
        getCheckIn: getCheckIn,
        getMyCheckIns: getMyCheckIns,
        getCheckInsIveConducted: getCheckInsIveConducted,
        getTypes: getTypes,
        save: save,
        update: update,
        destroy: destroy,
        send: send,
        share: share
    };

    function getCheckIn(checkinId) {
        return CheckInsResource.get({id: checkinId}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getCheckIn failed');
        }
    }

    function getMyCheckIns() {
        return CheckInsResource.getMyCheckIns({id: 'my'}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getMyCheckIns failed');
        }
    }

    function getCheckInsIveConducted() {
        return CheckInsResource.getMyCheckIns({id: 'hosted'}, success, fail).$promise;

        function success(response) {
            return response;
        }

        function fail(response) {
            $log.error('getMyCheckIns failed');
        }
    }


    function getTypes() {
        var url = '/api/v1/checkins/checkin-types/';
        return $http.get(url)
            .then(success)
            .catch(fail);

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('getTypes failed');
        }
    }

    function save(checkin) {
        console.log(checkin);
        return CheckInsResource.save(checkin, success, fail).$promise;

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('save failed');
        }
    }

    function update(checkin) {
        return CheckInsResource.update({id: checkin.id}, checkin, success, fail).$promise;

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('update failed');
        }
    }

    function destroy(checkin) {
        return CheckInsResource.delete(checkin, success, fail).$promise;

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('delete failed');
        }
    }

    function send(checkin) {
        return CheckInsResource.send({id: checkin.id}, checkin, success, fail).$promise;

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('send failed');
        }
    }


    function share(checkin) {
        return CheckInsResource.share({id: checkin.id}, checkin, success, fail).$promise;

        function success(response) {
            return response.data;
        }

        function fail(response) {
            $log.error('share failed');
        }
    }


}