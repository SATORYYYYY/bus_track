from rest_framework import generics
from django.db.models.functions import Lower
from .models import Schedule
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Case, When, Value, IntegerField
from .serializers import ScheduleSerializer, ScheduleDetailSerializer
from .models import City
from .serializers import CitySerializer

class CityAutocompleteView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if len(query) < 2:
            return Response([])
        
        all_cities = list(City.objects.all())
        
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

class ScheduleDetailView(generics.RetrieveAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleDetailSerializer