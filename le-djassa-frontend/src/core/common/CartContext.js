import React, { createContext, useState, useEffect } from 'react';
import config from '../../core/store/config';

// Création du contexte pour le panier
export const CartContext = createContext();

// Fournisseur du contexte du panier
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const checkStock = async (productId) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/produit/produit/${productId}/`);
            const data = await response.json();
            return data.qte_stock;
        } catch (error) {
            console.error('Error fetching product stock:', error);
            return null;
        }
    };

    // Charger les articles du panier depuis le localStorage
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    // Sauvegarder les articles du panier dans le localStorage à chaque mise à jour
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Fonction pour ajouter un produit au panier
    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingProduct = prevItems.find((item) => item.id === product.id);
            if (existingProduct) {
                // Si le produit existe déjà dans le panier, augmenter la quantité
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Sinon, ajouter un nouveau produit avec la quantité spécifiée
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    // Fonction pour retirer un produit du panier
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    // Fonction pour modifier la quantité d'un produit dans le panier
    const updateCartItemQuantity = (productId, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId
                    ? { ...item, quantity: quantity > 0 ? quantity : 1 } // Assurer une quantité positive
                    : item
            )
        );
    };

    return (
        <CartContext.Provider value={{ cartItems, checkStock, addToCart, removeFromCart, updateCartItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
