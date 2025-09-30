import React, { useState } from 'react';
import HalfScroll from '../HalfScroll';
import FullScroll from '../FullScroll';
import VideoScroll from '../VideoScroll';
import './ScrollNavigation.css';

const ScrollNavigation = () => {
  const [scrollType, setScrollType] = useState('half'); // 'half', 'full', or 'video'

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
          
          <button 
            className={`nav-button ${scrollType === 'video' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('video')}
          >
            <span className="button-icon">🎥</span>
            <span className="button-text">
              <strong>Video Scroll</strong>
              <small>Video zoom animations</small>
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Components */}
      <div className="scroll-content">
        {scrollType === 'half' && <HalfScroll />}
        {scrollType === 'full' && <FullScroll />}
        {scrollType === 'video' && <VideoScroll />}
      </div>
    </div>
  );
};

export default ScrollNavigation;
