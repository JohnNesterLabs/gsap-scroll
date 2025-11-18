import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FrameSequence.css';

const CONFIG = {
  startSection: 2, // Frame animation starts at section 3 (0-indexed: section 3 = index 2)
  totalFrames: 134, // Total number of frames
  framePrefix: 'frame_',
  frameSuffix: '.webp',
  folderPathDesktop: '/frame-desktop/',
  folderPathMobile: '/frames-mobile/',
  framesPerSecond: 15,
  scrollThreshold: 100,
  pauseFrames: [80, 120], // Frames where animation pauses
  mobileBreakpoint: 768 // Breakpoint for mobile devices
};

const FrameSequence = ({ activeSection }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playDirection, setPlayDirection] = useState('forward');
  const [hasCompletedSequence, setHasCompletedSequence] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [previousSection, setPreviousSection] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < CONFIG.mobileBreakpoint);

  const autoPlayFrameIdRef = useRef(null);
  const currentFrameRef = useRef(1);
  const lastScrollTimeRef = useRef(Date.now());
  const lastTouchYRef = useRef(0);
  const scrollAccumulatorRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const lockedScrollTopRef = useRef(0);
  const preventScrollHandlerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const frameImageRef = useRef(null);
  const isResettingRef = useRef(false);

  // Helper Functions
  const formatFrameNumber = useCallback((frameNum) => {
    return frameNum.toString().padStart(4, '0');
  }, []);

  const getFrameImageSrc = useCallback((frameNum) => {
    const folderPath = isMobile ? CONFIG.folderPathMobile : CONFIG.folderPathDesktop;
    return `${folderPath}${CONFIG.framePrefix}${formatFrameNumber(frameNum)}${CONFIG.frameSuffix}`;
  }, [formatFrameNumber, isMobile]);

  const isPauseFrame = useCallback((frame) => {
    return CONFIG.pauseFrames.includes(frame);
  }, []);

  // Scroll Control
  const scrollToSection = useCallback((targetSection, instant = false) => {
    if (!scrollContainerRef.current) return;

    // Calculate exact section position (each section is 100vh)
    const sectionHeight = window.innerHeight;
    const targetScrollTop = targetSection * sectionHeight;

    if (instant) {
      const originalScrollBehavior = scrollContainerRef.current.style.scrollBehavior;
      scrollContainerRef.current.style.scrollBehavior = 'auto';
      scrollContainerRef.current.scrollTop = targetScrollTop;
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.scrollBehavior = originalScrollBehavior;
        }
      });
    } else {
      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, []);

  const preventScroll = useCallback(() => {
    if (!scrollContainerRef.current || preventScrollHandlerRef.current) return;

    lockedScrollTopRef.current = scrollContainerRef.current.scrollTop;

    preventScrollHandlerRef.current = (e) => {
      if (!scrollContainerRef.current) return;
      
      if (isPaused) {
        const currentScroll = scrollContainerRef.current.scrollTop;
        const scrollDiff = Math.abs(currentScroll - lockedScrollTopRef.current);
        if (scrollDiff > 10) {
          scrollContainerRef.current.scrollTop = lockedScrollTopRef.current;
        }
        return;
      }
      // Prevent scroll during animation
      const currentScroll = scrollContainerRef.current.scrollTop;
      const scrollDiff = Math.abs(currentScroll - lockedScrollTopRef.current);
      if (scrollDiff > 2) {
        scrollContainerRef.current.scrollTop = lockedScrollTopRef.current;
      }
    };

    scrollContainerRef.current.addEventListener('scroll', preventScrollHandlerRef.current, { passive: false });
    console.log('🔒 SCROLL PREVENTED at position:', lockedScrollTopRef.current);
  }, [isPaused]);

  const restoreScroll = useCallback(() => {
    if (!scrollContainerRef.current || !preventScrollHandlerRef.current) return;

    scrollContainerRef.current.removeEventListener('scroll', preventScrollHandlerRef.current);
    preventScrollHandlerRef.current = null;
    console.log('🔓 SCROLL RESTORED');
  }, []);

  // Auto-play Animation Loop
  const startAutoPlay = useCallback(() => {
    if (!isAutoPlaying || !isVisible) {
      return;
    }

    // Don't start if already running
    if (autoPlayFrameIdRef.current) {
      return;
    }

    let lastFrameTime = Date.now();
    const frameInterval = 1000 / CONFIG.framesPerSecond;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        let nextFrame = currentFrameRef.current;

        if (playDirection === 'forward') {
          nextFrame += 1;

          // Check if we've reached a pause frame
          if (isPauseFrame(nextFrame)) {
            console.log(`⏸️ PAUSED at frame ${nextFrame} (forward)`);
            setIsPaused(true);
            setIsAutoPlaying(false);
            scrollAccumulatorRef.current = 0;
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            return;
          }

          // Check if we've completed the sequence
          if (nextFrame > CONFIG.totalFrames) {
            console.log('✅ SEQUENCE COMPLETE - Handing back scroll control');
            nextFrame = CONFIG.totalFrames;
            setIsAutoPlaying(false);
            setIsPaused(false);
            setHasCompletedSequence(true);
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            restoreScroll();

            // Scroll user forward to section 4 (index 3) first
            setTimeout(() => {
              scrollToSection(3, false); // Smooth scroll to section 4
              
              // Hide the WebPSequence after scroll starts (fade out during scroll)
              setTimeout(() => {
                setIsVisible(false);
                console.log('🎬 WebPSequence hidden after scroll transition');
              }, 300);
            }, 100);

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
            scrollAccumulatorRef.current = 0;
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            return;
          }

          // Check if we've reached the start
          if (nextFrame < 1) {
            console.log('⏮️ REACHED START - Stopping backward animation at frame 1');
            nextFrame = 1;
            // Stop auto-playing but keep visible - wait for user to continue scrolling
            setIsAutoPlaying(false);
            setIsPaused(false);
            // Don't reset hasCompletedSequence or hasInitialized yet
            // Don't hide the sequence yet - let user see frame 1
            currentFrameRef.current = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            
            // Restore scroll control so user can continue scrolling back
            restoreScroll();
            
            // Don't automatically scroll to section 2 - let the user continue scrolling
            // The section change handler will handle scrolling to section 2 when activeSection changes

            return;
          }
        }

        currentFrameRef.current = nextFrame;
        setCurrentFrame(nextFrame);
        if (frameImageRef.current) {
          frameImageRef.current.src = getFrameImageSrc(nextFrame);
        }
      }

      autoPlayFrameIdRef.current = requestAnimationFrame(animate);
    };

    autoPlayFrameIdRef.current = requestAnimationFrame(animate);
  }, [isAutoPlaying, isVisible, playDirection, isPauseFrame, getFrameImageSrc, restoreScroll, scrollToSection]);

  // Handle scroll events for direction control
  const handleWheel = useCallback((e) => {
    if (!isVisible) return;

    let scrollDelta = 0;
    const now = Date.now();

    if (e.deltaY !== undefined) {
      scrollDelta = e.deltaY;
    } else if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      if (lastTouchYRef.current === 0) {
        lastTouchYRef.current = touch.clientY;
        return;
      }
      scrollDelta = lastTouchYRef.current - touch.clientY;
      lastTouchYRef.current = touch.clientY;
    } else if (e.type === 'touchstart' && e.touches && e.touches.length > 0) {
      lastTouchYRef.current = e.touches[0].clientY;
      return;
    } else {
      return;
    }

    console.log('🖱️ WHEEL EVENT:', { scrollDelta, isAutoPlaying, isPaused, currentFrame });

    // Handle pause state - accumulate scroll to resume
    if (isPaused) {
      if (scrollDelta > 0) {
        scrollAccumulatorRef.current += scrollDelta;
        console.log('📊 PAUSE SCROLL DOWN:', scrollAccumulatorRef.current, 'threshold:', CONFIG.scrollThreshold);

        if (scrollAccumulatorRef.current >= CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameAfterPause = pausedFrame + 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - continuing forward to frame ${nextFrameAfterPause}`);
          setIsPaused(false);
          setIsAutoPlaying(true);
          setPlayDirection('forward');
          scrollAccumulatorRef.current = 0;
          currentFrameRef.current = nextFrameAfterPause;
          setCurrentFrame(nextFrameAfterPause);
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrc(nextFrameAfterPause);
          }
          return;
        }
      } else if (scrollDelta < 0) {
        scrollAccumulatorRef.current += scrollDelta;
        console.log('📊 PAUSE SCROLL UP:', scrollAccumulatorRef.current, 'threshold:', -CONFIG.scrollThreshold);

        if (scrollAccumulatorRef.current <= -CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameBeforePause = pausedFrame - 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - going backward to frame ${nextFrameBeforePause}`);
          setIsPaused(false);
          setIsAutoPlaying(true);
          setPlayDirection('backward');
          scrollAccumulatorRef.current = 0;
          currentFrameRef.current = nextFrameBeforePause;
          setCurrentFrame(nextFrameBeforePause);
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrc(nextFrameBeforePause);
          }
          return;
        }
      }
      return;
    }

    // Direction change during auto-play
    if (isAutoPlaying) {
      if (scrollDelta < 0 && playDirection === 'forward') {
        console.log('⏪ REVERSING - User scrolled up during forward play');
        setPlayDirection('backward');
        // Restart animation with new direction
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        return;
      } else if (scrollDelta > 0 && playDirection === 'backward') {
        console.log('⏩ FORWARD - User scrolled down during backward play');
        setPlayDirection('forward');
        // Restart animation with new direction
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        return;
      }
    }

    lastScrollTimeRef.current = now;
  }, [isVisible, isAutoPlaying, isPaused, currentFrame, playDirection, getFrameImageSrc]);

  // Section Change Handler
  useEffect(() => {
    const comingFromAbove = previousSection > activeSection;
    const comingFromBelow = previousSection < activeSection && previousSection < CONFIG.startSection;
    const isScrollingBackIntoSection = activeSection >= CONFIG.startSection && comingFromAbove;

    // Case 1: First time reaching section (scrolling down/forward from section 2)
    if (activeSection >= CONFIG.startSection && !hasInitializedRef.current && !hasCompletedSequence && !comingFromAbove) {
      console.log('🎬 INITIALIZING AUTO-PLAY - Section became active (forward)');
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('forward');
      hasInitializedRef.current = true;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      if (frameImageRef.current) {
        frameImageRef.current.src = getFrameImageSrc(1);
      }
      preventScroll();
    }
    // Case 2: Scrolling back into section from above (from section 4 OR from section 2 after backward animation)
    else if (isScrollingBackIntoSection && !isResettingRef.current) {
      console.log('🎬 RE-INITIALIZING AUTO-PLAY - Scrolling back from above (backward)');
      
      // Cancel any existing animation first
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
      
      setIsVisible(true);
      setIsAutoPlaying(true);
      setPlayDirection('backward');
      hasInitializedRef.current = true;
      setHasCompletedSequence(false);
      setIsPaused(false);
      scrollAccumulatorRef.current = 0;
      
      // Start from the last frame to rewind all frames
      currentFrameRef.current = CONFIG.totalFrames;
      setCurrentFrame(CONFIG.totalFrames);
      if (frameImageRef.current) {
        frameImageRef.current.src = getFrameImageSrc(CONFIG.totalFrames);
      }
      preventScroll();
    }
    // Case 3: Reset if user scrolls back before the section (from section 3 to section 2)
    // Only reset if we're not currently playing backward animation (let it complete first)
    else if (activeSection < CONFIG.startSection && !isResettingRef.current && !(isAutoPlaying && playDirection === 'backward')) {
      console.log('🎬 RESETTING - User scrolled before start section');
      isResettingRef.current = true;
      
      // Stop any ongoing animation first
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
      
      // Hide the sequence and reset everything
      setIsVisible(false);
      setIsAutoPlaying(false);
      setIsPaused(false);
      setHasCompletedSequence(false);
      hasInitializedRef.current = false;
      currentFrameRef.current = 1;
      setCurrentFrame(1);
      scrollAccumulatorRef.current = 0;
      
      // Only restore scroll if it was previously locked
      if (preventScrollHandlerRef.current) {
        restoreScroll();
      }
      
      // Reset the flag after a short delay to allow for future resets
      setTimeout(() => {
        isResettingRef.current = false;
      }, 300);
    }

    setPreviousSection(activeSection);
  }, [activeSection, previousSection, hasCompletedSequence, isAutoPlaying, playDirection, getFrameImageSrc, preventScroll, restoreScroll]);

  // Watch for auto-play state changes
  useEffect(() => {
    if (isAutoPlaying && isVisible) {
      // Cancel existing animation if any
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
      // Start animation after a brief delay to ensure state is updated
      const timeoutId = setTimeout(() => {
        if (isAutoPlaying && isVisible && !autoPlayFrameIdRef.current) {
          startAutoPlay();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
    }
  }, [isAutoPlaying, isVisible, playDirection, startAutoPlay]);

  // Event Listeners
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
      window.removeEventListener('touchstart', handleWheel);
    };
  }, [handleWheel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
      }
      restoreScroll();
    };
  }, [restoreScroll]);

  // Handle window resize for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < CONFIG.mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set scroll container ref
  useEffect(() => {
    const container = document.getElementById('scrollContainer') || document.querySelector('.scroll-container');
    if (container) {
      scrollContainerRef.current = container;
    }
  }, []);

  return (
    <div 
      className={`webp-sequence-container ${isVisible ? 'visible' : ''}`}
      id="webpSequenceContainer"
    >
      <img 
        ref={frameImageRef}
        id="frameImage" 
        className="webp-sequence-frame" 
        alt="Frame"
        src={getFrameImageSrc(1)}
      />
    </div>
  );
};

export default FrameSequence;

