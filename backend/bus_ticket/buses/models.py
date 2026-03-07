from django.db import models

class Bus(models.Model):
    number = models.CharField("Номер", max_length=20, unique=True)
    model = models.CharField("Модель", max_length=100)
    total_seats = models.IntegerField("Количество мест")
    amenities = models.TextField("Удобства", blank=True)

    class Meta:
        verbose_name = "Автобус"
        verbose_name_plural = "Автобусы"

    def __str__(self):
        return f"{self.number} - {self.model}"

class City(models.Model):
    name = models.CharField("Название", max_length=100, unique=True)
    region = models.CharField("Регион", max_length=100, blank=True)
    population = models.IntegerField("Население", null=True, blank=True)
    is_active = models.BooleanField("Активен", default=True)

    class Meta:
        verbose_name = "Город"
        verbose_name_plural = "Города"
        ordering = ['name']

    def __str__(self):
        return self.name

class Route(models.Model):
    origin = models.ForeignKey(City, verbose_name="Откуда", on_delete=models.CASCADE, related_name='routes_from')
    destination = models.ForeignKey(City, verbose_name="Куда", on_delete=models.CASCADE, related_name='routes_to')
    distance_km = models.IntegerField("Расстояние (км)")

    class Meta:
        unique_together = ('origin', 'destination')
        verbose_name = "Маршрут"
        verbose_name_plural = "Маршруты"

    def __str__(self):
        return f"{self.origin.name} → {self.destination.name}"

class Schedule(models.Model):
    bus = models.ForeignKey(Bus, verbose_name="Автобус", on_delete=models.CASCADE)
    route = models.ForeignKey(Route, verbose_name="Маршрут", on_delete=models.CASCADE)
    departure_time = models.DateTimeField("Время отправления")
    arrival_time = models.DateTimeField("Время прибытия")
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    available_seats = models.IntegerField("Свободных мест")

    class Meta:
        verbose_name = "Расписание"
        verbose_name_plural = "Расписания"

    def __str__(self):
        return f"{self.route} - {self.departure_time}"