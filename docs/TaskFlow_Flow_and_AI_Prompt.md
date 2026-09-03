# TaskFlow — First Implementation Flow + Master Prompt for an AI Builder

Two parts:
1. **The actual first flow** — the very first vertical slice (environment → skeleton → Auth), broken into minor steps, each with **Why / What / How**.
2. **A master prompt** you can hand to another AI (Claude Code, Cursor, ChatGPT, etc.) so it builds the *entire* project the same way — explaining why/what/how at every point, following industry practices, instead of just dumping code.

---

# PART 1 — Phase 1 Implementation Flow: Environment → Skeleton → Auth

Auth is the right first vertical slice because almost every other feature (projects, tasks, comments) depends on "who is this user" existing and working end-to-end first. Building it first also forces you to prove the whole stack (DB → Django → DRF → JWT → tests → Docker) works before you add complexity on top.

## Step 1 — Install prerequisites

**What:** Python 3.12+, `uv`, Docker + Docker Compose, Git, a REST client (Postman/Insomnia/`httpie`/curl).

**Why:** Python 3.12 is the spec's minimum (modern typing syntax like `str | None` needs 3.10+, but 3.12 gives you better error messages and performance). `uv` replaces pip+venv+pip-tools in one tool and produces a lockfile, which is what the spec requires instead of `requirements.txt`. Docker gets you a disposable, reproducible Postgres instead of "works on my machine."

**How:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh   # installs uv
docker --version                                   # confirm Docker is present
git --version
```

## Step 2 — Initialize the repo and dependency manager

**What:** An empty git repo with a `pyproject.toml`/`uv.lock` pair, no code yet.

**Why:** Committing the dependency lock **before** any code means every future commit has a reproducible environment attached to it. This is the industry norm ("commit your lockfile") — it's what makes `docker build` reproducible across machines and CI.

**How:**
```bash
mkdir taskflow && cd taskflow
git init
uv init --no-package
echo -e "__pycache__/\n*.pyc\n.venv/\n.env\ndb.sqlite3\n" > .gitignore
git add . && git commit -m "chore: initialize project with uv"
```

## Step 3 — Install Django + DRF + auth deps

**What:** `django`, `djangorestframework`, `djangorestframework-simplejwt`, `psycopg[binary]`, `django-filter`, `python-decouple`; dev deps `pytest`, `pytest-django`, `factory_boy`.

**Why:** Installing dependencies *before* writing settings means `django-admin` and later `manage.py` commands are actually available. `python-decouple` (or `django-environ`) keeps secrets/config out of source control — a 12-factor-app principle, not a nice-to-have.

**How:**
```bash
uv add django djangorestframework djangorestframework-simplejwt psycopg[binary] django-filter python-decouple
uv add --dev pytest pytest-django factory_boy
git add . && git commit -m "chore: add Django and auth dependencies"
```

## Step 4 — Create the Django project and the first app

**What:** `config/` (project settings) and `apps/users/` (first app), nothing else yet.

**Why:** Don't create all five apps up front "because the spec lists them" — that's the same mistake as creating classes just to look object-oriented (§4 of the spec explicitly warns against this). Create `users` first because nothing else can exist without it (every other model has a `ForeignKey` to `User`).

**How:**
```bash
uv run django-admin startproject config .
mkdir apps && touch apps/__init__.py
uv run python manage.py startapp users apps/users
```
Edit `apps/users/apps.py` → `name = "apps.users"` (must match the import path, not just the folder name — this is the #1 "app not found" bug beginners hit).

## Step 5 — Set `AUTH_USER_MODEL` *before* the first migration

**What:** A custom `User` model in `apps/users/models.py`, registered as `AUTH_USER_MODEL`, migrated as the very first migration in the project.

**Why (important, order-sensitive):** Django hard-codes a link from every built-in app (`admin`, `auth` permissions, etc.) to whatever `AUTH_USER_MODEL` points to **at the time you first run `migrate`**. Switching custom user models after your first migration is genuinely painful (effectively requires a fresh database). This is the single most common "wish I'd known" mistake in Django projects — so it happens now, step 5, before any other migration exists.

**How:**
```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
```
```python
# config/settings.py
INSTALLED_APPS = [..., "rest_framework", "apps.users"]
AUTH_USER_MODEL = "users.User"
```

## Step 6 — Bring up Postgres via Docker before touching migrations

**What:** A `docker-compose.yml` with just the `db` service running, and Django settings pointed at it via `.env`.

**Why:** The spec requires Postgres, not SQLite — and some Postgres-specific behaviors (e.g. `UniqueConstraint` semantics, certain field types) are worth testing against the real engine from day one rather than discovering a SQLite/Postgres mismatch later.

**How:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: taskflow
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```
```bash
docker compose up -d db
```
```python
# config/settings.py
from decouple import config
DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": config("DB_NAME", default="taskflow"),
    "USER": config("DB_USER", default="taskflow"),
    "PASSWORD": config("DB_PASSWORD", default="taskflow"),
    "HOST": config("DB_HOST", default="localhost"),
    "PORT": config("DB_PORT", default="5432"),
}}
```

