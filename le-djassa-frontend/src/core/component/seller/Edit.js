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

const EditProduct = ({ isVisible, onClose, product }) => {
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix: null,
        etat: null,
        uploaded_images: [],
        localisation: '',
        categorie: null,
        est_vendu: false
    });

    const [etatsOptions, setEtatsOptions] = useState([]);
    const [categoriesOptions, setCategoriesOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        const fetchEtats = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/produit/etats/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setEtatsOptions(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des états:', error);
            }
        };

        fetchEtats();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/produit/categories/',);
                setCategoriesOptions(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                nom: product.produits,
                description: product.description || '',
                prix: product.prix,
                etat: product.etat || null,
                uploaded_images: [],
                localisation: product.localisation || '',
                categorie: product.categorie || null,
                est_vendu: product.est_vendu
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            uploaded_images: e.files
        }));
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
                data.append(key, formData[key].id);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.put(`http://localhost:8000/api/produit/${product.id}/`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            showSuccess('Produit modifié avec succès !');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la modification du produit:', error.response ? error.response.data : error.message);
            showError('Erreur lors de la modification du produit');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        toast.current?.show({severity:'success', summary: 'Succès', detail: message, life: 3000});
    };

    const showError = (message) => {
        toast.current?.show({severity:'error', summary: 'Erreur', detail: message, life: 3000});
    };

    return (
        isVisible && (
            <div className="edit-product-overlay">
                <div className="edit-product-container">
                    <Toast ref={toast} />
                    {loading && <ProgressSpinner />}
                    <h2>Modifier le Produit</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nom">Nom</label>
                            <InputText 
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <InputTextarea 
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="prix">Prix</label>
                            <InputNumber 
                                id="prix"
                                name="prix"
                                value={formData.prix}
                                onValueChange={(e) => handleChange({ target: { name: 'prix', value: e.value } })}
                                mode="currency"
                                currency="XOF"
                                locale="XOF"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="etat">État</label>
                            <Dropdown
                                id="etat"
                                name="etat"
                                value={formData.etat}
                                options={etatsOptions}
                                onChange={(e) => handleChange({ target: { name: 'etat', value: e.value } })}
                                optionLabel="label"
                                placeholder="Sélectionner un état"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="localisation">Localisation</label>
                            <InputText 
                                id="localisation"
                                name="localisation"
                                value={formData.localisation}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="uploaded_images">Images</label>
                            <FileUpload 
                                id="uploaded_images"
                                name="uploaded_images"
                                multiple
                                accept="image/*"
                                maxFileSize={1000000}
                                onSelect={handleImageChange}
                                emptyTemplate={<p className="m-0">Glissez et déposez les images ici pour les télécharger.</p>}
                                chooseLabel="Choisir des fichiers"
                                uploadLabel="Télécharger"
                                cancelLabel="Annuler"
                                chooseOptions={{
                                    className: 'choose-button', // Classe personnalisée pour le bouton "Choisir des fichiers"
                                }}
                                uploadOptions={{
                                    className: 'upload-button', // Classe personnalisée pour le bouton "Télécharger"
                                }}
                                cancelOptions={{
                                    className: 'cancel-button', // Classe personnalisée pour le bouton "Annuler"
                                }}
                            />
                        </div>

                        <div className="form-group">
                            {loading ? (
                                <ProgressSpinner /> // Affichage du loader si loading est true
                            ) : (
                                <Button 
                                    label="Ajouter le produit" 
                                    type="submit" 
                                    className="p-button-success" 
                                    icon="pi pi-check"
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <Button type="button" label="Annuler" icon="pi pi-times" onClick={onClose} className="p-button-secondary" />
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default EditProduct;
