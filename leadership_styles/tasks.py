from __future__ import absolute_import
from predictable_success.celery import app
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.db import connection
from customers.models import Customer


@app.task
def send_leadership_style_request_email(request_id):
    from leadership_styles.models import LeadershipStyleRequest
    print 'send_notification_email task'
    leadership_style_request = LeadershipStyleRequest.objects.get(id=request_id)
    recipient_email = leadership_style_request.reviewer.email
    if not recipient_email:
        return
    tenant = Customer.objects.filter(schema_name=connection.schema_name).first()
    response_url = 'https://%s/#/leadership-style/request/%d/reply' % (tenant.domain_url, leadership_style_request.id)
    context = {
        'recipient_first_name': leadership_style_request.reviewer.first_name,
        'requester_full_name': leadership_style_request.requester.full_name,
        'requester_first_name': leadership_style_request.requester.first_name,
        'custom_message': leadership_style_request.message,
        'response_url': response_url,
    }
    subject = "%s needs some quick input from you" % leadership_style_request.requester.full_name
    text_content = render_to_string('leadership_styles/email/leadership_style_request_notification.txt', context)
    html_content = render_to_string('leadership_styles/email/leadership_style_request_notification.html', context)
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


@app.task
def send_quiz_link_email(quiz_link_id):
    from leadership_styles.models import QuizUrl
    print 'send_quiz_link_email'
    quiz = QuizUrl.objects.get(id=quiz_link_id)
    recipient_email = quiz.email
    if not recipient_email:
        return
    context = {
        'quiz_url': quiz.url,
    }
    subject = "Here's your link"
    text_content = render_to_string('leadership_styles/email/leadership_style_request_notification.txt', context)
    html_content = render_to_string('leadership_styles/email/leadership_style_request_notification.html', context)
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

