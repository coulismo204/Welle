from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


class IsBuyer(BasePermission):
    """
    Permission permettant uniquement aux acheteurs (non vendeurs) de consulter ou modifier leurs informations personnelles.
    """

    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est authentifié et s'il n'est pas vendeur
        if not request.user.is_authenticated or request.user.est_vendeur:
            raise PermissionDenied(detail="Accès réservé aux acheteurs uniquement.")
        return True


class IsSeller(BasePermission):
    message = "Accès non autorisé."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            self.message = "Vous devez être connecté pour accéder à cette ressource."
            return False
        if not request.user.est_vendeur:
            self.message = "Accès réservé aux vendeurs uniquement."
            return False
        return True