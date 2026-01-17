import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Avatar } from 'primereact/avatar';
import '../../../../app_main/style/seller/compte/EditProfil.css';

const EditProfile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        shopName: '',
        address: '',
        phone: '',
        email: '',
        photoProfil: null,
    });

    const [currentStep, setCurrentStep] = useState(1);  // Pour suivre l'étape actuelle

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.files[0];
        setUserData((prevState) => ({
            ...prevState,
            photoProfil: URL.createObjectURL(file),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Données soumises:', userData);
    };

    // Fonction pour aller à l'étape suivante
    const nextStep = () => {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    };

    // Fonction pour revenir à l'étape précédente
    const prevStep = () => {
        setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
    };

    return (
        <div className="EdP-edit-profile-container">
            {/* Section des champs de saisie */}
            <div className="EdP-form-section">
                <h2>Modifier mon profil</h2>
                <form onSubmit={handleSubmit} className="EdP-edit-profile-form">
                    {currentStep === 1 && (
                        <>
                            <div className="EdP-form-group">
                                <label htmlFor="firstName">Prénom</label>
                                <InputText
                                    id="firstName"
                                    name="firstName"
                                    value={userData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="EdP-form-group">
                                <label htmlFor="lastName">Nom</label>
                                <InputText
                                    id="lastName"
                                    name="lastName"
                                    value={userData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="EdP-form-group">
                                <label htmlFor="shopName">Nom de la boutique</label>
                                <InputText
                                    id="shopName"
                                    name="shopName"
                                    value={userData.shopName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="EdP-form-group">
                                <label htmlFor="address">Adresse</label>
                                <InputTextarea
                                    id="address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="EdP-form-group">
                                <label htmlFor="phone">Téléphone</label>
                                <InputText
                                    id="phone"
                                    name="phone"
                                    value={userData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="EdP-form-group">
                                <label htmlFor="email">Email</label>
                                <InputText
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="EdP-form-group">
                                <label htmlFor="photoProfil">Photo de profil</label>
                                <FileUpload
                                    name="photoProfil"
                                    url=""
                                    onSelect={handleFileSelect}
                                    accept="image/*"
                                    maxFileSize={1000000}
                                    auto={false}
                                    customUpload
                                    uploadHandler={() => {}}
                                    chooseLabel="Choisir une image"
                                />
                            </div>
                        </>
                    )}

                    <div className="EdP-navigation-buttons">
                        <Button
                            type="button"
                            label="Précédent"
                            icon="pi pi-arrow-left"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        />
                        {currentStep === 3 ? (
                            <Button type="submit" label="Enregistrer" icon="pi pi-check" className="p-button-success" />
                        ) : (
                            <Button type="button" label="Suivant" icon="pi pi-arrow-right" onClick={nextStep} />
                        )}
                    </div>
                </form>
            </div>

            {/* Section du résumé des informations */}
            <div className="EdP-summary-section">
                <h3>Résumé des informations</h3>
                <div className="EdP-summary-card">
                    <Avatar image={userData.photoProfil} size="xlarge" shape="circle" />
                    <p><strong>Nom:</strong> {userData.firstName} {userData.lastName}</p>
                    <p><strong>Boutique:</strong> {userData.shopName}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Téléphone:</strong> {userData.phone}</p>
                    <p><strong>Adresse:</strong> {userData.address}</p>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
