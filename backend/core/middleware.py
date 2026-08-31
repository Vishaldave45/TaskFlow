import uuid

class RequestIDMiddleware:
    """
    Middleware that ensures every incoming HTTP request has a unique Request ID.
    Attaches request.id and sends it back in the 'X-Request-ID' response header.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        request.id = request_id

        response = self.get_response(request)
        response['X-Request-ID'] = request_id
        return response
