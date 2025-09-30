import React, { useState } from 'react';
import ScrollSnapSections from './ScrollSnapSections';
import FullScrollSections from './FullScrollSections';
import './ScrollNavigation.css';

const ScrollNavigation = () => {
  const [scrollType, setScrollType] = useState('half'); // 'half' or 'full'

  const handleScrollTypeChange = (type) => {
    setScrollType(type);
  };

  return (
    <div className="scroll-navigation">
      {/* Simple Navigation Header */}
      <div className="navigation-header">
        <div className="scroll-type-selector">
          <button 
            className={`nav-button ${scrollType === 'half' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('half')}
          >
            <span className="button-icon">🔄</span>
            <span className="button-text">
              <strong>Half Scroll</strong>
              <small>Scroll twice per section</small>
            </span>
          </button>
          
          <button 
            className={`nav-button ${scrollType === 'full' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('full')}
          >
            <span className="button-icon">⚡</span>
            <span className="button-text">
              <strong>Full Scroll</strong>
              <small>Scroll once per section</small>
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Components */}
      <div className="scroll-content">
        {scrollType === 'half' && <ScrollSnapSections />}
        {scrollType === 'full' && <FullScrollSections />}
      </div>
    </div>
  );
};

export default ScrollNavigation;
