from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilisateur


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'password', 'password2', 'adresse', 'est_vendeur')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password2": "Les mots de passe ne correspondent pas"
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')

        user = Utilisateur.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            adresse=validated_data.get('adresse', ''),
            est_vendeur=validated_data.get('est_vendeur', False),
            password=validated_data['password'],
        )
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'adresse', 'est_vendeur', 'numero_telephone',
            'nom_boutique', 'photo_cni_recto', 'photo_cni_verso',
            'photo_profil'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'adresse', 'est_vendeur', 'numero_telephone',
            'nom_boutique', 'photo_cni_recto', 'photo_cni_verso',
            'photo_profil'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'adresse': {'required': False},
            'est_vendeur': {'required': False},
            'numero_telephone': {'required': False},
            'nom_boutique': {'required': False},
            'photo_cni_recto': {'required': False},
            'photo_cni_verso': {'required': False},
            'photo_profil': {'required': False},
        }
