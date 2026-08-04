from rest_framework import serializers

from apps.customers.models import Contact, Customer
from apps.identity.models import User

from .models import Opportunity, Stage


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ['id', 'name', 'order', 'is_active']
        read_only_fields = ['id']


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'expected_revenue', 'customer',
            'contact', 'stage', 'owner', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'owner': {'required': False},
        }

    def validate_expected_revenue(self, value):
        if value < 0:
            raise serializers.ValidationError("Expected revenue cannot be negative.")
        return value

    def validate_stage(self, value):
        if self.instance and self.instance.stage != value:
            if value.name in ['Won', 'Lost']:
                msg = "Cannot transition to Won/Lost via regular update."
                raise serializers.ValidationError(msg)
        return value

    def validate(self, attrs):
        request = self.context.get('request')

        # --- Owner constraints ------------------------------------------------
        if request:
            user = request.user
            owner_in_payload = attrs.get('owner')

            if user.role == User.Role.MEMBER:
                # Member cannot assign to someone else
                if owner_in_payload and owner_in_payload != user:
                    raise serializers.ValidationError(
                        {"owner": "You can only assign opportunities to yourself."}
                    )
            elif user.role == User.Role.MANAGER:
                # Manager: on update, cannot change owner of someone else's opportunity
                if self.instance and self.instance.owner != user:
                    if owner_in_payload and owner_in_payload != self.instance.owner:
                        raise serializers.ValidationError(
                            {"owner": "You do not have permission to change the owner."}
                        )

        # --- Contact must belong to Customer ----------------------------------
        customer = attrs.get('customer') or (self.instance and self.instance.customer)
        contact = attrs.get('contact')

        if contact is not None and customer is not None:
            if contact.customer_id != customer.id:
                raise serializers.ValidationError(
                    {"contact": "Contact does not belong to the selected Customer."}
                )

        return attrs
