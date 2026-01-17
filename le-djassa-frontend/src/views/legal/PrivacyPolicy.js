import React, { useState } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState([]);

  const content = [
    'Bienvenue dans notre Politique de Confidentialité. Nous nous engageons à protéger vos données personnelles.',
    'Cette politique explique comment nous collectons, utilisons et protégeons vos informations.',
    'En utilisant notre service, vous acceptez les pratiques décrites dans cette politique.',
    'Nous collectons des informations telles que votre nom, votre adresse e-mail et vos préférences.',
    'Ces informations nous aident à améliorer nos services et à personnaliser votre expérience.',
    'Vos données ne seront jamais vendues à des tiers sans votre consentement explicite.',
    'Si vous avez des questions, n’hésitez pas à nous contacter via notre formulaire de contact.',
  ];

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const matches = content.filter((paragraph) =>
        paragraph.toLowerCase().includes(term)
      );
      setFilteredContent(matches);
    } else {
      setFilteredContent([]);
    }
  };

  const highlightTerm = (text, term) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="privacy-container">
      <h1>Politique de Confidentialité</h1>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Rechercher dans la politique..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
          aria-label="Barre de recherche dans la politique de confidentialité"
        />
      </div>
      <div className="policy-content">
        {(filteredContent.length > 0 ? filteredContent : content).map(
          (paragraph, index) => (
            <p key={index}>{highlightTerm(paragraph, searchTerm)}</p>
          )
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
