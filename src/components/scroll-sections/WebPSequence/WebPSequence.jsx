import React, { useState, useEffect, useRef } from 'react';
import './WebPSequence.css';

const WebPSequence = ({
  startSection = 4, // Configurable start section (4 or 5)
  totalFrames = 300, // Adjust based on converted WebP frames
  framePrefix = 'mobile_frame_',
  frameSuffix = '.webp',
  folderPath = '/frames-mobile/', // New folder for mobile WebP frames
  activeSection,
  sectionProgress,
  // Scroll stop functionality
  stopFrame = 200, // Frame to stop at (equivalent to frame 234 in desktop)
  timelineDuration = 5000, // 5 seconds in milliseconds
  timelinePosition = { top: '50%', left: '50%' }, // Customizable timeline position
  playButtonPosition = { top: '60%', left: '50%' }, // Customizable play button position
  onTimelineComplete, // Callback when timeline completes
  onPlayButtonClick, // Callback when play button is clicked
  // Video popup props
  videoSrc = '/Final-Ticket-1-(WIP).mp4', // Default video source for popup
  showVideoPopup = true, // Whether to show video popup on continue
  isVideoPreloaded = false, // Whether the video has been preloaded
  videoPreloadProgress = 0, // Video preload progress percentage
  // Scroll sensitivity control - CONTROLLED
  scrollSensitivity = 1.0, // Full speed - no limiting whatsoever
  maxFrameJump = 2, // Maximum frames to jump at once
  frameUpdateRate = 33 // Frame update rate in ms
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [allowSmoothScrolling, setAllowSmoothScrolling] = useState(true); // Always allow smooth scrolling
  const imgRef = useRef(null);

  // Frame rate limiting and smooth scrolling
  const lastFrameUpdateRef = useRef(0);
  const targetFrameRef = useRef(1);

  // Debug logging for all state changes
  useEffect(() => {
    console.log('📱 WEBP SEQUENCE STATE CHANGE:', {
      currentFrame,
      stopFrame,
      hasWatchedVideo,
      allowSmoothScrolling,
      showPlayButton,
      isVisible,
      activeSection,
      sectionProgress
    });
  }, [currentFrame, stopFrame, hasWatchedVideo, allowSmoothScrolling, showPlayButton, isVisible, activeSection, sectionProgress]);

  // Smooth frame calculation with throttling and frame rate limiting
  useEffect(() => {
    if (activeSection >= startSection) {
      // Calculate target frame based on section progress
      const sectionOffset = activeSection - startSection;
      const progressInSection = sectionProgress;
      // Total progress across all sections from start section
      const totalProgress = sectionOffset + progressInSection;

      // Apply scroll sensitivity to control frame progression speed
      const adjustedProgress = totalProgress * scrollSensitivity;

      // CONTROLLED SCROLL - Apply scroll sensitivity for smooth frame progression
      // Map adjustedProgress to frame range with scroll sensitivity control
      const targetFrameIndex = Math.floor(adjustedProgress * (totalFrames - 1));
      let targetFrame = Math.max(1, Math.min(totalFrames, targetFrameIndex + 1));

      // DISABLED: Scroll stop logic - allow continuous scrolling through all frames
      // The WebP sequence should not stop scrolling at any frame
      // CTA buttons will be shown on appropriate frames without stopping scroll
      console.log('🚀 WebP: Continuous scrolling enabled - no scroll stopping');

      // Store target frame for smooth interpolation
      targetFrameRef.current = targetFrame;

      // Hide WebP sequence after completing all frames
      if (targetFrame >= totalFrames) {
        setIsVisible(false);
        // Reset all WebP sequence states when completed
        setShowPlayButton(false);
        return;
      } else {
        setIsVisible(true);
      }
    } else {
      // User scrolled back to before start section - hide WebP sequence
      setIsVisible(false);
      setCurrentFrame(1);
      targetFrameRef.current = 1;
      setShowPlayButton(false);
    }
  }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, allowSmoothScrolling, hasWatchedVideo, showPlayButton]);

  // Smooth frame interpolation with frame rate limiting
  useEffect(() => {
    let animationId;

    const updateFrame = () => {
      const now = Date.now();

      // Throttle frame updates to prevent skipping
      if (now - lastFrameUpdateRef.current < frameUpdateRate) {
        animationId = requestAnimationFrame(updateFrame);
        return;
      }

      const targetFrame = targetFrameRef.current;
      const currentDisplayFrame = currentFrame;

      // Limit maximum frame jump to prevent skipping
      const frameDifference = Math.abs(targetFrame - currentDisplayFrame);
      if (frameDifference > maxFrameJump) {
        // Smooth interpolation to target frame
        const direction = currentDisplayFrame < targetFrame ? 1 : -1;
        const newFrame = currentDisplayFrame + (direction * maxFrameJump);
        setCurrentFrame(newFrame);
      } else {
        setCurrentFrame(targetFrame);
      }

      lastFrameUpdateRef.current = now;

      // Continue animation loop
      if (isVisible) {
        animationId = requestAnimationFrame(updateFrame);
      }
    };

    if (isVisible) {
      updateFrame();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, currentFrame, maxFrameJump, frameUpdateRate]);

  // Enhanced console debugging for frame sequence
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isVisible) {
      const isMobile = framePrefix === 'mobile_frame_';
      const ctaStart = isMobile ? 320 : 234;
      const ctaEnd = isMobile ? 420 : 334;
      const isCTAZone = currentFrame >= ctaStart && currentFrame <= ctaEnd;

      const frameInfo = {
        currentFrame: currentFrame,
        targetFrame: targetFrameRef.current,
        totalFrames: totalFrames,
        framePrefix: framePrefix,
        isMobile: isMobile,
        isCTAZone: isCTAZone,
        frameType: isCTAZone ? 'CTA_ZONE' : 'SMOOTH_SCROLL',
        scrollSettings: {
          scrollSensitivity: scrollSensitivity,
          maxFrameJump: maxFrameJump,
          frameUpdateRate: frameUpdateRate + 'ms'
        },
        sectionInfo: {
          activeSection,
          startSection,
          sectionProgress: (sectionProgress * 100).toFixed(1) + '%'
        },
        scrollState: {
          allowSmoothScrolling,
          showPlayButton,
          hasWatchedVideo
        }
      };

      console.log('🎬 SMOOTH FRAME SEQUENCE DEBUG:', frameInfo);

      // Special logging for CTA zone
      if (isCTAZone) {
        console.log(`🎯 CTA ZONE: Frame ${currentFrame} - CTA button visible (${isMobile ? 'mobile' : 'desktop'} duplicate zone)`);
      }
    }
  }, [currentFrame, isVisible, activeSection, sectionProgress, startSection, totalFrames, framePrefix, allowSmoothScrolling, showPlayButton, hasWatchedVideo]);

  // DISABLED: Play button logic for scroll stopping - continuous scroll is enabled
  // CTA buttons will be shown based on frame ranges without stopping scroll

  // REMOVED: Scroll prevention cleanup - not needed for continuous scrolling

  // Format frame number with leading zeros
  const formatFrameNumber = (frameNum) => {
    return frameNum.toString().padStart(4, '0');
  };

  // Get the actual frame image to display (handles frame duplication for mobile)
  const getFrameImageSrc = (frameNum) => {
    // For mobile frames 321-420, use frame 320 image (duplicate zone)
    if (framePrefix === 'mobile_frame_' && frameNum >= 321 && frameNum <= 420) {
      return `${folderPath}${framePrefix}0320${frameSuffix}`;
    }

    // For mobile frames 421-1367, duplicate each frame from 420-587 by 5 times for smooth scrolling
    if (framePrefix === 'mobile_frame_' && frameNum >= 421) {
      // Calculate which original frame this corresponds to
      // Frames 421-1367 map to original frames 420-587, each duplicated 5 times
      const originalFrameStart = 420; // Start of the range to duplicate
      const originalFrameEnd = 587;   // End of the range to duplicate
      const duplicatesPerFrame = 5;   // Each frame duplicated 5 times

      // Calculate which original frame this virtual frame corresponds to
      const virtualFrameIndex = frameNum - 420; // 0-based index from frame 421
      const originalFrameIndex = Math.floor(virtualFrameIndex / duplicatesPerFrame);
      const originalFrame = originalFrameStart + originalFrameIndex;

      // Ensure we don't go beyond the original frame range
      const clampedOriginalFrame = Math.min(originalFrame, originalFrameEnd);

      return `${folderPath}${framePrefix}${formatFrameNumber(clampedOriginalFrame)}${frameSuffix}`;
    }

    // For all other frames, use the actual frame number
    return `${folderPath}${framePrefix}${formatFrameNumber(frameNum)}${frameSuffix}`;
  };

  // Calculate if play button should be shown - mobile shows on frames 320-420, desktop on 234-334
  const shouldShowPlayButton = () => {
    let showOnDuplicateZone = false;

    if (framePrefix === 'mobile_frame_') {
      // Mobile: Show CTA on frames 320-420 (duplicate zone)
      showOnDuplicateZone = currentFrame >= 320 && currentFrame <= 420 && isVisible;
    } else {
      // Desktop: Show CTA on frames 234-334 (duplicate zone)
      showOnDuplicateZone = currentFrame >= 234 && currentFrame <= 334 && isVisible;
    }

    const result = showOnDuplicateZone;
    console.log('📱 shouldShowPlayButton calculation:', {
      currentFrame,
      isVisible,
      framePrefix,
      showOnDuplicateZone,
      result
    });
    return result;
  };

  // Simple check for Continue CTA visibility - mobile shows on frames 320-420, desktop on 234-334
  const isContinueCTAVisible = () => {
    let visible = false;

    if (framePrefix === 'mobile_frame_') {
      // Mobile: Show CTA on frames 320-420
      visible = currentFrame >= 320 && currentFrame <= 420 && isVisible;
    } else {
      // Desktop: Show CTA on frames 234-334
      visible = currentFrame >= 234 && currentFrame <= 334 && isVisible;
    }

    console.log('📱 Continue CTA Visibility Check:', {
      currentFrame,
      isVisible,
      framePrefix,
      visible
    });
    return visible;
  };

  // REMOVED: Scroll prevention functions - not needed for continuous scrolling
  // The WebP sequence now allows unlimited scrolling through all frames

  // Ensure no scroll prevention handlers are active
  useEffect(() => {
    const scrollContainer = document.querySelector('.demo-scroll-container');
    if (scrollContainer) {
      // Remove any existing scroll prevention handlers
      if (scrollContainer.dataset.scrollHandler === 'true') {
        console.log('🧹 Removing existing scroll prevention handler');
        delete scrollContainer.dataset.maxScrollTop;
        delete scrollContainer.dataset.scrollHandler;
      }
      console.log('🧹 WebP sequence initialized with continuous scroll enabled');
    }
  }, []);

  // Timeline management removed - no longer needed

  // Handle play button click - simplified for frames 234-334
  const handlePlayButtonClick = () => {
    console.log('📱 CTA clicked on frame:', currentFrame);
    if (showVideoPopup && videoSrc) {
      // Check if video is preloaded before showing popup
      if (isVideoPreloaded) {
        console.log('📱 Video is preloaded - showing popup immediately');
        setShowVideoModal(true);
      } else {
        console.log('📱 Video not yet preloaded - showing popup anyway (will load on demand)');
        setShowVideoModal(true);
      }
    }
    if (onPlayButtonClick) {
      onPlayButtonClick();
    }
    // Note: No scroll stopping - continuous scroll is enabled
  };

  // Handle video popup close
  const handleVideoModalClose = () => {
    console.log('📱 WebP Video modal close button clicked - closing video popup');
    setShowVideoModal(false);
    // Mark that user has watched the video once
    setHasWatchedVideo(true);
    // Note: Continuous scroll is always enabled
    console.log('📱 Video closed - continuous scrolling remains enabled');
  };

  // Handle image loading errors
  const handleImageError = () => {
    console.warn(`📱 Failed to load WebP frame ${currentFrame}`);
  };

  // Handle image load success
  const handleImageLoad = () => {
    // Image loaded successfully
  };

  if (!isVisible) {
    return null;
  }

  const imageSrc = getFrameImageSrc(currentFrame);

  // Use preloaded image if available, otherwise fall back to src
  const preloadedImg = window.preloadedImages && window.preloadedImages.get(imageSrc);

  return (
    <div className="webp-sequence-container">
      <img
        ref={imgRef}
        src={preloadedImg ? preloadedImg.src : imageSrc}
        alt={`Mobile WebP Frame ${currentFrame}`}
        className="webp-sequence-frame"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          // Optimize rendering for preloaded images
          willChange: preloadedImg ? 'auto' : 'transform',
        }}
      />

      {/* Timeline Overlay removed - no longer needed */}

      {(shouldShowPlayButton() || isContinueCTAVisible()) && (
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
            aria-label="Continue scrolling"
          >
            Click To Enter Ticket No. 1535
          </button>
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

      {/* Troubleshooting Map Text Overlay - Visible from frame 4 to frame 50 */}
      {currentFrame >= 4 && currentFrame <= 100 && (
        <div className="troubleshooting-text-overlay">
          <div className="troubleshooting-text">
            AI that automatically builds and nurtures your Troubleshooting Map
          </div>
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
                console.log('📱 Close button clicked - calling handleVideoModalClose');
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

      {/* Enhanced Debug info - shows frame sequence details */}
      {process.env.NODE_ENV === 'development' && (
        <div className="webp-sequence-debug" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000,
          maxWidth: '300px',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: 'bold', color: '#00ff00', marginBottom: '5px' }}>
            {framePrefix === 'mobile_frame_' ? '📱 MOBILE WEBP SEQUENCE DEBUG' : '🖥️ DESKTOP WEBP SEQUENCE DEBUG'}
          </div>
          <div>📁 Folder: {folderPath}</div>
          <div>🏷️ Prefix: {framePrefix}</div>
          <div>🏷️ Suffix: {frameSuffix}</div>
          <div>📊 Section: {activeSection} (Start: {startSection})</div>
          <div>📈 Progress: {(sectionProgress * 100).toFixed(1)}%</div>
          <div style={{
            color: (framePrefix === 'mobile_frame_' ? (currentFrame >= 320 && currentFrame <= 420) : (currentFrame >= 234 && currentFrame <= 334)) ? '#ffff00' : '#00ff00',
            fontWeight: 'bold'
          }}>
            🎬 Frame: {currentFrame}/{totalFrames}
            {(framePrefix === 'mobile_frame_' ? (currentFrame >= 320 && currentFrame <= 420) : (currentFrame >= 234 && currentFrame <= 334)) && (
              <span style={{ color: '#ffff00' }}> (CTA ZONE)</span>
            )}
            {framePrefix === 'mobile_frame_' && currentFrame >= 321 && currentFrame <= 420 && (
              <span style={{ color: '#ff8800' }}> (DUPLICATE)</span>
            )}
          </div>
          <div>🛑 Stop Frame: {stopFrame} (DISABLED - Continuous Scroll)</div>
          <div>⏸️ Scroll Stopped: No (Continuous Scroll Enabled)</div>
          <div style={{ color: '#00ffff', fontWeight: 'bold' }}>
            🎛️ Scroll Sensitivity: {scrollSensitivity} (Lower = Slower)
          </div>
          <div style={{ color: '#00ffff' }}>
            🚀 Max Frame Jump: {maxFrameJump} frames
          </div>
          <div style={{ color: '#00ffff' }}>
            ⏱️ Frame Rate: {frameUpdateRate}ms (~{Math.round(1000 / frameUpdateRate)}fps)
          </div>
          <div style={{ color: showPlayButton ? 'green' : 'red', fontWeight: 'bold' }}>
            ▶️ Show Play Button: {showPlayButton ? 'Yes' : 'No'}
          </div>
          <div style={{ color: hasWatchedVideo ? 'green' : 'red' }}>
            🎥 Has Watched Video: {hasWatchedVideo ? 'Yes' : 'No'}
          </div>
          <div style={{ color: allowSmoothScrolling ? 'green' : 'red' }}>
            🚀 Allow Smooth Scrolling: {allowSmoothScrolling ? 'Yes' : 'No'}
          </div>
          <div style={{ color: isVisible ? 'green' : 'red' }}>
            👁️ Is Visible: {isVisible ? 'Yes' : 'No'}
          </div>
          <div style={{ color: shouldShowPlayButton() ? 'green' : 'red', fontWeight: 'bold', fontSize: '14px' }}>
            ✅ SHOULD SHOW: {shouldShowPlayButton() ? 'YES' : 'NO'}
          </div>
          <div style={{ color: isContinueCTAVisible() ? 'green' : 'red', fontWeight: 'bold', fontSize: '14px' }}>
            🎯 CTA VISIBLE: {isContinueCTAVisible() ? 'YES' : 'NO'}
          </div>
          <div style={{ color: isVideoPreloaded ? 'green' : 'orange', fontWeight: 'bold', fontSize: '14px' }}>
            📹 VIDEO PRELOADED: {isVideoPreloaded ? 'YES' : 'NO'}
          </div>
          <div style={{ color: 'cyan', fontSize: '12px' }}>
            📊 Video Progress: {videoPreloadProgress.toFixed(1)}%
          </div>
          <div style={{
            marginTop: '5px',
            padding: '3px',
            background: (framePrefix === 'mobile_frame_' ?
              (currentFrame >= 320 && currentFrame <= 420) ? 'rgba(255, 255, 0, 0.2)' :
                (currentFrame >= 421) ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 255, 0, 0.2)' :
              (currentFrame >= 234 && currentFrame <= 334) ? 'rgba(255, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)'),
            borderRadius: '3px',
            fontSize: '11px'
          }}>
            {framePrefix === 'mobile_frame_' ? (
              currentFrame >= 320 && currentFrame <= 420 ?
                `🎯 CTA ZONE (320-420): Frame ${currentFrame} - CTA button visible` :
                currentFrame >= 421 ?
                  `🔄 SMOOTH SCROLL ZONE (421-1367): Frame ${currentFrame} - Duplicated for smooth scrolling` :
                  `📍 NORMAL FRAME ZONE: Frame ${currentFrame} is original content`
            ) : (
              currentFrame >= 234 && currentFrame <= 334 ?
                `🎯 CTA ZONE (234-334): Frame ${currentFrame} - CTA button visible` :
                `📍 NORMAL FRAME ZONE: Frame ${currentFrame} is original content`
            )}
          </div>
          <div style={{
            marginTop: '3px',
            fontSize: '10px',
            color: '#888',
            borderTop: '1px solid #333',
            paddingTop: '3px'
          }}>
            {framePrefix === 'mobile_frame_' ? (
              <>
                Mobile Frame Range Info:<br />
                • 1-319: Original frames<br />
                • 320-420: CTA Zone (Frame 320 + Button)<br />
                • 421-1367: Smooth Scroll Zone (Frames 420-587, each duplicated 5x)
              </>
            ) : (
              <>
                Desktop Frame Range Info:<br />
                • 1-233: Original frames<br />
                • 234-334: CTA Zone (Duplicates + Button)<br />
                • 335-428: Original frames (shifted)
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebPSequence;
