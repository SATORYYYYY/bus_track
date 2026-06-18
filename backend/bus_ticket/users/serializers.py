from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('full_name', 'birth_date', 'passport_number', 'has_luggage')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile', 'is_staff', 'is_active', 'date_joined')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Создаем профиль, если его нет
        profile, created = Profile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Убеждаемся что профиль есть в выдаче
        if not representation.get('profile'):
            profile, _ = Profile.objects.get_or_create(user=instance)
            representation['profile'] = ProfileSerializer(profile).data
        return representation