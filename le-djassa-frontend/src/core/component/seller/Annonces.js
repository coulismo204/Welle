import React, { useEffect, useState, useCallback } from 'react';
import { Modal, message, Input, Badge, Tooltip } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../../../app_main/style/seller/Annonces.css';
import config from '../../../core/store/config';

const { confirm } = Modal;

const Annonces = () => {
    // États
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fonction pour récupérer les données
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem('access');

        if (!accessToken) {
            setError("Token d'authentification non trouvé");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/produit/ownerproduct/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const rawData = await response.json();
            console.log("RAW DATA API:", rawData);

            const formattedData = rawData.map((item) => ({
                key: item.id,
                id: item.id,
                produits: item.nom,
                prix: formatPrice(item.prix),
                statuts: item.est_vendu || item.qte_stock === 0 ? 'Épuisé' : 'Disponible',
                description: item.description,
                localisation: item.localisation,
                etat: item.etat,
                categorie: item.categorie,
                est_vendu: item.est_vendu,
                qte_stock: item.qte_stock,
                date_creation: item.cree_le || '—',
            }));

            setData(formattedData);
        } catch (err) {
            setError(`Erreur lors de la récupération des données: ${err.message}`);
            message.error(`Erreur: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF'
        }).format(price);
    };

    const handleDelete = useCallback((key) => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            async onOk() {
                try {
                    const accessToken = localStorage.getItem('access');
                    const response = await fetch(`${config.API_BASE_URL}/api/produit/${key}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Erreur lors de la suppression');
                    }

                    setData(prevData => prevData.filter(item => item.key !== key));
                    message.success('Produit supprimé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    message.error('Erreur lors de la suppression du produit');
                }
            }
        });
    }, []);

    const filteredData = data.filter((item) =>
        item.produits.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="an-container">
            <div className="an-header">
                <h1 className="an-title">Mes Annonces</h1>
                <div className="an-search-bar">
                    <Input
                        className="an-search-input"
                        placeholder="Rechercher un produit"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        suffix={<InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                    />
                </div>
            </div>

            <div className="an-status-legend">
                <div className="an-legend-item">
                    <span className="an-status-dot available"></span>
                    <span>Disponible</span>
                </div>
                <div className="an-legend-item">
                    <span className="an-status-dot sold-out"></span>
                    <span>Épuisé</span>
                </div>
            </div>

            {loading ? (
                <div className="an-loading">
                    <div className="an-loading-spinner"></div>
                    <p>Chargement des annonces...</p>
                </div>
            ) : error ? (
                <div className="an-error">
                    <ExclamationCircleOutlined className="an-error-icon" />
                    <p>{error}</p>
                </div>
            ) : paginatedData.length > 0 ? (
                <div className="an-table-container">
                    <table className="an-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Produit</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item) => (
                                <tr
                                    key={item.key}
                                    className={item.qte_stock === 0 || item.est_vendu ? 'an-row-sold-out' : 'an-row-available'}
                                >
                                    <td data-label="ID">{item.id}</td>
                                    <td data-label="Produit">
                                        <Tooltip title={item.description}>
                                            <span className="an-product-name">{item.produits}</span>
                                        </Tooltip>
                                    </td>
                                    <td data-label="Prix">{item.prix}</td>
                                    <td data-label="Stock">
                                        <Badge
                                            count={item.qte_stock}
                                            style={{
                                                backgroundColor: item.qte_stock === 0 ? '#ff4d4f' : '#52c41a'
                                            }}
                                        />
                                    </td>
                                    <td data-label="Statut">
                                        <span className={`an-status ${item.qte_stock === 0 || item.est_vendu ? 'an-status-sold-out' : 'an-status-available'}`}>
                                            {item.statuts}
                                        </span>
                                    </td>
                                    <td data-label="Date">{item.date_creation}</td>
                                    <td data-label="Actions" className="an-actions">
                                        <Tooltip title="Supprimer">
                                            <DeleteOutlined
                                                className="an-delete-icon"
                                                onClick={() => handleDelete(item.key)}
                                            />
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="an-pagination">
                        <button
                            className="an-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Précédent
                        </button>
                        <span className="an-pagination-info">
                            Page {currentPage} sur {totalPages}
                        </span>
                        <button
                            className="an-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            ) : (
                <div className="an-empty-state">
                    <InfoCircleOutlined className="an-empty-icon" />
                    <h3>Aucune annonce trouvée</h3>
                    <p>Il n'y a actuellement aucune annonce disponible.</p>
                </div>
            )}
        </div>
    );
};

export default Annonces;
