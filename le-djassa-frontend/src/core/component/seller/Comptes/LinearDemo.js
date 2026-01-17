import React, { useRef } from 'react';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';

export default function LinearDemo() {
    const toast = useRef(null);

    const handleUpdateProfile = () => {
        toast.current.show({ severity: 'info', summary: 'Modifier le profil', detail: 'Profil mis à jour' });
        // Ajoutez la logique pour modifier le profil
    };

    const handleDeleteAccount = () => {
        toast.current.show({ severity: 'error', summary: 'Supprimer le compte', detail: 'Compte supprimé' });
        // Ajoutez la logique pour supprimer le compte
    };

    const items = [
        {
            label: 'Modifier mon profil',
            icon: 'pi pi-pencil',
            command: handleUpdateProfile
        },
        {
            label: 'Supprimer mon compte',
            icon: 'pi pi-times',
            command: handleDeleteAccount
        }
    ];

    return (
        <div className="card">
            <div style={{ position: 'relative', height: '500px' }}>
                <Toast ref={toast} />
                <SpeedDial model={items} direction="up" style={{ left: 'calc(50% - 2rem)', bottom: 0 }} />
            </div>
        </div>
    );
}