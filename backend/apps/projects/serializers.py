from rest_framework import serializers

from apps.customers.serializers import CustomerListSerializer
from apps.identity.serializers import UserSerializer

from .models import Project, Task


class TaskSerializer(serializers.ModelSerializer):
    assignee_detail = UserSerializer(source="assignee", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "assignee",
            "assignee_detail",
            "status",
            "position",
            "due_date",
            "description",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project", "completed_at", "created_at", "updated_at"]


class MemberTaskSerializer(serializers.ModelSerializer):
    """Restricted serializer — Members can only update status."""

    class Meta:
        model = Task
        fields = ["id", "status", "completed_at", "created_at", "updated_at"]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — no nested tasks."""

    customer_detail = CustomerListSerializer(source="customer", read_only=True)
    manager_detail = UserSerializer(source="manager", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "customer",
            "customer_detail",
            "manager",
            "manager_detail",
            "status",
            "start_date",
            "due_date",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "manager", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get("start_date") or (self.instance and self.instance.start_date)
        due_date = attrs.get("due_date") or (self.instance and self.instance.due_date)

        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError(
                {"due_date": "Project due date cannot be before start date."}
            )
        return attrs


class ProjectDetailSerializer(ProjectListSerializer):
    """Detail serializer — includes nested tasks."""

    tasks = TaskSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + ["tasks"]
