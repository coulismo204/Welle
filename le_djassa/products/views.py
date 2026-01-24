from rest_framework import generics, permissions
from .models import Produit, Categorie
from users.models import Utilisateur
from .serializers import ProduitSerializer, CategorieSerializer, ProduitDetailSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views import View
from django.http import JsonResponse
from django.db.models import Count, Sum, Window, Q, F
from django.db.models.functions import Rank
from django.db import models
from rest_framework.views import APIView
from users.permissions import IsBuyer, IsSeller


class ProduitCreate(generics.CreateAPIView):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(vendeur=self.request.user)


class ProduitList(generics.ListAPIView):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.AllowAny]


class ProduitListOwner(generics.ListAPIView):
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Produit.objects.filter(vendeur=self.request.user)


class ProduitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produit.objects.all()
    serializer_class = ProduitDetailSerializer
    permission_classes = [permissions.AllowAny]

    def delete(self, request, *args, **kwargs):
        produit = self.get_object()

        # sécurité : seul le vendeur peut supprimer
        if produit.vendeur != request.user:
            return Response(
                {"detail": "Vous n'avez pas le droit de supprimer ce produit."},
                status=403
            )

        produit.delete()
        return Response(status=204)



@api_view(['GET'])
def list_etats(request):
    etats = [{'value': key, 'label': label} for key, label in Produit.ETATS]
    return Response(etats)


@api_view(['GET'])
def list_categorie(request):
    categorie = [{'value': key, 'label': label} for key, label in Categorie.objects.values_list('id', 'nom')]
    return Response(categorie)


class CategorieList(generics.ListAPIView):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.AllowAny]


class SearchProductsView(View):
    def get(self, request):
        query = request.GET.get('q', '')
        categories = request.GET.get('category_id', '')

        if categories:
            category_ids = categories.split(',')
            products = Produit.objects.filter(nom__icontains=query, categorie_id__in=category_ids)
        else:
            # products = Produit.objects.filter(nom__icontains(query))
            products = Produit.objects.filter(nom__icontains=query)

        results = []
        for product in products:
            results.append({
                'nom': product.nom,
                'prix': product.prix,
                'categorie': product.categorie.nom,
            })

        return JsonResponse(results, safe=False)

def get_rank_suffix(rank):
    if 10 < rank % 100 < 20:  # Pour les nombres entre 11 et 19
        return "ème"
    else:
        return {1: "er", 2: "ème", 3: "ème"}.get(rank % 10, "ème")


class StatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeller]

    def get(self, request):
        # Obtenir tous les vendeurs avec leurs statistiques
        vendeurs_stats = Utilisateur.objects.filter(
            est_vendeur=True
        ).annotate(
            total_ventes=Count(
                'produits_vendus__commandes',
                filter=Q(produits_vendus__commandes__statut='livree'),
                distinct=True
            ),
            revenu_total=Sum(
                'produits_vendus__prix',
                filter=Q(produits_vendus__commandes__statut='livree')
            )
        ).filter(total_ventes__gt=0)  # Filtre uniquement les vendeurs ayant des ventes

        # Trier les vendeurs par total_ventes et revenu_total en ordre décroissant
        vendeurs_stats = sorted(vendeurs_stats, key=lambda x: (-x.total_ventes, -x.revenu_total))

        # Calcul manuel du classement
        rang_actuel = 1
        for index, vendeur in enumerate(vendeurs_stats):
            if index > 0 and (vendeurs_stats[index - 1].total_ventes > vendeur.total_ventes or vendeurs_stats[index - 1].revenu_total > vendeur.revenu_total):
                rang_actuel = index + 1  # Met à jour le rang pour les non-égaux
            vendeur.rang = rang_actuel  # Attribue le rang (en ajoutant cet attribut manuellement)

        # Trouve les statistiques du vendeur actuel
        stats_vendeur = next((v for v in vendeurs_stats if v.id == request.user.id), None)

        # Statistiques de base pour l'utilisateur actuel
        published_count = Produit.objects.filter(vendeur=request.user).count()
        sold_count = stats_vendeur.total_ventes if stats_vendeur else 0
        total_revenue = stats_vendeur.revenu_total if stats_vendeur else 0

        # Préparer le message de classement pour les vendeurs avec ventes
        rank_message = ""
        if stats_vendeur and stats_vendeur.total_ventes > 0:
            rank_suffix = get_rank_suffix(stats_vendeur.rang)
            rank_message = (
                f"🏆 Vous êtes classé(e) {stats_vendeur.rang}{rank_suffix} "
                f"meilleur vendeur du site avec {stats_vendeur.total_ventes} ventes !"
            )
        else:
            rank_message = "Commencez à vendre pour apparaître dans le classement !"

        return Response({
            'published_count': published_count,
            'sold_count': sold_count,
            'total_revenue': total_revenue,
            'rank_message': rank_message,
            'rank': stats_vendeur.rang if stats_vendeur else None,
            'total_sales': stats_vendeur.total_ventes if stats_vendeur else 0
        })
