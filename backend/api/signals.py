from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Category, User

DEFAULT_CATEGORIES = [
    ("Alimentación", "#f59e0b"),
    ("Transporte", "#3b82f6"),
    ("Vivienda", "#10b981"),
    ("Entretenimiento", "#8b5cf6"),
    ("Salud", "#ef4444"),
    ("Educación", "#6366f1"),
]


@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if not created:
        return
    for name, color in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            name=name,
            user=None,
            defaults={"color": color, "is_default": True},
        )
