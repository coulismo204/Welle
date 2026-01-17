import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { UserContext } from '../common/UserContext';
import config from '../store/config';

const RoleProtectedRoute = ({ children, requiredRole }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(UserContext);
    const token = localStorage.getItem('access');

    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoggedIn || !token) {
                navigate('/login', { state: { from: window.location.pathname } });
                return;
            }

            try {
                await axios.get(`${config.API_BASE_URL}/api/utilisateur/check-access/${requiredRole}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setIsAuthorized(true);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    setError(error.response.data.detail || "Vous n'avez pas les permissions nécessaires");
                } else {
                    setError("Une erreur s'est produite lors de la vérification des droits d'accès");
                }
                setIsAuthorized(false);
            }
        };

        checkAccess();
    }, [token, requiredRole, navigate, isLoggedIn]);

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: window.location.pathname }} />;
    }

    if (isAuthorized === null) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-column align-items-center gap-4 p-4">
                <Message 
                    severity="error" 
                    text={error}
                    style={{ width: '100%', maxWidth: '600px' }}
                />
                <div className="flex gap-2">
                    <Button 
                        label="Retour à l'accueil"
                        icon="pi pi-home"
                        onClick={() => navigate('/')}
                    />
                    {requiredRole === 'vendeur' && (
                        <Button 
                            label="Devenir vendeur"
                            icon="pi pi-user-plus"
                            severity="success"
                            onClick={() => navigate('/devenir-vendeur')}
                        />
                    )}
                </div>
            </div>
        );
    }

    return children;
};

export default RoleProtectedRoute;