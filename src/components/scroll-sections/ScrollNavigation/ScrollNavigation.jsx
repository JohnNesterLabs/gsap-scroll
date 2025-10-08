import React, { useState } from 'react';
import HalfScroll from '../HalfScroll';
import FullScroll from '../FullScroll';
import VideoScroll from '../VideoScroll';
import VideoDirectionScroll from '../VideoDirectionScroll';
import TestScroll from '../TestScroll';
import HeroScroll from '../HeroScroll';
import './ScrollNavigation.css';

const ScrollNavigation = () => {
  const [scrollType, setScrollType] = useState('hero'); // 'half', 'full', 'video', 'videoDirection', 'test', or 'hero'

  const handleScrollTypeChange = (type) => {
    setScrollType(type);
  };

  return (
    <div className="scroll-navigation">
      {/* Simple Navigation Header */}
      <div className="navigation-header">
        <div className="scroll-type-selector">
          {/* <button 
            className={`nav-button ${scrollType === 'half' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('half')}
          >
            <span className="button-icon">🔄</span>
            <span className="button-text">
              <strong>Half Scroll</strong>
              <small>Scroll twice per section</small>
            </span>
          </button> */}

          {/* <button 
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
          
          <button 
            className={`nav-button ${scrollType === 'videoDirection' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('videoDirection')}
          >
            <span className="button-icon">🎬</span>
            <span className="button-text">
              <strong>Direction Scroll</strong>
              <small>Video direction moves</small>
            </span>
          </button>
          
          <button 
            className={`nav-button ${scrollType === 'test' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('test')}
          >
            <span className="button-icon">🧪</span>
            <span className="button-text">
              <strong>Test Scroll</strong>
              <small>Testing component</small>
            </span>
          </button> */}

          {/* <button 
            className={`nav-button ${scrollType === 'hero' ? 'active' : ''}`}
            onClick={() => handleScrollTypeChange('hero')}
          >
            <span className="button-icon">🎯</span>
            <span className="button-text">
              <strong>Hero Scroll</strong>
              <small>Text + Video hero</small>
            </span>
          </button> */}
        </div>
      </div>

      {/* Scroll Components */}
      <div className="scroll-content">
        {scrollType === 'half' && <HalfScroll />}
        {scrollType === 'full' && <FullScroll />}
        {scrollType === 'video' && <VideoScroll />}
        {scrollType === 'videoDirection' && <VideoDirectionScroll />}
        {scrollType === 'test' && <TestScroll />}
        {scrollType === 'hero' && <HeroScroll />}
      </div>
    </div>
  );
};

export default ScrollNavigation;
