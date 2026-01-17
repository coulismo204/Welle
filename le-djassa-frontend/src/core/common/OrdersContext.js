import React, { createContext, useContext, useState } from 'react';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    // Ajouter une commande
    const addOrder = (newOrder) => {
        setOrders((prevOrders) => {
            const existingOrderIndex = prevOrders.findIndex(order => order.produits === newOrder.produits);
            if (existingOrderIndex !== -1) {
                // Mettre à jour la commande existante avec le nombre de vues mis à jour
                const updatedOrders = [...prevOrders];
                updatedOrders[existingOrderIndex] = {
                    ...updatedOrders[existingOrderIndex],
                    vues: updatedOrders[existingOrderIndex].vues + 1
                };
                return updatedOrders;
            }
            // Ajouter une nouvelle commande si elle n'existe pas déjà
            return [...prevOrders, newOrder];
        });
    };

    // Ajouter un produit au panier
    const addToCart = (product) => {
        setCartItems(prevItems => [...prevItems, product]);
    };

    // Obtenir le nombre d'articles dans le panier
    const getCartItemsCount = () => cartItems.length;

    return (
        <OrdersContext.Provider value={{ orders, addOrder, addToCart, getCartItemsCount }}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => useContext(OrdersContext);
