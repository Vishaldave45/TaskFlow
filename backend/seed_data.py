import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task
from apps.comments.models import Comment

def seed_database():
    print("🌱 Seeding TaskFlow database...")

    # 1. Create or get test users
    admin_user, _ = User.objects.get_or_create(
        email="admin@taskflow.dev",
        defaults={"username": "admin"}
    )
    if not admin_user.has_usable_password():
        admin_user.set_password("admin123")
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.save()

    dev_user, _ = User.objects.get_or_create(
        email="developer@taskflow.dev",
        defaults={"username": "developer"}
    )
    if not dev_user.has_usable_password():
        dev_user.set_password("password123")
        dev_user.save()

    print(f"✅ Users ready: {admin_user.email}, {dev_user.email}")

    # 2. Create Projects
    p1, _ = Project.objects.get_or_create(
        name="TaskFlow Core Engine",
        defaults={
            "description": "High-performance task orchestration and real-time state synchronization platform.",
            "owner": admin_user,
        }
    )

    p2, _ = Project.objects.get_or_create(
        name="Mobile Companion App",
        defaults={
            "description": "Cross-platform React Native client with offline-first local cache synchronization.",
            "owner": dev_user,
        }
    )

    p3, _ = Project.objects.get_or_create(
        name="Enterprise Infrastructure & Auth",
        defaults={
            "description": "Zero-trust IAM, Single Sign-On (SSO) gateway and audit logging pipeline.",
            "owner": admin_user,
        }
    )

    # 3. Add Members
    ProjectMember.objects.get_or_create(project=p1, user=admin_user, defaults={"role": "OWNER"})
    ProjectMember.objects.get_or_create(project=p1, user=dev_user, defaults={"role": "COLLABORATOR"})
    ProjectMember.objects.get_or_create(project=p2, user=dev_user, defaults={"role": "OWNER"})
    ProjectMember.objects.get_or_create(project=p2, user=admin_user, defaults={"role": "COLLABORATOR"})

    print("✅ Projects and memberships initialized.")

    # 4. Create Tasks
    today = datetime.date.today()

    tasks_data = [
        # Project 1 Tasks
        {
            "project": p1,
            "title": "Migrate data fetching layer to TanStack Query v5",
            "description": "Implement QueryClient, query key factory, domain mutation hooks, and automated cache invalidations.",
            "status": "DONE",
            "priority": "HIGH",
            "assignee": admin_user,
            "creator": admin_user,
            "due_date": today + datetime.timedelta(days=1),
        },
        {
            "project": p1,
            "title": "Implement optimistic updates for Kanban drag & drop",
            "description": "Use onMutate snapshot rollback and immediate local cache mutation for zero-latency card moving.",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "assignee": admin_user,
            "creator": admin_user,
            "due_date": today + datetime.timedelta(days=3),
        },
        {
            "project": p1,
            "title": "Add automated WebSocket live activity stream",
            "description": "Stream member actions and comment events directly into the workspace rail.",
            "status": "TODO",
            "priority": "MEDIUM",
            "assignee": dev_user,
            "creator": admin_user,
            "due_date": today + datetime.timedelta(days=7),
        },
        # Project 2 Tasks
        {
            "project": p2,
            "title": "Configure SQLite offline cache engine",
            "description": "Implement local persistence layer for mobile app tasks when offline.",
            "status": "TODO",
            "priority": "HIGH",
            "assignee": dev_user,
            "creator": dev_user,
            "due_date": today + datetime.timedelta(days=4),
        },
        {
            "project": p2,
            "title": "Design tactile gesture animations for task cards",
            "description": "Smooth 60fps swipe-to-archive and hold-to-reorder interactions.",
            "status": "IN_PROGRESS",
            "priority": "LOW",
            "assignee": admin_user,
            "creator": dev_user,
            "due_date": today + datetime.timedelta(days=5),
        },
        # Project 3 Tasks
        {
            "project": p3,
            "title": "Audit JWT token rotation & refresh rate limiting",
            "description": "Ensure sliding session expiration and Redis blacklisting for revoked tokens.",
            "status": "DONE",
            "priority": "HIGH",
            "assignee": admin_user,
            "creator": admin_user,
            "due_date": today - datetime.timedelta(days=1),
        },
    ]

    for td in tasks_data:
        t, created = Task.objects.get_or_create(
            project=td["project"],
            title=td["title"],
            defaults=td
        )
        if created:
            Comment.objects.create(
                task=t,
                author=td["creator"],
                content="Task initialized in sprint backlog."
            )

    print(f"✅ Created sample tasks and comments across projects.")
    print("\n🎉 Database successfully seeded!")
    print("---------------------------------------------")
    print("Credentials to login and test:")
    print("  Email:    admin@taskflow.dev")
    print("  Password: admin123")
    print("---------------------------------------------")

if __name__ == '__main__':
    seed_database()
