import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models


class Stage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Opportunity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    expected_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # TV2 is working on contacts app, so we use UUIDField temporarily to avoid migration conflicts.
    # TODO: Change to ForeignKey('contacts.Customer', ...) and ForeignKey('contacts.Contact', ...)
    customer_id = models.UUIDField()
    contact_id = models.UUIDField(null=True, blank=True)
    
    stage = models.ForeignKey(Stage, on_delete=models.PROTECT, related_name='opportunities')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='opportunities'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
