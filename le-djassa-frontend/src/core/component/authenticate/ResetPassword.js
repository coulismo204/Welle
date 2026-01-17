import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import queryString from 'query-string';
import config from '../../../core/store/config';
import '../../../app_main/style/authenticate/ResetPassword.css';
import { Toast } from 'primereact/toast';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { code, email: emailParam } = queryString.parse(location.search);

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [emailParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation côté client
        if (newPassword !== confirmPassword) {
            showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/utilisateur/password-reset/confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Gestion des différents cas d'erreur du backend
                switch (response.status) {
                    case 400:
                        if (data.detail.includes('déjà été utilisé')) {
                            showToast('warn', 'Warning', data.detail);
                        } else if (data.detail.includes('expiré')) {
                            showToast('warn', 'Warning', data.detail);
                        } else {
                            showToast('error', 'Erreur', data.detail || "Erreur lors de la réinitialisation du mot de passe.");
                        }
                        break;
                    case 404:
                        showToast('error', 'Erreur', 'Utilisateur non trouvé.');
                        break;
                    default:
                        showToast('error', 'Erreur', 'Une erreur est survenue. Veuillez réessayer plus tard.');
                }
            } else {
                showToast('success', 'Succès', data.detail || "Mot de passe réinitialisé avec succès.")
                // Redirection après un court délai pour que l'utilisateur puisse voir le message de succès
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur de connexion au serveur. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <Toast ref={toast} />
            <h2>Réinitialiser le Mot de Passe</h2>
            <form onSubmit={handleSubmit} className="reset-password-form">
                <span className="p-float-label">
                    <InputText
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="reset-password-input w-full"
                        disabled
                    />
                    <label htmlFor="email">Adresse e-mail</label>
                </span>
                <span className="p-float-label">
                    <InputText
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="reset-password-input w-full"
                    />
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                </span>
                <span className="p-float-label">
                    <InputText
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="reset-password-input w-full"
                    />
                    <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                </span>
                <Button 
                    type="submit" 
                    label="Réinitialiser" 
                    className="reset-password-button w-full"
                    loading={loading}
                    disabled={loading}
                />
            </form>
        </div>
    );
};

export default ResetPassword;