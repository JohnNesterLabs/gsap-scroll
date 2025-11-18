import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AnimatedSection from "../../shared/AnimatedSection/AnimatedSection";
import "./Home.css";
import WebPSequence from "../../features/animations/WebPSequence/WebPSequence";
import Header from "../Header/Header";
import { useAssetPreloader } from "../../../hooks/useAssetPreloader";
import { PNG_SEQUENCE_CONFIG, DESKTOP_WEBP_SEQUENCE_CONFIG, SCROLL_SMOOTHING_CONFIG } from "../../../utils/constants";
import {
  getScrollStopConfig,
  getTextPositionConfig,
  getTextAlignConfig,
  getFontSizeConfig,
  getFontWeightConfig,
  isMobileDevice,
} from "../../../utils/configUtils";

export default function Home() {
  const scrollContainerRef = useRef(null);
  const [, setScrollProgress] = useState(0);

  // Scroll smoothing and damping refs
  const targetScrollProgress = useRef(0);
  const currentScrollProgress = useRef(0);
  const animationFrameId = useRef(null);
  const activeSectionRef = useRef(0);

  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);

  // Use the asset preloader hook to preload all frames
  useAssetPreloader();
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Text position configuration is now imported from configUtils.js

  // Text alignment configuration is now imported from configUtils.js

  // Font size configuration is now imported from configUtils.js

  // Font weight configuration is now imported from configUtils.js


  // Smooth scroll animation loop with damping - using refs to avoid stale closures
  useEffect(() => {
    const smoothScrollLoop = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
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

      // Calculate which section we're in and interpolate
      // Sections are now 0-1 (removed sections 1-3, 4/InfiniteWordLoop, footer, and last-frame image)
      const totalSections = 2;
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
  }, []);

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

      // Small delay to ensure everything is initialized
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


  return (
    <div className="home-container">
      {/* Background Layer - Lowest z-index for consistent background */}
      <div className="home-background-layer" />

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

        {/* Last Frame Section - Section 1 */}
        <AnimatedSection
          sectionNumber={1}
          textPosition={getTextPositionConfig()[0]}
          textAlign={getTextAlignConfig()[0]}
          fontSize={getFontSizeConfig()[0]}
          fontWeight={getFontWeightConfig()[0]}
          firstSet={[
            // "AI that automatically builds and nurtures your Troubleshooting Map",
          ]}
        />
      </div>
    </div>
  );
}
