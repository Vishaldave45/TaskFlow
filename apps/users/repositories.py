from typing import Optional
from .models import User


class UserRepository:
    def get_by_id(self, user_id: int) -> Optional[User]:
        return User.objects.filter(id=user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return User.objects.filter(email__iexact=email).first()

    def exists_by_email(self, email: str) -> bool:
        return User.objects.filter(email__iexact=email).exists()

    def create_user(self, email: str, username: str, password: str, **extra_fields) -> User:
        return User.objects.create_user(
            email=email,
            username=username,
            password=password,
            **extra_fields,
        )
