from rest_framework import serializers
from apps.identity.serializers import UserSerializer
from .models import Contact, Customer


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            "id",
            "customer",
            "name",
            "job_title",
            "email",
            "phone",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "customer", "created_at", "updated_at"]


class CustomerSerializer(serializers.ModelSerializer):
    owner_detail = UserSerializer(source="owner", read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "kind",
            "email",
            "phone",
            "owner",
            "owner_detail",
            "is_active",
            "contacts",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Customer name is required.")
        return value.strip()
