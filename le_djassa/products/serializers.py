from rest_framework import serializers
from .models import Produit, Categorie, ImageProduit
from users.models import Utilisateur
from users.serializers import UserDetailSerializer


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ('id', 'nom', 'description')


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = ('id', 'image')


class ProduitSerializer(serializers.ModelSerializer):
    vendeur = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.all(),
        required=False
    )
    images = ImageProduitSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    cree_le = serializers.DateTimeField(
        format="%d/%m/%Y",
        read_only=True
    )

    class Meta:
        model = Produit
        fields = (
            'id', 'nom', 'description', 'prix', 'etat',
            'localisation', 'est_vendu', 'vendeur',
            'categorie', 'uploaded_images', 'images',
            'qte_stock', 'cree_le'
        )

    def validate_uploaded_images(self, value):
        if len(value) > 6:
            raise serializers.ValidationError(
                "Vous ne pouvez télécharger que jusqu'à 6 images."
            )
        return value

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        produit = Produit.objects.create(**validated_data)

        if len(uploaded_images) + produit.images.count() > 6:
            produit.delete()
            raise serializers.ValidationError(
                "Vous ne pouvez télécharger que jusqu'à 6 images au total."
            )

        for image in uploaded_images:
            ImageProduit.objects.create(produit=produit, image=image)

        return produit

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])

        if instance.images.count() + len(uploaded_images) > 6:
            raise serializers.ValidationError(
                "Vous ne pouvez télécharger que jusqu'à 6 images au total."
            )

        instance = super().update(instance, validated_data)

        for image in uploaded_images:
            ImageProduit.objects.create(produit=instance, image=image)

        return instance


class ProduitDetailSerializer(serializers.ModelSerializer):
    vendeur = UserDetailSerializer(read_only=True)
    categorie = CategorieSerializer(read_only=True)
    images = ImageProduitSerializer(many=True, read_only=True)
    cree_le = serializers.DateTimeField(
        format="%d/%m/%Y",
        read_only=True
    )

    class Meta:
        model = Produit
        fields = (
            'id', 'nom', 'description', 'prix', 'etat',
            'localisation', 'est_vendu', 'qte_stock',
            'vendeur', 'categorie', 'images', 'cree_le'
        )
