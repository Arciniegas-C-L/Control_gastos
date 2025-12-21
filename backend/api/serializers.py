from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Budget, Category, Movement, Role


User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
	class Meta:
		model = Role
		fields = ['id', 'name', 'description', 'created_at']
		read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
	role_name = serializers.CharField(source='role.get_name_display', read_only=True)
	is_admin = serializers.BooleanField(read_only=True)

	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'first_name', 'last_name', 'preferred_currency', 'registered_at', 'role', 'role_name', 'is_admin']
		read_only_fields = ['id', 'registered_at', 'role', 'is_admin']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'is_default', 'created_at']
        read_only_fields = ['id', 'is_default', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class MovementSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = Movement
        fields = [
            'id', 'amount', 'type', 'date', 'description', 'category', 'category_name', 'category_color',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name', 'category_color']

    def validate_category(self, category):
        user = self.context['request'].user
        if category.user not in (None, user):
            raise serializers.ValidationError('No puedes usar esta categoría.')
        return category

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Ensure user cannot change owner
        validated_data['user'] = instance.user
        return super().update(instance, validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'month', 'max_amount', 'category', 'category_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'category_name']

    def validate_category(self, category):
        user = self.context['request'].user
        if category.user not in (None, user):
            raise serializers.ValidationError('No puedes usar esta categoría.')
        return category

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
