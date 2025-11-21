import React from 'react';
import VideoIcon from '../VideoIcon/VideoIcon';
import './WebPSequence.css';

const WebPSequence = ({ 
  webpSequenceContainerRef, 
  frameImageRef, 
  isVisible, 
  shouldShowIcon, 
  onIconClick,
  currentFrame 
}) => {
  // Show text from frame 4 to 65
  const showText = currentFrame >= 4 && currentFrame <= 65;

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
      
      {/* Text overlay from frame 4 to 65 */}
      {showText && isVisible && (
        <div className="frame-text-overlay">
          AI that automatically builds and nurtures your Troubleshooting Map
        </div>
      )}
      
      {/* Clickable Icon at Pause Frames */}
      {shouldShowIcon && <VideoIcon onClick={onIconClick} />}
    </div>
  );
};

export default WebPSequence;

