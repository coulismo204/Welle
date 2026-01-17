import React, { useContext, useRef } from 'react';
import { CartContext } from '../../common/CartContext';
import { UserContext } from '../../common/UserContext';
import { useNavigate } from 'react-router-dom';
import '../../../app_main/style/customer/CartPage.css';
import { Toast } from 'primereact/toast';

const CartPage = () => {
    const { cartItems, checkStock, removeFromCart, updateCartItemQuantity } = useContext(CartContext);
    const { isLoggedIn } = useContext(UserContext);
    const navigate = useNavigate();
    const toast = useRef(null);

    const showToast = (toastRef, severity, summary, detail, life = 3000) => {
        toastRef.current.show({ severity, summary, detail, life });
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            const stock = await checkStock(productId);
            if (stock !== null && newQuantity > stock) {
                showToast(toast, 'info', 'Stock insuffisant', `Seules ${stock} unités sont disponibles.`);
            } else {
                updateCartItemQuantity(productId, newQuantity);
            }
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleValidate = () => {
        if (isLoggedIn) {
            // Si l'utilisateur est connecté, continuer avec la validation
            if (cartItems.length === 0) {
                // S'il n'y a pas de produit
                showToast(toast, 'info', 'Panier vide', `Votre panier est vide. Ajoutez des articles avant de valider.`);
                return;
            }
            // Sinon, préparer les données à envoyer à la page de confirmation
            const confirmationData = {
                items: cartItems,
                total: calculateTotal()
            };

            // Rediriger vers la page de confirmation avec les données du panier
            navigate('/confirmation', { state: confirmationData });
        } else {
            // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
            navigate('/login');
        }
    };

    return (
        <div className="cart-container">
            <Toast ref={toast} />
            <div className="cart-items">
                <h1 className="cart-title">Panier ({cartItems.length})</h1>
                {cartItems.length === 0 ? (
                    <div className="empty-cart-message">
                        <p>Votre panier est vide.</p>
                        <button 
                            className="cart-summary-button" 
                            onClick={() => navigate('/')}  // Redirige vers la page d'accueil
                        >
                            Commencez vos achats
                        </button>
                    </div>
                ) : (
                    <ul>
                        {cartItems.map((item) => (
                            <li className="cart-item" key={item.id}>
                                <div className="cart-item-image-remove">
                                    <img src={item.image} alt={item.name} />
                                    <div className="cart-item-remove">
                                        <button onClick={() => removeFromCart(item.id)}>
                                            <i className="pi pi-trash" aria-hidden="true"></i> Supprimer
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-details">
                                    <h2>{item.name}</h2>
                                    <p>{item.description}</p>
                                    <div className="cart-item-price">{(item.price * item.quantity).toLocaleString('fr-FR')} CFA</div>
                                    <div className="cart-item-quantity">
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                        />
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {cartItems.length > 0 && (
                <div className="cart-summary">
                    <h2 className="cart-summary-title">RÉSUMÉ DU PANIER</h2>
                    <div className="cart-summary-detail">
                        <span>Sous-total</span>
                        <span>{calculateTotal().toLocaleString('fr-FR')} CFA</span>
                    </div>
                    <p>Les articles sont éligibles à la livraison gratuite.</p>
                    <button className="cart-summary-button" onClick={handleValidate}>
                        VALIDE ({calculateTotal().toLocaleString('fr-FR')} CFA)
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
