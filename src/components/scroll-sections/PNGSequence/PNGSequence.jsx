import React, { useState, useEffect, useRef } from 'react';
import './PNGSequence.css';

const PNGSequence = ({ 
  startSection = 4, // Configurable start section (4 or 5)
  totalFrames = 328,
  framePrefix = 'frame_',
  frameSuffix = '.png',
  folderPath = '/frames-journey/',
  activeSection,
  sectionProgress,
  // New props for scroll stop functionality
  stopFrame = 234, // Frame to stop at (frame_0234.png)
  timelineDuration = 5000, // 5 seconds in milliseconds
  timelinePosition = { top: '50%', left: '50%' }, // Customizable timeline position
  playButtonPosition = { top: '60%', left: '50%' }, // Customizable play button position
  onTimelineComplete, // Callback when timeline completes
  onPlayButtonClick // Callback when play button is clicked
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const imgRef = useRef(null);
  const timelineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPreventionHandlerRef = useRef(null);

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
      // const clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      let clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Frame calculation:', {
          totalProgress: totalProgress.toFixed(3),
          frameIndex,
          clampedFrame,
          stopFrame,
          isScrollStopped
        });
      }
      // Handle scroll stop logic
      if (clampedFrame >= stopFrame && !isScrollStopped) {
        // First time reaching the stop frame - stop here
        clampedFrame = stopFrame;
        setIsScrollStopped(true);
        setShowTimeline(true);
        console.log('Stopping at frame:', stopFrame, 'Original calculated frame:', frameIndex + 1);
        stopForwardScroll();
      } else if (isScrollStopped) {
        // We're in scroll stopped state
        if (clampedFrame < stopFrame) {
          // User scrolled back below the stop frame - reset everything
          console.log('User scrolled back below stop frame, resetting scroll stop');
          setIsScrollStopped(false);
          setShowTimeline(false);
          setShowPlayButton(false);
          setTimelineProgress(0);
          resumeScroll();
          // Allow normal frame progression (user is scrolling back)
        } else {
          // User is at or past the stop frame - keep it at stop frame
          clampedFrame = stopFrame;
        }
      }
      
      setCurrentFrame(clampedFrame);
    } else {
      setIsVisible(false);
      setCurrentFrame(1);
      setIsScrollStopped(false);
      setShowTimeline(false);
      setShowPlayButton(false);
      setTimelineProgress(0);
      // Clean up scroll prevention when component is not visible
      resumeScroll();
    }
  }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, isScrollStopped]);
  // Cleanup scroll prevention on unmount
  useEffect(() => {
    return () => {
      resumeScroll();
    };
  }, []);

  // Format frame number with leading zeros
  const formatFrameNumber = (frameNum) => {
    return frameNum.toString().padStart(4, '0');
  };

  // Stop forward scroll functionality (but allow backward scrolling)
  const stopForwardScroll = () => {
    const scrollContainer = document.querySelector('.demo-scroll-container');
    if (scrollContainer) {
      scrollContainerRef.current = scrollContainer;
      // Store the current scroll position as the maximum allowed
      const currentScrollTop = scrollContainer.scrollTop;
      scrollContainer.dataset.maxScrollTop = currentScrollTop;
      // Create scroll prevention handler
      const handleScrollPrevention = (e) => {
        if (scrollContainer.scrollTop > currentScrollTop) {
          e.preventDefault();
          scrollContainer.scrollTop = currentScrollTop;
        }
      };
      // Store the handler reference for cleanup
      scrollPreventionHandlerRef.current = handleScrollPrevention;
      // Add scroll event listener to prevent forward scrolling
      scrollContainer.addEventListener('scroll', handleScrollPrevention, { passive: false });
      scrollContainer.dataset.scrollHandler = 'true';
    }
  };
  // Resume scroll functionality
  const resumeScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && scrollPreventionHandlerRef.current) {
      // Remove the scroll prevention
      delete scrollContainer.dataset.maxScrollTop;
      delete scrollContainer.dataset.scrollHandler;
      // Remove the scroll prevention event listener
      scrollContainer.removeEventListener('scroll', scrollPreventionHandlerRef.current);
      scrollPreventionHandlerRef.current = null;
    }
  };
  // Timeline management
  useEffect(() => {
    if (showTimeline && !showPlayButton) {
      const startTime = Date.now();
      const timelineInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / timelineDuration, 1);
        setTimelineProgress(progress);
        if (progress >= 1) {
          clearInterval(timelineInterval);
          setShowTimeline(false);
          setShowPlayButton(true);
          if (onTimelineComplete) {
            onTimelineComplete();
          }
        }
      }, 16); // ~60fps updates
      return () => clearInterval(timelineInterval);
    }
  }, [showTimeline, showPlayButton, timelineDuration, onTimelineComplete]);
  // Handle play button click
  const handlePlayButtonClick = () => {
    setShowPlayButton(false);
    resumeScroll();
    if (onPlayButtonClick) {
      onPlayButtonClick();
    }
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

      {/* Timeline Overlay */}
      {showTimeline && (
        <div
          className="timeline-overlay"
          style={{
            position: 'absolute',
            top: timelinePosition.top,
            left: timelinePosition.left,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}
        >
          <div className="timeline-container">
            <div className="timeline-track">
              <div
                className="timeline-progress"
                style={{ width: `${timelineProgress * 100}%` }}
              />
            </div>
            <div className="timeline-text">
              {Math.ceil((1 - timelineProgress) * (timelineDuration / 1000))}s
            </div>
          </div>
        </div>
      )}
      {/* Play Button Overlay */}
      {showPlayButton && (
        <div
          className="play-button-overlay"
          style={{
            position: 'absolute',
            top: playButtonPosition.top,
            left: playButtonPosition.left,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}
        >
          <button
            className="play-button"
            onClick={handlePlayButtonClick}
            aria-label="Continue scrolling"
          >
            <svg
              className="play-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="play-text">Continue</span>
          </button>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="png-sequence-debug">
          <div>Section: {activeSection}</div>
          <div>Progress: {(sectionProgress * 100).toFixed(1)}%</div>
          <div>Frame: {currentFrame}/{totalFrames}</div>
          <div>Start Section: {startSection}</div>
          <div>Stop Frame: {stopFrame}</div>
          <div>Start Section: {startSection}</div>
          <div>Scroll Stopped: {isScrollStopped ? 'Yes' : 'No'}</div>
          <div>Show Timeline: {showTimeline ? 'Yes' : 'No'}</div>
          <div>Show Play Button: {showPlayButton ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default PNGSequence;
