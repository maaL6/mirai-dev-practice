from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class LoginSerializer(serializers.Serializer):
    """Validate email + password and return the authenticated user."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(request=self.context.get("request"), email=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Email hoặc mật khẩu không đúng."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "Tài khoản đã bị khóa."}
            )

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation — never exposes the password."""

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "role")
        read_only_fields = fields


class CreateUserSerializer(serializers.ModelSerializer):
    """Admin-only serializer for creating new users."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "role", "password")
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    """Admin-only serializer for partial updates (PATCH)."""

    class Meta:
        model = User
        fields = ("email", "username", "first_name", "last_name", "role", "is_active")
