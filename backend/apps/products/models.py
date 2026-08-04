import uuid

from django.core.exceptions import ValidationError
from django.db import models


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sku"]

    def __str__(self):
        return f"[{self.sku}] {self.name}"

    def save(self, *args, **kwargs):
        if self.sku:
            self.sku = self.sku.upper().strip()
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        if self.sku:
            qs = Product.objects.filter(sku__iexact=self.sku)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.exists():
                raise ValidationError({"sku": "A product with this SKU already exists."})

        if self.unit_price is not None and self.unit_price < 0:
            raise ValidationError({"unit_price": "Unit price cannot be negative."})
