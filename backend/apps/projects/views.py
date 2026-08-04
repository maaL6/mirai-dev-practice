from django.db.models import Q
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.customers.models import Customer
from apps.identity.models import User
from apps.identity.permissions import IsManagerOrAdmin

from .models import Project, Task
from .serializers import (
    MemberTaskSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    TaskSerializer,
)


class IsManagerOrAdminPermission(permissions.BasePermission):
    """Only Admin or Manager can create/update Projects."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in (User.Role.ADMIN, User.Role.MANAGER)


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdminPermission]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()

        if user.role in (User.Role.ADMIN, User.Role.MANAGER):
            qs = Project.objects.all()
        else:
            # Member only sees projects with assigned tasks
            qs = Project.objects.filter(tasks__assignee=user).distinct()

        qs = qs.select_related("customer", "manager")

        if self.action == "retrieve":
            qs = qs.prefetch_related("tasks__assignee")

        search = self.request.query_params.get("search", "").strip()
        status_param = self.request.query_params.get("status", "").strip()

        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user

        customer_id = self.request.data.get("customer")
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
                # Member check (shouldn't reach here due to IsManagerOrAdminPermission,
                # but defence-in-depth)
                if user.role == User.Role.MEMBER and customer.owner != user:
                    self.permission_denied(
                        self.request, message="Invalid customer selection.",
                    )
            except Customer.DoesNotExist as err:
                raise serializers.ValidationError(
                    {"customer": "Customer does not exist."},
                ) from err

        serializer.save(manager=user)

    def perform_update(self, serializer):
        user = self.request.user
        # self.get_object() was already called by UpdateModelMixin — use serializer.instance
        project = serializer.instance

        if user.role == User.Role.MANAGER and project.manager != user:
            self.permission_denied(
                self.request,
                message="Manager cannot edit another manager's project.",
            )

        serializer.save()

    @action(detail=True, methods=["get", "post"])
    def tasks(self, request, pk=None):
        project = self.get_object()

        if request.method == "GET":
            user = request.user
            if user.role == User.Role.MEMBER:
                tasks = project.tasks.filter(assignee=user)
            else:
                tasks = project.tasks.select_related("assignee").all()
            task_serializer = TaskSerializer(tasks, many=True)
            return Response(task_serializer.data)

        elif request.method == "POST":
            if request.user.role not in (User.Role.ADMIN, User.Role.MANAGER):
                return Response(
                    {"detail": "Member cannot create tasks."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            task_serializer = TaskSerializer(data=request.data)
            if task_serializer.is_valid():
                task_serializer.save(project=project)
                return Response(task_serializer.data, status=status.HTTP_201_CREATED)
            return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.request.user.role == User.Role.MEMBER and self.action in (
            "partial_update",
            "update",
        ):
            return MemberTaskSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()

        if user.role in (User.Role.ADMIN, User.Role.MANAGER):
            return Task.objects.select_related("project", "assignee").all()

        return Task.objects.select_related("project", "assignee").filter(assignee=user)

    def perform_update(self, serializer):
        user = self.request.user
        task = serializer.instance

        if user.role == User.Role.MEMBER:
            if task.assignee != user:
                self.permission_denied(
                    self.request,
                    message="You can only update your assigned tasks.",
                )

        serializer.save()
