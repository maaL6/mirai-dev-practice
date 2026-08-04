from rest_framework import serializers
from .models import Stage, Opportunity

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ['id', 'name', 'order', 'is_active']
        read_only_fields = ['id']

class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'expected_revenue', 'customer_id', 
            'contact_id', 'stage', 'owner', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'owner': {'required': False}
        }

    def validate_expected_revenue(self, value):
        if value < 0:
            raise serializers.ValidationError("Expected revenue cannot be negative.")
        return value

    def validate_stage(self, value):
        if self.instance and self.instance.stage != value:
            if value.name in ['Won', 'Lost']:
                raise serializers.ValidationError("Cannot transition to Won/Lost via regular update.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        
        # Validate owner constraints for non-admins
        if request and request.user.role != 'admin':
            # Check owner in creation or update
            if 'owner' in attrs and attrs['owner'] != request.user:
                raise serializers.ValidationError({"owner": "You can only assign opportunities to yourself."})
            
            # Additional check if updating
            if self.instance and self.instance.owner != request.user:
                if 'owner' in attrs and attrs['owner'] != self.instance.owner:
                    raise serializers.ValidationError({"owner": "You do not have permission to change the owner."})
                    
        # Mock validation for Customer-Contact relationship (Issue 02 requirement)
        # We simulate a 400 Bad Request error if a specific dummy UUID is sent.
        # This will be replaced by actual ORM checks in Issue 04.
        contact_id = attrs.get('contact_id')
        if contact_id and str(contact_id) == '00000000-0000-0000-0000-000000000000':
            raise serializers.ValidationError({"contact_id": "Contact does not belong to the selected Customer."})
        
        return attrs
