from django.test import TestCase
from rest_framework.test import APIClient

from apps.identity.models import User
from apps.identity.permissions import is_owner_or_assignee


class PermissionClassesTestCase(TestCase):
    """Unit tests for IsAdmin, IsManagerOrAdmin, is_owner_or_assignee."""

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.test",
            password="test-password",
            username="admin",
            role=User.Role.ADMIN,
        )
        self.manager = User.objects.create_user(
            email="manager@example.test",
            password="test-password",
            username="manager",
            role=User.Role.MANAGER,
        )
        self.member = User.objects.create_user(
            email="member@example.test",
            password="test-password",
            username="member",
            role=User.Role.MEMBER,
        )

    # ------------------------------------------------------------------
    # 5. Member không gọi được API quản lý user
    # ------------------------------------------------------------------
    def test_member_cannot_list_users(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "member@example.test", "password": "test-password"},
            format="json",
        )
        response = client.get("/api/users/")
        self.assertEqual(response.status_code, 403)

    def test_member_cannot_create_user(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "member@example.test", "password": "test-password"},
            format="json",
        )
        response = client.post(
            "/api/users/",
            {"email": "new@example.test", "password": "new-password-123", "username": "new"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_manager_cannot_list_users(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "manager@example.test", "password": "test-password"},
            format="json",
        )
        response = client.get("/api/users/")
        self.assertEqual(response.status_code, 403)

    def test_admin_can_list_users(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "admin@example.test", "password": "test-password"},
            format="json",
        )
        response = client.get("/api/users/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_admin_can_create_user(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "admin@example.test", "password": "test-password"},
            format="json",
        )
        response = client.post(
            "/api/users/",
            {
                "email": "created@example.test",
                "password": "created-password-123",
                "username": "created",
                "first_name": "Created",
                "last_name": "User",
                "role": "member",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_admin_can_patch_user(self):
        client = APIClient()
        client.post(
            "/api/auth/login/",
            {"email": "admin@example.test", "password": "test-password"},
            format="json",
        )
        response = client.patch(
            f"/api/users/{self.member.pk}/",
            {"first_name": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.member.refresh_from_db()
        self.assertEqual(self.member.first_name, "Updated")


class OwnerAssigneeHelperTestCase(TestCase):
    """Tests for the is_owner_or_assignee helper."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@example.test", password="pw", username="owner"
        )
        self.other = User.objects.create_user(
            email="other@example.test", password="pw", username="other"
        )

    def test_owner_returns_true(self):
        class FakeObj:
            owner = None
        obj = FakeObj()
        obj.owner = self.user
        self.assertTrue(is_owner_or_assignee(self.user, obj))

    def test_assignee_returns_true(self):
        class FakeObj:
            assignee = None
        obj = FakeObj()
        obj.assignee = self.user
        self.assertTrue(is_owner_or_assignee(self.user, obj))

    def test_non_owner_returns_false(self):
        class FakeObj:
            owner = None
        obj = FakeObj()
        obj.owner = self.other
        self.assertFalse(is_owner_or_assignee(self.user, obj))

    def test_no_attrs_returns_false(self):
        class FakeObj:
            pass
        self.assertFalse(is_owner_or_assignee(self.user, FakeObj()))
