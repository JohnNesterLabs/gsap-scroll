import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AnimatedSection from "../../shared/AnimatedSection/AnimatedSection";
import "./Home.css";
import InfiniteWordLoop from "../../features/animations/InfiniteWordLoop/InfiniteWordLoop";
import WebPSequence from "../../features/animations/WebPSequence/WebPSequence";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useAssetPreloader } from "../../../hooks/useAssetPreloader";
import { PNG_SEQUENCE_CONFIG, DESKTOP_WEBP_SEQUENCE_CONFIG, SCROLL_SMOOTHING_CONFIG } from "../../../utils/constants";
import {
  getScrollStopConfig,
  getVideoSizeConfig,
  getVideoPositionConfig,
  getVideoRotationConfig,
  getTextPositionConfig,
  getTextAlignConfig,
  getFontSizeConfig,
  getFontWeightConfig,
  getSection1TextConfig,
  isMobileDevice,
} from "../../../utils/configUtils";

// Get initial video position and size for section 1 based on screen size
const getInitialVideoConfig = () => {
  const viewport = (() => {
    const width = window.innerWidth;
    if (width <= 480) return "mobile-small";
    if (width <= 767) return "mobile-large";
    if (width <= 1023) return "tablet";
    if (width <= 1924) return "desktop";
    return "large-desktop";
  })();

  const positionConfigs = {
    "mobile-small": { x: 20, y: 90 }, // Section 1 - Center
    "mobile-large": { x: 50, y: 50 }, // Section 1 - Center
    tablet: { x: 50, y: 60 }, // Section 1 - Center
    desktop: { x: 45, y: 110 }, // Section 1 - Center
    "large-desktop": { x: 45, y: 110 }, // Section 1 - Center
  };

  const sizeConfigs = {
    "mobile-small": { width: 1520, height: "auto" }, // Section 1
    "mobile-large": { width: 700, height: "auto" }, // Section 1
    tablet: { width: 800, height: "auto" }, // Section 1
    desktop: { width: 1700, height: "auto" }, // Section 1
    "large-desktop": { width: 2200, height: "auto" }, // Section 1
  };

  return {
    position: positionConfigs[viewport] || positionConfigs["desktop"],
    size: sizeConfigs[viewport] || sizeConfigs["desktop"],
  };
};

