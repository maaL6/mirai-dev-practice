from django.test import TestCase
from rest_framework.test import APIClient

from apps.identity.models import User


class AuthTestCase(TestCase):
    """Tests for login / logout / me endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.test",
            password="test-password-123",
            username="testuser",
            first_name="Test",
            last_name="User",
            role=User.Role.MEMBER,
        )
        self.locked_user = User.objects.create_user(
            email="locked@example.test",
            password="locked-password-123",
            username="lockeduser",
            is_active=False,
        )

    # ------------------------------------------------------------------
    # 1. Đăng nhập đúng tạo được session
    # ------------------------------------------------------------------
    def test_login_success_creates_session(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "test@example.test", "password": "test-password-123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "test@example.test")
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["role"], "member")
        # Password must never appear in the response
        self.assertNotIn("password", data)
        # Session cookie should be set
        self.assertIn("sessionid", self.client.cookies)

    # ------------------------------------------------------------------
    # 2. Đăng nhập sai trả lỗi rõ ràng
    # ------------------------------------------------------------------
    def test_login_wrong_password_returns_error(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "test@example.test", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login_nonexistent_email_returns_error(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "nobody@example.test", "password": "whatever"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    # ------------------------------------------------------------------
    # 3. Tài khoản bị khóa không đăng nhập được
    # ------------------------------------------------------------------
    def test_login_locked_account_returns_error(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "locked@example.test", "password": "locked-password-123"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    # ------------------------------------------------------------------
    # 4. Người chưa đăng nhập không gọi được API nội bộ
    # ------------------------------------------------------------------
    def test_unauthenticated_cannot_access_me(self):
        response = self.client.get("/api/auth/me/")
        self.assertIn(response.status_code, [401, 403])

    def test_unauthenticated_cannot_access_logout(self):
        response = self.client.post("/api/auth/logout/")
        self.assertIn(response.status_code, [401, 403])

    # ------------------------------------------------------------------
    # 7. Sau khi logout, session cũ không còn dùng được
    # ------------------------------------------------------------------
    def test_logout_invalidates_session(self):
        # Login first
        self.client.post(
            "/api/auth/login/",
            {"email": "test@example.test", "password": "test-password-123"},
            format="json",
        )
        # Verify we can access /me/
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)

        # Logout
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, 200)

        # Session should be invalidated
        response = self.client.get("/api/auth/me/")
        self.assertIn(response.status_code, [401, 403])

    def test_me_returns_user_data(self):
        self.client.post(
            "/api/auth/login/",
            {"email": "test@example.test", "password": "test-password-123"},
            format="json",
        )
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "test@example.test")
        self.assertEqual(data["first_name"], "Test")
        self.assertEqual(data["last_name"], "User")
        self.assertNotIn("password", data)
