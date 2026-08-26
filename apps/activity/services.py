from typing import Any, Dict, Optional
from django.db.models import QuerySet

from apps.tasks.models import Task
from apps.users.models import User
from .models import ActivityAction, ActivityLog


class ActivityService:
    @staticmethod
    def log(
        *,
        task: Task,
        user: User,
        action: str | ActivityAction,
        details: Optional[Dict[str, Any]] = None,
    ) -> ActivityLog:
        return ActivityLog.objects.create(
            task=task,
            user=user,
            action=action,
            details=details or {},
        )

    @staticmethod
    def list_for_task(task_id: int) -> QuerySet[ActivityLog]:
        return ActivityLog.objects.filter(task_id=task_id).select_related("user").order_by("-created_at")
