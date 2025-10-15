import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './WebPSequence.css';
import { AUTOPLAY_CONFIG } from '../../../../utils/constants';

const WebPSequence = ({
  startSection = 4,
  totalFrames = 300,
  framePrefix = 'mobile_frame_',
  frameSuffix = '.webp',
  folderPath = '/frames-mobile/',
  activeSection,
  sectionProgress,
  stopFrame = 200,
  timelineDuration = 5000,
  timelinePosition = { top: '50%', left: '50%' },
  playButtonPosition = { top: '60%', left: '50%' },
  onTimelineComplete,
  onPlayButtonClick,
  videoSrc = '/Ticket1_web.mp4',
  showVideoPopup = true,
  isVideoPreloaded = false,
  videoPreloadProgress = 0
}) => {
  // Basic display states
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  
  // Auto-play control states
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playDirection, setPlayDirection] = useState('forward'); // 'forward' or 'backward'
  const [isInCTABuffer, setIsInCTABuffer] = useState(false);
  const [hasCompletedSequence, setHasCompletedSequence] = useState(false);
  
  // Refs for animation control
  const autoPlayFrameId = useRef(null);
  const currentFrameRef = useRef(1);
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const imgRef = useRef(null);
  const hasInitialized = useRef(false);
  const scrollContainerRef = useRef(null);
  const preventScrollHandler = useRef(null);
  const previousSectionRef = useRef(activeSection);
  
  // Configuration constants
  const isMobile = framePrefix === 'mobile_frame_';
  const ctaStartFrame = isMobile ? 320 : 234;
  const ctaEndFrame = isMobile ? 420 : 334;
  const framesPerSecond = AUTOPLAY_CONFIG.framesPerSecond;
  const frameInterval = 1000 / framesPerSecond;
  const scrollThreshold = AUTOPLAY_CONFIG.scrollThreshold;

  // Detect if we're in CTA zone
  const isInCTAZone = currentFrame >= ctaStartFrame && currentFrame <= ctaEndFrame;

  console.log('🎬 AUTO-PLAY STATE:', {
      currentFrame,
    isAutoPlaying,
    playDirection,
    isInCTABuffer,
    isInCTAZone,
    hasCompletedSequence,
      isVisible,
      activeSection,
    ctaStartFrame,
    ctaEndFrame,
    isMobile,
    inDuplicateZone: isMobile && currentFrame > 420
  });

  // Get scroll container reference
  useEffect(() => {
    const scrollContainer = document.querySelector('.home-scroll-container');
    if (scrollContainer) {
      scrollContainerRef.current = scrollContainer;
      console.log('✅ Scroll container reference acquired');
    }
  }, []);


  // Helper function to scroll to a specific section position
  const scrollToSection = useCallback((targetSection, instant = false) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const totalSections = 7; // Total sections in the app
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    
    // Calculate scroll position for the target section
    // targetSection should be between 0 and 6 (totalSections - 1)
    const targetScrollProgress = targetSection / (totalSections - 1);
    const targetScrollTop = targetScrollProgress * maxScroll;
    
    // Scroll to position (instant or smooth)
    if (instant) {
      // Temporarily disable smooth scrolling CSS for instant scroll
      const originalScrollBehavior = scrollContainer.style.scrollBehavior;
      scrollContainer.style.scrollBehavior = 'auto';
      
      // Set scroll position instantly
      scrollContainer.scrollTop = targetScrollTop;
      
      // Restore original scroll behavior on next frame
      requestAnimationFrame(() => {
        scrollContainer.style.scrollBehavior = originalScrollBehavior;
      });
    } else {
      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Prevent/restore scroll based on auto-play state
  const preventScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || preventScrollHandler.current) return;

    const currentScrollTop = scrollContainer.scrollTop;
    
    preventScrollHandler.current = (e) => {
      // Lock scroll position
      scrollContainer.scrollTop = currentScrollTop;
    };

    scrollContainer.addEventListener('scroll', preventScrollHandler.current, { passive: false });
    console.log('🔒 SCROLL PREVENTED at position:', currentScrollTop);
  }, []);

  const restoreScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !preventScrollHandler.current) return;

    scrollContainer.removeEventListener('scroll', preventScrollHandler.current);
    preventScrollHandler.current = null;
    console.log('🔓 SCROLL RESTORED');
  }, []);

  // Initialize auto-play when section becomes active
  useEffect(() => {
    const previousSection = previousSectionRef.current;
    const comingFromAbove = previousSection > activeSection && previousSection > startSection;
    
    // Case 1: First time reaching section (scrolling down/forward)
    if (activeSection >= startSection && !hasInitialized.current && !hasCompletedSequence) {
      console.log('🎬 INITIALIZING AUTO-PLAY - Section became active (forward)');
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('forward');
      hasInitialized.current = true;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      preventScroll();
    } 
    // Case 2: Scrolling back into section from above (after completion)
    else if (activeSection >= startSection && hasCompletedSequence && comingFromAbove) {
      console.log('🎬 RE-INITIALIZING AUTO-PLAY - Scrolling back from above (backward)');
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('backward');
      hasInitialized.current = true;
      setHasCompletedSequence(false); // Reset completion flag for this backward pass
      currentFrameRef.current = totalFrames;
      setCurrentFrame(totalFrames);
      preventScroll();
    }
    // Case 3: Reset if user scrolls back before the section
    else if (activeSection < startSection) {
      console.log('🎬 RESETTING - User scrolled before start section');
      setIsVisible(false);
      setIsAutoPlaying(false);
      setIsInCTABuffer(false);
      setHasCompletedSequence(false);
      hasInitialized.current = false;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      restoreScroll();
      if (autoPlayFrameId.current) {
        cancelAnimationFrame(autoPlayFrameId.current);
        autoPlayFrameId.current = null;
      }
    }
    
    // Update previous section for next comparison
    previousSectionRef.current = activeSection;
  }, [activeSection, startSection, hasCompletedSequence, totalFrames, preventScroll, restoreScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restoreScroll();
      if (autoPlayFrameId.current) {
        cancelAnimationFrame(autoPlayFrameId.current);
      }
    };
  }, [restoreScroll]);

  // Auto-play animation loop
  useEffect(() => {
    if (!isAutoPlaying || !isVisible) {
      return;
    }

    let lastFrameTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        let nextFrame = currentFrameRef.current;

        if (playDirection === 'forward') {
          // For mobile, skip duplicate frames in the post-CTA zone
          // Frames 421-1367 have 5x duplication, so advance by 5 to show unique frames
          if (isMobile && nextFrame >= 420) {
            const oldFrame = nextFrame;
            nextFrame += 5;
            if (oldFrame === 420) {
              console.log('📱 MOBILE: Entering duplicate zone, advancing by 5 frames per tick');
            }
          } else {
            nextFrame += 1;
          }
          
          // Check if we've reached CTA zone
          if (nextFrame >= ctaStartFrame && nextFrame <= ctaEndFrame && !isInCTABuffer) {
            // Reached CTA zone - pause auto-play and enter buffer mode
            console.log('🎯 REACHED CTA ZONE - Entering buffer mode');
            setIsInCTABuffer(true);
            setIsAutoPlaying(false);
            scrollAccumulator.current = 0;
            currentFrameRef.current = ctaStartFrame;
            setCurrentFrame(ctaStartFrame);
            return;
          }
          
          // Check if we've completed the sequence
          if (nextFrame > totalFrames) {
            console.log('✅ SEQUENCE COMPLETE - Handing back scroll control');
            nextFrame = totalFrames;
            setIsAutoPlaying(false);
            setHasCompletedSequence(true);
            // Don't hide yet - keep last frame visible during scroll transition
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            restoreScroll();
            
            // Scroll user forward to the last-frame-section (around section 5)
            setTimeout(() => {
              scrollToSection(5);
            }, 100);
            
            // Hide the WebPSequence after scroll animation completes (smooth scroll takes ~500-800ms)
            setTimeout(() => {
              setIsVisible(false);
              console.log('🎬 WebPSequence hidden after transition');
            }, 900);
            
            return;
          }
        } else {
          // Backward
          // For mobile, skip duplicate frames in the post-CTA zone
          // Frames 421-1367 have 5x duplication, so advance by 5 to show unique frames
          if (isMobile && nextFrame > 420) {
            nextFrame -= 5;
          } else {
            nextFrame -= 1;
          }
          
          // Check if we've reached the start
          if (nextFrame < 1) {
            console.log('⏮️ REACHED START - Resetting and restoring scroll control');
            nextFrame = 1;
            setIsAutoPlaying(false);
            setHasCompletedSequence(false);
            hasInitialized.current = false;
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            restoreScroll();
            
            // Hide the WebPSequence FIRST before scrolling
            setIsVisible(false);
            
            // Use requestAnimationFrame to ensure scroll lock is fully removed before scrolling
            requestAnimationFrame(() => {
              scrollToSection(3.8, true); // true = instant scroll
            });
            
            return;
          }
        }

        currentFrameRef.current = nextFrame;
        setCurrentFrame(nextFrame);
      }

      autoPlayFrameId.current = requestAnimationFrame(animate);
    };

    autoPlayFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (autoPlayFrameId.current) {
        cancelAnimationFrame(autoPlayFrameId.current);
        autoPlayFrameId.current = null;
      }
    };
  }, [isAutoPlaying, playDirection, isVisible, totalFrames, ctaStartFrame, ctaEndFrame, frameInterval, isInCTABuffer, restoreScroll, scrollToSection]);

  // Handle scroll events for direction control and CTA buffer
  const handleWheel = useCallback((e) => {
    if (!isVisible) return;

    const scrollDelta = e.deltaY;
    const now = Date.now();
    
    console.log('🖱️ WHEEL EVENT:', { scrollDelta, isInCTABuffer, isAutoPlaying, showVideoModal });

    // CTA Buffer Zone Logic
    if (isInCTABuffer) {
      // If video modal is open, close it first with animation
      if (showVideoModal && !isClosingModal) {
        console.log('❌ VIDEO MODAL OPEN - Closing with animation before handling scroll');
        setIsClosingModal(true);
        // Reset scroll accumulator when closing modal
        scrollAccumulator.current = 0;
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
          setShowVideoModal(false);
          setIsClosingModal(false);
          setHasWatchedVideo(true);
          console.log('✅ VIDEO MODAL CLOSED - Ready for scroll handling');
        }, 250);
        return;
      }
      
      // If modal is currently closing, don't handle scroll yet
      if (isClosingModal) {
        return;
      }

      // Accumulate scroll to detect intent to move past CTA
      if (scrollDelta > 0) {
        // Scrolling down - trying to move forward
        scrollAccumulator.current += scrollDelta;
        console.log('📊 BUFFER SCROLL DOWN:', scrollAccumulator.current, 'threshold:', scrollThreshold);
        
        if (scrollAccumulator.current >= scrollThreshold) {
          // User wants to move past CTA
          console.log('🚀 EXITING CTA BUFFER - Resuming auto-play forward');
          setIsInCTABuffer(false);
          setIsAutoPlaying(true);
          setPlayDirection('forward');
          scrollAccumulator.current = 0;
          currentFrameRef.current = ctaEndFrame + 1;
          setCurrentFrame(ctaEndFrame + 1);
        }
      } else if (scrollDelta < 0) {
        // Scrolling up - trying to go back
        scrollAccumulator.current += scrollDelta; // Will be negative
        console.log('📊 BUFFER SCROLL UP:', scrollAccumulator.current, 'threshold:', -scrollThreshold);
        
        if (scrollAccumulator.current <= -scrollThreshold) {
          // User wants to go back
          console.log('⏪ EXITING CTA BUFFER - Resuming auto-play backward');
          setIsInCTABuffer(false);
          setIsAutoPlaying(true);
          setPlayDirection('backward');
          scrollAccumulator.current = 0;
          currentFrameRef.current = ctaStartFrame - 1;
          setCurrentFrame(ctaStartFrame - 1);
        }
      }
      return;
    }

    // Direction change during auto-play
    if (isAutoPlaying) {
      if (scrollDelta < 0 && playDirection === 'forward') {
        // Scrolling up during forward play - reverse
        console.log('⏪ REVERSING - User scrolled up during forward play');
        setPlayDirection('backward');
      } else if (scrollDelta > 0 && playDirection === 'backward') {
        // Scrolling down during backward play - go forward
        console.log('⏩ FORWARD - User scrolled down during backward play');
        setPlayDirection('forward');
      }
    }
    
    lastScrollTime.current = now;
  }, [isVisible, isInCTABuffer, isAutoPlaying, playDirection, scrollThreshold, ctaStartFrame, ctaEndFrame, showVideoModal, isClosingModal]);

  // Attach scroll listeners
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
    };
  }, [isVisible, handleWheel]);

  // Memoize frame number formatting for performance
  const formatFrameNumber = useMemo(() => {
    const cache = new Map();
    return (frameNum) => {
      if (!cache.has(frameNum)) {
        cache.set(frameNum, frameNum.toString().padStart(4, '0'));
      }
      return cache.get(frameNum);
    };
  }, []);

  // Memoize frame image source calculation for performance
  const getFrameImageSrc = useMemo(() => {
    const cache = new Map();
    return (frameNum) => {
      const cacheKey = `${framePrefix}-${frameNum}-${folderPath}-${frameSuffix}`;
      if (!cache.has(cacheKey)) {
        let src;
        // For mobile frames 321-420, use frame 320 image (duplicate zone)
        if (framePrefix === 'mobile_frame_' && frameNum >= 321 && frameNum <= 420) {
          src = `${folderPath}${framePrefix}0320${frameSuffix}`;
        }
        // For mobile frames 421-1367, duplicate each frame from 420-587 by 5 times for smooth scrolling
        else if (framePrefix === 'mobile_frame_' && frameNum >= 421) {
          const originalFrameStart = 420;
          const originalFrameEnd = 587;
          const duplicatesPerFrame = 5;
          const virtualFrameIndex = frameNum - 420;
          const originalFrameIndex = Math.floor(virtualFrameIndex / duplicatesPerFrame);
          const originalFrame = originalFrameStart + originalFrameIndex;
          const clampedOriginalFrame = Math.min(originalFrame, originalFrameEnd);
          src = `${folderPath}${framePrefix}${formatFrameNumber(clampedOriginalFrame)}${frameSuffix}`;
        }
        // For all other frames, use the actual frame number
        else {
          src = `${folderPath}${framePrefix}${formatFrameNumber(frameNum)}${frameSuffix}`;
        }
        cache.set(cacheKey, src);
      }
      return cache.get(cacheKey);
    };
  }, [framePrefix, folderPath, frameSuffix, formatFrameNumber]);

  // Check if CTA button should be shown
  const shouldShowCTA = isInCTAZone && isVisible;

  // Handle play button click
  const handlePlayButtonClick = useCallback(() => {
    console.log('🎬 CTA CLICKED - Opening video modal');
    if (showVideoPopup && videoSrc) {
      if (isVideoPreloaded) {
        console.log('✅ Video is preloaded');
        setShowVideoModal(true);
      } else {
        console.log('⚠️ Video not yet preloaded - loading on demand');
        setShowVideoModal(true);
      }
    }
    if (onPlayButtonClick) {
      onPlayButtonClick();
    }
  }, [showVideoPopup, videoSrc, isVideoPreloaded, onPlayButtonClick]);

  // Handle video modal close with animation
  const handleVideoModalClose = useCallback(() => {
    console.log('❌ VIDEO MODAL CLOSING - Starting animation');
    setIsClosingModal(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setShowVideoModal(false);
      setIsClosingModal(false);
      setHasWatchedVideo(true);
      console.log('✅ VIDEO MODAL CLOSED - Animation complete');
    }, 250); // Match the CSS animation duration
  }, []);

  // Handle image errors
  const handleImageError = useCallback(() => {
    console.warn(`⚠️ Failed to load frame ${currentFrame}`);
  }, [currentFrame]);

  if (!isVisible) {
    return null;
  }

  const imageSrc = getFrameImageSrc(currentFrame);
  const preloadedImg = window.preloadedImages && window.preloadedImages.get(imageSrc);

  return (
    <div className="webp-sequence-container">
      <img
        ref={imgRef}
        src={preloadedImg ? preloadedImg.src : imageSrc}
        alt={`Frame ${currentFrame}`}
        className="webp-sequence-frame"
        onError={handleImageError}
        style={{
          willChange: preloadedImg ? 'auto' : 'transform',
        }}
      />

      {/* CTA Text Overlay */}
      {shouldShowCTA && (
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
            aria-label="Watch demo video"
          >
            Click To Enter Ticket No. 1535
          </button>
        </div>
      )}

      {/* CTA Play Button Overlay */}
      {shouldShowCTA && (
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
            aria-label="Watch demo video"
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

      {/* Troubleshooting Map Text Overlay */}
      {(framePrefix === 'mobile_frame_' 
        ? (currentFrame >= 4 && currentFrame <= 300)
        : (currentFrame >= 4 && currentFrame <= 220)
      ) && (
        <div className="troubleshooting-text-overlay">
          <div className="troubleshooting-text">
            AI that automatically builds and nurtures your Troubleshooting Map
          </div>
        </div>
      )}

      {/* Video Modal Popup */}
      {showVideoModal && (
        <div className={`video-modal-overlay ${isClosingModal ? 'closing' : ''}`} onClick={handleVideoModalClose}>
          <div className={`video-modal-content ${isClosingModal ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
};

export default WebPSequence;
