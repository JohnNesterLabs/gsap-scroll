import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      {/* Gradient Background */}
      <div className="hero__background" />
      
      {/* Content */}
      <div className="hero__content">
        <span className="hero__tag">Who we are</span>
        
        <div className="hero__text">
          <h1 className="hero__title">
            <span>We're innovators of AI</span>
            <span>for Frontline Productivity</span>
          </h1>
          
          <div className="hero__body">
            <p className="hero__paragraph">
              <em className="hero__highlight">Kahuna </em>
              <span>is a Hawaiian word that refers to an expert, with a wider connotation of being wise, smart and knowledgeable - like a respected village elderly.</span>
            </p>
            
            <p className="hero__paragraph">
              <em className="hero__highlight">Labs</em>
              <span> expresses the sentiment of constant innovation.</span>
            </p>
            
            <p className="hero__paragraph hero__paragraph--standalone">
              We do not expect to ever get out of Lab mode.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

