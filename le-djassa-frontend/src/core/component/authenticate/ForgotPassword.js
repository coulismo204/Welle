import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import config from '../../../core/store/config';
import '../../../app_main/style/authenticate/ForgotPassword.css';

const ForgotPassword = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const toast = useRef(null);
    const navigate = useNavigate();
    const [visible, setVisible] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Basic email format validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            const errorMessage = 'Veuillez entrer une adresse e-mail valide.';
            setMessage(errorMessage);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 3000 });
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/utilisateur/request-reset-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi de la demande de réinitialisation.');
            }

            const successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.';
            setMessage(successMessage);
            toast.current.show({ severity: 'info', summary: 'Succès', detail: successMessage, life: 3000 });
            setVisible(false);
            setEmail('');
            navigate('/');
        } catch (error) {
            setMessage(error.message);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    };

    const handleCloseDialog = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
        navigate('/');
    };

    const renderHeader = () => {
        return (
            <div className="log-dialog-header-forgot-password">
                <span>Réinitialisation du Mot de Passe</span>
                <Button 
                    icon="pi pi-times" 
                    rounded 
                    severity="danger"
                    onClick={handleCloseDialog}
                    className="log-close-button-forgot-password"
                />
            </div>
        );
    };

    return (
        <Dialog 
            visible={visible} 
            onHide={handleCloseDialog}
            header={renderHeader()} 
            closable={false} 
            className="forgot-password-dialog"
        >
            <Toast ref={toast} />
            <h2>Mot de Passe Oublié</h2>
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <span className="p-float-label">
                    <InputText
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="forgot-password-input"
                    />
                    <label htmlFor="email">Entrez votre e-mail</label>
                </span>
                <Button type="submit" label="Envoyer" className="forgot-password-button" />
            </form>
            {message && <div className="forgot-password-message">{message}</div>}
        </Dialog>
    );
};

export default ForgotPassword;
