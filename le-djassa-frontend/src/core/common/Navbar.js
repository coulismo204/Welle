import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Badge } from 'primereact/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'primeicons/primeicons.css';
import '../../app_main/style/Navbar.css';
import Login from '../component/authenticate/Login';
import Signup from '../component/authenticate/Signup';
import ForgotPassword from '../component/authenticate/ForgotPassword';
import { UserContext } from './UserContext';
import { CartContext } from './CartContext';
import config from '../../core/store/config';
import { Menu } from 'primereact/menu';
import LogoGM3 from '../../logo/LogoGM3.png';

export default function Navbar({ onSearch, formData, setFormData }) {
    // Refs
    const menu = useRef(null);
    
    // État local
    const [menuModel, setMenuModel] = useState([]);
    const [authState, setAuthState] = useState({
        showSignup: false,
        showLogin: false,
        showForgotPassword: false
    });
    const [suggestions, setSuggestions] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [notifications, setNotifications] = useState(3);
    
    // Contextes
    const { username, isLoggedIn, setIsLoggedIn, setUsername, setPhotoProfil } = useContext(UserContext);
    const { cartItems } = useContext(CartContext);
    
    // Hooks React Router
    const navigate = useNavigate();
    
    // Constantes
    const baseUrl = `${config.API_BASE_URL}/media/`;

    // Vérification du rôle de l'utilisateur
    useEffect(() => {
        if (isLoggedIn) {
            const fetchUserRole = async () => {
                try {
                    const token = localStorage.getItem('access');
                    const response = await axios.get(`${config.API_BASE_URL}/api/utilisateur/user-role/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUserRole(response.data.role);
                } catch (error) {
                    console.error('Erreur lors de la récupération du rôle:', error);
                }
            };
            
            fetchUserRole();
        } else {
            setUserRole(null);
        }
    }, [isLoggedIn]);

    // Mise à jour du menu en fonction du rôle
    useEffect(() => {
        const baseMenuItems = [
            {
                label: isLoggedIn ? 'Mon Compte' : 'Se Connecter',
                icon: 'pi pi-user',
                command: () => {
                    if (isLoggedIn) {
                        navigate(userRole === 'vendeur' ? '/uservendeur-interface' : '/Customer/MyAcount');
                    } else {
                        toggleAuthState('showLogin');
                    }
                }
            },
            {
                label: isLoggedIn ? 'Se Déconnecter' : "S'inscrire",
                icon: isLoggedIn ? 'pi pi-power-off' : 'pi pi-user-plus',
                command: () => isLoggedIn ? handleLogout() : toggleAuthState('showSignup')
            },
            { separator: true },
            {
                label: 'Mes Commandes',
                icon: 'pi pi-shopping-bag',
                command: () => {
                    if (isLoggedIn) {
                        navigate('/EtatCommandes');
                    } else {
                        toggleAuthState('showLogin');
                    }
                }
            }
        ];

        // Ajout d'options spécifiques au vendeur
        const vendorMenuItems = userRole === 'vendeur' ? [
            {
                label: 'Gérer mes Produits',
                icon: 'pi pi-box',
                command: () => navigate('/uservendeur-interface')
            },
            {
                label: 'Tableau de Bord Vendeur',
                icon: 'pi pi-chart-bar',
                command: () => navigate('/uservendeur-interface')
            }
        ] : [];

        setMenuModel([...baseMenuItems, ...vendorMenuItems]);
    }, [isLoggedIn, userRole, navigate]);

    // Gestion du défilement
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScroll = () => {
        setScrollPosition(window.scrollY);
    };

    // Gestion des états d'authentification
    const toggleAuthState = (stateKey) => {
        setAuthState({
            showSignup: false,
            showLogin: false,
            showForgotPassword: false,
            [stateKey]: !authState[stateKey]
        });
    };

    // Gestion de la déconnexion
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPhotoProfil('');
        setUserRole(null);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/');
    };

    // Navigation vers l'espace vendeur
    const handleSellClick = () => {
        isLoggedIn ? navigate('/uservendeur-interface') : toggleAuthState('showLogin');
    };

    // Gestion de la recherche
    const handleSearchChange = (event) => {
        const newQuery = event.target.value;
        setFormData(prev => ({ ...prev, query: newQuery }));
        onSearch(newQuery);
    };

    const searchProducts = async (event) => {
        const query = event.query;
        const selectedCategories = formData.categorie?.length ? formData.categorie : [];

        try {
            const response = await axios.get(`${config.API_BASE_URL}/api/produit/search-products/`, {
                params: { q: query, categories: selectedCategories }
            });
            setSuggestions(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
        }
    };

    // Rendu des éléments de recherche
    const itemTemplate = (item) => (
        <div className="flex align-items-center">
            <img 
                alt={item.nom} 
                src={`${baseUrl}${item.image_url}`} 
                style={{ width: '50px', height: '50px', marginRight: '10px' }} 
            />
            <div>{item.nom}</div>
        </div>
    );

    return (
        <div id="navbar-container" className={`${scrollPosition > 50 ? 'fixed-navbar' : ''}`}>
            {/* Première rangée */}
            <div className="navbar-row navbar-first-row">
                <Button
                    icon="pi pi-star"
                    label={userRole === 'vendeur' ? "Espace Vendeur" : "Commencez à Vendre"}
                    className="p-button-rounded navbar-start-selling-btn"
                    onClick={handleSellClick}
                />
                <Button
                    icon="pi pi-truck"
                    label="LIVRAISON"
                    className="bouton-livraison"
                />
                <Button
                    icon="pi pi-globe"
                    label="ESPACE VENDEUR"
                    className="bouton-espace-vendeur"
                    onClick={handleSellClick}
                />
            </div>

            {/* Deuxième rangée */}
            <div className="navbar-row navbar-second-row">
                {/* Logo */}
                <div id="navbar-lg" onClick={() => navigate('/')}>
                    <img src={LogoGM3} alt="Logo" />
                </div>
                
                {/* Barre de recherche */}
                <span className="p-input-icon-center navbar-input-icon">
                    <AutoComplete
                        id="navbar-search"
                        placeholder="Rechercher des articles"
                        value={formData.query}
                        onChange={handleSearchChange}
                        completeMethod={searchProducts}
                        itemTemplate={itemTemplate}
                        field="nom"
                        className="w-full md:w-20rem"
                    />
                </span>

                {/* Section droite */}
                <div id="navbar-end" className="navbar-end">
                    {/* Menu utilisateur */}
                    <div className="user-menu-wrapper navbar-user-menu-wrapper">
                        <Button
                            className="p-button-text"
                            onClick={(e) => menu.current.toggle(e)}
                            aria-controls="popup_menu"
                            aria-haspopup
                        >
                            <i className="pi pi-user" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></i>
                            <span style={{ fontSize: '0.8rem' }}>
                                {isLoggedIn ? `Bienvenue, ${username}` : 'Authentification'}
                            </span>
                        </Button>
                        <Menu model={menuModel} popup ref={menu} id="popup_menu" />
                    </div>
                    
                    {/* Notifications */}
                    <div className="notification-info">
                        <Button
                            className="bt-notif-info"
                            onClick={() => navigate('/notifications')}
                        >
                            <i className="pi pi-envelope" style={{ fontSize: '1.5rem' }}></i>
                            {notifications > 0 && (
                                <Badge value={notifications} severity="danger" className="navbar-notification-badge" />
                            )}
                        </Button>
                    </div>

                    {/* Panier (seulement pour non-vendeurs) */}
                    {userRole !== 'vendeur' && (
                        <div className="cart-button-container navbar-cart-button-container">
                            <Button
                                className="p-button-rounded p-button-success p-button-outlined navbar-carts-buttons"
                                onClick={() => navigate('/cart')}
                            >
                                <i className="pi pi-shopping-cart" style={{ fontSize: '1.5rem' }}></i>
                                <span className="navbar-cart-text">Panier</span>
                            </Button>
                            {cartItems.length > 0 && (
                                <Badge 
                                    value={cartItems.length} 
                                    severity="danger" 
                                    className="navbar-cart-badge"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Modales d'authentification */}
                {authState.showSignup && (
                    <Signup 
                        visible={authState.showSignup} 
                        onClose={() => toggleAuthState('showSignup')} 
                    />
                )}
                {authState.showLogin && (
                    <Login 
                        visible={authState.showLogin} 
                        onClose={() => toggleAuthState('showLogin')} 
                    />
                )}
                {authState.showForgotPassword && (
                    <ForgotPassword 
                        visible={authState.showForgotPassword} 
                        onClose={() => toggleAuthState('showForgotPassword')} 
                    />
                )}
            </div>
        </div>
    );
}