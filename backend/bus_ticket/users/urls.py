from django.urls import path
from .views import UserListView, UserDetailView, UserUpdateView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('<int:pk>/', UserUpdateView.as_view(), name='user-update'),
]