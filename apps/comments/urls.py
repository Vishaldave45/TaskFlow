from django.urls import path
from .views import CommentDetailView, TaskCommentListCreateView

urlpatterns = [
    path("tasks/<int:task_id>/comments/", TaskCommentListCreateView.as_view(), name="task-comment-list-create"),
    path("comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
]
