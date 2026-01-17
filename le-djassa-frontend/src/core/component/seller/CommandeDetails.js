import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { Timeline } from 'primereact/timeline';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import axios from 'axios';
import config from '../../../core/store/config';
import '../../../app_main/style/seller/CommandeDetails.css';

const CommandeDetails = ({ orderId, onBack }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    // Définition des statuts avec leurs propriétés
    const STATUT_CHOICES = {
        'en_attente': { 
            label: 'En attente', 
            severity: 'warning',
            icon: 'pi pi-clock' 
        },
        'en_traitement': { 
            label: 'En traitement', 
            severity: 'info',
            icon: 'pi pi-sync' 
        },
        'livraison_en_cours': { 
            label: 'Livraison en cours', 
            severity: 'info',
            icon: 'pi pi-truck' 
        },
        'livree': { 
            label: 'Livrée', 
            severity: 'success',
            icon: 'pi pi-check-circle' 
        },
        'annulee': { 
            label: 'Annulée', 
            severity: 'danger',
            icon: 'pi pi-times-circle' 
        }
    };

    // Fonction pour obtenir la date d'un statut depuis l'historique
    const getStatusDate = (status) => {
        if (!orderDetails?.historique_statuts) return null;
        // Pour le statut "en_attente", on utilise date_creation
        if (status === 'en_attente' && orderDetails.date_creation) {
            return new Date(orderDetails.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Pour les autres statuts, on cherche dans l'historique
        const historyEntry = orderDetails.historique_statuts.find(
            entry => entry.statut === status
        );
        
        if (historyEntry) {
            return new Date(historyEntry.date_changement).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return null;
    };

    // Création du modèle de steps avec template personnalisé
    const steps = Object.entries(STATUT_CHOICES).map(([value, data]) => ({
        label: data.label,
        value: value,
        template: (item, options) => {
            const isActive = activeIndex === options.index;
            const date = getStatusDate(value);

            return (
                <div className={classNames(
                    'flex flex-col items-center transition-opacity duration-200',
                    { 'opacity-50': !isActive }
                )}>
                    <div className={classNames(
                        'flex items-center justify-center w-8 h-8 rounded-full text-white mb-2',
                        { 
                            'bg-blue-500': isActive && value !== 'annulee',
                            'bg-red-500': isActive && value === 'annulee',
                            'bg-gray-300': !isActive 
                        }
                    )}>
                        <i className={`${data.icon} text-sm`}></i>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-sm">{data.label}</div>
                        {date && (
                            <div className="text-xs text-gray-500 mt-1">
                                {date}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }));

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.API_BASE_URL}/api/orders/commandes/${orderId}/traiter/`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                }
            );
            console.log('console.log(response.data)====================', response.data);
            
            if (response.data) {
                setOrderDetails(response.data);
                const statusIndex = steps.findIndex(step => step.value === response.data.statut);
                setActiveIndex(statusIndex !== -1 ? statusIndex : 0);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les détails de la commande',
                life: 3000
            });
            console.error('Erreur lors du chargement des détails:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${config.API_BASE_URL}/api/orders/commandes/${orderId}/traiter/`,
                { action: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                }
            );

            if (response.data) {
                await fetchOrderDetails();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Statut de la commande mis à jour',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de mettre à jour le statut',
                life: 3000
            });
            console.error('Erreur lors de la mise à jour:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmStatusUpdate = (newStatus) => {
        const newStatusLabel = STATUT_CHOICES[newStatus]?.label;
        
        confirmDialog({
            message: `Êtes-vous sûr de vouloir passer cette commande au statut "${newStatusLabel}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => updateOrderStatus(newStatus),
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const getStatusSeverity = (status) => {
        return STATUT_CHOICES[status]?.severity || 'info';
    };

    const renderHeader = () => (
        <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-4">
                <Button 
                    icon="pi pi-arrow-left" 
                    className="p-button-text" 
                    onClick={onBack}
                    tooltip="Retour à la liste"
                />
                <div>
                    <h2 className="text-xl font-semibold">
                        Détails de la commande {orderDetails?.reference}
                    </h2>
                    <div className="mt-2">
                        <Tag
                            severity={getStatusSeverity(orderDetails?.statut)}
                            value={STATUT_CHOICES[orderDetails?.statut]?.label}
                            icon={STATUT_CHOICES[orderDetails?.statut]?.icon}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-gray-600">Montant total:</span>
                <span className="font-semibold">
                    {formatCurrency(orderDetails?.montant_total)} FCFA
                </span>
            </div>
        </div>
    );

    const renderActionButtons = () => {
        const possibleTransitions = orderDetails?.transitions_possibles || [];
        
        return (
            <div className="flex gap-2 mt-4">
                {possibleTransitions.map(nextStatus => (
                    <Button
                        key={nextStatus}
                        label={`Passer en ${STATUT_CHOICES[nextStatus]?.label}`}
                        severity={nextStatus === 'annulee' ? 'danger' : 'primary'}
                        onClick={() => confirmStatusUpdate(nextStatus)}
                        disabled={loading}
                    />
                ))}
            </div>
        );
    };

    if (loading && !orderDetails) {
        return <div className="flex justify-center items-center p-8">Chargement...</div>;
    }

    if (!orderDetails) {
        return <div className="flex justify-center items-center p-8">Commande non trouvée !</div>;
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            {renderHeader()}

            <div className="mt-6">
                <Steps
                    model={steps}
                    activeIndex={activeIndex}
                    className="commandedetails-custom-steps"
                />
                {renderActionButtons()}
            </div>

            <TabView className="mt-6">
                <TabPanel header="Informations commande">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded">
                            <h3 className="font-semibold mb-2">Détails client</h3>
                            <p>Client: {orderDetails.acheteur?.nom}</p>
                            <p>Adresse: {orderDetails.acheteur?.adresse}</p>
                            <p>Adresse de livraison: {orderDetails.acheteur?.infos_livraison}</p>
                        </div>
                        <div className="p-4 border rounded">
                            <h3 className="font-semibold mb-2">Détails produit</h3>
                            <p>Produit: {orderDetails.produit?.nom}</p>
                            <p>Quantité: {orderDetails.produit?.qte}</p>
                            <p>Prix unitaire: {formatCurrency(orderDetails.produit?.prix)} FCFA</p>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Historique">
                    {orderDetails.historique_statuts && (
                        <div className="timeline-container">
                            {orderDetails.historique_statuts.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50">
                                    <div className="w-40">
                                        <Tag
                                            icon={STATUT_CHOICES[item.statut]?.icon}
                                            value={STATUT_CHOICES[item.statut]?.label}
                                            severity={STATUT_CHOICES[item.statut]?.severity}
                                            className="text-sm"
                                        />
                                    </div>
                                    
                                    <div className="flex-1">
                                        {item.commentaire}
                                    </div>

                                    <div className="flex flex-col items-end text-sm text-gray-600 w-48">
                                        <div className="flex flex-col items-end">
                                            <span style={{ marginRight: '7px' }}>{new Date(item.date_changement).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}</span>

                                            <span>{new Date(item.date_changement).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                        <span className="italic mt-1">{item.modifie_par}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabPanel>
            </TabView>
        </div>
    );
};

export default CommandeDetails;