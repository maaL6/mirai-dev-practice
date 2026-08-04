# Generated manually — convert CRM Opportunity from plain UUIDs to ForeignKeys

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("crm", "0001_initial"),
        ("customers", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 1. Remove old UUID fields
        migrations.RemoveField(
            model_name="opportunity",
            name="customer_id",
        ),
        migrations.RemoveField(
            model_name="opportunity",
            name="contact_id",
        ),
        # 2. Add customer FK — nullable first, then we'd backfill & make non-null
        #    For dev purposes, since no prod data exists, add as nullable then alter
        migrations.AddField(
            model_name="opportunity",
            name="customer",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="opportunities",
                to="customers.customer",
                null=True,
            ),
        ),
        # 3. Make customer non-nullable (any existing rows without customer will fail)
        migrations.AlterField(
            model_name="opportunity",
            name="customer",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="opportunities",
                to="customers.customer",
            ),
        ),
        # 4. Add contact FK (nullable)
        migrations.AddField(
            model_name="opportunity",
            name="contact",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="opportunities",
                to="customers.contact",
            ),
        ),
        # 5. Add unique constraint to Stage.name
        migrations.AlterField(
            model_name="stage",
            name="name",
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
