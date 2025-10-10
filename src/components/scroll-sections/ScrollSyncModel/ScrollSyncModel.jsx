import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
  const [activeSection, setActiveSection] = React.useState(0);
  const [activeTextSetIndex, setActiveTextSetIndex] = React.useState({}); // Track which text set is active per section
  const canvasRef = useRef(null);
  const frameImagesRef = useRef({});
  const sectionRefs = useRef([]);
  const textSetTimersRef = useRef({}); // Store timers for text set cycling

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

    const drawImageToFullScreen = () => {
      // Set canvas size to full viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to completely fill screen (crop if necessary)
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight;
      
      if (imgAspect > canvasAspect) {
        // Image is wider - crop sides to fill height
        drawHeight = canvas.height;
        drawWidth = canvas.width;
        
        // Calculate source crop area to maintain aspect ratio
        sourceHeight = img.height;
        sourceWidth = img.height * canvasAspect;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image is taller - crop top/bottom to fill width
        drawWidth = canvas.width;
        drawHeight = canvas.height;
        
        // Calculate source crop area to maintain aspect ratio
        sourceWidth = img.width;
        sourceHeight = img.width / canvasAspect;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      // Draw image scaled and cropped to fill entire screen
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (crop area)
        0, 0, drawWidth, drawHeight                   // Destination rectangle (full screen)
      );
    };

    img.onload = () => {
      drawImageToFullScreen();
    };

    // If image is already loaded, draw it immediately
    if (img.complete) {
      drawImageToFullScreen();
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

  // Handle window resize for full-screen canvas
  useEffect(() => {
    const handleResize = () => {
      if (isInSection5 && currentFrame > 0) {
        // Redraw the current frame when window resizes
        renderFrame(currentFrame);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInSection5, currentFrame]);

  // Text animation effect - triggers when active section or text set index changes
  useEffect(() => {
    const section = sections[activeSection];
    if (!section || section.isFooter || !section.textSets) return;

    const sectionElement = sectionRefs.current[activeSection];
    if (!sectionElement) return;
    
    // Capture current timer reference for cleanup
    const currentSectionTimers = textSetTimersRef.current;

    // Get animation config with defaults
    const config = section.animationConfig || {
      type: 'fadeSlideUp',
      staggerDelay: 0.2,
      duration: 0.8,
      ease: 'power2.out'
    };

    // Helper function to animate text elements
    const animateTextElements = (textElements, animateIn = true) => {
      if (!textElements || !textElements.length) return;

      // Reset first
      gsap.set(textElements, { 
        opacity: 0,
        y: 0,
        x: 0,
        scale: 1
      });

      if (!animateIn) return; // If animating out, just keep them hidden

      // Convert NodeList to array for easier manipulation
      const elementsArray = Array.from(textElements);
      
      // Check for empty strings and split elements into groups
      let emptyStringIndex = -1;
      elementsArray.forEach((element, index) => {
        const text = element.textContent.trim();
        if (text === '' && emptyStringIndex === -1) {
          emptyStringIndex = index;
        }
      });

      // If there's an empty string, split animation into two groups
      if (emptyStringIndex !== -1) {
        // Group 1: Elements before and including the empty string
        const beforeEmpty = elementsArray.slice(0, emptyStringIndex + 1);
        // Group 2: Elements after the empty string
        const afterEmpty = elementsArray.slice(emptyStringIndex + 1);

        // Get delay for lines after empty string (default 4 seconds)
        const emptyLineDelay = config.emptyLineDelay || 4;

        // Animate first group immediately
        if (beforeEmpty.length > 0) {
          animateGroup(beforeEmpty, 0);
        }

        // Animate second group after delay
        if (afterEmpty.length > 0) {
          animateGroup(afterEmpty, emptyLineDelay);
        }
      } else {
        // No empty strings, animate all elements normally
        animateGroup(elementsArray, 0);
      }

      // Helper function to animate a group of elements with a delay
      function animateGroup(elements, delayOffset) {
        switch (config.type) {
          case 'fadeSlideUp':
            elements.forEach((element, index) => {
              gsap.fromTo(element, 
                { opacity: 0, y: 50 },
                {
                  opacity: 1,
                  y: 0,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          case 'fadeIn':
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          case 'slideLeft':
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0, x: 100 },
                {
                  opacity: 1,
                  x: 0,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          case 'slideRight':
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0, x: -100 },
                {
                  opacity: 1,
                  x: 0,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          case 'stagger':
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          case 'typewriter':
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0, x: -20 },
                {
                  opacity: 1,
                  x: 0,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
            break;

          default:
            elements.forEach((element, index) => {
              gsap.fromTo(element,
                { opacity: 0, y: 50 },
                {
                  opacity: 1,
                  y: 0,
                  duration: config.duration,
                  ease: config.ease,
                  delay: delayOffset + (index * config.staggerDelay)
                }
              );
            });
        }
      }
    };

    // Check if textSets is an object with multiple sets or a simple array
    const isMultipleSets = section.textSets && typeof section.textSets === 'object' && !Array.isArray(section.textSets);
    
    if (isMultipleSets) {
      // Handle multiple text sets with cycling
      const textSetKeys = Object.keys(section.textSets);
      const currentIndex = activeTextSetIndex[activeSection] || 0;
      const currentKey = textSetKeys[currentIndex];
      
      // Get timing config with defaults
      const timingConfig = section.textSetTiming || {
        displayDuration: 4000,      // How long to show each set (ms)
        fadeOutDuration: 0.5,       // Fade out duration (seconds)
        delayBetweenSets: 0.3,      // Delay between fade out and fade in (seconds)
        loop: true                   // Whether to loop back to first set
      };

      // Animate in current text set
      const currentTextElements = sectionElement.querySelectorAll(`.text-set-line[data-set="${currentKey}"]`);
      animateTextElements(currentTextElements, true);

      // Clear any existing timer for this section
      if (textSetTimersRef.current[activeSection]) {
        clearTimeout(textSetTimersRef.current[activeSection]);
      }

      // Check if we're on the last set
      const isLastSet = currentIndex === textSetKeys.length - 1;
      
      // Only set up cycling timer if:
      // - loop is enabled, OR
      // - we're not on the last set yet
      if (timingConfig.loop || !isLastSet) {
        // Set up timer to cycle to next text set
        textSetTimersRef.current[activeSection] = setTimeout(() => {
          // Fade out current text set
          gsap.to(currentTextElements, {
            opacity: 0,
            duration: timingConfig.fadeOutDuration,
            ease: 'power2.in',
            onComplete: () => {
              // Move to next text set after delay
              setTimeout(() => {
                const nextIndex = (currentIndex + 1) % textSetKeys.length;
                
                setActiveTextSetIndex(prev => ({
                  ...prev,
                  [activeSection]: nextIndex
                }));
              }, timingConfig.delayBetweenSets * 1000);
            }
          });
        }, timingConfig.displayDuration);
      }
      // If loop is false and we're on the last set, keep it visible permanently

    } else {
      // Handle simple array of text (original behavior)
      const textElements = sectionElement.querySelectorAll('.text-set-line');
      animateTextElements(textElements, true);
    }

    // Cleanup function
    return () => {
      if (currentSectionTimers && currentSectionTimers[activeSection]) {
        clearTimeout(currentSectionTimers[activeSection]);
      }
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, activeTextSetIndex]);

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

    // Get PNG sequence configuration based on viewport
    const getPNGSequenceConfig = () => {
      const viewport = getViewportSize();
      
      const pngSequenceConfigs = {
        'mobile-small': {
          startSection: 4,        // Start in Section 5 (index 4)
          startProgress: 0.2,     // Start when 20% into Section 5
          endSection: 4,          // End in Section 5 (index 4)
          endProgress: 1.0        // End at 100% of Section 5
        },
        'mobile-large': {
          startSection: 4,
          startProgress: 0.2,
          endSection: 4,
          endProgress: 1.0
        },
        'tablet': {
          startSection: 4,
          startProgress: 0.2,
          endSection: 4,
          endProgress: 1.0
        },
        'desktop': {
          startSection: 4,        // Start in Section 5 (index 4)
          startProgress: 0.0,     // Start immediately when entering Section 5
          endSection: 4,          // End in Section 5 (index 4)
          endProgress: 1.0        // End at 100% of Section 5
        },
        'large-desktop': {
          startSection: 4,
          startProgress: 0.0,
          endSection: 4,
          endProgress: 1.0
        }
      };
      
      return pngSequenceConfigs[viewport] || pngSequenceConfigs['desktop'];
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

      // Track active section for animations
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }

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

      // Calculate PNG sequence visibility and frame based on configuration
      const pngConfig = getPNGSequenceConfig();
      const shouldShowPNG = (() => {
        // Check if we're in the start section and past the start progress
        if (currentSection === pngConfig.startSection && sectionProgress >= pngConfig.startProgress) {
          return true;
        }
        // Check if we're transitioning to the start section and should start
        if (currentSection === pngConfig.startSection - 1 && nextSection === pngConfig.startSection && sectionProgress >= 0.8) {
          return true;
        }
        // Check if we're past the end section or past the end progress
        if (currentSection > pngConfig.endSection || 
            (currentSection === pngConfig.endSection && sectionProgress > pngConfig.endProgress)) {
          return false;
        }
        return false;
      })();

      if (shouldShowPNG) {
        setIsInSection5(true);
        
        // Calculate frame number based on progress within the PNG sequence range
        let sequenceProgress = 0;
        
        if (currentSection === pngConfig.startSection) {
          // We're in the start section
          sequenceProgress = (sectionProgress - pngConfig.startProgress) / (pngConfig.endProgress - pngConfig.startProgress);
        } else if (currentSection === pngConfig.startSection - 1 && nextSection === pngConfig.startSection) {
          // We're transitioning to the start section
          sequenceProgress = 0; // Start with first frame
        }
        
        // Clamp sequence progress between 0 and 1
        sequenceProgress = Math.max(0, Math.min(1, sequenceProgress));
        
        const frameNumber = Math.min(
          Math.max(1, Math.floor(sequenceProgress * totalFrames) + 1),
          totalFrames
        );
        
        setCurrentFrame(frameNumber);
        renderFrame(frameNumber);
        console.log('PNG Sequence - Frame:', frameNumber, 'Sequence Progress:', sequenceProgress, 'Section Progress:', sectionProgress);
      } else {
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


  // Get responsive content position configuration
  const getContentPositionConfig = () => {
    const viewport = (() => {
      const width = window.innerWidth;
      if (width <= 480) return 'mobile-small';
      if (width <= 767) return 'mobile-large';
      if (width <= 1023) return 'tablet';
      if (width <= 1924) return 'desktop';
      return 'large-desktop';
    })();
    
    const contentPositionConfigs = {
      'mobile-small': [
        { horizontal: 'center', vertical: 'center' },  // Section 1
        { horizontal: 'left', vertical: 'center' },    // Section 2
        { horizontal: 'center', vertical: 'center' },  // Section 3
        { horizontal: 'right', vertical: 'center' },   // Section 4
        { horizontal: 'center', vertical: 'top' }      // Section 5
      ],
      'mobile-large': [
        { horizontal: 'center', vertical: 'center' },  // Section 1
        { horizontal: 'left', vertical: 'center' },    // Section 2
        { horizontal: 'center', vertical: 'center' },  // Section 3
        { horizontal: 'right', vertical: 'center' },   // Section 4
        { horizontal: 'center', vertical: 'top' }      // Section 5
      ],
      'tablet': [
        { horizontal: 'center', vertical: 'center' },  // Section 1
        { horizontal: 'left', vertical: 'center' },    // Section 2
        { horizontal: 'center', vertical: 'center' },  // Section 3
        { horizontal: 'right', vertical: 'center' },   // Section 4
        { horizontal: 'center', vertical: 'top' }      // Section 5
      ],
      'desktop': [
        { horizontal: 'center', vertical: 'top' },     // Section 1
        { horizontal: 'left', vertical: 'center' },    // Section 2
        { horizontal: 'center', vertical: 'center' },  // Section 3
        { horizontal: 'right', vertical: 'center' },   // Section 4
        { horizontal: 'center', vertical: 'top' }      // Section 5
      ],
      'large-desktop': [
        { horizontal: 'center', vertical: 'top' },     // Section 1
        { horizontal: 'left', vertical: 'center' },    // Section 2
        { horizontal: 'center', vertical: 'center' },  // Section 3
        { horizontal: 'right', vertical: 'center' },   // Section 4
        { horizontal: 'center', vertical: 'top' }      // Section 5
      ]
    };
    
    return contentPositionConfigs[viewport] || contentPositionConfigs['desktop'];
  };

  const sections = [
    { 
      // Option 1: Use textSets with multiple cycling sets (NEW!)
      textSets: {
        set1: [
          'Vast and intricate,',
          'products never stop evolving.'
        ],
        set2: [
          'Enterprise customers have an',
          'endless spectrum of realities.'
        ]
      },
      
      // Timing configuration for text set cycling
      textSetTiming: {
        displayDuration: 4000,      // Show each set for 4 seconds
        fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
        delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
        loop: false                   // Loop back to first set after last
      },
      
      // Option 2: Use simple array (original behavior - no cycling)
      // textSets: [
      //   'Vast and intricate,',
      //   'products never stop evolving.'
      // ],
      
      // Animation configuration for this section's text
      animationConfig: {
        type: 'fadeSlideUp',     // Options: 'fadeSlideUp', 'fadeIn', 'slideLeft', 'slideRight', 'stagger', 'typewriter'
        staggerDelay: 0.3,        // Delay between each text line (for stagger effect)
        duration: 0.8,            // Animation duration
        ease: 'power2.out'        // GSAP ease function
      },
      
      // Text alignment configuration
      textAlign: 'center',       // Options: 'left', 'center', 'right'
      
      background: '#000000', 
      border: '1px solid #ffffff',
      hasHeader: showHeader,
      showNumber: false,
      showScrollHint: false
    },
    { 
      textSets: {
        set1: [
          'The support landscape is',
          'boundless and shifting'
        ],
        set2: [
          "You're lost.",
          "",
          'Outdated, laborious',
          'and fractional knowledge',
          "cripple frontline actions."
        ]
      },
      textSetTiming: {
        displayDuration: 4000,      // Show each set for 4 seconds
        fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
        delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
        loop: false                   // Loop back to first set after last
      },
      animationConfig: {
        type: 'stagger',
        staggerDelay: 0.2,
        duration: 0.6,
        ease: 'power3.out',
        emptyLineDelay: 4         // Delay in seconds before showing lines after empty string
      },
      textAlign: 'left',         // Left-aligned text for section 2
      background: '#000000', 
      border: '1px solid #ffffff',
      showNumber: false,
      showScrollHint: false
    },
    { 
      textSets: [
        'Meet Kahuna AI',
      ],
      textSetTiming: {
        displayDuration: 4000,      // Show each set for 4 seconds
        fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
        delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
        loop: false                   // Loop back to first set after last
      },
      animationConfig: {
        type: 'slideLeft',
        staggerDelay: 0.4,
        duration: 1,
        ease: 'power2.inOut'
      },
      textAlign: 'center',       // Center-aligned text
      background: '#000000', 
      border: '1px solid #ffffff',
      showNumber: false,
      showScrollHint: false
    },
    { 
      textSets: [
        'Discover',
        'Transform',
        'Succeed'
      ],
      textSetTiming: {
        displayDuration: 4000,      // Show each set for 4 seconds
        fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
        delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
        loop: false                   // Loop back to first set after last
      },
      animationConfig: {
        type: 'fadeIn',
        staggerDelay: 0.3,
        duration: 0.7,
        ease: 'power1.out'
      },
      textAlign: 'right',        // Right-aligned text
      background: '#000000', 
      border: '1px solid #ffffff',
      showNumber: false,
      showScrollHint: false
    },
    { 
      textSets: [
        'Experience the',
        'full view'
      ],
      textSetTiming: {
        displayDuration: 4000,      // Show each set for 4 seconds
        fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
        delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
        loop: false                   // Loop back to first set after last
      },
      animationConfig: {
        type: 'fadeSlideUp',
        staggerDelay: 0.25,
        duration: 0.8,
        ease: 'power2.out'
      },
      textAlign: 'center',       // Center-aligned text
      background: '#000000', 
      border: '1x solid #ffffff',
      showNumber: false,
      showScrollHint: false
    },
    ...(showFooter ? [{ 
      title: 'Footer', 
      subtitle: 'Contact & Links', 
      background: '#0A0A0A', 
      border: '1px solid #ffffff',
      isFooter: true
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
          <div>PNG Sequence: {isInSection5 ? '✓' : '✗'}</div>
          <div>Frame: {currentFrame}/{totalFrames}</div>
          <div>Start Section: {(() => {
            const viewport = window.innerWidth <= 480 ? 'mobile-small' : 
                           window.innerWidth <= 767 ? 'mobile-large' :
                           window.innerWidth <= 1023 ? 'tablet' :
                           window.innerWidth <= 1924 ? 'desktop' : 'large-desktop';
            const config = viewport === 'desktop' ? { startSection: 4, startProgress: 0.0 } : { startSection: 4, startProgress: 0.2 };
            return config.startSection + 1;
          })()}</div>
          <div>Start Progress: {(() => {
            const viewport = window.innerWidth <= 480 ? 'mobile-small' : 
                           window.innerWidth <= 767 ? 'mobile-large' :
                           window.innerWidth <= 1023 ? 'tablet' :
                           window.innerWidth <= 1924 ? 'desktop' : 'large-desktop';
            const config = viewport === 'desktop' ? { startProgress: 0.0 } : { startProgress: 0.2 };
            return (config.startProgress * 100).toFixed(0) + '%';
          })()}</div>
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

      {/* Frame Sequence Canvas for Section 5 - Full Screen */}
      <canvas
        ref={canvasRef}
        className="frame-sequence-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10,
          pointerEvents: 'none',
          // Show PNG sequence based on configuration
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
        {sections.map((section, index) => {
          const contentPosition = getContentPositionConfig()[index] || { horizontal: 'center', vertical: 'center' };
          
          return (
            <div
              key={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              className={`section ${section.isFooter ? 'footer' : ''} section-justify-${contentPosition.horizontal} section-align-${contentPosition.vertical}`}
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
                    {/* <div className="footer-copyright-text">
                      Made by Nester Labs
                    </div> */}
                  </div>
                </div>
              ) : (
                // Regular section content
                <div 
                  className="section-content"
                  style={{ 
                    textAlign: section.textAlign || 'center'  // Apply text alignment from config
                  }}
                >
                  {section.showNumber !== false && (
                    <div className="section-number">SECTION {index + 1}</div>
                  )}
                  
                  {/* Render textSets with animations if provided */}
                  {section.textSets ? (
                    <div className="text-sets-container">
                      {/* Check if textSets is an object with multiple sets or a simple array */}
                      {Array.isArray(section.textSets) ? (
                        // Simple array - original behavior
                        section.textSets.map((text, textIndex) => (
                          <div 
                            key={textIndex} 
                            className="text-set-line"
                            style={{ opacity: 0 }}
                          >
                            {text}
                          </div>
                        ))
                      ) : (
                        // Object with multiple sets - cycling behavior
                        // Render all sets, each in its own absolutely positioned group
                        Object.entries(section.textSets).map(([setKey, textArray]) => (
                          <div 
                            key={setKey}
                            className="text-set-group"
                            data-set={setKey}
                          >
                            {textArray.map((text, textIndex) => (
                              <div 
                                key={`${setKey}-${textIndex}`} 
                                className="text-set-line"
                                data-set={setKey}
                                style={{ opacity: 0 }}
                              >
                                {text}
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // Fallback to traditional title/subtitle if no textSets
                    <>
                      {section.title && <h2 className="section-title">{section.title}</h2>}
                      {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
                      {section.description && (
                        <p className="section-description">{section.description}</p>
                      )}
                    </>
                  )}
                  
                  {section.showScrollHint !== false && (
                    <div className="section-scroll-hint">
                      <p className="section-scroll-text">
                        Scroll {index < sections.length - 1 ? '↓' : 'up ↑'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
            const viewport = window.innerWidth <= 480 ? 'mobile-small' : 
                           window.innerWidth <= 767 ? 'mobile-large' :
                           window.innerWidth <= 1023 ? 'tablet' :
                           window.innerWidth <= 1924 ? 'desktop' : 'large-desktop';
            const config = viewport === 'desktop' ? { startSection: 4, startProgress: 0.0, endSection: 4, endProgress: 1.0 } : { startSection: 4, startProgress: 0.2, endSection: 4, endProgress: 1.0 };
            console.log('PNG Sequence Config:', config);
            console.log('Current Section:', Math.floor(scrollProgress * (showFooter ? 6 : 5)));
            console.log('Section Progress:', scrollProgress * (showFooter ? 6 : 5) - Math.floor(scrollProgress * (showFooter ? 6 : 5)));
            console.log('Should Show PNG:', isInSection5);
            console.log('Current Frame:', currentFrame);
          }}
          className="debug-button blue"
        >
          PNG Debug Info
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
          Video Debug Info
        </button>
      </div>
      )}
    </div>
  );
}

export default ScrollSyncModel;
