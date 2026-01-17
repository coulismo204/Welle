import React, { useState, useRef } from 'react';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import MyAccount from './MyAccount';

const MainComponent = () => {
    const [isMyAccountVisible, setMyAccountVisible] = useState(false);
    const [isSpeedDialVisible, setSpeedDialVisible] = useState(false);
    const toast = useRef(null);

    const handleAvatarClick = () => {
        setSpeedDialVisible(!isSpeedDialVisible);
    };

    const handleUpdateProfile = () => {
        setMyAccountVisible(true);
        setSpeedDialVisible(false);
        toast.current.show({ severity: 'info', summary: 'Modifier le profil', detail: 'Ouverture du profil' });
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
        <div>
            <div style={{ position: 'relative', height: '500px' }}>
                <Toast ref={toast} />
                <Button 
                    icon="pi pi-user" 
                    rounded 
                    outlined 
                    severity="info" 
                    aria-label="User" 
                    onClick={handleAvatarClick}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                />
                {isSpeedDialVisible && (
                    <SpeedDial 
                        model={items} 
                        direction="down" 
                        style={{ position: 'absolute', top: '60px', right: '10px' }} 
                    />
                )}
            </div>
            <MyAccount
                visible={isMyAccountVisible}
                onHide={() => setMyAccountVisible(false)}
                userId="1"
            />
        </div>
    );
};

export default MainComponent;