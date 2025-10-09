import React, { useEffect, useRef } from 'react';
import './ScrollSyncModel.css';

function ScrollSyncModel({
  showScrollIndicator = false,
  showDebugControls = false,
  showDebugInfo = false,
  showHeader = true,
  showFooter = true,
  scrollIndicatorText = "Scroll to see the model move through sections",
  debugControlsPosition = "top-right",
  videoSrc = "/map-alive-test.mp4"
}) {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [videoPosition, setVideoPosition] = React.useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [videoSize, setVideoSize] = React.useState({ width: 400, height: 'auto' });
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [currentFrame, setCurrentFrame] = React.useState(1);
  const [totalFrames] = React.useState(153); // Total frames from hero44.mp4 conversion
  const [isInSection5, setIsInSection5] = React.useState(false);
  const [section3TextVisible, setSection3TextVisible] = React.useState(false);
  const [section3TextPosition, setSection3TextPosition] = React.useState('center');
  const [section3TextVertical, setSection3TextVertical] = React.useState('top');
  const canvasRef = useRef(null);
  const frameImagesRef = useRef({});

  // Preload frame images
  const preloadFrame = (frameNumber) => {
    if (!frameImagesRef.current[frameNumber]) {
      const img = new Image();
      img.src = `/frames/frame_${String(frameNumber).padStart(4, '0')}.png`;
      frameImagesRef.current[frameNumber] = img;
    }
    return frameImagesRef.current[frameNumber];
  };

  // Render frame on canvas
  const renderFrame = (frameNumber) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = preloadFrame(frameNumber);

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    // If image is already loaded, draw it immediately
    if (img.complete) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
  };

  // Preload frames on mount
  useEffect(() => {
    // Preload first, middle, and last frames for better performance
    preloadFrame(1);
    preloadFrame(Math.floor(totalFrames / 2));
    preloadFrame(totalFrames);
  }, [totalFrames]);

  // Render frame when currentFrame changes
  useEffect(() => {
    renderFrame(currentFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrame]);

  useEffect(() => {
    // Get viewport dimensions for responsive video sizing
    const getViewportSize = () => {
      const width = window.innerWidth;

      if (width <= 480) {
        return 'mobile-small';
      } else if (width <= 767) {
        return 'mobile-large';
      } else if (width <= 1023) {
        return 'tablet';
      } else if (width <= 1924) {
        return 'desktop';
      } else {
        return 'large-desktop';
      }
    };

    // Responsive video size configuration based on viewport
    const getVideoSizeConfig = () => {
      const viewport = getViewportSize();

      const configs = {
        'mobile-small': {
          section1: { width: 950, height: 'auto' },
          section2: { width: 900, height: 'auto' },
          section3: { width: 920, height: 'auto' },
          section4: { width: 350, height: 'auto' },
          section5: { width: 0, height: 'auto' },
          ...(showFooter && { section6: { width: 0, height: 'auto' } })
        },
        'mobile-large': {
          section1: { width: 400, height: 'auto' },
          section2: { width: 450, height: 'auto' },
          section3: { width: 500, height: 'auto' },
          section4: { width: 350, height: 'auto' },
          section5: { width: 300, height: 'auto' },
          ...(showFooter && { section6: { width: 0, height: 'auto' } })
        },
        'tablet': {
          section1: { width: 900, height: 'auto' },
          section2: { width: 950, height: 'auto' },
          section3: { width: 1150, height: 'auto' },
          section4: { width: 500, height: 'auto' },
          section5: { width: 0, height: 'auto' },
          ...(showFooter && { section6: { width: 0, height: 'auto' } })
        },
        'desktop': {
          section1: { width: 1500, height: 'auto' },
          section2: { width: 1500, height: 'auto' },
          section3: { width: 2500, height: 'auto' },
          section4: { width: 1080, height: 'auto' },
          section5: { width: 0, height: 'auto' },
          ...(showFooter && { section6: { width: 0, height: 'auto' } })
        },
        'large-desktop': {
          section1: { width: 3300, height: 'auto' },
          section2: { width: 2800, height: 'auto' },
          section3: { width: 3100, height: 'auto' },
          section4: { width: 1300, height: 'auto' },
          section5: { width: 1300, height: 'auto' },
          ...(showFooter && { section6: { width: 0, height: 'auto' } })
        }
      };

      return configs[viewport] || configs['desktop'];
    };

    const videoSizeConfig = getVideoSizeConfig();
    let isMounted = true;

    // Get responsive position configuration based on viewport
    const getPositionConfig = () => {
      const viewport = getViewportSize();

      const positionConfigs = {
        'mobile-small': [
          { x: 50, y: 125 },      // Section 1 - Center (mobile optimized)
          { x: 115, y: 70 },      // Section 2 - Right (closer to center on mobile)
          { x: 50, y: 50 },      // Section 3 - Center
          { x: 50, y: 50 },      // Section 4 - Left (closer to center on mobile)
          { x: 50, y: 50 },      // Section 5 - Center
          { x: 50, y: 50 }       // Section 6 - Footer (center)
        ],
        'mobile-large': [
          { x: 50, y: 50 },      // Section 1 - Center
          { x: 90, y: 50 },      // Section 2 - Right
          { x: 50, y: 50 },      // Section 3 - Center
          { x: 10, y: 50 },      // Section 4 - Left
          { x: 50, y: 50 },      // Section 5 - Center
          { x: 50, y: 50 }       // Section 6 - Footer (center)
        ],
        'tablet': [
          { x: 50, y: 100 },      // Section 1 - Center
          { x: 92, y: 75 },      // Section 2 - Right
          { x: 50, y: 50 },      // Section 3 - Center
          { x: 50, y: 50 },       // Section 4 - Left
          { x: 50, y: 50 },      // Section 5 - Center
          { x: 50, y: 50 }       // Section 6 - Footer (center)
        ],
        'desktop': [
          { x: 50, y: 105 },     // Section 1 - Bottom (your laptop config)
          { x: 95, y: 55 },      // Section 2 - Right
          { x: 50, y: 50 },      // Section 3 - Center
          { x: 50, y: 50 },      // Section 4 - Left
          { x: 50, y: 50 },      // Section 5 - Top
          { x: 50, y: 50 }       // Section 6 - Footer (center)
        ],
        'large-desktop': [
          { x: 50, y: 115 },     // Section 1 - Slightly higher for large screens
          { x: 96, y: 55 },      // Section 2 - Right (more extreme)
          { x: 50, y: 50 },      // Section 3 - Center
          { x: 50, y: 50 },       // Section 4 - Left (more extreme)
          { x: 50, y: 50 },      // Section 5 - Center
          { x: 50, y: 50 }       // Section 6 - Footer (center)
        ]
      };

      return positionConfigs[viewport] || positionConfigs['desktop'];
    };

    // Get responsive rotation configuration based on viewport
    const getRotationConfig = () => {
      const viewport = getViewportSize();

      const rotationConfigs = {
        'mobile-small': [
          0,      // Section 1 - Normal position
          0,      // Section 2 - Normal position
          0,      // Section 3 - Normal position
          0,      // Section 4 - Normal position
          0,      // Section 5 - Normal position
          0       // Section 6 - Footer
        ],
        'mobile-large': [
          0,      // Section 1 - Normal position
          0,      // Section 2 - Normal position
          0,      // Section 3 - Normal position
          0,      // Section 4 - Normal position
          0,      // Section 5 - Normal position
          0       // Section 6 - Footer
        ],
        'tablet': [
          0,      // Section 1 - Normal position
          0,      // Section 2 - Normal position
          0,      // Section 3 - Normal position
          0,      // Section 4 - Normal position
          0,      // Section 5 - Normal position
          0       // Section 6 - Footer
        ],
        'desktop': [
          -75,      // Section 1 - Normal position
          -165,     // Section 2 - 45 degree rotation
          -190,      // Section 3 - Normal position
          -190,    // Section 4 - -30 degree rotation
          0,      // Section 5 - Normal position
          0       // Section 6 - Footer
        ],
        'large-desktop': [
          -75,      // Section 1 - Normal position
          -165,     // Section 2 - 45 degree rotation
          -190,      // Section 3 - Normal position
          -190,    // Section 4 - -30 degree rotation
          0,      // Section 5 - Normal position
          0       // Section 6 - Footer
        ]
      };

      return rotationConfigs[viewport] || rotationConfigs['desktop'];
    };

    // Add window resize listener to recalculate video sizes and positions on viewport change
    const handleResize = () => {
      console.log('Viewport resized, recalculating video sizes and positions...');
      const newConfig = getVideoSizeConfig();
      const newPositions = getPositionConfig();
      const newRotations = getRotationConfig();

      // Update video size and position if we're currently in a section
      if (videoRef.current && scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const scrollTop = scrollContainer.scrollTop;
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));

        const totalSections = showFooter ? 6 : 5;
        const sectionIndex = scrollProgress * (totalSections - 1);
        const currentSection = Math.floor(sectionIndex);
        const nextSection = Math.min(currentSection + 1, totalSections - 1);
        const sectionProgress = sectionIndex - currentSection;

        // Update video size
        const sizeKeys = showFooter ?
          ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'] :
          ['section1', 'section2', 'section3', 'section4', 'section5'];
        const currentSizeKey = sizeKeys[currentSection];
        const nextSizeKey = sizeKeys[nextSection];

        if (newConfig[currentSizeKey] && newConfig[nextSizeKey]) {
          const currentSize = newConfig[currentSizeKey];
          const nextSize = newConfig[nextSizeKey];
          const newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;
          setVideoSize({ width: newWidth, height: 'auto' });
        }

        // Update video position
        const currentPos = newPositions[currentSection];
        const nextPos = newPositions[nextSection];
        const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
        const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

        // Update video rotation
        const currentRotation = newRotations[currentSection];
        const nextRotation = newRotations[nextSection];
        const newRotation = currentRotation + (nextRotation - currentRotation) * sectionProgress;

        // Scale effect - set section 5 to 0.8 scale, hide video in section 6
        let scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;
        if (currentSection === 4 || (currentSection === 3 && nextSection === 4)) {
          scale = 0.8;
        }
        if (currentSection === 5) {
          scale = 0;
        }

        setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
      }
    };

    // Simple video initialization
    const initializeVideo = async () => {
      try {
        // Wait for video to be available
        let attempts = 0;
        while (!videoRef.current && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!videoRef.current) {
          throw new Error('Video element not found after 5 seconds');
        }

        console.log('Initializing video...');

        const video = videoRef.current;

        // Set video properties for best quality
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';

        // Handle video loading
        video.addEventListener('loadeddata', () => {
          console.log('Video loaded successfully');
          console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          video.play().catch(err => {
            console.warn('Autoplay failed, user interaction required:', err);
          });
        });

        video.addEventListener('error', (e) => {
          console.error('Video loading error:', e);
          setError('Failed to load video: ' + e.message);
        });

        console.log('Video initialized successfully');
        return video;
      } catch (error) {
        console.error('Video initialization failed:', error);
        setError(error.message);
        throw error;
      }
    };

    // Robust scroll setup function
    const setupScrollListener = async () => {
      try {
        // Wait for scroll container to be available
        let attempts = 0;
        while (!scrollContainerRef.current && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!scrollContainerRef.current) {
          throw new Error('Scroll container not found after 5 seconds');
        }

        console.log('Setting up scroll listener...');

        // Wait for container to have proper dimensions
        await new Promise(resolve => setTimeout(resolve, 200));

        const scrollContainer = scrollContainerRef.current;
        console.log('Container dimensions:', {
          scrollHeight: scrollContainer.scrollHeight,
          clientHeight: scrollContainer.clientHeight,
          offsetHeight: scrollContainer.offsetHeight
        });

        if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
          console.warn('Container has no scrollable content');
        }

        // Use passive listener for better performance during scroll
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

        // Add window resize listener for responsive video sizing
        window.addEventListener('resize', handleResize, { passive: true });

        handleScroll(); // Set initial position

        console.log('Scroll listener attached successfully');
        return scrollContainer;
      } catch (error) {
        console.error('Scroll setup failed:', error);
        setError(error.message);
        throw error;
      }
    };

    // Scroll handler function
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

      // Calculate which section we're in and interpolate
      const totalSections = showFooter ? 6 : 5; // Dynamic sections based on footer
      const sectionIndex = scrollProgress * (totalSections - 1); // 0 to totalSections-1
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, totalSections - 1);
      const sectionProgress = sectionIndex - currentSection;

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

      // Interpolate between current and next rotation
      const currentRotation = rotations[currentSection];
      const nextRotation = rotations[nextSection];
      const newRotation = currentRotation + (nextRotation - currentRotation) * sectionProgress;

      // Scale effect - set section 5 to 0.8 scale, hide video in section 6
      let scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;

      // If in section 5 or transitioning to section 5, set scale to 0.8
      if (currentSection === 4 || (currentSection === 3 && nextSection === 4)) {
        scale = 0.8;
      }

      // Hide video in footer section (section 6)
      if (currentSection === 5) {
        scale = 0;
      }

      // Dynamic video sizing based on section
      const sizeKeys = showFooter ?
        ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'] :
        ['section1', 'section2', 'section3', 'section4', 'section5'];
      const currentSizeKey = sizeKeys[currentSection];
      const nextSizeKey = sizeKeys[nextSection];

      const currentSize = videoSizeConfig[currentSizeKey];
      const nextSize = videoSizeConfig[nextSizeKey];

      // Interpolate between current and next size
      const newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;

      // Update video position and size state
      setVideoPosition({ x: newX, y: newY, scale, rotation: newRotation });
      setVideoSize({ width: newWidth, height: 'auto' });

      // Show header only during section 1 (first 20% of scroll) and if showHeader prop is true
      setHeaderVisible(showHeader && scrollProgress < 0.04);

      // Handle Section 3 text animation - show "Meet Kahuna AI" when in center of section 3
      if (currentSection === 2) {
        // We're in section 3 (index 2), check if we're in the center (50% of section 3)
        const section3StartProgress = 2 / (totalSections - 1); // Start of section 3
        const section3EndProgress = 3 / (totalSections - 1); // End of section 3
        const section3Progress = (scrollProgress - section3StartProgress) / (section3EndProgress - section3StartProgress);

        console.log('Section 3 progress:', Math.floor(section3Progress * 100) + '%', 'Text visible:', section3TextVisible);

        // Show text when we're in the center of section 3 (around 50% progress)
        if (section3Progress >= .2 && section3Progress <= .4 && !section3TextVisible) {
          setSection3TextVisible(true);
          setSection3TextPosition('center');
          setSection3TextVertical('top');
          console.log('Section 3 "Meet Kahuna AI" zoom in animation started at center');
        } else if (section3Progress > 0.4 && section3TextVisible) {
          // Keep text in center until we reach section 4 center
          setSection3TextPosition('center');
          setSection3TextVertical('top');
          console.log('Section 3 "Meet Kahuna AI" staying in center');
        } else if (section3Progress < 0.2 && section3TextVisible) {
          setSection3TextVisible(false);
          console.log('Section 3 "Meet Kahuna AI" animation ended');
        }
      } else if (currentSection === 3) {
        // We're in section 4 (index 3), check if we're in the center
        const section4StartProgress = 3 / (totalSections - 1); // Start of section 4
        const section4EndProgress = 4 / (totalSections - 1); // End of section 4
        const section4Progress = (scrollProgress - section4StartProgress) / (section4EndProgress - section4StartProgress);

        console.log('Section 4 progress:', Math.floor(section4Progress * 100) + '%');

        // Move text to left immediately when entering section 4
        if (section4Progress < 0.8) {
          if (!section3TextVisible) {
            setSection3TextVisible(true);
          }
          setSection3TextPosition('left');
          setSection3TextVertical('top');
          console.log('Section 4 - "Meet Kahuna AI" moved to left immediately', 'Progress:', Math.floor(section4Progress * 100) + '%', 'Position:', 'left');
        } else if (section4Progress >= 0.8) {
          // Hide text when scrolling past section 4
          setSection3TextVisible(false);
          console.log('Section 4 end - "Meet Kahuna AI" disappeared');
        }
      } else if (currentSection !== 2 && currentSection !== 3) {
        // Reset text visibility when not in section 3 or 4
        if (section3TextVisible) {
          setSection3TextVisible(false);
          setSection3TextPosition('center');
          console.log('Section 3 text animation reset - currentSection:', currentSection);
        }
      }

      // Calculate frame for section 5 based on scroll progress within that section
      if (currentSection === 4) {
        // Section 5 (index 4)
        setIsInSection5(true);
        // Calculate frame based on progress within section 5 (0 to 1)
        const frameNumber = Math.min(
          Math.max(1, Math.floor(sectionProgress * totalFrames) + 1),
          totalFrames
        );
        setCurrentFrame(frameNumber);
        renderFrame(frameNumber);
        console.log('Section 5 - Frame:', frameNumber, 'Progress:', sectionProgress);
      } else if (currentSection === 3 && nextSection === 4) {
        // Transitioning TO section 5 - start with frame 1
        setIsInSection5(true);
        setCurrentFrame(1);
        renderFrame(1);
        console.log('Transitioning to Section 5 - Frame:', 1);
      } else {
        // Not in section 5
        setIsInSection5(false);
      }

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
        nextSize: nextSize.width,
        section3TextVisible: section3TextVisible,
        ...(currentSection === 4 && { frame: currentFrame })
      });
    };

    const initialize = async () => {
      try {
        await initializeVideo();

        if (!isMounted) return;

        // Setup scroll listener after video is ready
        if (!isMounted) return;

        const scrollContainer = await setupScrollListener();

        if (!isMounted) return;

        setIsInitialized(true);
        console.log('ScrollSyncModel fully initialized');

        // Cleanup
        return () => {
          isMounted = false;
          if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
          }
        };
      } catch (error) {
        console.error('Initialization failed:', error);
        setError(error.message);
        setIsInitialized(false);
      }
    };

    initialize();

    // Fallback cleanup
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFooter, showHeader]);


  const sections = [
    {
      title: 'Section 1',
      subtitle: 'Model at Center',
      background: '#000000',
      border: '1px solid #ffffff',
      hasHeader: showHeader // Use prop for header visibility
    },
    { title: 'Section 2', subtitle: 'Model moves Right', background: '#000000', border: '1px solid #ffffff' },
    { title: 'Section 3', subtitle: 'Model moves Down', background: '#000000', border: '1px solid #ffffff' },
    { title: 'Section 4', subtitle: 'Model moves Left', background: '#000000', border: '1px solid #ffffff' },
    { title: 'Section 5', subtitle: 'Model moves Up', background: '#000000', border: '1x solid #ffffff' },
    ...(showFooter ? [{
      title: 'Footer',
      subtitle: 'Contact & Links',
      background: '#0A0A0A',
      border: '1px solid #ffffff',
      isFooter: true // Add footer flag for section 6
    }] : [])
  ];

  return (
    <div className="scroll-sync-container">
      {/* Debug Info */}
      {showDebugInfo && (
        <div className="debug-info">
          <div>ScrollSyncModel Status</div>
          <div>Initialized: {isInitialized ? '✓' : '✗'}</div>
          <div>Video: {videoRef.current ? '✓' : '✗'}</div>
          <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
          <div>Position: ({videoPosition.x.toFixed(1)}%, {videoPosition.y.toFixed(1)}%)</div>
          <div>Scale: {videoPosition.scale.toFixed(2)}</div>
          <div>Rotation: {videoPosition.rotation.toFixed(1)}°</div>
          <div>Size: {videoSize.width}px</div>
          <div>Header: {headerVisible ? '✓' : '✗'}</div>
          <div>Section 5: {isInSection5 ? '✓' : '✗'}</div>
          <div>Frame: {currentFrame}/{totalFrames}</div>
          <div>Section 3 Text: {section3TextVisible ? '✓ Visible' : '✗ Hidden'} ({section3TextPosition}, {section3TextVertical})</div>
          {error && <div className="debug-error">Error: {error}</div>}
        </div>
      )}
      {/* Fixed Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="fixed-video"
        style={{
          left: `${videoPosition.x}%`,
          top: `${videoPosition.y}%`,
          transform: `translate(-50%, -50%) scale(${videoPosition.scale}) rotate(${videoPosition.rotation}deg)`,
          width: `${videoSize.width}px`,
          height: videoSize.height
        }}
      />

      {/* Frame Sequence Canvas for Section 5 */}
      <canvas
        ref={canvasRef}
        className="frame-sequence-canvas"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          height: 'auto',
          zIndex: 10,
          pointerEvents: 'none',
          // Show during section 5 using state variable
          opacity: isInSection5 ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Header - Only visible on Section 1 */}
      <div className={`header ${headerVisible ? 'visible' : 'hidden'}`}>
        {/* Left Logo */}
        <div className="header-left">
          <img
            src="/kahuna-logo-3.svg"
            alt="Kahuna Logo"
            className="header-logo"
          />
        </div>

        {/* Right Let's Talk Button */}
        <button
          onClick={() => {
            console.log('Let\'s Talk button clicked!');
            // Add your contact/navigation logic here
          }}
          className="header-button"
        >
          Let's Talk
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="scroll-container"
      >
        {sections.map((section, index) => (
          <div
            key={index}
            className={`section ${section.isFooter ? 'footer' : ''}`}
            style={{
              background: section.background,
              border: section.border
            }}
          >
            {section.isFooter ? (
              // Footer UI from HeroScroll
              <div className="footer-container">
                {/* Main Tagline Section */}
                <img
                  src="/final-logo.svg"
                  alt="Kahuna Labs"
                  className="footer-logo-bg"
                />
                <div className="footer-tagline">
                  <div className="footer-tagline-text">
                    <div className="footer-tagline-line">Secure. Private. Comprehensive.</div>
                    <div className="footer-tagline-line">Enterprise Grade.</div>
                  </div>
                </div>

                {/* Footer Content */}
                <div className="footer-content">
                  <div className="footer-links">
                    {/* Technology Column */}
                    <div className="footer-column">
                      <h3 className="footer-column-title">TECHNOLOGY</h3>
                      <ul className="footer-links-list">
                        <li><a href="/technology/frontline-productivity" className="footer-link">Frontline Productivity</a></li>
                        <li><a href="/technology/agentic-ai-impact" className="footer-link">Estimate Agentic AI Impact</a></li>
                      </ul>
                    </div>

                    {/* Company Column */}
                    <div className="footer-column">
                      <h3 className="footer-column-title">COMPANY</h3>
                      <ul className="footer-links-list">
                        <li><a href="/contact" className="footer-link">Contact us</a></li>
                        <li><a href="/careers" className="footer-link">Careers</a></li>
                      </ul>
                    </div>

                    <div className="footer-column">
                      <a href="https://linkedin.com/company/kahuna-labs" target="_blank" rel="noopener noreferrer" className="footer-linkedin">
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
                    All rights reserved to Kahuna Labs. Copyright © 2025.
                  </div>
                  <div className="footer-copyright-text">
                    Made by Nester Labs
                  </div>
                </div>
              </div>
            ) : index === 1 ? (
              // Section 2 - No text box, just direct text content with higher z-index
              <div className="hero-text-content section-2-text">
                {/* First set of text */}
                <div className="hero-line-1 section-2">The support landscape is</div>
                <div className="hero-line-2 section-2">boundless and shifting</div>

                {/* Second set of text */}
                <div className="hero-line-3 section-2">You're lost</div>
                <div className="hero-line-4 section-2">&nbsp;</div>
                <div className="hero-line-5 section-2">Outdated, laborious</div>
                <div className="hero-line-6 section-2">and fractional knowledge</div>
                <div className="hero-line-7 section-2">cripple frontline actions</div>
              </div>
            ) : index === 2 ? (
              // Section 3 - "Meet Kahuna AI" text with zoom animation
              <div className={`section-3-text-container ${section3TextPosition === 'left' ? 'section-3-text-left' : ''} ${section3TextVertical === 'bottom' ? 'section-3-text-bottom' : ''}`}>
                <div className={`section-3-text ${section3TextVisible ? 'animate' : ''}`}>
                  Meet Kahuna AI
                </div>
              </div>
            ) : index === 3 ? (
              // Section 4 - "Meet Kahuna AI" text on left side
              <div className={`section-3-text-container ${section3TextPosition === 'left' ? 'section-3-text-left' : ''} ${section3TextVertical === 'bottom' ? 'section-3-text-bottom' : ''}`}>
                <div className={`section-3-text ${section3TextVisible ? 'animate' : ''}`}>
                  Meet Kahuna AI
                </div>
              </div>
            ) : (
              // Regular section content for other sections
              <div className={`section-content ${index === 0 ? 'section-first' : ''}`}>
                {index === 0 ? (
                  // Text content for first section
                  <div className="hero-text-content">
                    <div className="hero-line-1">Vast and intricate,</div>
                    <div className="hero-line-2">products never stop evolving</div>
                    <div className="hero-line-3">Enterprise customers have an</div>
                    <div className="hero-line-4">endless spectrum of realities</div>
                  </div>
                ) : (
                  <>
                    <div className="section-number">SECTION {index + 1}</div>
                    <h2 className="section-title">{section.title}</h2>
                    <p className="section-subtitle">{section.subtitle}</p>
                    <div className="section-scroll-hint">
                      <p className="section-scroll-text">
                        Scroll {index < sections.length - 1 ? '↓' : 'up ↑'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="scroll-indicator">
          {scrollIndicatorText}
        </div>
      )}

      {/* Debug Controls */}
      {showDebugControls && (
        <div className={`debug-controls ${debugControlsPosition}`}>
          <button
            onClick={() => {
              setVideoPosition({ x: 75, y: 50, scale: 1, rotation: 0 });
              console.log('Manual position set to right');
            }}
            className="debug-button primary"
          >
            Test Move Right
          </button>
          <button
            onClick={() => {
              setVideoPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
              console.log('Manual position set to center');
            }}
            className="debug-button primary"
          >
            Test Move Center
          </button>
          <button
            onClick={() => {
              setVideoPosition({ x: 50, y: 50, scale: 1, rotation: 45 });
              console.log('Manual rotation set to 45 degrees');
            }}
            className="debug-button purple"
          >
            Test 45° Rotation
          </button>
          <button
            onClick={() => {
              setVideoPosition({ x: 50, y: 50, scale: 1, rotation: -30 });
              console.log('Manual rotation set to -30 degrees');
            }}
            className="debug-button purple"
          >
            Test -30° Rotation
          </button>
          <button
            onClick={() => {
              setVideoSize({ width: 300, height: 'auto' });
              console.log('Video size set to small');
            }}
            className="debug-button purple"
          >
            Small Size
          </button>
          <button
            onClick={() => {
              setVideoSize({ width: 600, height: 'auto' });
              console.log('Video size set to large');
            }}
            className="debug-button purple"
          >
            Large Size
          </button>
          <button
            onClick={() => {
              // Test immediate size change
              const testSizes = [300, 400, 500, 600, 700];
              let index = 0;
              const interval = setInterval(() => {
                setVideoSize({ width: testSizes[index], height: 'auto' });
                console.log('Test size change to:', testSizes[index]);
                index++;
                if (index >= testSizes.length) {
                  clearInterval(interval);
                }
              }, 200);
            }}
            className="debug-button red"
          >
            Test Size Cycle
          </button>
          <button
            onClick={() => {
              setHeaderVisible(!headerVisible);
              console.log('Header visibility toggled:', !headerVisible);
            }}
            className={`debug-button ${headerVisible ? 'green' : 'red'}`}
          >
            {headerVisible ? 'Hide Header' : 'Show Header'}
          </button>
          <button
            onClick={() => {
              console.log('Retrying initialization...');
              setError(null);
              setIsInitialized(false);
              // Force re-render by updating a state
              window.location.reload();
            }}
            className="debug-button red"
          >
            Retry Init
          </button>
          <button
            onClick={() => {
              // Find the video element and toggle play/pause
              const videos = document.querySelectorAll('video');
              console.log('Found videos:', videos.length);
              videos.forEach((video, index) => {
                console.log(`Video ${index}:`, {
                  src: video.src,
                  paused: video.paused,
                  currentTime: video.currentTime,
                  duration: video.duration,
                  readyState: video.readyState
                });
                if (video.paused) {
                  video.play().catch(err => console.log('Play failed:', err));
                } else {
                  video.pause();
                }
              });
            }}
            className="debug-button green"
          >
            Toggle Video
          </button>
          <button
            onClick={() => {
              console.log('Video element:', videoRef.current);
              console.log('Video position state:', videoPosition);
              console.log('Scroll progress:', scrollProgress);
              if (videoRef.current) {
                console.log('Video properties:', {
                  src: videoRef.current.src,
                  paused: videoRef.current.paused,
                  currentTime: videoRef.current.currentTime,
                  duration: videoRef.current.duration,
                  readyState: videoRef.current.readyState,
                  videoWidth: videoRef.current.videoWidth,
                  videoHeight: videoRef.current.videoHeight
                });
              }
            }}
            className="debug-button blue"
          >
            Debug Info
          </button>
        </div>
      )}
    </div>
  );
}

export default ScrollSyncModel;
