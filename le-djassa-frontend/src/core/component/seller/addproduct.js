import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../app_main/style/seller/AddProduct.css';

const AddProduct = ({ onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix: '',
        etat: '',
        localisation: '',
        categorie: '',
        uploaded_images: []
    });
    const [etatsOptions, setEtatsOptions] = useState([]);  // État des options disponibles
    const [categoriesOptions, setCategoriesOptions] = useState([]);

    useEffect(() => {
        // Fonction pour récupérer les états depuis l'API Django REST Framework
        const fetchEtats = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/produit/etats/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setEtatsOptions(response.data);
            } catch (error) {
                console.error('Error fetching etats:', error);
            }
        };

        fetchEtats();  // Appel de la fonction pour récupérer les états lors du chargement du composant
    }, []);


    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/produit/categories/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            setCategoriesOptions(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            uploaded_images: e.target.files
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'uploaded_images') {
                for (let i = 0; i < formData.uploaded_images.length; i++) {
                    data.append('uploaded_images', formData.uploaded_images[i]);
                }
            } else {
                data.append(key, formData[key]);
            }
        });

        fetch('http://localhost:8000/api/produit/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
            },
            body: data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok - ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Product added:', data);
            onClose();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    return (
        <div className="add-product-overlay">
            <div className="add-product-container">
                <button onClick={onClose} className="close-button">✖</button>
                <h2>Ajouter un nouveau produit</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom du produit" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
                    <input type="number" name="prix" value={formData.prix} onChange={handleChange} placeholder="Prix" required />
                    <select name="etat" value={formData.etat} onChange={handleChange} required>
                        <option value="">Sélectionner l'état</option>
                        {etatsOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <input type="text" name="localisation" value={formData.localisation} onChange={handleChange} placeholder="Localisation" required />
                    <select name="categorie" value={formData.categorie} onChange={handleChange} required>
                        <option value="">Sélectionner la catégorie</option>
                        {categoriesOptions.map((categorie, index) => (
                            <option key={index} value={categorie.id}>{categorie.nom}</option>
                        ))}
                    </select>
                    <input type="file" name="uploaded_images" onChange={handleImageChange} multiple required />
                    <button type="submit" className="submit-button">Ajouter le produit</button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
