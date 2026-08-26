import pytest
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    PermissionDenied,
    ValidationError as DRFValidationError,
)
from rest_framework import status
from core.exceptions import custom_exception_handler


class TestCustomExceptionHandler:
    def test_handles_integrity_error(self):
        exc = IntegrityError("duplicate key value violates unique constraint")
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_409_CONFLICT
        assert response.data == {
            "error": {
                "code": "CONFLICT",
                "message": "Conflict — resource already exists.",
            }
        }

    def test_handles_django_validation_error_dict(self):
        exc = DjangoValidationError({"field": ["This field has an error."]})
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "VALIDATION_ERROR"
        assert response.data["error"]["details"] == {"field": ["This field has an error."]}

    def test_handles_django_validation_error_list(self):
        exc = DjangoValidationError(["Global error message."])
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "VALIDATION_ERROR"
        assert response.data["error"]["details"] == ["Global error message."]

    def test_handles_drf_validation_error(self):
        exc = DRFValidationError({"email": ["Enter a valid email address."]})
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "VALIDATION_ERROR"
        assert response.data["error"]["details"] == {"email": ["Enter a valid email address."]}

    def test_handles_authentication_failed(self):
        exc = AuthenticationFailed("Incorrect authentication credentials.")
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"]["code"] == "AUTHENTICATION_REQUIRED"
        assert response.data["error"]["message"] == "Incorrect authentication credentials."

    def test_handles_not_authenticated(self):
        exc = NotAuthenticated()
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"]["code"] == "AUTHENTICATION_REQUIRED"

    def test_handles_permission_denied(self):
        exc = PermissionDenied("You do not have permission to perform this action.")
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.data["error"]["code"] == "PERMISSION_DENIED"

    def test_handles_not_found(self):
        exc = NotFound("Resource not found.")
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"]["code"] == "NOT_FOUND"

    def test_handles_unexpected_internal_exception(self):
        exc = RuntimeError("Unexpected runtime failure!")
        response = custom_exception_handler(exc, context={})

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert response.data == {
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Internal server error.",
            }
        }
