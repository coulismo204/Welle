import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import config from '../../../core/store/config';
import CommandeDetails from './CommandeDetails';

const Commandes = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/api/orders/commandes-vendeur/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
        }
    };

    const formatDate = (value) => {
        return new Date(value).toLocaleDateString();
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
    };

    const getStatusSeverity = (status) => {
        switch (status) {
            case 'en_attente':
                return 'warning';
            case 'completee':
                return 'success';
            case 'annulee':
                return 'danger';
            default:
                return 'info';
        }
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.statut} severity={getStatusSeverity(rowData.statut)} />;
    };

    const actionBodyTemplate = (rowData) => {
        console.log('rowData.id =================', rowData.id);
        return (
            <Button 
                label="Voir détails" 
                className="p-button-sm" 
                onClick={() => setSelectedOrderId(rowData.id)}
            />
        );
    };

    return (
        <div>
            {selectedOrderId ? (
                <CommandeDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
            ) : (
                <>
                    <div className="p-d-flex p-jc-end p-mb-3">
                        <Button label="Nouvelle annonce" className="p-button" />
                    </div>
                    <DataTable value={orders} paginator rows={10}>
                        <Column field="id" header="COMMANDES" />
                        <Column field="cree_le" header="DATE" body={(rowData) => formatDate(rowData.cree_le)} />
                        <Column field="acheteur.username" header="CLIENT" />
                        <Column field="produit.nom" header="Produit" />
                        <Column field="produit.prix" header="COÛT" body={(rowData) => formatCurrency(rowData.produit.prix)} />
                        <Column field="quantite" header="QUANTITÉ" />
                        <Column field="methode_paiement" header="PAIEMENT" />
                        <Column field="montant_total" header="TOTAL" body={(rowData) => formatCurrency(rowData.montant_total)} />
                        <Column field="statut" header="STATUT" body={statusBodyTemplate} />
                        <Column body={actionBodyTemplate} header="ACTIONS" />
                    </DataTable>
                </>
            )}
        </div>
    );
};

export default Commandes;
