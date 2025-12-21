from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
	"""
	Permiso que solo permite el acceso a administradores.
	"""
	def has_permission(self, request, view):
		return request.user and request.user.is_authenticated and request.user.is_admin


class IsAdminOrReadOnly(permissions.BasePermission):
	"""
	Permiso que permite a administradores hacer cualquier cosa,
	y a usuarios regulares solo lectura.
	"""
	def has_permission(self, request, view):
		if request.method in permissions.SAFE_METHODS:
			return request.user and request.user.is_authenticated
		return request.user and request.user.is_authenticated and request.user.is_admin


class IsAdminUser(permissions.BasePermission):
	"""
	Permite el acceso solo a usuarios con rol de administrador.
	"""
	def has_permission(self, request, view):
		return bool(request.user and request.user.is_admin)
