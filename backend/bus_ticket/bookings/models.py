from django.db import models
from django.contrib.auth.models import User

class Booking(models.Model):
    DISCOUNT_CHOICES = [
        ('none', 'Без льготы'),
        ('pensioner', 'Пенсионер'),
        ('student', 'Студент'),
        ('disabled', 'Инвалид'),
        ('child', 'Ребенок до 7 лет'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Ожидает оплаты'),
        ('paid', 'Оплачен'),
        ('confirmed', 'Подтвержден'),
        ('cancelled', 'Отменен'),
        ('completed', 'Завершен'),
    ]

    user = models.ForeignKey(User, verbose_name="Пользователь", on_delete=models.SET_NULL, null=True, blank=True)
    schedule = models.ForeignKey('buses.Schedule', verbose_name="Рейс", on_delete=models.CASCADE)
    passenger_name = models.CharField("ФИО пассажира", max_length=100)
    passenger_age = models.IntegerField("Возраст")
    passenger_email = models.EmailField("Email")
    passport_number = models.CharField("Номер паспорта", max_length=20)
    has_luggage = models.BooleanField("Багаж", default=False)
    seat_number = models.IntegerField("Номер места")
    booking_date = models.DateTimeField("Дата бронирования", auto_now_add=True)
    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_code = models.CharField("Код бронирования", max_length=20, unique=True)
    discount_type = models.CharField("Тип льготы", max_length=20, choices=DISCOUNT_CHOICES, default='none')
    final_price = models.DecimalField("Итоговая цена", max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"

    def __str__(self):
        return self.booking_code

    def calculate_discount(self):
        """Расчет скидки в процентах"""
        discounts = {
            'none': 0,
            'pensioner': 50,
            'student': 30,
            'disabled': 50,
            'child': 100,
        }
        return discounts.get(self.discount_type, 0)

    def get_final_price(self, base_price):
        """Расчет итоговой цены с учетом льготы"""
        discount_percent = self.calculate_discount()
        return base_price * (100 - discount_percent) / 100