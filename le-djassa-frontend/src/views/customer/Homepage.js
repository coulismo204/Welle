import React, { useEffect, useState, useCallback } from 'react';
import '../../app_main/style/customer/HomePage.css';
import { useNavigate } from 'react-router-dom';
import config from '../../core/store/config';
import { Card } from 'antd';
import { Paginator } from 'primereact/paginator';

const HomePage = ({ searchQuery, formData, setFormData }) => {
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows] = useState(12);
    const navigate = useNavigate();

    const fetchProducts = useCallback(() => {
        const selectedCategories = formData.categorie || [];

        fetch(`${config.API_BASE_URL}/api/produit/?categories=${selectedCategories.join(',')}`)
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                setTotalProducts(data.length);
            })
            .catch(error => console.error('Erreur lors de la récupération des produits:', error));
    }, [formData.categorie]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${config.API_BASE_URL}${imageUrl}`;
    };

    const formatNumber = (number) => {
        if (isNaN(number)) return 'N/A';
        return parseFloat(number).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' Fr';
    };

    const handleViewDetailsClick = (product) => {
        navigate(`/product/${product.id}`);
    };

    const filteredProducts = products.filter((product) => {
        const searchQuery = formData.query || '';
        return product.nom.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    return (
        <div className="hp-container">
            <div className="hp-products-container">
                <div className="hp-products-grid">
                    {filteredProducts.slice(first, first + rows).map((product) => (
                        <Card
                            key={product.id}
                            className="hp-product-card"
                            onClick={() => handleViewDetailsClick(product)}
                            cover={
                                <img
                                    alt={product.nom}
                                    src={getImageUrl(product.images[0]?.image)}
                                    className='hp-product-image'
                                />
                            }
                        >
                            <div className="hp-product-info">
                                <h3 className="hp-product-title">{product.nom}</h3>
                                <p className="hp-product-price">{formatNumber(product.prix)}</p>
                                <span className={`hp-product-status ${product.etat}`}>
                                    {product.etat}
                                </span>
                            </div>
                        </Card>
                    ))}
                    {filteredProducts.length === 0 && 
                        <p>Aucun produit trouvé pour la recherche : "{searchQuery}"</p>
                    }
                </div>
            </div>
            {totalProducts > 0 && (
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalProducts}
                    onPageChange={onPageChange}
                    className="hp-paginator"
                />
            )}
        </div>
    );
};

export default HomePage;