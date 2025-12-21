from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
	"""Sistema de roles para el control de gastos"""
	ROLE_CHOICES = [
		('admin', 'Administrador'),
		('user', 'Usuario Regular'),
	]

	name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
	description = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return self.get_name_display()


class User(AbstractUser):
	preferred_currency = models.CharField(max_length=10, default="USD")
	registered_at = models.DateTimeField(auto_now_add=True)
	# Rol asignado; puede ser null al crear migraciones, se asegura en señales
	role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name="users", null=True, blank=True)

	@property
	def is_admin(self):
		return self.role.name == 'admin'

	def __str__(self):
		return self.username


class Category(models.Model):
	name = models.CharField(max_length=100)
	color = models.CharField(max_length=20, default="#4f46e5")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="categories")
	is_default = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("name", "user")
		ordering = ["name"]

	def __str__(self):
		owner = self.user.username if self.user else "global"
		return f"{self.name} ({owner})"


class Movement(models.Model):
	class MovementType(models.TextChoices):
		INCOME = "INCOME", "Ingreso"
		EXPENSE = "EXPENSE", "Gasto"

	amount = models.DecimalField(max_digits=12, decimal_places=2)
	type = models.CharField(max_length=10, choices=MovementType.choices)
	date = models.DateField()
	description = models.TextField(blank=True)
	category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="movements")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="movements")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-date", "-id"]

	def __str__(self):
		return f"{self.get_type_display()} {self.amount} - {self.category.name}"


class Budget(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
	category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="budgets")
	month = models.CharField(max_length=7)  # YYYY-MM
	max_amount = models.DecimalField(max_digits=12, decimal_places=2)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("user", "category", "month")
		ordering = ["-month"]

	def __str__(self):
		return f"{self.category.name} {self.month}: {self.max_amount}"


class PasswordResetCode(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reset_codes")
	code = models.CharField(max_length=6)
	created_at = models.DateTimeField(auto_now_add=True)
	is_used = models.BooleanField(default=False)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"Reset code for {self.user} ({self.code})"
