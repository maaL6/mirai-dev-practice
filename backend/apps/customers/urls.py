from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, CustomerViewSet

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"contacts", ContactViewSet, basename="contact")

urlpatterns = router.urls
