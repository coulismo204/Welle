import config from '../../../core/store/config';
import '../../../app_main/style/authenticate/Login.css';
import React, { useState, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../common/UserContext';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Login = ({ onClose }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [alertMessage, setAlertMessage] = useState('');
    const { setIsLoggedIn, setUsername, fetchUserData } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(true);
    const navigate = useNavigate();
    const toast = useRef(null);

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/utilisateur/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                throw new Error('Identifiant ou mot de passe incorrect.');
            }
    
            const data = await response.json();
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
    
            setAlertMessage('Connexion réussie !');

            setIsLoggedIn(true);
            setUsername(formData.username);

            setVisible(false);
    
            const userData = await fetchUserData();
    
            if (userData?.est_vendeur) {
                navigate('/uservendeur-interface');
                showToast('info', 'Info', 'Connexion réussie');
            } else {
                showToast('info', 'Info', 'Connexion réussie');
            }
    
        } catch (error) {
            setAlertMessage('Identifiant ou mot de passe incorrect.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
        navigate('/');
    };

    const renderHeader = () => (
        <div className="log-dialog-header">
            <span>Le Djassa</span>
            <Button 
                icon="pi pi-times" 
                rounded 
                severity="danger"
                onClick={handleCloseDialog}
                className="log-close-button-login"
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} className="log-toast-login" />
            <Dialog 
                visible={visible} 
                onHide={handleCloseDialog}
                className="log-dialog-login"
                header={renderHeader()}
                closeOnEscape={false}
                closable={false}
            >
                <div className="log-container-login">
                    <form onSubmit={handleSubmit} className="log-form-login">
                        <span className="p-float-label">
                            <InputText
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="log-form-input-login"
                            />
                            <label htmlFor="username">Nom d'utilisateur</label>
                        </span>
                        
                        <span className="p-float-label">
                            <InputText
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="log-form-input-login"
                            />
                            <label htmlFor="password">Mot de passe</label>
                        </span>
    
                        {alertMessage && (
                            <div className={`log-alert-login ${alertMessage.includes('réussie') ? 'log-alert-success-login' : 'log-alert-error-login'}`}>
                                {alertMessage}
                            </div>
                        )}
    
                        <Button 
                            type="submit" 
                            className="log-button-login" 
                            disabled={isLoading}
                            loading={isLoading}
                            label="Se connecter"
                        />
    
                        <div className="log-links-container-login">
                            <Link to="/forgot-password" onClick={handleCloseDialog} className="log-forgot-password-link-login">
                                Mot de passe oublié ?
                            </Link>
                            <Link to="/signup" onClick={handleCloseDialog} className="log-register-link-login">
                                Tu n'as pas de compte ? Inscris-toi
                            </Link>
                        </div>
                    </form>
                </div>
            </Dialog>
        </>
    );
};

export default Login;
