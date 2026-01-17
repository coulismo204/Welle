import React, { useState, useEffect } from 'react';
import MenubarComponent from './MenubarComponent'; // Ajustez le chemin si nécessaire
import Commandes from '../../component/seller/Commandes'; // Ajustez le chemin si nécessaire
import axios from 'axios';
import config from '../../store/config';

const Dashboard = () => {
    const [badgeCount, setBadgeCount] = useState(0);

    useEffect(() => {
        fetchOrderCount();
    }, []);

    const fetchOrderCount = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/api/orders/commandes-vendeur/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            setBadgeCount(response.data.length); // Mettre à jour le badgeCount avec le nombre de commandes
        } catch (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
        }
    };

    return (
        <div>
            <MenubarComponent badgeCount={badgeCount} />
            <Commandes />
        </div>
    );
};

export default Dashboard;
