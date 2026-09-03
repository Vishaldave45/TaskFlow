# TaskFlow — Django Implementation Guide (Scratch → Done)

This maps every requirement in the original spec (FastAPI/SQLAlchemy) onto a **Django + Django REST Framework** stack, keeping the same clean-architecture layering: **Router → Service → Repository → ORM → PostgreSQL**.

## 0. Tech stack mapping

| Spec asked for | Django equivalent |
|---|---|
| FastAPI | Django + Django REST Framework (DRF) |
| Pydantic | DRF Serializers |
| SQLAlchemy 2.x | Django ORM |
| Alembic | Django Migrations (`makemigrations` / `migrate`) |
| JWT auth | `djangorestframework-simplejwt` |
| Pytest | `pytest-django` + `pytest-asyncio` (if needed) + `factory_boy` |
| uv | uv (works fine with Django, it's just a package manager) |
| Docker | Docker + docker-compose (Django + Postgres) |

Everything else (repository pattern, service layer, permissions, transactions, activity log) is **not native to Django's "fat model" style** — Django encourages logic in models/managers — but we'll deliberately layer it the way the spec wants, because that's the point of the exercise.

---

## 1. Project bootstrap with uv

```bash
mkdir taskflow && cd taskflow
uv init --no-package
uv add django djangorestframework djangorestframework-simplejwt \
       psycopg[binary] django-filter python-decouple
uv add --dev pytest pytest-django pytest-cov factory_boy httpx

uv run django-admin startproject config .
```

This gives you `pyproject.toml` + `uv.lock` (satisfies the "no requirements.txt" rule) and a `config/` package holding `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`.

---

## 2. Target project structure

```
taskflow/
├── pyproject.toml
├── uv.lock
├── manage.py
├── docker-compose.yml
├── Dockerfile
├── .env
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── repositories.py
│   │   ├── services.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── projects/
│   │   ├── models.py           # Project, ProjectMember
│   │   ├── serializers.py
│   │   ├── repositories.py
│   │   ├── services.py
│   │   ├── permissions.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── tasks/
│   │   ├── models.py           # Task
│   │   ├── serializers.py
│   │   ├── repositories.py
│   │   ├── services.py
│   │   ├── permissions.py
│   │   ├── filters.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── comments/
│   │   └── ... same shape
│   └── activity/
│       ├── models.py           # ActivityLog
│       ├── services.py         # ActivityService (write-only, called by other services)
│       └── serializers.py / views.py / urls.py
└── core/
    ├── exceptions.py           # custom exception handler
    └── pagination.py
```

Create the apps:

```bash
mkdir apps && touch apps/__init__.py
for app in users projects tasks comments activity; do
  uv run python manage.py startapp $app apps/$app
done
```

Register them in `config/settings.py` as `"apps.users"`, `"apps.projects"`, etc. (with `AppConfig.name = "apps.users"` set in each app's `apps.py`).

---

## 3. Settings

```python
# config/settings.py
from datetime import timedelta
from decouple import config

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "apps.users",
    "apps.projects",
    "apps.tasks",
    "apps.comments",
    "apps.activity",
]

AUTH_USER_MODEL = "users.User"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="taskflow"),
        "USER": config("DB_USER", default="taskflow"),
        "PASSWORD": config("DB_PASSWORD", default="taskflow"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

Add `"rest_framework_simplejwt.token_blacklist"` to `INSTALLED_APPS` too — you need it for **logout** (blacklisting the refresh token is how you implement "logout" with stateless JWT).

`config/urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    path("api/v1/auth/", include("apps.users.urls_auth")),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/projects/", include("apps.projects.urls")),
    path("api/v1/", include("apps.tasks.urls")),      # /tasks/{id}
    path("api/v1/", include("apps.comments.urls")),
]
```

---

## 4. Models (§13 Database, §20 Tasks, §19 Members, §22 Comments, §23 Activity)

**users/models.py** — custom user, since you need `hash`/`verify` control and email login:

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
```

**projects/models.py**:

```python
from django.conf import settings
from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_projects"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["project", "user"], name="uniq_project_member")
        ]
```

The `UniqueConstraint` is what enforces "same user can't be added twice" **at the database level** (§19).

**tasks/models.py**:

```python
from django.conf import settings
from django.db import models
from apps.projects.models import Project

class TaskStatus(models.TextChoices):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskPriority(models.TextChoices):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO)
    priority = models.CharField(max_length=20, choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_tasks")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_tasks"
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["project", "priority"]),
        ]
```

**comments/models.py**:

```python
from django.conf import settings
from django.db import models
from apps.tasks.models import Task

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**activity/models.py**:

```python
from django.conf import settings
from django.db import models
from apps.tasks.models import Task

class ActivityAction(models.TextChoices):
    TASK_CREATED = "TASK_CREATED"
    TASK_UPDATED = "TASK_UPDATED"
    TASK_ASSIGNED = "TASK_ASSIGNED"
    STATUS_CHANGED = "STATUS_CHANGED"
    PRIORITY_CHANGED = "PRIORITY_CHANGED"
    COMMENT_ADDED = "COMMENT_ADDED"

class ActivityLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="activity")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=30, choices=ActivityAction.choices)
    details = models.JSONField(default=dict, blank=True)   # e.g. {"from": "TODO", "to": "IN_PROGRESS"}
    created_at = models.DateTimeField(auto_now_add=True)
