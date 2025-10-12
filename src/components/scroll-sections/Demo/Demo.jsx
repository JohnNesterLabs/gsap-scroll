import React, { useEffect, useRef, useState, useCallback } from "react";
import AnimatedSection from "../../AnimatedSection/AnimatedSection";
import "./Demo.css";
import InfiniteWordLoop from "../InfiniteWordLoop/InfiniteWordLoop";
import PNGSequence from "../PNGSequence/PNGSequence";
import WebPSequence from "../WebPSequence/WebPSequence";
import { useAssetPreloader } from "../../../hooks/useAssetPreloader";

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

export default function Demo() {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [, setScrollProgress] = useState(0);

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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [sectionProgress, setSectionProgress] = useState(0);

  // Use the asset preloader hook to preload all frames
  const { progress: preloadProgress, isLoading: isPreloading, error: preloadError } = useAssetPreloader();
  const [isInitialized, setIsInitialized] = useState(false);

  // Video preloading state
  const [isVideoPreloaded, setIsVideoPreloaded] = useState(false);
  const [videoPreloadProgress, setVideoPreloadProgress] = useState(0);
  const preloadVideoRef = useRef(null);

  // PNG Sequence Configuration
  // CONFIGURATION: Change startSection to control when PNG sequence starts
  // - startSection: 4 = PNG sequence starts from section 4 (after L657 section)
  // - startSection: 5 = PNG sequence starts from section 5 (after section 4)
  //
  // TO CHANGE START SECTION: Simply modify the startSection value below
  // Example: Change startSection: 4 to startSection: 5 to start from section 5
  const PNG_SEQUENCE_CONFIG = {
    startSection: 4, // PNG sequence starts from section 4 and completes all 328 frames
    totalFrames: 328,
    framePrefix: "frame_",
    frameSuffix: ".png",
    folderPath: "/frames-journey/",
  };

  // Scroll Stop Configuration
  // CUSTOMIZE: Timeline and Play Button positions
  // You can change these values to position the timeline and play button anywhere on screen
  const SCROLL_STOP_CONFIG = {
    stopFrame: 234, // Frame to stop at (frame_0234.png)
    timelineDuration: 5000, // 5 seconds in milliseconds
    // Timeline position - customize these values
    timelinePosition: {
      top: "50%", // '50%' = center, '30%' = upper, '70%' = lower
      left: "50%", // '50%' = center, '20%' = left, '80%' = right
    },
    // Play button position - customize these values
    playButtonPosition: {
      top: "60%", // '60%' = below timeline, '40%' = above timeline
      left: "50%", // '50%' = center, '20%' = left, '80%' = right
    },
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    const width = window.innerWidth;
    return width <= 768; // Use mobile video for tablets and below
  };

  // Video size configuration for each section
  const getVideoSizeConfig = useCallback(() => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const configs = {
      "mobile-small": {
        section1: { width: 1520, height: "auto" },
        section2: { width: 1820, height: "auto" },
        section3: { width: 2020, height: "auto" },
        section4: { width: 800, height: "auto" },
        section5: { width: 2100, height: "auto" },
        section6: { width: 0, height: "auto" },
        section7: { width: 0, height: "auto" }, // Footer
      },
      "mobile-large": {
        section1: { width: 700, height: "auto" },
        section2: { width: 400, height: "auto" },
        section3: { width: 500, height: "auto" },
        section4: { width: 380, height: "auto" },
        section5: { width: 380, height: "auto" },
        section6: { width: 0, height: "auto" },
        section7: { width: 0, height: "auto" }, // Footer
      },
      tablet: {
        section1: { width: 800, height: "auto" },
        section2: { width: 800, height: "auto" },
        section3: { width: 1000, height: "auto" },
        section4: { width: 700, height: "auto" },
        section5: { width: 700, height: "auto" },
        section6: { width: 0, height: "auto" },
        section7: { width: 0, height: "auto" }, // Footer
      },
      desktop: {
        section1: { width: 1700, height: "auto" },
        section2: { width: 1800, height: "auto" },
        section3: { width: 2500, height: "auto" },
        section4: { width: 1080, height: "auto" },
        section5: { width: 2150, height: "auto" },
        section6: { width: 0, height: "auto" },
        section7: { width: 0, height: "auto" }, // Footer
      },
      "large-desktop": {
        section1: { width: 2200, height: "auto" },
        section2: { width: 2300, height: "auto" },
        section3: { width: 3000, height: "auto" },
        section4: { width: 2380, height: "auto" },
        section5: { width: 3250, height: "auto" },
        section6: { width: 0, height: "auto" },
        section7: { width: 0, height: "auto" }, // Footer
      },
    };
    return configs[viewport] || configs["desktop"];
  }, []);

  // Video position configuration for each section
  const getPositionConfig = useCallback(() => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const positionConfigs = {
      "mobile-small": [
        { x: 20, y: 90 }, // Section 1 - Center
        { x: 110, y: 70 }, // Section 2 - Center
        { x: 40, y: 50 }, // Section 3 - Center
        { x: 38, y: 50 }, // Section 4 - Center
        { x: 40, y: 50 }, // Section 5 - Center
        { x: 50, y: 50 }, // Section 6 - Center
        { x: 50, y: 50 }, // Section 7 - Footer
      ],
      "mobile-large": [
        { x: 50, y: 50 }, // Section 1 - Center
        { x: 50, y: 50 }, // Section 2 - Center
        { x: 50, y: 50 }, // Section 3 - Center
        { x: 50, y: 50 }, // Section 4 - Center
        { x: 50, y: 50 }, // Section 5 - Center
        { x: 50, y: 50 }, // Section 6 - Center
        { x: 50, y: 50 }, // Section 7 - Footer
      ],
      tablet: [
        { x: 50, y: 60 }, // Section 1 - Center
        { x: 50, y: 50 }, // Section 2 - Center (aligned with text)
        { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
        { x: 50, y: 50 }, // Section 4 - Center
        { x: 50, y: 50 }, // Section 5 - Center
        { x: 50, y: 50 }, // Section 6 - Center
        { x: 50, y: 50 }, // Section 7 - Footer
      ],
      desktop: [
        { x: 45, y: 110 }, // Section 1 - Center
        { x: 90, y: 65 }, // Section 2 - Center (aligned with text)
        { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
        { x: 45, y: 50 }, // Section 4 - Center
        { x: 50, y: 50 }, // Section 5 - Center
        { x: 50, y: 50 }, // Section 6 - Center
        { x: 50, y: 50 }, // Section 7 - Footer
      ],
      "large-desktop": [
        { x: 45, y: 110 }, // Section 1 - Center
        { x: 90, y: 65 }, // Section 2 - Center (aligned with text)
        { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
        { x: 45, y: 50 }, // Section 4 - Center
        { x: 50, y: 50 }, // Section 5 - Center
        { x: 50, y: 50 }, // Section 6 - Center
        { x: 50, y: 50 }, // Section 7 - Footer
      ],
    };
    return positionConfigs[viewport] || positionConfigs["desktop"];
  }, []);

  // Text position configuration for each section
  const getTextPositionConfig = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const textPositionConfigs = {
      "mobile-small": [
        "top", // Section 1 - Text at center (mobile)
        "top", // Section 2 - Text at center (mobile)
        "center", // Section 3 - Text at center (mobile)
        "center", // Section 4 - Text at center (mobile)
        "center", // Section 5 - Text at center (mobile)
        "center", // Section 6 - Text at center (mobile)
      ],
      "mobile-large": [
        "center", // Section 1 - Text at center (mobile)
        "center", // Section 2 - Text at center (mobile)
        "center", // Section 3 - Text at center (mobile)
        "center", // Section 4 - Text at center (mobile)
        "center", // Section 5 - Text at center (mobile)
        "center", // Section 6 - Text at center (mobile)
      ],
      tablet: [
        "top", // Section 1 - Text at top
        "left", // Section 2 - Text at left
        "center", // Section 3 - Text at center
        "right", // Section 4 - Text at right
        "bottom", // Section 5 - Text at bottom
        "top-left", // Section 6 - Text at top-left
      ],
      desktop: [
        "top", // Section 1 - Text at top
        "left", // Section 2 - Text at left
        "center", // Section 3 - Text at center
        "right", // Section 4 - Text at right
        "bottom", // Section 5 - Text at bottom
        "top-left", // Section 6 - Text at top-left
      ],
      "large-desktop": [
        "top", // Section 1 - Text at top
        "left", // Section 2 - Text at left
        "center", // Section 3 - Text at center
        "right", // Section 4 - Text at right
        "bottom", // Section 5 - Text at bottom
        "top-left", // Section 6 - Text at top-left
      ],
    };
    return textPositionConfigs[viewport] || textPositionConfigs["desktop"];
  };

  // Text alignment configuration for each section
  const getTextAlignConfig = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const textAlignConfigs = {
      "mobile-small": [
        "center", // Section 1 - Center aligned (mobile)
        "left", // Section 2 - Center aligned (mobile)
        "center", // Section 3 - Center aligned (mobile)
        "center", // Section 4 - Center aligned (mobile)
        "center", // Section 5 - Center aligned (mobile)
        "center", // Section 6 - Center aligned (mobile)
      ],
      "mobile-large": [
        "center", // Section 1 - Center aligned (mobile)
        "center", // Section 2 - Center aligned (mobile)
        "center", // Section 3 - Center aligned (mobile)
        "center", // Section 4 - Center aligned (mobile)
        "center", // Section 5 - Center aligned (mobile)
        "center", // Section 6 - Center aligned (mobile)
      ],
      tablet: [
        "center", // Section 1 - Center aligned
        "left", // Section 2 - Left aligned
        "center", // Section 3 - Center aligned
        "right", // Section 4 - Right aligned
        "center", // Section 5 - Center aligned
        "left", // Section 6 - Left aligned
      ],
      desktop: [
        "center", // Section 1 - Center aligned
        "left", // Section 2 - Left aligned
        "center", // Section 3 - Center aligned
        "center", // Section 4 - Center aligned
        "center", // Section 5 - Center aligned
        "left", // Section 6 - Left aligned
      ],
      "large-desktop": [
        "center", // Section 1 - Center aligned
        "left", // Section 2 - Left aligned
        "center", // Section 3 - Center aligned
        "center", // Section 4 - Center aligned
        "center", // Section 5 - Center aligned
        "left", // Section 6 - Left aligned
      ],
    };
    return textAlignConfigs[viewport] || textAlignConfigs["desktop"];
  };

  // Video rotation configuration for each section
  const getRotationConfig = useCallback(() => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const rotationConfigs = {
      "mobile-small": [
        0, // Section 1 - Normal
        0, // Section 2 - Normal
        0, // Section 3 - Normal
        0, // Section 4 - Normal
        0, // Section 5 - Normal
        0, // Section 6 - Normal
        0, // Section 7 - Footer
      ],
      "mobile-large": [
        0, // Section 1 - Normal
        0, // Section 2 - Normal
        0, // Section 3 - Normal
        0, // Section 4 - Normal
        0, // Section 5 - Normal
        0, // Section 6 - Normal
        0, // Section 7 - Footer
      ],
      tablet: [
        0, // Section 1 - Normal
        0, // Section 2 - Normal
        0, // Section 3 - Normal
        0, // Section 4 - Normal
        0, // Section 5 - Normal
        0, // Section 6 - Normal
        0, // Section 7 - Footer
      ],
      desktop: [
        0, // Section 1 - Normal
        0, // Section 2 - Normal
        0, // Section 3 - Normal
        0, // Section 4 - Normal
        0, // Section 5 - Normal
        0, // Section 6 - Normal
        0, // Section 7 - Footer
      ],
      "large-desktop": [
        0, // Section 1 - Normal
        0, // Section 2 - Normal
        0, // Section 3 - Normal
        0, // Section 4 - Normal
        0, // Section 5 - Normal
        0, // Section 6 - Normal
        0, // Section 7 - Footer
      ],
    };
    return rotationConfigs[viewport] || rotationConfigs["desktop"];
  }, []);

  // Font size configuration for each section
  const getFontSizeConfig = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const fontSizeConfigs = {
      "mobile-small": [
        "26px", // Section 1
        "26px", // Section 2
        "36px", // Section 3
        "24px", // Section 4
        "24px", // Section 5
        "26px", // Section 6
      ],
      "mobile-large": [
        "32px", // Section 1
        "28px", // Section 2
        "36px", // Section 3
        "30px", // Section 4
        "32px", // Section 5
        "30px", // Section 6
      ],
      tablet: [
        "48px", // Section 1
        "32px", // Section 2
        "52px", // Section 3
        "40px", // Section 4
        "44px", // Section 5
        "40px", // Section 6
      ],
      desktop: [
        "60px", // Section 1
        "36px", // Section 2
        "60px", // Section 3
        "36px", // Section 4
        "36px", // Section 5
        "36px", // Section 6
      ],
      "large-desktop": [
        "72px", // Section 1
        "42px", // Section 2
        "76px", // Section 3
        "56px", // Section 4
        "60px", // Section 5
        "56px", // Section 6
      ],
    };
    return fontSizeConfigs[viewport] || fontSizeConfigs["desktop"];
  };

  // Font weight configuration for each section
  const getFontWeightConfig = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();

    const fontWeightConfigs = {
      "mobile-small": [
        "500", // Section 1
        "500", // Section 2
        "500", // Section 3
        "500", // Section 4
        "500", // Section 5
        "500", // Section 6
      ],
      "mobile-large": [
        "500", // Section 1
        "500", // Section 2
        "600", // Section 3
        "500", // Section 4
        "500", // Section 5
        "500", // Section 6
      ],
      tablet: [
        "500", // Section 1
        "500", // Section 2
        "600", // Section 3
        "500", // Section 4
        "500", // Section 5
        "500", // Section 6
      ],
      desktop: [
        "500", // Section 1
        "500", // Section 2
        "600", // Section 3
        "500", // Section 4
        "500", // Section 5
        "500", // Section 6
      ],
      "large-desktop": [
        "500", // Section 1
        "500", // Section 2
        "600", // Section 3
        "500", // Section 4
        "500", // Section 5
        "500", // Section 6
      ],
    };
    return fontWeightConfigs[viewport] || fontWeightConfigs["desktop"];
  };

  // Text content configuration for section 1 - mobile vs desktop
  const getSection1TextSets = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return "mobile-small";
      if (width <= 767) return "mobile-large";
      if (width <= 1023) return "tablet";
      if (width <= 1924) return "desktop";
      return "large-desktop";
    })();
    // For mobile devices, combine the text into a single line without comma
    if (viewport === "mobile-small" || viewport === "mobile-large") {
      return {
        firstSet: ["Vast and intricate products never stop evolving."],
        secondSet: [
          "Enterprise customers have an endless spectrum of realities."
        ]
      };
    }
    // For tablet, desktop, and large-desktop, use the original format
    return {
      firstSet: ["Vast and intricate,", "products never stop evolving."],
      secondSet: [
        "Enterprise customers have an",
        "endless spectrum of realities.",
      ]
    };
  };

  // Optimized scroll handler with throttling and performance improvements
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !videoRef.current) {
      return;
    }

    const scrollTop = scrollContainer.scrollTop;
    const maxScroll =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;

    if (maxScroll <= 0) {
      return;
    }

    const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));

    // Batch state updates to reduce re-renders
    requestAnimationFrame(() => {
      setScrollProgress(scrollProgress);

      const positions = getPositionConfig();
      const rotations = getRotationConfig();
      const videoSizeConfig = getVideoSizeConfig();

      // Calculate which section we're in and interpolate
      const totalSections = 7;
      const sectionIndex = scrollProgress * (totalSections - 1);
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, totalSections - 1);
      const sectionProgress = sectionIndex - currentSection;

      // Only update active section if it changed
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
      setSectionProgress(sectionProgress);

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

      // Interpolate between current and next rotation
      const currentRotation = rotations[currentSection];
      const nextRotation = rotations[nextSection];
      const newRotation =
        currentRotation + (nextRotation - currentRotation) * sectionProgress;

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
        (nextSize.width - currentSize.width) * sectionProgress;

      // Batch all state updates together
      setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
      setVideoSize({ width: newWidth, height: "auto" });
      setHeaderVisible(scrollProgress < 0.04);
    });
  }, [activeSection, getPositionConfig, getRotationConfig, getVideoSizeConfig]);

  // Setup scroll listener (matching ScrollSyncModel exactly)
  useEffect(() => {
    const setupScrollListener = async () => {
      // Wait for scroll container to be available (like ScrollSyncModel)
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

      // Wait for container to have proper dimensions (like ScrollSyncModel)
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log("Setting up Demo scroll listener...");

      // Use passive listener with throttling for better performance during scroll
      let ticking = false;
      const throttledHandleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      scrollContainer.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });

      // Set initial position
      handleScroll();

      // Small delay to ensure position is calculated before showing video
      setTimeout(() => {
        // Mark as initialized to show video
        setIsInitialized(true);
        console.log("Demo scroll listener attached successfully");
      }, 100);
    };

    setupScrollListener();

    // Cleanup
    return () => {
      // Note: scrollContainer is captured in the async function scope
      // The cleanup will be handled by the async function's scope
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Video preloading - Start immediately on component mount
  useEffect(() => {
    const preloadVideo = () => {
      const video = document.createElement('video');
      video.src = '/Final-Ticket-1-(WIP).mp4';
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

    // Set video properties for mobile Safari/iPhone compatibility
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'allow');
    video.defaultMuted = true;
    video.controls = false;

    // Handle video loading with mobile Safari compatibility
    const handleVideoReady = () => {
      console.log("Demo video loaded successfully");
      
      // Force play for mobile Safari
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay failed:", err);
          // Try again after user interaction for mobile Safari
          document.addEventListener('touchstart', () => {
            video.play().catch(console.warn);
          }, { once: true });
        });
      }
    };

    video.addEventListener("loadeddata", handleVideoReady);
    video.addEventListener("canplaythrough", handleVideoReady);
    
    // Firefox specific handling
    video.addEventListener("loadedmetadata", () => {
      console.log("Video metadata loaded - Firefox compatibility");
      handleVideoReady();
    });

    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
    });
  }, [isInitialized]);

  // Show loading screen while assets are being preloaded
  // if (isPreloading) {
  //   return (
  //     <div className="demo-container" style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  //       color: 'white',
  //       fontFamily: 'Prodigy Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
  //     }}>
  //       <div style={{ marginBottom: '20px' }}>
  //         <img 
  //           src="/final-logo.svg" 
  //           alt="Kahuna" 
  //           style={{ height: '60px', width: 'auto' }}
  //         />
  //       </div>
  //       <div style={{ 
  //         width: '300px', 
  //         height: '4px', 
  //         backgroundColor: 'rgba(255,255,255,0.2)', 
  //         borderRadius: '2px',
  //         overflow: 'hidden',
  //         marginBottom: '16px'
  //       }}>
  //         <div style={{
  //           width: `${preloadProgress}%`,
  //           height: '100%',
  //           background: 'linear-gradient(90deg, #00D4FF 0%, #0099CC 100%)',
  //           transition: 'width 0.3s ease-out',
  //           borderRadius: '2px'
  //         }} />
  //       </div>
  //       <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
  //         Loading Assets...
  //       </div>
  //       <div style={{ fontSize: '14px', opacity: 0.7 }}>
  //         {preloadProgress}% Complete
  //       </div>
  //       {preloadError && (
  //         <div style={{ 
  //           fontSize: '12px', 
  //           color: '#ff6b6b', 
  //           marginTop: '10px',
  //           textAlign: 'center'
  //         }}>
  //           Some assets failed to load, but the experience will continue
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <div className="demo-container">
      {/* Fixed Video - Only show after initialization to prevent glitch */}
      {isInitialized && (
        <video
          ref={videoRef}
          src="/hero4.mp4"
          // src="/final-hero-video1.mp4"
          className="demo-fixed-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          style={{
            position: "fixed",
            zIndex: 5,
            pointerEvents: "none",
            left: `${videoPosition.x}%`,
            top: `${videoPosition.y}%`,
            transform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
            width: `${videoSize.width}px`,
            height: videoSize.height,
            opacity: isInitialized ? 1 : 0, // Smooth fade-in when initialized
            transition: 'opacity 0.3s ease-in-out',
            // NO CSS transition for position/size - let JavaScript handle all animations for smoothness
            // Mobile Safari specific optimizations
            WebkitTransform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        />
      )}

      {/* Header - Only visible on Section 1 and after initialization */}
      {isInitialized && (
        <div className={`demo-header ${headerVisible ? "visible" : "hidden"}`}>
          {/* Left Logo */}
          <div className="demo-header-left">
            <img
              src="/kahuna-logo-3.svg"
              alt="Kahuna Logo"
              className="demo-header-logo"
            />
          </div>

          {/* Right Let's Talk Button */}
          <button
            onClick={() => {
              console.log("Let's Talk button clicked!");
              // Add your contact/navigation logic here
            }}
            className="demo-header-button"
          >
            <a href="mailto:info@kahunalabs.ai">Let's Talk</a>
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="demo-scroll-container"
        style={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <AnimatedSection
          sectionNumber={1}
          textPosition={getTextPositionConfig()[0]}
          textAlign={getTextAlignConfig()[0]}
          fontSize={getFontSizeConfig()[0]}
          fontWeight={getFontWeightConfig()[0]}
          firstSet={getSection1TextSets().firstSet}
          secondSet={getSection1TextSets().secondSet}
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
        {/* <AnimatedSection
          sectionNumber={5}
          textPosition={getTextPositionConfig()[3]}
          textAlign={getTextAlignConfig()[3]}
          fontSize={getFontSizeConfig()[3]}
          fontWeight={getFontWeightConfig()[3]}
          firstSet={
            [
              // "AI that automatically builds and nurtures your Troubleshooting Map",
            ]
          }
        /> */}

        {/* Responsive Animation - PNG Sequence for Desktop, WebP Sequence for Mobile */}
        {isMobileDevice() ? (
          <WebPSequence
            startSection={PNG_SEQUENCE_CONFIG.startSection}
            totalFrames={436} // Updated to match 30fps WebP frames extracted
            framePrefix="mobile_frame_"
            frameSuffix=".webp"
            folderPath="/frames-mobile-30fps/"
            activeSection={activeSection}
            sectionProgress={sectionProgress}
            // Scroll stop functionality - using configuration
            stopFrame={320} // Adjusted for mobile sequence (320 out of 436 frames - similar to desktop)
            timelineDuration={SCROLL_STOP_CONFIG.timelineDuration}
            timelinePosition={SCROLL_STOP_CONFIG.timelinePosition}
            playButtonPosition={SCROLL_STOP_CONFIG.playButtonPosition}
            // Video popup functionality
            videoSrc="/Final-Ticket-1-(WIP).mp4"
            showVideoPopup={true}
            isVideoPreloaded={isVideoPreloaded}
            videoPreloadProgress={videoPreloadProgress}
            onTimelineComplete={() => {
              console.log("Mobile WebP sequence timeline completed - showing play button");
            }}
            onPlayButtonClick={() => {
              console.log("Mobile WebP sequence play button clicked - resuming scroll");
            }}
          />
        ) : (
          <PNGSequence
            startSection={PNG_SEQUENCE_CONFIG.startSection}
            totalFrames={PNG_SEQUENCE_CONFIG.totalFrames}
            framePrefix={PNG_SEQUENCE_CONFIG.framePrefix}
            frameSuffix={PNG_SEQUENCE_CONFIG.frameSuffix}
            folderPath={PNG_SEQUENCE_CONFIG.folderPath}
            activeSection={activeSection}
            sectionProgress={sectionProgress}
            // Scroll stop functionality - using configuration
            stopFrame={SCROLL_STOP_CONFIG.stopFrame}
            timelineDuration={SCROLL_STOP_CONFIG.timelineDuration}
            timelinePosition={SCROLL_STOP_CONFIG.timelinePosition}
            playButtonPosition={SCROLL_STOP_CONFIG.playButtonPosition}
            // Video popup functionality
            videoSrc="/Final-Ticket-1-(WIP).mp4"
            showVideoPopup={true}
            isVideoPreloaded={isVideoPreloaded}
            videoPreloadProgress={videoPreloadProgress}
            onTimelineComplete={() => {
              console.log("Desktop PNG sequence timeline completed - showing play button");
            }}
            onPlayButtonClick={() => {
              console.log("Desktop PNG sequence play button clicked - resuming scroll");
            }}
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
          <div className="demo-section last-frame-section">
            <img
              src="/frames-mobile-30fps/mobile_frame_0436.webp"
              alt="Mobile Journey Final Frame"
              className="last-frame-image"
            />
          </div>
        ) : (
          <div className="demo-section last-frame-section">
            <img
              src="/frames-journey/frame_0328.png"
              alt="Desktop Journey Final Frame"
              className="last-frame-image"
            />
          </div>
        )}

        {/* <AnimatedSection
          sectionNumber={6}
          textPosition={getTextPositionConfig()[4]}
          textAlign={getTextAlignConfig()[4]}
          fontSize={getFontSizeConfig()[4]}
          fontWeight={getFontWeightConfig()[4]}
          firstSet={[
            "",
          ]}
        /> */}
        {/* <AnimatedSection
          sectionNumber={7}
          textPosition={getTextPositionConfig()[5]}
          textAlign={getTextAlignConfig()[5]}
          fontSize={getFontSizeConfig()[5]}
          fontWeight={getFontWeightConfig()[5]}
          firstSet={["Experience the future", "Innovation meets excellence"]}
        /> */}
        {/* <ZoomInSection sectionNumber={6} text="Welcome to the Future" /> */}
        {/* Footer Section */}
        <div className="demo-section demo-footer">
          <div className="footer-container">
            {/* Main Tagline Section */}
            <img
              src="/final-logo.svg"
              alt="Kahuna Labs"
              className="footer-logo-bg"
            />
            <div className="footer-tagline">
              <div className="footer-tagline-text">
                <div className="footer-tagline-line">
                  Secure. Private. Comprehensive. Enterprise Grade.
                </div>
                {/* <div className="footer-tagline-line">Enterprise Grade.</div> */}
              </div>
            </div>

            {/* Footer Content */}
            <div className="footer-content">
              <div className="footer-links">
                {/* Technology Column */}
                <div className="footer-column">
                  <h3 className="footer-column-title">TECHNOLOGY</h3>
                  <ul className="footer-links-list">
                    <li>
                      <a
                        href="/technology/frontline-productivity"
                        className="footer-link"
                      >
                        Frontline Productivity
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://form.jotform.com/251278392049160"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                      >
                        How Complex is Your Support?
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company Column */}
                <div className="footer-column">
                  <h3 className="footer-column-title">COMPANY</h3>
                  <ul className="footer-links-list">
                    <li>
                      <a
                        href="mailto:info@kahunalabs.ai"
                        className="footer-link"
                      >
                        Contact us
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:careers@kahunalabs.ai"
                        className="footer-link"
                      >
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="footer-column">
                  <a
                    href="https://linkedin.com/company/kahuna-labs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-linkedin"
                  >
                    <img
                      src="/LinkedIn-Icon.png"
                      alt="LinkedIn"
                      className="footer-linkedin-icon"
                    />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Kahuna Labs Logo */}
              <div className="footer-logo-section">
                <div className="footer-logo-container">
                  <img src="/kahuna-logo-3.svg" alt="Kahuna Labs" />
                </div>
              </div>
            </div>

            {/* Bottom Copyright Line */}
            <div className="footer-copyright">
              <div className="footer-copyright-text">
                <div>
                  <p>
                    Kahuna AI and its components are trademarks of Kahuna Labs.
                  </p>
                  <p>
                    The proprietary technology of Kahuna AI is protected by
                    multiple issued and pending U.S. and international patents
                    owned by Kahuna Labs.
                  </p>
                </div>
                <p>All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