## Step 7 — First migration, review it, then apply

**What:** `apps/users/migrations/0001_initial.py`, read before running.

**Why:** The spec explicitly says "autogenerated migrations should always be reviewed before being applied" — this isn't ceremony. Autogenerate can silently do the wrong thing (e.g. drop-and-recreate a column instead of a rename) if you're not watching.

**How:**
```bash
uv run python manage.py makemigrations
cat apps/users/migrations/0001_initial.py   # actually read it
uv run python manage.py migrate
uv run python manage.py createsuperuser
git add . && git commit -m "feat: custom User model + initial migration"
```

## Step 8 — Wire up DRF + SimpleJWT

**What:** `REST_FRAMEWORK` and `SIMPLE_JWT` settings; `rest_framework_simplejwt.token_blacklist` app added (needed for logout).

**Why:** Configuring auth globally in settings (rather than per-view) means every future endpoint is secure-by-default (`IsAuthenticated`) and you have to *opt out* for public endpoints (register/login) rather than *opt in* to security everywhere else. Secure-by-default is standard practice — it's much harder to accidentally leave an endpoint unprotected.

**How:**
```python
# config/settings.py
INSTALLED_APPS += ["rest_framework_simplejwt.token_blacklist"]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```
```bash
uv run python manage.py migrate   # applies token_blacklist tables
```

## Step 9 — Register endpoint

**What:** `UserRegisterSerializer` (write-only password, uses `set_password`) + `RegisterView` + URL at `/api/v1/auth/register`.

**Why:** Password hashing must happen via `set_password()`, never by storing `request.data["password"]` directly — Django's hasher (PBKDF2 by default) is what satisfies "passwords must never be stored as plain text" (§16). Using a serializer's `create()` override keeps that hashing logic in one place instead of scattered across views.

**How:**
```python
# apps/users/serializers.py
from rest_framework import serializers
from .models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]

    def create(self, validated_data):
        user = User(email=validated_data["email"], username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user
```
```python
# apps/users/views_auth.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer

class RegisterView(APIView):
    permission_classes = []   # public endpoint — must opt out explicitly

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"id": user.id, "email": user.email}, status=201)
```
Wire the URL, then test manually:
```bash
curl -X POST localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","username":"a","password":"password123"}'
```

## Step 10 — Login + logout

**What:** `TokenObtainPairView` (from SimpleJWT, subclassed for the `/login` path) + a custom `LogoutView` that blacklists the refresh token.

**Why:** Don't hand-roll token generation — SimpleJWT already implements the JWT spec correctly (signing, expiry, refresh rotation). Logout with stateless JWT is inherently awkward (a JWT is valid until it expires, by design) — blacklisting the refresh token is the standard workaround: the access token still works until it naturally expires (≤30 min here), but no new access token can be minted after logout.

**How:** (see backend guide §11 for the exact view code) — wire `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/token/refresh`.

## Step 11 — `/users/me`

**What:** `GET`/`PATCH /api/v1/users/me`, using `request.user` (no ID in the URL — you can only ever see/edit yourself here).

