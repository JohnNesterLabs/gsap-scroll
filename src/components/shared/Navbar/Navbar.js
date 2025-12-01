import React from 'react';
import Button from '../Button/Button';
import ArrowIcon from '../ArrowIcon/ArrowIcon';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__logo">
          {/* Kahuna Logo */}
          <svg width="28" height="31" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="navbar__logo-icon">
            <path d="M14 0L28 8V23L14 31L0 23V8L14 0Z" fill="url(#logoGradient)"/>
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="28" y2="31" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0632f9"/>
                <stop offset="1" stopColor="#00a3ff"/>
              </linearGradient>
            </defs>
          </svg>
          <svg width="120" height="15" viewBox="0 0 120 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="navbar__logo-text">
            <text x="0" y="12" fill="#fafafa" fontSize="14" fontWeight="500" fontFamily="DM Sans, sans-serif">Kahuna Labs</text>
          </svg>
        </div>
        
        <Button variant="primary" showArrow arrowPosition="right">
          Let's Talk
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

