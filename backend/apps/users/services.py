from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User
from .repositories import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository | None = None):
        self.user_repository = user_repository or UserRepository()

    def register_user(self, email: str, username: str, password: str) -> User:
        return self.user_repository.create_user(
            email=email,
            username=username,
            password=password,
        )


class AuthService:
    @staticmethod
    def login_user(user: User) -> dict:
        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def logout_user(refresh_token: str) -> None:
        token = RefreshToken(refresh_token)
        token.blacklist()

