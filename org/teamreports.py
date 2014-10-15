from .models import Employee
from django.db.models import Count
from assessment.models import MBTI, MBTITeamDescription
from django.utils.log import getLogger

logger = getLogger('talentdashboard')

class MBTIReport:
    def __init__(self, team_type=None, mbtis=None, total_assessed=None, total_not_assessed=None, total=None):
        self.team_type = team_type
        self.mbtis = mbtis
        self.total = total
        self.total_assessed = total_assessed
        self.total_not_assessed = total_not_assessed

def build_mbti_report(employees):
    # need to refactor this to:
    # Team type = Most occurrences for each indicator (I's, E's, P's etc.)
    # In the event of a tie defer to leaders type
    employee_mbtis = MBTI.objects.filter(employee__in=employees)
    total = employees.count()
    total_assessed = employee_mbtis.count()
    total_not_assessed = employees.count() - total_assessed
    employee_mbtis = employee_mbtis.values('type').annotate(c=Count('type')).order_by('-c')
    dominant_type = employee_mbtis[0]['type']
    team_type = MBTITeamDescription.objects.filter(type=dominant_type)[0]

    return MBTIReport(team_type=team_type, mbtis=employee_mbtis, total_assessed = total_assessed, total_not_assessed = total_not_assessed, total=total)

def get_mbti_report_for_team(team_id):
    employees = Employee.objects.filter(team_id=team_id)
    employees = employees.filter(departure_date__isnull=True)
    return build_mbti_report(employees)