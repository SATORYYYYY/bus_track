from rest_framework import generics, permissions
from django.db.models.functions import Lower
from .models import Schedule, Bus, Route
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Case, When, Value, IntegerField
from .serializers import ScheduleSerializer, ScheduleDetailSerializer, BusSerializer, ScheduleCreateSerializer
from .models import City
from .serializers import CitySerializer

class BusListView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [permissions.IsAdminUser]

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [permissions.IsAdminUser]

class CityListCreateView(generics.ListCreateAPIView):
    queryset = City.objects.all().order_by('name')
    serializer_class = CitySerializer
    permission_classes = [permissions.IsAdminUser]

class CityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [permissions.IsAdminUser]

class CityAutocompleteView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        all_cities = list(City.objects.filter(is_active=True).order_by('name'))
        
        # Если запрос пустой, возвращаем все города
        if not query:
            serializer = CitySerializer(all_cities, many=True)
            return Response(serializer.data)
        
        query_lower = query.lower()
        matched = [city for city in all_cities if query_lower in city.name.lower()]
        
        matched.sort(key=lambda c: (0 if c.name.lower().startswith(query_lower) else 1, c.name))
        
        result = matched[:15]
        
        serializer = CitySerializer(result, many=True)
        return Response(serializer.data)

class ScheduleListView(generics.ListAPIView):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        queryset = Schedule.objects.all()
        origin = self.request.query_params.get('origin')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')
        if origin:
            queryset = queryset.filter(route__origin__name__icontains=origin)
        if destination:
            queryset = queryset.filter(route__destination__name__icontains=destination)
        if date:
            queryset = queryset.filter(departure_time__date=date)
        return queryset

class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleDetailSerializer
    permission_classes = [permissions.IsAdminUser]

class ScheduleCreateView(generics.CreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleCreateSerializer
    permission_classes = [permissions.IsAdminUser]