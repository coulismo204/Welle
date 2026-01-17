import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import { PhoneOutlined, WhatsAppOutlined, EuroOutlined, EnvironmentOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import config from '../../../core/store/config';
import defaultImage from './le_djassa.jpg';
import '../../../app_main/style/customer/productdetail.css';
import { CartContext } from '../../common/CartContext';
import { UserContext } from '../../common/UserContext';
import { motion } from 'framer-motion';
import Login from '../authenticate/Login';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);  // Gestion de la quantité
    const { addToCart } = useContext(CartContext);  // Contexte du panier
    const { isLoggedIn } = useContext(UserContext); // Contexte de l'utilisateur pour vérifier l'authentification
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLogin, setShowLogin] = useState(false); // État pour le Dialog de connexion
    const toast = React.useRef(null);
    const [rating, setRating] = useState(0);  // État pour la note sélectionnée

    useEffect(() => {
        fetch(`${config.API_BASE_URL}/api/produit/${productId}/`)
            .then(response => response.json())
            .then(data => {
                setProduct(data);
            })
            .catch(error => console.error('Error fetching product details:', error));
    }, [productId]);

    const getImageUrl = (imageUrl) => imageUrl?.startsWith('http') ? imageUrl : defaultImage;

    const imageTemplate = (item) => {
        return <img src={getImageUrl(item.image)} alt={product.nom} className="product-image" />;
    };

    const incrementQuantity = () => {
        if (quantity < product.qte_stock) {
            setQuantity(prev => prev + 1);
        } else {
            toast.current.show({ 
                severity: 'info', 
                summary: 'Stock Limité', 
                detail: `Vous avez atteint la quantité maximale disponible (${product.qte_stock}).`, 
                life: 3000 
            });
        }
    };
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.nom,
            price: product.prix,
            image: product.images[0]?.image  
        }, quantity, );

        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);

        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Produit ajouté au panier !', life: 3000 });
    };

const handleBuyNow = () => {
    if (isLoggedIn) {
        // Naviguer vers la page de confirmation avec le nom, la quantité et le prix du produit
        navigate('/Confirmation', { 
            state: { 
                items: [{
                    id: product.id,
                    name: product.nom,  // Nom du produit
                    quantity,          // Quantité sélectionnée
                    price: product.prix // Prix du produit
                }], 
                total: product.prix * quantity  // Calcul du total
            } 
        });
    } else {
        // Afficher la boîte de dialogue de connexion si l'utilisateur n'est pas connecté
        setShowLogin(true);
    }
};


    const handleCloseLogin = () => {
        setShowLogin(false);
    };


    const handleRating = (index) => {
        setRating(index);  // Met à jour la note sélectionnée
    };

    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i}
                    onClick={() => handleRating(i)}  // Au clic, met à jour la note
                    style={{ cursor: 'pointer', fontSize: '2rem', color: i <= rating ? 'gold' : 'gray' }}
                >
                    ★
                </span>
            );
        }

        return stars;
    };


    if (!product) {
        return <ProgressBar mode="indeterminate" style={{ height: '6px' }} />;
    }

    return (
        <div className="product-detail-container">
            <Toast ref={toast} />

            {showLogin && <Login onClose={handleCloseLogin} />}

            <header className="product-detail-header">
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    label="Retour" 
                    onClick={() => window.history.back()} 
                    className="p-button-secondary return-button" 
                />
                <h1>{product.nom}</h1>
            </header>

            <div className="product-detail-content">
                <div className="product-images">
                    <Carousel value={product.images} numVisible={1} className="custom-carousel" circular itemTemplate={imageTemplate} />
                </div>
                <div className="product-info">
                    <div className="product-meta">
                            <div className="rating-stars">
                                {renderStars()}  {/* Affiche les étoiles cliquables */}
                            </div>
                            <span className="product-reviews">{product.reviews} Avis</span>
                            <span className="product-sold">{product.sold} vendus</span>
                        </div>
                    <div className="price-section">
                        <EuroOutlined className="price-icon" />
                        <span className="price-value">{product.prix.toLocaleString('fr-FR')} FCFA</span>
                        {product.discount && (
                            <Tag value={`-${product.discount}%`} severity="danger" className="discount-tag" />
                        )}
                    </div>

                    <div className="product-options">
                        <span className="option-title">Quantité:</span>
                        <div className="quantity-control">
                            <Button 
                                icon="pi pi-minus" 
                                onClick={decrementQuantity} 
                                className="p-button-secondary quantity-button" 
                                style={{ cursor: quantity === 1 ? 'not-allowed' : 'pointer' }} 
                                disabled={quantity === 1}
                            />
                            <span className="quantity-value">{quantity}</span>
                            <Button 
                                icon="pi pi-plus" 
                                onClick={incrementQuantity} 
                                className="p-button-secondary quantity-button"
                                disabled={quantity >= product.stock}
                            />
                        </div>
                    </div>

                    <div className="action-buttons">
                        <motion.div
                            onClick={handleAddToCart}
                            animate={isAnimating ? { scale: 1.2, y: -20 } : { scale: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Button 
                                label="Ajouter au Panier" 
                                icon={<ShoppingCartOutlined />} 
                                className="p-button-warning" 
                            />
                        </motion.div>
                        <Button 
                            label="Acheter Maintenant" 
                            className="p-button-success" 
                            onClick={handleBuyNow} 
                        />
                    </div>

                    <div className="location-section">
                        <EnvironmentOutlined className="location-icon" />
                        <span>{product.localisation}</span>
                    </div>

                    <div className="contact-section">
                        <Button 
                            icon={<WhatsAppOutlined />} 
                            onClick={() => window.open(`https://wa.me/${product.vendeur?.numero_telephone.replace(/\s+/g, '')}`, '_blank')} 
                            label="WhatsApp" 
                            className="p-button-success" 
                        />
                        <Button 
                            icon={<PhoneOutlined />} 
                            onClick={() => window.location.href = `tel:${product.vendeur?.numero_telephone}`} 
                            label={product.vendeur?.numero_telephone} 
                            className="p-button-info" 
                        />
                    </div>      
            </div>

            </div>
                 {/* Section de la description du produit */}
                <div className="product-description">
                        <h2>Description</h2>
                        <p>{product.description}</p>
                </div>

        </div>
    );
};

export default ProductDetail;
