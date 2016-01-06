from rest_framework import permissions

class UserIsEmployeeOrHost(permissions.BasePermission):
    """ Ensures that the current user is either the employee or host of
    the check-in.

    Any view that uses this permission needs to implement
    the get_checkin() method that should return the employee
    that the request is related to.
    """
    def has_permission(self, request, view):
        checkin = view.get_checkin()
        employee = checkin.employee
        host = checkin.host

        return request.user.employee == host or request.user.employee == employee