from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.customers.urls")),
    path("api/", include("apps.products.urls")),
    path("api/", include("apps.projects.urls")),
    path("api/crm/", include("apps.crm.urls")),
    path("api/", include("apps.core.urls")),
    path("api/", include("apps.identity.urls")),
]
