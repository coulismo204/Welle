import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { InputMask } from 'primereact/inputmask';
import { FloatLabel } from 'primereact/floatlabel';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../../../../app_main/style/MyAccount.css';
import config from '../../../../core/store/config';

export default function MyAccount({ visible, onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        nom_boutique: '',
        adresse: '',
        photo_profil: null,
        photo_cni_recto: null,
        photo_cni_verso: null,
        numero_telephone: '',
        email: '',
    });

    const toast = useRef(null);
    const baseUrl = `${config.API_BASE_URL}/media/`;

    const showToast = useCallback((severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail, life: 3000 });
        }
    }, []);

    const getPhotoUrl = useCallback((photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http') || photoPath.startsWith('https')) {
            return photoPath;
        }
        return `${baseUrl}${photoPath}`;
    }, [baseUrl]);

    const fetchUserData = useCallback(() => {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            fetch(`${config.API_BASE_URL}/api/utilisateur/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                setFormData({
                    username: data.username || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    nom_boutique: data.nom_boutique || '',
                    adresse: data.adresse || '',
                    numero_telephone: data.numero_telephone || '',
                    email: data.email || '',
                    photo_profil: getPhotoUrl(data.photo_profil),
                    photo_cni_recto: getPhotoUrl(data.photo_cni_recto),
                    photo_cni_verso: getPhotoUrl(data.photo_cni_verso),
                });
                showToast('success', 'Succès', 'Données utilisateur récupérées avec succès');
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                showToast('error', 'Erreur', 'Impossible de charger les données utilisateur');
            });
        } else {
            console.error('Token d\'accès non trouvé');
            showToast('error', 'Erreur', 'Vous n\'êtes pas connecté');
        }
    }, [getPhotoUrl, showToast]);

    useEffect(() => {
        if (visible) {
            fetchUserData();
        }
    }, [visible, fetchUserData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (event, fieldName) => {
        const file = event.files[0];
        setFormData(prevState => ({
            ...prevState,
            [fieldName]: file
        }));
        showToast('info', 'Info', `${fieldName.replace('_', ' ')} sélectionnée`);
    };

    const handleUploadSuccess = (fieldName) => {
        showToast('success', 'Succès', `${fieldName.replace('_', ' ')} téléchargée avec succès`);
    };

    const handleUploadError = (fieldName) => {
        showToast('error', 'Erreur', `Erreur lors du téléchargement de ${fieldName.replace('_', ' ')}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                if (key === 'photo_profil' || key === 'photo_cni_recto' || key === 'photo_cni_verso') {
                    if (value instanceof File) {
                        formDataToSend.append(key, value, value.name);
                    }
                } else {
                    formDataToSend.append(key, value);
                }
            }
        });

        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            fetch(`${config.API_BASE_URL}/api/utilisateur/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formDataToSend
            })
            .then(response => response.json())
            .then(data => {
                console.log('Mise à jour réussie:', data);
                showToast('success', 'Succès', 'Profil mis à jour avec succès');
                
                // Retarder la fermeture du dialogue
                setTimeout(() => {
                    onClose();
                }, 1000); // Délai de 3 secondes
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour des données utilisateur:', error);
                showToast('error', 'Erreur', 'Impossible de mettre à jour le profil');
            });
        } else {
            console.error('Token d\'accès non trouvé');
            showToast('error', 'Erreur', 'Vous n\'êtes pas connecté');
        }
    };

    return (
        <Dialog header="Mon Compte" visible={visible} onHide={onClose} className="p-fluid">
            <Toast ref={toast} />
            <div className="account-section">
                <div className="account-header">
                    <div className="account-avatar p-overlay-badge">
                        {formData.photo_profil ? (
                            <img
                                src={formData.photo_profil}
                                alt={`Profil de ${formData.last_name}`}
                                style={{ width: '45px', height: '50px', borderRadius: '50%' }}
                            />
                        ) : (
                            <i className="pi pi-user" style={{ fontSize: '1.5rem', color: '#ffffff' }} />
                        )}
                    </div>
                    <div className="account-username">Mon Compte</div>
                </div>
                <form className="account-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <FloatLabel>
                                <InputText id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                                <label htmlFor="first_name">Prénom</label>
                            </FloatLabel>
                        </div>
                        <div className="form-group">
                            <FloatLabel>
                                <InputText id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                                <label htmlFor="last_name">Nom</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <FloatLabel>
                                <InputText id="nom_boutique" name="nom_boutique" value={formData.nom_boutique} onChange={handleInputChange} />
                                <label htmlFor="nom_boutique">Nom de la Boutique</label>
                            </FloatLabel>
                        </div>
                        <div className="form-group">
                            <FloatLabel>
                                <InputText id="adresse" name="adresse" value={formData.adresse} onChange={handleInputChange} />
                                <label htmlFor="adresse">Adresse</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <FloatLabel>
                                <InputMask id="numero_telephone" name="numero_telephone" value={formData.numero_telephone} mask="+225 99 99 99 99 99" onChange={handleInputChange} />
                                <label htmlFor="numero_telephone">Numéro de Téléphone</label>
                            </FloatLabel>
                        </div>
                        <div className="form-group">
                            <FloatLabel>
                                <InputText id="email" name="email" value={formData.email} onChange={handleInputChange} />
                                <label htmlFor="email">Email</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <FileUpload 
                                name="photo_profil" 
                                mode="basic" 
                                accept="image/*" 
                                customUpload 
                                uploadHandler={(e) => handleFileUpload(e, 'photo_profil')} 
                                chooseLabel="Choisir Photo de Profil" 
                                className="p-button-success"
                                onUpload={() => handleUploadSuccess('photo_profil')} 
                                onError={() => handleUploadError('photo_profil')} 
                            />
                            <label htmlFor="photo_profil">Photo de Profil</label>
                        </div>
                        <div className="form-group">
                            <FileUpload 
                                name="photo_cni_recto" 
                                mode="basic" 
                                accept="image/*" 
                                customUpload 
                                uploadHandler={(e) => handleFileUpload(e, 'photo_cni_recto')} 
                                chooseLabel="Choisir CNI Recto" 
                                className="p-button-success"
                                onUpload={() => handleUploadSuccess('photo_cni_recto')} 
                                onError={() => handleUploadError('photo_cni_recto')} 
                            />
                            <label htmlFor="photo_cni_recto">CNI Recto</label>
                        </div>
                        <div className="form-group">
                            <FileUpload 
                                name="photo_cni_verso" 
                                mode="basic" 
                                accept="image/*" 
                                customUpload 
                                uploadHandler={(e) => handleFileUpload(e, 'photo_cni_verso')} 
                                chooseLabel="Choisir CNI Verso" 
                                className="p-button-success"
                                onUpload={() => handleUploadSuccess('photo_cni_verso')} 
                                onError={() => handleUploadError('photo_cni_verso')} 
                            />
                            <label htmlFor="photo_cni_verso">CNI Verso</label>
                        </div>
                    </div>
                    <Button type="submit" label="Sauvegarder" />
                </form>
            </div>
        </Dialog>
    );
}
