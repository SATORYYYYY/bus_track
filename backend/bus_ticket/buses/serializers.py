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


class ScheduleCreateSerializer(serializers.ModelSerializer):
    route = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Schedule
        fields = '__all__'

    def create(self, validated_data):
        route_data = validated_data.pop('route', {})
        origin_id = route_data.get('origin')
        destination_id = route_data.get('destination')
        distance_km = route_data.get('distance_km', 0)

        # Получаем или создаем маршрут
        route, created = Route.objects.get_or_create(
            origin_id=origin_id,
            destination_id=destination_id,
            defaults={'distance_km': distance_km}
        )

        schedule = Schedule.objects.create(route=route, **validated_data)
        return schedule

class ScheduleDetailSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    booked_seats = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = '__all__'

    def get_booked_seats(self, obj):
        return list(obj.booking_set.filter(status__in=['confirmed', 'paid']).values_list('seat_number', flat=True))