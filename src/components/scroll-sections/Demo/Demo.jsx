import React, { useEffect, useRef, useState } from 'react';
import AnimatedSection from '../../AnimatedSection/AnimatedSection';
import './Demo.css';

export default function Demo() {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoPosition, setVideoPosition] = useState({ x: 50, y: 50, scale: 1, rotation: 0 });
  const [videoSize, setVideoSize] = useState({ width: 400, height: 'auto' });
  const [activeSection, setActiveSection] = useState(0);

  // Video size configuration for each section
  const getVideoSizeConfig = () => {
    const configs = {
      'desktop': {
        section1: { width: 600, height: 'auto' },
        section2: { width: 500, height: 'auto' },
        section3: { width: 700, height: 'auto' },
        section4: { width: 400, height: 'auto' },
        section5: { width: 800, height: 'auto' },
        section6: { width: 0, height: 'auto' }, // Hide in footer
      }
    };
    return configs['desktop'];
  };

  // Video position configuration for each section
  const getPositionConfig = () => {
    const positionConfigs = {
      'desktop': [
        { x: 50, y: 50 },      // Section 1 - Center
        { x: 80, y: 30 },      // Section 2 - Top Right
        { x: 20, y: 70 },      // Section 3 - Bottom Left
        { x: 70, y: 60 },      // Section 4 - Bottom Right
        { x: 30, y: 40 },      // Section 5 - Top Left
        { x: 50, y: 50 },      // Section 6 - Center (footer)
      ]
    };
    return positionConfigs['desktop'];
  };

  // Video rotation configuration for each section
  const getRotationConfig = () => {
    const rotationConfigs = {
      'desktop': [
        0,      // Section 1 - Normal
        15,     // Section 2 - 15 degrees
        -10,    // Section 3 - -10 degrees
        25,     // Section 4 - 25 degrees
        -20,    // Section 5 - -20 degrees
        0,      // Section 6 - Normal (footer)
      ]
    };
    return rotationConfigs['desktop'];
  };

  // Scroll handler function (matching ScrollSyncModel exactly)
  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !videoRef.current) {
      console.log('Missing scroll container or video ref');
      return;
    }

    const scrollTop = scrollContainer.scrollTop;
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

    if (maxScroll <= 0) {
      console.log('No scroll available - maxScroll:', maxScroll, 'scrollHeight:', scrollContainer.scrollHeight, 'clientHeight:', scrollContainer.clientHeight);
      return;
    }

    const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll)); // Clamp between 0 and 1

    console.log('Scroll progress:', scrollProgress, 'ScrollTop:', scrollTop, 'MaxScroll:', maxScroll);

    // Update state for UI display
    setScrollProgress(scrollProgress);

    const positions = getPositionConfig();
    const rotations = getRotationConfig();
    const videoSizeConfig = getVideoSizeConfig();

    // Calculate which section we're in and interpolate (EXACTLY like ScrollSyncModel)
    const totalSections = 6; // Dynamic sections
    const sectionIndex = scrollProgress * (totalSections - 1); // 0 to totalSections-1
    const currentSection = Math.floor(sectionIndex);
    const nextSection = Math.min(currentSection + 1, totalSections - 1);
    const sectionProgress = sectionIndex - currentSection;

    // Track active section
    if (currentSection !== activeSection) {
      setActiveSection(currentSection);
    }

    // Interpolate between current and next position (EXACTLY like ScrollSyncModel)
    const currentPos = positions[currentSection];
    const nextPos = positions[nextSection];

    const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
    const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

    // Interpolate between current and next rotation
    const currentRotation = rotations[currentSection];
    const nextRotation = rotations[nextSection];
    const newRotation = currentRotation + (nextRotation - currentRotation) * sectionProgress;

    // Scale effect - set section 5 to 0.8 scale, hide video in section 6 (like ScrollSyncModel)
    let scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;

    // Dynamic video sizing based on section (EXACTLY like ScrollSyncModel)
    const sizeKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'];
    const currentSizeKey = sizeKeys[currentSection];
    const nextSizeKey = sizeKeys[nextSection];

    const currentSize = videoSizeConfig[currentSizeKey];
    const nextSize = videoSizeConfig[nextSizeKey];

    // Interpolate between current and next size
    const newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;

    // Update video position and size state (EXACTLY like ScrollSyncModel)
    setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
    setVideoSize({ width: newWidth, height: 'auto' });

    console.log('Video position and size updated:', { 
      x: newX, 
      y: newY, 
      scale, 
      rotation: newRotation,
      width: newWidth,
      section: currentSection,
      progress: sectionProgress,
      scrollProgress: scrollProgress,
      currentSize: currentSize.width,
      nextSize: nextSize.width
    });
  };

  // Setup scroll listener (matching ScrollSyncModel exactly)
  useEffect(() => {
    const setupScrollListener = async () => {
      // Wait for scroll container to be available (like ScrollSyncModel)
      let attempts = 0;
      while (!scrollContainerRef.current && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        console.error('Scroll container not found after 5 seconds');
        return;
      }

      // Wait for container to have proper dimensions (like ScrollSyncModel)
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Setting up Demo scroll listener...');

      // Use passive listener for better performance during scroll (like ScrollSyncModel)
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      
      // Set initial position
      handleScroll();

      console.log('Demo scroll listener attached successfully');
    };

    setupScrollListener();

    // Cleanup
    return () => {
      // Note: scrollContainer is captured in the async function scope
      // The cleanup will be handled by the async function's scope
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video properties
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';

    // Handle video loading
    video.addEventListener('loadeddata', () => {
      console.log('Demo video loaded successfully');
      video.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    });

    video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
    });
  }, []);

  return (
    <div className="demo-container">
      {/* Fixed Video */}
      <video
        ref={videoRef}
        src="/final-hero-video1.mp4"
        className="demo-fixed-video"
        style={{
          position: 'fixed',
          zIndex: 5,
          pointerEvents: 'none',
          left: `${videoPosition.x}%`,
          top: `${videoPosition.y}%`,
          transform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
          width: `${videoSize.width}px`,
          height: videoSize.height
          // NO CSS transition - let JavaScript handle all animations for smoothness
        }}
      />

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="demo-scroll-container"
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <AnimatedSection
          sectionNumber={1}
          firstSet={["Welcome to our site", "We build amazing experiences"]}
          secondSet={["Let's get started", "Scroll down to explore more"]}
        />
        <AnimatedSection
          sectionNumber={2}
          firstSet={["Creative Design", "Smooth Interactions"]}
          secondSet={["Modern Aesthetics", "Next-level Performance"]}
        />
        <AnimatedSection
          sectionNumber={3}
          firstSet={["Welcome to our site", "We build amazing experiences"]}
          secondSet={["Let's get started", "Scroll down to explore more"]}
        />
        <AnimatedSection
          sectionNumber={4}
          firstSet={["Creative Design", "Smooth Interactions"]}
          secondSet={["Modern Aesthetics", "Next-level Performance"]}
        />
        <AnimatedSection
          sectionNumber={5}
          firstSet={["Welcome to our site", "We build amazing experiences"]}
          secondSet={["Let's get started", "Scroll down to explore more"]}
        />
        <AnimatedSection
          sectionNumber={6}
          firstSet={["Creative Design", "Smooth Interactions"]}
          secondSet={["Modern Aesthetics", "Next-level Performance"]}
        />
      </div>

      {/* Debug Info */}
      {/* <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 10,
        fontFamily: 'monospace'
      }}>
        <div>Section: {activeSection + 1}/6</div>
        <div>Progress: {(scrollProgress * 100).toFixed(1)}%</div>
        <div>Position: ({videoPosition.x.toFixed(1)}%, {videoPosition.y.toFixed(1)}%)</div>
        <div>Rotation: {videoPosition.rotation.toFixed(1)}°</div>
        <div>Size: {videoSize.width}px</div>
        <div>Scale: {videoPosition.scale.toFixed(2)}</div>
      </div> */}
    </div>
  );
}