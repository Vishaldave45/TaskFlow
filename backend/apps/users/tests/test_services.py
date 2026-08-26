import pytest
from apps.users.models import User
from apps.users.repositories import UserRepository
from apps.users.services import UserService, AuthService


@pytest.mark.django_db
class TestUserServiceAndRepository:
    def test_user_repository_create_and_get(self):
        repo = UserRepository()
        user = repo.create_user(
            email="repo_user@example.com",
            username="repo_user",
            password="Password123!",
        )

        assert user.id is not None
        assert repo.exists_by_email("repo_user@example.com") is True
        assert repo.exists_by_email("unknown@example.com") is False

        fetched = repo.get_by_email("REPO_USER@example.com")  # case-insensitive check
        assert fetched is not None
        assert fetched.id == user.id

        by_id = repo.get_by_id(user.id)
        assert by_id is not None
        assert by_id.email == user.email

    def test_user_service_registration(self):
        service = UserService()
        user = service.register_user(
            email="service_user@example.com",
            username="service_user",
            password="Password123!",
        )

        assert isinstance(user, User)
        assert user.email == "service_user@example.com"
        assert user.check_password("Password123!") is True

    def test_auth_service_login_returns_tokens(self):
        user = User.objects.create_user(
            email="token_user@example.com",
            username="token_user",
            password="Password123!",
        )

        tokens = AuthService.login_user(user)
        assert "access" in tokens
        assert "refresh" in tokens
