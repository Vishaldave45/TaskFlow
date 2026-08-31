import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404

logger = logging.getLogger('taskflow')

def custom_exception_handler(exc, context):
    """
    Standardized DRF Exception Handler.
    Returns consistent { "error": { "code": "...", "message": "...", "details": {...} } }
    Sanitizes internal server exceptions while logging structured debugging information.
    """
    request = context.get('request')
    request_id = getattr(request, 'id', 'N/A') if request else 'N/A'
    user_id = request.user.id if request and getattr(request, 'user', None) and request.user.is_authenticated else 'Anon'

    response = exception_handler(exc, context)

    if response is not None:
        error_code = "VALIDATION_ERROR"
        message = "A validation error occurred."
        details = response.data

        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "AUTHENTICATION_FAILED"
            message = "Authentication credentials were not provided or are invalid."
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "PERMISSION_DENIED"
            message = "You do not have permission to perform this action."
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "NOT_FOUND"
            message = "The requested resource was not found."
        elif response.status_code == status.HTTP_409_CONFLICT:
            error_code = "CONFLICT"
            message = "A conflict occurred with existing resource state."

        # If standard detail string was returned
        if isinstance(details, dict) and 'detail' in details:
            message = str(details['detail'])
            details = None

        response.data = {
            "error": {
                "code": error_code,
                "message": message,
                "details": details,
                "request_id": request_id,
            }
        }
        return response

    # Unhandled Internal Server Errors (500)
    logger.error(
        f"[Internal Server Error] request_id={request_id} user_id={user_id} "
        f"method={getattr(request, 'method', 'UNKNOWN')} path={getattr(request, 'path', 'UNKNOWN')} "
        f"exc={exc}",
        exc_info=True,
    )

    return Response(
        {
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred. Please contact support with your Request ID.",
                "request_id": request_id,
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
