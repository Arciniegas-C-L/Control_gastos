import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Exists, OuterRef, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Category, Movement, PasswordResetCode, Role
from .permissions import IsAdmin
from .serializers import (
	BudgetSerializer,
	CategorySerializer,
	MovementSerializer,
	RegisterSerializer,
	RoleSerializer,
	UserSerializer,
)


User = get_user_model()


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		return Response(UserSerializer(request.user).data)

	def put(self, request):
		serializer = UserSerializer(request.user, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
	serializer_class = CategorySerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		user_has_category = Category.objects.filter(user=user, name=OuterRef('name'))
		return (
			Category.objects.filter(Q(user=user) | (Q(user__isnull=True) & ~Exists(user_has_category)))
			.order_by('name')
		)


class MovementViewSet(viewsets.ModelViewSet):
	serializer_class = MovementSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		qs = Movement.objects.filter(user=self.request.user).select_related('category')
		start = self.request.query_params.get('start')
		end = self.request.query_params.get('end')
		category = self.request.query_params.get('category')
		mtype = self.request.query_params.get('type')

		if start:
			qs = qs.filter(date__gte=start)
		if end:
			qs = qs.filter(date__lte=end)
		if category:
			qs = qs.filter(category_id=category)
		if mtype:
			qs = qs.filter(type=mtype)
		return qs


class BudgetViewSet(viewsets.ModelViewSet):
	serializer_class = BudgetSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Budget.objects.filter(user=self.request.user).select_related('category')


class PasswordResetRequestView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		email = request.data.get('email')
		user = User.objects.filter(email=email).first()
		if user:
			code = f"{random.randint(0, 999999):06d}"
			PasswordResetCode.objects.create(user=user, code=code)
			# En un entorno real se enviaría el código por correo.
			response = {'detail': 'Si el correo existe, se envió un código.'}
			if settings.DEBUG:
				response['code'] = code
			return Response(response)
		return Response({'detail': 'Si el correo existe, se envió un código.'})


class PasswordResetConfirmView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		email = request.data.get('email')
		code = request.data.get('code')
		new_password = request.data.get('new_password')

		user = User.objects.filter(email=email).first()
		if not user:
			return Response({'detail': 'Código inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

		reset = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
		if not reset:
			return Response({'detail': 'Código inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

		if reset.created_at < timezone.now() - timedelta(minutes=30):
			return Response({'detail': 'Código expirado.'}, status=status.HTTP_400_BAD_REQUEST)

		user.set_password(new_password)
		user.save()
		reset.is_used = True
		reset.save(update_fields=['is_used'])
		return Response({'detail': 'Contraseña actualizada.'})


class ReportsSummaryView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user = request.user
		start = request.query_params.get('start')
		end = request.query_params.get('end')
		qs = Movement.objects.filter(user=user)
		if start:
			qs = qs.filter(date__gte=start)
		if end:
			qs = qs.filter(date__lte=end)

		totals = qs.values('type').annotate(total=Sum('amount'))
		income = next((t['total'] for t in totals if t['type'] == Movement.MovementType.INCOME), 0)
		expense = next((t['total'] for t in totals if t['type'] == Movement.MovementType.EXPENSE), 0)

		category_breakdown = list(
			qs.filter(type=Movement.MovementType.EXPENSE)
			.values('category__name', 'category__color')
			.annotate(total=Sum('amount'))
			.order_by('-total')
		)

		monthly = list(
			qs.annotate(month=TruncMonth('date'))
			.values('month', 'type')
			.annotate(total=Sum('amount'))
			.order_by('month')
		)

		return Response(
			{
				'income': income or 0,
				'expense': expense or 0,
				'balance': (income or 0) - (expense or 0),
				'category_breakdown': category_breakdown,
				'monthly': monthly,
			}
		)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
	"""ViewSet para gestionar roles. Solo lectura para usuarios autenticados."""
	queryset = Role.objects.all()
	serializer_class = RoleSerializer
	permission_classes = [permissions.IsAuthenticated]


class AdminUsersView(APIView):
	"""Vista para que administradores vean todos los usuarios del sistema."""
	permission_classes = [IsAdmin]

	def get(self, request):
		"""Obtiene lista de todos los usuarios con resumen de datos."""
		users = User.objects.prefetch_related('role', 'movements', 'categories').all()
		
		users_data = []
		for user in users:
			movements = user.movements.all()
			income = movements.filter(type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
			expense = movements.filter(type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0
			
			users_data.append({
				'id': user.id,
				'username': user.username,
				'email': user.email,
				'first_name': user.first_name,
				'last_name': user.last_name,
				'role': user.role.get_name_display(),
				'registered_at': user.registered_at,
				'total_movements': movements.count(),
				'total_income': float(income),
				'total_expense': float(expense),
				'balance': float(income - expense),
			})
		
		return Response(users_data)


class AdminUserDetailView(APIView):
	"""Vista para ver detalles completos de un usuario específico (solo admin)."""
	permission_classes = [IsAdmin]

	def get(self, request, user_id):
		"""Obtiene detalles completos de un usuario."""
		try:
			user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response(
				{'detail': 'Usuario no encontrado.'},
				status=status.HTTP_404_NOT_FOUND
			)

		movements = user.movements.all()
		income = movements.filter(type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
		expense = movements.filter(type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0

		category_breakdown = list(
			movements.filter(type='EXPENSE')
			.values('category__name', 'category__color')
			.annotate(total=Sum('amount'))
			.order_by('-total')
		)

		monthly = list(
			movements.annotate(month=TruncMonth('date'))
			.values('month', 'type')
			.annotate(total=Sum('amount'))
			.order_by('month')
		)

		user_detail = {
			'id': user.id,
			'username': user.username,
			'email': user.email,
			'first_name': user.first_name,
			'last_name': user.last_name,
			'preferred_currency': user.preferred_currency,
			'role': user.role.get_name_display(),
			'registered_at': user.registered_at,
			'statistics': {
				'total_movements': movements.count(),
				'total_income': float(income),
				'total_expense': float(expense),
				'balance': float(income - expense),
				'total_categories': user.categories.count(),
				'total_budgets': user.budgets.count(),
			},
			'category_breakdown': category_breakdown,
			'monthly': monthly,
		}

		return Response(user_detail)


class AdminDashboardView(APIView):
	"""Vista para el dashboard administrativo con estadísticas generales."""
	permission_classes = [IsAdmin]

	def get(self, request):
		"""Obtiene estadísticas generales del sistema."""
		total_users = User.objects.count()
		admin_users = User.objects.filter(role__name='admin').count()
		regular_users = User.objects.filter(role__name='user').count()

		all_movements = Movement.objects.all()
		total_income = all_movements.filter(type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
		total_expense = all_movements.filter(type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0

		top_users_by_activity = list(
			User.objects.annotate(movement_count=Sum(1))
			.values('id', 'username', 'email')
			.order_by('-movement_count')[:10]
		)

		top_categories = list(
			all_movements.filter(type='EXPENSE')
			.values('category__name', 'category__color')
			.annotate(total=Sum('amount'))
			.order_by('-total')[:10]
		)

		return Response({
			'total_users': total_users,
			'admin_users': admin_users,
			'regular_users': regular_users,
			'total_movements': all_movements.count(),
			'total_income': float(total_income),
			'total_expense': float(total_expense),
			'total_balance': float(total_income - total_expense),
			'top_users': top_users_by_activity,
			'top_categories': top_categories,
		})

