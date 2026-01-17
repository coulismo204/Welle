import React, { useState, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../app_main/style/customer/confirmation-styles.css';
import config from '../../store/config';
import { Toast } from 'primereact/toast';

const Confirmation = () => {
    const location = useLocation();
    const { items } = location.state || {}; // Récupère tous les articles
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    // Calculer le total des prix

const calculateTotalPrice = () => {
    return items.reduce((total, item) => {
        const itemPrice = Number(item.price); // Convertit le prix en nombre
        const itemQuantity = Number(item.quantity); // Convertit la quantité en nombre

        // Vérifie que le prix et la quantité sont des nombres valides, sinon ajoute 0
        if (!isNaN(itemPrice) && !isNaN(itemQuantity)) {
            return total + itemPrice * itemQuantity;
        } else {
            console.error(`Données invalides pour l'article:`, item);
            return total; // Ignore les articles avec des prix ou quantités invalides
        }
    }, 0);
};


    

    const handleConfirm = async () => {
        if (address.trim() === '') {
            showToast('error', 'Erreur', 'Veuillez entrer une adresse de livraison.');
            return;
        }

        const commandesData = items.map(item => ({
            produit: Number(item.id),
            quantity: Number(item.quantity),
            montant_total: item.price * item.quantity,
            adresse_livraison: address,
        }));

        console.log('Données envoyées au serveur:', commandesData);

        try {
            setLoading(true);
            const accessToken = localStorage.getItem('access');
            if (!accessToken) {
                showToast('error', 'Erreur', 'Vous devez être connecté pour effectuer cet achat.');
                return;
            }

            const response = await fetch(`${config.API_BASE_URL}/api/orders/commande/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(commandesData),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('success', 'Succès', data.message);
                navigate('/success-page'); // Redirige vers une page de succès
            } else {
                showToast('error', 'Erreur', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('error', 'Erreur', "Erreur lors de l'envoi des informations au serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (!items || items.length === 0) {
        return <p className="error-message">Aucun produit à confirmer.</p>;
    }

    return (
        <div className="confirmation-page">
            <Toast ref={toast} />
            <h2>Confirmer l'Achat</h2>
            {items && items.length > 0 ? (
                <div>
                    {items.map((item, index) => (
                        <div key={index} className="confirmation-info">
                            <p>Produit: {item.name}</p>
                            <p>Quantité: {item.quantity}</p>
                            <p>Prix total: {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    ))}
                    <div className="address-field">
                        <label htmlFor="address">Adresse de livraison</label>
                        <InputText 
                            id="address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder="Entrez votre adresse de livraison"
                        />
                    </div>

                    {/* Affichage du total des prix */}
                    <div className="total-price">
                        <h3>Total: {calculateTotalPrice().toLocaleString('fr-FR')} FCFA</h3>
                    </div>

                    <Button label="Confirmer" className="confirm-button" onClick={handleConfirm} disabled={loading} />
                </div>
            ) : (
                <p className="error-message">Aucun produit disponible pour confirmer l'achat.</p>
            )}
        </div>
    );
};

export default Confirmation;