```

Then:

```bash
uv run python manage.py makemigrations   # = Alembic "revision --autogenerate"
uv run python manage.py migrate          # = Alembic "upgrade head"
```

Always **review** the generated migration file before applying it (same warning as the spec's Alembic section). `showmigrations` ≈ `alembic history`/`current`.

---

## 5. Repository layer (§10–11)

Django's default is "just query the model," but the spec wants DB access isolated from business logic. Wrap the ORM in plain classes:

```python
# apps/tasks/repositories.py
from typing import Optional
from django.db.models import QuerySet
from .models import Task

class TaskRepository:
    def get_by_id(self, task_id: int) -> Optional[Task]:
        return Task.objects.select_related("project", "assignee", "creator").filter(id=task_id).first()

    def list_for_project(self, project_id: int) -> QuerySet[Task]:
        return Task.objects.filter(project_id=project_id).select_related("assignee", "creator")

    def create(self, **fields) -> Task:
        return Task.objects.create(**fields)

    def delete(self, task: Task) -> None:
        task.delete()
```

`select_related` here is your defense against N+1 queries (§14's explicit warning). For many-to-many-ish access patterns (e.g. project members with users), use `prefetch_related`.

Optional abstract base (§11), if you want the interface/dependency-inversion exercise:

```python
from abc import ABC, abstractmethod

class TaskRepositoryInterface(ABC):
    @abstractmethod
    def get_by_id(self, task_id: int) -> Optional[Task]: ...
```

`TaskRepository` implements it. In tests, you can swap in an in-memory fake that implements the same interface — that's the payoff.

---

## 6. Service layer (§9)

```python
# apps/tasks/services.py
from django.db import transaction
from django.core.exceptions import PermissionDenied
from apps.activity.services import ActivityService
from apps.activity.models import ActivityAction
from .repositories import TaskRepository
from .models import Task, TaskStatus

class TaskService:
    def __init__(self, task_repository: TaskRepository, activity_service: ActivityService):
        self.task_repository = task_repository
        self.activity_service = activity_service

    @transaction.atomic
    def create_task(self, *, project, creator, data: dict) -> Task:
        task = self.task_repository.create(project=project, creator=creator, **data)
        self.activity_service.log(task=task, user=creator, action=ActivityAction.TASK_CREATED)
        return task

    @transaction.atomic
    def change_status(self, *, task: Task, user, new_status: str) -> Task:
        old_status = task.status
        task.status = new_status
        task.save(update_fields=["status", "updated_at"])
        self.activity_service.log(
            task=task, user=user, action=ActivityAction.STATUS_CHANGED,
            details={"from": old_status, "to": new_status},
        )
        return task
```

`@transaction.atomic` is your rollback/commit boundary (§24) — if `activity_service.log` throws, the status change rolls back too.

Wire services via a small dependency helper (poor-man's DI, since Django has no built-in DI container):

```python
# apps/tasks/dependencies.py
from .repositories import TaskRepository
from .services import TaskService
from apps.activity.services import build_activity_service

