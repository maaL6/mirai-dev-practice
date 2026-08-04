import datetime
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.customers.models import Customer
from apps.projects.models import Project, Task

User = get_user_model()


class ProjectApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.test",
            password="password123",
            role="admin",
        )
        self.manager1 = User.objects.create_user(
            username="manager1",
            email="manager1@example.test",
            password="password123",
            role="manager",
        )
        self.manager2 = User.objects.create_user(
            username="manager2",
            email="manager2@example.test",
            password="password123",
            role="manager",
        )
        self.member = User.objects.create_user(
            username="lan",
            email="lan@example.test",
            password="password123",
            role="member",
        )

        self.customer = Customer.objects.create(
            name="Acme Ltd",
            email="contact@acme.com",
            owner=self.admin,
        )

        self.project = Project.objects.create(
            name="ERP Implementation",
            customer=self.customer,
            manager=self.manager1,
            start_date=datetime.date(2026, 8, 1),
            due_date=datetime.date(2026, 8, 30),
        )

        self.task = Task.objects.create(
            project=self.project,
            title="Setup database",
            assignee=self.member,
            status="todo",
        )

        self.client = APIClient()

    def test_due_date_before_start_date_rejected(self):
        self.client.force_authenticate(user=self.manager1)
        data = {
            "name": "Invalid Project",
            "customer": str(self.customer.id),
            "start_date": "2026-08-30",
            "due_date": "2026-08-01",  # due_date before start_date
        }
        res = self.client.post("/api/projects/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("due_date", res.data)

    def test_task_completed_at_auto_set_and_cleared(self):
        self.client.force_authenticate(user=self.member)
        self.assertIsNone(self.task.completed_at)

        # Move to done
        res = self.client.patch(f"/api/tasks/{self.task.id}/", {"status": "done"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertIsNotNone(self.task.completed_at)

        # Move back to in_progress
        res_reopen = self.client.patch(f"/api/tasks/{self.task.id}/", {"status": "in_progress"}, format="json")
        self.assertEqual(res_reopen.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertIsNone(self.task.completed_at)

    def test_member_cannot_create_project_or_reassign_task(self):
        self.client.force_authenticate(user=self.member)
        data = {
            "name": "Member Project",
            "customer": str(self.customer.id),
            "start_date": "2026-08-01",
            "due_date": "2026-08-30",
        }
        res = self.client.post("/api/projects/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_cannot_edit_other_manager_project(self):
        self.client.force_authenticate(user=self.manager2)
        res = self.client.patch(f"/api/projects/{self.project.id}/", {"name": "Hacked Name"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
