from django.urls import path
from .views import ScheduleListView, ScheduleDetailView, CityAutocompleteView

urlpatterns = [
    path('schedules/', ScheduleListView.as_view(), name='schedule-list'),
    path('schedules/<int:pk>/', ScheduleDetailView.as_view(), name='schedule-detail'),
    path('cities/autocomplete/', CityAutocompleteView.as_view(), name='city-autocomplete'),
]