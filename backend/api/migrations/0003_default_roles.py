from django.db import migrations


def create_default_roles(apps, schema_editor):
    """Crea los roles por defecto del sistema."""
    Role = apps.get_model('api', 'Role')
    User = apps.get_model('api', 'User')
    
    Role.objects.get_or_create(
        name='admin',
        defaults={
            'description': 'Administrador del sistema. Puede ver todos los usuarios y estadísticas generales.'
        }
    )
    
    Role.objects.get_or_create(
        name='user',
        defaults={
            'description': 'Usuario regular. Solo puede ver y gestionar sus propios datos.'
        }
    )

    # Asignar rol 'user' a usuarios existentes sin rol
    user_role = Role.objects.filter(name='user').first()
    if user_role:
        User.objects.filter(role__isnull=True).update(role=user_role)


def reverse_roles(apps, schema_editor):
    """Elimina los roles por defecto."""
    Role = apps.get_model('api', 'Role')
    Role.objects.filter(name__in=['admin', 'user']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_role_system'),
    ]

    operations = [
        migrations.RunPython(create_default_roles, reverse_roles),
    ]
