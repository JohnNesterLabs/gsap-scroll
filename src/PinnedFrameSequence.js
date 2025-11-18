import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './App.css';

// Detect if mobile device
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function PinnedFrameSequence() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  const frameImageRef = useRef(null);
  const pinnedSequenceRef = useRef(null);
  const autoPlayFrameIdRef = useRef(null);
  const preventScrollHandlerRef = useRef(null);
  const lockedScrollTopRef = useRef(0);
  const startAutoPlayRef = useRef(null);
  
  // Detect mobile and set config accordingly - memoize to prevent recreation
  const isMobile = useMemo(() => isMobileDevice(), []);
  const CONFIG = useMemo(() => ({
    framesPerSecond: 15,
    scrollThreshold: 100,
    startSection: 1, // Section 2 (0-indexed: 0, 1)
    totalFrames: isMobile ? 97 : 134,
    framePrefix: 'frame_',
    frameSuffix: '.webp',
    folderPath: isMobile ? '/frames-mobile/' : '/frame-desktop/',
    pauseFrames: isMobile ? [60, 90] : [80, 120],
    totalSections: 2,
  }), [isMobile]);

  // Use refs for state that needs to be accessed in callbacks
  const stateRef = useRef({
    isAutoPlaying: false,
    playDirection: 'forward',
    hasCompletedSequence: false,
    isPaused: false,
    hasInitialized: false,
    previousSection: 0,
    scrollAccumulator: 0,
    lastTouchY: 0,
    currentFrame: 1,
  });

  const frameInterval = 1000 / CONFIG.framesPerSecond;

  // Update isVisible ref when state changes
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Format frame number with leading zeros
  function formatFrameNumber(frameNum) {
    return frameNum.toString().padStart(4, '0');
  }

  // Get frame image source
  function getFrameImageSrc(frameNum) {
    return `${CONFIG.folderPath}${CONFIG.framePrefix}${formatFrameNumber(frameNum)}${CONFIG.frameSuffix}`;
  }

  // Check if frame is a pause frame
  function isPauseFrame(frame) {
    return CONFIG.pauseFrames.includes(frame);
  }

  // Scroll to section
  const scrollToSection = useCallback((targetSection, instant = false) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollProgress = targetSection / (CONFIG.totalSections - 1);
    const targetScrollTop = targetScrollProgress * maxScroll;
    
    if (instant) {
      window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
    } else {
      window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, []);

  // Prevent scroll
  const preventScroll = useCallback(() => {
    if (preventScrollHandlerRef.current) return;
    lockedScrollTopRef.current = window.pageYOffset || document.documentElement.scrollTop;
    
    preventScrollHandlerRef.current = () => {
      const state = stateRef.current;
      if (state.isPaused) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDiff = Math.abs(currentScroll - lockedScrollTopRef.current);
        if (scrollDiff > 50) {
          window.scrollTo(0, lockedScrollTopRef.current);
        }
        return;
      }
      window.scrollTo(0, lockedScrollTopRef.current);
    };

    window.addEventListener('scroll', preventScrollHandlerRef.current, { passive: false });
  }, []);

  // Restore scroll
  const restoreScroll = useCallback(() => {
    if (!preventScrollHandlerRef.current) return;
    window.removeEventListener('scroll', preventScrollHandlerRef.current);
    preventScrollHandlerRef.current = null;
  }, []);

  // Calculate active section from scroll
  function getActiveSection() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    const scrollProgress = scrollTop / maxScroll;
    const sectionIndex = scrollProgress * (CONFIG.totalSections - 1);
    return Math.floor(sectionIndex);
  }

  // Initialize auto-play
  const initializeAutoPlay = useCallback((activeSection) => {
    const state = stateRef.current;
    const comingFromAbove = state.previousSection > activeSection && state.previousSection > CONFIG.startSection;
    
    if (activeSection >= CONFIG.startSection && !state.hasInitialized && !state.hasCompletedSequence) {
      // First time reaching section
      setIsVisible(true);
      isVisibleRef.current = true;
      state.isAutoPlaying = true;
      state.playDirection = 'forward';
      state.hasInitialized = true;
      state.currentFrame = 1;
      setCurrentFrame(1);
      if (frameImageRef.current) {
        frameImageRef.current.src = getFrameImageSrc(1);
      }
      if (pinnedSequenceRef.current) {
        pinnedSequenceRef.current.classList.add('visible');
      }
      preventScroll();
      // Start animation immediately
      setTimeout(() => {
        if (state.isAutoPlaying && !autoPlayFrameIdRef.current && startAutoPlayRef.current) {
          startAutoPlayRef.current();
        }
      }, 100);
    } else if (activeSection >= CONFIG.startSection && state.hasCompletedSequence && comingFromAbove) {
      // Scrolling back from above
      setIsVisible(true);
      isVisibleRef.current = true;
      state.isAutoPlaying = true;
      state.playDirection = 'backward';
      state.hasInitialized = true;
      state.hasCompletedSequence = false;
      state.currentFrame = CONFIG.totalFrames;
      setCurrentFrame(CONFIG.totalFrames);
      if (frameImageRef.current) {
        frameImageRef.current.src = getFrameImageSrc(CONFIG.totalFrames);
      }
      if (pinnedSequenceRef.current) {
        pinnedSequenceRef.current.classList.add('visible');
      }
      preventScroll();
      // Start animation immediately
      setTimeout(() => {
        if (state.isAutoPlaying && !autoPlayFrameIdRef.current && startAutoPlayRef.current) {
          startAutoPlayRef.current();
        }
      }, 100);
    } else if (activeSection < CONFIG.startSection) {
      // Reset
      setIsVisible(false);
      isVisibleRef.current = false;
      state.isAutoPlaying = false;
      state.isPaused = false;
      state.hasCompletedSequence = false;
      state.hasInitialized = false;
      state.currentFrame = 1;
      state.scrollAccumulator = 0;
      setCurrentFrame(1);
      if (pinnedSequenceRef.current) {
        pinnedSequenceRef.current.classList.remove('visible');
      }
      restoreScroll();
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
    }
    
    state.previousSection = activeSection;
  }, [preventScroll, restoreScroll, CONFIG]);

  // Auto-play animation loop
  const startAutoPlay = useCallback(() => {
    const state = stateRef.current;
    if (!state.isAutoPlaying || !isVisibleRef.current) {
      return;
    }

    // Cancel any existing animation
    if (autoPlayFrameIdRef.current) {
      cancelAnimationFrame(autoPlayFrameIdRef.current);
      autoPlayFrameIdRef.current = null;
    }

    let lastFrameTime = Date.now();
    let frame = state.currentFrame;

    function animate() {
      const currentState = stateRef.current;
      if (!currentState.isAutoPlaying || !isVisibleRef.current) {
        autoPlayFrameIdRef.current = null;
        return;
      }

      const now = Date.now();
      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        let nextFrame = frame;

        if (currentState.playDirection === 'forward') {
          nextFrame += 1;
          
          if (isPauseFrame(nextFrame)) {
            currentState.isPaused = true;
            currentState.isAutoPlaying = false;
            currentState.scrollAccumulator = 0;
            currentState.currentFrame = nextFrame;
            frame = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            return;
          }
          
          if (nextFrame > CONFIG.totalFrames) {
            nextFrame = CONFIG.totalFrames;
            currentState.isAutoPlaying = false;
            currentState.isPaused = false;
            currentState.hasCompletedSequence = true;
            currentState.currentFrame = nextFrame;
            frame = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            restoreScroll();
            
            setTimeout(() => scrollToSection(1.5), 100);
            setTimeout(() => {
              setIsVisible(false);
              isVisibleRef.current = false;
              if (pinnedSequenceRef.current) {
                pinnedSequenceRef.current.classList.remove('visible');
              }
            }, 900);
            autoPlayFrameIdRef.current = null;
            return;
          }
        } else {
          nextFrame -= 1;
          
          if (isPauseFrame(nextFrame)) {
            currentState.isPaused = true;
            currentState.isAutoPlaying = false;
            currentState.scrollAccumulator = 0;
            currentState.currentFrame = nextFrame;
            frame = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            autoPlayFrameIdRef.current = null;
            return;
          }
          
          if (nextFrame < 1) {
            nextFrame = 1;
            currentState.isAutoPlaying = false;
            currentState.isPaused = false;
            currentState.hasCompletedSequence = false;
            currentState.hasInitialized = false;
            currentState.currentFrame = nextFrame;
            frame = nextFrame;
            setCurrentFrame(nextFrame);
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrc(nextFrame);
            }
            restoreScroll();
            setIsVisible(false);
            isVisibleRef.current = false;
            if (pinnedSequenceRef.current) {
              pinnedSequenceRef.current.classList.remove('visible');
            }
            
            requestAnimationFrame(() => scrollToSection(0.8, true));
            autoPlayFrameIdRef.current = null;
            return;
          }
        }

        currentState.currentFrame = nextFrame;
        frame = nextFrame;
        setCurrentFrame(nextFrame);
        if (frameImageRef.current) {
          frameImageRef.current.src = getFrameImageSrc(nextFrame);
        }
      }

      if (currentState.isAutoPlaying && isVisibleRef.current) {
        autoPlayFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        autoPlayFrameIdRef.current = null;
      }
    }

    autoPlayFrameIdRef.current = requestAnimationFrame(animate);
  }, [restoreScroll, scrollToSection, CONFIG]);

  // Store startAutoPlay in ref so it can be called from initializeAutoPlay
  useEffect(() => {
    startAutoPlayRef.current = startAutoPlay;
  }, [startAutoPlay]);

  // Handle scroll events
  const handleWheel = useCallback((e) => {
    const state = stateRef.current;
    if (!isVisibleRef.current) return;

    let scrollDelta = 0;
    
    if (e.deltaY !== undefined) {
      scrollDelta = e.deltaY;
    } else if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      if (state.lastTouchY === 0) {
        state.lastTouchY = touch.clientY;
        return;
      }
      scrollDelta = state.lastTouchY - touch.clientY;
      state.lastTouchY = touch.clientY;
    } else if (e.type === 'touchstart' && e.touches && e.touches.length > 0) {
      state.lastTouchY = e.touches[0].clientY;
      return;
    } else {
      return;
    }

    // Handle pause state
    if (state.isPaused) {
      if (scrollDelta > 0) {
        state.scrollAccumulator += scrollDelta;
        if (state.scrollAccumulator >= CONFIG.scrollThreshold) {
          const pausedFrame = state.currentFrame;
          const nextFrameAfterPause = pausedFrame + 1;
          state.isPaused = false;
          state.isAutoPlaying = true;
          state.playDirection = 'forward';
          state.scrollAccumulator = 0;
          state.currentFrame = nextFrameAfterPause;
          setCurrentFrame(nextFrameAfterPause);
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrc(nextFrameAfterPause);
          }
          if (startAutoPlayRef.current) {
            startAutoPlayRef.current();
          }
        }
      } else if (scrollDelta < 0) {
        state.scrollAccumulator += scrollDelta;
        if (state.scrollAccumulator <= -CONFIG.scrollThreshold) {
          const pausedFrame = state.currentFrame;
          const nextFrameBeforePause = pausedFrame - 1;
          state.isPaused = false;
          state.isAutoPlaying = true;
          state.playDirection = 'backward';
          state.scrollAccumulator = 0;
          state.currentFrame = nextFrameBeforePause;
          setCurrentFrame(nextFrameBeforePause);
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrc(nextFrameBeforePause);
          }
          if (startAutoPlayRef.current) {
            startAutoPlayRef.current();
          }
        }
      }
      return;
    }

    // Direction change during auto-play
    if (state.isAutoPlaying) {
      if (scrollDelta < 0 && state.playDirection === 'forward') {
        state.playDirection = 'backward';
      } else if (scrollDelta > 0 && state.playDirection === 'backward') {
        state.playDirection = 'forward';
      }
    }
  }, [isVisible, startAutoPlay]);

  useEffect(() => {
    // Scroll listener
    function handleScroll() {
      const activeSection = getActiveSection();
      initializeAutoPlay(activeSection);
      
      const state = stateRef.current;
      if (state.isAutoPlaying && !autoPlayFrameIdRef.current && isVisibleRef.current && startAutoPlayRef.current) {
        startAutoPlayRef.current();
      }
    }

    // Wheel and touch listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleWheel, { passive: true });

    // Initialize
    const initialSection = getActiveSection();
    initializeAutoPlay(initialSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
      window.removeEventListener('touchstart', handleWheel);
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
      restoreScroll();
    };
  }, [initializeAutoPlay, handleWheel, startAutoPlay, restoreScroll]);

  return (
    <div 
      className="pinned-frame-sequence-container" 
      id="pinnedSequence"
      ref={pinnedSequenceRef}
    >
      <img 
        className="pinned-frame-sequence-image" 
        id="frameImage"
        ref={frameImageRef}
        src={getFrameImageSrc(currentFrame)} 
        alt="Frame sequence"
      />
    </div>
  );
}

export default PinnedFrameSequence;
