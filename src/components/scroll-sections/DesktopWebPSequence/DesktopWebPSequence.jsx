import React, { useState, useEffect, useRef } from 'react';
import './DesktopWebPSequence.css';

const DesktopWebPSequence = ({
    startSection = 4, // Configurable start section (4 or 5)
    totalFrames = 328,
    framePrefix = 'frame_',
    frameSuffix = '.webp',
    folderPath = '/frames-desktop-webp/',
    activeSection,
    sectionProgress,
    // New props for scroll stop functionality
    stopFrame = 234, // Frame to stop at (frame_0234.webp)
    timelineDuration = 5000, // 5 seconds in milliseconds
    timelinePosition = { top: '70%', left: '80%' }, // Customizable timeline position
    playButtonPosition = { top: '30%', left: '43%' }, // Customizable play button position
    onTimelineComplete, // Callback when timeline completes
    onPlayButtonClick, // Callback when play button is clicked
    // Video popup props
    videoSrc = '/Ticket1.mp4', // Default video source for popup
    showVideoPopup = true, // Whether to show video popup on continue
    isVideoPreloaded = false, // Whether the video has been preloaded
    videoPreloadProgress = 0 // Video preload progress percentage
}) => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [isScrollStopped, setIsScrollStopped] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const [timelineProgress, setTimelineProgress] = useState(0);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
    const [allowSmoothScrolling, setAllowSmoothScrolling] = useState(false);
    const [shouldReturnToStopFrame, setShouldReturnToStopFrame] = useState(false);
    const [hasGoneBelowStopFrame, setHasGoneBelowStopFrame] = useState(false);
    const imgRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const scrollPreventionHandlerRef = useRef(null);

    // Debug logging for all state changes
    useEffect(() => {
        console.log('🖥️ DESKTOP WEBP SEQUENCE STATE CHANGE:', {
            currentFrame,
            stopFrame,
            hasWatchedVideo,
            allowSmoothScrolling,
            showPlayButton,
            isScrollStopped,
            showTimeline,
            isVisible,
            activeSection,
            sectionProgress,
            shouldReturnToStopFrame,
            hasGoneBelowStopFrame
        });
    }, [currentFrame, stopFrame, hasWatchedVideo, allowSmoothScrolling, showPlayButton, isScrollStopped, showTimeline, isVisible, activeSection, sectionProgress, shouldReturnToStopFrame, hasGoneBelowStopFrame]);

    // Debug initial state on mount
    useEffect(() => {
        console.log('🚀 Desktop WebP Sequence mounted with config:', {
            startSection,
            totalFrames,
            stopFrame,
            framePrefix,
            frameSuffix,
            folderPath
        });
    }, []);

    // Optimized frame calculation with throttling and performance improvements
    useEffect(() => {
        // Use requestAnimationFrame to throttle frame updates for smooth performance
        const updateFrame = () => {
            if (activeSection >= startSection) {
                // Calculate frame based on section progress
                const sectionOffset = activeSection - startSection;
                const progressInSection = sectionProgress;
                // Total progress across all sections from start section
                const totalProgress = sectionOffset + progressInSection;
                // Map progress to frame range (0 to totalFrames-1)
                const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
                let clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));

                // Hide WebP sequence after completing all frames
                if (clampedFrame >= totalFrames) {
                    setIsVisible(false);
                    // Reset all WebP sequence states when completed
                    setIsScrollStopped(false);
                    setShowTimeline(false);
                    setShowPlayButton(false);
                    setTimelineProgress(0);
                    resumeScroll();
                    return;
                } else {
                    setIsVisible(true);
                }

                // Handle scroll stop logic - only stop once at frame 234
                if (clampedFrame >= stopFrame && !isScrollStopped && !allowSmoothScrolling && !hasWatchedVideo) {
                    console.log('🛑 Desktop WebP sequence reached stop frame:', stopFrame, 'Current frame:', clampedFrame);
                    console.log('📊 Frame details:', {
                        currentFrame: clampedFrame,
                        stopFrame: stopFrame,
                        isScrollStopped,
                        allowSmoothScrolling,
                        hasWatchedVideo
                    });
                    // Clamp to stop frame to prevent going beyond
                    clampedFrame = stopFrame;
                    setIsScrollStopped(true);
                    setShowTimeline(true);
                    startTimeline();
                    // Stop forward scrolling
                    stopForwardScroll();
                }

                // Handle scroll stop state - if user scrolls back below stop frame, reset
                if (isScrollStopped && !allowSmoothScrolling && !hasWatchedVideo) {
                    if (clampedFrame < stopFrame) {
                        // User scrolled back below the stop frame - reset everything
                        console.log('🔄 User scrolled back below stop frame, resetting scroll stop');
                        setIsScrollStopped(false);
                        setShowTimeline(false);
                        setShowPlayButton(false);
                        setTimelineProgress(0);
                        // Remove scroll prevention
                        if (scrollPreventionHandlerRef.current) {
                            const scrollContainer = document.querySelector('.demo-scroll-container');
                            if (scrollContainer) {
                                scrollContainer.removeEventListener('scroll', scrollPreventionHandlerRef.current);
                                delete scrollContainer.dataset.scrollHandler;
                                delete scrollContainer.dataset.maxScrollTop;
                            }
                            scrollPreventionHandlerRef.current = null;
                        }
                    }
                }

                // Handle return to stop frame after video
                if (shouldReturnToStopFrame) {
                    if (clampedFrame <= stopFrame) {
                        // User is scrolling back towards stop frame
                        setHasGoneBelowStopFrame(false);
                    } else if (clampedFrame > stopFrame) {
                        // User has scrolled past stop frame
                        setHasGoneBelowStopFrame(true);
                    }
                }

                // If user has watched video and is scrolling past frame 234, allow normal progression
                if (hasWatchedVideo && clampedFrame > stopFrame) {
                    console.log('🎬 User has watched video, allowing normal frame progression from frame:', clampedFrame);
                    // Hide timeline and play button when user continues scrolling after watching video
                    setShowTimeline(false);
                    setShowPlayButton(false);
                    setTimelineProgress(0);
                }

                // Update current frame
                setCurrentFrame(clampedFrame);

                // Debug logging for frame 234 specifically
                if (clampedFrame === 234) {
                    console.log('🎯 Frame 234 reached!', {
                        activeSection,
                        sectionProgress,
                        totalProgress: sectionOffset + progressInSection,
                        frameIndex,
                        clampedFrame,
                        stopFrame,
                        isScrollStopped,
                        showTimeline,
                        showPlayButton
                    });
                }
            } else {
                setIsVisible(false);
            }
        };

        // Throttle frame updates for better performance
        const timeoutId = setTimeout(updateFrame, 16); // ~60fps
        return () => clearTimeout(timeoutId);
    }, [activeSection, sectionProgress, startSection, totalFrames, stopFrame, isScrollStopped, allowSmoothScrolling, hasWatchedVideo, shouldReturnToStopFrame]);

    // Timeline functionality
    const startTimeline = () => {
        console.log('⏱️ Starting desktop WebP timeline...');
        setTimelineProgress(0);

        const timelineInterval = setInterval(() => {
            setTimelineProgress(prev => {
                const newProgress = prev + (100 / (timelineDuration / 100));

                if (newProgress >= 100) {
                    clearInterval(timelineInterval);
                    setShowTimeline(false);
                    setShowPlayButton(true);
                    onTimelineComplete && onTimelineComplete();
                    console.log('✅ Desktop WebP timeline completed - showing play button');
                    return 100;
                }

                return newProgress;
            });
        }, 100);
    };

    // Resume scroll functionality
    const resumeScroll = () => {
        console.log('▶️ Resuming scroll after desktop WebP sequence...');
        setIsScrollStopped(false);
        setShowPlayButton(false);
        setTimelineProgress(0);
        setAllowSmoothScrolling(true);

        // Remove scroll prevention
        if (scrollPreventionHandlerRef.current) {
            const scrollContainer = document.querySelector('.demo-scroll-container');
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', scrollPreventionHandlerRef.current);
                delete scrollContainer.dataset.scrollHandler;
                delete scrollContainer.dataset.maxScrollTop;
            }
            scrollPreventionHandlerRef.current = null;
        }

        onPlayButtonClick && onPlayButtonClick();
    };

    // Handle play button click
    const handlePlayButtonClick = () => {
        console.log('🎮 Desktop WebP play button clicked');

        if (showVideoPopup && !hasWatchedVideo) {
            setShowVideoModal(true);
        } else {
            resumeScroll();
        }
    };

    // Handle video modal close
    const handleVideoModalClose = () => {
        console.log('📹 Desktop WebP video modal closed');
        setShowVideoModal(false);
        setHasWatchedVideo(true);
        setShouldReturnToStopFrame(true);
        // Don't call resumeScroll() here - let user continue from frame 234
        // Just remove scroll prevention to allow normal scrolling
        if (scrollPreventionHandlerRef.current) {
            const scrollContainer = document.querySelector('.demo-scroll-container');
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', scrollPreventionHandlerRef.current);
                delete scrollContainer.dataset.scrollHandler;
                delete scrollContainer.dataset.maxScrollTop;
            }
            scrollPreventionHandlerRef.current = null;
        }
        setIsScrollStopped(false);
        setAllowSmoothScrolling(true);
        console.log('🔄 Video closed - user can now continue scrolling from frame 234');
        console.log('📊 State after video close:', {
            hasWatchedVideo: true,
            isScrollStopped: false,
            allowSmoothScrolling: true,
            showTimeline: false,
            showPlayButton: false,
            shouldReturnToStopFrame: true
        });
    };

    // Handle shouldReturnToStopFrame logic
    useEffect(() => {
        if (shouldReturnToStopFrame && allowSmoothScrolling) {
            console.log('🔄 shouldReturnToStopFrame is true, monitoring scroll behavior');

            // Clear the flag when user scrolls forward past the stop frame
            if (hasGoneBelowStopFrame) {
                console.log('🎬 User scrolled forward past stop frame - clearing shouldReturnToStopFrame flag');
                setShouldReturnToStopFrame(false);
                setHasGoneBelowStopFrame(false);
            }
        }
    }, [shouldReturnToStopFrame, allowSmoothScrolling, hasGoneBelowStopFrame]);

    // Cleanup scroll prevention on unmount
    useEffect(() => {
        return () => {
            if (scrollPreventionHandlerRef.current) {
                const scrollContainer = document.querySelector('.demo-scroll-container');
                if (scrollContainer) {
                    scrollContainer.removeEventListener('scroll', scrollPreventionHandlerRef.current);
                    delete scrollContainer.dataset.scrollHandler;
                    delete scrollContainer.dataset.maxScrollTop;
                }
                scrollPreventionHandlerRef.current = null;
            }
        };
    }, []);

    // Stop forward scroll function - prevents user from scrolling past current position
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
                    console.log('🚫 Prevented forward scroll, reset to:', currentScrollTop);
                }
            };
            // Store the handler reference for cleanup
            scrollPreventionHandlerRef.current = handleScrollPrevention;
            // Add scroll event listener to prevent forward scrolling
            scrollContainer.addEventListener('scroll', handleScrollPrevention, { passive: false });
            scrollContainer.dataset.scrollHandler = 'true';
            console.log('🛑 Forward scroll stopped at position:', currentScrollTop);
        } else {
            console.error('❌ Could not find .demo-scroll-container element');
        }
    };

    // Helper functions
    const formatFrameNumber = (frameNumber) => {
        return frameNumber.toString().padStart(4, '0');
    };

    const shouldShowPlayButton = () => {
        return showPlayButton && !showVideoModal;
    };

    const isContinueCTAVisible = () => {
        return hasWatchedVideo && showPlayButton;
    };

    // Image loading handlers
    const handleImageError = (e) => {
        console.error('❌ Desktop WebP frame loading error:', e.target.src);
    };

    const handleImageLoad = () => {
        // Image loaded successfully
    };

    // Generate image source
    const imageSrc = `${folderPath}${framePrefix}${formatFrameNumber(currentFrame)}${frameSuffix}`;

    // Use preloaded image if available, otherwise fall back to src
    const preloadedImg = window.preloadedImages && window.preloadedImages.get(imageSrc);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="desktop-webp-sequence-container">
            <img
                ref={imgRef}
                src={preloadedImg ? preloadedImg.src : imageSrc}
                alt={`Desktop WebP Frame ${currentFrame}`}
                className="desktop-webp-sequence-frame"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{
                    // Optimize rendering for preloaded images
                    willChange: preloadedImg ? 'auto' : 'transform',
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
                    </div>
                </div>
            )}

            {/* Text Overlay */}
            {(shouldShowPlayButton() || isContinueCTAVisible()) && (
                <div className="text-overlay-bottom">
                    Click To Enter Ticket No. 1535
                </div>
            )}

            {/* Play Button Overlay */}
            {shouldShowPlayButton() && (
                <div
                    className="play-button-overlay"
                    style={{
                        position: 'absolute',
                        top: playButtonPosition.top,
                        left: playButtonPosition.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25,
                        cursor: 'pointer'
                    }}
                    onClick={handlePlayButtonClick}
                >
                    <div className="play-button">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255, 0.9)" />
                            <path d="M32 25L32 55L55 40L32 25Z" fill="#333" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Continue CTA */}
            {isContinueCTAVisible() && (
                <div
                    className="continue-cta"
                    style={{
                        position: 'absolute',
                        top: playButtonPosition.top,
                        left: playButtonPosition.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25,
                        cursor: 'pointer'
                    }}
                    onClick={handlePlayButtonClick}
                >
                    <div className="continue-button">
                        Continue
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {showVideoModal && (
                <div className="video-modal-overlay" onClick={handleVideoModalClose}>
                    <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="video-modal-close" onClick={handleVideoModalClose}>
                            ×
                        </button>
                        <video
                            src={videoSrc}
                            controls
                            autoPlay
                            onEnded={handleVideoModalClose}
                            style={{ width: '100%', height: '100%' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="desktop-webp-sequence-debug">
                    <div>Section: {activeSection}</div>
                    <div>Progress: {(sectionProgress * 100).toFixed(1)}%</div>
                    <div>Frame: {currentFrame}/{totalFrames}</div>
                    <div>Start Section: {startSection}</div>
                    <div>Stop Frame: {stopFrame}</div>
                    <div>Timeline: {showTimeline ? 'ON' : 'OFF'}</div>
                    <div>Play Button: {showPlayButton ? 'ON' : 'OFF'}</div>
                    <div>Watched Video: {hasWatchedVideo ? 'YES' : 'NO'}</div>
                    <div>Return to Stop: {shouldReturnToStopFrame ? 'YES' : 'NO'}</div>
                    <div>Gone Below: {hasGoneBelowStopFrame ? 'YES' : 'NO'}</div>
                    {currentFrame === 234 && <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>🎯 FRAME 234!</div>}
                </div>
            )}
        </div>
    );
};

export default DesktopWebPSequence;