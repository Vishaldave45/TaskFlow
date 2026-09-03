from rest_framework.pagination import CursorPagination, LimitOffsetPagination


class TaskCursorPagination(CursorPagination):
    """Cursor-based pagination for global task lists.

    Uses created_at descending for stable, efficient infinite-scroll pagination.
    Cursor pagination is ideal for real-time feeds where items may be inserted
    between pages, since it avoids the duplicate/skip issues of offset pagination.
    """

    page_size = 20
    ordering = "-created_at"
    cursor_query_param = "cursor"


class StandardPagination(LimitOffsetPagination):
    """Limit/offset pagination for project-scoped task lists.

    Simpler than cursor pagination, supports random access, and works well for
    bounded datasets (tasks within a single project).
    """

    default_limit = 20
    max_limit = 100