def build_task_service() -> TaskService:
    return TaskService(TaskRepository(), build_activity_service())
```

---

## 7. Serializers = Pydantic (§12)

```python
# apps/tasks/serializers.py
from rest_framework import serializers
from .models import Task, TaskStatus, TaskPriority

class TaskCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    priority = serializers.ChoiceField(choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    due_date = serializers.DateField(required=False, allow_null=True)

class TaskResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "priority",
                  "project", "creator", "assignee", "due_date", "created_at", "updated_at"]
```

Keep create/update input serializers separate from `ModelSerializer` output serializers — that mirrors the spec's `TaskCreate` vs `TaskResponse` split and keeps the SQLAlchemy-model-as-contract mistake from happening in Django too.

---

## 8. Permissions / authorization (§17)

```python
# apps/projects/permissions.py
from rest_framework.permissions import BasePermission
from .models import ProjectMember

class IsProjectMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        project = obj if hasattr(obj, "owner") else obj.project
        return project.owner_id == request.user.id or \
            ProjectMember.objects.filter(project=project, user=request.user).exists()

class IsProjectOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id
```

Reusable, attached declaratively on views (`permission_classes = [IsAuthenticated, IsProjectMember]`) instead of duplicated `if` checks inside every route — satisfies "authorization logic should be reusable" directly.

For comment-ownership rules ("users can edit their own comments"), same pattern:

```python
class IsCommentAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id
```

---

## 9. API layer — views (§8)

Views should stay thin and delegate to services:

```python
# apps/tasks/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskCreateSerializer, TaskResponseSerializer
from .dependencies import build_task_service
from .repositories import TaskRepository
from apps.projects.permissions import IsProjectMember
from apps.projects.repositories import ProjectRepository

class ProjectTaskListCreateView(APIView):
    def get_permissions(self):
        return [IsProjectMember()]

    def post(self, request, project_id):
        project = ProjectRepository().get_by_id_or_404(project_id)
        self.check_object_permissions(request, project)

        serializer = TaskCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = build_task_service().create_task(
            project=project, creator=request.user, data=serializer.validated_data
        )
        return Response(TaskResponseSerializer(task).data, status=status.HTTP_201_CREATED)
```

No membership checks, no manual task-creation SQL, no activity-log logic inside the view — all of that lives in `TaskService`. That's the FastAPI-router discipline (§8) carried over.

For simpler CRUD (Projects, Comments) `ModelViewSet` is fine as long as you override `get_queryset`/`perform_create` to call the service layer rather than saving the serializer directly — don't let DRF's convenience pull business logic back into the view.

---

## 10. Filtering & pagination (§21)

```python
# apps/tasks/filters.py
import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    class Meta:
        model = Task
        fields = ["status", "priority", "assignee"]
```

```python
# core/pagination.py
from rest_framework.pagination import PageNumberPagination

class StandardPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100
```

Attach `filterset_class = TaskFilter` to the task list view. Because `django-filter` translates directly to `.filter(...)` on the queryset, filtering happens **in the database**, not in Python — satisfies the "do not load everything and filter in Python" rule.

---

## 11. JWT auth (§16) — register / login / logout

```python
# apps/users/views_auth.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegisterSerializer, UserResponseSerializer

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()   # hashing handled inside serializer.create() via set_password
        return Response(UserResponseSerializer(user).data, status=201)

class LoginView(TokenObtainPairView):
    permission_classes = []   # uses SimpleJWT's built-in email/password check

class LogoutView(APIView):
    def post(self, request):
        token = RefreshToken(request.data["refresh"])
        token.blacklist()      # requires token_blacklist app
        return Response(status=205)
```

Password hashing/verification is handled by Django's built-in `set_password()` / `check_password()` (PBKDF2 by default) — this *is* your `PasswordService.hash/verify` equivalent, already written for you; no need to hand-roll bcrypt calls.

---

## 12. Error handling (§25)

```python
# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.db import IntegrityError

def custom_exception_handler(exc, context):
    if isinstance(exc, IntegrityError):
        return Response({"detail": "Conflict — resource already exists."}, status=409)

    response = exception_handler(exc, context)
    if response is None:
        # unhandled exception -> don't leak internals
        return Response({"detail": "Internal server error."}, status=500)
    return response
