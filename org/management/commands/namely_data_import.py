from assessment.models import AssessmentCategory, EmployeeAssessment, MBTI
from comp.models import CompensationSummary
from customers.models import Customer
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import connection
from optparse import make_option
from org.models import Employee
import requests


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

        limit = 25
        tenant = Customer.objects.filter(schema_name=connection.schema_name).first()
        if tenant.is_public_tenant() or \
                tenant.namely_api_url is None or \
                tenant.namely_api_token is None:
            return
        # Get namely feed
        api_url = "https://%s/profiles.json?filter[user_status]=active&sort=first_name&limit=%s" % (tenant.namely_api_url, limit)
        headers = {'Authorization': 'Bearer %s' % tenant.namely_api_token}
        response_code = None
        keep_alive = True
        last_record = None
        while keep_alive and (response_code is None or response_code == 200):
            url = "%s&after=%s" % (api_url, last_record)
            print url
            response = requests.get(url, headers=headers)
            json = response.json()
            response_code = response.status_code
            if len(json['profiles']) > 0:
                for profile in json['profiles']:
                    namely_id = profile['id']
                    reports_to_id = profile['reports_to'][0]['id'] if len(profile['reports_to']) > 0 else None
                    gender = profile['gender'][0] if profile['gender'] else None
                    salary_yearly_amount = profile['salary']['yearly_amount'] if profile['salary'] else None
                    salary_date = profile['salary']['date'] if profile['salary'] else None
                    salary_currency_type = profile['salary']['currency_type'] if profile['salary'] else None
                    job_title = profile['job_title']['title'] if profile['job_title'] else None
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
                        employee = Employee.objects.get(namely_id=namely_id, departure_date__isnull=True)
                    except Employee.DoesNotExist:
                        employee = None

                    if employee:
                        print employee
                        if lead:
                            if employee.leader is None or employee.leader.id != lead.id:
                                employee.leader = lead
                                employee.save()
                                print "Updated %s's manager to %s" % (employee.full_name, lead.full_name)
                        if gender and (employee.gender is None or employee.gender != gender):
                            print "Updating gender"
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
        return
