import React, { useContext, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import '../../app_main/style/Footer.css';

import LogoGM3 from '../../logo/LogoGM3.png';

const Footer = () => {
  const [avis, setAvis] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [askEmail, setAskEmail] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);

  const handleNavigate = (path) => navigate(path);

  const handleBeginSeller = () => handleNavigate(isAuthenticated ? '/uservendeur-interface' : '/login');
  const handleBecomeSeller = () => handleNavigate(isAuthenticated ? '/uservendeur-interface' : '/signup');

  const showServiceUnavailable = () => {
    toast.current?.show({
      severity: 'warn',
      summary: 'Service Indisponible',
      detail: 'Cette fonctionnalité sera bientôt disponible',
      life: 3000,
      className: 'custom-toast',
      contentClassName: 'custom-toast-content',
      style: {
        background: '#FFF3CD',
        border: '1px solid #FFE69C',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      contentStyle: {
        color: '#856404',
        fontWeight: '500'
      }
    });
  };

  const handleAvisSubmit = (e) => {
    e.preventDefault();

    // Vérifie si une adresse e-mail est disponible
    const email = userEmail || (window.navigator && window.navigator.credentials && window.navigator.credentials.email);

    if (!email) {
      // Si aucune adresse e-mail n'est disponible, demander l'adresse
      setAskEmail(true);
      toast.current?.show({
        severity: 'info',
        summary: 'Adresse email requise',
        detail: 'Veuillez fournir une adresse email pour envoyer votre suggestion.',
        life: 3000,
      });
    } else {
      // Ouvrir la boîte mail avec le contenu
      const mailtoLink = `mailto:contact@ledjassa.com?subject=Suggestion de l'utilisateur&body=${encodeURIComponent(
        avis
      )}&from=${encodeURIComponent(email)}`;
      window.location.href = mailtoLink;

      setAvis('');
      toast.current?.show({
        severity: 'success',
        summary: 'Merci',
        detail: 'Votre suggestion a été envoyée avec succès !',
        life: 3000,
      });
    }
  };

  return (
    <footer className="ft-footer">
      <Toast ref={toast} />
      <div className="ft-container mx-auto">
        <h3>CONTACTEZ-NOUS PAR</h3>
        <div className="ft-social-icons">
        <SocialIcon
  icon="pi pi-phone"
  url="tel:+2250545942656"
  label="Téléphone"
  colorClass="mobile"
/>
<SocialIcon
  icon="pi pi-whatsapp"
  url="https://wa.me/+2250545942656"
  label="WhatsApp"
  colorClass="whatsapp"
/>
<SocialIcon
  icon="pi pi-facebook"
  url="https://facebook.com/votre-page"
  label="Facebook"
  colorClass="facebook"
/>
<SocialIcon
  icon="pi pi-envelope"
  url="mailto:contact@ledjassa.com"
  label="Email"
  colorClass="email"
/>
        </div>

        <h3>Faites-vous entendre en envoyant vos avis et suggestions</h3>
        <form className="ft-avis-form" onSubmit={handleAvisSubmit}>
          {askEmail && (
            <input
              type="email"
              placeholder="Votre adresse email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="ft-avis-email-input"
            />
          )}
          <input
            type="text"
            placeholder="Envoyez-nous vos avis"
            value={avis}
            onChange={(e) => setAvis(e.target.value)}
            required
            className="ft-avis-input"
          />
          <button type="submit" className="ft-avis-button">Envoyer</button>
        </form>
        <div className="ft-links">
          <div>
            <h4>ESPACE VENDEUR</h4>
            <ul>
              <li className="ft-clickable" onClick={handleBecomeSeller}>Devenir vendeur</li>
              <li className="ft-clickable" onClick={handleBeginSeller}>Commencer à vendre</li>
              <li className="ft-clickable" onClick={showServiceUnavailable}>Djassa Livraisons</li>
            </ul>
          </div>
          <div>
            <h4>AIDE & SUPPORT</h4>
            <ul>
              <li className="ft-clickable" onClick={showServiceUnavailable}>Centre d'aide vendeurs</li>
              <li><a href="/terms-and-conditions">Conditions générales</a></li>
              <li><a href="/privacy-policy">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4>INFORMATIONS</h4>
            <ul>
              <li className="ft-clickable" onClick={showServiceUnavailable}>Livraisons et retours</li>
              <li className="ft-clickable" onClick={showServiceUnavailable}>Paiement sécurisé</li>
              <li className="ft-clickable" onClick={showServiceUnavailable}>Règles pour les vendeurs</li>
            </ul>
          </div>
          <div>
            <h4>LOGO</h4>
            <img src={LogoGM3} alt="Logo GM" className="ft-logo" />
          </div>
        </div>

        <div className="ft-copyright">
          <p>Le djassa ©{new Date().getFullYear()} Créé par Le djassa</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, url, label, colorClass, onClick }) => {
  if (url) {
    return (
      <div className="ft-social-icon-container">
        <a href={url} target="_blank" rel="noopener noreferrer" className={`ft-social-icon ${colorClass}`} aria-label={label}>
          <i className={icon}></i>
        </a>
        <span className="ft-social-label">{label}</span>
      </div>
    );
  }
  
  return (
    <div className="ft-social-icon-container">
      <div onClick={onClick} className={`ft-social-icon ${colorClass} ft-clickable`} aria-label={label}>
        <i className={icon}></i>
      </div>
      <span className="ft-social-label">{label}</span>
    </div>
  );
};

export default Footer;