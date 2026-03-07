from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_code', 'passenger_name', 'passenger_email', 'schedule', 'seat_number', 'status', 'booking_date')
    list_filter = ('status', 'has_luggage', 'booking_date')
    search_fields = ('passenger_name', 'passport_number', 'booking_code', 'passenger_email')
    raw_id_fields = ('schedule', 'user')
    actions = ['mark_as_confirmed', 'mark_as_cancelled']

    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
    mark_as_confirmed.short_description = "Подтвердить выбранные бронирования"

    def mark_as_cancelled(self, request, queryset):
        for booking in queryset:
            if booking.status != 'cancelled':
                booking.schedule.available_seats += 1
                booking.schedule.save()
        queryset.update(status='cancelled')
    mark_as_cancelled.short_description = "Отменить выбранные бронирования (места станут доступны)"