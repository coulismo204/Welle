import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import '../../../../app_main/style/seller/compte/Profil.css';
import EditProfil from './EditProfil';
import config from '../../../../core/store/config';

const Profil = () => {
    const [userData, setUserData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        nom_boutique: '',
        adresse: '',
        photo_profil: null,
        numero_telephone: '',
        email: '',
    });

    const [statistics, setStatistics] = useState({
        published_count: 0,
        sold_count: 0,
        total_revenue: 0,
        rank_message: '',
        rank: null,
        total_sales: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    
    const toast = useRef(null);
    const navigate = useNavigate();

    // Mémoisation de l'URL de base
    const baseUrl = useMemo(() => `${config.API_BASE_URL}/media/`, []);

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ 
                severity, 
                summary, 
                detail, 
                life: 3000 
            });
        }
    }, []);

    const getPhotoUrl = useCallback((photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('https')) {
            return photoPath;
        }
        return `${baseUrl}${photoPath}`;
    }, [baseUrl]);

    const checkAuthAndRedirect = useCallback(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
            navigate('/login');
            return false;
        }
        return token;
    }, [navigate, showToast]);

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const token = checkAuthAndRedirect();
        if (!token) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/utilisateur/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access');
                    navigate('/login');
                    throw new Error('Session expirée');
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            setUserData({
                username: data.username || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                nom_boutique: data.nom_boutique || '',
                adresse: data.adresse || '',
                numero_telephone: data.numero_telephone || '',
                email: data.email || '',
                photo_profil: getPhotoUrl(data.photo_profil),
            });
            showToast('success', 'Succès', 'Données utilisateur récupérées avec succès');
        } catch (error) {
            setError(error.message);
            showToast('error', 'Erreur', `Impossible de charger les données: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, getPhotoUrl, showToast, checkAuthAndRedirect]);


    const fetchUserDataRank = useCallback(async () => {
        const token = checkAuthAndRedirect();
        if (!token) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/produit/statistics/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('access');
                    navigate('/login');
                    throw new Error('Session expirée');
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            setStatistics(data);

        } catch (error) {
            showToast('error', 'Erreur', `Impossible de charger les statistiques: ${error.message}`);
        }
    }, [navigate, checkAuthAndRedirect, showToast]);

    useEffect(() => {
        Promise.all([fetchUserData(), fetchUserDataRank()]);
    }, [fetchUserData, fetchUserDataRank]);

    const handleEditClose = useCallback(() => {
        setIsEditing(false);
        fetchUserData(); // Rafraîchir les données après modification
    }, [fetchUserData]);

    // Composant de chargement mémoisé
    const LoadingComponent = useMemo(() => (
        <div className="loading-container">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2em' }}></i>
            <p>Chargement de votre profil...</p>
        </div>
    ), []);

    // Composant d'erreur mémoisé
    const ErrorComponent = useMemo(() => error && (
        <div className="error-container">
            <i className="pi pi-exclamation-triangle" style={{ color: 'red' }}></i>
            <p>{error}</p>
            <Button label="Réessayer" onClick={fetchUserData} />
        </div>
    ), [error, fetchUserData]);

    if (isLoading) return LoadingComponent;
    if (error) return ErrorComponent;

    return (
        <div className="profile-container">
            <Toast ref={toast} />
            
            {isEditing ? (
                <EditProfil 
                    userData={userData} 
                    onClose={handleEditClose} 
                />
            ) : (
                <>
                    <div className="profile-top">
                        <div className="avatar-section">
                            {userData.photo_profil ? (
                                <img
                                    src={userData.photo_profil}
                                    alt={`Profil de ${userData.last_name}`}
                                    className="profile-avatar"
                                />
                            ) : (
                                <Avatar 
                                    icon="pi pi-user" 
                                    style={{ width: '80px', height: '80px' }}
                                    className="p-mr-2" 
                                />
                            )}
                            <div className="profile-name">
                                <h2>{userData.username}</h2>
                                <div className="verified-info">
                                    <Rating value={4} readOnly cancel={false} stars={5} />
                                    <p>4/5 - Vendeur certifié</p>
                                </div>
                            </div>
                        </div>

                        <Button 
                            label="Modifier mon profil" 
                            icon="pi pi-pencil" 
                            className="p-button-outlined p-button-primary" 
                            onClick={() => setIsEditing(true)}
                        />
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <span> {userData.last_name}</span>
                        </div>
                        <div className="detail-item">
                            <span> {userData.first_name}</span>
                        </div>
                        <div className="detail-item">
                            <i className="pi pi-shop"></i>
                            <span> {userData.nom_boutique}</span>
                        </div>
                        <div className="detail-item">
                            <i className="pi pi-map-marker"></i>
                            <span> {userData.adresse}</span>
                        </div>
                        <div className="detail-item">
                            <i className="pi pi-phone"></i>
                            <span> {userData.numero_telephone}</span>
                        </div>
                        <div className="detail-item">
                            <i className="pi pi-envelope"></i>
                            <span> {userData.email}</span>
                        </div>
                    </div>

                    <div className="about">
                        <p>{statistics.rank_message}</p>
                    </div>

                    <div className="profile-buttons">
                        <Button 
                            label="Accueil" 
                            icon="pi pi-home" 
                            className="p-button-outlined p-button-secondary" 
                            onClick={() => navigate('/')} 
                        />
                        <Button 
                            label="Mes annonces" 
                            icon="pi pi-file" 
                            className="p-button-outlined p-button-secondary" 
                            onClick={() => navigate('/mes-annonces')}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Profil;