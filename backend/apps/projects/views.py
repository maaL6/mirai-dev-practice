from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.customers.models import Customer
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()

        if user.role in ["admin", "manager"]:
            qs = Project.objects.all()
        else:
            # Member only sees projects with assigned tasks
            qs = Project.objects.filter(tasks__assignee=user).distinct()

        search = self.request.query_params.get("search", "").strip()
        status_param = self.request.query_params.get("status", "").strip()

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ["admin", "manager"]:
            self.permission_denied(self.request, message="Member cannot create projects.")

        customer_id = self.request.data.get("customer")
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
                # Verify customer access
                if user.role == "member" and customer.owner != user:
                    self.permission_denied(self.request, message="Invalid customer selection.")
            except Customer.DoesNotExist:
                raise serializers.ValidationError({"customer": "Customer does not exist."})

        serializer.save(manager=user)

    def perform_update(self, serializer):
        user = self.request.user
        project = self.get_object()

        if user.role not in ["admin", "manager"]:
            self.permission_denied(self.request, message="Member cannot edit projects.")

        if user.role == "manager" and project.manager != user and user.role != "admin":
            self.permission_denied(self.request, message="Manager cannot edit another manager's project.")

        serializer.save()

    @action(detail=True, methods=["get", "post"])
    def tasks(self, request, pk=None):
        project = self.get_object()

        if request.method == "GET":
            user = request.user
            if user.role == "member":
                tasks = project.tasks.filter(assignee=user)
            else:
                tasks = project.tasks.all()
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            if request.user.role not in ["admin", "manager"]:
                return Response(
                    {"detail": "Member cannot create tasks."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = TaskSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()

        if user.role in ["admin", "manager"]:
            return Task.objects.all()

        return Task.objects.filter(assignee=user)

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()

        if user.role == "member":
            if task.assignee != user:
                self.permission_denied(self.request, message="You can only update your assigned tasks.")

            # Member can ONLY update status
            new_status = serializer.validated_data.get("status", task.status)
            serializer.save(
                status=new_status,
                title=task.title,
                assignee=task.assignee,
                project=task.project,
                due_date=task.due_date,
                description=task.description,
            )
        else:
            serializer.save()
