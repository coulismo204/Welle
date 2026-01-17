from django.urls import path


from .views import CommandesEnAttenteCountView
from .views import (CreateCommandeView, CommandesVendeurView, TraiterCommandeView, HistoriqueCommandesView,
                    CommandeDetailClientView)

urlpatterns = [
    path('commande/', CreateCommandeView.as_view(), name='create-commande'),
    path('commandes-vendeur/', CommandesVendeurView.as_view(), name='commandes-vendeur'),
    path('commandes/<int:commande_id>/traiter/', TraiterCommandeView.as_view(), name='traiter-commande'),
    path('commandes/<int:commande_id>/statut/', TraiterCommandeView.as_view(), name='statut-commande'),
    path('commandes/<int:commande_id>/detail/', CommandeDetailClientView.as_view(), name='commande-detail-client'),
    path('commandes-en-attente/', CommandesEnAttenteCountView.as_view(), name='commandes-en-attente-count'),
    # autres routes

    path('historique-commandes/', HistoriqueCommandesView.as_view(), name='historique-commandes'),
    
]
