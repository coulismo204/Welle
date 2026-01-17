import React, { useState } from 'react';
import { Layout, Spin } from 'antd';
import NavbarVendeur from '../../core/component/seller/NavbarVendeur';
import Creeanonce from '../../core/component/seller/Creeanonce';
import Annonces from '../../core/component/seller/Annonces';
import Commandes from '../../core/component/seller/Commandes';
import TraficVente from '../../core/component/seller/TraficVente';
import Profil from '../../core/component/seller/Comptes/Profil';
import '../../app_main/style/seller/Seller_home.css';

const { Header, Content } = Layout;

const Vendeur = () => {
  const [selectedMenu, setSelectedMenu] = useState('MES ANNONCES');
  const [loading, setLoading] = useState(false);
  const [annonceToModify, setAnnonceToModify] = useState(null);

  const handleMenuSelect = (menuLabel) => {
    setLoading(true); 
    setSelectedMenu(menuLabel);

    setTimeout(() => {
      setLoading(false); 
    }, 500);
  };

  const handleModifyAnnonce = (annonceId) => {
    setAnnonceToModify(annonceId);
    handleMenuSelect('NOUVELLE ANNONCE');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      );
    }

    switch (selectedMenu) {
      case 'MES ANNONCES':
        return <Annonces isVisible={selectedMenu === 'MES ANNONCES'} onModify={handleModifyAnnonce} />;
      case 'COMMANDES':
        return <Commandes />;
      case 'NOUVELLE ANNONCE':
        return (
          <Creeanonce
            isVisible={selectedMenu === 'NOUVELLE ANNONCE'}
            onClose={() => handleMenuSelect('MES ANNONCES')}
            annonceId={annonceToModify}
          />
        );
      case 'TRAFIC DE VENTE':
        return <TraficVente />;

      case 'PROFIL':
        return <Profil />;

      default:
        return <div>Sélectionnez une option dans le menu</div>;
    }
  };

  return (
    <Layout className="layout">
      <Header className="header-vendeur">
        <NavbarVendeur 
          selectedMenu={selectedMenu} 
          onSelectMenu={handleMenuSelect} 
        />
      </Header>
      
      <Layout>
        <Content className="content">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Vendeur;