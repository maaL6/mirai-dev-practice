from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.identity.permissions import IsManagerOrAdmin
from .models import Product
from .serializers import ProductSerializer


class IsManagerOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ["admin", "manager"]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]

    def get_queryset(self):
        qs = Product.objects.all()

        search = self.request.query_params.get("search", "").strip()
        active = self.request.query_params.get("is_active") or self.request.query_params.get("active")

        if search:
            qs = qs.filter(
                Q(sku__icontains=search) | Q(name__icontains=search) | Q(description__icontains=search)
            )

        if active is not None and active != "":
            is_active_bool = str(active).lower() in ["true", "1"]
            qs = qs.filter(is_active=is_active_bool)

        return qs.order_by("sku")

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsManagerOrAdmin])
    def deactivate(self, request, pk=None):
        product = self.get_object()
        product.is_active = False
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