```

DRF already maps `PermissionDenied → 403`, `NotFound → 404`, `ValidationError → 400/422`-style behavior. The custom handler above just adds the `IntegrityError → 409` case (duplicate project member, etc.) and hides raw 500 tracebacks from clients.

---

## 13. Testing (§28–29)

```bash
uv add --dev pytest-django factory_boy
```

`pytest.ini` or `pyproject.toml`:

```ini
[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "config.settings"
python_files = ["test_*.py"]
```

Unit test a service **without touching the API/DB stack**, by injecting fakes:

```python
# apps/tasks/tests/unit/test_task_service.py
from unittest.mock import MagicMock
from apps.tasks.services import TaskService

def test_create_task_logs_activity():
    fake_repo = MagicMock()
    fake_activity = MagicMock()
    service = TaskService(fake_repo, fake_activity)

    service.create_task(project=MagicMock(), creator=MagicMock(), data={"title": "x"})

    fake_activity.log.assert_called_once()
```

Integration test through the real API:

```python
# apps/tasks/tests/integration/test_task_api.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_create_task_requires_membership(project, other_user):
    client = APIClient()
    client.force_authenticate(other_user)
    resp = client.post(f"/api/v1/projects/{project.id}/tasks", {"title": "New"})
    assert resp.status_code == 403
```

Use `factory_boy` for `UserFactory`, `ProjectFactory`, `TaskFactory` fixtures instead of hand-building objects in every test.

---

## 14. Docker (§30)

```dockerfile
# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen
COPY . .
CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: taskflow
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ["5432:5432"]

  web:
    build: .
    command: >
      sh -c "uv run python manage.py migrate &&
             uv run python manage.py runserver 0.0.0.0:8000"
    volumes: [".:/app"]
    ports: ["8000:8000"]
    depends_on: [db]
    env_file: .env

volumes:
  pgdata:
```

README should document: `docker compose up`, `docker compose exec web uv run python manage.py migrate`, `docker compose exec web uv run pytest`.

---

## 15. Endpoint list (§27, adapted URL style)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login          (returns access + refresh)
POST   /api/v1/auth/logout         (blacklists refresh)

GET    /api/v1/users/me
PATCH  /api/v1/users/me

POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}

POST   /api/v1/projects/{id}/members
GET    /api/v1/projects/{id}/members
DELETE /api/v1/projects/{id}/members/{user_id}

POST   /api/v1/projects/{id}/tasks
GET    /api/v1/projects/{id}/tasks?status=&priority=&assignee=&page=&page_size=
GET    /api/v1/tasks/{id}
PATCH  /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}

POST   /api/v1/tasks/{id}/comments
GET    /api/v1/tasks/{id}/comments
PATCH  /api/v1/comments/{id}
DELETE /api/v1/comments/{id}

GET    /api/v1/tasks/{id}/activity
```

---

## 16. Suggested build order (milestones)

1. **Scaffolding** — uv project, Django project, apps, settings, Docker Compose up with an empty Postgres.
2. **Users & auth** — custom User model, register/login/logout, `/users/me`. Get JWT working end-to-end and test it with `httpx`/`APIClient`.
3. **Projects + members** — model, migrations, repository/service/view, ownership checks, unique-membership constraint + 409 handling.
4. **Tasks** — model, CRUD, assignment, status/priority transitions, filtering + pagination.
5. **Activity log** — wire `ActivityService.log(...)` into task create/update/assign/status/priority; comment creation too.
6. **Comments** — CRUD + author-only edit/delete permission.
7. **Authorization pass** — sweep every endpoint and confirm the right permission classes are attached (non-members get 403/404 consistently).
8. **Error handling pass** — confirm 400/401/403/404/409/422/500 all show up correctly; no leaked stack traces.
9. **Testing pass** — fill out unit tests (services with fakes) and integration tests (per §28's checklist) until every listed case is covered.
10. **Polish** — DRF auto-docs (drf-spectacular is the modern equivalent of FastAPI's OpenAPI UI, add if you want it), README, final Docker verification from a clean clone.

Build vertically (one full feature at a time, top to bottom through all layers) rather than horizontally (all models, then all serializers, etc.) — you'll catch integration issues much earlier that way.
