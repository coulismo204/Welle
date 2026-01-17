import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { Image } from 'primereact/image';
import axios from 'axios';
import config from '../../../core/store/config';
import '../../../app_main/style/customer/EtatCommandes.css';

const EtatCommandes = () => {
  const [currentView] = useState('purchases');
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useRef(null);

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
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des commandes :", error);
        let message = "Erreur lors de la récupération des commandes";
        if (error.response?.data?.detail) {
          message = error.response.data.detail;
        }
        setErrorMessage(message);
        showToast('error', 'Erreur', message);
      });
    } else {
      const message = 'Token d\'accès non trouvé';
      setErrorMessage(message);
      showToast('error', 'Erreur', message);
    }
  }, [showToast]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${config.API_BASE_URL}${imageUrl}`;
  };

  const getCurrentStepIndex = (order) => {
    const statusMap = {
      'En attente': 0,
      'Traitement ...': 1,
      'Livraison ...': 2,
      'Livrée': 3
    };
    return statusMap[order.statut] || 0;
  };

  const getMostAdvancedStep = () => {
    const activeOrders = orders.filter(order => 
      order.statut !== 'Livrée' && 
      order.statut !== 'Annulée'
    );
    
    if (activeOrders.length === 0) return -1;
  
    return Math.max(...activeOrders.map(order => getCurrentStepIndex(order)));
  };
    
  const steps = [
    { label: 'En attente', statut: 'En attente' },
    { label: 'En cours de traitement', statut: 'Traitement ...' },
    { label: 'En cours de livraison', statut: 'Livraison ...' },
    { label: 'Livrée', statut: 'Livrée' }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'En attente':
        return 'ec-pending bg-orange';
      case 'Livrée':
        return 'ec-delivered bg-green';
      default:
        return 'ec-italic';
    }
  };
  
  const getFilteredOrders = () => {
    switch (currentView) {
      case 'purchases': return orders;
      case 'cancelled': return orders.filter(order => order.statut === "Annulée");
      case 'pending': return orders.filter(order => order.statut === "En attente");
      case 'validated': return orders.filter(order => order.statut === "Validée");
      case 'shipping': return orders.filter(order => order.statut === "Livraison ...");
      case 'delivered': return orders.filter(order => order.statut === "Livrée");
      default: return orders;
    }
  };
  const mostAdvancedStep = getMostAdvancedStep();

  return (
    <div className="ec-container">
      <Toast ref={toast} />
      <h1 className="ec-title">Mes Commandes</h1>

      <div className="ec-display-section">
        {currentView === 'purchases' ? (
          <div className="ec-order-list">
            {getFilteredOrders().length > 0 ? (
              getFilteredOrders().map(order => (
                <div key={order.id} className="ec-order-item">
                  <div className="ec-order-image">
                    {order.produit_image || order.produit?.images?.[0]?.image ? (
                      <Image 
                        src={getImageUrl(order.produit_image || order.produit?.images?.[0]?.image)}
                        alt={order.produit_nom}
                        width="120" 
                        height="120"
                        preview
                        className="product-img"
                      />
                    ) : (
                      <div className="placeholder-image">
                        <i className="pi pi-image"></i>
                      </div>
                    )}
                  </div>
                  <div className="ec-order-details">
                    <div className="ec-order-header">
                      <h3 className="ec-order-title">{order.produit_nom}</h3>
                      <span className={`ec-status-label ${getStatusClass(order.statut)}`}>
                        {order.statut}
                      </span>
                    </div>
                    <div className="ec-order-info">
                      <p className="ec-order-id">Commande #{order.id}</p>
                      <p className="ec-order-date">{order.cree_le_formate}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ec-empty-state">
                <i className="pi pi-file-o"></i>
                <h3>Aucune commande</h3>
                <p>Tes ventes et achats s'afficheront ici</p>
              </div>
            )}
          </div>
        ) : (
          <div className="order-tracking">
            {steps.map((step, index) => (
              <div className="tracking-item" key={index}>
                <div className={`tracking-circle ${index <= mostAdvancedStep ? 'active' : ''}`}>
                  {index + 1}
                </div>
                <div className="tracking-label">
                  {step.label}
                  {orders.filter(order => order.statut === step.statut).length > 0 && (
                    <Badge 
                      value={orders.filter(order => order.statut === step.statut).length} 
                      className="ml-2" 
                      severity="info"
                    />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`tracking-line ${index < mostAdvancedStep ? 'active' : ''}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EtatCommandes;