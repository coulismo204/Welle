import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import config from '../../../../core/store/config';
import '../../../../app_main/style/customer/compte/CommandesHistorique.css';
import { useNavigate } from 'react-router-dom';

export default function CommandesHistorique() {
    const [commandes, setCommandes] = useState([]);
    const [errorMessage, setErrorMessage] = useState(''); // État pour stocker le message d'erreur
    const toast = useRef(null);
    const navigate = useNavigate();

    // Fonction pour afficher des notifications Toast
    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            axios.get(`${config.API_BASE_URL}/api/orders/historique-commandes/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => setCommandes(response.data))
            .catch(error => {
                console.error("Erreur lors de la récupération des commandes :", error);
                let message = "Erreur lors de la récupération des commandes";
                if (error.response && error.response.data && error.response.data.detail) {
                    message = error.response.data.detail;
                }
                setErrorMessage(message); // Stocke le message d'erreur
                showToast('error', 'Erreur', message); // Affiche le Toast
            });
        } else {
            const message = 'Token d\'accès non trouvé';
            setErrorMessage(message);
            showToast('error', 'Erreur', message);
            console.error('Token d\'accès non trouvé');
        }
    }, [showToast]);

    // Fonction pour ajouter le symbole Franc CFA au montant
    const formatMontantTemplate = (rowData) => {
        return `${rowData.montant_total_formate} FCFA`;
    };

    const actiondetailcommande = (rowData) => (
        <Button 
            label="Détails" 
            onClick={() => navigate(`/Customer/MyAcount/commandes/${rowData.id}`)} 
        />
    );

    return (
        <div>
            <Toast ref={toast} />
            
            {/* Affiche le message d'erreur si nécessaire */}
            {errorMessage ? (
                <div className="error-message">{errorMessage}</div>
            ) : (
                <DataTable value={commandes} paginator rows={10}>
                    <Column field="id" header="ID"></Column>
                    <Column field="produit_nom" header="Produit"></Column>
                    <Column field="cree_le_formate" header="Date"></Column>
                    <Column field="statut" header="Statut"></Column>
                    <Column field="montant_total_formate" header="Total" body={formatMontantTemplate}></Column>
                    <Column body={(actiondetailcommande)} />
                </DataTable>
            )}
        </div>
    );
}
