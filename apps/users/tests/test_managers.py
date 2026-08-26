import pytest
from apps.users.models import User


@pytest.mark.django_db
class TestUserManager:
    def test_create_user_success(self):
        user = User.objects.create_user(
            email="manager_test@example.com",
            username="manager_user",
            password="SecurePassword123!",
        )
        assert user.email == "manager_test@example.com"
        assert user.username == "manager_user"
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password("SecurePassword123!")

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email="TestUser@EXAMPLE.COM",
            username="test_normalize",
            password="SecurePassword123!",
        )
        assert user.email == "TestUser@example.com"

    def test_create_user_missing_email_raises_value_error(self):
        with pytest.raises(ValueError, match="The email field must be set"):
            User.objects.create_user(
                email="",
                username="no_email_user",
                password="SecurePassword123!",
            )

    def test_create_user_missing_username_raises_value_error(self):
        with pytest.raises(ValueError, match="The Name Field be must be there"):
            User.objects.create_user(
                email="nousername@example.com",
                username="",
                password="SecurePassword123!",
            )

    def test_create_superuser_success(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            username="admin_user",
            password="AdminPassword123!",
        )
        assert admin.email == "admin@example.com"
        assert admin.username == "admin_user"
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.is_active is True
        assert admin.check_password("AdminPassword123!")

    def test_create_superuser_invalid_is_staff_raises_value_error(self):
        with pytest.raises(ValueError, match="superuser must have is_staff=True"):
            User.objects.create_superuser(
                email="bad_admin1@example.com",
                username="bad_admin1",
                password="Password123!",
                is_staff=False,
            )

    def test_create_superuser_invalid_is_superuser_raises_value_error(self):
        with pytest.raises(ValueError, match="superuser must have is_superuser=True"):
            User.objects.create_superuser(
                email="bad_admin2@example.com",
                username="bad_admin2",
                password="Password123!",
                is_superuser=False,
            )
