import React, { useState, useEffect } from 'react';
import { Bell, Menu as MenuIcon, Package, BarChart3, Tags, Plus, X, Store } from 'lucide-react';
import '../../../app_main/style/seller/navbarvendeur.css';
import axios from 'axios';
import config from '../../../core/store/config';

const NavbarVendeur = ({ selectedMenu, onSelectMenu }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initial, setInitial] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchUserInitial = async () => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/utilisateur/user-initial/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        }
      );
  
      if (response.data) {
        setInitial(response.data.initial);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'initiale:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/orders/commandes-en-attente/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        }
      );
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

  useEffect(() => {
    fetchUserInitial();
    fetchPendingOrders();
    
    // Mettre à jour les notifications toutes les 30 secondes
    const interval = setInterval(fetchPendingOrders, 30000);
    
    // Nettoyage lors du démontage du composant
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { key: 'MES ANNONCES', label: 'Mes Annonces', icon: <Tags className="icon" /> },
    { key: 'NOUVELLE ANNONCE', label: 'Nouvelle Annonce', icon: <Plus className="icon" /> },
    { key: 'COMMANDES', label: 'Commandes', icon: <Package className="icon" /> },
    { key: 'TRAFIC DE VENTE', label: 'Trafic de Vente', icon: <BarChart3 className="icon" /> },
  ];

  return (
    <div className="navbar-vendeur-container">
      <header className="navbar-vendeur-header">
        <div className="navbar-vendeur-content">
          {/* Logo et bouton mobile */}
          <div className="navbar-vendeur-left">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="navbar-vendeur-mobile-trigger"
            >
              <MenuIcon className="icon" />
            </button>
            <span className="navbar-vendeur-logo"> J.R
              {/* <img src={LogoGM3} alt="Logo" className='vendeur-logo'/> */}
            </span>
          </div>

          {/* Navigation desktop */}
          <div className="navbar-vendeur-desktop-nav">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onSelectMenu(item.key)}
                className={`navbar-vendeur-menu-item ${
                  selectedMenu === item.key ? 'navbar-vendeur-menu-item-active' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Notifications et profil */}
          <div className="navbar-vendeur-right">
            <div className="navbar-vendeur-notifications">
              <Bell 
                className="navbar-vendeur-bell-icon" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onSelectMenu('COMMANDES');
                  fetchPendingOrders();
                }}
              />
              {notificationCount > 0 && (
                <div className="navbar-vendeur-notification-badge">
                  {notificationCount}
                </div>
              )}
            </div>
            <div 
              className="navbar-vendeur-profile"
              onClick={() => onSelectMenu('PROFIL')}
              style={{ cursor: 'pointer' }}
            >
              {initial}
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="navbar-vendeur-mobile-menu">
          <div 
            className="navbar-vendeur-mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="navbar-vendeur-mobile-drawer">
            <div className="navbar-vendeur-mobile-header">
              <h2 className="navbar-vendeur-mobile-title">Menu</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="navbar-vendeur-mobile-close"
              >
                <X className="icon" />
              </button>
            </div>
            <div className="navbar-vendeur-mobile-content">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectMenu(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`navbar-vendeur-mobile-item ${
                    selectedMenu === item.key ? 'navbar-vendeur-mobile-item-active' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="navbar-vendeur-main">
        {/* Le contenu de la page ira ici */}
      </main>
    </div>
  );
};

export default NavbarVendeur;