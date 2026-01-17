from django.contrib.auth.models import AbstractUser, Group, Permission, BaseUserManager  
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid


class UtilisateurManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("Le nom d'utilisateur est obligatoire")
        if not email:
            raise ValueError("L'email est obligatoire")

        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class Utilisateur(AbstractUser):
    # Champs supplémentaires pour l'utilisateur
    numero_telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    est_vendeur = models.BooleanField(default=False)
    photo_profil = models.ImageField(upload_to='photos_profil/', blank=True, null=True)
    photo_cni_recto = models.ImageField(upload_to='photos_cni_recto/', blank=True, null=True)
    photo_cni_verso = models.ImageField(upload_to='photos_cni_verso/', blank=True, null=True)
    nom_boutique = models.CharField(max_length=100, blank=True, null=True)

    # Relations personnalisées avec les groupes et les permissions
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groupes'),
        blank=True,
        related_name='utilisateurs',
        related_query_name='utilisateur',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('permissions utilisateur'),
        blank=True,
        related_name='utilisateurs',
        related_query_name='utilisateur',
    )

    # Méthode pour afficher le nom d'utilisateur
    def __str__(self):
        return self.username

    class Meta:
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")


class PasswordResetCode(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    code = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_used and (timezone.now() - self.created_at).seconds < 3600