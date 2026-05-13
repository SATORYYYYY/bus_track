from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Booking
from .serializers import BookingSerializer

class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    lookup_field = 'booking_code'

class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @action(detail=True, methods=['post', 'patch'])
    def pay(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status', 'paid')
        if new_status in ['paid', 'confirmed', 'cancelled']:
            booking.status = new_status
            booking.save()
            return Response({'status': booking.status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)