export default function Home() {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [, setScrollProgress] = useState(0);

  // Scroll smoothing and damping refs
  const targetScrollProgress = useRef(0);
  const currentScrollProgress = useRef(0);
  const animationFrameId = useRef(null);
  const activeSectionRef = useRef(0);

  // Get initial config based on screen size
  const initialConfig = getInitialVideoConfig();

  const [videoPosition, setVideoPosition] = useState({
    x: initialConfig.position.x,
    y: initialConfig.position.y,
    scale: 1,
    rotation: 0,
  });
  const [videoSize, setVideoSize] = useState({
    width: initialConfig.size.width,
    height: initialConfig.size.height
  });
  const [activeSection, setActiveSection] = useState(0);
  // headerVisible state moved to Header component
  const [sectionProgress, setSectionProgress] = useState(0);

  // Use the asset preloader hook to preload all frames
  useAssetPreloader();
  const [isInitialized, setIsInitialized] = useState(false);

  // Video preloading state
  const [isVideoPreloaded, setIsVideoPreloaded] = useState(false);
  const [videoPreloadProgress, setVideoPreloadProgress] = useState(0);
  const preloadVideoRef = useRef(null);

  // PNG and WebP Sequence Configurations are now imported from constants.js

  // Scroll Stop Configuration is now imported from configUtils.js

  // Initialize scroll stop config state
  const [scrollStopConfig, setScrollStopConfig] = useState(getScrollStopConfig);

  // Handle responsive config updates on window resize
  useEffect(() => {
    const handleResize = () => {
      setScrollStopConfig(getScrollStopConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile device detection is now imported from configUtils.js

  // Video size configuration is now imported from configUtils.js

  // Video position configuration is now imported from configUtils.js

  // Text position configuration is now imported from configUtils.js

  // Text alignment configuration is now imported from configUtils.js

  // Video rotation configuration is now imported from configUtils.js

  // Font size configuration is now imported from configUtils.js

  // Font weight configuration is now imported from configUtils.js

  // Text content configuration for section 1 is now imported from configUtils.js

  // Memoize configuration functions to prevent recalculation on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedPositions = useMemo(() => getVideoPositionConfig(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRotations = useMemo(() => getVideoRotationConfig(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedVideoSizeConfig = useMemo(() => getVideoSizeConfig(), []);

  // Smooth scroll animation loop with damping - using refs to avoid stale closures
  useEffect(() => {
    const smoothScrollLoop = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer || !videoRef.current) {
        animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
        return;
      }

      // Lerp (linear interpolation) with damping factor from config
      const dampingFactor = SCROLL_SMOOTHING_CONFIG.dampingFactor;
      
      const diff = targetScrollProgress.current - currentScrollProgress.current;
      
      // Apply damping - this creates the "friction" effect
      currentScrollProgress.current += diff * dampingFactor;
      
      // Use the smoothed scroll progress for all calculations
      const scrollProgress = currentScrollProgress.current;

      setScrollProgress(scrollProgress);

      const positions = memoizedPositions;
      const rotations = memoizedRotations;
      const videoSizeConfig = memoizedVideoSizeConfig;

      // Calculate which section we're in and interpolate
      const totalSections = 7;
      const sectionIndex = scrollProgress * (totalSections - 1);
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, totalSections - 1);
      const sectionProgressValue = sectionIndex - currentSection;

      // Update active section if it changed (using ref to avoid stale closure)
      if (currentSection !== activeSectionRef.current) {
        activeSectionRef.current = currentSection;
        setActiveSection(currentSection);
      }
      setSectionProgress(sectionProgressValue);

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgressValue;
      const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgressValue;

      // Interpolate between current and next rotation
      const currentRotation = rotations[currentSection];
      const nextRotation = rotations[nextSection];
      const newRotation =
        currentRotation + (nextRotation - currentRotation) * sectionProgressValue;

      // Scale effect - set section 5 to 0.8 scale, hide video in section 6
      let scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;

      // Dynamic video sizing based on section
      const sizeKeys = [
        "section1",
        "section2",
        "section3",
        "section4",
        "section5",
        "section6",
        "section7",
      ];
      const currentSizeKey = sizeKeys[currentSection];
      const nextSizeKey = sizeKeys[nextSection];

      const currentSize = videoSizeConfig[currentSizeKey];
      const nextSize = videoSizeConfig[nextSizeKey];

      // Interpolate between current and next size
      const newWidth =
        currentSize.width +
        (nextSize.width - currentSize.width) * sectionProgressValue;

      // Batch all state updates together
      setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
      setVideoSize({ width: newWidth, height: "auto" });

      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
    };

    // Start the animation loop
    animationFrameId.current = requestAnimationFrame(smoothScrollLoop);

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [memoizedPositions, memoizedRotations, memoizedVideoSizeConfig]);

  // Handle raw scroll events - just update target, don't calculate positions
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const scrollTop = scrollContainer.scrollTop;
    const maxScroll =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;

    if (maxScroll <= 0) {
      return;
    }

    // Update target scroll progress - the smooth loop will catch up to this
    targetScrollProgress.current = Math.max(0, Math.min(1, scrollTop / maxScroll));
  }, []);

  // Setup scroll listener
  useEffect(() => {
    const setupScrollListener = async () => {
      // Wait for scroll container to be available
      let attempts = 0;
      while (!scrollContainerRef.current && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        console.error("Scroll container not found after 5 seconds");
        return;
      }

      // Wait for container to have proper dimensions
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log("Setting up smooth scroll listener with damping...");

      // Use passive listener for better performance
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      // Initialize scroll values
      handleScroll();
      currentScrollProgress.current = targetScrollProgress.current;

      // Small delay to ensure position is calculated before showing video
      setTimeout(() => {
        setIsInitialized(true);
        console.log("Smooth scroll listener attached successfully");
      }, 100);
    };

    setupScrollListener();

    // Cleanup
    return () => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Video preloading - Start immediately on component mount
  useEffect(() => {
    const preloadVideo = () => {
      const video = document.createElement('video');
      video.src = '/Ticket1_web.mp4';
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;

      // Store reference for cleanup
      preloadVideoRef.current = video;

      // Track loading progress
      video.addEventListener('loadstart', () => {
        console.log('Video preloading started...');
      });

      video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          if (duration > 0) {
            const progress = (bufferedEnd / duration) * 100;
            setVideoPreloadProgress(progress);
            console.log(`Video preload progress: ${progress.toFixed(1)}%`);
          }
        }
      });

      video.addEventListener('canplaythrough', () => {
        console.log('Video preloading completed!');
        setIsVideoPreloaded(true);
        setVideoPreloadProgress(100);
      });

      video.addEventListener('error', (e) => {
        console.error('Video preloading failed:', e);
        // Still mark as preloaded to avoid blocking the app
        setIsVideoPreloaded(true);
      });

      // Start loading
      video.load();
    };

    preloadVideo();

    // Cleanup
    return () => {
      if (preloadVideoRef.current) {
        preloadVideoRef.current.remove();
        preloadVideoRef.current = null;
      }
    };
  }, []);

  // Initialize video - Only when component is initialized
  useEffect(() => {
    if (!isInitialized) return;

    const video = videoRef.current;
    if (!video) return;

    // Set video properties
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";

    // Handle video loading
    video.addEventListener("loadeddata", () => {
      console.log("Demo video loaded successfully");
      video.play().catch((err) => {
        console.warn("Autoplay failed:", err);
      });
    });

    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
    });
  }, [isInitialized]);

  return (
    <div className="home-container">
      {/* Background Layer - Lowest z-index for consistent background */}
      <div className="home-background-layer" />

      {/* Fixed Video - Only show after initialization to prevent glitch */}
      {isInitialized && (
        <video
          ref={videoRef}
          src="/hero4.mp4"
          className="home-fixed-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          disablePictureInPicture
          controls={false}
          style={{
            position: "fixed",
            zIndex: 2, // Video layer - above background, below content for iOS scroll compatibility
            pointerEvents: "none",
            left: `${videoPosition.x}%`,
            top: `${videoPosition.y}%`,
            transform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
            width: `${videoSize.width}px`,
            height: videoSize.height,
            opacity: isInitialized ? 1 : 0, // Smooth fade-in when initialized
            transition: 'opacity 0.3s ease-in-out',
            // iOS-specific touch handling
            touchAction: 'pan-y',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            // NO CSS transition for position/size - let JavaScript handle all animations for smoothness
          }}
        />
      )}

      {/* Header Component */}
      <Header isInitialized={isInitialized} />

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="home-scroll-container"
        style={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          // Ensure scroll container is on top to receive touch events (iOS compatibility)
          position: "relative",
          zIndex: 10, // Higher z-index - top layer for iOS scroll compatibility
        }}
      >
        <AnimatedSection
          sectionNumber={1}
          textPosition={getTextPositionConfig()[0]}
          textAlign={getTextAlignConfig()[0]}
          fontSize={getFontSizeConfig()[0]}
          fontWeight={getFontWeightConfig()[0]}
          firstSet={getSection1TextConfig().firstSet}
          secondSet={getSection1TextConfig().secondSet}
        />
        <AnimatedSection
          sectionNumber={2}
          textPosition={getTextPositionConfig()[1]}
          textAlign={getTextAlignConfig()[1]}
          fontSize={getFontSizeConfig()[1]}
          fontWeight={getFontWeightConfig()[1]}
          firstSet={["The support landscape is", "boundless and shifting"]}
          secondSet={[
            "You're lost.",
            "",
            "Outdated, laborious",
            "and fractional knowledge",
            "cripple frontline actions.",
          ]}
        />
        <AnimatedSection
          sectionNumber={3}
          textPosition={getTextPositionConfig()[2]}
          textAlign={getTextAlignConfig()[2]}
          fontSize={getFontSizeConfig()[2]}
          fontWeight={getFontWeightConfig()[2]}
          firstSet={["Meet Kahuna AI"]}
        />
        <InfiniteWordLoop
          sectionNumber={4}
          words={["Secure", "Private", "Enterprise Grade", "Comprehensive"]}
        />

        {/* Responsive Animation - WebP Sequence for both Desktop and Mobile */}
        {isMobileDevice() ? (
          <WebPSequence
            startSection={PNG_SEQUENCE_CONFIG.startSection}
            totalFrames={97} // Mobile sequence with 97 frames
            framePrefix="frame_"
            frameSuffix=".webp"
            folderPath="/frames-mobile/"
            activeSection={activeSection}
            sectionProgress={sectionProgress}
          />
        ) : (
          <WebPSequence
            startSection={DESKTOP_WEBP_SEQUENCE_CONFIG.startSection}
            totalFrames={DESKTOP_WEBP_SEQUENCE_CONFIG.totalFrames}
            framePrefix={DESKTOP_WEBP_SEQUENCE_CONFIG.framePrefix}
            frameSuffix={DESKTOP_WEBP_SEQUENCE_CONFIG.frameSuffix}
            folderPath={DESKTOP_WEBP_SEQUENCE_CONFIG.folderPath}
            activeSection={activeSection}
            sectionProgress={sectionProgress}
          />
        )}

        {/* Last Frame Section - Section 5 */}
        <AnimatedSection
          sectionNumber={5}
          textPosition={getTextPositionConfig()[3]}
          textAlign={getTextAlignConfig()[3]}
          fontSize={getFontSizeConfig()[3]}
          fontWeight={getFontWeightConfig()[3]}
          firstSet={[
            // "AI that automatically builds and nurtures your Troubleshooting Map",
          ]}
        />

        {/* Last Frame Display - Desktop PNG and Mobile WebP */}
        {isMobileDevice() ? (
          <div className="home-section last-frame-section">
            <img
              src="/frames-mobile-30fps/mobile_frame_0536.webp"
              alt="Mobile Journey Final Frame"
              className="last-frame-image"
            />
          </div>
        ) : (
          <div className="home-section last-frame-section">
            <img
              src="/frames-journey/frame_0328.png"
              alt="Desktop Journey Final Frame"
              className="last-frame-image"
            />
          </div>
        )}

        {/* Footer Section */}
        <Footer />
      </div>
    </div>
  );
}
