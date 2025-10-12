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
  onPlayButtonClick, // Callback when play button is clicked
  // Video popup props
  videoSrc = '/Final-Ticket-1-(WIP).mp4', // Default video source for popup
  showVideoPopup = true, // Whether to show video popup on continue
  isVideoPreloaded = false, // Whether the video has been preloaded
  videoPreloadProgress = 0 // Video preload progress percentage
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false); // Track if user has watched video once
  const [allowSmoothScrolling, setAllowSmoothScrolling] = useState(false); // Allow smooth scrolling after video watched
  const [shouldReturnToStopFrame, setShouldReturnToStopFrame] = useState(false); // Track if we should return to stop frame after video cancel
  const imgRef = useRef(null);
  const [hasGoneBelowStopFrame, setHasGoneBelowStopFrame] = useState(false); // Track if user has scrolled below stop frame to reset behavior
  const scrollContainerRef = useRef(null);
  const scrollPreventionHandlerRef = useRef(null);
  // Debug logging for all state changes
  useEffect(() => {
    console.log(':magnifying_glass: STATE CHANGE:', {
      currentFrame,
      stopFrame,
      hasWatchedVideo,
      allowSmoothScrolling,
      shouldReturnToStopFrame,
      hasGoneBelowStopFrame,
      showPlayButton,
      isScrollStopped,
      showTimeline,
      isVisible,
      activeSection,
      sectionProgress
    });
  }, [currentFrame, stopFrame, hasWatchedVideo, allowSmoothScrolling, shouldReturnToStopFrame, hasGoneBelowStopFrame, showPlayButton, isScrollStopped, showTimeline, isVisible, activeSection, sectionProgress]);
  // Calculate frame index based on section progress
  useEffect(() => {
    // Skip frame calculation if we need to return to stop frame after video cancel
    if (shouldReturnToStopFrame) {
      console.log('Skipping frame calculation - should return to stop frame');
      // Ensure we stay at stop frame
      setCurrentFrame(stopFrame);
      return;
    }
    if (activeSection >= startSection) {
      // Calculate frame based on section progress
      const sectionOffset = activeSection - startSection;
      const progressInSection = sectionProgress;
      // Total progress across all sections from start section
      const totalProgress = sectionOffset + progressInSection;
      // Map progress to frame range (0 to totalFrames-1)
      const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
      // const clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      let clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      // Hide PNG sequence after completing all frames (frame 328)
      if (clampedFrame >= totalFrames) {
        console.log('PNG sequence completed all frames - hiding sequence and allowing footer to show');
        setIsVisible(false);
        // Reset all PNG sequence states when completed
        setIsScrollStopped(false);
        setShowTimeline(false);
        setShowPlayButton(false);
        setTimelineProgress(0);
        resumeScroll(); // Ensure scroll is not blocked
        return;
      } else {
        setIsVisible(true);
      }
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Frame calculation:', {
          totalProgress: totalProgress.toFixed(3),
          frameIndex,
          clampedFrame,
          stopFrame,
          isScrollStopped,
          allowSmoothScrolling,
          shouldReturnToStopFrame,
          hasWatchedVideo,
          showPlayButton: showPlayButton
        });
      }
      // Handle scroll stop logic
      if (clampedFrame >= stopFrame && !isScrollStopped && !allowSmoothScrolling) {
        // First time reaching the stop frame - stop here (only if video hasn't been watched)
        clampedFrame = stopFrame;
        setIsScrollStopped(true);
        setShowTimeline(true);
        console.log('Stopping at frame:', stopFrame, 'Original calculated frame:', frameIndex + 1);
        stopForwardScroll();
      } else if (isScrollStopped && !allowSmoothScrolling) {
        // We're in scroll stopped state (only if video hasn't been watched)
        if (clampedFrame < stopFrame) {
          // User scrolled back below the stop frame - reset everything
          console.log('User scrolled back below stop frame, resetting scroll stop');
          setIsScrollStopped(false);
          setShowTimeline(false);
          // Only reset play button if smooth scrolling is not enabled
          if (!allowSmoothScrolling) {
            setShowPlayButton(false);
          }
          setTimelineProgress(0);
          resumeScroll();
          // Allow normal frame progression (user is scrolling back)
        } else {
          // User is at or past the stop frame - keep it at stop frame
          clampedFrame = stopFrame;
        }
      }else if (allowSmoothScrolling) {
          // Check if user has gone below stop frame to reset behavior
          if (clampedFrame < stopFrame && hasWatchedVideo) {
            console.log('User scrolled below stop frame after watching video - resetting behavior');
            setHasGoneBelowStopFrame(true);
            // Reset video watched state to allow fresh experience
            setHasWatchedVideo(false);
            setAllowSmoothScrolling(false);
            setShowPlayButton(false);
            setShouldReturnToStopFrame(false);
          }
          // If user reaches stop frame again after going below it, restart the sequence
          if (clampedFrame >= stopFrame && hasGoneBelowStopFrame && !hasWatchedVideo) {
            console.log('User reached stop frame again after going below - restarting sequence');
            clampedFrame = stopFrame;
            setIsScrollStopped(true);
            setShowTimeline(true);
            setHasGoneBelowStopFrame(false); // Reset the flag
            stopForwardScroll();
          } else if (allowSmoothScrolling && !hasGoneBelowStopFrame) {
            // After video has been watched once, allow smooth scrolling through all frames
            // BUT: If user cancelled video, keep them at stop frame until they scroll forward
            if (shouldReturnToStopFrame && clampedFrame <= stopFrame) {
              // User cancelled video and is at or before stop frame - keep at stop frame
              clampedFrame = stopFrame;
              console.log('Video was cancelled - keeping at stop frame:', stopFrame);
            } else if (shouldReturnToStopFrame && clampedFrame > stopFrame) {
              // User cancelled video but scrolled forward - allow normal progression
              console.log('Video was cancelled but user scrolled forward - allowing progression to:', clampedFrame);
              setShouldReturnToStopFrame(false); // Clear the flag since user is moving forward
            } else {
              // Normal smooth scrolling
              console.log('Smooth scrolling enabled - allowing frame progression to:', clampedFrame);
            }
          }
        }
      setCurrentFrame(clampedFrame);
    } else {
      // User scrolled back to before start section - hide PNG sequence
      setIsVisible(false);
      setCurrentFrame(1);
      setIsScrollStopped(false);
      setShowTimeline(false);
      // Only reset play button if smooth scrolling is not enabled
      if (!allowSmoothScrolling) {
        setShowPlayButton(false);
      }
      setTimelineProgress(0);
      // Clean up scroll prevention when component is not visible
      resumeScroll();
    }
  }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, isScrollStopped, allowSmoothScrolling, hasWatchedVideo, showPlayButton, shouldReturnToStopFrame, hasGoneBelowStopFrame]);
  // Handle showing Continue CTA again when user reaches frame 234 after watching video once
  useEffect(() => {
    console.log(':dart: Play button useEffect triggered:', {
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
        // User has reached frame 234 again after watching video - show Continue CTA for rewatching
        console.log(':white_tick: User reached frame 234 again - showing Continue CTA for video rewatching');
        setShowPlayButton(true);
      } else if (currentFrame !== stopFrame) {
        // Hide Continue CTA when not at frame 234 during smooth scrolling
        console.log(':x: User not at frame 234 - hiding Continue CTA');
        setShowPlayButton(false);
      }
    } else {
      console.log(':warning: Conditions not met for play button management:', {
        isVisible,
        allowSmoothScrolling,
        hasWatchedVideo
      });
    }
  }, [currentFrame, stopFrame, allowSmoothScrolling, hasWatchedVideo, isVisible, showPlayButton]);
  // Force play button to show when at frame 234 after video watched
  useEffect(() => {
    if (allowSmoothScrolling && hasWatchedVideo && currentFrame === stopFrame && isVisible) {
      console.log(':rocket: FORCE SHOWING PLAY BUTTON - All conditions met!');
      setShowPlayButton(true);
    }
  }, [currentFrame, allowSmoothScrolling, hasWatchedVideo, stopFrame, isVisible]);
  // Cleanup scroll prevention on unmount
  useEffect(() => {
    return () => {
      resumeScroll();
    };
  }, []);
  // Handle clearing the return to stop frame flag when user scrolls forward
  useEffect(() => {
    if (shouldReturnToStopFrame && allowSmoothScrolling) {
      const handleScrollForward = () => {
        const scrollContainer = document.querySelector('.demo-scroll-container');
        if (scrollContainer) {
          const currentScrollTop = scrollContainer.scrollTop;
          const maxScrollTop = parseFloat(scrollContainer.dataset.maxScrollTop || '0');
          // If user has scrolled forward beyond the stop point, clear the flag
          if (currentScrollTop > maxScrollTop + 10) { // 10px threshold
            console.log('User scrolled forward - clearing shouldReturnToStopFrame flag');
            setShouldReturnToStopFrame(false);
          }
        }
      };
      const scrollContainer = document.querySelector('.demo-scroll-container');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScrollForward, { passive: true });
        return () => {
          scrollContainer.removeEventListener('scroll', handleScrollForward);
        };
      }
    }
  }, [shouldReturnToStopFrame, allowSmoothScrolling]);
  // Format frame number with leading zeros
  const formatFrameNumber = (frameNum) => {
    return frameNum.toString().padStart(4, '0');
  };
  // Calculate if play button should be shown
  const shouldShowPlayButton = () => {
    // Primary condition: user has watched video and is at frame 234
    const primaryCondition = allowSmoothScrolling && hasWatchedVideo && currentFrame === stopFrame && isVisible;
    // Secondary condition: play button state is already true
    const secondaryCondition = showPlayButton;
    const result = primaryCondition || secondaryCondition;
    console.log(':abacus: shouldShowPlayButton calculation:', {
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
      console.log(':arrows_anticlockwise: shouldShowPlayButton: Forcing showPlayButton to true');
      setShowPlayButton(true);
    }
    return result;
  };
  // Simple check for Continue CTA visibility - always show at frame 234 after video watched
  const isContinueCTAVisible = () => {
    const visible = hasWatchedVideo && allowSmoothScrolling && currentFrame === stopFrame && isVisible;
    console.log(':dart: Continue CTA Visibility Check:', {
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
        console.log('Video is preloaded - showing popup immediately');
        setShowVideoModal(true);
      } else {
        console.log('Video not yet preloaded - showing popup anyway (will load on demand)');
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
    console.log('Video modal close button clicked - closing video popup');
    setShowVideoModal(false);
    // Mark that user has watched the video once
    setHasWatchedVideo(true);
    setAllowSmoothScrolling(true);
    // CRITICAL: Set flag to return to stop frame when video is cancelled
    console.log('Video cancelled - setting flag to return to frame:', stopFrame);
    setShouldReturnToStopFrame(true);
    setCurrentFrame(stopFrame);
    // Small delay to ensure state update before resuming scroll
    setTimeout(() => {
      resumeScroll(); // Resume scroll after closing video
      console.log('Scroll resumed after video close - smooth scrolling enabled');
      // Force show play button since we're back at frame 234
      console.log('At frame 234 after video close - showing play button');
      setShowPlayButton(true);
    }, 100);
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
  
  // Use preloaded image if available, otherwise fall back to src
  const preloadedImg = window.preloadedImages && window.preloadedImages.get(imageSrc);
  
  return (
    <div className="png-sequence-container">
      <img
        ref={imgRef}
        src={preloadedImg ? preloadedImg.src : imageSrc}
        alt={`Journey Frame ${currentFrame}`}
        className="png-sequence-frame"
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
            <div className="timeline-text">
              {Math.ceil((1 - timelineProgress) * (timelineDuration / 1000))}s
            </div>
          </div>
        </div>
      )}
      {/* Play Button Overlay */}
      {(() => {
        const shouldShow = shouldShowPlayButton() || isContinueCTAVisible();
        console.log(':video_game: RENDER: Play button should show:', shouldShow);
        return shouldShow;
      })() && (
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
      {/* Video Modal Popup */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={handleVideoModalClose}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="video-modal-close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked - calling handleVideoModalClose');
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
        <div className="png-sequence-debug">
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
          <div style={{ color: hasGoneBelowStopFrame ? 'orange' : 'gray' }}>
            Has Gone Below Stop Frame: {hasGoneBelowStopFrame ? 'Yes' : 'No'}
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
export default PNGSequence;
