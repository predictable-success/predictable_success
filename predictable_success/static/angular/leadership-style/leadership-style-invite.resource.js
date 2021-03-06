angular
    .module('leadership-style')
    .factory('LeadershipStyleInviteResource', LeadershipStyleInviteResource);

function LeadershipStyleInviteResource($resource) {
    var actions = {
        'sendInvites': {
            method: 'POST',
            url: '/api/v1/leadership-style/teams/:id/invite/'
        },
        'remind': {
            method: 'POST',
            url: '/api/v1/leadership-style/quiz/:id/remind/'
        },
        'remindMany': {
            method: 'POST',
            url: '/api/v1/leadership-style/quiz/remind/',
            isArray: true
        }
    };
    return $resource('/api/v1/leadership-style/teams/:id/', null, actions);
}