**Why:** This is your first real authorization decision, even though it's trivial: the endpoint doesn't take a user ID because there's no legitimate reason to expose "look up any user by ID" yet. Minimal surface area is a security default, not laziness.

## Step 12 — Tests for the whole auth flow

**What:** `apps/users/tests/test_auth.py` covering: register success, register with duplicate email (expect 400), login success, login with wrong password (expect 401), accessing `/users/me` without a token (expect 401), accessing it with a token (expect 200).

**Why:** This is the checklist from §28 of the spec, and doing it now — before Projects/Tasks exist — means you have a template (`APIClient`, fixtures, assertion style) to copy for every feature after this, instead of inventing testing conventions under time pressure later.

**How:**
```python
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_register_then_login():
    client = APIClient()
    client.post("/api/v1/auth/register", {"email": "a@a.com", "username": "a", "password": "password123"})
    resp = client.post("/api/v1/auth/login", {"email": "a@a.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access" in resp.data
```
```bash
uv run pytest
```

## Step 13 — Dockerize what you have and confirm it runs cold

**What:** `Dockerfile` + `web` service added to `docker-compose.yml`; `docker compose down -v && docker compose up` from a clean clone works end-to-end.

**Why:** Proving the Docker path works *now*, with just Auth, catches environment bugs (missing env vars, wrong `DATABASE_URL`, migration-on-boot race conditions) while the codebase is small — not after five more apps are layered on top.

**How:** see backend guide §14 for the Dockerfile/compose contents.

## Step 14 — Commit and tag the milestone

```bash
git add . && git commit -m "feat: complete auth vertical slice (register/login/logout/me) with tests"
git tag milestone-1-auth
```

**Why tag it:** gives you (or an AI agent continuing the work) a known-good checkpoint to diff against or roll back to if a later feature breaks something in `users`.

---

From here, repeat the same shape (model → migration → repository → service → serializer → permission → view → tests → commit) for **Projects → Project Members → Tasks → Activity → Comments**, in that order, per the build order in the backend guide.

---

# PART 2 — Master Prompt for Another AI

Copy everything in the box below into a fresh conversation with your AI of choice (Claude Code, Cursor, etc.). It tells the AI to build the whole project vertically, explain its reasoning at every step, and follow the same architecture as these two guides.

