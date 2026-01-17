from rest_framework import serializers
from .models import Commande, Conversation, Message, Evaluation
from users.serializers import UserDetailSerializer
from products.serializers import ProduitSerializer
from django.utils import formats
from datetime import datetime


class CommandeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commande
        fields = ('acheteur', 'produit', 'quantite', 'montant_total', 'statut', 'methode_paiement', 'infos_livraison')

    def create(self, validated_data):
        return Commande.objects.create(**validated_data)


class CommandeSerializer(serializers.ModelSerializer):
    acheteur = UserDetailSerializer()  # Sérialiseur imbriqué pour l'utilisateur acheteur
    produit = ProduitSerializer()  # Sérialiseur imbriqué pour le produit de la commande

    class Meta:
        model = Commande
        fields = (
            'id', 'acheteur', 'produit', 'montant_total', 'quantite', 'statut', 'methode_paiement', 'infos_livraison',
            'cree_le')


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ('id', 'acheteur', 'vendeur', 'produit')


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'expediteur', 'contenu', 'timestamp')


class EvaluationSerializer(serializers.ModelSerializer):
    noteur = UserDetailSerializer()  # Sérialiseur imbriqué pour l'utilisateur qui donne la note

    class Meta:
        model = Evaluation
        fields = ('id', 'commande', 'noteur', 'note', 'commentaire')


class HistoriqueCommandeSerializer(serializers.ModelSerializer):
    produit_nom = serializers.SerializerMethodField()
    cree_le_formate = serializers.SerializerMethodField()
    montant_total_formate = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = ['id', 'produit_nom', 'cree_le_formate', 'statut', 'montant_total_formate']

    def get_produit_nom(self, obj):
        # Retourne le nom du produit au lieu de son ID
        return obj.produit.nom

    def get_cree_le_formate(self, obj):
        # Formate la date en français
        return formats.date_format(obj.cree_le, "DATE_FORMAT")

    def get_montant_total_formate(self, obj):
        # Formate le montant sans décimale, avec des espaces comme séparateurs
        montant = round(obj.montant_total)  # Retire les décimales
        return "{:,}".format(montant).replace(",", " ")  # Remplace les virgules par des espaces
