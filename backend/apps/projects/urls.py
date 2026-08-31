from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectMemberListCreateView,
    ProjectMemberDeleteView
)
from apps.tasks.views import ProjectTaskListCreateView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project_list_create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('<int:project_id>/members/', ProjectMemberListCreateView.as_view(), name='project_member_list_create'),
    path('<int:project_id>/members/<int:user_id>/', ProjectMemberDeleteView.as_view(), name='project_member_delete'),
    path('<int:project_id>/tasks/', ProjectTaskListCreateView.as_view(), name='project_task_list_create'),
]
