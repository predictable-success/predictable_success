;(function() {
"use strict";

angular
    .module('profile', ['ngRoute', 'ui-notification']);

angular
    .module('profile')
    .controller('ProfileController', ProfileController);

function ProfileController(Employee, analytics, $location, $rootScope, $routeParams, $scope) {
    /* Since this page can be the root for some users let's make sure we capture the correct page */
    var location_url = $location.url().indexOf('/profile') < 0 ? '/profile' : $location.url();
    analytics.trackPage($scope, $location.absUrl(), location_url);
    var vm = this;
    vm.employee = null;

    Employee.get(
        {id: $routeParams.employeeId},
        function (data) {
            vm.employee = data;
            vm.employee.hire_date = $rootScope.parseDate(vm.employee.hire_date);
        }
    );
}
ProfileController.$inject = ["Employee", "analytics", "$location", "$rootScope", "$routeParams", "$scope"];
}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2ZpbGUubW9kdWxlLmpzIiwicHJvZmlsZS5jb250cm9sbGVyLmpzIiwicHJvZmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLENBQUEsV0FBQTtBQUNBOztBQ0RBO0tBQ0EsT0FBQSxXQUFBLENBQUEsV0FBQTs7QUFFQTtLQUNBLE9BQUE7S0FDQSxXQUFBLHFCQUFBOztBQUVBLFNBQUEsa0JBQUEsVUFBQSxXQUFBLFdBQUEsWUFBQSxjQUFBLFFBQUE7O0lBRUEsSUFBQSxlQUFBLFVBQUEsTUFBQSxRQUFBLGNBQUEsSUFBQSxhQUFBLFVBQUE7SUFDQSxVQUFBLFVBQUEsUUFBQSxVQUFBLFVBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxHQUFBLFdBQUE7O0lBRUEsU0FBQTtRQUNBLENBQUEsSUFBQSxhQUFBO1FBQ0EsVUFBQSxNQUFBO1lBQ0EsR0FBQSxXQUFBO1lBQ0EsR0FBQSxTQUFBLFlBQUEsV0FBQSxVQUFBLEdBQUEsU0FBQTs7Ozs7O0FDUUEiLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcbiAgICAubW9kdWxlKCdwcm9maWxlJywgWyduZ1JvdXRlJywgJ3VpLW5vdGlmaWNhdGlvbiddKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCdwcm9maWxlJylcbiAgICAuY29udHJvbGxlcignUHJvZmlsZUNvbnRyb2xsZXInLCBQcm9maWxlQ29udHJvbGxlcik7XG5cbmZ1bmN0aW9uIFByb2ZpbGVDb250cm9sbGVyKEVtcGxveWVlLCBhbmFseXRpY3MsICRsb2NhdGlvbiwgJHJvb3RTY29wZSwgJHJvdXRlUGFyYW1zLCAkc2NvcGUpIHtcbiAgICAvKiBTaW5jZSB0aGlzIHBhZ2UgY2FuIGJlIHRoZSByb290IGZvciBzb21lIHVzZXJzIGxldCdzIG1ha2Ugc3VyZSB3ZSBjYXB0dXJlIHRoZSBjb3JyZWN0IHBhZ2UgKi9cbiAgICB2YXIgbG9jYXRpb25fdXJsID0gJGxvY2F0aW9uLnVybCgpLmluZGV4T2YoJy9wcm9maWxlJykgPCAwID8gJy9wcm9maWxlJyA6ICRsb2NhdGlvbi51cmwoKTtcbiAgICBhbmFseXRpY3MudHJhY2tQYWdlKCRzY29wZSwgJGxvY2F0aW9uLmFic1VybCgpLCBsb2NhdGlvbl91cmwpO1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0uZW1wbG95ZWUgPSBudWxsO1xuXG4gICAgRW1wbG95ZWUuZ2V0KFxuICAgICAgICB7aWQ6ICRyb3V0ZVBhcmFtcy5lbXBsb3llZUlkfSxcbiAgICAgICAgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZtLmVtcGxveWVlID0gZGF0YTtcbiAgICAgICAgICAgIHZtLmVtcGxveWVlLmhpcmVfZGF0ZSA9ICRyb290U2NvcGUucGFyc2VEYXRlKHZtLmVtcGxveWVlLmhpcmVfZGF0ZSk7XG4gICAgICAgIH1cbiAgICApO1xufSIsIjsoZnVuY3Rpb24oKSB7XG5cInVzZSBzdHJpY3RcIjtcblxuYW5ndWxhclxuICAgIC5tb2R1bGUoJ3Byb2ZpbGUnLCBbJ25nUm91dGUnLCAndWktbm90aWZpY2F0aW9uJ10pO1xuXG5hbmd1bGFyXG4gICAgLm1vZHVsZSgncHJvZmlsZScpXG4gICAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDb250cm9sbGVyJywgUHJvZmlsZUNvbnRyb2xsZXIpO1xuXG5mdW5jdGlvbiBQcm9maWxlQ29udHJvbGxlcihFbXBsb3llZSwgYW5hbHl0aWNzLCAkbG9jYXRpb24sICRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgJHNjb3BlKSB7XG4gICAgLyogU2luY2UgdGhpcyBwYWdlIGNhbiBiZSB0aGUgcm9vdCBmb3Igc29tZSB1c2VycyBsZXQncyBtYWtlIHN1cmUgd2UgY2FwdHVyZSB0aGUgY29ycmVjdCBwYWdlICovXG4gICAgdmFyIGxvY2F0aW9uX3VybCA9ICRsb2NhdGlvbi51cmwoKS5pbmRleE9mKCcvcHJvZmlsZScpIDwgMCA/ICcvcHJvZmlsZScgOiAkbG9jYXRpb24udXJsKCk7XG4gICAgYW5hbHl0aWNzLnRyYWNrUGFnZSgkc2NvcGUsICRsb2NhdGlvbi5hYnNVcmwoKSwgbG9jYXRpb25fdXJsKTtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIHZtLmVtcGxveWVlID0gbnVsbDtcblxuICAgIEVtcGxveWVlLmdldChcbiAgICAgICAge2lkOiAkcm91dGVQYXJhbXMuZW1wbG95ZWVJZH0sXG4gICAgICAgIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2bS5lbXBsb3llZSA9IGRhdGE7XG4gICAgICAgICAgICB2bS5lbXBsb3llZS5oaXJlX2RhdGUgPSAkcm9vdFNjb3BlLnBhcnNlRGF0ZSh2bS5lbXBsb3llZS5oaXJlX2RhdGUpO1xuICAgICAgICB9XG4gICAgKTtcbn1cbn0oKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
