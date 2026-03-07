import json
import requests
from django.core.management.base import BaseCommand
from buses.models import City

class Command(BaseCommand):
    help = 'Load cities from external API'

    def handle(self, *args, **options):
        cities_data = [
            {"name": "Москва", "region": "Москва", "population": 12615882},
            {"name": "Санкт-Петербург", "region": "Ленинградская область", "population": 5383890},
            {"name": "Новосибирск", "region": "Новосибирская область", "population": 1620162},
            {"name": "Екатеринбург", "region": "Свердловская область", "population": 1493749},
            {"name": "Казань", "region": "Татарстан", "population": 1257391},
            {"name": "Нижний Новгород", "region": "Нижегородская область", "population": 1244254},
            {"name": "Челябинск", "region": "Челябинская область", "population": 1189525},
            {"name": "Самара", "region": "Самарская область", "population": 1144759},
            {"name": "Уфа", "region": "Башкортостан", "population": 1128771},
            {"name": "Ростов-на-Дону", "region": "Ростовская область", "population": 1137124},
            {"name": "Краснодар", "region": "Краснодарский край", "population": 1099344},
            {"name": "Омск", "region": "Омская область", "population": 1153509},
            {"name": "Воронеж", "region": "Воронежская область", "population": 1050602},
            {"name": "Пермь", "region": "Пермский край", "population": 1049005},
            {"name": "Волгоград", "region": "Волгоградская область", "population": 1002763},
            {"name": "Саратов", "region": "Саратовская область", "population": 838042},
            {"name": "Тюмень", "region": "Тюменская область", "population": 847488},
            {"name": "Тольятти", "region": "Самарская область", "population": 693224},
            {"name": "Барнаул", "region": "Алтайский край", "population": 630877},
            {"name": "Ижевск", "region": "Удмуртия", "population": 646277},
            {"name": "Ульяновск", "region": "Ульяновская область", "population": 621514},
            {"name": "Хабаровск", "region": "Хабаровский край", "population": 610305},
            {"name": "Ярославль", "region": "Ярославская область", "population": 601403},
            {"name": "Владивосток", "region": "Приморский край", "population": 606589},
            {"name": "Иркутск", "region": "Иркутская область", "population": 617515},
            {"name": "Томск", "region": "Томская область", "population": 568508},
            {"name": "Кемерово", "region": "Кемеровская область", "population": 549362},
        ]
        
        created_count = 0
        for city_data in cities_data:
            city, created = City.objects.get_or_create(
                name=city_data["name"],
                defaults={
                    "region": city_data["region"],
                    "population": city_data["population"]
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Добавлен город: {city.name}")
        
        self.stdout.write(self.style.SUCCESS(f'Успешно загружено {created_count} городов'))