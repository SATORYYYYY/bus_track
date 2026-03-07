from rest_framework import serializers
from .models import Bus, Route, Schedule, City

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)

    class Meta:
        model = Route
        fields = ('id', 'origin', 'destination', 'origin_name', 'destination_name', 'distance_km')

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('id', 'name', 'region')

class ScheduleSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'

class ScheduleDetailSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    booked_seats = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = '__all__'

    def get_booked_seats(self, obj):
        return list(obj.booking_set.filter(status__in=['confirmed', 'paid']).values_list('seat_number', flat=True))