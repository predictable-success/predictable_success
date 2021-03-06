from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from leadership_styles.models import QuizUrl
from org.api.permissions import UserIsEmployeeOrLeaderOrCoachOfEmployee, UserIsEmployee, PermissionsViewAllEmployees
from org.models import create_user_with_random_username
from predictable_success.utils import authenticate_and_login
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from rest_framework.generics import *
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from sign_in.tasks import send_account_created_link_email
from .permissions import UserIsAssessorOrHasAllAccess, UserIsTeamMember, UserIsTeamOwner
from .serializers import *


class CreateEmployeeLeadershipStyle(CreateAPIView):
    serializer_class = CreateEmployeeLeadershipStyleSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.data['request']:
            leadership_style_request_id = serializer.data['request']
            leadership_style_request = LeadershipStyleRequest.objects.get(id=leadership_style_request_id)
            if leadership_style_request.was_responded_to:
                return Response("This request has already been answered.", status=status.HTTP_403_FORBIDDEN)
        saved = self.perform_create(serializer)
        serializer = EmployeeLeadershipStyleSerializer(instance=saved, context={'request': request})

        return Response(serializer.data)

    def perform_create(self, serializer):
        return serializer.save()


class RetrieveEmployeeLeadershipStyle(RetrieveAPIView):
    serializer_class = EmployeeLeadershipStyleSerializer
    permission_classes = (IsAuthenticated, UserIsEmployeeOrLeaderOrCoachOfEmployee)
    queryset = EmployeeLeadershipStyle.objects.all()

    def get_employee(self):
        employee_leadership_style = self.get_employee_leadership_style()
        return employee_leadership_style.employee

    def get_employee_leadership_style(self):
        try:
            return self.get_object()
        except EmployeeLeadershipStyle.DoesNotExist:
            raise Http404()


class RetrieveLeadershipStyleTeases(ListAPIView):
    serializer_class = LeadershipStyleTeaseSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return LeadershipStyleTease.objects.all()


