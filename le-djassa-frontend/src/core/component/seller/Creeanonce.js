import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';  
import '../../../app_main/style/seller/Creeanonce.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import config from '../../../core/store/config';

const AddProduct = ({ isVisible, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        qte_stock: 0,
        prix: null,
        localisation: '',
        etat: null,
        uploaded_images: [],
        categorie: null,
    });
    const [etatsOptions, setEtatsOptions] = useState([]);
    const [categoriesOptions, setCategoriesOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [step, setStep] = useState(0);
    const toast = useRef(null);

    useEffect(() => {
        const fetchEtats = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/api/produit/etats/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setEtatsOptions(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des états:', error);
                showError('Erreur lors de la récupération des états');
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/api/produit/categories/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setCategoriesOptions(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
                showError('Erreur lors de la récupération des catégories');
            }
        };

        fetchEtats();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            uploaded_images: e.files
        }));
        setUploadCompleted(e.files.length > 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'uploaded_images') {
                for (let i = 0; i < formData.uploaded_images.length; i++) {
                    data.append('uploaded_images', formData.uploaded_images[i]);
                }
            } else if (key === 'categorie') {
                data.append(key, formData[key]?.id);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`${config.API_BASE_URL}/api/produit/create/`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            showSuccess('Produit ajouté avec succès !');
            setFormData({ nom: '', description: '', prix: null, qte_stock: 0, localisation: '', etat: null, uploaded_images: [], categorie: null });
            setUploadCompleted(false);
            onClose();
        } catch (error) {
            showError('Erreur lors de l\'ajout du produit');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: message, life: 3000 });
    };

    const showError = (message) => {
        toast.current?.show({ severity: 'error', summary: 'Erreur', detail: message, life: 3000 });
    };

    // Fonction pour vérifier si le formulaire est valide
    const isFormValid = () => {
        if (step === 0) {
            return formData.nom && formData.description;
        } else if (step === 1) {
            return formData.prix !== null && formData.qte_stock !== null && formData.localisation;
        } else if (step === 2) {
            return formData.etat && formData.categorie;
        }
        return true; // Si à l'étape 3, on peut aller au submit
    };

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="ca-cree-anonce">
            <Toast ref={toast} />
            <form onSubmit={handleSubmit} className="ca-form-wrapper">
                {step === 0 && (
                    <>
                        <div className="ca-form-group">
                            <label htmlFor="nom">Nom du produit</label>
                            <InputText id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
                        </div>
                        <div className="ca-form-group">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} required />
                        </div>
                    </>
                )}
                {step === 1 && (
                    <>
                        <div className="ca-form-group">
                            <label htmlFor="prix">Prix</label>
                            <InputNumber id="prix" name="prix" value={formData.prix} onValueChange={(e) => setFormData(prev => ({ ...prev, prix: e.value }))} mode="currency" currency="XOF" required />
                        </div>
                        <div className="ca-form-group">
                            <label htmlFor="qte_stock">Quantité stock</label>
                            <InputNumber
                                id="qte_stock"
                                name="qte_stock"
                                value={formData.qte_stock}
                                onValueChange={(e) => setFormData((prev) => ({ ...prev, qte_stock: e.value }))}
                                mode="decimal"
                                min={0}
                                required
                            />
                        </div>
                        <div className="ca-form-group">
                            <label htmlFor="localisation">Localisation</label>
                            <InputText id="localisation" name="localisation" value={formData.localisation} onChange={handleChange} required />
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <div className="ca-form-group">
                            <label htmlFor="etat">Etat</label>
                            <Dropdown id="etat" name="etat" value={formData.etat} options={etatsOptions} onChange={(e) => setFormData(prev => ({ ...prev, etat: e.value }))} optionLabel="label" optionValue="value" placeholder="Sélectionner un état" required />
                        </div>
                        <div className="ca-form-group">
                            <label htmlFor="categorie">Catégorie</label>
                            <Dropdown id="categorie" name="categorie" value={formData.categorie} options={categoriesOptions} onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.value }))} optionLabel="nom" optionValue="id" placeholder="Sélectionner une catégorie" required />
                        </div>
                    </>
                )}
                {step === 3 && (
                    <div className="ca-form-group">
                        <label htmlFor="uploaded_images">Images</label>
                        <FileUpload 
                            name="uploaded_images"
                            multiple
                            accept="image/*"
                            maxFileSize={1000000}
                            onSelect={handleImageChange}
                            emptyTemplate={<p className="m-0">Glissez et déposez les images ici pour les télécharger.</p>}
                            chooseLabel="Choisir des fichiers"
                            uploadLabel="Télécharger"
                            cancelLabel="Annuler"
                            required
                        />
                        {formData.uploaded_images.length > 0 && (
                            <div className="ca-image-preview">
                                {Array.from(formData.uploaded_images).map((file, index) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt={file.name} className="ca-preview-image" />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="ca-form-buttons">
                    {step > 0 && <Button type="button" label="Précédent" onClick={prevStep} className="ca-p-button-secondary" />}
                    {step < 3 ? (
                        <Button type="button" label="Suivant" onClick={nextStep} disabled={!isFormValid()} />
                    ) : (
                        <Button type="submit" label="Ajouter le produit" disabled={!uploadCompleted || loading} className="ca-p-button-success" />
                    )}
                </div>
                {loading && <ProgressSpinner style={{ width: '50px', height: '50px' }} />}
            </form>
        </div>
    );
};

export default AddProduct;
