import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ isInitialized = true }) => {
  const [headerVisible, setHeaderVisible] = useState(true);

  // Handle header visibility based on scroll or other conditions
  // For now, we'll keep it simple and always visible when initialized
  useEffect(() => {
    if (isInitialized) {
      setHeaderVisible(true);
    }
  }, [isInitialized]);

  const handleLetsTalkClick = () => {
    console.log("Let's Talk button clicked!");
    // Add your contact/navigation logic here
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <div className={`demo-header ${headerVisible ? "visible" : "hidden"}`}>
      {/* Left Logo */}
      <div className="demo-header-left">
        <img
          src="/kahuna-logo-3.svg"
          alt="Kahuna Logo"
          className="demo-header-logo"
        />
      </div>

      {/* Right Let's Talk Button */}
      <a
        href="mailto:info@kahunalabs.ai"
        onClick={handleLetsTalkClick}
        className="demo-header-button"
      >
        Let's Talk
      </a>
    </div>
  );
};

export default Header;
