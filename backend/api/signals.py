from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Category, Role, User

DEFAULT_CATEGORIES = [
    ("Alimentación", "#f59e0b"),
    ("Transporte", "#3b82f6"),
    ("Vivienda", "#10b981"),
    ("Entretenimiento", "#8b5cf6"),
    ("Salud", "#ef4444"),
    ("Educación", "#6366f1"),
]


@receiver(post_save, sender=User)
def assign_user_role_and_create_default_categories(sender, instance, created, **kwargs):
    """Asigna rol de usuario regular y crea categorías por defecto."""
    if not created:
        return
    
    # Asignar rol de usuario regular si no tiene uno
    if not instance.role_id:
        try:
            user_role = Role.objects.get(name='user')
            instance.role = user_role
            instance.save(update_fields=['role'])
        except Role.DoesNotExist:
            pass
    
    # Crear categorías por defecto
    for name, color in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            name=name,
            user=None,
            defaults={"color": color, "is_default": True},
        )
