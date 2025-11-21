import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

// Components
import ScrollContainer from './components/ScrollContainer/ScrollContainer';
import Section from './components/Section/Section';
import WebPSequence from './components/WebPSequence/WebPSequence';
import VideoModal from './components/VideoModal/VideoModal';
import DebugInfo from './components/DebugInfo/DebugInfo';

// Config and Utils
import { CONFIG } from './config/constants';
import { 
  getTotalFrames, 
  getFrameImageSrc, 
  isPauseFrame, 
  detectMobile 
} from './utils/frameUtils';

function App() {
  const scrollContainerRef = useRef(null);
  const frameImageRef = useRef(null);
  const webpSequenceContainerRef = useRef(null);
  const autoPlayFrameIdRef = useRef(null);
  const preventScrollHandlerRef = useRef(null);
  const scrollAccumulatorRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const lastTouchYRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const currentFrameRef = useRef(1);
  const lockedScrollTopRef = useRef(0);

  const [state, setState] = useState({
    currentFrame: 1,
    isVisible: false,
    isAutoPlaying: false,
    playDirection: 'forward', // 'forward' or 'backward'
    hasCompletedSequence: false,
    isPaused: false,
    activeSection: 0,
    previousSection: 0
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(detectMobile());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper Functions
  const getTotalFramesForDevice = useCallback(() => {
    return getTotalFrames(isMobile);
  }, [isMobile]);

  const getFrameImageSrcForDevice = useCallback((frameNum) => {
    return getFrameImageSrc(frameNum, isMobile);
  }, [isMobile]);

  const isPauseFrameForDevice = useCallback((frame) => {
    return isPauseFrame(frame, isMobile);
  }, [isMobile]);

  // Check if current frame should show clickable icon
  const shouldShowIcon = useCallback(() => {
    return state.isPaused && state.isVisible && isPauseFrameForDevice(state.currentFrame);
  }, [state.isPaused, state.isVisible, state.currentFrame, isPauseFrameForDevice]);

  // Handle icon click to open modal
  const handleIconClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Section Tracking
  const getActiveSection = useCallback(() => {
    if (!scrollContainerRef.current) return 0;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const sectionHeight = window.innerHeight;
    const sectionIndex = Math.round(scrollTop / sectionHeight);
    return Math.min(sectionIndex, 2); // Max 2 sections (0, 1, 2) - Section 1, Section 2 (Frame), Section 3 (Footer)
  }, []);

  // Check if section 2 (frame animation) is fully visible (takes full viewport)
  const isSection2FullyVisible = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const sectionHeight = window.innerHeight;
    // Section 2 starts at 1 * sectionHeight (after section 1), so it's fully visible when scrollTop >= 1 * sectionHeight
    return scrollTop >= 1 * sectionHeight;
  }, []);

  // Check if section 2 should trigger animation (configurable trigger point)
  const isSection2Triggered = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const sectionHeight = window.innerHeight;
    // Section 2 normally starts at 1 * sectionHeight
    // animationTriggerOffset allows starting before/after section 2 begins
    // Example: offset -0.2 means trigger at 0.8 * sectionHeight (20% before section 2)
    const triggerPoint = (1 + CONFIG.animationTriggerOffset) * sectionHeight;
    return scrollTop >= triggerPoint;
  }, []);

  // Scroll Control
  const scrollToSection = useCallback((targetSection, instant = false) => {
    if (!scrollContainerRef.current) return;

    const totalSections = 3; // Section 1, Section 2 (Frame), Section 3 (Footer)
    const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    const targetScrollProgress = targetSection / (totalSections - 1);
    const targetScrollTop = targetScrollProgress * maxScroll;

    if (instant) {
      const originalScrollBehavior = scrollContainerRef.current.style.scrollBehavior;
      scrollContainerRef.current.style.scrollBehavior = 'auto';
      scrollContainerRef.current.scrollTop = targetScrollTop;
      requestAnimationFrame(() => {
        scrollContainerRef.current.style.scrollBehavior = originalScrollBehavior;
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
      const currentScroll = scrollContainerRef.current.scrollTop;
      const scrollDiff = Math.abs(currentScroll - lockedScrollTopRef.current);
      
      // Allow small scroll movement (100px) to detect scroll direction changes
      // This enables wheel events to be processed for direction reversal
      if (scrollDiff > 100) {
        scrollContainerRef.current.scrollTop = lockedScrollTopRef.current;
      }
    };

    scrollContainerRef.current.addEventListener('scroll', preventScrollHandlerRef.current, { passive: false });
    console.log('🔒 SCROLL PREVENTED at position:', lockedScrollTopRef.current);
  }, []);

  const restoreScroll = useCallback(() => {
    if (!scrollContainerRef.current || !preventScrollHandlerRef.current) return;

    scrollContainerRef.current.removeEventListener('scroll', preventScrollHandlerRef.current);
    preventScrollHandlerRef.current = null;
    console.log('🔓 SCROLL RESTORED');
  }, []);

  // Auto-play Animation Loop
  const startAutoPlay = useCallback(() => {
    if (!state.isAutoPlaying || !state.isVisible || !frameImageRef.current) {
      return;
    }

    // Don't start if already running
    if (autoPlayFrameIdRef.current) {
      return;
    }

    const totalFrames = getTotalFramesForDevice();
    let lastFrameTime = Date.now();
    const frameInterval = 1000 / CONFIG.framesPerSecond;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        let nextFrame = currentFrameRef.current;

        if (state.playDirection === 'forward') {
          nextFrame += 1;

          // Check if we've reached a pause frame
          if (isPauseFrameForDevice(nextFrame)) {
            console.log(`⏸️ PAUSED at frame ${nextFrame} (forward)`);
            setState(prev => ({
              ...prev,
              isPaused: true,
              isAutoPlaying: false,
              currentFrame: nextFrame
            }));
            scrollAccumulatorRef.current = 0;
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
            autoPlayFrameIdRef.current = null;
            return;
          }

          // Check if we've completed the sequence
          if (nextFrame > totalFrames) {
            console.log('✅ SEQUENCE COMPLETE - Handing back scroll control');
            nextFrame = totalFrames;
            setState(prev => ({
              ...prev,
              isAutoPlaying: false,
              isPaused: false,
              hasCompletedSequence: true,
              currentFrame: nextFrame
            }));
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
            restoreScroll();

            // Hide WebPSequence instantly (no fade-out)
            setState(prev => ({
              ...prev,
              isVisible: false
            }));
            if (webpSequenceContainerRef.current) {
              webpSequenceContainerRef.current.classList.remove('visible');
            }

            // Scroll user forward to section 3 (footer) instantly to avoid showing any background
            scrollToSection(2, true); // Section 3 (footer) is at index 2, true = instant scroll

            autoPlayFrameIdRef.current = null;
            return;
          }
        } else {
          // Backward
          nextFrame -= 1;

          // Check if we've reached a pause frame
          if (isPauseFrameForDevice(nextFrame)) {
            console.log(`⏸️ PAUSED at frame ${nextFrame} (backward)`);
            setState(prev => ({
              ...prev,
              isPaused: true,
              isAutoPlaying: false,
              currentFrame: nextFrame
            }));
            scrollAccumulatorRef.current = 0;
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
            autoPlayFrameIdRef.current = null;
            return;
          }

          // Check if we've reached the start
          if (nextFrame < 1) {
            console.log('⏮️ REACHED START - Resetting and restoring scroll control');
            nextFrame = 1;
            setState(prev => ({
              ...prev,
              isAutoPlaying: false,
              isPaused: false,
              hasCompletedSequence: false,
              isVisible: false,
              currentFrame: nextFrame
            }));
            hasInitializedRef.current = false;
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
            
            // Hide the WebPSequence FIRST before scrolling
            if (webpSequenceContainerRef.current) {
              webpSequenceContainerRef.current.classList.remove('visible');
            }

            // Restore scroll control
            restoreScroll();

            // Wait a bit to ensure scroll lock is fully removed, then scroll to section 1 completely
            setTimeout(() => {
              scrollToSection(0, true); // Scroll to section 1 (index 0) completely - true = instant scroll
            }, 100);

            autoPlayFrameIdRef.current = null;
            return;
          }
        }

        currentFrameRef.current = nextFrame;
        setState(prev => ({
          ...prev,
          currentFrame: nextFrame
        }));
        if (frameImageRef.current) {
          frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
        }
      }

      autoPlayFrameIdRef.current = requestAnimationFrame(animate);
    };

    autoPlayFrameIdRef.current = requestAnimationFrame(animate);
  }, [state.isAutoPlaying, state.isVisible, state.playDirection, getTotalFramesForDevice, isPauseFrameForDevice, getFrameImageSrcForDevice, restoreScroll, scrollToSection]);

  // Handle scroll events for direction control
  const handleWheel = useCallback((e) => {
    if (!state.isVisible) return;

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

    console.log('🖱️ WHEEL EVENT:', { scrollDelta, isAutoPlaying: state.isAutoPlaying, isPaused: state.isPaused, currentFrame: state.currentFrame });

    // Handle pause state - accumulate scroll to resume
    if (state.isPaused) {
      if (scrollDelta > 0) {
        scrollAccumulatorRef.current += scrollDelta;
        console.log('📊 PAUSE SCROLL DOWN:', scrollAccumulatorRef.current, 'threshold:', CONFIG.scrollThreshold);

        if (scrollAccumulatorRef.current >= CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameAfterPause = pausedFrame + 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - continuing forward to frame ${nextFrameAfterPause}`);
          setState(prev => ({
            ...prev,
            isPaused: false,
            isAutoPlaying: true,
            playDirection: 'forward',
            currentFrame: nextFrameAfterPause
          }));
          scrollAccumulatorRef.current = 0;
          currentFrameRef.current = nextFrameAfterPause;
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrcForDevice(nextFrameAfterPause);
          }
          startAutoPlay();
        }
      } else if (scrollDelta < 0) {
        scrollAccumulatorRef.current += scrollDelta;
        console.log('📊 PAUSE SCROLL UP:', scrollAccumulatorRef.current, 'threshold:', -CONFIG.scrollThreshold);

        if (scrollAccumulatorRef.current <= -CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          const nextFrameBeforePause = pausedFrame - 1;
          console.log(`▶️ RESUMING from pause at frame ${pausedFrame} - going backward to frame ${nextFrameBeforePause}`);
          setState(prev => ({
            ...prev,
            isPaused: false,
            isAutoPlaying: true,
            playDirection: 'backward',
            currentFrame: nextFrameBeforePause
          }));
          scrollAccumulatorRef.current = 0;
          currentFrameRef.current = nextFrameBeforePause;
          if (frameImageRef.current) {
            frameImageRef.current.src = getFrameImageSrcForDevice(nextFrameBeforePause);
          }
          startAutoPlay();
        }
      }
      return;
    }

    // Direction change during auto-play
    if (state.isAutoPlaying && !state.isPaused) {
      if (scrollDelta < 0 && state.playDirection === 'forward') {
        console.log('⏪ REVERSING - User scrolled up during forward play');
        setState(prev => ({
          ...prev,
          playDirection: 'backward'
        }));
        scrollAccumulatorRef.current = 0; // Reset accumulator on direction change
        // Restart animation with new direction
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        startAutoPlay();
      } else if (scrollDelta > 0 && state.playDirection === 'backward') {
        console.log('⏩ FORWARD - User scrolled down during backward play');
        setState(prev => ({
          ...prev,
          playDirection: 'forward'
        }));
        scrollAccumulatorRef.current = 0; // Reset accumulator on direction change
        // Restart animation with new direction
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        startAutoPlay();
      }
    }

    lastScrollTimeRef.current = now;
  }, [state.isVisible, state.isPaused, state.isAutoPlaying, state.playDirection, state.currentFrame, getFrameImageSrcForDevice, startAutoPlay]);

  // Section Change Handler
  const handleSectionChange = useCallback(() => {
    const previousSection = state.previousSection;
    const comingFromAbove = previousSection > state.activeSection && previousSection > CONFIG.startSection;
    const section2FullyVisible = isSection2FullyVisible();
    const section2Triggered = isSection2Triggered();
    const totalFrames = getTotalFramesForDevice();

    // Case 1: First time reaching section (scrolling down/forward)
    // Start when section 2 reaches the configurable trigger point
    if (state.activeSection >= CONFIG.startSection && section2Triggered && !hasInitializedRef.current && !state.hasCompletedSequence) {
      console.log('🎬 INITIALIZING AUTO-PLAY - Section 2 trigger point reached (forward)');
      setState(prev => ({
        ...prev,
        isVisible: true,
        isAutoPlaying: true,
        playDirection: 'forward',
        currentFrame: 1
      }));
      hasInitializedRef.current = true;
      currentFrameRef.current = 1;
      if (webpSequenceContainerRef.current) {
        webpSequenceContainerRef.current.classList.add('visible');
      }
      if (frameImageRef.current) {
        frameImageRef.current.src = getFrameImageSrcForDevice(1);
      }
      preventScroll();
    }
    // Case 2: Scrolling back into section from above (after completion)
    // Only start when section 2 is FULLY visible - DO NOT start during transition
    // Make sure we're definitely in section 2 (not transitioning) and coming from section 3
    else if (state.activeSection === CONFIG.startSection && section2FullyVisible && state.hasCompletedSequence && comingFromAbove && previousSection === 2) {
      // Additional check: ensure scrollTop is at or very close to section 2's start position
      // This prevents animation from starting during the half-half transition
      const scrollTop = scrollContainerRef.current.scrollTop;
      const sectionHeight = window.innerHeight;
      const section2Start = 1 * sectionHeight; // Section 2 starts after section 1
      // Only start if we're at the start of section 2 (within 50px tolerance to account for smooth scrolling)
      // This ensures section 2 takes the full viewport, not half-half with section 3
      if (scrollTop >= section2Start && scrollTop <= section2Start + 50) {
        console.log('🎬 RE-INITIALIZING AUTO-PLAY - Scrolling back from section 3, Section 2 fully visible');
        setState(prev => ({
          ...prev,
          isVisible: true,
          isAutoPlaying: true,
          playDirection: 'backward',
          hasCompletedSequence: false,
          currentFrame: totalFrames
        }));
        hasInitializedRef.current = true;
        currentFrameRef.current = totalFrames;
        if (webpSequenceContainerRef.current) {
          webpSequenceContainerRef.current.classList.add('visible');
        }
        if (frameImageRef.current) {
          frameImageRef.current.src = getFrameImageSrcForDevice(totalFrames);
        }
        preventScroll();
      }
    }
    // Case 3: Reset if user scrolls back before the section or section 2 trigger point
    else if (state.activeSection < CONFIG.startSection || (state.activeSection >= CONFIG.startSection && !section2Triggered)) {
      // If we're in section 2 but not at trigger point, make sure animation doesn't start
      if (state.activeSection >= CONFIG.startSection && !section2Triggered && hasInitializedRef.current) {
        // Don't reset, just ensure animation is not playing during transition
        // Keep scroll locked - don't restore it (matches HTML behavior)
        if (state.isAutoPlaying) {
          console.log('⏸️ PAUSING - Section 2 not fully visible during transition');
          setState(prev => ({
            ...prev,
            isAutoPlaying: false
          }));
          if (autoPlayFrameIdRef.current) {
            cancelAnimationFrame(autoPlayFrameIdRef.current);
            autoPlayFrameIdRef.current = null;
          }
          // Don't restore scroll here - keep it locked during transition
          // This matches the HTML behavior
        }
      }
      // Only reset if we're not in section 2 at all
      else if (hasInitializedRef.current && state.activeSection < CONFIG.startSection) {
        console.log('🎬 RESETTING - User scrolled before start section');
        setState(prev => ({
          ...prev,
          isVisible: false,
          isAutoPlaying: false,
          isPaused: false,
          hasCompletedSequence: false,
          currentFrame: 1
        }));
        hasInitializedRef.current = false;
        currentFrameRef.current = 1;
        scrollAccumulatorRef.current = 0;
        if (webpSequenceContainerRef.current) {
          webpSequenceContainerRef.current.classList.remove('visible');
        }
        restoreScroll();
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        // Ensure we're scrolled to section 1 completely
        setTimeout(() => {
          scrollToSection(0, true);
        }, 100);
      }
    }
  }, [state.activeSection, state.previousSection, state.hasCompletedSequence, state.isAutoPlaying, isSection2FullyVisible, isSection2Triggered, getTotalFramesForDevice, getFrameImageSrcForDevice, preventScroll, restoreScroll]);

  // Update active section
  const updateActiveSection = useCallback(() => {
    const newSection = getActiveSection();
    if (newSection !== state.activeSection) {
      setState(prev => ({
        ...prev,
        previousSection: prev.activeSection,
        activeSection: newSection
      }));
      // Use setTimeout to ensure state is updated before calling handleSectionChange
      setTimeout(() => {
        handleSectionChange();
      }, 0);
    }
  }, [state.activeSection, getActiveSection, handleSectionChange]);

  // Watch for auto-play state changes
  useEffect(() => {
    if (state.isAutoPlaying && state.isVisible) {
      if (!autoPlayFrameIdRef.current) {
        startAutoPlay();
      }
    } else {
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
        autoPlayFrameIdRef.current = null;
      }
    }
  }, [state.isAutoPlaying, state.isVisible, startAutoPlay]);

  // Safety check: Ensure scroll is restored when animation is not active
  // BUT keep scroll locked if we're paused (user needs to scroll to resume)
  // Only restore scroll when we're completely out of section 2
  useEffect(() => {
    // If scroll is prevented, check if we should restore it
    if (preventScrollHandlerRef.current) {
      const inSection2 = state.activeSection === CONFIG.startSection;
      
      // Only restore scroll if:
      // 1. We're not in section 2 at all, OR
      // 2. We're in section 2 but animation is not active AND not paused AND not visible
      // Keep scroll locked if paused - user needs to scroll to resume
      // Keep scroll locked if visible - animation might be active
      const shouldRestore = !inSection2 || (!state.isAutoPlaying && !state.isPaused && !state.isVisible && !hasInitializedRef.current);
      
      if (shouldRestore) {
        console.log('🔓 SAFETY: Restoring scroll - safe to restore', {
          inSection2,
          isAutoPlaying: state.isAutoPlaying,
          isPaused: state.isPaused,
          isVisible: state.isVisible,
          hasInitialized: hasInitializedRef.current
        });
        restoreScroll();
        // Also fix state inconsistency
        if (!state.isVisible && state.isAutoPlaying) {
          setState(prev => ({
            ...prev,
            isAutoPlaying: false,
            isPaused: false
          }));
        }
      }
    }
  }, [state.isAutoPlaying, state.isPaused, state.isVisible, state.activeSection, restoreScroll]);

  // Scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      updateActiveSection();
      const section2Triggered = isSection2Triggered();
      const section2FullyVisible = isSection2FullyVisible();
      // Check if we're coming from section 3 (index 2) - scrolling back
      const comingFromSection3 = state.previousSection === 2 && state.activeSection === CONFIG.startSection;
      
      // Continuously check if section 2 reaches trigger point during scroll
      // This ensures animation starts at the configurable trigger point
      // Forward case: first time reaching section 2 trigger point
      if (state.activeSection >= CONFIG.startSection && section2Triggered && !hasInitializedRef.current && !state.hasCompletedSequence) {
        handleSectionChange();
      }
      // Backward case: scrolling back from section 3 to section 2
      // Only start animation when section 2 is FULLY visible, not during transition
      else if (state.activeSection === CONFIG.startSection && section2FullyVisible && state.hasCompletedSequence && comingFromSection3 && !state.isAutoPlaying) {
        // Additional check: ensure we're at the start of section 2, not in transition
        const scrollTop = scrollContainer.scrollTop;
        const sectionHeight = window.innerHeight;
        const section2Start = 1 * sectionHeight; // Section 2 starts after section 1
        // Only trigger if we're at the start of section 2 (within 50px tolerance)
        if (scrollTop >= section2Start && scrollTop <= section2Start + 50) {
          handleSectionChange();
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [state.activeSection, state.previousSection, state.hasCompletedSequence, state.isAutoPlaying, updateActiveSection, isSection2FullyVisible, handleSectionChange]);

  // Wheel and touch events for frame control
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

  // Initial setup
  useEffect(() => {
    updateActiveSection();
  }, [updateActiveSection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
      }
      restoreScroll();
    };
  }, [restoreScroll]);

  return (
    <div className="App">
      <ScrollContainer scrollContainerRef={scrollContainerRef}>
        <Section className="section-1">
          <video
            className="section-1-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/hero4.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Section>
        <Section 
          className="section-2" 
          id="frameSection"
        >
          {/* Section 2 - Frame Animation */}
        </Section>
        <Section className="section-3">
          <div>
            <a 
              href="about:blank" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Section 3 - Footer
            </a>
          </div>
        </Section>
      </ScrollContainer>

      <WebPSequence
        webpSequenceContainerRef={webpSequenceContainerRef}
        frameImageRef={frameImageRef}
        isVisible={state.isVisible}
        shouldShowIcon={shouldShowIcon()}
        onIconClick={handleIconClick}
      />

      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <DebugInfo
        activeSection={state.activeSection}
        currentFrame={state.currentFrame}
        isAutoPlaying={state.isAutoPlaying}
        playDirection={state.playDirection}
        isPaused={state.isPaused}
        isVisible={state.isVisible}
        isMobile={isMobile}
        totalFrames={getTotalFramesForDevice()}
      />
    </div>
  );
}

export default App;
