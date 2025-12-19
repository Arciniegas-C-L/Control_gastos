import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Exists, OuterRef, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Budget, Category, Movement, PasswordResetCode
from .serializers import (
	BudgetSerializer,
	CategorySerializer,
	MovementSerializer,
	RegisterSerializer,
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
