import React from 'react';
import { Dialog } from 'primereact/dialog'; // Importation du composant Dialog
import 'primereact/resources/themes/saga-blue/theme.css'; // Importation du thème PrimeReact
import 'primereact/resources/primereact.min.css'; // Importation des styles de PrimeReact
import 'primeicons/primeicons.css'; // Importation des icônes de PrimeReact

const Modal = ({ isOpen, onClose, children }) => {
    return (
        <Dialog
            visible={isOpen}
            onHide={onClose}
            style={{ width: '90vw', maxWidth: '10000px' }} // Ajustez la largeur selon vos besoins
            header="Détails du produit" // Titre du modal
            modal
            onCloseClick={onClose}
            className="custom-dialog" // Classe personnalisée pour le style
        >
            {children}
        </Dialog>
    );
};

export default Modal;
