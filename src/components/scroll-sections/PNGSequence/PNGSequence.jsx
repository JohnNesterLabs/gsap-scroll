import React, { useState, useEffect, useRef } from 'react';
import './PNGSequence.css';

const PNGSequence = ({ 
  startSection = 4, // Configurable start section (4 or 5)
  totalFrames = 328,
  framePrefix = 'frame_',
  frameSuffix = '.png',
  folderPath = '/frames-journey/',
  activeSection,
  sectionProgress
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  // Calculate frame index based on section progress
  useEffect(() => {
    if (activeSection >= startSection) {
      setIsVisible(true);
      
      // Calculate frame based on section progress
      const sectionOffset = activeSection - startSection;
      const progressInSection = sectionProgress;
      
      // Total progress across all sections from start section
      const totalProgress = sectionOffset + progressInSection;
      
      // Map progress to frame range (0 to totalFrames-1)
      const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
      const clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      
      setCurrentFrame(clampedFrame);
    } else {
      setIsVisible(false);
      setCurrentFrame(1);
    }
  }, [activeSection, sectionProgress, startSection, totalFrames]);

  // Format frame number with leading zeros
  const formatFrameNumber = (frameNum) => {
    return frameNum.toString().padStart(4, '0');
  };

  // Handle image loading errors
  const handleImageError = () => {
    console.warn(`Failed to load frame ${currentFrame}`);
  };

  // Handle image load success
  const handleImageLoad = () => {
    // Image loaded successfully
  };

  if (!isVisible) {
    return null;
  }

  const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(currentFrame)}${frameSuffix}`;

  return (
    <div className="png-sequence-container">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={`Journey Frame ${currentFrame}`}
        className="png-sequence-frame"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="png-sequence-debug">
          <div>Section: {activeSection}</div>
          <div>Progress: {(sectionProgress * 100).toFixed(1)}%</div>
          <div>Frame: {currentFrame}/{totalFrames}</div>
          <div>Start Section: {startSection}</div>
        </div>
      )}
    </div>
  );
};

export default PNGSequence;
