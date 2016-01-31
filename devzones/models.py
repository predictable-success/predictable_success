from django.db import models
from org.models import Employee
from datetime import datetime, date
from dateutil.relativedelta import relativedelta


class QuestionManager(models.Manager):
    def get_next_question(self, employee_zone):
        #get the last question answered
        last_question_answered = employee_zone.last_question_answered

        #if we have not answered any questions start with the first question
        if last_question_answered is None:
            return self.get_first_question(employee_zone)
        previous_question = last_question_answered.previous_question
        if previous_question is None:
            #if we have no previous question get the next question(s)
            next_questions = last_question_answered.next_questions
        else:
            #get any of the previous question's next questions that have not been answered
            next_questions = previous_question.next_questions.exclude(id__in=employee_zone.answers.values_list('question__id', flat=True))
            if next_questions.count() == 0:
                #if we don't have any get the next question(s)
                next_questions = last_question_answered.next_questions

        if next_questions.count() > 0:
            #get the next question at random
            return next_questions.order_by('?').first()
        else:
            #if we don't have anymore questions left return None
            return None

        return self.filter()

    def get_first_question(self, employee_zone):
        question = self.get(previous_question__isnull=True, for_new_employees=employee_zone.new_employee)
        return question


class Question(models.Model):
    objects = QuestionManager()
    text = models.TextField()
    randomize_answers = models.BooleanField(default=False)
    previous_question = models.ForeignKey('Question', related_name='next_questions', null=True, blank=True)
    randomize_next_questions = models.BooleanField(default=False)
    for_new_employees = models.BooleanField(default=False)

    def answers(self):
        return self._answers.order_by('?')

    def has_siblings(self):
        if self.previous_question and self.previous_question.next_questions:
            if self.previous_question.next_questions.count() > 1:
                return True
        return False

    def __str__(self):
        return self.text


class Zone(models.Model):
    name = models.CharField(
        max_length=255,
    )
    description = models.TextField(blank=True, default='')
    value = models.IntegerField(default=0)
    tie_breaker = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.tie_breaker:
            try:
                zone = Zone.objects.get(tie_breaker=True)
                if self != zone:
                    zone.tie_breaker = False
                    zone.save()
            except Zone.DoesNotExist:
                pass
        super(Zone, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


class Answer(models.Model):
    text = models.TextField(blank=True, default='')
    zone = models.ForeignKey(Zone, related_name='+', null=True, blank=True)
    question = models.ForeignKey(Question, related_name='_answers', null=True)

    def __str__(self):
        return self.text


class EmployeeZoneManager(models.Manager):
    def get_unfinished(self, employee):
        return self.get(employee=employee, completed=False)

class EmployeeZone(models.Model):
    objects = EmployeeZoneManager()
    employee = models.ForeignKey(Employee, related_name='development_zone')
    date = models.DateTimeField(null=False, blank=False, default=datetime.now)
    answers = models.ManyToManyField(Answer, related_name='+', null=True, blank=True)
    zone = models.ForeignKey(Zone, related_name='+', null=True, blank=True)
    new_employee = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    last_question_answered = models.ForeignKey(Question, related_name='+', null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    def next_question(self):
        return Question.objects.get_next_question(self)

    def all_questions_answered(self):
        if self.last_question_answered.has_siblings():
            previous_question = self.last_question_answered.previous_question
            questions_answered_ids = self.answers.values_list('question__id', flat=True)
            sibling_ids = previous_question.next_questions.values_list('id', flat=True)
            return set(sibling_ids).issubset(questions_answered_ids)
        else:
            try:
                answer = self.answers.get(question__id=self.last_question_answered.id)
                return answer.zone is not None
            except Answer.DoesNoExist:
                return self.last_question_answered.next_questions.count() == 0

    def save(self, *args, **kwargs):
        if not self.pk:
            if date.today() < (self.employee.hire_date + relativedelta(months=3)):
                self.new_employee = True
        super(EmployeeZone, self).save(*args, **kwargs)

    def __str__(self):
        return "%s %s" % (self.employee.full_name, self.date)
