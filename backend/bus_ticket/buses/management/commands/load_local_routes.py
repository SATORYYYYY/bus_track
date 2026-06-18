from django.core.management.base import BaseCommand
from buses.models import City, Route, Bus, Schedule
from datetime import datetime, timedelta
import random

ROUTES_DATA = [
    ("с.Прислониха", "р.п. Языково"),
    ("р.п. Языково", "г.Ульяновск"),
    ("г.Ульяновск", "р.п. Языково"),
    ("р.п. Языково", "с.Прислониха"),
    ("с.Белозерье", "р.п.Карсун"),
    ("р.п.Карсун", "г.Ульяновск"),
    ("г.Ульяновск", "р.п.Карсун"),
    ("р.п.Карсун", "с.Белозерье"),
    ("с. Тагай", "г.Ульяновск"),
    ("г.Ульяновск", "с.Урено-Карлинское"),
    ("с.Урено-Карлинское", "г.Ульяновск"),
    ("г.Ульяновск", "с.Тагай"),
    ("с.Тагай", "г.Ульяновск"),
    ("г.Ульяновск", "с.Урено-Карлинское"),
    ("с.Урено-Карлинское", "г.Ульяновск"),
    ("г.Ульяновск", "с.Тагай"),
    ("р.п.Карсун", "г.Ульяновск"),
    ("с.Белозерье", "г.Димитровград"),
    ("г.Димитровград", "с.Белозерье"),
    ("р.п.Карсун", "г.Ульяновск"),
    ("г.Ульяновск", "р.п.Карсун"),
    ("с.Прислониха", "г.Ульяновск"),
    ("с.Тагай", "г.Сенгилей"),
    ("г.Сенгилей", "с.Прислониха"),
]

LOCAL_CITIES = [
    {"name": "с.Прислониха", "region": "Ульяновская область", "population": 500},
    {"name": "р.п. Языково", "region": "Ульяновская область", "population": 1500},
    {"name": "г.Ульяновск", "region": "Ульяновская область", "population": 621514},
    {"name": "с.Белозерье", "region": "Ульяновская область", "population": 800},
    {"name": "р.п.Карсун", "region": "Ульяновская область", "population": 7000},
    {"name": "с. Тагай", "region": "Ульяновская область", "population": 600},
    {"name": "с.Урено-Карлинское", "region": "Ульяновская область", "population": 400},
    {"name": "г.Димитровград", "region": "Ульяновская область", "population": 114229},
    {"name": "г.Сенгилей", "region": "Ульяновская область", "population": 6000},
]

DISTANCES = {
    ("Прислониха", "Языково"): 15,
    ("Языково", "Прислониха"): 15,
    ("Языково", "Ульяновск"): 50,
    ("Ульяновск", "Языково"): 50,
    ("Белозерье", "Карсун"): 25,
    ("Карсун", "Ульяновск"): 100,
    ("Ульяновск", "Карсун"): 100,
    ("Карсун", "Белозерье"): 25,
    ("Тагай", "Ульяновск"): 60,
    ("Ульяновск", "Тагай"): 60,
    ("Ульяновск", "Урено-Карлинское"): 70,
    ("Урено-Карлинское", "Ульяновск"): 70,
    ("Белозерье", "Димитровград"): 80,
    ("Димитровград", "Белозерье"): 80,
    ("Прислониха", "Ульяновск"): 65,
    ("Тагай", "Сенгилей"): 30,
    ("Сенгилей", "Прислониха"): 40,
}

PRICES = {
    ("Прислониха", "Языково"): 100,
    ("Языково", "Ульяновск"): 250,
    ("Ульяновск", "Языково"): 250,
    ("Языково", "Прислониха"): 100,
    ("Белозерье", "Карсун"): 150,
    ("Карсун", "Ульяновск"): 400,
    ("Ульяновск", "Карсун"): 400,
    ("Карсун", "Белозерье"): 150,
    ("Тагай", "Ульяновск"): 300,
    ("Ульяновск", "Тагай"): 300,
    ("Ульяновск", "Урено-Карлинское"): 350,
    ("Урено-Карлинское", "Ульяновск"): 350,
    ("Белозерье", "Димитровград"): 500,
    ("Димитровград", "Белозерье"): 500,
    ("Прислониха", "Ульяновск"): 350,
    ("Тагай", "Сенгилей"): 200,
    ("Сенгилей", "Прислониха"): 250,
}