class RetrieveMyEmployeeLeadershipStyle(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        employee = self.request.user.employee
        try:
            leadership_style = EmployeeLeadershipStyle.objects.filter(employee=employee, assessor=employee).latest('date')
        except EmployeeLeadershipStyle.DoesNotExist:
            leadership_style = EmployeeLeadershipStyle(employee=employee, assessor=employee, assessment_type=0)
            leadership_style.save()
        serializer = EmployeeLeadershipStyleSerializer(leadership_style, context={'request': request})
        return Response(serializer.data)


class RetrieveUnfinishedEmployeeLeadershipStyle(RetrieveAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        employee = self.request.user.employee
        leadership_style = EmployeeLeadershipStyle.objects.get_unfinished(employee=employee)
        if leadership_style is None:
            raise Http404()
        serializer = EmployeeLeadershipStyleSerializer(leadership_style, context={'request': request})
        return Response(serializer.data)


class UpdatePreviousQuestion(GenericAPIView):
    queryset = EmployeeLeadershipStyle.objects.all()
    serializer_class = EmployeeLeadershipStyleSerializer
    permission_classes = (IsAuthenticated, UserIsEmployee)

    def get_employee(self):
        leadership_style = self.get_object()
        return leadership_style.employee

    def put(self, request, pk, format=None):
        employee_leadership_style = self.get_object()
        employee_leadership_style.last_question_answered = employee_leadership_style.last_question_answered.previous_question
        employee_leadership_style.save()
        serializer = EmployeeLeadershipStyleSerializer(employee_leadership_style, context={'request':request})
        return Response(serializer.data)


class UpdateEmployeeLeadershipStyle(RetrieveUpdateAPIView):
    queryset = EmployeeLeadershipStyle.objects.all()
    permission_classes = (IsAuthenticated, UserIsAssessorOrHasAllAccess,)
    serializer_class = UpdateEmployeeLeadershipStyleSerializer

    def get_leadership_style(self):
        return self.get_object()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        serializer = EmployeeLeadershipStyleSerializer(instance, context={'request': request})
        return Response(serializer.data)


class UpdateEmployee(GenericAPIView):
    queryset = Employee.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = SanitizedEmployeeSerializer

    def put(self, request, pk, format=None):
        instance = self.get_object()
        full_name = request.DATA["full_name"]
        instance.full_name = full_name
        instance.first_name = instance.full_name.split(' ', 1)[0]
        if len(instance.full_name.split(' ', 1)) > 1:
            instance.last_name = instance.full_name.split(' ', 1)[1]
        instance.save()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)


class CompleteEmployeeLeadershipStyle(GenericAPIView):
    queryset = EmployeeLeadershipStyle.objects.all()
    serializer_class = EmployeeLeadershipStyleSerializer
    permission_classes = (IsAuthenticated, UserIsAssessorOrHasAllAccess)

    def get_leadership_style(self):
        return self.get_object()

    def put(self, request, pk, format=None):
        leadership_style = EmployeeLeadershipStyle.objects.get(id=pk)
        leadership_style.completed = True
        leadership_style.save(update_fields=['completed'])
        if leadership_style.assessment_type == SELF:
            send_account_created_link_email.subtask((leadership_style.employee.id,)).apply_async()
        serializer = EmployeeLeadershipStyleSerializer(instance=leadership_style, context={'request': request})
        return Response(serializer.data)


class RetakeEmployeeLeadershipStyle(GenericAPIView):
    queryset = EmployeeLeadershipStyle.objects.all()
    serializer_class = EmployeeLeadershipStyleSerializer
    permission_classes = (IsAuthenticated, UserIsEmployee)

    def get_employee(self):
        leadership_style = self.get_object()
        return leadership_style.employee

    def put(self, request, pk, format=None):
        employee_leadership_style = self.get_object()
        employee_leadership_style.answers = []
        employee_leadership_style.last_question_answered = None
        employee_leadership_style.notes = ''
        employee_leadership_style.times_retaken += 1
        employee_leadership_style.save()
        serializer = EmployeeLeadershipStyleSerializer(employee_leadership_style, context={'request':request})
        return Response(serializer.data)


class CreateRequest(CreateAPIView):
    serializer_class = CreateRequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        kwargs['many'] = isinstance(self.request.DATA, list)
        return serializer_class(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user.employee)


class RequestTeamReport(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, format=None):
        team = TeamLeadershipStyle.objects.get(id=pk)
        if request.user.employee == team.owner:
            message = request.data['message']
            team.request_team_report(message=message)
            team.requested_report = True
            team.requested_date = datetime.now()
            team.save()
            serializer = TeamLeadershipStyleSerializer(instance=team, context={'request': request})
            return Response(serializer.data)
        else:
            raise PermissionDenied


class InviteTeamMembers(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, format=None):
        team = TeamLeadershipStyle.objects.get(id=pk)
        invites = request.data['invites']
        try:
            team = TeamLeadershipStyle.objects.add_team_members(team=team, invites=invites)
            serializer = TeamLeadershipStyleSerializer(instance=team, context={'request': request})
            return Response(serializer.data)
        except ValidationError, err:
            content = {'validation error': ';'.join(err.messages)}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class FollowupAboutTeam(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        followup = TeamAnalysisFollowUp(employee=request.user.employee)
        followup.save()
        return Response(None, status=status.HTTP_200_OK)


class SendQuizReminder(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = QuizUrl.objects.all()
    serializer_class = QuizUrlSerializer

    def post(self, request, pk, format=None):
        quiz = self.get_object()
        message = request.data['message']
        quiz.send_reminder(message=message, reminded_by_id=request.user.employee.id)
        quiz.last_reminder_sent = datetime.now()
        quiz.save()
        serializer = QuizUrlSerializer(instance=quiz, context={'request': request})

        return Response(serializer.data)


class RemindTeamMembers(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        quiz_ids = request.data['quiz_ids']
        message = request.data['message']

        for quiz_id in quiz_ids:
            try:
                quiz = QuizUrl.objects.get(id=quiz_id)
                quiz.send_reminder(message=message, reminded_by_id=request.user.employee.id)
                quiz.last_reminder_sent = datetime.now()
                quiz.save()
            except QuizUrl.DoesNotExist:
                pass
        quizzes = QuizUrl.objects.filter(id__in=quiz_ids)
        serializer = QuizUrlSerializer(instance=quizzes, context={'request': request}, many=True)
        return Response(serializer.data)


class RemoveTeamMember(GenericAPIView):
    permission_classes = (IsAuthenticated, UserIsTeamOwner)
    queryset = TeamLeadershipStyle.objects.all()
    serializer_class = TeamLeadershipStyleSerializer

    def get_team_owner(self):
        team = self.get_object()
        return team.owner

    def post(self, request, pk, format=None):
        try:
            team = self.get_object()
            employee_id = request.data['team_member']
            employee = Employee.objects.get(id=employee_id)
            team.team_members.remove(employee)
            serializer = TeamLeadershipStyleSerializer(instance=team, context={'request': request})
            return Response(serializer.data)
        except TeamLeadershipStyle.DoesNotExist:
            raise Http404()
        except Employee.DoesNotExist:
            raise Http404()


class RetrieveTeamLeadershipStyle(RetrieveAPIView):
    permission_classes = (IsAuthenticated, UserIsTeamMember)
    serializer_class = TeamLeadershipStyleSerializer
    queryset = TeamLeadershipStyle.objects.all()

    def get_team_members(self):
        team = self.get_object()
        return team.team_members.all()


class RetrieveTeamLeadershipStylesIBelongTo(ListAPIView):
    serializer_class = TeamLeadershipStyleSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TeamLeadershipStyle.objects.get_teams_by_team_member(employee=self.request.user.employee)


class RetrieveTeamsLeadershipStylesIOwn(ListAPIView):
    serializer_class = TeamLeadershipStyleSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TeamLeadershipStyle.objects.get_teams_by_owner(employee=self.request.user.employee)


class RecentRequestsIveSentList(ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return LeadershipStyleRequest.objects.recent_leadership_style_requests_ive_sent_that_have_not_been_completed(requester=self.request.user.employee)


class RetrieveRequest(RetrieveAPIView):
    permission_classes = (IsAuthenticated, UserIsEmployee)
    serializer_class = RequestSerializer
    queryset = LeadershipStyleRequest.objects.all()

    def get_employee(self):
        request = self.get_object()
        return request.reviewer


class RequestsToDoList(ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Return all Requests sent to the user that haven't been completed.
        """
        return LeadershipStyleRequest.objects.pending_for_reviewer(self.request.user.employee)


class ReplyTo360(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, pk, format=None):
        try:
            signer = Signer()
            request360_id = int(signer.unsign(pk))
            request360 = LeadershipStyleRequest.objects.get(id=request360_id)
            redirect_url = request.tenant.build_url("/#/leadership-style/request/%d/reply" % request360_id)

            users = User.objects.filter(email=request360.reviewer_email)
            if users.exists():
                return redirect(redirect_url)

            #create User
            password = User.objects.make_random_password()
            user = create_user_with_random_username(email=request360.reviewer_email, password=password, active=True)

            #create Employee
            employee = Employee(full_name=request360.reviewer_email, email=request360.reviewer_email)
            employee.user = user
            employee.save()

            #update request with employee
            request360.reviewer = employee
            request360.save()

            #authenticate & login
            user = authenticate(username=request360.reviewer_email, password=password)
            login(request=request, user=user)

            return redirect(redirect_url)
        except:
            return redirect(request.tenant.build_url('/take-the-quiz'))


class GetQuiz(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, pk, format=None):
        try:
            if ":" in pk:
                signer = Signer()
                quiz_id = signer.unsign(pk)
                quiz = QuizUrl.objects.get(id=quiz_id)
            else:
                # Assume pk is an email address
                if QuizUrl.objects.filter(email=pk).count() == 0:
                    quiz = generate_quiz_link(email=pk, send_email=False)
                else:
                    quiz = QuizUrl.objects.filter(email=pk).last()

            if not quiz.active:
                employee_leadership_style = quiz.employee_leadership_style.get()
                if not employee_leadership_style.completed:
                    return redirect(request.tenant.build_url('/#/?takeQuiz=true'))
                else:
                    return redirect(request.tenant.build_url('/#/'))

            #create User
            try:
                user = User.objects.get(email=quiz.email)
                if not user.is_active:
                    password = User.objects.make_random_password()
                    user.set_password(password)
                    user.is_active = True
                    user.save()
                    user = authenticate_and_login(email=quiz.email, password=password, request=request)
            except User.DoesNotExist:
                password = User.objects.make_random_password()
                user = create_user_with_random_username(email=quiz.email, password=password, active=True)
                user = authenticate_and_login(email=quiz.email, password=password, request=request)

            #create Employee
            try:
                employee = user.employee
            except Employee.DoesNotExist:
                employee = Employee(full_name=quiz.email, email=quiz.email)
                employee.user = user
                employee.save()

            #create LeadershipStyle
            try:
                leadership_style = EmployeeLeadershipStyle.objects.filter(employee=employee, assessor=employee).latest('date')
            except EmployeeLeadershipStyle.DoesNotExist:
                leadership_style = EmployeeLeadershipStyle(employee=employee, assessor=employee, assessment_type=0)
                leadership_style.quiz_url = quiz
                leadership_style.save()

            #deactivate quiz url
            quiz.active = False
            quiz.save()

            return redirect(request.tenant.build_url('/#/?takeQuiz=true'))

        except:
            return redirect(request.tenant.build_url('/take-the-quiz'))

