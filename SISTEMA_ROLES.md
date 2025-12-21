# Sistema de Roles - Control de Gastos

## 📋 Resumen

Se ha implementado un completo sistema de roles que permite:
- **Administradores**: Visualizar datos de todos los usuarios, estadísticas generales del sistema
- **Usuarios Regulares**: Gestionar únicamente sus propios datos

## 🏗️ Cambios Implementados

### Backend (Django)

#### 1. Nuevo Modelo: `Role`
```python
class Role(models.Model):
    - name: Choices ('admin', 'user')
    - description: TextField
    - created_at: DateTimeField
```

#### 2. Actualización del Modelo `User`
- Agregado campo `role` (ForeignKey a Role)
- Agregada propiedad `is_admin` para verificar si es administrador
- Campo `role` tiene valor por defecto 'user'

#### 3. Nuevo Archivo: `permissions.py`
Permisos personalizados:
- `IsAdmin`: Solo acceso para administradores
- `IsAdminOrReadOnly`: Admin completo acceso, usuarios regular solo lectura
- `IsAdminUser`: Verifica si es usuario admin

#### 4. Nuevas Vistas de Administración

**RoleViewSet** (ReadOnly)
- Endpoint: `/api/roles/`
- Obtiene lista de roles disponibles

**AdminDashboardView**
- Endpoint: `/api/admin/dashboard/`
- Solo administradores
- Retorna estadísticas globales:
  - Total usuarios
  - Usuarios admin y regulares
  - Ingresos y gastos totales
  - Top usuarios por actividad
  - Top categorías

**AdminUsersView**
- Endpoint: `/api/admin/users/`
- Solo administradores
- Retorna lista de todos los usuarios con:
  - Información básica
  - Totales de movimientos
  - Balance

**AdminUserDetailView**
- Endpoint: `/api/admin/users/<user_id>/`
- Solo administradores
- Retorna detalles completos de un usuario:
  - Datos personales
  - Estadísticas detalladas
  - Desglose por categoría
  - Datos mensuales

#### 5. Migraciones
- `0002_role_system.py`: Crea modelo Role y agrega campo a User
- `0003_default_roles.py`: Crea roles por defecto (admin, user)

#### 6. Actualización de Signals
Ahora al crear un usuario:
- Se asigna automáticamente el rol 'user'
- Se crean categorías por defecto

### Frontend (React)

#### 1. Nuevo Componente: `AdminSection.jsx`
- Muestra panel administrativo
- Solo visible para administradores
- Contiene:
  - Estadísticas generales del sistema
  - Tabla de usuarios
  - Detalles de usuario seleccionado

#### 2. Actualización: `Sidebar.jsx`
- Opción "Administración" visible solo para admins
- Muestra badge "👑 Admin" al lado del nombre del usuario

#### 3. Actualización: `DashboardPage.jsx`
- Importa y renderiza `AdminSection` cuando `activeSection === 'admin'`

#### 4. Estilos
- Nuevos estilos para sección admin en `App.css`
- Grid de estadísticas
- Tabla administrativa
- Tarjetas de detalle de usuario

#### 5. Serializers Actualizados
- `UserSerializer` incluye:
  - `role`: ID del rol
  - `role_name`: Nombre legible del rol
  - `is_admin`: Booleano

## 🚀 Instalación

### Paso 1: Aplicar Migraciones
```bash
cd backend
python manage.py migrate
```

Esto:
- Crea tabla de Roles
- Agrega campo role a User
- Crea los roles por defecto (admin, user)

### Paso 2: Crear Usuario Administrador (Opcional)
```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from api.models import Role

User = get_user_model()
admin_role = Role.objects.get(name='admin')
user = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='secure_password',
    first_name='Admin'
)
user.role = admin_role
user.save()
```

### Paso 3: Reiniciar el Servidor
```bash
python manage.py runserver
```

## 📡 Endpoints Disponibles

### Para Administradores

```
GET /api/admin/dashboard/
  Retorna: Estadísticas globales del sistema

GET /api/admin/users/
  Retorna: Lista de todos los usuarios

GET /api/admin/users/<user_id>/
  Retorna: Detalles completos de un usuario específico

GET /api/roles/
  Retorna: Lista de roles disponibles
```

## 👤 Estructura de Datos

### Respuesta Dashboard Admin
```json
{
  "total_users": 10,
  "admin_users": 1,
  "regular_users": 9,
  "total_movements": 150,
  "total_income": 5000.00,
  "total_expense": 3500.00,
  "total_balance": 1500.00,
  "top_users": [...],
  "top_categories": [...]
}
```

### Respuesta Users Admin
```json
[
  {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "Usuario Regular",
    "registered_at": "2025-01-01T10:00:00Z",
    "total_movements": 25,
    "total_income": 1000.00,
    "total_expense": 700.00,
    "balance": 300.00
  }
]
```

## 🔒 Seguridad

- Las vistas admin verifican `IsAdmin` permission
- Los usuarios regulares no pueden acceder a endpoints administrativos
- Cada usuario solo puede ver sus propios datos
- El rol se asigna automáticamente al crear un usuario

## 🎨 UI/UX

### Sidebar
- Opción "Administración" solo para admins
- Badge "👑 Admin" identifica administradores
- Misma experiencia de navegación que otros usuarios

### Dashboard Admin
- Estadísticas en tarjetas
- Tabla de usuarios clickeable
- Panel de detalles dinámico
- Responsive en móvil

## 🔄 Flujo de Usuario

### Usuario Regular
1. Se registra
2. Se le asigna automáticamente rol 'user'
3. Solo ve Dashboard, Estadísticas, Movimientos, Categorías
4. Solo puede ver y gestionar sus propios datos

### Administrador
1. Se crea manualmente con rol 'admin'
2. Ve todas las opciones del dashboard
3. Acceso a panel "Administración"
4. Puede ver datos de todos los usuarios
5. Acceso a estadísticas globales

## 📝 Notas Importantes

1. **Primera migración**: Requiere aplicar migraciones para crear roles
2. **Roles por defecto**: Se crean automáticamente en migración 0003
3. **Usuarios existentes**: Necesitan rol asignado manualmente o se asigna en siguiente login
4. **Tokens JWT**: Incluyen información de rol y is_admin en payload

## 🐛 Troubleshooting

### Error: "Role matching query does not exist"
- Verifica que las migraciones se han aplicado correctamente
- Ejecuta: `python manage.py migrate`

### Admin no ve opción de administración
- Verifica que el usuario tiene rol 'admin' en BD
- En shell: `user.role.name` debe retornar 'admin'

### Endpoint admin retorna 403
- El usuario no es administrador
- Verifica permisos con: `user.is_admin`
