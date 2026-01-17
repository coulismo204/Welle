from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Utilisateur
from products.models import Produit


# Modèle de commande
class Commande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_traitement', 'En traitement'),
        ('livraison_en_cours', 'Livraison en cours'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]

    METHODES_PAIEMENT = [
        ('carte_credit', 'Carte de crédit'),
        ('paypal', 'PayPal'),
        ('espece_sur_place', 'Espèces sur place'),
    ]

    acheteur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='commandes_passees')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='commandes')
    quantite = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES)
    methode_paiement = models.CharField(max_length=50, choices=METHODES_PAIEMENT)
    infos_livraison = models.TextField(blank=True, null=True)
    cree_le = models.DateTimeField(auto_now_add=True)
    date_en_traitement = models.DateTimeField(null=True, blank=True)
    date_livraison = models.DateTimeField(null=True, blank=True)
    date_livree = models.DateTimeField(null=True, blank=True)
    date_annulee = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Commande {self.id} par {self.acheteur.username}'


class HistoriqueStatutCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='historique_statuts')
    statut = models.CharField(max_length=50, choices=Commande.STATUT_CHOICES)
    date_changement = models.DateTimeField(auto_now_add=True)
    commentaire = models.TextField(null=True, blank=True)
    modifie_par = models.ForeignKey('users.Utilisateur', on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-date_changement']


# Modèle de conversation
class Conversation(models.Model):
    acheteur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE,
                                 related_name='conversations_en_tant_qu_acheteur')
    vendeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='conversations_en_tant_qu_vendeur')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='conversations')

    def __str__(self):
        return f'Conversation à propos de {self.produit.nom}'


# Modèle de message
class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    expediteur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='messages_envoyes')
    contenu = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message de {self.expediteur.username} à {self.timestamp}'


# Modèle de notation
class Evaluation(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='evaluations')
    noteur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='notes_attribuees')
    note = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    commentaire = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'Évaluation {self.note} par {self.noteur.username}'
