from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        """
                        CREATE TABLE IF NOT EXISTS `api_role` (
                            `id` bigint AUTO_INCREMENT PRIMARY KEY,
                            `name` varchar(20) NOT NULL UNIQUE,
                            `description` longtext NOT NULL,
                            `created_at` datetime(6) NOT NULL,
                            KEY `api_role_name_idx` (`name`)
                        ) ENGINE=InnoDB;
                        """
                    ),
                    reverse_sql="DROP TABLE IF EXISTS `api_role`;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='Role',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('name', models.CharField(choices=[('admin', 'Administrador'), ('user', 'Usuario Regular')], max_length=20, unique=True)),
                        ('description', models.TextField()),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                    ],
                    options={
                        'ordering': ['name'],
                    },
                ),
            ],
        ),
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='users', to='api.role'),
        ),
    ]
