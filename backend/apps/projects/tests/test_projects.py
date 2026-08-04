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
        self.outsider = User.objects.create_user(
            username="outsider",
            email="outsider@example.test",
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

    # ------------------------------------------------------------------
    # Existing tests
    # ------------------------------------------------------------------

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
        task_url = f"/api/tasks/{self.task.id}/"
        res_reopen = self.client.patch(task_url, {"status": "in_progress"}, format="json")
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
        proj_url = f"/api/projects/{self.project.id}/"
        res = self.client.patch(proj_url, {"name": "Hacked Name"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # NEW: Member only sees Projects with assigned Tasks
    # ------------------------------------------------------------------

    def test_member_sees_only_projects_with_assigned_tasks(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.get("/api/projects/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        project_ids = [p["id"] for p in results]
        self.assertIn(str(self.project.id), project_ids)

    def test_outsider_sees_no_projects(self):
        """Member with no assigned tasks sees empty list."""
        self.client.force_authenticate(user=self.outsider)
        res = self.client.get("/api/projects/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 0)

    # ------------------------------------------------------------------
    # NEW: Member cannot reassign task
    # ------------------------------------------------------------------

    def test_member_cannot_change_task_assignee(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"assignee": str(self.manager1.id)},
            format="json",
        )
        # MemberTaskSerializer only has 'status' field, so 'assignee' is ignored
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.assignee, self.member)

    # ------------------------------------------------------------------
    # NEW: Non-existent customer rejected
    # ------------------------------------------------------------------

    def test_create_project_with_nonexistent_customer_rejected(self):
        self.client.force_authenticate(user=self.manager1)
        data = {
            "name": "Ghost Project",
            "customer": "00000000-0000-0000-0000-000000000000",
            "start_date": "2026-08-01",
            "due_date": "2026-08-30",
        }
        res = self.client.post("/api/projects/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # NEW: Member cannot update other member's task
    # ------------------------------------------------------------------

    def test_member_cannot_update_unassigned_task(self):
        """Member cannot update a task not assigned to them (returns 404 via queryset filtering)."""
        self.client.force_authenticate(user=self.outsider)
        res = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"status": "done"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
