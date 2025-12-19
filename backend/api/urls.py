from django.urls import path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
	BudgetViewSet,
	CategoryViewSet,
	MovementViewSet,
	PasswordResetConfirmView,
	PasswordResetRequestView,
	ProfileView,
	RegisterView,
	ReportsSummaryView,
)

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'movements', MovementViewSet, basename='movement')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
	path('auth/register/', RegisterView.as_view(), name='auth-register'),
	path('auth/profile/', ProfileView.as_view(), name='auth-profile'),
	path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
	path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
	path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('reports/summary/', ReportsSummaryView.as_view(), name='reports-summary'),
] + router.urls
