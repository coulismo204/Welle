from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Commande, HistoriqueStatutCommande
from .serializers import CommandeCreateSerializer, CommandeSerializer, HistoriqueCommandeSerializer
from rest_framework.permissions import IsAuthenticated
from products.models import Produit
from django.utils import timezone
from django.db import transaction
from twilio.rest import Client
from django.core.mail import send_mail
from django.conf import settings
from decouple import config
from rest_framework import serializers


class CreateCommandeView(APIView):
    permission_classes = [IsAuthenticated]

    def format_commande_data(self, commande_data):
        """Formatage des détails d'une commande pour les notifications."""
        return "\n".join([f"{key.capitalize()}: {value}" for key, value in commande_data.items()])

    def send_email(self, vendeur_email, commande_data):
        """Envoi d'une notification par email."""
        try:
            subject = 'Nouvelle commande reçue'
            message = f"Bonjour, vous avez une nouvelle commande. Détails :\n\n{self.format_commande_data(commande_data)}"
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [vendeur_email])
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email : {e}")

    def send_sms(self, vendeur_phone, commande_data):
        """Envoi d'une notification par SMS."""
        try:
            client = Client(config('TWILIO_ACCOUNT_SID'), config('TWILIO_AUTH_TOKEN'))
            client.messages.create(
                body=f"Vous avez une nouvelle commande. Détails :\n\n{self.format_commande_data(commande_data)}",
                from_=config('TWILIO_SMS_FROM'),
                to=vendeur_phone
            )
        except Exception as e:
            print(f"Erreur lors de l'envoi du SMS : {e}")

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        utilisateur = request.user
        data = request.data
        commandes_crees = []

        for item in data:
            produit_id = item['produit']
            try:
                # Vérifions si le produit existe et le stock est suffisant
                produit = Produit.objects.get(id=produit_id)
                if produit.qte_stock < item['quantity']:
                    return Response({
                        'message': f"Stock insuffisant pour le produit {produit.nom}. Disponible : {produit.qte_stock}."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Sérialiser les données
                serializer = CommandeCreateSerializer(data={
                    'acheteur': utilisateur.id,
                    'produit': produit_id,
                    'quantite': item['quantity'],
                    'montant_total': item['montant_total'],
                    'statut': 'en_attente',
                    'methode_paiement': 'espece_sur_place',
                    'infos_livraison': item['adresse_livraison']
                })

                if serializer.is_valid():
                    commande = serializer.save()
                    commandes_crees.append(CommandeSerializer(commande).data)

                    # Mise à jour du stock
                    produit.qte_stock -= item['quantity']
                    produit.save()

                    # Notifications au vendeur
                    vendeur = produit.vendeur
                    commande_data = {
                        "produit": produit.nom,
                        "quantite": str(commande.quantite),
                        "montant_total": f"{commande.montant_total} Fr CFA"
                    }
                    self.send_email(vendeur.email, commande_data)
                    self.send_sms(vendeur.numero_telephone, commande_data)

                else:
                    return Response({
                        'message': 'Échec de la création de la commande.',
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

            except Produit.DoesNotExist:
                return Response({
                    'message': f"Produit avec ID {produit_id} introuvable."
                }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'message': 'Commandes créées avec succès !',
            'commandes': commandes_crees
        }, status=status.HTTP_201_CREATED)


class CommandesVendeurView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupérons tous les produits dont l'utilisateur connecté est le vendeur
        produits_vendeur = Produit.objects.filter(vendeur=request.user)

        # Récupérons toutes les commandes pour ces produits
        commandes = Commande.objects.filter(produit__in=produits_vendeur).order_by('-cree_le')

        # Sérialiser les commandes
        serializer = CommandeSerializer(commandes, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class TraiterCommandeView(APIView):
    permission_classes = [IsAuthenticated]

    # Définissons les transitions de statut valides
    TRANSITIONS_VALIDES = {
        'en_attente': ['en_traitement', 'annulee'],
        'en_traitement': ['livraison_en_cours', 'annulee'],
        'livraison_en_cours': ['livree', 'annulee'],
        'livree': [],  # Statut final, pas de transition possible
        'annulee': []  # Statut final, pas de transition possible
    }

    def _get_status_date_field(self, status_name):
        """Retourne le nom du champ de date correspondant au statut"""
        status_date_mapping = {
            'en_traitement': 'date_en_traitement',
            'livraison_en_cours': 'date_livraison',  # Pas de champ spécifique
            'livree': 'date_livree',
            'annulee': 'date_annulee'
        }
        return status_date_mapping.get(status_name)

    def _create_status_history(self, commande, nouveau_statut, utilisateur):
        """Crée une entrée dans l'historique des statuts"""
        commentaire = f"Commande passée en statut : {dict(Commande.STATUT_CHOICES)[nouveau_statut]}"
        if nouveau_statut == 'annulee':
            commentaire = "Commande annulée par le vendeur"

        return HistoriqueStatutCommande.objects.create(
            commande=commande,
            statut=nouveau_statut,
            commentaire=commentaire,
            modifie_par=utilisateur
        )

    def _send_notification(self, client_email, client_phone, statut_commande):
        """Envoie un email et un SMS de notification selon le statut."""
        subject = f'Statut de votre commande: {statut_commande}'
        message = f"Bonjour, votre commande est maintenant en statut '{statut_commande}'."

        # Envoi de l'email
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [client_email])
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email : {e}")

        # Envoi du SMS
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_SMS_FROM,
                to=client_phone
            )
        except Exception as e:
            print(f"Erreur lors de l'envoi du SMS : {e}")

    @transaction.atomic
    def post(self, request, commande_id):
        try:
            commande = Commande.objects.get(id=commande_id, produit__vendeur=request.user)
            nouveau_statut = request.data.get('action')

            # Vérifi si la transition est valide
            if nouveau_statut not in self.TRANSITIONS_VALIDES[commande.statut]:
                return Response({
                    'message': 'Transition de statut non autorisée',
                    'statut_actuel': commande.statut,
                    'statut_demande': nouveau_statut
                }, status=status.HTTP_400_BAD_REQUEST)

            # Mise à jour du statut
            commande.statut = nouveau_statut

            # Mettre à jour la date correspondante si elle existe
            date_field = self._get_status_date_field(nouveau_statut)
            if date_field:
                setattr(commande, date_field, timezone.now())

            commande.save()

            # Création de l'historique
            historique = self._create_status_history(commande, nouveau_statut, request.user)

            if nouveau_statut == 'annulee':
                produit = commande.produit
                produit.qte_stock += commande.quantite
                produit.save()

            # Notifications
            self._send_notification(commande.acheteur.email, commande.acheteur.numero_telephone, nouveau_statut)

            return Response({
                'message': f'Commande mise à jour avec succès. Nouveau statut: {nouveau_statut}',
                'statut': nouveau_statut,
                'date_mise_a_jour': historique.date_changement
            }, status=status.HTTP_200_OK)

        except Commande.DoesNotExist:
            return Response({
                'message': 'Commande non trouvée ou vous n\'êtes pas autorisé à la modifier.'
            }, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, commande_id):
        try:
            commande = Commande.objects.get(id=commande_id, produit__vendeur=request.user)
            historique_statuts = HistoriqueStatutCommande.objects.filter(commande=commande).order_by('-date_changement')

            # Formater l'historique
            historique_data = [{
                'statut': statut.statut,
                'date_changement': statut.date_changement,
                'commentaire': statut.commentaire,
                'modifie_par': statut.modifie_par.username if statut.modifie_par else 'N/A'
            } for statut in historique_statuts]

            # Construire la réponse détaillée
            return Response({
                'id': commande.id,
                'date_creation': commande.cree_le,
                'statut': commande.statut,
                'acheteur': {
                    'nom': commande.acheteur.username,
                    'email': commande.acheteur.email,
                    'adresse': commande.acheteur.adresse,
                    'infos_livraison': commande.infos_livraison
                },
                'produit': {
                    'nom': commande.produit.nom,
                    'qte': commande.quantite,
                    'prix': commande.produit.prix
                },
                'montant_total': commande.montant_total,
                'historique_statuts': historique_data,
                'transitions_possibles': self.TRANSITIONS_VALIDES[commande.statut]
            }, status=status.HTTP_200_OK)

        except Commande.DoesNotExist:
            return Response({
                'message': 'Commande non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)


class CommandeDetailClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, commande_id):
        try:
            commande = Commande.objects.get(
                id=commande_id,
                acheteur=request.user
            )

            historique = HistoriqueStatutCommande.objects.filter(
                commande=commande
            ).order_by('-date_changement')

            # Récupérer la première image du produit s'il en a
            image_url = None
            if commande.produit.images.first():
                image_url = commande.produit.images.first().image.url

            response_data = {
                'id': commande.id,
                'produit': {
                    'nom': commande.produit.nom,
                    'description': commande.produit.description,
                    'prix_unitaire': commande.produit.prix,
                    'image': image_url,  # Utilisation de l'URL de la première image
                    'vendeur': {
                        'nom': commande.produit.vendeur.username,
                        'email': commande.produit.vendeur.email
                    }
                },
                'commande': {
                    'quantite': commande.quantite,
                    'montant_total': commande.montant_total,
                    'statut': commande.statut,
                    'methode_paiement': commande.methode_paiement,
                    'infos_livraison': commande.infos_livraison,
                    'cree_le': commande.cree_le,
                    'date_livraison_prevue': commande.date_livraison
                },
                'historique': [{
                    'statut': h.statut,
                    'date': h.date_changement,
                    'commentaire': h.commentaire
                } for h in historique]
            }

            return Response(response_data)

        except Commande.DoesNotExist:
            return Response(
                {'message': 'Commande non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )


class HistoriqueCommandesView(APIView):
    permission_classes = [IsAuthenticated]  # L'utilisateur doit être connecté

    def get(self, request):
        utilisateur = request.user

        # Vérifie si l'utilisateur est un client (non-vendeur)
        if utilisateur.est_vendeur:
            return Response({"detail": "Accès refusé. Cette section est réservée aux clients."},
                            status=status.HTTP_403_FORBIDDEN)

        # Si c'est un client, on récupère les commandes
        historiquecommandes = Commande.objects.filter(acheteur=utilisateur)
        serializer = HistoriqueCommandeSerializer(historiquecommandes, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class HistoriqueCommandeSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_image = serializers.SerializerMethodField()  # Nouveau champ pour l'image du produit

    class Meta:
        model = Commande
        fields = ['id', 'produit_nom', 'produit_image', 'quantite', 'montant_total', 'statut', 'methode_paiement',
                  'cree_le']

    def get_produit_image(self, obj):
        # Récupère l'URL de la première image du produit, si elle existe
        first_image = obj.produit.images.first()
        return first_image.image.url if first_image else None


class CommandesEnAttenteCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Récupérer tous les produits du vendeur
            produits_vendeur = Produit.objects.filter(vendeur=request.user)

            # Compter les commandes en attente pour ces produits
            count = Commande.objects.filter(
                produit__in=produits_vendeur,
                statut__in=['en_attente', 'en_traitement', 'livraison_en_cours']
                # Utilisation de 'in' pour filtrer plusieurs statuts
            ).count()

            return Response({
                'count': count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'message': f'Erreur lors de la récupération des commandes en attente: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
