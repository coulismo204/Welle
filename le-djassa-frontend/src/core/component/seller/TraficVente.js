import React, { useEffect, useState } from 'react';
import { MeterGroup } from 'primereact/metergroup';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { PrimeIcons } from 'primereact/api';
import '../../../app_main/style/seller/TraficVente.css';
import config from '../../../core/store/config';

export default function TraficVente() {
    const [stats, setStats] = useState({
        published_count: 0,
        sold_count: 0,
        total_sales: 0,
        total_revenue: 0
    });
    const [products, setProducts] = useState({
        published: [],
        sold: []
    });
    const [showDialog, setShowDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState([]);

    useEffect(() => {
        fetch(`${config.API_BASE_URL}/api/produit/statistics/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setStats({
                published_count: data.published_count,
                sold_count: data.sold_count,
                total_sales: data.total_sales,
                total_revenue: data.total_revenue
            });
            setProducts({
                published: data.published_products,
                sold: data.sold_products
            });
        })
        .catch(error => console.error('Error fetching statistics:', error));
    }, []);

    const showProducts = (type) => {
        setDialogContent(products[type]);
        setShowDialog(true);
    };

    const meter = (props, attr) => (
        <span
            {...attr}
            key={props.index}
            style={{
                background: `linear-gradient(to right, ${props.color1}, ${props.color2})`,
                width: props.percentage + '%',
                height: '8px',
                display: 'block'
            }}
        />
    );

    const labelList = ({ values }) => (
        <div className="storage-cards">
            {values.map((item, index) => (
                <Card className="storage-card" key={index}>
                    <div className="card-content" onClick={() => showProducts(item.type)}>
                        <div className="flex-column-gap">
                            <span className="text-secondary font-bold text-sm">{item.label}</span>
                            <span className="font-bold text-lg">{item.value}</span>
                        </div>
                        <span
                            className="icon-container"
                            style={{ backgroundColor: item.color1 }}
                        >
                            <i className={item.icon} />
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );

    const values = [ 
        { label: 'PRODUITS PUBLIES', color1: '#34d399', color2: '#fbbf24', value: stats.published_count, icon: PrimeIcons.CART_PLUS, type: 'published' },
        { label: 'PRODUITS VENDUS', color1: '#fbbf24', color2: '#60a5fa', value: stats.sold_count, icon: PrimeIcons.CART_MINUS, type: 'sold' },
        { label: 'TOTAL DES VENTES', color1: '#60a5fa', color2: '#c084fc', value: stats.total_sales, icon: PrimeIcons.WALLET },
        { label: 'MES REVENUS', color1: '#c084fc', color2: '#c084fc', value: stats.total_revenue, icon: PrimeIcons.MONEY_BILL }
    ];

    const start = () => (
        <div className="storage-bar">
            {values.map((item, index) => (
                <div
                    key={index}
                    className={`storage-segment storage-segment-${index + 1}`}
                    style={{
                        width: `${item.value}%`,
                        background: `linear-gradient(to right, ${item.color1}, ${item.color2})`
                    }}
                />
            ))}
        </div>
    );

    const end = (
        <div className="storage-buttons">
            <Button label="Gérer l'inventaire" outlined size="small" className="storage-button" />
            <Button label="Mettre à jour l'abonnement" size="small" className="storage-button update-button" />
        </div>
    );

    const renderDialogContent = () => (
        <ul>
            {dialogContent.map((product, index) => (
                <li key={index}>{product.name} - {product.status}</li> // Adjust fields as per your data
            ))}
        </ul>
    );

    return (
        <>
            <MeterGroup labelPosition="start" values={values} start={start} end={end} meter={meter} labelList={labelList} />

            <Dialog
                header="Liste des Produits"
                visible={showDialog}
                style={{ width: '50vw' }}
                onHide={() => setShowDialog(false)}
            >
                {renderDialogContent()}
            </Dialog>
        </>
    );
}
