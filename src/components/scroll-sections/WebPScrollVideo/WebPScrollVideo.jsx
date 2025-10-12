import React, { useState, useEffect, useRef } from 'react';
import './WebPScrollVideo.css';

const WebPScrollVideo = ({
  startSection = 4, // Configurable start section (4 or 5)
  activeSection,
  sectionProgress,
  // Scroll stop functionality
  stopFrame = 234, // Frame to stop at (converted to video time)
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
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [allowSmoothScrolling, setAllowSmoothScrolling] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPreventionHandlerRef = useRef(null);

  // Mobile video configuration
  const MOBILE_VIDEO_CONFIG = {
    src: '/Kahuna AI Mobile Sequence 3.mp4',
    totalDuration: 30, // Total video duration in seconds (adjust based on actual video)
    stopTime: 18, // Time to stop at (equivalent to frame 234)
  };

  // Debug logging for all state changes
  useEffect(() => {
    console.log('📱 MOBILE VIDEO STATE CHANGE:', {
      currentVideoTime,
      stopTime: MOBILE_VIDEO_CONFIG.stopTime,
      hasWatchedVideo,
      allowSmoothScrolling,
      showPlayButton,
      isScrollStopped,
      showTimeline,
      isVisible,
      activeSection,
      sectionProgress
    });
  }, [currentVideoTime, hasWatchedVideo, allowSmoothScrolling, showPlayButton, isScrollStopped, showTimeline, isVisible, activeSection, sectionProgress]);

  // Calculate video time based on section progress
  useEffect(() => {
    if (activeSection >= startSection) {
      setIsVisible(true);
      
      // Calculate video time based on section progress
      const sectionOffset = activeSection - startSection;
      const progressInSection = sectionProgress;
      const totalProgress = sectionOffset + progressInSection;
      
      // Map progress to video time (0 to totalDuration)
      const targetTime = totalProgress * MOBILE_VIDEO_CONFIG.totalDuration;
      const clampedTime = Math.max(0, Math.min(MOBILE_VIDEO_CONFIG.totalDuration, targetTime));
      
      // Handle scroll stop logic
      if (clampedTime >= MOBILE_VIDEO_CONFIG.stopTime && !isScrollStopped && !allowSmoothScrolling) {
        // First time reaching the stop time - stop here
        setCurrentVideoTime(MOBILE_VIDEO_CONFIG.stopTime);
        setIsScrollStopped(true);
        setShowTimeline(true);
        console.log('🛑 Stopping at video time:', MOBILE_VIDEO_CONFIG.stopTime, 'Original calculated time:', targetTime);
        stopForwardScroll();
      } else if (isScrollStopped && !allowSmoothScrolling) {
        if (clampedTime < MOBILE_VIDEO_CONFIG.stopTime) {
          // User scrolled back below the stop time - reset everything
          console.log('⬅️ User scrolled back below stop time, resetting scroll stop');
          setIsScrollStopped(false);
          setShowTimeline(false);
          if (!allowSmoothScrolling) {
            setShowPlayButton(false);
          }
          setTimelineProgress(0);
          resumeScroll();
        } else {
          // User is at or past the stop time - keep it at stop time
          setCurrentVideoTime(MOBILE_VIDEO_CONFIG.stopTime);
        }
      } else if (allowSmoothScrolling) {
        // After video has been watched once, allow smooth scrolling through all time
        console.log('✅ Smooth scrolling enabled - allowing video time progression to:', clampedTime);
        setCurrentVideoTime(clampedTime);
      } else {
        setCurrentVideoTime(clampedTime);
      }
    } else {
      setIsVisible(false);
      setCurrentVideoTime(0);
      setIsScrollStopped(false);
      setShowTimeline(false);
      if (!allowSmoothScrolling) {
        setShowPlayButton(false);
      }
      setTimelineProgress(0);
      resumeScroll();
    }
  }, [activeSection, sectionProgress, startSection, isScrollStopped, allowSmoothScrolling]);

  // Handle showing Continue CTA again when user reaches stop time after watching video once
  useEffect(() => {
    if (isVisible && allowSmoothScrolling && hasWatchedVideo) {
      if (Math.abs(currentVideoTime - MOBILE_VIDEO_CONFIG.stopTime) < 0.5) {
        console.log('✅ User reached stop time again - showing Continue CTA for video rewatching');
        setShowPlayButton(true);
      } else {
        console.log('❌ User not at stop time - hiding Continue CTA');
        setShowPlayButton(false);
      }
    }
  }, [currentVideoTime, allowSmoothScrolling, hasWatchedVideo, isVisible]);

  // Stop forward scroll functionality (but allow backward scrolling)
  const stopForwardScroll = () => {
    const scrollContainer = document.querySelector('.demo-scroll-container');
    if (scrollContainer) {
      scrollContainerRef.current = scrollContainer;
      const currentScrollTop = scrollContainer.scrollTop;
      scrollContainer.dataset.maxScrollTop = currentScrollTop;
      
      const handleScrollPrevention = (e) => {
        if (scrollContainer.scrollTop > currentScrollTop) {
          e.preventDefault();
          scrollContainer.scrollTop = currentScrollTop;
        }
      };
      
      scrollPreventionHandlerRef.current = handleScrollPrevention;
      scrollContainer.addEventListener('scroll', handleScrollPrevention, { passive: false });
      scrollContainer.dataset.scrollHandler = 'true';
    }
  };

  // Resume scroll functionality
  const resumeScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && scrollPreventionHandlerRef.current) {
      delete scrollContainer.dataset.maxScrollTop;
      delete scrollContainer.dataset.scrollHandler;
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
      if (isVideoPreloaded) {
        console.log('✅ Video is preloaded - showing popup immediately');
        setShowVideoModal(true);
      } else {
        console.log('⏳ Video not yet preloaded - showing popup anyway (will load on demand)');
        setShowVideoModal(true);
      }
    } else {
      resumeScroll();
    }
    if (onPlayButtonClick) {
      onPlayButtonClick();
    }
  };

  // Handle video popup close
  const handleVideoModalClose = () => {
    console.log('📱 Mobile video modal close button clicked');
    setShowVideoModal(false);
    setHasWatchedVideo(true);
    setAllowSmoothScrolling(true);
    
    setTimeout(() => {
      resumeScroll();
      console.log('📱 Scroll resumed after mobile video close - smooth scrolling enabled');
      if (Math.abs(currentVideoTime - MOBILE_VIDEO_CONFIG.stopTime) < 0.5) {
        console.log('📱 At stop time after video close - showing play button');
        setShowPlayButton(true);
      }
    }, 100);
  };

  // Cleanup scroll prevention on unmount
  useEffect(() => {
    return () => {
      resumeScroll();
    };
  }, []);

  // Calculate if play button should be shown
  const shouldShowPlayButton = () => {
    const primaryCondition = allowSmoothScrolling && hasWatchedVideo && Math.abs(currentVideoTime - MOBILE_VIDEO_CONFIG.stopTime) < 0.5 && isVisible;
    const secondaryCondition = showPlayButton;
    const result = primaryCondition || secondaryCondition;
    
    if (result && !showPlayButton) {
      setShowPlayButton(true);
    }
    return result;
  };

  // Simple check for Continue CTA visibility
  const isContinueCTAVisible = () => {
    return hasWatchedVideo && allowSmoothScrolling && Math.abs(currentVideoTime - MOBILE_VIDEO_CONFIG.stopTime) < 0.5 && isVisible;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="webp-scroll-video-container">
      <video
        ref={videoRef}
        src={MOBILE_VIDEO_CONFIG.src}
        className="webp-scroll-video"
        currentTime={currentVideoTime}
        muted
        playsInline
        preload="auto"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center'
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
      {process.env.NODE_ENV === 'development' && (
        <div className="webp-scroll-video-debug">
          <div>📱 Mobile Video</div>
          <div>Section: {activeSection}</div>
          <div>Progress: {(sectionProgress * 100).toFixed(1)}%</div>
          <div>Video Time: {currentVideoTime.toFixed(1)}s/{MOBILE_VIDEO_CONFIG.totalDuration}s</div>
          <div>Start Section: {startSection}</div>
          <div>Stop Time: {MOBILE_VIDEO_CONFIG.stopTime}s</div>
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
      )}
    </div>
  );
};

export default WebPScrollVideo;
