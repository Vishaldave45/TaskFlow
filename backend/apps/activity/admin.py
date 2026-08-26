from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "user", "action", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("user__email", "user__username", "task__title")
    raw_id_fields = ("task", "user")
