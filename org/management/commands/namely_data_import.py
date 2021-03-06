from assessment.models import AssessmentCategory, EmployeeAssessment, MBTI
from comp.models import CompensationSummary
from customers.models import Customer
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection
from optparse import make_option
from org.models import Employee, Team
from search.indexes import EmployeeIndex
import io
import requests
import urllib2 as urllib


class Command(BaseCommand):

    option_list = BaseCommand.option_list + (
        make_option('--user_id',
            action='store',
            dest='user_id',
            default='',
            help='The uid of the account to update. Use ALL to update all current employee accounts.'),
    )

    def handle(self, *args, **options):
        def update_assessment(employee, category_name, score):
            assessments = EmployeeAssessment.objects.filter(employee__id=employee.id, category__name=category_name)

            if assessments.count() == 0 or assessments[0].score != score:
                if assessments.count() > 0:
                    assessment = assessments[0]
                    assessment.score = score
                else:
                    try:
                        category = AssessmentCategory.objects.get(name=category_name)
                        assessment = EmployeeAssessment(employee=employee, category=category, score=score)
                    except AssessmentCategory.DoesNotExist:
                        return
                assessment.save()
                print "Updated %s's %s" % (employee.full_name, assessment.category.name)
            return
        department_ids = []
        limit = 25
        tenant = Customer.objects.filter(schema_name=connection.schema_name).first()
        if tenant.is_public_tenant() or \
                tenant.namely_api_url is None or \
                tenant.namely_api_token is None:
            return
        # Get namely Groups
        print "Loading groups..."
        headers = {'Authorization': 'Bearer %s' % tenant.namely_api_token}
        groups_api_url = "https://%s/api/v1/groups.json" % tenant.namely_api_url
        print groups_api_url
        response = requests.get(groups_api_url, headers=headers)
        json = response.json()
        if len(json['groups']) > 0:
            for group in json['groups']:
                group_id = group['id']
                group_type = group['type']
                if group_type == 'Departments':
                    department_ids.append(group_id)
            print department_ids
        print "Finished loading groups"
        # Get namely feed
        profiles_api_url = "https://%s/api/v1/profiles.json?sort=first_name&limit=%s" % (tenant.namely_api_url, limit)
        response_code = None
        keep_alive = True
        last_record = None
        while keep_alive and (response_code is None or response_code == 200):
            url = "%s&after=%s" % (profiles_api_url, last_record)
            print url
            response = requests.get(url, headers=headers)
            json = response.json()
            response_code = response.status_code
            if len(json['profiles']) > 0:
                for profile in json['profiles']:
                    employee = None
                    namely_id = profile['id']
                    email = profile['email']
                    user_status = profile['user_status']
                    preferred_name = profile['preferred_name']
                    first_name = profile['first_name']
                    last_name = profile['last_name']
                    start_date = profile['start_date']
                    departure_date = profile['departure_date']
                    avatar_path = profile['image']['thumbs']['300x300'] if profile['image'] else None
                    avatar_mime_type = profile['image']['mime_type'] if profile['image'] else None
                    reports_to_id = profile['reports_to'][0]['id'] if len(profile['reports_to']) > 0 else None
                    gender = profile['gender'][0] if profile['gender'] else None
                    salary_yearly_amount = profile['salary']['yearly_amount'] if profile['salary'] else None
                    salary_date = profile['salary']['date'] if profile['salary'] else None
                    salary_currency_type = profile['salary']['currency_type'] if profile['salary'] else None
                    job_title = profile['job_title']['title'] if profile['job_title'] else None
                    groups = profile['links']['groups']
                    meyers_briggs_type = profile['meyers_briggs_type'].lower() if profile['meyers_briggs_type'] else None
                    kolbe_fact_finder_score = profile['kolbe_fact_finder_score'] if profile['kolbe_fact_finder_score'] else None
                    kolbe_follow_thru_score = profile['kolbe_follow_thru_score'] if profile['kolbe_follow_thru_score'] else None
                    kolbe_quick_start_score = profile['kolbe_quick_start_score'] if profile['kolbe_quick_start_score'] else None
                    kolbe_implementor_score = profile['kolbe_implementor_score'] if profile['kolbe_implementor_score'] else None

                    try:
                        lead = Employee.objects.get(namely_id=reports_to_id, departure_date__isnull=True)
                    except Employee.DoesNotExist:
                        lead = None

                    try:
                        employee = Employee.objects.get(namely_id=namely_id)
                    except Employee.DoesNotExist:
                        if user_status == 'active':
                            try:
                                employee = Employee.objects.get(email=email)
                            except Employee.DoesNotExist:
                                if user_status == 'active' and 'contractor' not in job_title.lower() and 'intern' not in job_title.lower():
                                    employee = Employee(first_name=first_name,
                                                        last_name=last_name,
                                                        display=True,
                                                        namely_id=namely_id,
                                                        email=email)
                                    employee.save()
                                    print "Added new employee %s" % employee.full_name
                                    if avatar_path and avatar_mime_type:
                                        avatar_url = "https://%s%s" % (tenant.namely_api_url, avatar_path)
                                        print avatar_url
                                        req = urllib.Request(avatar_url, None, headers)
                                        fd = urllib.urlopen(req, )
                                        image_file = io.BytesIO(fd.read())
                                        employee.upload_avatar(file=image_file, mime_type=avatar_mime_type)
                                        print "Uploaded avatar for %s" % employee.full_name

                    if employee and 'contractor' not in job_title.lower():
                        print employee
                        if lead:
                            if employee.leader is None or employee.leader.id != lead.id:
                                employee.leader = lead
                                employee.save()
                                print "Updated %s's manager to %s" % (employee.full_name, lead.full_name)
                        if start_date:
                            employee.hire_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                        if departure_date:
                            departure_date = datetime.strptime(departure_date, '%Y-%m-%d').date()
                            employee.departure_date = departure_date
                            employee.save()
                            print "Updated %s's departure date to %s" % (employee.full_name, employee.departure_date)
                        if employee.departure_date and departure_date is None:
                            employee.departure_date = None
                            employee.save()
                            print "Welcoming back %s" % employee.full_name
                        if preferred_name and preferred_name != employee.first_name:
                            print "Updating %s's first name to %s" % (employee.full_name, preferred_name)
                            employee.first_name = preferred_name
                            employee.save()
                        if last_name and last_name != employee.last_name:
                            print "Updating %s's last name to %s" % (employee.full_name, last_name)
                            employee.last_name = last_name
                            employee.save()
                        if email and (employee.email is None or employee.email != email):
                            employee.email = email
                            employee.save()
                            print "Updated %s's email" % employee.full_name
                        if email and (employee.user and employee.user.email != email):
                            employee.user.email = email
                            employee.user.save()
                            print "Updated %s's user email" % employee.full_name
                        if gender and (employee.gender is None or employee.gender != gender):
                            employee.gender = gender
                            employee.save()
                            print "Updated %s's gender" % employee.full_name
                        if job_title != employee.job_title:
                            employee.job_title = job_title
                            employee.save()
                            print "Updated %s's job title" % employee.full_name
                        if salary_yearly_amount and salary_date:
                            if employee.comp.count() == 0 or round(salary_yearly_amount, 2) != round(employee.comp.order_by('-year', '-pk')[0].salary, 2):
                                salary_date = datetime.strptime(salary_date, '%Y-%m-%d').date()
                                compensation = CompensationSummary(employee=employee, fiscal_year=salary_date.year, year=salary_date.year)
                                compensation.date = salary_date
                                compensation.currency_type = salary_currency_type
                                compensation.salary = salary_yearly_amount
                                compensation.save()
                                print "Updated %s's compensation" % employee.full_name
                        if groups and len(groups) > 0:
                            for group in groups:
                                if group['id'] in department_ids:
                                    if employee.team is None or employee.team.name != group['name']:
                                        try:
                                            # Find Scoutmap team by group name
                                            team = Team.objects.get(name=group['name'])
                                        except Team.DoesNotExist:
                                            # If it doesn't exist create team
                                            team = Team(name=group['name'])
                                            team.save()
                                            print "Created team %s" % team.name
                                        # Update employee team
                                        employee.team = team
                                        employee.save()
                                        print "Updated %s's team to %s" % (employee.full_name, team.name)
                        if meyers_briggs_type:
                            mbtis = MBTI.objects.filter(employee__id=employee.id)
                            if mbtis.count() == 0 or mbtis[0].type != meyers_briggs_type:
                                if mbtis.count() > 0:
                                    mbti = mbtis[0]
                                    mbti.type = meyers_briggs_type
                                else:
                                    mbti = MBTI(employee=employee, type=meyers_briggs_type)
                                mbti.save()
                                print "Updated %s's MBTI to %s" % (employee.full_name, mbti.type)
                        if kolbe_fact_finder_score:
                            update_assessment(employee=employee, category_name='Fact Finder', score=int(kolbe_fact_finder_score))
                        if kolbe_follow_thru_score:
                            update_assessment(employee=employee, category_name='Follow Thru', score=int(kolbe_follow_thru_score))
                        if kolbe_quick_start_score:
                            update_assessment(employee=employee, category_name='Quick Start', score=int(kolbe_quick_start_score))
                        if kolbe_implementor_score:
                            update_assessment(employee=employee, category_name='Implementor', score=int(kolbe_implementor_score))

                    last_record = namely_id
            else:
                keep_alive = False
        Employee.objects.rebuild()
        indexer = EmployeeIndex()
        employees = Employee.objects.all()
        indexer.process(employees, tenant)
        return
