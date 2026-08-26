import django_filters
from .models import Task, TaskPriority, TaskStatus


class TaskFilter(django_filters.FilterSet):
    """
    Supported query parameters:
      ?status=TODO|IN_PROGRESS|DONE
      ?priority=LOW|MEDIUM|HIGH
      ?assignee=<user_id>
      ?assignee_email=<email>
      ?due_date=YYYY-MM-DD          (exact match)
      ?due_date_after=YYYY-MM-DD    (due_date >= value)
      ?due_date_before=YYYY-MM-DD   (due_date <= value)
      ?search=<keyword>             (title or description contains keyword)
      ?ordering=created_at|-created_at|due_date|-due_date|priority|-priority
    """
    status = django_filters.ChoiceFilter(choices=TaskStatus.choices)
    priority = django_filters.ChoiceFilter(choices=TaskPriority.choices)
    assignee = django_filters.NumberFilter(field_name="assignee__id")
    assignee_email = django_filters.CharFilter(
        field_name="assignee__email", lookup_expr="iexact"
    )
    due_date = django_filters.DateFilter(field_name="due_date")
    due_date_after = django_filters.DateFilter(field_name="due_date", lookup_expr="gte")
    due_date_before = django_filters.DateFilter(field_name="due_date", lookup_expr="lte")
    search = django_filters.CharFilter(method="filter_search")
    ordering = django_filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("due_date", "due_date"),
            ("priority", "priority"),
        ),
    )

    class Meta:
        model = Task
        fields = [
            "status", "priority", "assignee", "assignee_email",
            "due_date", "due_date_after", "due_date_before",
        ]

    def filter_search(self, queryset, name, value):
        """Search in title and description (case-insensitive)."""
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
