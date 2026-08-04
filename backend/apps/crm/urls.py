from rest_framework.routers import DefaultRouter
from .views import StageViewSet, OpportunityViewSet

router = DefaultRouter()
router.register(r'stages', StageViewSet, basename='stage')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')

urlpatterns = router.urls
