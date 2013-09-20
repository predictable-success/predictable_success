from django.db import models

class Organization(models.Model):
    name = models.CharField(
        max_length=255,
    )
    subdomain = models.CharField(
        max_length=15,
    )

    def __str__(self):
        return self.name

class Employee(models.Model):
    informal_name = models.CharField(
        max_length=255,
    )
    job_title = models.CharField(
        max_length=255,
    )
    base_camp = models.CharField(
        max_length=255,
    )
    u_name = models.CharField(
        max_length=255,
    )
    date_of_hire = models.DateField()
    display = models.BooleanField()
    organization = models.ForeignKey(Organization)

    def __str__(self):
        return self.informal_name

class Team(models.Model):
    name = models.CharField(
        max_length=255,
    )
    leader = models.OneToOneField('Employee', related_name='+')
    members = models.ManyToManyField(Employee)
    def __str__(self):
        return self.name

class Mentorship(models.Model):
    mentor = models.ForeignKey(Employee, related_name='mentors')
    mentee = models.ForeignKey(Employee, related_name='mentees')

    def __str__(self):
        return "%s mentorship of %s" % (self.mentor.informal_name, self.mentee.informal_name)
