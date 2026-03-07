from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingCreateView, BookingDetailView, UserBookingsView, BookingViewSet

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = [
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('my/', UserBookingsView.as_view(), name='user-bookings'),
    path('<str:booking_code>/', BookingDetailView.as_view(), name='booking-detail'),
    path('', include(router.urls)),
]