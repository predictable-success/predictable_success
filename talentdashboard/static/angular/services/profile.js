/**
 * Created by natem on 9/10/15.
 */
angular.module('tdb.services.profile', ['ngResource'])

    .factory('Profile', ['$resource', '$http', function ($resource, $http) {
        var resource = $resource('api/v1/profile/');
        return resource;
    }])