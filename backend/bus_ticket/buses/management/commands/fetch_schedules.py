import requests
from django.core.management.base import BaseCommand
from buses.models import Bus, Route, Schedule, City

class Command(BaseCommand):
    help = 'Fetch bus schedules from external API (demo)'

    def handle(self, *args, **options):
        url = 'https://transport.opendata.ch/v1/connections?from=Bern&to=Zurich'
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                for conn in data['connections']:
                    origin_name = conn['from']['station']['name']
                    destination_name = conn['to']['station']['name']
                    
                    origin_city, _ = City.objects.get_or_create(
                        name=origin_name,
                        defaults={'region': 'Швейцария', 'population': 0}
                    )
                    destination_city, _ = City.objects.get_or_create(
                        name=destination_name,
                        defaults={'region': 'Швейцария', 'population': 0}
                    )
                    
                    route, _ = Route.objects.get_or_create(
                        origin=origin_city,
                        destination=destination_city,
                        defaults={'distance_km': 100}  
                    )
                    
                    bus, _ = Bus.objects.get_or_create(
                        number=conn.get('number', 'Unknown'),
                        defaults={
                            'model': 'Standard',
                            'total_seats': 50,
                            'amenities': 'WiFi, кондиционер'
                        }
                    )
                    
                    departure = conn['from']['departure']
                    arrival = conn['to']['arrival']
                    Schedule.objects.get_or_create(
                        bus=bus,
                        route=route,
                        departure_time=departure,
                        arrival_time=arrival,
                        defaults={
                            'price': 25.0,
                            'available_seats': bus.total_seats
                        }
                    )
                self.stdout.write(self.style.SUCCESS('Расписания успешно загружены'))
            else:
                self.stdout.write(self.style.ERROR('Ошибка загрузки данных'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка: {e}'))