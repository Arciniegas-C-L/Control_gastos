from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Budget, Category, Movement, PasswordResetCode, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	fieldsets = BaseUserAdmin.fieldsets + (
		('Extra', {'fields': ('preferred_currency',)}),
	)
	list_display = ('username', 'email', 'preferred_currency', 'is_staff', 'is_superuser')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('name', 'color', 'user', 'is_default', 'created_at')
	search_fields = ('name',)
	list_filter = ('is_default',)


@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):
	list_display = ('type', 'amount', 'date', 'category', 'user', 'created_at')
	list_filter = ('type', 'date', 'category')
	search_fields = ('description',)


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
	list_display = ('category', 'user', 'month', 'max_amount')
	list_filter = ('month', 'category')


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
	list_display = ('user', 'code', 'created_at', 'is_used')
