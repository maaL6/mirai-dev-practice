from rest_framework import permissions, viewsets

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
        if user.role == 'admin':
            qs = Opportunity.objects.all()
        else:
            qs = Opportunity.objects.filter(owner=user)
            
        stage = self.request.query_params.get('stage')
        if stage:
            qs = qs.filter(stage_id=stage)
            
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
            
        return qs
        
    def perform_create(self, serializer):
        user = self.request.user
        if 'owner' not in self.request.data:
            serializer.save(owner=user)
        else:
            serializer.save()
