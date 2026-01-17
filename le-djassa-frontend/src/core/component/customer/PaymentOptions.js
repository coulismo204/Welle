import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import '../../../app_main/style/user_undefined/payment-styles.css'; // Importez le fichier CSS

const PaymentOptions = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { product, quantity, address } = state || {};
    const [selectedPayment, setSelectedPayment] = useState('');

    if (!product || !quantity || !address) {
        return <p className="error-message">Informations manquantes pour procéder au paiement.</p>;
    }

    const paymentMethods = [
        { name: 'Wave', value: 'wave' },
        { name: 'Orange Money', value: 'orange-money' },
        { name: 'MTN Money', value: 'mtn-money' },
        { name: 'Carte Bancaire', value: 'carte-bancaire' }
    ];

    const handlePayment = () => {
        if (!selectedPayment) {
            alert('Veuillez sélectionner un moyen de paiement.');
            return;
        }
        navigate(`/payment/${selectedPayment}`, { state: { product, quantity, address, paymentMethod: selectedPayment } });
    };

    return (
        <div className="payment-page">
            <h2>Choisissez votre moyen de paiement</h2>
            <div className="payment-info">
                <p>Produit: {product.nom}</p>
                <p>Quantité: {quantity}</p>
                <p>Prix total: {product.prix * quantity} FCFA</p>
                <p>Adresse de livraison: {address}</p>
            </div>
            
            <div className="payment-methods">
                {paymentMethods.map((method) => (
                    <div key={method.value} className="p-field-radiobutton">
                        <RadioButton
                            inputId={method.value}
                            name="paymentMethod"
                            value={method.value}
                            onChange={(e) => setSelectedPayment(e.value)}
                            checked={selectedPayment === method.value}
                        />
                        <label htmlFor={method.value}>{method.name}</label>
                    </div>
                ))}
            </div>
            
            <Button label="Procéder au paiement" className="p-button-success" onClick={handlePayment} />
        </div>
    );
};

export default PaymentOptions;