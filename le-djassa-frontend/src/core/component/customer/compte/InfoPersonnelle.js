import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import config from '../../../../core/store/config';
import '../../../../app_main/style/customer/compte/InfoPersonnelle.css';


export default function InfoPersonnelle() {
    const [userData, setUserData] = useState({
        lastName: '',
        firstName: '',
        address: '',
        phone: '',
        email: '',
        gender: '',
    });
    const [loading, setLoading] = useState(true);
    const [isBuyer, setIsBuyer] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // State pour stocker le message d'erreur
    const toast = useRef(null);

    // Fonction pour afficher des notifications
    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    // Récupération des données utilisateur
    useEffect(() => {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            axios.get(`${config.API_BASE_URL}/api/utilisateur/profile-buyer/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => {
                setUserData(response.data);
                setIsBuyer(!response.data.est_vendeur);
            })
            .catch(error => {
                let message = 'Erreur lors de la récupération des données utilisateur';
                if (error.response && error.response.data && error.response.data.detail) {
                    message = error.response.data.detail; // Stocke le message d'erreur dans le state
                }
                setErrorMessage(message); // Utilise setErrorMessage
                showToast('error', 'Erreur', message); // Affiche le Toast avec le message d'erreur
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            const message = 'Token d\'accès non trouvé';
            setErrorMessage(message);
            showToast('error', 'Erreur', message); // Notification Toast d'erreur
            setLoading(false);
        }
    }, [showToast]);

    // Gestion du chargement et des permissions
    if (loading) {
        return <div>Chargement des informations...</div>;
    }

    if (errorMessage) {
        return (
            <Card title="Mes informations personnelles" className="info-personnelle-card">
                <Toast ref={toast} />
                <div className="error-message">{errorMessage}</div> {/* Zone d'affichage de l'erreur */}
            </Card>
        );
    }

    // Rendu normal si tout va bien
    return (
        <Card title="Mes informations personnelles" className="info-personnelle-card">
            <Toast ref={toast} />
            <div className="p-grid p-formgrid">
                <div className="p-field p-col-12 p-md-6">
                    <label>Nom :</label>
                    <span className="user-info">{userData.last_name || 'N/A'}</span>
                </div>
                <div className="p-field p-col-12 p-md-6">
                    <label>Prénom :</label>
                    <span className="user-info">{userData.first_name || 'N/A'}</span>
                </div>
                <div className="p-field p-col-12 p-md-6">
                    <label>Adresse :</label>
                    <span className="user-info">{userData.adresse || 'N/A'}</span>
                </div>
                <div className="p-field p-col-12 p-md-6">
                    <label>Téléphone :</label>
                    <span className="user-info">{userData.numero_telephone || 'N/A'}</span>
                </div>
                <div className="p-field p-col-12 p-md-6">
                    <label>Email :</label>
                    <span className="user-info">{userData.email || 'N/A'}</span>
                </div>
            </div>
        </Card>
    );
}
