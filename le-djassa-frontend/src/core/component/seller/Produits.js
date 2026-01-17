import React from 'react';
import { Layout, Table } from 'antd';
import { Menubar } from 'primereact/menubar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Import the theme for PrimeReact
import 'primereact/resources/primereact.min.css'; // Import PrimeReact core styles


const { Header, Content, Footer } = Layout;

// Définir les colonnes du tableau
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'PRODUITS',
    dataIndex: 'produits',
    key: 'produits',
  },
  {
    title: 'PRIX',
    dataIndex: 'prix',
    key: 'prix',
  },
  {
    title: 'STATUTS',
    dataIndex: 'statuts',
    key: 'statuts',
  },
  {
    title: 'ACTION',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href="#edit">Edit</a> | <a href="#delete">Delete</a>
      </span>
    ),
  },
];

// Exemple de données
const data = [
  {
    key: '1',
    id: '1',
    produits: 'Produit X',
    prix: '150',
    statuts: 'Disponible',
  },
  {
    key: '2',
    id: '2',
    produits: 'Produit Y',
    prix: '200',
    statuts: 'Épuisé',
  },
  // Ajoute d'autres données ici
];

const menubarItems = [
  { 
    label: 'ANNONCES',
    icon: 'pi pi-home'
  },
  {
    label: 'PRODUITS',
    icon: 'pi pi-home'
  },
  {
    label: 'COMMANDES',
    icon: 'pi pi-cart-plus'
  },
  {
    label: 'CREER UNE ANNONCE',
    icon: 'pi pi-plus-circle',
  },
  {
    label: 'CONTACTS',
    icon: 'pi pi-envelope'
  }
];

const App = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: 'white', // Tu peux personnaliser la couleur de fond ici
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch', // Assure-toi que les enfants s'étendent sur toute la largeur
          }}
        >
          <Menubar 
            model={menubarItems} 
            style={{ width: '100%',
                    background: '#D9D9D9',

            }} // Assure-toi que Menubar s'étend sur toute la largeur
          />
        </Header>
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false} // Désactiver la pagination si non nécessaire
            bordered
            style={{
              background: '#fff', // Tu peux personnaliser la couleur de fond ici
              borderRadius: '15px', // Assure-toi que borderRadius est défini ici
            }}
          />
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
