# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0006_auto_20151013_1013'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='feedbackrequest',
            name='is_complete',
        ),
    ]
