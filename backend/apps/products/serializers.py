from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    unit_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, coerce_to_string=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "description",
            "unit_price",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_sku(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("SKU is required.")
        upper_sku = value.strip().upper()
        # Check uniqueness ignoring case
        qs = Product.objects.filter(sku__iexact=upper_sku)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A product with this SKU already exists.")
        return upper_sku

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative.")
        return value
