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

class EmployeeSerializer(serializers.HyperlinkedModelSerializer):
    team = TeamSerializer()
    avatar = serializers.SerializerMethodField('get_avatar_url')
    avatar_small = serializers.SerializerMethodField('get_avatar_small_url')
    leader_id = serializers.SerializerMethodField('get_leader_id')
    happiness = serializers.SerializerMethodField('get_happiness')
    happiness_date = serializers.SerializerMethodField('get_happiness_date')
    mbti_ei = serializers.SerializerMethodField('get_mbti_ei')
    mbti_sn = serializers.SerializerMethodField('get_mbti_sn')
    mbti_tf = serializers.SerializerMethodField('get_mbti_tf')
    mbti_pj = serializers.SerializerMethodField('get_mbti_pj')
    kolbe_fact_finder = serializers.SerializerMethodField('get_kolbe_fact_finder')
    kolbe_follow_thru = serializers.SerializerMethodField('get_kolbe_follow_thru')
    kolbe_quick_start = serializers.SerializerMethodField('get_kolbe_quick_start')
    kolbe_implementor = serializers.SerializerMethodField('get_kolbe_implementor')
    vops_visionary = serializers.SerializerMethodField('get_vops_visionary')
    vops_operator = serializers.SerializerMethodField('get_vops_operator')
    vops_processor = serializers.SerializerMethodField('get_vops_processor')
    vops_synergist = serializers.SerializerMethodField('get_vops_synergist')
    current_salary = serializers.SerializerMethodField('get_current_salary')
    current_bonus = serializers.SerializerMethodField('get_current_bonus')

    def get_current_salary(self, obj):
         try:
            current_salary = obj.comp.order_by('-pk')[0].salary
            return current_salary
         except:
             return None
    def get_current_bonus(self, obj):
        try:
            current_bonus = obj.comp.order_by('-pk')[0].bonus
            return current_bonus
        except:
            return None
    def get_happiness(self, obj):
        happiness = -1
        if obj.current_happiness:
            happiness = obj.current_happiness.assessment
        return happiness
    def get_happiness_date(self, obj):
        happiness_date = None
        if obj.current_happiness:
            happiness_date = obj.current_happiness.assessed_date
        return happiness_date
    def get_leader_id(self, obj):
        leader_id = 0
        if obj.current_leader:
            leader_id = obj.current_leader.id
        return leader_id
    def get_mbti_ei(self, obj):
        mbti_ei = None
        if obj.get_mbti_ei:
            mbti_ei = obj.get_mbti_ei
        return mbti_ei
    def get_mbti_sn(self, obj):
        mbti_sn = None
        if obj.get_mbti_sn:
            mbti_sn = obj.get_mbti_sn
        return mbti_sn
    def get_mbti_tf(self, obj):
        mbti_tf = None
        if obj.get_mbti_tf:
            mbti_tf = obj.get_mbti_tf
        return mbti_tf
    def get_mbti_pj(self, obj):
        mbti_pj = None
        if obj.get_mbti_pj:
            mbti_pj = obj.get_mbti_pj
        return mbti_pj
    def get_kolbe_fact_finder(self, obj):
        kolbe_fact_finder = None
        if obj.get_kolbe_fact_finder:
            kolbe_fact_finder = obj.get_kolbe_fact_finder
        return kolbe_fact_finder
    def get_kolbe_follow_thru(self, obj):
        kolbe_follow_thru = None
        if obj.get_kolbe_follow_thru:
            kolbe_follow_thru = obj.get_kolbe_follow_thru
        return kolbe_follow_thru
    def get_kolbe_quick_start(self, obj):
        kolbe_quick_start = None
        if obj.get_kolbe_quick_start:
            kolbe_quick_start = obj.get_kolbe_quick_start
        return kolbe_quick_start
    def get_kolbe_implementor(self, obj):
        kolbe_implementor = None
        if obj.get_kolbe_implementor:
            kolbe_implementor = obj.get_kolbe_implementor
        return kolbe_implementor
    def get_vops_visionary(self, obj):
        vops_visionary = None
        if obj.get_vops_visionary:
            vops_visionary = obj.get_vops_visionary
        return vops_visionary
    def get_vops_operator(self, obj):
        vops_operator = None
        if obj.get_vops_operator:
            vops_operator = obj.get_vops_operator
        return vops_operator
    def get_vops_processor(self, obj):
        vops_processor = None
        if obj.get_vops_processor:
            vops_processor = obj.get_vops_processor
        return vops_processor
    def get_vops_synergist(self, obj):
        vops_synergist = None
        if obj.get_vops_synergist:
            vops_synergist = obj.get_vops_synergist
        return vops_synergist
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
        fields = ('id', 'full_name', 'avatar', 'avatar_small', 'job_title', 'hire_date', 'leader_id', 'happiness', 'happiness_date', 'kolbe_fact_finder','kolbe_follow_thru', 'kolbe_quick_start', 'kolbe_implementor', 'vops_visionary', 'vops_operator', 'vops_processor', 'vops_synergist', 'mbti_ei', 'mbti_sn', 'mbti_tf', 'mbti_pj', 'departure_date', 'team', 'display', 'current_salary', 'current_bonus')

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
