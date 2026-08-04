from django.test import TestCase
from rest_framework.test import APIClient

from apps.identity.models import User


class UserCRUDTestCase(TestCase):
    """Tests for the user management endpoints (Admin-only)."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin@example.test",
            password="admin-password",
            username="admin",
            role=User.Role.ADMIN,
            first_name="System",
            last_name="Admin",
        )
        self.member = User.objects.create_user(
            email="member@example.test",
            password="member-password",
            username="member",
            role=User.Role.MEMBER,
        )
        # Login as admin for most tests.
        self.client.post(
            "/api/auth/login/",
            {"email": "admin@example.test", "password": "admin-password"},
            format="json",
        )

    # ------------------------------------------------------------------
    # 6. Response tạo user không trả lại password
    # ------------------------------------------------------------------
    def test_create_user_response_has_no_password(self):
        response = self.client.post(
            "/api/users/",
            {
                "email": "newuser@example.test",
                "password": "new-user-password-123",
                "username": "newuser",
                "first_name": "New",
                "last_name": "User",
                "role": "member",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertNotIn("password", data)
        self.assertEqual(data["email"], "newuser@example.test")
        self.assertEqual(data["role"], "member")

    def test_create_user_password_is_hashed(self):
        self.client.post(
            "/api/users/",
            {
                "email": "hashed@example.test",
                "password": "plain-text-password",
                "username": "hashed",
            },
            format="json",
        )
        user = User.objects.get(email="hashed@example.test")
        # Password should be hashed, not plain text.
        self.assertNotEqual(user.password, "plain-text-password")
        self.assertTrue(user.check_password("plain-text-password"))

    def test_list_users_returns_all(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data.get("results", data) if isinstance(data, dict) else data
        emails = [u["email"] for u in results]
        self.assertIn("admin@example.test", emails)
        self.assertIn("member@example.test", emails)

    def test_patch_user_updates_fields(self):
        response = self.client.patch(
            f"/api/users/{self.member.pk}/",
            {"first_name": "Patched", "role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.member.refresh_from_db()
        self.assertEqual(self.member.first_name, "Patched")
        self.assertEqual(self.member.role, "manager")

    def test_patch_deactivate_user(self):
        response = self.client.patch(
            f"/api/users/{self.member.pk}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.member.refresh_from_db()
        self.assertFalse(self.member.is_active)

    def test_get_user_detail(self):
        response = self.client.get(f"/api/users/{self.member.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "member@example.test")

    def test_user_str_representation(self):
        self.assertEqual(str(self.admin), "System Admin")
        no_name_user = User.objects.create_user(email="noname@example.test", password="pwd")
        self.assertEqual(str(no_name_user), "noname")

    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email="")

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(email="super@example.test", password="pwd")
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.role, User.Role.ADMIN)

    def test_create_superuser_invalid_flags(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="s1@example.test", password="pwd", is_staff=False
            )
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="s2@example.test", password="pwd", is_superuser=False
            )

