from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserRegistrationSerializer, UserUpdateSerializer, UserDetailSerializer
from .models import Utilisateur, PasswordResetCode
from django.core.mail import send_mail
from django.conf import settings
from .permissions import IsBuyer, IsSeller
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password


class UserRegistrationView(generics.CreateAPIView):
    queryset = Utilisateur.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        subject = 'Bienvenue au djassa'
        message = f'Bonjour {user.username},\n\nMerci de vous être inscrit sur notre plateforme!'
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


class UserDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Utilisateur.objects.all()
    permission_classes = [IsAuthenticated, IsSeller]

    def get_serializer_class(self):
        return UserUpdateSerializer if self.request.method in ['PUT', 'PATCH'] else UserDetailSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class UserDetailUpdateViewBuyer(generics.RetrieveUpdateAPIView):
    queryset = Utilisateur.objects.all()
    permission_classes = [IsAuthenticated, IsBuyer]  # Permission personnalisée ici

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.est_vendeur:
            return Response({'role': 'vendeur', 'redirect_url': '/uservendeur-interface/'})
        else:
            return Response({'role': 'acheteur', 'redirect_url': '/customer/MyAccount/'})


class CheckAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, role):
        user = request.user
        if role == 'vendeur' and not user.est_vendeur:
            raise PermissionDenied("Vous devez être vendeur pour accéder à cette page. Veuillez faire une demande "
                                   "pour devenir vendeur.")
        elif role == 'acheteur' and user.est_vendeur:
            raise PermissionDenied("Cette page est réservée aux acheteurs.")
        return Response({'access': True})


class GetPremierLettreNameUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Extraire la première lettre du nom
        initial = user.first_name[0] if user.first_name else user.username[0]
        return JsonResponse({'initial': initial})


# View pour les utilisateurs non connectés
class RequestPasswordResetView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        try:
            user = Utilisateur.objects.get(email=email)

            # Vérifi si un code actif existe déjà
            existing_code = PasswordResetCode.objects.filter(
                user=user,
                is_used=False,
                created_at__gte=timezone.now() - timedelta(hours=1)
            ).first()

            if existing_code:
                # Réutilise le code existant
                reset_code = existing_code
                message_detail = 'Un lien de réinitialisation vous a déjà été envoyé. Un nouveau mail vous a été transmis.'
            else:
                # Création d'un nouveau code
                reset_code = PasswordResetCode.objects.create(user=user)
                message_detail = 'Un e-mail a été envoyé avec les instructions.'

            reset_link = f"{settings.FRONTEND_URL}/reset-password/?code={reset_code.code}&email={email}"
            subject = 'Réinitialisation de mot de passe'
            message = f'Cliquez sur le lien pour réinitialiser votre mot de passe : {reset_link}'
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

            return Response({'detail': message_detail})

        except Utilisateur.DoesNotExist:
            return Response(
                {'detail': 'Aucun utilisateur trouvé avec cet e-mail.'},
                status=status.HTTP_404_NOT_FOUND
            )


# Vue pour réinitialisation dans le profil utilisateur
class ResetPasswordInProfileView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not check_password(current_password, user.password):
            return Response({'detail': 'Le mot de passe actuel est incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'detail': 'Les nouveaux mots de passe ne correspondent pas.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Le mot de passe a été réinitialisé avec succès.'})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        try:
            reset_code = PasswordResetCode.objects.get(code=code)
            if reset_code.is_valid():
                user = reset_code.user
                user.set_password(new_password)
                user.save()
                reset_code.is_used = True
                reset_code.save()
                return Response({'detail': 'Le mot de passe a été réinitialisé avec succès.'})
            else:
                return Response({'detail': 'Le code de réinitialisation est invalide ou a expiré.'},
                                status=status.HTTP_400_BAD_REQUEST)
        except PasswordResetCode.DoesNotExist:
            return Response({'detail': 'Code de réinitialisation invalide.'}, status=status.HTTP_404_NOT_FOUND)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("newPassword")

        try:
            user = Utilisateur.objects.get(email=email)
            reset_code = PasswordResetCode.objects.get(user=user, code=code)

            # Vérifie si le code a déjà été utilisé
            if reset_code.is_used:
                return Response(
                    {'detail': 'Ce code de réinitialisation a déjà été utilisé. Veuillez faire une nouvelle demande.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifi si le code est toujours valide en utilisant la méthode is_valid()
            if not reset_code.is_valid():
                return Response(
                    {'detail': 'Le code de réinitialisation a expiré. Veuillez faire une nouvelle demande.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Réinitialisation du mot de passe
            user.password = make_password(new_password)
            user.save()

            # Marque le code comme utilisé au lieu de le supprimer
            reset_code.is_used = True
            reset_code.save()

            return Response(
                {'detail': 'Mot de passe réinitialisé avec succès.'},
                status=status.HTTP_200_OK
            )

        except Utilisateur.DoesNotExist:
            return Response(
                {'detail': "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        except PasswordResetCode.DoesNotExist:
            return Response(
                {'detail': "Code de réinitialisation non valide."},
                status=status.HTTP_400_BAD_REQUEST
            )