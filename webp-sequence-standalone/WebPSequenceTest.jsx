import React, { useEffect, useRef, useState, useCallback } from 'react';
import WebPSequence from './components/WebPSequence/WebPSequence';
import VideoModal from './components/VideoModal/VideoModal';

// Config and Utils
import { CONFIG } from './config/constants';
import { 
  getTotalFrames, 
  getFrameImageSrc, 
  isPauseFrame, 
  detectMobile 
} from './utils/frameUtils';

/**
 * WebPSequenceTest - Standalone test file for WebP sequence functionality
 * 
 * This file contains only the core WebP sequence animation logic:
 * - Auto-play animation loop
 * - Pause/resume at specific frames
 * - Scroll direction control
 * - Frame navigation
 */
function WebPSequenceTest() {
  // Refs for DOM elements and animation control
  const frameImageRef = useRef(null);
  const webpSequenceContainerRef = useRef(null);
  const autoPlayFrameIdRef = useRef(null);
  const scrollAccumulatorRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const lastTouchYRef = useRef(0);
  const currentFrameRef = useRef(1);

  // Main state
  const [state, setState] = useState({
    currentFrame: 1,
    isVisible: true,
    isAutoPlaying: false, // Start paused - only start on forward scroll
    playDirection: 'forward', // 'forward' or 'backward'
    isPaused: false,
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
            console.log('✅ SEQUENCE COMPLETE');
            nextFrame = totalFrames;
            setState(prev => ({
              ...prev,
              isAutoPlaying: false,
              isPaused: false,
              currentFrame: nextFrame
            }));
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
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
            console.log('⏮️ REACHED START');
            nextFrame = 1;
            setState(prev => ({
              ...prev,
              isAutoPlaying: false,
              isPaused: false,
              currentFrame: nextFrame
            }));
            currentFrameRef.current = nextFrame;
            if (frameImageRef.current) {
              frameImageRef.current.src = getFrameImageSrcForDevice(nextFrame);
            }
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
  }, [state.isAutoPlaying, state.isVisible, state.playDirection, getTotalFramesForDevice, isPauseFrameForDevice, getFrameImageSrcForDevice]);

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

    const totalFrames = getTotalFramesForDevice();
    const isAtFirstFrame = currentFrameRef.current === 1;
    const isAtLastFrame = currentFrameRef.current >= totalFrames;

    // Boundary checks: prevent backward scroll at frame 1, forward scroll at last frame
    if (isAtFirstFrame && scrollDelta < 0) {
      console.log('🚫 At frame 1 - backward scroll ignored');
      return;
    }
    if (isAtLastFrame && scrollDelta > 0) {
      console.log('🚫 At last frame - forward scroll ignored');
      return;
    }

    // If not playing and at frame 1, start animation only on forward scroll
    if (!state.isAutoPlaying && !state.isPaused && isAtFirstFrame && scrollDelta > 0) {
      console.log('▶️ Starting animation from frame 1 on forward scroll');
      setState(prev => ({
        ...prev,
        isAutoPlaying: true,
        playDirection: 'forward'
      }));
      startAutoPlay();
      return;
    }

    // If not playing and at last frame, start animation only on backward scroll
    if (!state.isAutoPlaying && !state.isPaused && isAtLastFrame && scrollDelta < 0) {
      console.log('▶️ Starting animation from last frame on backward scroll');
      setState(prev => ({
        ...prev,
        isAutoPlaying: true,
        playDirection: 'backward'
      }));
      startAutoPlay();
      return;
    }

    // Handle pause state - accumulate scroll to resume
    if (state.isPaused) {
      if (scrollDelta > 0) {
        scrollAccumulatorRef.current += scrollDelta;
        console.log('📊 PAUSE SCROLL DOWN:', scrollAccumulatorRef.current, 'threshold:', CONFIG.scrollThreshold);

        if (scrollAccumulatorRef.current >= CONFIG.scrollThreshold) {
          const pausedFrame = currentFrameRef.current;
          // Don't allow forward if already at last frame
          if (pausedFrame >= totalFrames) {
            console.log('🚫 Already at last frame - cannot resume forward');
            scrollAccumulatorRef.current = 0;
            return;
          }
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
          // Don't allow backward if already at frame 1
          if (pausedFrame <= 1) {
            console.log('🚫 Already at frame 1 - cannot resume backward');
            scrollAccumulatorRef.current = 0;
            return;
          }
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
        // Don't allow backward at frame 1
        if (isAtFirstFrame) {
          console.log('🚫 At frame 1 - cannot reverse to backward');
          return;
        }
        console.log('⏪ REVERSING - User scrolled up during forward play');
        setState(prev => ({
          ...prev,
          playDirection: 'backward'
        }));
        scrollAccumulatorRef.current = 0;
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        startAutoPlay();
      } else if (scrollDelta > 0 && state.playDirection === 'backward') {
        // Don't allow forward at last frame
        if (isAtLastFrame) {
          console.log('🚫 At last frame - cannot reverse to forward');
          return;
        }
        console.log('⏩ FORWARD - User scrolled down during backward play');
        setState(prev => ({
          ...prev,
          playDirection: 'forward'
        }));
        scrollAccumulatorRef.current = 0;
        if (autoPlayFrameIdRef.current) {
          cancelAnimationFrame(autoPlayFrameIdRef.current);
          autoPlayFrameIdRef.current = null;
        }
        startAutoPlay();
      }
    }

    lastScrollTimeRef.current = now;
  }, [state.isVisible, state.isPaused, state.isAutoPlaying, state.playDirection, state.currentFrame, getFrameImageSrcForDevice, getTotalFramesForDevice, startAutoPlay]);

  // Initialize animation on mount
  useEffect(() => {
    // Set initial frame image
    if (frameImageRef.current) {
      frameImageRef.current.src = getFrameImageSrcForDevice(1);
    }
    if (webpSequenceContainerRef.current) {
      webpSequenceContainerRef.current.classList.add('visible');
    }
  }, [getFrameImageSrcForDevice]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayFrameIdRef.current) {
        cancelAnimationFrame(autoPlayFrameIdRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* WebP Sequence Component */}
      <WebPSequence
        webpSequenceContainerRef={webpSequenceContainerRef}
        frameImageRef={frameImageRef}
        isVisible={state.isVisible}
        shouldShowIcon={shouldShowIcon()}
        onIconClick={handleIconClick}
        currentFrame={state.currentFrame}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Debug Info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        <div>Frame: {state.currentFrame} / {getTotalFramesForDevice()}</div>
        <div>Playing: {state.isAutoPlaying ? '✓' : '✗'}</div>
        <div>Direction: {state.playDirection}</div>
        <div>Paused: {state.isPaused ? '✓' : '✗'}</div>
        <div>Visible: {state.isVisible ? '✓' : '✗'}</div>
        <div>Mobile: {isMobile ? '✓' : '✗'}</div>
      </div>
    </>
  );
}

export default WebPSequenceTest;
