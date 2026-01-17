// ChatBox.js
import React, { useState } from 'react';
import '../../../app_main/style/user_undefined/ChatBox.css'; // Assurez-vous que ce chemin est correct

const ChatBox = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', sender: 'other', time: '20:25' },
        { text: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua', sender: 'user', time: '20:26' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { text: newMessage, sender: 'user', time: new Date().toLocaleTimeString() }]);
            setNewMessage('');
        }
    };

    return (
        <div className="chatbox-overlay">
            <div className="chatbox-container">
                <div className="contacts-section">
                    <div className="profile-header">
                        <img src="profile-image-url" alt="Profile" />
                        <h2>Asiya Javayant</h2>
                    </div>
                    <input type="text" placeholder="Search" className="search-bar" />
                    <div className="contacts-list">
                        {/* Ajoutez ici la liste des contacts */}
                    </div>
                </div>

                <div className="chat-section">
                    <div className="chat-header">
                        <img src="contact-image-url" alt="Contact" />
                        <div className="contact-info">
                            <h3>Ioni Bowcher</h3>
                            <p>Last active 1 hour ago</p>
                        </div>
                        <div className="chat-actions">
                            <button onClick={onClose} className='close-chat' aria-label='Fermer la discussion'>X</button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                <p>{msg.text}</p>
                                <span>{msg.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
