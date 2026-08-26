from django.urls import path
from .views import (
    ProjectDetailView,
    ProjectListCreateView,
    ProjectMemberDetailView,
    ProjectMemberListCreateView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:pk>/members/", ProjectMemberListCreateView.as_view(), name="project-member-list-create"),
    path("<int:pk>/members/<int:user_id>/", ProjectMemberDetailView.as_view(), name="project-member-detail"),
]
