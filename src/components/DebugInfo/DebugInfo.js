import React from 'react';
import './DebugInfo.css';

const DebugInfo = ({ 
  activeSection, 
  currentFrame, 
  isAutoPlaying, 
  playDirection, 
  isPaused, 
  isVisible, 
  isMobile, 
  totalFrames 
}) => {
  return (
    <div className="debug-info" id="debugInfo">
      <div>Active Section: <span>{activeSection}</span></div>
      <div>Current Frame: <span>{currentFrame}</span></div>
      <div>Is Auto Playing: <span>{isAutoPlaying ? 'true' : 'false'}</span></div>
      <div>Play Direction: <span>{playDirection}</span></div>
      <div>Is Paused: <span>{isPaused ? 'true' : 'false'}</span></div>
      <div>Is Visible: <span>{isVisible ? 'true' : 'false'}</span></div>
      <div>Device: <span>{isMobile ? 'Mobile' : 'Desktop'}</span></div>
      <div>Total Frames: <span>{totalFrames}</span></div>
    </div>
  );
};

export default DebugInfo;

