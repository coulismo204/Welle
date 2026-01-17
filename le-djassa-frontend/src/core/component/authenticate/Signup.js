import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import config from '../../../core/store/config';
import '../../../app_main/style/authenticate/Signup.css';

const SignupStepper = ({ onClose }) => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        adresse: '',
        est_vendeur: false
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const steps = [
        {
            title: "Nom d'utilisateur",
            icon: 'pi pi-user',
            fields: [
                { name: 'username', label: "Nom d'utilisateur", type: 'text', required: true }
            ]
        },
        {
            title: 'Email',
            icon: 'pi pi-envelope',
            fields: [
                { name: 'email', label: 'Email', type: 'email', required: true }
            ]
        },
        {
            title: 'Mot de passe',
            icon: 'pi pi-lock',
            fields: [
                { name: 'password', label: 'Mot de passe', type: 'password', required: true },
                { name: 'password2', label: 'Confirmation', type: 'password', required: true }
            ]
        },
        {
            title: 'Type de compte',
            icon: 'pi pi-shopping-cart',
            fields: []
        }
    ];

    const handleChange = (name, value) => {
        setUserData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        if (userData.password !== userData.password2) {
            setErrors({ password2: 'Les mots de passe ne correspondent pas' });
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(
                `${config.API_BASE_URL}/api/utilisateur/register/`,
                userData,
                { headers: { 'Content-Type': 'application/json' } }
            );
            setVisible(false);
            onClose?.();
            navigate('/');
        } catch (err) {
            if (err.response?.data) setErrors(err.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
            >
                {steps[currentStep].fields.map(field => (
                    <div key={field.name} className="form-field">
                        {field.type === 'password' ? (
                            <span className="p-input-icon-right p-float-label">
                                <i
                                    className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <InputText
                                    id={field.name}
                                    type={showPassword ? 'text' : 'password'}
                                    value={userData[field.name]}
                                    onChange={e => handleChange(field.name, e.target.value)}
                                    className={errors[field.name] ? 'p-invalid' : ''}
                                />
                                <label htmlFor={field.name}>{field.label}</label>
                            </span>
                        ) : (
                            <span className="p-float-label">
                                <InputText
                                    id={field.name}
                                    type={field.type}
                                    value={userData[field.name]}
                                    onChange={e => handleChange(field.name, e.target.value)}
                                />
                                <label htmlFor={field.name}>{field.label}</label>
                            </span>
                        )}
                        {errors[field.name] && <small className="p-error">{errors[field.name]}</small>}
                    </div>
                ))}

                {currentStep === 3 && (
                    <div className="account-type-cards">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`account-card ${!userData.est_vendeur ? 'active' : ''}`}
                            onClick={() => handleChange('est_vendeur', false)}
                        >
                            <i className="pi pi-user"></i>
                            <h4>Acheteur</h4>
                            <p>Achetez facilement sur le Djassa</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`account-card ${userData.est_vendeur ? 'active' : ''}`}
                            onClick={() => handleChange('est_vendeur', true)}
                        >
                            <i className="pi pi-briefcase"></i>
                            <h4>Vendeur</h4>
                            <p>Vendez vos produits et services</p>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    return (
        <>
            {isLoading && (
                <div className="overlay">
                    <ProgressSpinner />
                </div>
            )}

            <Dialog
                visible={visible}
                onHide={() => setVisible(false)}
                className="signup-dialog"
                header={
                    <div className="dialog-header">
                        <i className={`${steps[currentStep].icon}`} />
                        <span>{steps[currentStep].title}</span>
                    </div>
                }
                footer={
                    <div className="button-container">
                        <Button
                            label="Précédent"
                            icon="pi pi-angle-left"
                            className="p-button-outlined"
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(s => s - 1)}
                        />
                        {currentStep === steps.length - 1 ? (
                            <Button label="S'inscrire" icon="pi pi-check" onClick={handleSubmit} />
                        ) : (
                            <Button label="Suivant" icon="pi pi-angle-right" iconPos="right"
                                onClick={() => setCurrentStep(s => s + 1)} />
                        )}
                    </div>
                }
            >
                <div className="progress-bar">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className={`progress-step ${i <= currentStep ? 'progress-step-active' : ''}`}
                        />
                    ))}
                </div>

                {renderStepContent()}

                {currentStep === 0 && (
                    <div className="login-link">
                        <p>
                            Déjà inscrit ?{' '}
                            <Link to="/login" onClick={() => setVisible(false)} className="login-button">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default SignupStepper;
