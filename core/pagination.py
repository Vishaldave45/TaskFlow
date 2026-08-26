from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    Default pagination for all list endpoints.
    Supports client-controlled page size via ?page_size=N (max 100).

    Response shape:
    {
        "count": 42,
        "next": "http://.../api/v1/tasks/?page=2",
        "previous": null,
        "results": [ ... ]
    }
    """
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
