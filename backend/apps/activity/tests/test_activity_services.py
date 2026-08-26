import pytest

from apps.activity.models import ActivityAction, ActivityLog
from apps.activity.services import ActivityService
from apps.projects.services import ProjectService
from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import TaskService
from apps.users.models import User


@pytest.mark.django_db
class TestActivityService:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.project_service = ProjectService()
        self.project = self.project_service.create_project(
            name="Activity Tracking Project", owner=self.owner
        )
        self.project_service.add_member(project=self.project, user=self.member)
        self.task_service = TaskService()

    def test_task_creation_generates_activity_log(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Tracked Task", "priority": TaskPriority.HIGH},
        )

        logs = ActivityService.list_for_task(task.id)
        assert logs.count() == 1
        log = logs.first()
        assert log.action == ActivityAction.TASK_CREATED
        assert log.user == self.owner
        assert log.details.get("title") == "Tracked Task"

    def test_status_change_generates_activity_log(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Status Task", "status": TaskStatus.TODO},
        )

        self.task_service.update_task(
            task=task,
            data={"status": TaskStatus.IN_PROGRESS},
            user=self.member,
        )

        logs = ActivityService.list_for_task(task.id)
        status_logs = logs.filter(action=ActivityAction.STATUS_CHANGED)
        assert status_logs.count() == 1
        log = status_logs.first()
        assert log.user == self.member
        assert log.details == {"from": "TODO", "to": "IN_PROGRESS"}

    def test_priority_change_generates_activity_log(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Priority Task", "priority": TaskPriority.LOW},
        )

        self.task_service.update_task(
            task=task,
            data={"priority": TaskPriority.HIGH},
            user=self.owner,
        )

        logs = ActivityService.list_for_task(task.id)
        priority_logs = logs.filter(action=ActivityAction.PRIORITY_CHANGED)
        assert priority_logs.count() == 1
        log = priority_logs.first()
        assert log.details == {"from": "LOW", "to": "HIGH"}

    def test_reassignment_generates_activity_log(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Assign Task", "assignee": self.owner},
        )

        self.task_service.update_task(
            task=task,
            data={"assignee": self.member},
            user=self.owner,
        )

        logs = ActivityService.list_for_task(task.id)
        assign_logs = logs.filter(action=ActivityAction.TASK_ASSIGNED)
        assert assign_logs.count() == 1
        log = assign_logs.first()
        assert log.details == {
            "from_user_id": self.owner.id,
            "to_user_id": self.member.id,
        }
