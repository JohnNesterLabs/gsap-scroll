import React from 'react';
import VideoIcon from '../VideoIcon/VideoIcon';
import './WebPSequence.css';

const WebPSequence = ({ 
  webpSequenceContainerRef, 
  frameImageRef, 
  isVisible, 
  shouldShowIcon, 
  onIconClick 
}) => {
  return (
    <div 
      className={`webp-sequence-container ${isVisible ? 'visible' : ''}`} 
      ref={webpSequenceContainerRef}
    >
      <img 
        ref={frameImageRef}
        id="frameImage" 
        className="webp-sequence-frame" 
        alt="Frame" 
      />
      
      {/* Clickable Icon at Pause Frames */}
      {shouldShowIcon && <VideoIcon onClick={onIconClick} />}
    </div>
  );
};

export default WebPSequence;

