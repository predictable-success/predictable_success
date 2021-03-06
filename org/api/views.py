from dateutil import parser
from django.contrib.auth.views import password_reset_confirm, login
from django.core.urlresolvers import reverse
from django.http import Http404
from django.utils.http import urlsafe_base64_decode
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from json import dumps
from predictable_success.views.views import add_salary_to_employee
from .serializers import *
from .permissions import *
from ..models import *


@api_view(['GET'])
def coachee_list(request):
    employee = Employee.objects.get(user__id=request.user.id)
    employees = Employee.objects.get_current_employees(show_hidden=True)
    employees = employees.filter(coach__id=employee.id)
    serializer = MinimalEmployeeSerializer(employees, many=True, context={'request': request})
    return Response(serializer.data)


class CoachList(ListAPIView):
    serializer_class = SanitizedEmployeeSerializer
    queryset = Employee.objects.get_current_employees(show_hidden=True)


@permission_classes((IsAuthenticated,))
class EmployeeDetail(APIView):
    def get(self, request, pk, format=None):
        try:
            employee = Employee.objects.get(id=pk)
            if not employee.is_viewable_by_user(request.user):
                raise PermissionDenied
            if request.user.employee == employee:
                serializer = SanitizedEmployeeWithRelationshpsSerializer(employee,context={'request': request})
            else:
                serializer = EmployeeSerializer(employee,context={'request': request})
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(None)

    def post(self, request, pk, format=None):
        employee = None
        if 'id' in request.DATA and request.DATA['id'] != 0:
            id = request.DATA['id']
            employee = Employee.objects.get(id=id)
        else:
            serializer = CreateEmployeeSerializer(data = request.DATA, context={'request':request})
            if serializer.is_valid():
                employee = serializer.save()
            else:
                print(serializer.errors)
                return Response(serializer.errors, status=400)
        if 'hire_date' in request.DATA and request.DATA['hire_date'] is not None:
            date_string = request.DATA['hire_date']
            request.DATA['hire_date'] = parser.parse(date_string).date()
        if 'departure_date' in request.DATA and request.DATA['departure_date'] is not None:
            date_string = request.DATA['departure_date']
            request.DATA['departure_date'] = parser.parse(date_string).date()
        if 'leader_id' in request.DATA and request.DATA['leader_id'] is not None:
            employee.current_leader = Employee.objects.get(id=request.DATA['leader_id'])
            employee.save()
        add_salary_to_employee(employee, request.DATA)
        serializer = EmployeeSerializer(employee, context={'request':request})
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        employee = Employee.objects.get(id=pk)

        if 'hire_date' in request.DATA and request.DATA['hire_date'] is not None:
            date_string = request.DATA['hire_date']
            request.DATA['hire_date'] = parser.parse(date_string).date()
        if 'departure_date' in request.DATA and request.DATA['departure_date'] is not None:
            date_string = request.DATA['departure_date']
            request.DATA['departure_date'] = parser.parse(date_string).date()

        # by name (for upload)
        if 'team_leader' in request.DATA:
            leader = Employee.objects.get(id=request.DATA['team_leader']['id'])
            employee.current_leader = leader
            employee.save()
            serializer = EmployeeSerializer(employee, context={'request':request})
            return Response(serializer.data)

        # by id
        if 'leader_id' in request.DATA:
            if request.DATA['leader_id']:
                leader = Employee.objects.get(id=request.DATA['leader_id'])
                employee.current_leader = leader
                employee.save()

        serializer = EditEmployeeSerializer(employee, request.DATA, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            emp_serializer = EmployeeSerializer(employee, context={'request':request})
            return Response(emp_serializer.data)
        else:
            return Response(serializer.errors, status=400)


class EmployeeList(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        group_name = request.QUERY_PARAMS.get('group_name', None)
        show_hidden = request.QUERY_PARAMS.get('show_hidden', False)
        view_all = request.QUERY_PARAMS.get('view_all', False)
        full_name = request.QUERY_PARAMS.get('full_name', None)

        if not view_all:
            employees = Employee.objects.get_current_employees_employee_has_access_to(request.user.employee)
        else:
            employees = Employee.objects.get_current_employees(show_hidden=show_hidden)

        if group_name:
            employees = Employee.objects.get_current_employees_by_group_name(name=group_name,show_hidden=show_hidden)

        if full_name:
            employees = Employee.objects.filter(full_name=full_name)
            if employees:
                employee = employees[0]
                serializer = SanitizedEmployeeSerializer(employee, context={'request':request})
                return Response(serializer.data)
            else:
                return Response({'leader': 'field error'}, status=400)
        serializer = SanitizedEmployeeSerializer(employees, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, format=None):
        if 'hire_date' in request.DATA and request.DATA['hire_date'] is not None:
            date_string = request.DATA['hire_date']
            request.DATA['hire_date'] = parser.parse(date_string).date()

        serializer = CreateEmployeeSerializer(data=request.DATA, context={'request': request})
        if serializer.is_valid():
            employee = serializer.save()
            add_salary_to_employee(employee, request.DATA)
            serializer = EmployeeSerializer(employee, context={'request':request})
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    def put(self, request, pk, format=None):
        employee = Employee.objects.get(id=pk)

        if employee is not None:
            employee.first_name = request.DATA["_first_name"]
            employee.last_name = request.DATA["_last_name"]
            employee.email = request.DATA["_email"]
            if request.DATA["_hire_date"] is not None:
                employee.hire_date = parser.parse(request.DATA["_hire_date"])
            else:
                employee.hire_date = None
            if request.DATA["_departure_date"] is not None:
                employee.departure_date = parser.parse(request.DATA["_departure_date"])
            else:
                employee.departure_date = None
            if request.DATA["_team_id"] is not None:
                team_id = request.DATA["_team_id"]
                employee.team = Team.objects.get(id=team_id)
            else:
                employee.team = None
            if request.DATA["_coach_id"] is not None:
                coach_id = request.DATA["_coach_id"]
                employee.coach = Employee.objects.get(id=coach_id)
            else:
                employee.coach = None
            if request.DATA["_leader_id"] is not None:
                leader_id = request.DATA["_leader_id"]
                employee.current_leader = Employee.objects.get(id=leader_id)
            else:
                employee.current_leader = None
            employee.save()
            serializer = EmployeeSerializer(employee, many=False, context={'request': request})
            return Response(serializer.data)
        return Response(None, status=status.HTTP_404_NOT_FOUND)


class EmployeeNames(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        employees = Employee.objects.get_current_employees()
        employees = employees.values_list('full_name',flat=True)
        employees_list = list(employees)
        return HttpResponse(dumps(employees_list), content_type='application/json')


class CurrentCoach(RetrieveAPIView):
    serializer_class = SanitizedEmployeeSerializer

    def get_object(self):
        coach = self.request.user.employee.coach
        if coach is None:
            raise Http404
        return coach


class TeamMemberList(APIView):
    permission_classes = (IsAuthenticated, PermissionsViewAllEmployees)

    def get(self, request, pk, format=None):
        employees = Employee.objects.get_current_employees()
        employees = employees.filter(team__id=pk)

        serializer = MinimalEmployeeSerializer(employees, many=True, context={'request': request})
        return Response(serializer.data)


class LeadershipDetail(APIView):
    permission_classes = (IsAuthenticated,)
    model = Leadership

    def get(self, request, pk, format=None):
        employee = Employee.objects.get(id=pk)
        if employee is not None:
            try:
                leaderships = Leadership.objects.filter(employee__id=employee.id)
                leadership = leaderships.latest('start_date')
                serializer = LeadershipSerializer(leadership, many=False, context={'request': request})
                return Response(serializer.data)
            except Leadership.DoesNotExist:
                pass
        return Response(None, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, pk, format=None):
        employee = Employee.objects.get(id=pk)
        leader_id = request.DATA["leader_id"]
        leader = Employee.objects.get(id = leader_id)
        leadership = Leadership()
        leadership.employee = employee
        leadership.leader = leader
        leadership.save()
        serializer = LeadershipSerializer(leadership, many=False, context={'request': request})
        return Response(serializer.data)


@api_view(['GET'])
def my_profile(request):
    current_user = request.user
    employee = Employee.objects.get(user=current_user)
    serializer = EmployeeSerializer(employee, many=False, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def my_team_lead(request):
    current_user = request.user
    employee = Employee.objects.get(user=current_user)
    if employee.user == current_user or current_user.is_superuser:
        lead = employee.leader
        serializer = MinimalEmployeeSerializer(lead, many=False, context={'request': request})

        return Response(serializer.data)
    else:
        return Response(None, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def my_employees(request):
    current_user = request.user
    lead = Employee.objects.get(user=current_user)
    if lead.user == current_user or current_user.is_superuser:
        employees = lead.get_children()
        employees = employees.filter(departure_date__isnull=True)
        serializer = MinimalEmployeeSerializer(employees, many=True, context={'request': request})

        return Response(serializer.data)
    else:
        return Response(None, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def team_lead_employees(request, pk):
    current_employee = Employee.objects.get(user=request.user)
    lead = Employee.objects.get(id=pk)

    if current_employee.is_ancestor_of(other=lead, include_self=True):
        employees = lead.get_children()
        employees = employees.filter(departure_date__isnull=True)
        serializer = MinimalEmployeeSerializer(employees, many=True, context={'request': request})

        return Response(serializer.data)
    else:
        return Response(None, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def all_access_employees(request):
    employees = Employee.objects.get_all_access_employees()
    serializer = SanitizedEmployeeSerializer(employees, many=True, context={'request': request})

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes((IsAuthenticated, PermissionsViewAllEmployees))
def team_leads(request, pk):
    leaders = Leadership.objects.filter(leader__team_id=pk).values('leader_id')
    employees = Employee.objects.filter(id__in=leaders, departure_date__isnull=True)
    serializer = MinimalEmployeeSerializer(employees, many=True, context={'request': request})

    return Response(serializer.data)


def show_org_chart(request):
    return render_to_response("org_chart.html",
                          {'nodes':Employee.objects.get_current_employees(show_hidden=True)},
                          context_instance=RequestContext(request))


@api_view(['GET'])
@permission_classes((IsAuthenticated, PermissionsViewAllEmployees))
def all_coaches(request):
    coaches = Employee.objects.get_current_coaches()
    serializer = CoachSerializer(coaches, many=True)
    return Response(data=serializer.data)


@api_view(['GET'])
@permission_classes((IsAuthenticated, PermissionsViewAllEmployees))
def coaches_report(request):
    coaches = Employee.objects.get_current_coaches()
    serializer = CoachReportSerializer(coaches, many=True)
    return Response(data=serializer.data)


@api_view(['GET'])
@permission_classes((IsAuthenticated, PermissionsViewAllEmployees))
def coaches_blacklist_report(request):
    blacklist = Employee.objects.get_blacklisted_employees()
    serializer = BlacklistedEmployeeSerializer(blacklist, many=True)
    return Response(data=serializer.data)


@api_view(['GET'])
def available_coaches(request):
    coaches = Employee.objects.get_available_coaches(employee=request.user.employee)
    serializer = SanitizedEmployeeSerializer(coaches, many=True)
    return Response(data=serializer.data)


@api_view(['POST'])
def change_coach(request):
    serializer = CoachChangeRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    coach = serializer.validated_data['new_coach']
    employee = request.user.employee
    employee.update_coach(coach)
    return Response(status=status.HTTP_202_ACCEPTED)
    

def account_activate(request, uidb64=None, token=None, template_name=None, set_password_form=None):
    return password_reset_confirm(request, uidb64=uidb64, token=token, template_name=template_name, set_password_form=set_password_form, post_reset_redirect=reverse('account_activate_login', kwargs={'uidb64': uidb64}))


def account_activate_login(request, uidb64=None, template_name=None, authentication_form=None):
    uid = urlsafe_base64_decode(uidb64)
    user = User.objects.get(pk=uid)
    return login(request, template_name=template_name, extra_context={'email': user.email}, authentication_form=authentication_form)


class RetrieveCoachProfile(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, format=None):
        try:
            profile = CoachProfile.objects.get(employee__id=pk)
            if request.user.has_perm('org.view_employees') or \
                            request.user.employee.id == profile.employee.id:
                serializer = CoachProfileSerializer(profile, context={'request': request})
            else:
                serializer = PublicCoachProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(None)


class CreateCoachProfile(CreateAPIView):
    serializer_class = CreateUpdateCoachProfileSerializer
    permission_classes = (IsAuthenticated, PermissionsViewAllEmployees)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        saved = self.perform_create(serializer)
        serializer = CoachProfileSerializer(instance=saved, context={'request': request})

        return Response(serializer.data)

    def perform_create(self, serializer):
        return serializer.save()


class UpdateCoachProfile(UpdateAPIView):
    queryset = CoachProfile.objects.all()
    serializer_class = CreateUpdateCoachProfileSerializer
    permission_classes = (IsAuthenticated, UserIsEmployee)

    def get_employee(self):
        profile = self.get_object()
        return profile.employee

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        serializer = CoachProfileSerializer(instance, context={'request': request})
        return Response(serializer.data)


class UpdateEmployeeProfile(UpdateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EditEmployeeSerializer
    permission_classes = (IsAuthenticated, UserIsEmployee)

    def get_employee(self):
        return self.get_object()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        serializer = SanitizedEmployeeSerializer(instance, context={'request': request})
        return Response(serializer.data)
