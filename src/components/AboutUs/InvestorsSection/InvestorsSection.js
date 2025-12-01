import React from 'react';
import './InvestorsSection.css';

// Investor logos as SVG placeholders (representing the actual logos)
const PlugAndPlayLogo = () => (
  <div className="investor-logo investor-logo--plugandplay">
    <svg viewBox="0 0 303 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="40" fill="#fafafa" fontSize="32" fontWeight="700" fontFamily="DM Sans, sans-serif">
        PLUG<tspan fontWeight="400">AND</tspan>PLAY
      </text>
    </svg>
  </div>
);

const EngineeringCapitalLogo = () => (
  <div className="investor-logo investor-logo--engineering">
    <svg viewBox="0 0 236 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="60" y="50" fill="#fafafa" fontSize="20" fontWeight="500" fontFamily="DM Sans, sans-serif">Engineering</text>
      <text x="60" y="75" fill="#fafafa" fontSize="20" fontWeight="500" fontFamily="DM Sans, sans-serif">Capital</text>
      <rect x="0" y="20" width="40" height="60" rx="4" stroke="#fafafa" strokeWidth="2" fill="none"/>
      <line x1="10" y1="35" x2="30" y2="35" stroke="#fafafa" strokeWidth="2"/>
      <line x1="10" y1="50" x2="30" y2="50" stroke="#fafafa" strokeWidth="2"/>
      <line x1="10" y1="65" x2="30" y2="65" stroke="#fafafa" strokeWidth="2"/>
    </svg>
  </div>
);

const FirsthandVCLogo = () => (
  <div className="investor-logo investor-logo--firsthand">
    <svg viewBox="0 0 327 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="24" fill="#fafafa" fontSize="28" fontWeight="400" fontFamily="DM Sans, sans-serif">
        FIRSTHAND<tspan fontWeight="700">→VC</tspan>
      </text>
    </svg>
  </div>
);

const InvestorsSection = () => {
  return (
    <section className="investors">
      <div className="investors__content">
        {/* Header */}
        <div className="investors__header">
          <span className="investors__tag">Our Investors</span>
          <h2 className="investors__title">Backed by the very best</h2>
        </div>

        {/* Logos */}
        <div className="investors__logos">
          <div className="investors__logo-container">
            <PlugAndPlayLogo />
          </div>
          <div className="investors__logo-container">
            <EngineeringCapitalLogo />
          </div>
          <div className="investors__logo-container">
            <FirsthandVCLogo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestorsSection;

