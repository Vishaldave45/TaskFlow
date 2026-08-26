import pytest
from rest_framework.exceptions import ValidationError
from apps.projects.services import ProjectService
from apps.users.models import User
from apps.tasks.models import Task, TaskPriority, TaskStatus
from apps.tasks.repositories import TaskRepository
from apps.tasks.services import TaskService


@pytest.mark.django_db
class TestTaskRepository:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.user = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.project = ProjectService().create_project(name="Repo Proj", owner=self.user)
        self.repo = TaskRepository()

    def test_create_and_get_by_id(self):
        task = self.repo.create(
            project=self.project,
            creator=self.user,
            title="Implement Repository",
            description="Details",
            priority=TaskPriority.HIGH,
        )

        assert task.id is not None
        assert task.title == "Implement Repository"

        fetched = self.repo.get_by_id(task.id)
        assert fetched is not None
        assert fetched.creator == self.user
        assert fetched.project == self.project

    def test_list_for_project(self):
        task1 = self.repo.create(project=self.project, creator=self.user, title="Task 1")
        task2 = self.repo.create(project=self.project, creator=self.user, title="Task 2")

        tasks = list(self.repo.list_for_project(self.project.id))
        assert len(tasks) == 2
        assert task1 in tasks
        assert task2 in tasks

    def test_update_and_delete(self):
        task = self.repo.create(project=self.project, creator=self.user, title="Task Old")
        updated = self.repo.update(task, title="Task New", status=TaskStatus.DONE)
        assert updated.title == "Task New"
        assert updated.status == TaskStatus.DONE

        self.repo.delete(updated)
        assert Task.objects.filter(id=task.id).exists() is False


@pytest.mark.django_db
class TestTaskService:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.outsider = User.objects.create_user(
            email="outsider@example.com", username="outsider", password="password123"
        )
        self.proj_service = ProjectService()
        self.project = self.proj_service.create_project(name="Service Project", owner=self.owner)
        self.proj_service.add_member(project=self.project, user=self.member)
        self.task_service = TaskService()

    def test_create_task_with_member_assignee_success(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={
                "title": "Member Assigned Task",
                "assignee": self.member,
                "priority": TaskPriority.HIGH,
            },
        )
        assert task.id is not None
        assert task.assignee == self.member

    def test_create_task_with_non_member_assignee_fails(self):
        with pytest.raises(ValidationError):
            self.task_service.create_task(
                project=self.project,
                creator=self.owner,
                data={
                    "title": "Invalid Assignee Task",
                    "assignee": self.outsider,
                },
            )

    def test_update_task_with_non_member_assignee_fails(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Valid Task", "assignee": self.member},
        )

        with pytest.raises(ValidationError):
            self.task_service.update_task(
                task=task,
                data={"assignee": self.outsider},
                user=self.owner,
            )
