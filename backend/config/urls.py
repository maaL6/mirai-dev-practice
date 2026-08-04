from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/crm/", include("apps.crm.urls")),
    path("api/", include("apps.core.urls")),
    path("api/", include("apps.identity.urls")),
]