TRAVEL_HOURS = {
    ("Прислониха", "Языково"): 0.5,
    ("Языково", "Прислониха"): 0.5,
    ("Языково", "Ульяновск"): 1.5,
    ("Ульяновск", "Языково"): 1.5,
    ("Белозерье", "Карсун"): 1,
    ("Карсун", "Ульяновск"): 2,
    ("Ульяновск", "Карсун"): 2,
    ("Карсун", "Белозерье"): 1,
    ("Тагай", "Ульяновск"): 1.5,
    ("Ульяновск", "Тагай"): 1.5,
    ("Ульяновск", "Урено-Карлинское"): 1.5,
    ("Урено-Карлинское", "Ульяновск"): 1.5,
    ("Белозерье", "Димитровград"): 2,
    ("Димитровград", "Белозерье"): 2,
    ("Прислониха", "Ульяновск"): 2,
    ("Тагай", "Сенгилей"): 1,
    ("Сенгилей", "Прислониха"): 1.5,
}

class Command(BaseCommand):
    help = 'Загрузка местных городов Ульяновской области и маршрутов'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("Загрузка местных данных Ульяновской области")
        self.stdout.write("=" * 60)

        # 1. Загружаем/обновляем города
        self.stdout.write("\n--- Загрузка городов ---")
        city_objects = {}
        for city_data in LOCAL_CITIES:
            city, created = City.objects.get_or_create(
                name=city_data["name"],
                defaults={
                    "region": city_data["region"],
                    "population": city_data["population"]
                }
            )
            if not created:
                city.region = city_data["region"]
                city.population = city_data["population"]
                city.save()
            city_objects[city_data["name"]] = city
            status = "✓ создан" if created else "✓ обновлен"
            self.stdout.write(f"  {status}: {city.name} ({city.region})")

        # 2. Создаем/обновляем маршруты
        self.stdout.write("\n--- Создание маршрутов ---")
        route_objects = {}
        seen_routes = set()
        for origin_name, dest_name in ROUTES_DATA:
            route_key = (origin_name, dest_name)
            if route_key in seen_routes:
                continue
            seen_routes.add(route_key)

            origin = city_objects.get(origin_name)
            destination = city_objects.get(dest_name)
            if not origin or not destination:
                self.stdout.write(f"  ✗ Пропущен: {origin_name} → {dest_name} (город не найден)")
                continue

            # Определяем расстояние
            def get_key(name1, name2):
                for key in DISTANCES:
                    if key[0] in name1 and key[1] in name2:
                        return key
                    if key[1] in name1 and key[0] in name2:
                        return key
                return None

            dist_key = get_key(origin_name, dest_name)
            distance = DISTANCES.get(dist_key, 50)

            route, created = Route.objects.get_or_create(
                origin=origin,
                destination=destination,
                defaults={"distance_km": distance}
            )
            if not created:
                route.distance_km = distance
                route.save()

            route_objects[(origin_name, dest_name)] = route
            status = "✓ создан" if created else "✓ обновлен"
            self.stdout.write(f"  {status}: {origin_name} → {dest_name} ({distance} км)")

        # 3. Создаем/обновляем автобусы для местных маршрутов
        self.stdout.write("\n--- Создание автобусов ---")
        local_buses_data = [
            {"number": "МП-001", "model": "ПАЗ-3205", "seats": 30, "amenities": "Базовые сиденья"},
            {"number": "МП-002", "model": "ПАЗ-3205", "seats": 30, "amenities": "Базовые сиденья"},
            {"number": "МП-003", "model": "КАвЗ-4235", "seats": 35, "amenities": "Кондиционер"},
            {"number": "МП-004", "model": "ПАЗ-3205", "seats": 30, "amenities": "Базовые сиденья"},
            {"number": "МП-005", "model": "ПАЗ-4234", "seats": 35, "amenities": "WiFi, кондиционер"},
            {"number": "МП-006", "model": "КАвЗ-4235", "seats": 35, "amenities": "WiFi, кондиционер"},
            {"number": "МП-007", "model": "ПАЗ-3205", "seats": 30, "amenities": "Базовые сиденья"},
            {"number": "МП-008", "model": "Volgabus-5270", "seats": 40, "amenities": "WiFi, кондиционер, USB"},
        ]

        bus_objects = []
        for bus_data in local_buses_data:
            bus, created = Bus.objects.get_or_create(
                number=bus_data["number"],
                defaults={
                    "model": bus_data["model"],
                    "total_seats": bus_data["seats"],
                    "amenities": bus_data["amenities"],
                }
            )
            bus_objects.append(bus)
            status = "✓ создан" if created else "✓ уже есть"
            self.stdout.write(f"  {status}: {bus.number} ({bus.model}, {bus.total_seats} мест)")

        # 4. Создаем расписание на неделю вперед
        self.stdout.write("\n--- Создание расписания ---")
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        schedule_count = 0

        # Время отправления для каждого маршрута
        departure_times = {
            ("Прислониха", "Языково"): ["06:00", "12:00", "18:00"],
            ("Языково", "Ульяновск"): ["06:30", "12:30", "18:30"],
            ("Ульяновск", "Языково"): ["07:00", "13:00", "19:00"],
            ("Языково", "Прислониха"): ["07:00", "13:00", "19:00"],
            ("Белозерье", "Карсун"): ["06:00", "12:00", "17:00"],
            ("Карсун", "Ульяновск"): ["06:30", "08:00", "12:30", "17:30"],
            ("Ульяновск", "Карсун"): ["07:00", "09:00", "13:00", "18:00"],
            ("Карсун", "Белозерье"): ["07:00", "13:00", "18:00"],
            ("Тагай", "Ульяновск"): ["06:00", "11:00", "16:00"],
            ("Ульяновск", "Тагай"): ["07:30", "12:30", "17:30"],
            ("Ульяновск", "Урено-Карлинское"): ["08:00", "14:00"],
            ("Урено-Карлинское", "Ульяновск"): ["06:00", "12:00", "17:00"],
            ("Белозерье", "Димитровград"): ["06:00", "13:00"],
            ("Димитровград", "Белозерье"): ["07:00", "14:00"],
            ("Прислониха", "Ульяновск"): ["05:00", "11:00", "16:00"],
            ("Тагай", "Сенгилей"): ["06:00", "13:00"],
            ("Сенгилей", "Прислониха"): ["07:00", "14:00"],
        }

        for (origin_name, dest_name), route in route_objects.items():
            def find_key(n1, n2):
                for key in departure_times:
                    if key[0] in n1 and key[1] in n2:
                        return key
                    if key[1] in n1 and key[0] in n2:
                        return key
                return None

            dep_times_key = find_key(origin_name, dest_name)
            times = departure_times.get(dep_times_key, ["08:00", "14:00"])

            def find_travel_key(n1, n2):
                for key in TRAVEL_HOURS:
                    if key[0] in n1 and key[1] in n2:
                        return key
                    if key[1] in n1 and key[0] in n2:
                        return key
                return None

            travel_key = find_travel_key(origin_name, dest_name)
            travel_hours = TRAVEL_HOURS.get(travel_key, 1)

            def find_price_key(n1, n2):
                for key in PRICES:
                    if key[0] in n1 and key[1] in n2:
                        return key
                    if key[1] in n1 and key[0] in n2:
                        return key
                return None

            price_key = find_price_key(origin_name, dest_name)
            price = PRICES.get(price_key, 200)

            bus = random.choice(bus_objects)

            # Создаем расписание на 7 дней
            for day_offset in range(7):
                route_date = today + timedelta(days=day_offset)
                for time_str in times:
                    hours, minutes = map(int, time_str.split(":"))
                    dep_time = route_date.replace(hour=hours, minute=minutes)

                    # Время прибытия
                    travel_minutes = int(travel_hours * 60)
                    arr_time = dep_time + timedelta(minutes=travel_minutes)

                    Schedule.objects.get_or_create(
                        bus=bus,
                        route=route,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        defaults={
                            "price": price,
                            "available_seats": bus.total_seats,
                        }
                    )
                    schedule_count += 1

        self.stdout.write(f"  ✓ Создано {schedule_count} записей расписания")

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS(
            f"✅ Успешно загружены местные данные!\n"
            f"   Городов: {len(LOCAL_CITIES)}\n"
            f"   Маршрутов: {len(seen_routes)}\n"
            f"   Автобусов: {len(bus_objects)}\n"
            f"   Расписаний: {schedule_count}"
        ))
        self.stdout.write("=" * 60)
