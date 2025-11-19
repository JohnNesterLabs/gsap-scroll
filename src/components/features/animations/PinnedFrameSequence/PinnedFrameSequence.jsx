import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './PinnedFrameSequence.css';

/**
 * PinnedFrameSequence Component
 * 
 * Uses the same frames for both mobile and desktop.
 * 
 * Features:
 * - Auto-play animation with configurable speed
 * - Auto-pause at specific frames
 * - Scroll direction control (forward/backward)
 * - Scroll locking during auto-play
 * - Responsive design
 */

// Configuration - Adjust these values to customize behavior
const CONFIG = {
  // Animation speed (frames per second)
  framesPerSecond: 15, // Lower = slower, Higher = faster
  
  // Scroll threshold to resume from pause (in pixels)
  scrollThreshold: 100,
  
  // Section where animation starts (0-indexed)
  startSection: 3,
  
  // Total number of frames in sequence
  totalFrames: 134, // Adjust based on your frame count
  
  // Frame file configuration
  framePrefix: 'frame_', // e.g., "frame_" for "frame_0001.webp"
  frameSuffix: '.webp',   // File extension: '.webp' or '.png'
  folderPath: '/frame-desktop/', // Path to frame folder
  
  // Frames where animation pauses (user must scroll to continue)
  pauseFrames: [80, 120], // Pause at these frame numbers
  
  // Total sections in your page (for scroll calculations)
  totalSections: 7,
};

