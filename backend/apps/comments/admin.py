from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "author", "created_at", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("content", "author__email", "author__username")
    raw_id_fields = ("task", "author")
