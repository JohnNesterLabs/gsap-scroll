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
  sectionProgress
}) => {
  // Basic display states
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
  
  // Configuration constants
  const isMobile = framePrefix === 'frame_' && folderPath.includes('frames-mobile');
  const framesPerSecond = AUTOPLAY_CONFIG.framesPerSecond;
  const frameInterval = 1000 / framesPerSecond;
  const scrollThreshold = AUTOPLAY_CONFIG.scrollThreshold;
  
  // Pause frames: Desktop [60, 120], Mobile [40, 80]
  const pauseFrames = isMobile ? [40, 80] : [80, 120];
  
  // Check if current frame is a pause frame
  const isPauseFrame = (frame) => pauseFrames.includes(frame);

  console.log('🎬 AUTO-PLAY STATE:', {
    currentFrame,
    isAutoPlaying,
    playDirection,
    hasCompletedSequence,
    isVisible,
    activeSection,
    isMobile,
    isPaused,
    pauseFrames
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

    const lockedScrollTop = scrollContainer.scrollTop;
    
    preventScrollHandler.current = (e) => {
      // In pause state, allow small scroll movements for detection
      if (isPaused) {
        const currentScroll = scrollContainer.scrollTop;
        const scrollDiff = Math.abs(currentScroll - lockedScrollTop);
        // Allow small movements (up to 50px) for scroll detection, then reset
        if (scrollDiff > 50) {
          scrollContainer.scrollTop = lockedScrollTop;
        }
        return;
      }
      // Lock scroll position during auto-play (not paused)
      scrollContainer.scrollTop = lockedScrollTop;
    };

    scrollContainer.addEventListener('scroll', preventScrollHandler.current, { passive: false });
    console.log('🔒 SCROLL PREVENTED at position:', lockedScrollTop);
  }, [isPaused]);

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
    // Case 3: Hide if user scrolls forward past the section (after completion)
    else if (activeSection > startSection && hasCompletedSequence) {
      console.log('🎬 HIDING - User scrolled past section after completion');
      setIsVisible(false);
    }
    // Case 4: Reset if user scrolls back before the section
    else if (activeSection < startSection) {
      console.log('🎬 RESETTING - User scrolled before start section');
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
          // Advance to next frame
          nextFrame += 1;
          
          // Check if we've reached a pause frame
          if (isPauseFrame(nextFrame)) {
            console.log(`⏸️ PAUSED at frame ${nextFrame} (forward)`);
            setIsPaused(true);
            setIsAutoPlaying(false);
            scrollAccumulator.current = 0;
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            return;
          }
          
          // Check if we've completed the sequence
          if (nextFrame > totalFrames) {
            console.log('✅ SEQUENCE COMPLETE - Handing back scroll control');
            nextFrame = totalFrames;
            setIsAutoPlaying(false);
            setIsPaused(false);
            setHasCompletedSequence(true);
            // Keep last frame visible - user will manually scroll to footer
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            restoreScroll();
            
            // Don't auto-scroll - let user manually scroll to footer
            // The frame sequence will remain visible until user scrolls away
            
            return;
          }
        } else {
          // Backward
          nextFrame -= 1;
          
          // Check if we've reached a pause frame
          if (isPauseFrame(nextFrame)) {
            console.log(`⏸️ PAUSED at frame ${nextFrame} (backward)`);
            setIsPaused(true);
            setIsAutoPlaying(false);
            scrollAccumulator.current = 0;
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            return;
          }
          
          // Check if we've reached the start
          if (nextFrame < 1) {
            console.log('⏮️ REACHED START - Resetting and restoring scroll control');
            nextFrame = 1;
            setIsAutoPlaying(false);
            setIsPaused(false);
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
  }, [isAutoPlaying, playDirection, isVisible, totalFrames, frameInterval, restoreScroll, scrollToSection]);

  // Handle scroll events for direction control
  const handleWheel = useCallback((e) => {
    if (!isVisible) return;

    // Handle both wheel events (desktop) and touch events (mobile)
    let scrollDelta = 0;
    const now = Date.now();
    
    if (e.deltaY !== undefined) {
      // Wheel event (desktop)
      scrollDelta = e.deltaY;
    } else if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
      // Touch event (mobile) - calculate delta from touch movement
      const touch = e.touches[0];
      if (lastTouchY.current === 0) {
        lastTouchY.current = touch.clientY;
        return; // First touch, just record position
      }
      scrollDelta = lastTouchY.current - touch.clientY; // Positive = scrolling down
      lastTouchY.current = touch.clientY;
    } else if (e.type === 'touchstart' && e.touches && e.touches.length > 0) {
      // Reset touch tracking on touch start
      lastTouchY.current = e.touches[0].clientY;
      return;
    } else {
      // Fallback for other event types
      return;
    }
    
    console.log('🖱️ WHEEL EVENT:', { scrollDelta, isAutoPlaying, isPaused, currentFrame });

    // Handle pause state - accumulate scroll to resume
    if (isPaused) {
      if (scrollDelta > 0) {
        // Scrolling down - trying to move forward
        scrollAccumulator.current += scrollDelta;
        console.log('📊 PAUSE SCROLL DOWN:', scrollAccumulator.current, 'threshold:', scrollThreshold);
        
        if (scrollAccumulator.current >= scrollThreshold) {
          // User wants to move past pause - resume auto-play forward
          const pausedFrame = currentFrameRef.current;
          const nextFrameAfterPause = pausedFrame + 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - continuing forward to frame ${nextFrameAfterPause}`);
          setIsPaused(false);
          setIsAutoPlaying(true);
          setPlayDirection('forward');
          scrollAccumulator.current = 0;
          currentFrameRef.current = nextFrameAfterPause;
          setCurrentFrame(nextFrameAfterPause);
        }
      } else if (scrollDelta < 0) {
        // Scrolling up - trying to go back
        scrollAccumulator.current += scrollDelta; // Will be negative
        console.log('📊 PAUSE SCROLL UP:', scrollAccumulator.current, 'threshold:', -scrollThreshold);
        
        if (scrollAccumulator.current <= -scrollThreshold) {
          // User wants to go back
          const pausedFrame = currentFrameRef.current;
          const nextFrameBeforePause = pausedFrame - 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - going backward to frame ${nextFrameBeforePause}`);
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
  }, [isVisible, isAutoPlaying, isPaused, playDirection, scrollThreshold, currentFrame]);

  // Attach scroll listeners
  useEffect(() => {
    if (!isVisible) return;

    // Use wheel for desktop and touchmove/touchstart for mobile
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: false }); // non-passive to allow preventDefault if needed
    window.addEventListener('touchstart', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
      window.removeEventListener('touchstart', handleWheel);
      // Reset touch tracking on cleanup
      lastTouchY.current = 0;
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
        // Use the actual frame number for all frames (no duplicates)
        const src = `${folderPath}${framePrefix}${formatFrameNumber(frameNum)}${frameSuffix}`;
        cache.set(cacheKey, src);
      }
      return cache.get(cacheKey);
    };
  }, [framePrefix, folderPath, frameSuffix, formatFrameNumber]);

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

      {/* Troubleshooting Map Text Overlay */}
      {(isMobile
        ? (currentFrame >= 4 && currentFrame <= 35) // Mobile: show text for frames 4-35
        : (currentFrame >= 4 && currentFrame <= 64) // Desktop: show text for frames 4-64
      ) && (
        <div className="troubleshooting-text-overlay">
          <div className="troubleshooting-text">
            AI that automatically builds and nurtures your Troubleshooting Map
          </div>
        </div>
      )}
    </div>
  );
};

export default WebPSequence;