```
You are acting as a senior backend/frontend engineer pair-programming with me. We are building
"TaskFlow," a task and project management backend (Django + Django REST Framework + PostgreSQL)
with a React + TypeScript frontend, from an empty repository to a fully working, tested,
Dockerized application.

=== NON-NEGOTIABLE RULES ===

1. WORK IN VERTICAL SLICES, NOT LAYERS.
   Build one full feature end-to-end (model → migration → repository → service → serializer →
   permission → view → URL → tests) before starting the next feature. Order:
   Auth/Users → Projects → Project Members → Tasks → Activity Log → Comments → Frontend.
   Do not write all models first, then all serializers, then all views.

2. AT EVERY STEP, EXPLAIN THREE THINGS BEFORE OR ALONGSIDE THE CODE:
   - WHY: the underlying concept/problem being solved, and why this approach over the
     obvious alternatives (e.g. "why a repository layer instead of calling the ORM directly
     in the view," "why set_password() instead of hashing manually").
   - WHAT: the concrete deliverable of this step in one sentence.
   - HOW: the actual code/commands, kept minimal and directly runnable.
   Do not skip the WHY even when the WHAT seems obvious — assume I am learning the
   underlying engineering concept, not just copying code.

3. FOLLOW THIS ARCHITECTURE STRICTLY:
   Backend: Router (DRF view) → Service (business logic, permissions checks, transactions,
   activity logging) → Repository (ORM queries only, no business decisions) → PostgreSQL.
   - Views must stay thin: HTTP concerns only (parsing, status codes, calling one service method).
   - Services own business rules, coordinate repositories, wrap multi-step writes in
     `transaction.atomic`, and are unit-testable without hitting the API layer.
   - Repositories own ORM queries only — no "is this user allowed to..." logic.
   - Pydantic-equivalent: DRF serializers, with separate Create/Update input serializers vs
     ModelSerializer output serializers (never expose the ORM model directly as the API contract).
   Frontend: api/ (HTTP only) → hooks/ (React Query, the "service layer") → components/pages
   (no direct axios/fetch calls).

4. TYPE EVERYTHING.
   Python: type hints on every function signature, model field, service/repository method.
   TypeScript: no `any`; types mirror the backend serializers exactly.

5. SECURITY AND CORRECTNESS DEFAULTS:
   - `IsAuthenticated` globally by default; public endpoints opt out explicitly, and you must
     tell me why an endpoint is public when you mark one that way.
   - Passwords only via Django's `set_password`/`check_password` — never hand-rolled hashing.
   - Every multi-step write that touches more than one table goes in `transaction.atomic`,
     and you explain what would be left inconsistent without it.
   - Authorization logic (project membership, ownership, comment authorship) lives in
     reusable DRF permission classes, never duplicated inline across views.
   - Never expose raw internal errors (stack traces, DB error text) in API responses —
     map them to the correct HTTP status (400/401/403/404/409/422/500).

6. MIGRATIONS: after every `makemigrations`, show me the generated migration file content
   and explain what it will do to the schema BEFORE running `migrate`. Flag anything that
   looks like a drop/recreate instead of the intended change.

7. TEST AS YOU GO, NOT AT THE END.
   Every vertical slice ends with: unit tests for the service layer (using fakes/mocks for
   the repository, not the real DB) AND integration tests for the API endpoints (using a
   real test DB). Show me the failure-case tests (403/404/409/422), not just the happy path.
   Do not move to the next feature until tests for the current one pass.

8. COMMIT DISCIPLINE: propose a conventional-commit-style message
   (feat:/fix:/chore:/test:/refactor:) at the end of each completed slice, and wait for my
   go-ahead before assuming the slice is "done."

9. WHEN SOMETHING IS AMBIGUOUS OR HAS MULTIPLE REASONABLE APPROACHES (e.g. how to model
   activity log details, whether to soft-delete or hard-delete comments), STOP and present
   me 2-3 options with the tradeoffs of each, in the style of an architecture decision
   record (ADR): Context → Options → Recommendation → Consequences. Let me choose before
   proceeding.

10. INDUSTRY-PRACTICE CHECKPOINTS: at the end of each major slice, give me a short "what a
    senior engineer would double check here" list — things like N+1 queries, missing
    indexes, missing db-level constraints vs only app-level checks, missing pagination caps,
    secrets in source control, and CORS/CSRF configuration for the frontend integration.

=== DELIVERABLE STRUCTURE FOR EACH SLICE ===

For each feature/slice, structure your response as:
1. **Why this slice, why now** (2-3 sentences, ties to what was built before it)
2. **What we're building** (bullet list of concrete artifacts: model, endpoints, etc.)
3. **How** — code, in the order: model → migration (shown + explained before applying) →
   repository → service → serializer → permission → view → URL → manual curl/httpie test →
   automated tests
4. **Senior-engineer checkpoint** (the list from rule 10)
5. **Proposed commit message**, then wait for confirmation before starting the next slice

=== STARTING POINT ===

Assume an empty git repository. Start with: prerequisites check, `uv init`, dependency
install, Django project + first app (`users`), custom User model with AUTH_USER_MODEL set
BEFORE the first migration (explain why this ordering matters), Postgres via Docker Compose,
then the full Auth vertical slice (register/login/logout/me) with tests, exactly as the
first milestone. Confirm each step with me before moving to Projects.

Begin now with Step 1.
```

---

## How to use this in practice

- Paste the master prompt as-is into a fresh session with your chosen AI tool.
- Keep **this pair of guides** (backend + frontend) open alongside — the AI's output should match the architecture in them; if it drifts (e.g. starts putting business logic in views), point back at the relevant section number.
- Go slice by slice. Don't let the AI "build everything at once" even if it offers to — the whole point of the vertical-slice + why/what/how structure is that you understand and can defend every layer by the time the project is done, which is also exactly what the original spec's learning objectives (§3) are asking for.
