import React, { useState } from 'react';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState([]);

  const content = [
    "Bienvenue dans nos Conditions Générales d'Utilisation. En utilisant notre site, vous acceptez les conditions décrites ici.",
    "L'accès au site est soumis à l'acceptation des présentes conditions.",
    "Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
    "Toute utilisation frauduleuse de notre service entraînera des sanctions.",
    "Nous nous réservons le droit de modifier ces conditions à tout moment.",
    "En cas de désaccord, veuillez cesser immédiatement d'utiliser nos services.",
    "Pour toute question, veuillez contacter notre service client.",
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
    <div className="terms-container">
      <h1>Conditions Générales</h1>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Rechercher dans les conditions générales..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
          aria-label="Barre de recherche dans les conditions générales"
        />
      </div>
      <div className="terms-content">
        {(filteredContent.length > 0 ? filteredContent : content).map(
          (paragraph, index) => (
            <p key={index}>{highlightTerm(paragraph, searchTerm)}</p>
          )
        )}
      </div>
    </div>
  );
};

export default TermsAndConditions;
