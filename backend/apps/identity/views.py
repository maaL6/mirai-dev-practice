from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdmin
from .serializers import (
    CreateUserSerializer,
    LoginSerializer,
    UpdateUserSerializer,
    UserSerializer,
)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(APIView):
    """POST /api/auth/login/ — authenticate with email + password."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/auth/logout/ — destroy the current session."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Đã đăng xuất."}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(APIView):
    """GET /api/auth/me/ — return the currently authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListCreateView(generics.ListCreateAPIView):
    """GET / POST  /api/users/ — Admin only."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all().order_by("email")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateUserSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateAPIView):
    """GET / PATCH  /api/users/{id}/ — Admin only."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    lookup_field = "pk"
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UpdateUserSerializer
        return UserSerializer
