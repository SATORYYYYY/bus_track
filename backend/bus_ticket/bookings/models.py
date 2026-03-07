from django.db import models
from django.contrib.auth.models import User

class Booking(models.Model):
    user = models.ForeignKey(User, verbose_name="Пользователь", on_delete=models.SET_NULL, null=True, blank=True)
    schedule = models.ForeignKey('buses.Schedule', verbose_name="Рейс", on_delete=models.CASCADE)
    passenger_name = models.CharField("ФИО пассажира", max_length=100)
    passenger_age = models.IntegerField("Возраст")
    passenger_email = models.EmailField("Email")
    passport_number = models.CharField("Номер паспорта", max_length=20)
    has_luggage = models.BooleanField("Багаж", default=False)
    seat_number = models.IntegerField("Номер места")
    booking_date = models.DateTimeField("Дата бронирования", auto_now_add=True)
    status = models.CharField("Статус", max_length=20, default='pending')
    booking_code = models.CharField("Код бронирования", max_length=20, unique=True)

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"

    def __str__(self):
        return self.booking_code