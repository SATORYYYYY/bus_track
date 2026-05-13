from rest_framework import serializers
from .models import Booking
from buses.serializers import ScheduleSerializer
from buses.models import Schedule
import uuid

class BookingSerializer(serializers.ModelSerializer):
    schedule = ScheduleSerializer(read_only=True)
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ('id', 'schedule', 'passenger_name', 'passenger_age', 'passenger_email',
                  'passport_number', 'has_luggage', 'seat_number',
                  'booking_code', 'status', 'booking_date', 'discount_type', 'final_price', 'discount_percent')
        read_only_fields = ('booking_code', 'status', 'booking_date', 'final_price')

    def get_discount_percent(self, obj):
        return obj.calculate_discount()

    def create(self, validated_data):
        schedule = validated_data['schedule']
        if schedule.available_seats <= 0:
            raise serializers.ValidationError("Нет свободных мест")

        # Расчет итоговой цены с учетом льготы
        base_price = schedule.price
        discount_type = validated_data.get('discount_type', 'none')
        temp_booking = Booking(discount_type=discount_type)
        final_price = temp_booking.get_final_price(base_price)
        validated_data['final_price'] = final_price

        validated_data['booking_code'] = str(uuid.uuid4())[:8].upper()
        schedule.available_seats -= 1
        schedule.save()
        booking = super().create(validated_data)

        # Отправка email с информацией о скидке
        discount_text = ""
        if booking.discount_type != 'none':
            discount_text = f"\nПрименена льгота: {booking.get_discount_type_display()} ({booking.calculate_discount()}%)"
            discount_text += f"\nИтоговая цена: {booking.final_price} руб. (вместо {base_price} руб.)"

        from django.core.mail import send_mail
        send_mail(
            'Ваше бронирование',
            f'Код бронирования: {booking.booking_code}{discount_text}',
            'noreply@example.com',
            [booking.passenger_email],
            fail_silently=True,
        )
        return booking