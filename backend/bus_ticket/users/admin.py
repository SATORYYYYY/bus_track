from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'birth_date', 'passport_number', 'has_luggage')
    search_fields = ('user__username', 'full_name', 'passport_number')