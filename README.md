## Control de gastos (Django + React)

### Backend
1. Crear entorno y deps:
	```bash
	cd backend
	pip install -r ../requirements.txt
	cp .env.example .env  # Ajusta SECRET_KEY
	```
2. Migraciones y admin:
	```bash
	python manage.py migrate
	python manage.py createsuperuser
	python manage.py runserver
	```
3. Endpoints clave:
	- Auth: `/api/auth/register/`, `/api/auth/token/`, `/api/auth/profile/`
	- Datos: `/api/categories/`, `/api/movements/`, `/api/budgets/`, `/api/reports/summary/`

### Frontend
1. Variables:
	```bash
	cd frontend
	cp .env.example .env  # VITE_API_URL
	```
2. Instalar deps y correr:
	```bash
	npm install
	npm run dev
	```

### Flujo rápido
- Regístrate en `/api/auth/register/` o desde la UI.
- Inicia sesión en la UI, crea categorías y movimientos.
- Visualiza gráficas y totales en el dashboard.
