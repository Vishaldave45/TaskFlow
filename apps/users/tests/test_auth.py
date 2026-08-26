import pytest
from rest_framework.test import APIClient
from apps.users.models import User


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_user_success(self):
        client = APIClient()
        payload = {
            "email": "developer@example.com",
            "username": "developer",
            "password": "StrongPassword123!",
        }

        response = client.post("/api/v1/auth/register/", payload, format="json")

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == payload["email"]
        assert data["username"] == payload["username"]
        assert "id" in data
        assert "password" not in data

        user = User.objects.get(email=payload["email"])
        assert user.check_password(payload["password"]) is True

    def test_register_duplicate_email(self):
        client = APIClient()
        User.objects.create_user(
            email="developer@example.com",
            username="dev1",
            password="StrongPassword123!",
        )

        payload = {
            "email": "developer@example.com",
            "username": "dev2",
            "password": "StrongPassword123!",
        }

        response = client.post("/api/v1/auth/register/", payload, format="json")

        assert response.status_code == 400
        assert "email" in response.json().get("error", {}).get("details", {})

    def test_register_short_password(self):
        client = APIClient()
        payload = {
            "email": "short@example.com",
            "username": "shortpass",
            "password": "short",
        }

        response = client.post("/api/v1/auth/register/", payload, format="json")

        assert response.status_code == 400
        assert "password" in response.json().get("error", {}).get("details", {})


@pytest.mark.django_db
class TestUserAuthentication:
    @pytest.fixture(autouse=True)
    def setup_user(self):
        self.user = User.objects.create_user(
            email="auth_user@example.com",
            username="auth_user",
            password="SecurePassword123!",
        )
        self.client = APIClient()

    def test_login_success(self):
        payload = {
            "email": "auth_user@example.com",
            "password": "SecurePassword123!",
        }

        response = self.client.post("/api/v1/auth/login/", payload, format="json")

        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_login_invalid_password(self):
        payload = {
            "email": "auth_user@example.com",
            "password": "WrongPassword!",
        }

        response = self.client.post("/api/v1/auth/login/", payload, format="json")

        assert response.status_code == 400

    def test_login_nonexistent_user(self):
        payload = {
            "email": "nonexistent@example.com",
            "password": "SecurePassword123!",
        }

        response = self.client.post("/api/v1/auth/login/", payload, format="json")

        assert response.status_code == 400

    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/auth/me/")

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.user.email
        assert data["username"] == self.user.username
        assert data["id"] == self.user.id

    def test_me_unauthenticated(self):
        response = self.client.get("/api/v1/auth/me/")

        assert response.status_code == 401

    def test_token_refresh(self):
        login_resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "auth_user@example.com", "password": "SecurePassword123!"},
            format="json",
        )
        refresh_token = login_resp.json()["refresh"]

        refresh_resp = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )

        assert refresh_resp.status_code == 200
        assert "access" in refresh_resp.json()

    def test_logout_blacklists_refresh_token(self):
        login_resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "auth_user@example.com", "password": "SecurePassword123!"},
            format="json",
        )
        access_token = login_resp.json()["access"]
        refresh_token = login_resp.json()["refresh"]

        # Call logout with authorization header and refresh token in body
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_resp = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": refresh_token},
            format="json",
        )

        assert logout_resp.status_code == 204

        # Verify that attempting to use the blacklisted refresh token now fails
        self.client.credentials()  # clear headers
        refresh_attempt = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )

        assert refresh_attempt.status_code == 401
