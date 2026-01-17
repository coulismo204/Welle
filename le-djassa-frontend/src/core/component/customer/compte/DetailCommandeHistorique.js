import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import config from '../../../../core/store/config';
import '../../../../app_main/style/customer/compte/DetailCommandesHistorique.css';

const DetailCommande = () => {
    const [commande, setCommande] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useRef(null);

    const STATUT_STYLES = {
        'en_attente': {
            severity: 'warning',
            icon: 'pi pi-clock',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700',
            markerBg: 'bg-yellow-100',
            markerColor: 'text-yellow-600'
        },
        'en_traitement': {
            severity: 'info',
            icon: 'pi pi-cog',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            markerBg: 'bg-blue-100',
            markerColor: 'text-blue-600'
        },
        'livraison_en_cours': {
            severity: 'info',
            icon: 'pi pi-send',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            markerBg: 'bg-blue-100',
            markerColor: 'text-blue-600'
        },
        'livree': {
            severity: 'success',
            icon: 'pi pi-check-circle',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            markerBg: 'bg-green-100',
            markerColor: 'text-green-600'
        },
        'annulee': {
            severity: 'danger',
            icon: 'pi pi-times-circle',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            markerBg: 'bg-red-100',
            markerColor: 'text-red-600'
        }
    };

    const STATUT_LABELS = {
        'en_attente': 'En attente',
        'en_traitement': 'En traitement',
        'livraison_en_cours': 'En cours de livraison',
        'livree': 'Livrée',
        'annulee': 'Annulée'
    };


    useEffect(() => {
        const fetchCommandeDetails = async () => {
            try {
                const response = await axios.get(
                    `${config.API_BASE_URL}/api/orders/commandes/${id}/detail/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access')}`
                        }
                    }
                );
                setCommande(response.data);
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les détails de la commande'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCommandeDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <ProgressSpinner strokeWidth="3" style={{ width: '50px', height: '50px' }} />
            </div>
        );
    }

    if (!commande) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-xl mb-4">Commande non trouvée</div>
                <Button label="Retour aux commandes" onClick={() => navigate('Customer/MyAcount')} />
            </div>
        );
    }

    const timelineEvents = commande.historique.map(event => ({
        status: event.statut,
        date: new Date(event.date).toLocaleString('fr-FR'),
        icon: STATUT_STYLES[event.statut]?.icon,
        color: STATUT_STYLES[event.statut]?.severity,
        content: event.commentaire,
        bgColor: STATUT_STYLES[event.statut]?.bgColor,
        textColor: STATUT_STYLES[event.statut]?.textColor,
        markerBg: STATUT_STYLES[event.statut]?.markerBg,
        markerColor: STATUT_STYLES[event.statut]?.markerColor
    }));

    return (
        <div className="DetailCommandesHistorique-container bg-gray-50 min-h-screen p-6">
            <Toast ref={toast} />
            
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
                {/* En-tête de la commande */}
                <div className="mb-6">
                    <Button 
                        icon="pi pi-arrow-left" 
                        className="DetailCommandesHistorique-backButton mb-4 bg-transparent hover:bg-gray-100 text-gray-700"
                        onClick={() => navigate('/Customer/MyAcount')} 
                        label="Retour aux commandes"
                    />
                    <div className="flex justify-between items-center border-b pb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold text-gray-800">Commande #{commande.id}</h2>
                            <Tag
                                severity={STATUT_STYLES[commande.commande.statut]?.severity}
                                icon={STATUT_STYLES[commande.commande.statut]?.icon}
                                value={STATUT_LABELS[commande.commande.statut]}
                                className={`${STATUT_STYLES[commande.commande.statut]?.bgColor} ${STATUT_STYLES[commande.commande.statut]?.textColor} px-3 py-2 rounded-full`}
                            />
                        </div>
                        <div className="text-gray-600">
                            <i className="pi pi-calendar mr-2" />
                            {new Date(commande.commande.cree_le).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Détails du produit */}
                    <Card className="DetailCommandesHistorique-card shadow-md">
                        <div className="flex items-center mb-4">
                            <i className="pi pi-shopping-cart text-2xl mr-2 text-gray-600" />
                            <h3 className="text-xl font-semibold">Détails du produit</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Nom</span>
                                <span className="font-medium">{commande.produit.nom}</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-gray-600">Prix unitaire</span>
                                <span className="font-medium">{commande.produit.prix_unitaire} FCFA</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Quantité</span>
                                <span className="font-medium">{commande.commande.quantite}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                <span className="text-green-800 font-semibold">Total</span>
                                <span className="text-xl font-bold text-green-800">{commande.commande.montant_total} FCFA</span>
                            </div>
                        </div>
                    </Card>

                    {/* Informations de livraison */}
                    <Card className="DetailCommandesHistorique-card shadow-md">
                        <div className="flex items-center mb-4">
                            <i className="pi pi-truck text-2xl mr-2 text-gray-600" />
                            <h3 className="text-xl font-semibold">Informations de livraison</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <div className="text-gray-600 mb-2">Adresse de livraison</div>
                                <div className="font-medium">{commande.commande.infos_livraison}</div>
                            </div>
                            {commande.commande.date_livraison_prevue && (
                                <div className="p-4 bg-blue-50 rounded">
                                    <div className="text-blue-800 font-semibold mb-2">Livraison prévue</div>
                                    <div className="font-medium">
                                        {new Date(commande.commande.date_livraison_prevue).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Informations du vendeur */}
                    <Card className="DetailCommandesHistorique-card shadow-md">
                        <div className="flex items-center mb-4">
                            <i className="pi pi-user text-2xl mr-2 text-gray-600" />
                            <h3 className="text-xl font-semibold">Informations du vendeur</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Nom</span>
                                <span className="font-medium">{commande.produit.vendeur.nom}</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-gray-600">Email</span>
                                <span className="font-medium">{commande.produit.vendeur.email}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Timeline de suivi */}
                    <Card className="col-span-full DetailCommandesHistorique-card shadow-md">
                        <div className="flex items-center mb-6">
                            <i className="pi pi-history text-2xl mr-2 text-gray-600" />
                            <h3 className="text-xl font-semibold">Suivi de la commande</h3>
                        </div>
                        <Timeline 
                            value={timelineEvents} 
                            className="DetailCommandesHistorique-timeline"
                            content={(item) => (
                                <div className={`p-4 rounded-lg ${item.bgColor}`}>
                                    <div className="text-sm text-gray-600">{item.date}</div>
                                    <div className={`font-semibold mt-1 ${item.textColor}`}>
                                        {STATUT_LABELS[item.status]}
                                    </div>
                                    {item.content && (
                                        <p className="mt-2 text-gray-700">{item.content}</p>
                                    )}
                                </div>
                            )}
                            marker={(item) => (
                                <span className={`flex items-center justify-center w-10 h-10 rounded-full ${item.bgColor} ${item.textColor}`}>
                                    <i className={item.icon}></i>
                                </span>
                            )}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DetailCommande;