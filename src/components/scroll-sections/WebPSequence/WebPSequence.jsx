import React, { useState, useEffect, useRef } from 'react';
import './WebPSequence.css';

const WebPSequence = ({
  startSection = 4, // Configurable start section (4 or 5)
  totalFrames = 300, // Adjust based on converted WebP frames
  framePrefix = 'mobile_frame_',
  frameSuffix = '.webp',
  folderPath = '/frames-mobile/', // New folder for mobile WebP frames
  activeSection,
  sectionProgress,
  // Scroll stop functionality
  stopFrame = 200, // Frame to stop at (equivalent to frame 234 in desktop)
  timelineDuration = 5000, // 5 seconds in milliseconds
  timelinePosition = { top: '50%', left: '50%' }, // Customizable timeline position
  playButtonPosition = { top: '60%', left: '50%' }, // Customizable play button position
  onTimelineComplete, // Callback when timeline completes
  onPlayButtonClick, // Callback when play button is clicked
  // Video popup props
  videoSrc = '/Final-Ticket-1-(WIP).mp4', // Default video source for popup
  showVideoPopup = true, // Whether to show video popup on continue
  isVideoPreloaded = false, // Whether the video has been preloaded
  videoPreloadProgress = 0, // Video preload progress percentage
  // Frame mapping function for custom frame repetition
  getSourceFrameNumber = null // Optional function to map current frame to source frame
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [allowSmoothScrolling, setAllowSmoothScrolling] = useState(false);
  const imgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPreventionHandlerRef = useRef(null);

  // Debug logging for all state changes
  useEffect(() => {
    console.log('📱 WEBP SEQUENCE STATE CHANGE:', {
      currentFrame,
      stopFrame,
      hasWatchedVideo,
      allowSmoothScrolling,
      showPlayButton,
      isScrollStopped,
      showTimeline,
      isVisible,
      activeSection,
      sectionProgress
    });
  }, [currentFrame, stopFrame, hasWatchedVideo, allowSmoothScrolling, showPlayButton, isScrollStopped, showTimeline, isVisible, activeSection, sectionProgress]);

  // Optimized frame calculation with throttling and performance improvements
  useEffect(() => {
    // Use requestAnimationFrame to throttle frame updates for smooth performance
    const updateFrame = () => {
      if (activeSection >= startSection) {
        // Calculate frame based on section progress
        const sectionOffset = activeSection - startSection;
        const progressInSection = sectionProgress;
        // Total progress across all sections from start section
        const totalProgress = sectionOffset + progressInSection;
        // Map progress to frame range (0 to totalFrames-1)
        const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
        let clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
        
        // Hide WebP sequence after completing all frames
        if (clampedFrame >= totalFrames) {
          setIsVisible(false);
          // Reset all WebP sequence states when completed
          setIsScrollStopped(false);
          setShowTimeline(false);
          setShowPlayButton(false);
          setTimelineProgress(0);
          resumeScroll();
          return;
        } else {
          setIsVisible(true);
        }

        // Handle scroll stop logic
        if (clampedFrame >= stopFrame && !isScrollStopped && !allowSmoothScrolling) {
          clampedFrame = stopFrame;
          setIsScrollStopped(true);
          setShowTimeline(true);
          stopForwardScroll();
        } else if (isScrollStopped && !allowSmoothScrolling) {
          if (clampedFrame < stopFrame) {
            setIsScrollStopped(false);
            setShowTimeline(false);
            if (!allowSmoothScrolling) {
              setShowPlayButton(false);
            }
            setTimelineProgress(0);
            resumeScroll();
          } else {
            clampedFrame = stopFrame;
          }
        }
        
        setCurrentFrame(clampedFrame);
      } else {
        // User scrolled back to before start section - hide WebP sequence
        setIsVisible(false);
        setCurrentFrame(1);
        setIsScrollStopped(false);
        setShowTimeline(false);
        if (!allowSmoothScrolling) {
          setShowPlayButton(false);
        }
        setTimelineProgress(0);
        resumeScroll();
      }
    };

    requestAnimationFrame(updateFrame);
  }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, isScrollStopped, allowSmoothScrolling, hasWatchedVideo, showPlayButton]);

  // Handle showing Continue CTA again when user reaches stop frame after watching video once
  useEffect(() => {
    console.log('📱 WebP Play button useEffect triggered:', {
      allowSmoothScrolling,
      hasWatchedVideo,
      currentFrame,
      stopFrame,
      showPlayButton,
      isVisible
    });
    // Only manage play button visibility when component is visible and smooth scrolling is enabled and video has been watched
    if (isVisible && allowSmoothScrolling && hasWatchedVideo) {
      if (currentFrame === stopFrame) {
        // User has reached stop frame again after watching video - show Continue CTA for rewatching
        console.log('📱 User reached stop frame again - showing Continue CTA for video rewatching');
        setShowPlayButton(true);
      } else if (currentFrame !== stopFrame) {
        // Hide Continue CTA when not at stop frame during smooth scrolling
        console.log('📱 User not at stop frame - hiding Continue CTA');
        setShowPlayButton(false);
      }
    } else {
      console.log('📱 Conditions not met for play button management:', {
        isVisible,
        allowSmoothScrolling,
        hasWatchedVideo
      });
    }
  }, [currentFrame, stopFrame, allowSmoothScrolling, hasWatchedVideo, isVisible, showPlayButton]);

  // Force play button to show when at stop frame after video watched
  useEffect(() => {
    if (allowSmoothScrolling && hasWatchedVideo && currentFrame === stopFrame && isVisible) {
      console.log('📱 FORCE SHOWING PLAY BUTTON - All conditions met!');
      setShowPlayButton(true);
    }
  }, [currentFrame, allowSmoothScrolling, hasWatchedVideo, stopFrame, isVisible]);

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

  // Calculate if play button should be shown
  const shouldShowPlayButton = () => {
    // Primary condition: user has watched video and is at stop frame
    const primaryCondition = allowSmoothScrolling && hasWatchedVideo && currentFrame === stopFrame && isVisible;
    // Secondary condition: play button state is already true
    const secondaryCondition = showPlayButton;
    const result = primaryCondition || secondaryCondition;
    console.log('📱 shouldShowPlayButton calculation:', {
      showPlayButton,
      allowSmoothScrolling,
      hasWatchedVideo,
      currentFrame,
      stopFrame,
      isVisible,
      primaryCondition,
      secondaryCondition,
      result
    });

    // If we should show but state is false, force update
    if (result && !showPlayButton) {
      console.log('📱 shouldShowPlayButton: Forcing showPlayButton to true');
      setShowPlayButton(true);
    }
    return result;
  };

  // Simple check for Continue CTA visibility - always show at stop frame after video watched
  const isContinueCTAVisible = () => {
    const visible = hasWatchedVideo && allowSmoothScrolling && currentFrame === stopFrame && isVisible;
    console.log('📱 Continue CTA Visibility Check:', {
      hasWatchedVideo,
      allowSmoothScrolling,
      currentFrame,
      stopFrame,
      isVisible,
      visible
    });
    return visible;
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
    if (showVideoPopup && videoSrc) {
      // Check if video is preloaded before showing popup
      if (isVideoPreloaded) {
        console.log('📱 Video is preloaded - showing popup immediately');
        setShowVideoModal(true);
      } else {
        console.log('📱 Video not yet preloaded - showing popup anyway (will load on demand)');
        setShowVideoModal(true);
      }
    } else {
      // Resume scroll immediately if no video popup
      resumeScroll();
    }
    if (onPlayButtonClick) {
      onPlayButtonClick();
    }
  };

  // Handle video popup close
  const handleVideoModalClose = () => {
    console.log('📱 WebP Video modal close button clicked - closing video popup');
    setShowVideoModal(false);
    // Mark that user has watched the video once
    setHasWatchedVideo(true);
    setAllowSmoothScrolling(true);
    // Small delay to ensure state update before resuming scroll
    setTimeout(() => {
      resumeScroll(); // Resume scroll after closing video
      console.log('📱 Scroll resumed after video close - smooth scrolling enabled');
      // Check if we're at stop frame and show play button if so
      if (currentFrame === stopFrame) {
        console.log('📱 At stop frame after video close - showing play button');
        setShowPlayButton(true);
      }
    }, 100);
  };

  // Handle image loading errors
  const handleImageError = () => {
    console.warn(`📱 Failed to load WebP frame ${currentFrame}`);
  };

  // Handle image load success
  const handleImageLoad = () => {
    // Image loaded successfully
  };

  if (!isVisible) {
    return null;
  }

  // Use custom frame mapping if provided, otherwise use current frame directly
  const sourceFrameNumber = getSourceFrameNumber ? getSourceFrameNumber(currentFrame) : currentFrame;
  const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(sourceFrameNumber)}${frameSuffix}`;
  
  // Use preloaded image if available, otherwise fall back to src
  const preloadedImg = window.preloadedImages && window.preloadedImages.get(imageSrc);
  
  return (
    <div className="webp-sequence-container">
      <img
        ref={imgRef}
        src={preloadedImg ? preloadedImg.src : imageSrc}
        alt={`Mobile WebP Frame ${currentFrame}`}
        className="webp-sequence-frame"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          // Optimize rendering for preloaded images
          willChange: preloadedImg ? 'auto' : 'transform',
        }}
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
            {/* <div className="timeline-text">
              {Math.ceil((1 - timelineProgress) * (timelineDuration / 1000))}s
            </div> */}
          </div>
        </div>
      )}

{(shouldShowPlayButton() || isContinueCTAVisible()) && (
        <div
          className="text-overlay-bottom-mobile"
          style={{
            position: 'absolute',
            zIndex: 20
          }}
        >
          <button
            className="play-button"
            onClick={handlePlayButtonClick}
            aria-label="Continue scrolling"
          >
           Click To Enter Ticket No. 1535
          </button>
        </div>
      )}
      
      {/* Play Button Overlay */}
      {(shouldShowPlayButton() || isContinueCTAVisible()) && (
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
                className="play-circle-icon"
                viewBox="0 0 47 47"
                width="47"
                height="47"
                fill="none"
              >
                <circle
                  cx="23.5"
                  cy="23.5"
                  r="23"
                  fill="white"
                  stroke="none"
                />
                <path
                  d="M18 14l14 9.5L18 33V14z"
                  fill="black"
                />
              </svg>
          </button>
        </div>
      )}

      {/* Troubleshooting Map Text Overlay - Visible from frame 4 to frame 50 */}
      {currentFrame >= 4 && currentFrame <= 100 && (
        <div className="troubleshooting-text-overlay">
          <div className="troubleshooting-text">
            AI that automatically builds and nurtures your Troubleshooting Map
          </div>
        </div>
      )}
      
      {/* Video Modal Popup */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={handleVideoModalClose}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="video-modal-close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 Close button clicked - calling handleVideoModalClose');
                handleVideoModalClose();
              }}
              aria-label="Close video"
              type="button"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1002,
                pointerEvents: 'auto'
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <video
              className="video-modal-video"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      
      {/* Debug info - remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="webp-sequence-debug">
          <div>📱 WebP Sequence</div>
          <div>Section: {activeSection}</div>
          <div>Progress: {(sectionProgress * 100).toFixed(1)}%</div>
          <div>Frame: {currentFrame}/{totalFrames}</div>
          <div>Start Section: {startSection}</div>
          <div>Stop Frame: {stopFrame}</div>
          <div>Scroll Stopped: {isScrollStopped ? 'Yes' : 'No'}</div>
          <div>Show Timeline: {showTimeline ? 'Yes' : 'No'}</div>
          <div style={{ color: showPlayButton ? 'green' : 'red', fontWeight: 'bold' }}>
            Show Play Button: {showPlayButton ? 'Yes' : 'No'}
          </div>
          <div style={{ color: hasWatchedVideo ? 'green' : 'red' }}>
            Has Watched Video: {hasWatchedVideo ? 'Yes' : 'No'}
          </div>
          <div style={{ color: allowSmoothScrolling ? 'green' : 'red' }}>
            Allow Smooth Scrolling: {allowSmoothScrolling ? 'Yes' : 'No'}
          </div>
          <div style={{ color: isVisible ? 'green' : 'red' }}>
            Is Visible: {isVisible ? 'Yes' : 'No'}
          </div>
          <div style={{ color: shouldShowPlayButton() ? 'green' : 'red', fontWeight: 'bold', fontSize: '14px' }}>
            SHOULD SHOW: {shouldShowPlayButton() ? 'YES' : 'NO'}
          </div>
          <div style={{ color: isContinueCTAVisible() ? 'green' : 'red', fontWeight: 'bold', fontSize: '14px' }}>
            CTA VISIBLE: {isContinueCTAVisible() ? 'YES' : 'NO'}
          </div>
          <div style={{ color: isVideoPreloaded ? 'green' : 'orange', fontWeight: 'bold', fontSize: '14px' }}>
            VIDEO PRELOADED: {isVideoPreloaded ? 'YES' : 'NO'}
          </div>
          <div style={{ color: 'cyan', fontSize: '12px' }}>
            Video Progress: {videoPreloadProgress.toFixed(1)}%
          </div>
        </div>
      )} */}
    </div>
  );
};

export default WebPSequence;
