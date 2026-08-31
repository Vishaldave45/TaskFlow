from django.urls import path
from .views import TaskDetailView, GlobalTaskListView
from apps.comments.views import TaskCommentListCreateView
from apps.activity.views import TaskActivityListView

urlpatterns = [
    path('', GlobalTaskListView.as_view(), name='global_task_list'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task_detail'),
    path('<int:task_id>/comments/', TaskCommentListCreateView.as_view(), name='task_comments'),
    path('<int:task_id>/activity/', TaskActivityListView.as_view(), name='task_activity'),
]
