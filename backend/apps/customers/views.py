from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.identity.models import User

from .models import Contact, Customer
from .permissions import IsCustomerOwnerOrManagerOrAdmin
from .serializers import ContactSerializer, CustomerDetailSerializer, CustomerListSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated,
        IsCustomerOwnerOrManagerOrAdmin,
    ]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CustomerDetailSerializer
        return CustomerListSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Customer.objects.none()

        if user.role in (User.Role.ADMIN, User.Role.MANAGER):
            qs = Customer.objects.all()
        else:
            qs = Customer.objects.filter(owner=user)

        qs = qs.select_related("owner")

        # Prefetch contacts only for detail view
        if self.action == "retrieve":
            qs = qs.prefetch_related("contacts")

        # Filters
        search = self.request.query_params.get("search", "").strip()
        kind = self.request.query_params.get("kind", "").strip()
        params = self.request.query_params
        active = params.get("is_active") or params.get("active")

        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(contacts__name__icontains=search)
                | Q(contacts__email__icontains=search)
                | Q(contacts__phone__icontains=search)
            ).distinct()

        if kind:
            qs = qs.filter(kind=kind)

        if active is not None and active != "":
            is_active_bool = str(active).lower() in ("true", "1")
            qs = qs.filter(is_active=is_active_bool)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        # Force owner to be current user
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        # Only Admin/Manager can change owner
        if user.role not in (User.Role.ADMIN, User.Role.MANAGER):
            serializer.save(owner=user)
        else:
            # Validate that owner exists if provided
            owner_id = self.request.data.get("owner")
            if owner_id:
                if not User.objects.filter(pk=owner_id).exists():
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"owner": "Specified owner does not exist."})
            serializer.save()

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        customer = self.get_object()
        customer.is_active = False
        customer.save(update_fields=["is_active", "updated_at"])
        serializer = self.get_serializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get", "post"])
    def contacts(self, request, pk=None):
        customer = self.get_object()
        if request.method == "GET":
            contacts = customer.contacts.all()
            serializer = ContactSerializer(contacts, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            serializer = ContactSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(customer=customer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsCustomerOwnerOrManagerOrAdmin,
    ]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Contact.objects.none()

        if user.role in (User.Role.ADMIN, User.Role.MANAGER):
            return Contact.objects.select_related("customer__owner").all()

        return Contact.objects.select_related("customer__owner").filter(
            customer__owner=user,
        )
