import React, { useEffect, useRef } from 'react';

function ScrollSyncModel({
  showScrollIndicator = false,
  showDebugControls = false,
  showDebugInfo = false,
  showHeader = true,
  showFooter = true,
  scrollIndicatorText = "Scroll to see the model move through sections",
  debugControlsPosition = "top-right",
  videoSrc = "/hero5555.mp4"
}) {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [videoPosition, setVideoPosition] = React.useState({ x: 0, y: 0, scale: 1 });
  const [videoSize, setVideoSize] = React.useState({ width: 400, height: 'auto' });
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [textRevealProgress, setTextRevealProgress] = React.useState(0);
  const [currentPhase, setCurrentPhase] = React.useState(1); // 1, 2, 3
  const [currentTextSet, setCurrentTextSet] = React.useState(0); // 0 for original, 1 for new

  // No more scroll locking - text reveals in sync with scroll like Terminal Industries

  // Letter reveal animation effect
  useEffect(() => {
    const wrapLetters = (element) => {
      const text = element.textContent;
      element.innerHTML = "";
      for (let char of text) {
        const span = document.createElement("span");
        span.classList.add("letter");
        if (char === ' ') {
          span.innerHTML = "&nbsp;";
        } else {
          span.textContent = char;
        }
        element.appendChild(span);
      }
    };

    // Initialize letter wrapping for reveal text
    const revealTexts = document.querySelectorAll(".reveal-text");
    revealTexts.forEach(line => wrapLetters(line));

    const letters = document.querySelectorAll(".letter");

    // Set initial state - all letters invisible
    letters.forEach(letter => {
      letter.style.opacity = "0";
      letter.style.color = "#fff";
    });

    // No more wheel event blocking - text reveals based on scroll position
  }, [isInitialized]);

  // Trigger text reveal when progress changes - Single Unified Timeline with proper rewind support
  useEffect(() => {
    if (isInitialized) {
      const letters = document.querySelectorAll(".letter");
      if (letters.length > 0) {
        const totalLetters = letters.length;

        // Single timeline: 0-40% reveal first text, 40-60% hide first text, 60-100% reveal second text
        // Further adjusted timing to ensure enterprise text fully reveals before scroll up
        let phaseNumber, currentPhaseProgress;
        if (textRevealProgress < 0.4) {
          phaseNumber = 1;
          currentPhaseProgress = textRevealProgress / 0.4; // 0-100% of first text reveal
        } else if (textRevealProgress < 0.6) {
          phaseNumber = 2;
          currentPhaseProgress = (textRevealProgress - 0.4) / 0.2; // 0-100% of first text hide
        } else {
          phaseNumber = 3;
          currentPhaseProgress = (textRevealProgress - 0.6) / 0.4; // 0-100% of second text reveal (40% time for enterprise text)
        }

        // Update current phase
        if (phaseNumber !== currentPhase) {
          setCurrentPhase(phaseNumber);
          console.log(`Phase ${phaseNumber} started`);

          // Switch to new text at the start of Phase 3 (60% progress) - FORWARD DIRECTION
          if (phaseNumber === 3 && currentTextSet === 0) {
            setCurrentTextSet(1);
            console.log('Switching to new text set at 60% progress (forward)');

            // Re-initialize letters for new text - ensure all start invisible
            setTimeout(() => {
              const newRevealTexts = document.querySelectorAll(".reveal-text");
              newRevealTexts.forEach(line => {
                const text = line.textContent;
                line.innerHTML = "";
                for (let char of text) {
                  const span = document.createElement("span");
                  span.classList.add("letter");
                  if (char === ' ') {
                    span.innerHTML = "&nbsp;";
                  } else {
                    span.textContent = char;
                  }
                  // Ensure all letters start completely invisible
                  span.style.opacity = "0";
                  span.style.color = "#fff";
                  span.style.visibility = "hidden";
                  line.appendChild(span);
                }
              });
              console.log('New text letters initialized - all invisible');
            }, 1);
          }
          // Switch back to original text when going back to Phase 2 (60% progress) - REVERSE DIRECTION
          else if (phaseNumber === 2 && currentTextSet === 1) {
            setCurrentTextSet(0);
            console.log('Switching back to original text set at 60% progress (reverse)');

            // Re-initialize letters for original text - ensure all start invisible
            setTimeout(() => {
              const newRevealTexts = document.querySelectorAll(".reveal-text");
              newRevealTexts.forEach(line => {
                const text = line.textContent;
                line.innerHTML = "";
                for (let char of text) {
                  const span = document.createElement("span");
                  span.classList.add("letter");
                  if (char === ' ') {
                    span.innerHTML = "&nbsp;";
                  } else {
                    span.textContent = char;
                  }
                  // Ensure all letters start completely invisible
                  span.style.opacity = "0";
                  span.style.color = "#fff";
                  span.style.visibility = "hidden";
                  line.appendChild(span);
                }
              });
              console.log('Original text letters re-initialized - all invisible');
            }, 1);
          }
        }

        // Phase 1 (0-40%): Reveal original text "vast to evolving"
        if (phaseNumber === 1) {
          const revealCount = Math.floor(currentPhaseProgress * totalLetters);

          letters.forEach((span, i) => {
            if (i < revealCount) {
              span.style.opacity = "1";
              span.style.color = "#fff";
              span.style.visibility = "visible";
              span.classList.remove("active");
            } else if (i === revealCount && revealCount < totalLetters) {
              span.style.opacity = "1";
              span.style.color = "#0020B0"; // Kahuna blue
              span.style.visibility = "visible";
              span.classList.add("active");
            } else {
              span.style.opacity = "0";
              span.style.color = "#fff";
              span.style.visibility = "hidden";
              span.classList.remove("active");
            }
          });
        }

        // Phase 2 (40-60%): Hide original text "vast to evolving" - works in both directions
        else if (phaseNumber === 2) {
          const hideCount = Math.floor(currentPhaseProgress * totalLetters);

          letters.forEach((span, i) => {
            if (i < hideCount) {
              span.style.opacity = "0";
              span.style.color = "#fff";
              span.style.visibility = "hidden";
              span.classList.remove("active");
            } else {
              span.style.opacity = "1";
              span.style.color = "#fff";
              span.style.visibility = "visible";
              span.classList.remove("active");
            }
          });
        }

        // Phase 3 (60-100%): Show new text "enterprise to reality" - works in both directions
        else if (phaseNumber === 3) {
          // Get current letters (could be new text or original text depending on direction)
          const currentLetters = document.querySelectorAll(".letter");
          const revealCount = Math.floor(currentPhaseProgress * currentLetters.length);

          currentLetters.forEach((span, i) => {
            if (i < revealCount) {
              span.style.opacity = "1";
              span.style.color = "#fff";
              span.style.visibility = "visible";
              span.classList.remove("active");
            } else if (i === revealCount && revealCount < currentLetters.length) {
              span.style.opacity = "1";
              span.style.color = "#0020B0"; // Kahuna blue
              span.style.visibility = "visible";
              span.classList.add("active");
            } else {
              span.style.opacity = "0";
              span.style.color = "#fff";
              span.style.visibility = "hidden";
              span.classList.remove("active");
            }
          });
        }
      }
    }
  }, [textRevealProgress, isInitialized, currentPhase, currentTextSet]);

  useEffect(() => {
    // Video size configuration for different sections
    const videoSizeConfig = {
      // Section 1: Small and centered
      section1: { width: 1100, height: 'auto' },
      // Section 2: Medium size when moving right
      section2: { width: 1100, height: 'auto' },
      // Section 3: Large when at bottom
      section3: { width: 1300, height: 'auto' },
      // Section 4: Medium when moving left
      section4: { width: 600, height: 'auto' },
      // Section 5: Extra large when at top
      section5: { width: 600, height: 'auto' },
      // Section 6: Footer section - hide video (only if footer is enabled)
      ...(showFooter && { section6: { width: 0, height: 'auto' } })
    };
    let isMounted = true;

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

    // Wheel event handler to control scroll during text reveal
    const handleWheel = (e) => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const firstSectionHeight = scrollContainer.clientHeight;
      const firstSectionScrollHeight = firstSectionHeight * 1.5; // Account for 150vh height
      const isInFirstSection = scrollTop < firstSectionScrollHeight;

      // Calculate text reveal progress - faster reveal
      let textRevealProgress = 0;
      if (isInFirstSection) {
        textRevealProgress = Math.max(0, Math.min(1, scrollTop / (firstSectionScrollHeight * 0.15))); // Much faster reveal
      }

      // Calculate max scroll for text reveal
      const maxScrollForTextReveal = firstSectionScrollHeight * 0.15;

      // If we're in first section and text is not fully revealed, control scroll precisely
      if (isInFirstSection && textRevealProgress < 1) {
        // Prevent default scroll behavior
        e.preventDefault();
        e.stopPropagation();

        // Calculate text reveal progress based on scroll input - faster and smoother
        const scrollDelta = e.deltaY * 0.8; // Higher sensitivity for faster text reveal
        const newScrollTop = Math.min(Math.max(scrollTop + scrollDelta, 0), maxScrollForTextReveal);

        // Update scroll position for text reveal only
        scrollContainer.scrollTop = newScrollTop;

        console.log('Text revealing - controlling scroll for text reveal, progress:', textRevealProgress);
        return false;
      }

      // If text is fully revealed, allow normal scrolling
      if (isInFirstSection && textRevealProgress >= 1) {
        console.log('Text fully revealed - allowing normal page scroll to next section');
        // Don't prevent default - allow normal scroll behavior
        return;
      }

      // If we're not in first section, allow normal scrolling
      if (!isInFirstSection) {
        console.log('Not in first section - allowing normal page scroll');
        return;
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

        // Add wheel event listener to control scroll during text reveal
        scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

        // Add touch event listeners for mobile
        scrollContainer.addEventListener('touchmove', handleWheel, { passive: false });

        handleScroll(); // Set initial position

        console.log('Scroll and wheel listeners attached successfully');
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

      // Check if we're in the first section and text is still revealing
      const firstSectionHeight = scrollContainer.clientHeight;
      const firstSectionScrollHeight = firstSectionHeight * 1.5; // Account for 150vh height of first section
      const isInFirstSection = scrollTop < firstSectionScrollHeight;

      // Calculate text reveal progress - faster and smoother
      let textRevealProgress = 0;
      if (isInFirstSection) {
        const maxTextRevealScroll = firstSectionScrollHeight * 0.2; // Reduced from 0.3 to 0.2 for faster reveal
        textRevealProgress = Math.max(0, Math.min(1, scrollTop / maxTextRevealScroll));
        console.log('Text reveal calculation:', {
          scrollTop,
          maxTextRevealScroll,
          textRevealProgress: (textRevealProgress * 100).toFixed(1) + '%'
        });
      }

      // Calculate max scroll for text reveal
      const maxScrollForTextReveal = firstSectionScrollHeight * 0.15;

      // Calculate scroll progress based on text reveal status
      let scrollProgress;
      if (isInFirstSection && textRevealProgress < 1) {
        // Keep page completely static during text reveal
        scrollProgress = 0; // Page stays at first section
        console.log('Text still revealing, keeping page static at scroll progress:', scrollProgress);
      } else {
        // Normal scroll progress after text is fully revealed OR when not in first section
        scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
        console.log('Text fully revealed or not in first section - normal scroll progress:', scrollProgress);
      }

      console.log('Scroll progress:', scrollProgress, 'ScrollTop:', scrollTop, 'MaxScroll:', maxScroll, 'TextRevealProgress:', textRevealProgress);

      // Update state for UI display
      setScrollProgress(scrollProgress);

      // Set text reveal progress
      setTextRevealProgress(textRevealProgress);

      // Define positions for each section (convert to CSS percentages)
      const positions = [
        { x: 50, y: 135 },      // Section 1 - Bottom
        { x: 95, y: 60 },      // Section 2 - Right
        { x: 50, y: 50 },      // Section 3 - center
        { x: 50, y: 50 },      // Section 4 - Left
        { x: 50, y: 50 },      // Section 5 - Top
        { x: 50, y: 50 }       // Section 6 - Footer (center)
      ];

      // Calculate which section we're in and interpolate
      const totalSections = showFooter ? 6 : 5; // Dynamic sections based on footer
      const sectionIndex = scrollProgress * (totalSections - 1); // 0 to totalSections-1
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, totalSections - 1);
      const sectionProgress = sectionIndex - currentSection;

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      let newX, newY;

      // If we're in first section and text is still revealing, keep video position static
      if (isInFirstSection && textRevealProgress < 1) {
        // Keep video at first section position during text reveal
        newX = currentPos.x;
        newY = currentPos.y;
        console.log('Text revealing - keeping video position static at:', newX, newY);
      } else {
        // Normal video movement after text is fully revealed OR when not in first section
        newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
        newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
        console.log('Text fully revealed or not in first section - normal video movement to:', newX, newY);
      }

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
      let newWidth;

      // If we're in first section and text is still revealing, keep video size static
      if (isInFirstSection && textRevealProgress < 1) {
        // Keep video size static during text reveal
        newWidth = currentSize.width;
        console.log('Text revealing - keeping video size static at:', newWidth);
      } else {
        // Normal video size change after text is fully revealed OR when not in first section
        newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;
        console.log('Text fully revealed or not in first section - normal video size change to:', newWidth);
      }

      // Update video position and size state
      setVideoPosition({ x: newX, y: newY, scale });
      setVideoSize({ width: newWidth, height: 'auto' });

      // Show header only during section 1 (first 20% of scroll) and if showHeader prop is true
      // Also keep header visible during text reveal
      const shouldShowHeader = showHeader && (scrollProgress < 0.2 || (isInFirstSection && textRevealProgress < 1));
      setHeaderVisible(shouldShowHeader);

      console.log('Video position and size updated:', {
        x: newX,
        y: newY,
        scale,
        width: newWidth,
        section: currentSection,
        progress: sectionProgress,
        scrollProgress: scrollProgress,
        currentSize: currentSize.width,
        nextSize: nextSize.width
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
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('touchmove', handleWheel);
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
  }, [showFooter, showHeader]);


  const sections = [
    {
      title: 'Section 1',
      subtitle: 'Model at Center',
      background: '#000000',
      border: '2px solid #ffffff',
      hasHeader: showHeader // Use prop for header visibility
    },
    { title: 'Section 2', subtitle: 'Model moves Right', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 3', subtitle: 'Model moves Down', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 4', subtitle: 'Model moves Left', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 5', subtitle: 'Model moves Up', background: '#000000', border: '2px solid #ffffff' },
    ...(showFooter ? [{
      title: 'Footer',
      subtitle: 'Contact & Links',
      background: '#0A0A0A',
      border: '2px solid #ffffff',
      isFooter: true // Add footer flag for section 6
    }] : [])
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* CSS for letter animation */}
      <style>
        {`
          .letter {
            opacity: 0;
            display: inline-block;
            color: #fff;
            transition: color 0.1s ease-out, opacity 0.1s ease-out; // Faster, smoother transitions
          }
          .letter.active {
            color: #0020B0;
          }
        `}
      </style>
      {/* Debug Info */}
      {showDebugInfo && (
        <div style={{
          position: 'fixed',
          top: '6rem',
          left: '2rem',
          zIndex: 20,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <div>ScrollSyncModel Status</div>
          <div>Initialized: {isInitialized ? '✓' : '✗'}</div>
          <div>Video: {videoRef.current ? '✓' : '✗'}</div>
          <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
          <div>Position: ({videoPosition.x.toFixed(1)}%, {videoPosition.y.toFixed(1)}%)</div>
          <div>Scale: {videoPosition.scale.toFixed(2)}</div>
          <div>Size: {videoSize.width}px</div>
          <div>Header: {headerVisible ? '✓' : '✗'}</div>
          {error && <div style={{ color: '#ff6b6b' }}>Error: {error}</div>}
        </div>
      )}
      {/* Fixed Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        style={{
          position: 'fixed',
          left: `${videoPosition.x}%`,
          top: `${videoPosition.y}%`,
          transform: `translate(-50%, -50%) scale(${videoPosition.scale})`,
          width: `${videoSize.width}px`,
          height: videoSize.height,
          pointerEvents: 'none',
          zIndex: 5,
          objectFit: 'contain'
        }}
      />

      {/* Header - Only visible on Section 1 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '36px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '40px 80px',
        zIndex: 15,
        transition: 'opacity 0.3s ease',
        opacity: headerVisible ? 1 : 0,
        pointerEvents: headerVisible ? 'auto' : 'none'
      }}>
        {/* Left Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}>
          <img
            src="/kahuna-logo-3.svg"
            alt="Kahuna Logo"
            style={{
              height: '36px',
              width: 'auto',
            }}
          />
        </div>

        {/* Right Let's Talk Button */}
        <button
          onClick={() => {
            console.log('Let\'s Talk button clicked!');
            // Add your contact/navigation logic here
          }}
          style={{
            backgroundColor: '#0020B0',
            color: 'white',
            borderRadius: '4px',
            padding: '11px 16px',
            fontSize: '12.8px',
            fontWeight: '400',
            fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'none',
            letterSpacing: '0.5px',
            border: "none"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = 'black';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#0020B0';
            e.target.style.color = 'white';
          }}
        >
          Let's Talk
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          scrollSnapType: 'y mandatory'
        }}
      >
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              height: index === 0 ? '150vh' : '100vh', // Reduced height for faster page scroll
              display: 'flex',
              alignItems: 'center', // Always center content
              justifyContent: section.isFooter ? 'flex-end' : 'center',
              background: section.background,
              border: section.border,
              boxSizing: 'border-box',
              paddingTop: '0', // Remove padding to center properly
              flexDirection: section.isFooter ? 'column' : 'row',
              scrollSnapAlign: 'start'
            }}
          >
            {section.isFooter ? (
              // Footer UI from HeroScroll
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '60px 80px',
                boxSizing: 'border-box',
                position: "relative"
              }}>
                {/* Main Tagline Section */}
                <img
                  src="/final-logo.svg"
                  alt="Kahuna Labs"
                  style={{
                    position: 'absolute',
                    top: '-120px',
                    left: '4rem',
                    width: '286px',
                    height: '317px',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    opacity: '0.1'
                  }}
                />
                <div style={{ marginBottom: '117px' }}>
                  <div style={{
                    fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '56px',
                    fontWeight: '400',
                    lineHeight: '1.1',
                    margin: '0',
                    color: '#FFFFFF'
                  }}>
                    <div style={{ display: 'block' }}>Secure. Private. Comprehensive.</div>
                    <div style={{ display: 'block' }}>Enterprise Grade.</div>
                  </div>
                </div>

                {/* Footer Content */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  width: '100%',
                  marginBottom: '92px'
                }}>
                  <div style={{ display: 'flex', gap: '100px' }}>
                    {/* Technology Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <h3 style={{
                        fontFamily: "JetBrains Mono",
                        // fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '14px',
                        fontWeight: '400',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        marginBottom: '12px',
                        margin: '0 0 12px 0'
                      }}>TECHNOLOGY</h3>
                      <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', color: '#838485' }}>
                        <li><a href="/technology/frontline-productivity" style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#818181 ', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Frontline Productivity</a></li>
                        <li><a href="/technology/agentic-ai-impact" style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#818181 ', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Estimate Agentic AI Impact</a></li>
                      </ul>
                    </div>

                    {/* Company Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <h3 style={{
                        fontFamily: "JetBrains Mono",
                        // fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '14px',
                        fontWeight: '400',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        marginBottom: '12px',
                        margin: '0 0 12px 0'
                      }}>COMPANY</h3>
                      <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', color: '#838485' }}>
                        <li><a href="/contact" style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#818181', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Contact us</a></li>
                        <li><a href="/careers" style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#818181', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Careers</a></li>
                      </ul>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <a href="https://linkedin.com/company/kahuna-labs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#838485', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left' }}>
                        <img
                          src="/LinkedIn-Icon.png"
                          alt="LinkedIn"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                            filter: 'brightness(0) saturate(100%) invert(51%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
                          }}
                        />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>

                  {/* Kahuna Labs Logo */}
                  <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src="/kahuna-logo-3.svg" alt="Kahuna Labs" />
                      {/* <span style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF' }}>Kahuna Labs</span> */}
                    </div>
                  </div>
                </div>

                {/* Bottom Copyright Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#414243' }}>
                    All rights reserved to Kahuna Labs. Copyright © 2025.
                  </div>
                  <div style={{ fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '20px', fontWeight: '500', color: '#414243' }}>
                    Made by Nester Labs
                  </div>
                </div>
              </div>
            ) : (
              // Regular section content
              <div style={{
                textAlign: 'center',
                zIndex: 10,
                padding: '2rem',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'transparent',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: index === 0 ? '80%' : 'auto',
                maxWidth: index === 0 ? '800px' : 'none',
                // Text container positioning - relative for all sections
                position: 'relative',
                top: 'auto',
                left: 'auto',
                transform: 'none',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}>
                {index === 0 ? (
                  // Custom text for first section with 4-phase reveal animation
                  <div>
                    {currentTextSet === 0 ? (
                      // Original text set
                      <>
                        <h1 className="reveal-text" style={{
                          fontSize: '3rem',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          margin: '10px 0',
                          whiteSpace: 'nowrap',
                          fontWeight: '600',
                          color: 'white',
                          fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        }}>Vast and intricate</h1>
                        <h1 className="reveal-text" style={{
                          fontSize: '3rem',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          margin: '10px 0',
                          whiteSpace: 'nowrap',
                          fontWeight: '600',
                          color: 'white',
                          fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        }}>product never stop evolving</h1>
                      </>
                    ) : (
                      // New text set
                      <>
                        <h1 className="reveal-text" style={{
                          fontSize: '3rem',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          margin: '10px 0',
                          whiteSpace: 'nowrap',
                          fontWeight: '600',
                          color: 'white',
                          fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        }}>Enterprise customers have an</h1>
                        <h1 className="reveal-text" style={{
                          fontSize: '3rem',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          margin: '10px 0',
                          whiteSpace: 'nowrap',
                          fontWeight: '600',
                          color: 'white',
                          fontFamily: "'Prodigy Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        }}>endless spectrum of reality</h1>
                      </>
                    )}
                  </div>
                ) : (
                  // Original content for other sections
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '1rem',
                      fontWeight: 'bold'
                    }}>SECTION {index + 1}</div>
                    <h2 style={{
                      fontSize: '3.75rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '1rem'
                    }}>{section.title}</h2>
                    <p style={{
                      fontSize: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>{section.subtitle}</p>
                    <div style={{ marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      <p style={{ fontSize: '0.875rem' }}>
                        Scroll {index < sections.length - 1 ? '↓' : 'up ↑'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem'
        }}>
          {scrollIndicatorText}
        </div>
      )}

      {/* Debug Info for Text Reveal */}
      {showDebugInfo && (
        <div style={{
          position: 'fixed',
          top: '10rem',
          left: '2rem',
          zIndex: 20,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <div>Text Reveal Status</div>
          <div>Current Phase: {currentPhase}/3</div>
          <div>Text Set: {currentTextSet === 0 ? 'Original' : 'New'}</div>
          <div>Reveal Progress: {(textRevealProgress * 100).toFixed(1)}%</div>
          <div>Letters Count: {document.querySelectorAll('.letter').length}</div>
        </div>
      )}

      {/* Debug Controls */}
      {showDebugControls && (
        <div style={{
          position: 'fixed',
          top: debugControlsPosition === 'top-left' ? '6rem' : '6rem',
          right: debugControlsPosition === 'top-right' ? '2rem' : 'auto',
          left: debugControlsPosition === 'top-left' ? '2rem' : 'auto',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => {
              setVideoPosition({ x: 75, y: 50, scale: 1 });
              console.log('Manual position set to right');
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Move Right
          </button>
          <button
            onClick={() => {
              setVideoPosition({ x: 50, y: 50, scale: 1 });
              console.log('Manual position set to center');
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Move Center
          </button>
          <button
            onClick={() => {
              setVideoSize({ width: 300, height: 'auto' });
              console.log('Video size set to small');
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(168, 85, 247, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Small Size
          </button>
          <button
            onClick={() => {
              setVideoSize({ width: 600, height: 'auto' });
              console.log('Video size set to large');
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(168, 85, 247, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
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
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Size Cycle
          </button>
          <button
            onClick={() => {
              setHeaderVisible(!headerVisible);
              console.log('Header visibility toggled:', !headerVisible);
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: headerVisible ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
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
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 107, 107, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
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
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
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
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Debug Info
          </button>
          <button
            onClick={() => {
              console.log('Testing Phase Reset...');
              setCurrentPhase(1);
              setCurrentTextSet(0);
              setTextRevealProgress(0);
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(168, 85, 247, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Reset Phases
          </button>
          <button
            onClick={() => {
              console.log('Testing Phase 2 (Hide first text)...');
              setCurrentPhase(2);
              setCurrentTextSet(0);
              setTextRevealProgress(0.5); // Middle of Phase 2
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Phase 2
          </button>
          <button
            onClick={() => {
              console.log('Testing Phase 3 (Reveal second text)...');
              setCurrentPhase(3);
              setCurrentTextSet(1);
              setTextRevealProgress(0.7); // Middle of Phase 3
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Phase 3
          </button>
          <button
            onClick={() => {
              console.log('Testing Reality Complete...');
              setCurrentPhase(3);
              setCurrentTextSet(1);
              setTextRevealProgress(1.0); // Complete
            }}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Test Reality Complete
          </button>
        </div>
      )}
    </div>
  );
}

export default ScrollSyncModel;
