from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _build_error_response(code: str, message, details=None, http_status=None):
    """Build a standardised error envelope."""
    payload = {
        "error": {
            "code": code,
            "message": str(message) if not isinstance(message, (dict, list)) else message,
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return Response(payload, status=http_status)


def custom_exception_handler(exc, context):
    """
    Wraps every API error in a consistent JSON envelope:
    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "...",
        "details": { ... }
      }
    }
    """
    # Database IntegrityError → 409 Conflict
    if isinstance(exc, IntegrityError):
        return _build_error_response(
            code="CONFLICT",
            message="Conflict — resource already exists.",
            http_status=status.HTTP_409_CONFLICT,
        )

    # Django's own ValidationError (e.g. from model .clean())
    if isinstance(exc, DjangoValidationError):
        return _build_error_response(
            code="VALIDATION_ERROR",
            message="Invalid input.",
            details=exc.message_dict if hasattr(exc, "message_dict") else exc.messages,
            http_status=status.HTTP_400_BAD_REQUEST,
        )

    # Let DRF handle its own exceptions first
    response = exception_handler(exc, context)

    if response is not None:
        # Map DRF status codes to human-readable error codes
        code_map = {
            400: "VALIDATION_ERROR",
            401: "AUTHENTICATION_REQUIRED",
            403: "PERMISSION_DENIED",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
            429: "THROTTLED",
        }
        error_code = code_map.get(response.status_code, "ERROR")

        # DRF returns data in various shapes; normalise into our envelope
        raw = response.data
        if isinstance(raw, dict) and "detail" in raw:
            message = raw["detail"]
            details = None
        elif isinstance(raw, dict):
            message = "Invalid input." if response.status_code == 400 else "An error occurred."
            details = raw
        elif isinstance(raw, list):
            message = raw[0] if raw else "An error occurred."
            details = raw if len(raw) > 1 else None
        else:
            message = str(raw)
            details = None

        response.data = {
            "error": {
                "code": error_code,
                "message": str(message),
            }
        }
        if details is not None:
            response.data["error"]["details"] = details

        return response

    # Unhandled exceptions → 500 without leaking internals
    if getattr(settings, "DEBUG", False):
        raise exc

    return _build_error_response(
        code="INTERNAL_SERVER_ERROR",
        message="Internal server error.",
        http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )