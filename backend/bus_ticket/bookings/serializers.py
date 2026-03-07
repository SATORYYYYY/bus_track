from rest_framework import serializers
from .models import Booking
from buses.models import Schedule
import uuid

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('id', 'schedule', 'passenger_name', 'passenger_age', 'passenger_email',
                  'passport_number', 'has_luggage', 'seat_number',
                  'booking_code', 'status', 'booking_date')
        read_only_fields = ('booking_code', 'status', 'booking_date')

    def create(self, validated_data):
        schedule = validated_data['schedule']
        if schedule.available_seats <= 0:
            raise serializers.ValidationError("Нет свободных мест")
        validated_data['booking_code'] = str(uuid.uuid4())[:8].upper()
        schedule.available_seats -= 1
        schedule.save()
        booking = super().create(validated_data)
        from django.core.mail import send_mail
        send_mail(
            'Ваше бронирование',
            f'Код бронирования: {booking.booking_code}',
            'noreply@example.com',
            [booking.passenger_email],
            fail_silently=True,
        )
        return booking