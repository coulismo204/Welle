import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { Chart } from 'primereact/chart';
import { Avatar } from 'primereact/avatar';
import { useNavigate } from 'react-router-dom';
import CommandesHistorique from './CommandesHistorique';
import InfoPersonnelle from './InfoPersonnelle';

import axios from 'axios';
import config from '../../../../core/store/config';

export default function MyAccount({ userData }) {
    const [activeSection, setActiveSection] = useState('informations');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        lastName: userData?.last_name || '',
        firstName: userData?.first_name || '',
        address: userData?.adresse || '',
        phone: userData?.numero_telephone || '',
        email: userData?.email || ''
    });

    const orderStats = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
            label: 'Commandes mensuelles',
            data: [2, 4, 3, 5, 4, 3],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        }]
    };

    // Fonction pour gérer le changement dans les inputs du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Fonction pour soumettre le formulaire
    const handleSubmit = async () => {
        try {
            const accessToken = localStorage.getItem('access');
            const response = await axios.put(`${config.API_BASE_URL}/api/utilisateur/profile/`, formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('Profil mis à jour avec succès', response.data);
            setIsEditingProfile(false); // Masquer le formulaire après la mise à jour
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil', error);
        }
    };

    // Mettez à jour formData lorsque userData change
    useEffect(() => {
        if (userData) {
            setFormData({
                lastName: userData.last_name || '',
                firstName: userData.first_name || '',
                address: userData.adresse || '',
                phone: userData.numero_telephone || '',
                email: userData.email || ''
            });
        }
    }, [userData]);

    return (
        <div className="my-account-container">
            <div className="profile-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="avatar-section">
                    {userData?.photoProfil ? (
                        <img
                            src={userData.photoProfil}
                            alt={`Profil de ${userData.lastName}`}
                            style={{ width: '45px', height: '50px', borderRadius: '50%' }}
                        />
                    ) : (
                        <Avatar icon="pi pi-user" className="p-mr-2" size="large" />
                    )}
                </div>

                <div className="profile-actions" style={{ display: 'flex', alignItems: 'center' }}>
                    <Button label="Modifier mon profil" icon="pi pi-pencil" className="p-button-outlined p-button-primary" raised onClick={() => setIsEditingProfile(true)} />
                    <Button onClick={() => navigate('/')} label="Accueil" icon="pi pi-home" className="p-button-outlined p-button-secondary" style={{ marginLeft: '10px' }} raised />
                </div>
            </div>

            {/* Boutons pour afficher les différentes sections */}
            <div className="profile-buttons">
                <Button label="Informations Personnelles" icon="pi pi-info" severity="primary" className="p-button-outlined" onClick={() => setActiveSection('informations')} raised />
                <Button label="Historique des commandes" icon="pi pi-file" severity="help" className="p-button-outlined" onClick={() => setActiveSection('commandes')} raised />
                <Button label="Adresses" icon="pi pi-map" severity="help" className="p-button-outlined" onClick={() => setActiveSection('adresses')} raised />
                <Button label="Paramètres" icon="pi pi-cog" severity="warning" className="p-button-outlined" onClick={() => setActiveSection('parametres')} raised />
            </div>

            {/* Affichage conditionnel des sections */}
            {activeSection === 'informations' && !isEditingProfile && (
                <InfoPersonnelle />
            )}

            {activeSection === 'informations' && isEditingProfile && (
                <Card title="Modifier mes informations personnelles">
                    <div className="p-field">
                        <label>Nom</label>
                        <InputText value={formData.lastName} name="lastName" onChange={handleInputChange} />
                    </div>
                    <div className="p-field">
                        <label>Prénom</label>
                        <InputText value={formData.firstName} name="firstName" onChange={handleInputChange} />
                    </div>
                    <div className="p-field">
                        <label>Adresse</label>
                        <InputText value={formData.address} name="address" onChange={handleInputChange} />
                    </div>
                    <div className="p-field">
                        <label>Téléphone</label>
                        <InputText value={formData.phone} name="phone" onChange={handleInputChange} />
                    </div>
                    <div className="p-field">
                        <label>Email</label>
                        <InputText value={formData.email} name="email" onChange={handleInputChange} />
                    </div>
                    <Button label="Sauvegarder les modifications" icon="pi pi-check" onClick={handleSubmit} raised />
                    <Button label="Annuler" icon="pi pi-times" className="p-button-secondary" onClick={() => setIsEditingProfile(false)} raised style={{ marginLeft: '10px' }} />
                </Card>
            )}

            {activeSection === 'commandes' && (
                <Card title="Mes Commandes">
                    <CommandesHistorique />
                    <Card title="Statistiques des commandes">
                        <Chart type="bar" data={orderStats} />
                    </Card>
                </Card>
            )}

            {activeSection === 'adresses' && (
                <Card title="Mes Adresses">
                    <div className="address-form">
                        <InputTextarea rows={3} placeholder="Ajouter une nouvelle adresse" />
                        <Button label="Ajouter l'adresse" icon="pi pi-plus" className="p-button-success" raised />
                    </div>
                    <div className="existing-addresses">
                        <p>123 Rue Principale, Abidjan, Côte d'Ivoire</p>
                        <p>456 Avenue Secondaire, Yamoussoukro, Côte d'Ivoire</p>
                    </div>
                </Card>
            )}

            {activeSection === 'parametres' && (
                <Card title="Paramètres du compte">
                    <Button label="Changer de mot de passe" icon="pi pi-lock" className="p-button-warning" raised />
                    <Divider />
                    <Button label="Supprimer le compte" icon="pi pi-times" className="p-button-danger" raised />
                </Card>
            )}
        </div>
    );
}
