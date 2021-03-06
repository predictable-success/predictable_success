angular.module('tdb.activity.services', ['ngResource'])

    .factory('Event', ['$resource', function($resource) {
        var actions = {
            'getCheckInEvents': {
                method: 'GET',
                isArray: true,
                url: '/api/v1/events/checkins/:id'
            },
            'getEventForComment': {
                method: 'GET',
                url: '/api/v1/events/sources/comments/:id/'
            }
        };
        Event = $resource('/api/v1/events/:path/:id/', null, actions);
        Event.getEmployeeEvents = function(id, page, type, third_party, exclude_third_party_events, success, failure) { return this.get({ path: 'employees', id: id, page: page, type: type, exclude_third_party_events: exclude_third_party_events, third_party: third_party}, success, failure); };
        Event.getTeamEvents = function(id, page, type, third_party, exclude_third_party_events, success, failure) { return this.get({ path: 'teams', id: id, page: page, type: type, exclude_third_party_events: exclude_third_party_events, third_party: third_party}, success, failure); };
        Event.getLeadEvents = function(id, page, type, third_party, exclude_third_party_events, success, failure) { return this.get({ path: 'leads', id: id, page: page, type: type, exclude_third_party_events: exclude_third_party_events, third_party: third_party}, success, failure); };
        Event.getCoachEvents = function(id, page, type, third_party, exclude_third_party_events, success, failure) { return this.get({ path: 'coaches', id: id, page: page, type: type, exclude_third_party_events: exclude_third_party_events, third_party: third_party}, success, failure); };
        return Event;
    }])

    .factory('ActivityReport', ['$resource', '$http', function($resource, $http) {
        var res = $resource('/api/v1/reports/activity');
        return res;
    }])

    .factory('ThirdParties', ['$resource', '$http', function($resource, $http) {
        var res = $resource('/api/v1/events/third_parties');
        return res;
    }])
;