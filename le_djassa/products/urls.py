# urls.py
from django.urls import path
from .views import ProduitCreate, ProduitList, ProduitListOwner, ProduitDetail, list_etats, CategorieList, \
    SearchProductsView, StatisticsView

# Définir les routes de l'application
urlpatterns = [
    path('', ProduitList.as_view(), name='produit-list'),  # Route pour lister les produits
    path('ownerproduct/', ProduitListOwner.as_view(), name='produit-list-owner'),  # Route pour lister les produits du propriétaire
    path('create/', ProduitCreate.as_view(), name='produit-create'),  # Route pour créer un produit
    path('<int:pk>/', ProduitDetail.as_view(), name='produit-detail'),
    path('etats/', list_etats, name='etats'),
    path('categories/', CategorieList.as_view(), name='categorie-list'),
    path('search-products/', SearchProductsView.as_view(), name='search_products'),
    path('statistics/', StatisticsView.as_view(), name='produits-count'),
]
