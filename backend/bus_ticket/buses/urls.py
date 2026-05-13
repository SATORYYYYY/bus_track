from django.urls import path
from .views import (
    ScheduleListView, ScheduleDetailView, CityAutocompleteView, 
    BusListView, BusDetailView, ScheduleCreateView,
    CityListCreateView, CityDetailView
)

urlpatterns = [
    path('', BusListView.as_view(), name='bus-list'),
    path('<int:pk>/', BusDetailView.as_view(), name='bus-detail'),
    path('schedules/', ScheduleListView.as_view(), name='schedule-list'),
    path('schedules/create/', ScheduleCreateView.as_view(), name='schedule-create'),
    path('schedules/<int:pk>/', ScheduleDetailView.as_view(), name='schedule-detail'),
    path('cities/', CityListCreateView.as_view(), name='city-list'),
    path('cities/<int:pk>/', CityDetailView.as_view(), name='city-detail'),
    path('cities/autocomplete/', CityAutocompleteView.as_view(), name='city-autocomplete'),
]
