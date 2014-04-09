from rest_framework import serializers
from pvp.models import PvpEvaluation, EvaluationRound
from org.models import Employee, Team, Mentorship, Leadership, Attribute, AttributeCategory
from todo.models import Task
from comp.models import CompensationSummary
from blah.models import Comment
from engagement.models import Happiness
from django.contrib.auth.models import User
from django.contrib.sites.models import Site

class TeamSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name', 'leader')

class EmployeeSerializer(serializers.HyperlinkedModelSerializer):
    team = TeamSerializer()
    avatar = serializers.SerializerMethodField('get_avatar_url')
    avatar_small = serializers.SerializerMethodField('get_avatar_small_url')
    def get_avatar_url(self, obj):
        url = ''
        if obj.avatar:
            url = obj.avatar.url
        return url
    def get_avatar_small_url(self, obj):
        url = ''
        if obj.avatar_small:
            url = obj.avatar_small.url
        return url
    class Meta:
        model = Employee
        fields = ('id', 'full_name', 'avatar', 'avatar_small', 'job_title', 'hire_date', 'departure_date', 'team', 'display')

class MinimalEmployeeSerializer(serializers.HyperlinkedModelSerializer):
    avatar = serializers.SerializerMethodField('get_avatar_url')
    avatar_small = serializers.SerializerMethodField('get_avatar_small_url')
    def get_avatar_url(self, obj):
        url = ''
        if obj.avatar:
            url = obj.avatar.url
        return url
    def get_avatar_small_url(self, obj):
        url = ''
        if obj.avatar_small:
            url = obj.avatar_small.url
        return url
    class Meta:
        model = Employee
        fields = ('id', 'full_name', 'display', 'avatar', 'avatar_small')

class UserSerializer(serializers.ModelSerializer):
    employee = MinimalEmployeeSerializer()
    can_edit_employees = serializers.SerializerMethodField('get_can_edit_employees')
    can_view_comments = serializers.SerializerMethodField('get_can_view_comments')
    can_coach_employees = serializers.SerializerMethodField('get_can_coach_employees')
    def get_can_edit_employees(self, obj):
        if obj.groups.filter(name='Edit Employee').exists() | obj.is_superuser:
                return True
        return False
    def get_can_view_comments(self, obj):
        if obj.groups.filter(name='View Comments').exists() | obj.is_superuser:
                return True
        return False
    def get_can_coach_employees(self, obj):
        if obj.groups.filter(name='Coaches').exists() | obj.is_superuser:
                return True
        return False
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'can_edit_employees', 'can_view_comments', 'can_coach_employees', 'employee', 'last_login')

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ('id', 'domain', 'name')

class SubCommentSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'content', 'owner', 'object_id', 'created_date', 'modified_date')

class CommentSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer()
    associated_object = MinimalEmployeeSerializer()
    class Meta:
        model = Comment
        fields = ('id', 'content', 'owner', 'object_id', 'created_date', 'modified_date', 'associated_object')

class TaskSerializer(serializers.HyperlinkedModelSerializer):
    created_by = MinimalEmployeeSerializer()
    assigned_to = MinimalEmployeeSerializer()
    assigned_by = MinimalEmployeeSerializer()
    employee = MinimalEmployeeSerializer()
    class Meta:
        model = Task
        fields = ('id', 'description', 'assigned_to', 'assigned_by', 'created_by', 'employee', 'created_date', 'due_date', 'completed')

class HappinessSerializer(serializers.HyperlinkedModelSerializer):
    assessed_by = MinimalEmployeeSerializer()
    employee = MinimalEmployeeSerializer()
    assessment_verbose = serializers.SerializerMethodField('get_assessment_verbose')

    def get_assessment_verbose(self, obj):
        return obj.assessment_verbose

    class Meta:
        model = Happiness
        fields = ('id', 'employee', 'assessment', 'assessment_verbose', 'assessed_by', 'assessed_date')

class EvaluationRoundSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = EvaluationRound
        fields = ['id', 'date',]

class PvpEvaluationSerializer(serializers.ModelSerializer):
    talent_category = serializers.IntegerField(source='get_talent_category')
    employee = EmployeeSerializer()
    evaluation_round = EvaluationRoundSerializer()

    class Meta:
        model = PvpEvaluation
        fields = ('potential', 'performance', 'talent_category', 'employee', 'evaluation_round')

class MentorshipSerializer(serializers.HyperlinkedModelSerializer):
    mentor = MinimalEmployeeSerializer()
    mentee = MinimalEmployeeSerializer()
    class Meta:
        model = Mentorship
        fields = ['mentor', 'mentee',]
        
class LeadershipSerializer(serializers.HyperlinkedModelSerializer):
    leader = MinimalEmployeeSerializer()
    employee = MinimalEmployeeSerializer()
    class Meta:
        model = Leadership
        fields = ['leader', 'employee','start_date', 'end_date']

class AttributeCategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = AttributeCategory
        fields = ['id', 'name',]
        
class AttributeSerializer(serializers.HyperlinkedModelSerializer):
    employee = MinimalEmployeeSerializer()
    category = AttributeCategorySerializer()
    class Meta:
        model = Attribute
        fields = ['employee', 'name', 'category',]        
       
class TalentCategoryReportSerializer(serializers.Serializer):
    evaluation_date = serializers.DateField()
    categories = serializers.Field()
    total_evaluations = serializers.Field()

class SalaryReportSerializer(serializers.Serializer):
    categories = serializers.SerializerMethodField('get_categories')
    total_salaries = serializers.SerializerMethodField('get_total_salaries')

    def get_categories(self, obj):
        cats = {}
        for key in obj.categories:
            cats[key] = float(obj.categories[key])
        return cats

    def get_total_salaries(self, obj):
        return float(obj.total_salaries)

class CompensationSummarySerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer()
    total_compensation = serializers.SerializerMethodField('get_total_compensation')
    salary = serializers.SerializerMethodField('get_salary')
    bonus = serializers.SerializerMethodField('get_bonus')
    discretionary = serializers.SerializerMethodField('get_discretionary')
    writer_payments_and_royalties = serializers.SerializerMethodField('get_writer_payments_and_royalties')

    def get_salary(self, obj):
        return float(obj.salary)

    def get_bonus(self, obj):
        return float(obj.bonus)

    def get_discretionary(self, obj):
        return float(obj.discretionary)

    def get_writer_payments_and_royalties(self, obj):
        return float(obj.writer_payments_and_royalties)

    def get_total_compensation(self, obj):
        return float(obj.get_total_compensation())

    class Meta:
        model = CompensationSummary
        fields = ('year', 'fiscal_year', 'salary', 'bonus', 'discretionary', 'writer_payments_and_royalties', 'total_compensation',)
