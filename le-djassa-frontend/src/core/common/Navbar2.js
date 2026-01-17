import React, { useEffect, useState, useCallback, useRef } from 'react';
import config from '../../core/store/config';
import { Card } from 'antd';
import { Toast } from 'primereact/toast';
import { CSSTransition } from 'react-transition-group';
import { Laptop, Tv, Home, Wrench, Cat, Smartphone, Shirt, MoreHorizontal } from 'lucide-react';
import '../../app_main/style/Navbar2.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-green/theme.css';

const categories = [
  { query: 'Smartphone', icon: Smartphone, label: 'Smartphones' },
  { query: 'pc-laptop', icon: Laptop, label: 'PC & Laptops' },
  { query: 'television', icon: Tv, label: 'Televisions' },
  { query: 'electro-menagers', icon: Home, label: 'Home Appliances' },
  { query: 'pieces-detachees', icon: Wrench, label: 'Spare Parts' },
  { query: 'animaux', icon: Cat, label: 'Pets' },
  { query: 'electronique-gadgets', icon: Smartphone, label: 'Electronics' },
  { query: 'vetements-bijoux', icon: Shirt, label: 'Clothing & Jewelry' },
  { query: 'autres', icon: MoreHorizontal, label: 'Others' },
];

const Navbar2 = () => {
  const [categoryImages, setCategoryImages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const toast = useRef(null);

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Erreur', detail: message });
  };

  const fetchCategoryImages = useCallback(() => {
    const fetchPromises = categories.map(category =>
      fetch(`${config.API_BASE_URL}/api/produit/?category=${category.query}`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0 && data[0].images && data[0].images.length > 0) {
            return { [category.label]: getImageUrl(data[0].images[0].image) };
          }
          return null;
        })
        .catch(error => {
          console.error(`Error fetching image for ${category.label}:`, error);
          showError(`Erreur lors de la récupération des images pour ${category.label}`);
          return null;
        })
    );

    Promise.all(fetchPromises)
      .then(results => {
        const newImages = results.reduce((acc, result) => {
          if (result) {
            return { ...acc, ...result };
          }
          return acc;
        }, {});
        setCategoryImages(newImages);
      });
  }, []);

  useEffect(() => {
    fetchCategoryImages();
  }, [fetchCategoryImages]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-image.jpg';
    return imageUrl.startsWith('http') ? imageUrl : `${config.API_BASE_URL}${imageUrl}`;
  };

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    fetch(`${config.API_BASE_URL}/api/produit/?category=${category.query}`)
      .then(response => response.json())
      .then(data => {
        setCategoryItems(data);
      })
      .catch(error => {
        console.error(`Error fetching items for ${category.label}:`, error);
        showError(`Erreur lors de la récupération des articles pour ${category.label}`);
        setCategoryItems([]);
      });
  }, []);

  return (
    <div>
      <Toast ref={toast} /> {/* Composant Toast pour afficher les notifications */}
      
      <div className="navbar2-card-container">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <div className="navbar2-col" key={index} onClick={() => handleCategoryClick(category)}>
              <Card
                className={`navbar2-card ${selectedCategory === category ? 'navbar2-card-selected' : ''}`}
                cover={
                  <div className="navbar2-card-image-container">
                    <img
                      alt={category.label}
                      src={categoryImages[category.label] || '/placeholder-image.jpg'}
                      className="navbar2-card-image"
                    />
                    <div className="navbar2-card-overlay" />
                    <div className="navbar2-card-content">
                      <div className="navbar2-icon-container">
                        <IconComponent size={24} color="#28a745" />
                      </div>
                      <h3 className="navbar2-card-title">{category.label}</h3>
                    </div>
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
      
      {selectedCategory && (
        <div className="navbar2-category-items">
          <h2>{selectedCategory.label}</h2>
          <div className="navbar2-items-grid">
            {categoryItems.map((item, index) => (
              <CSSTransition key={index} timeout={300} classNames="fade">
                <div className="navbar2-item-card">
                  <img 
                    src={item.images && item.images.length > 0 ? getImageUrl(item.images[0].image) : '/placeholder-image.jpg'} 
                    alt={item.name} 
                    className="navbar2-item-image" 
                  />
                  <h3>{item.name}</h3>
                  <p>{item.price} €</p>
                </div>
              </CSSTransition>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar2;
