from rest_framework import permissions


class UserIsAssessor(permissions.BasePermission):
    """ Ensures that the current user is the assessor
    of the EmployeeZone.

    Any view that uses this permission needs to implement
    the get_leadership_style() method that should return a EmployeeLeadershipStyle
    object.
    """
    def has_permission(self, request, view):
        leadership_style = view.get_leadership_style()
        return request.user.employee.id == leadership_style.assessor.id


class UserIsAssessorOrHasAllAccess(permissions.BasePermission):
    """ Ensures that the current user is the assessor
    of the EmployeeZone or has all access.

    Any view that uses this permission needs to implement
    the get_leadership_style() method that should return a EmployeeLeadershipStyle
    object.
    """
    def has_permission(self, request, view):
        leadership_style = view.get_leadership_style()
        if request.user.has_perm('org.view_employees') and leadership_style.assessor.id != leadership_style.employee.id:
            return True
        return request.user.employee.id == leadership_style.assessor.id