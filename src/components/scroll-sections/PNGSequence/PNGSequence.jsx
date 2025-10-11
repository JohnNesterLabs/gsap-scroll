import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  videoSrc = '/demo1.mp4', // Default video source for popup
  showVideoPopup = true // Whether to show video popup on continue
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const imgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPreventionHandlerRef = useRef(null);
  
  // Image preloading and request management
  const preloadedImagesRef = useRef(new Map());
  const pendingRequestsRef = useRef(new Map());
  const frameLoadTimeoutRef = useRef(null);

  // Format frame number with leading zeros
  const formatFrameNumber = (frameNum) => {
    return frameNum.toString().padStart(4, '0');
  };

  // Preload image with proper request management and performance optimizations
  const preloadImage = useCallback((frameNumber) => {
    const frameKey = frameNumber;
    
    // Return cached image if already loaded (as resolved Promise)
    if (preloadedImagesRef.current.has(frameKey)) {
      return Promise.resolve(preloadedImagesRef.current.get(frameKey));
    }

    // Cancel any pending request for this frame
    if (pendingRequestsRef.current.has(frameKey)) {
      const pendingRequest = pendingRequestsRef.current.get(frameKey);
      if (pendingRequest.abort) {
        pendingRequest.abort();
      }
      pendingRequestsRef.current.delete(frameKey);
    }

    // Create new image element with performance optimizations
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for better caching
    img.decoding = 'async'; // Use async decoding
    img.loading = 'eager'; // Load immediately for current frame
    
    const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(frameNumber)}${frameSuffix}`;
    
    // Create abort controller for this request
    const controller = new AbortController();
    pendingRequestsRef.current.set(frameKey, controller);

    // Set up image loading with timeout
    const loadPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingRequestsRef.current.delete(frameKey);
        reject(new Error(`Timeout loading frame ${frameNumber}`));
      }, 10000); // 10 second timeout instead of 3 minutes

      img.onload = () => {
        clearTimeout(timeout);
        preloadedImagesRef.current.set(frameKey, img);
        pendingRequestsRef.current.delete(frameKey);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        pendingRequestsRef.current.delete(frameKey);
        console.warn(`Failed to load frame ${frameNumber}`);
        reject(new Error(`Failed to load frame ${frameNumber}`));
      };
    });

    // Handle abort signal
    controller.signal.addEventListener('abort', () => {
      img.src = '';
      pendingRequestsRef.current.delete(frameKey);
    });

    // Start loading with priority
    img.src = imageSrc;
    
    return loadPromise;
  }, [folderPath, framePrefix, frameSuffix]);

  // Batch preload nearby frames for smoother scrolling with throttling
  const preloadNearbyFrames = useCallback((centerFrame) => {
    const preloadRange = 3; // Reduced from 5 to 3 frames to reduce network load
    const startFrame = Math.max(1, centerFrame - preloadRange);
    const endFrame = Math.min(totalFrames, centerFrame + preloadRange);
    
    // Throttle preloading to avoid overwhelming the network
    const preloadQueue = [];
    for (let frame = startFrame; frame <= endFrame; frame++) {
      if (!preloadedImagesRef.current.has(frame)) {
        preloadQueue.push(frame);
      }
    }
    
    // Load frames with delay to prevent network congestion
    preloadQueue.forEach((frame, index) => {
      setTimeout(() => {
        preloadImage(frame).catch(() => {
          // Silently handle preload failures
        });
      }, index * 100); // 100ms delay between each preload
    });
  }, [totalFrames, preloadImage]);

  // Cleanup function for pending requests
  const cleanupPendingRequests = () => {
    pendingRequestsRef.current.forEach((controller) => {
      if (controller.abort) {
        controller.abort();
      }
    });
    pendingRequestsRef.current.clear();
  };

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
      
      // Preload nearby frames for smoother scrolling
      preloadNearbyFrames(clampedFrame);
    } else {
      setIsVisible(false);
      setCurrentFrame(1);
      setIsScrollStopped(false);
      setShowTimeline(false);
      setShowPlayButton(false);
      setTimelineProgress(0);
      // Clean up scroll prevention when component is not visible
      resumeScroll();
      // Clean up pending requests when not visible
      cleanupPendingRequests();
    }
  }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, isScrollStopped, preloadNearbyFrames]);
  // Cleanup scroll prevention and pending requests on unmount
  useEffect(() => {
    return () => {
      resumeScroll();
      cleanupPendingRequests();
    };
  }, []);


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
      // Show video popup instead of immediately resuming scroll
      setShowVideoModal(true);
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
    // Ensure the play button is shown again after closing the video
    setShowPlayButton(true);
    // Small delay to ensure state update before resuming scroll
    setTimeout(() => {
      resumeScroll(); // Resume scroll after closing video
      console.log('Scroll resumed after video close');
    }, 100);
  };


  // Handle image loading errors
  const handleImageError = () => {
    console.warn(`Failed to load frame ${currentFrame}`);
    setIsLoading(false);
    setLoadError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  // Update image source with preloading and loading states
  useEffect(() => {
    if (!isVisible || !imgRef.current) return;

    setIsLoading(true);
    setLoadError(false);

    // Clear any existing timeout
    if (frameLoadTimeoutRef.current) {
      clearTimeout(frameLoadTimeoutRef.current);
    }

    // Try to get preloaded image first
    const preloadedImg = preloadedImagesRef.current.get(currentFrame);
    if (preloadedImg && preloadedImg.complete) {
      // Use preloaded image
      imgRef.current.src = preloadedImg.src;
      setIsLoading(false);
    } else {
      // Fallback to direct loading with timeout
      const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(currentFrame)}${frameSuffix}`;
      imgRef.current.src = imageSrc;
      
      // Set a timeout to cancel the request if it takes too long
      frameLoadTimeoutRef.current = setTimeout(() => {
        if (imgRef.current && imgRef.current.src === imageSrc) {
          // Request is taking too long, try to cancel it
          imgRef.current.src = '';
          setLoadError(true);
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout
    }
  }, [currentFrame, isVisible, folderPath, framePrefix, frameSuffix]);

  if (!isVisible) {
    return null;
  }

  const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(currentFrame)}${frameSuffix}`;

  return (
    <div className="png-sequence-container">
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading frame {currentFrame}...</div>
        </div>
      )}
      
      {/* Error overlay */}
      {loadError && (
        <div className="error-overlay">
          <div className="error-text">Failed to load frame {currentFrame}</div>
          <button 
            className="retry-button" 
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              // Force reload the current frame
              const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(currentFrame)}${frameSuffix}`;
              if (imgRef.current) {
                imgRef.current.src = imageSrc;
              }
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={`Journey Frame ${currentFrame}`}
        className="png-sequence-frame"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ opacity: isLoading ? 0.3 : 1 }}
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
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
