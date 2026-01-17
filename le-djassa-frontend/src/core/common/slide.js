
import React from 'react';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../../app_main/style/slide.css';

// Importer l'image
import Slide1 from '../../logo/footer.jpeg';

const Slider = () => {
    return (
        <div className="slider-container">
            <img src={Slide1} alt="Image" className="slider-image" />
        </div>
    );
};

export default Slider;