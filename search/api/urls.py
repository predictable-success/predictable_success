from django.conf.urls import *
from views import *

urlpatterns = patterns('',
    url(r'^employees/$', employee_search),
    url(r'^employees/lead/(?P<pk>[0-9]+)/$', lead_employee_search),
    url(r'^employees/coach/(?P<pk>[0-9]+)/$', coach_employee_search),
    url(r'^employees/my-team/$', my_team_employee_search),
    url(r'^employees/(?P<pk>[0-9]+)/leaders/$', employee_leaders_search),
    url(r'^employees/my-coachees/$', my_coachees_employee_search),
    url(r'^reports/salary/lead/(?P<pk>[0-9]+)/$', lead_salary_report),
    url(r'^reports/salary/my-team/$', my_team_salary_report),
    url(r'^reports/salary/my-coachees/$', my_coachees_salary_report),
    url(r'^reports/salary/$', salary_report),
)