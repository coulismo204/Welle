import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import '../../../app_main/style/user_undefined/UserInfo.css';

const UserInfo = () => {
    const [ip, setIp] = useState('');

    useEffect(() => {
        fetchIp();
    }, []);

    const fetchIp = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            setIp(data.ip);
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    };

    return (
        <div className="user-info">
            <FontAwesomeIcon icon={faUser} className="user-icon" />
            <p>{ip}</p>
        </div>
    );
};

export default UserInfo;