const PinnedFrameSequence = ({
  activeSection, // Current active section (0-indexed)
  sectionProgress // Progress within current section (0-1)
}) => {
  // Display states
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  
  // Auto-play control states
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playDirection, setPlayDirection] = useState('forward'); // 'forward' or 'backward'
  const [hasCompletedSequence, setHasCompletedSequence] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs for animation control
  const autoPlayFrameId = useRef(null);
  const currentFrameRef = useRef(1);
  const lastScrollTime = useRef(Date.now());
  const lastTouchY = useRef(0);
  const imgRef = useRef(null);
  const hasInitialized = useRef(false);
  const scrollContainerRef = useRef(null);
  const preventScrollHandler = useRef(null);
  const previousSectionRef = useRef(activeSection);
  const scrollAccumulator = useRef(0);
  
  // Calculate frame interval based on FPS
  const frameInterval = 1000 / CONFIG.framesPerSecond;
  
  // Check if current frame is a pause frame
  const isPauseFrame = useCallback((frame) => {
    return CONFIG.pauseFrames.includes(frame);
  }, []);

  // Get scroll container reference
  useEffect(() => {
    const scrollContainer = document.querySelector('.home-scroll-container');
    if (scrollContainer) {
      scrollContainerRef.current = scrollContainer;
    }
  }, []);

  // Helper function to scroll to a specific section position
  const scrollToSection = useCallback((targetSection, instant = false) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const targetScrollProgress = targetSection / (CONFIG.totalSections - 1);
    const targetScrollTop = targetScrollProgress * maxScroll;
    
    if (instant) {
      const originalScrollBehavior = scrollContainer.style.scrollBehavior;
      scrollContainer.style.scrollBehavior = 'auto';
      scrollContainer.scrollTop = targetScrollTop;
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

  // Prevent scroll during auto-play
  const preventScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || preventScrollHandler.current) return;

    const lockedScrollTop = scrollContainer.scrollTop;
    
    preventScrollHandler.current = (e) => {
      if (isPaused) {
        const currentScroll = scrollContainer.scrollTop;
        const scrollDiff = Math.abs(currentScroll - lockedScrollTop);
        if (scrollDiff > 50) {
          scrollContainer.scrollTop = lockedScrollTop;
        }
        return;
      }
      scrollContainer.scrollTop = lockedScrollTop;
    };

    scrollContainer.addEventListener('scroll', preventScrollHandler.current, { passive: false });
  }, [isPaused]);

  const restoreScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !preventScrollHandler.current) return;

    scrollContainer.removeEventListener('scroll', preventScrollHandler.current);
    preventScrollHandler.current = null;
  }, []);

  // Initialize auto-play when section becomes active
  useEffect(() => {
    const previousSection = previousSectionRef.current;
    const comingFromAbove = previousSection > activeSection && previousSection > CONFIG.startSection;
    
    // Case 1: First time reaching section (scrolling down/forward)
    if (activeSection >= CONFIG.startSection && !hasInitialized.current && !hasCompletedSequence) {
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('forward');
      hasInitialized.current = true;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      preventScroll();
    } 
    // Case 2: Scrolling back into section from above (after completion)
    else if (activeSection >= CONFIG.startSection && hasCompletedSequence && comingFromAbove) {
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('backward');
      hasInitialized.current = true;
      setHasCompletedSequence(false);
      currentFrameRef.current = CONFIG.totalFrames;
      setCurrentFrame(CONFIG.totalFrames);
      preventScroll();
    }
    // Case 3: Reset if user scrolls back before the section
    else if (activeSection < CONFIG.startSection) {
      setIsVisible(false);
      setIsAutoPlaying(false);
      setIsPaused(false);
      setHasCompletedSequence(false);
      hasInitialized.current = false;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      scrollAccumulator.current = 0;
      restoreScroll();
      if (autoPlayFrameId.current) {
        cancelAnimationFrame(autoPlayFrameId.current);
        autoPlayFrameId.current = null;
      }
    }
    
    previousSectionRef.current = activeSection;
  }, [activeSection, hasCompletedSequence, preventScroll, restoreScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restoreScroll();
      if (autoPlayFrameId.current) {
        cancelAnimationFrame(autoPlayFrameId.current);
      }
    };
  }, [restoreScroll]);


  // Handle scroll events for direction control
  const handleWheel = useCallback((e) => {
    if (!isVisible) return;

    let scrollDelta = 0;
    const now = Date.now();
    
    if (e.deltaY !== undefined) {
      scrollDelta = e.deltaY;
    } else if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      if (lastTouchY.current === 0) {
        lastTouchY.current = touch.clientY;
        return;
      }
      scrollDelta = lastTouchY.current - touch.clientY;
      lastTouchY.current = touch.clientY;
    } else if (e.type === 'touchstart' && e.touches && e.touches.length > 0) {
      lastTouchY.current = e.touches[0].clientY;
      return;
    } else {
      return;
    }

    // Handle pause state - accumulate scroll to resume
    if (isPaused) {
      if (scrollDelta > 0) {
        scrollAccumulator.current += scrollDelta;
        
        if (scrollAccumulator.current >= CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameAfterPause = pausedFrame + 1;
          setIsPaused(false);
          setIsAutoPlaying(true);
          setPlayDirection('forward');
          scrollAccumulator.current = 0;
          currentFrameRef.current = nextFrameAfterPause;
          setCurrentFrame(nextFrameAfterPause);
        }
      } else if (scrollDelta < 0) {
        scrollAccumulator.current += scrollDelta;
        
        if (scrollAccumulator.current <= -CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameBeforePause = pausedFrame - 1;
          setIsPaused(false);
          setIsAutoPlaying(true);
          setPlayDirection('backward');
          scrollAccumulator.current = 0;
          currentFrameRef.current = nextFrameBeforePause;
          setCurrentFrame(nextFrameBeforePause);
        }
      }
      return;
    }

    // Direction change during auto-play
    if (isAutoPlaying) {
      if (scrollDelta < 0 && playDirection === 'forward') {
        setPlayDirection('backward');
      } else if (scrollDelta > 0 && playDirection === 'backward') {
        setPlayDirection('forward');
      }
    }
    
    lastScrollTime.current = now;
  }, [isVisible, isAutoPlaying, isPaused, playDirection, currentFrame]);

  // Attach scroll listeners
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
      window.removeEventListener('touchstart', handleWheel);
      lastTouchY.current = 0;
    };
  }, [isVisible, handleWheel]);

  // Format frame number with leading zeros
  const formatFrameNumber = useMemo(() => {
    const cache = new Map();
    return (frameNum) => {
      if (!cache.has(frameNum)) {
        cache.set(frameNum, frameNum.toString().padStart(4, '0'));
      }
      return cache.get(frameNum);
    };
  }, []);

  // Get frame image source
  const getFrameImageSrc = useMemo(() => {
    const cache = new Map();
    return (frameNum) => {
      const cacheKey = `${CONFIG.framePrefix}-${frameNum}-${CONFIG.folderPath}-${CONFIG.frameSuffix}`;
      if (!cache.has(cacheKey)) {
        const src = `${CONFIG.folderPath}${CONFIG.framePrefix}${formatFrameNumber(frameNum)}${CONFIG.frameSuffix}`;
        cache.set(cacheKey, src);
      }
      return cache.get(cacheKey);
    };
  }, [formatFrameNumber]);

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
    <div className="pinned-frame-sequence-container">
      <img
        ref={imgRef}
        src={preloadedImg ? preloadedImg.src : imageSrc}
        alt={`Frame ${currentFrame}`}
        className="pinned-frame-sequence-image"
        onError={handleImageError}
        style={{
          willChange: preloadedImg ? 'auto' : 'transform',
        }}
      />

      {/* Optional: Text Overlay - Uncomment to show text on specific frames */}
      {/* {(currentFrame >= 4 && currentFrame <= 64) && (
        <div className="text-overlay">
          <div className="text-content">
            AI that automatically builds and nurtures your Troubleshooting Map
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PinnedFrameSequence;

