import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import config from '../../core/store/config';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    console.log('UserProvider rendu');

    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem('access');
        return !!token;
    });
    const [username, setUsername] = useState('');
    const [photoProfil, setPhotoProfil] = useState('');
    const [isSeller, setIsSeller] = useState(false); // Ajout de l'état pour savoir si c'est un vendeur

    const toast = useRef(null);
    const baseUrl = `${config.API_BASE_URL}/media/`;

    const getPhotoUrl = useCallback((photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('https')) {
            return photoPath;
        }
        return `${baseUrl}${photoPath}`;
    }, [baseUrl]);

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            console.log('Toast:', { severity, summary, detail });
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        const accessToken = localStorage.getItem('access');
        console.log('Jeton d\'accès récupéré:', accessToken);
    
        if (accessToken) {
            const apiUrl = `${config.API_BASE_URL}/api/utilisateur/profile/`;
            console.log('URL de l\'API:', apiUrl);
    
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expiré ou invalide
                        localStorage.removeItem('access');
                        localStorage.removeItem('refresh');
                        setIsLoggedIn(false);
                        return null;
                    }

                    throw new Error('Erreur lors de la récupération des données utilisateur.');
                }
    
                const data = await response.json();
    
                const photoUrl = getPhotoUrl(data.photo_profil);
    
                setUsername(data.username || '');
                setPhotoProfil(photoUrl);
    
                // Ajout de la vérification si l'utilisateur est vendeur
                if (data.hasOwnProperty('est_vendeur')) {
                    setIsSeller(data.est_vendeur);
                } else {
                    setIsSeller(false);  // Valeur par défaut si l'information est absente
                }
    
                return data;  // Retourne les données utilisateur pour utilisation dans Login.js
    
            } catch (error) {
                showToast('error', 'Erreur', 'Impossible de charger les données utilisateur');
                return null;
            }
        } else {
            showToast('error', 'Erreur', 'Le token n\'existe pas !');
            return null;
        }
    }, [getPhotoUrl, showToast]);
    
    // Vérifie l'authentification au chargement
    useEffect(() => {
        if (localStorage.getItem('access')) {
            fetchUserData();
        }
    }, [fetchUserData]);

    // Rafraîchir le token périodiquement
    useEffect(() => {
        const refreshToken = async () => {
            const refresh = localStorage.getItem('refresh');
            if (!refresh) return;

            try {
                const response = await fetch(`${config.API_BASE_URL}/api/utilisateur/token/refresh/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh }),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('access', data.access);
                    fetchUserData();
                }
            } catch (error) {
                console.error('Erreur refresh token:', error);
            }
        };

        // Rafraîchir le token toutes les 4 minutes (le token expire après 5 minutes)
        const intervalId = setInterval(refreshToken, 4 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [fetchUserData]);

    const logout = useCallback(() => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setIsLoggedIn(false);
        setUsername('');
        setPhotoProfil('');
        setIsSeller(false);
    }, []);

    return (
        <UserContext.Provider value={{ 
            isLoggedIn, 
            setIsLoggedIn, 
            username, 
            setUsername, 
            photoProfil, 
            setPhotoProfil, 
            fetchUserData, 
            isSeller,  // Ajout de isSeller dans le contexte
            setIsSeller,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};
