from rest_framework import permissions, viewsets

from apps.identity.models import User

from .models import Opportunity, Stage
from .serializers import OpportunitySerializer, StageSerializer


class StageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    permission_classes = [permissions.IsAuthenticated]


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.ADMIN:
            qs = Opportunity.objects.all()
        elif user.role == User.Role.MANAGER:
            # Manager sees all opportunities (temporary team scope rule)
            qs = Opportunity.objects.all()
        else:
            qs = Opportunity.objects.filter(owner=user)

        qs = qs.select_related("customer", "contact", "stage", "owner")

        # Filters
        stage = self.request.query_params.get('stage')
        if stage:
            qs = qs.filter(stage_id=stage)

        customer_id = self.request.query_params.get('customer')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        owner_id = self.request.query_params.get('owner')
        if owner_id:
            qs = qs.filter(owner_id=owner_id)

        return qs

    def perform_create(self, serializer):
        # Always force owner to current user for non-admin
        user = self.request.user
        if user.role != User.Role.ADMIN:
            serializer.save(owner=user)
        else:
            # Admin can specify owner; default to self if not provided
            if 'owner' not in self.request.data:
                serializer.save(owner=user)
            else:
                serializer.save()
