from django.db import models
from users.models import Utilisateur


# Modèle de catégorie
class Categorie(models.Model):
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom


# Modèle de produit
class Produit(models.Model):
    ETATS = [
        ('neuf', 'Neuf'),
        ('casi_neuf', 'Casi neuf'),
        ('usage', 'D\'occasion'),
        ('pour_pieces', 'Pour pièces'),
    ]

    nom = models.CharField(max_length=255)
    description = models.TextField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    etat = models.CharField(max_length=50, choices=ETATS)
    localisation = models.CharField(max_length=255)
    est_vendu = models.BooleanField(default=False)
    qte_stock = models.PositiveIntegerField(default=0)
    vendeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='produits_vendus')
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name='produits')
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom


# Modèle d'image de produit
class ImageProduit(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='images_produit')

    def __str__(self):
        return self.produit.nom + ' - ' + str(self.id)