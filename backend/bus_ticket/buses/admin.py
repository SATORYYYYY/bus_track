from django.contrib import admin
from .models import Bus, Route, Schedule

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('number', 'model', 'total_seats')
    search_fields = ('number', 'model')
    list_filter = ('model',)

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('origin', 'destination', 'distance_km')
    search_fields = ('origin', 'destination')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('route', 'bus', 'departure_time', 'arrival_time', 'price', 'available_seats')
    list_filter = ('route__origin', 'route__destination', 'departure_time')
    search_fields = ('route__origin', 'route__destination', 'bus__number')
    date_hierarchy = 'departure_time'