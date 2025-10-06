import React, { useEffect, useRef } from 'react';

function ScrollSyncModel() {
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [videoPosition, setVideoPosition] = React.useState({ x: 0, y: 0, scale: 1 });
  const [videoSize, setVideoSize] = React.useState({ width: 400, height: 'auto' });
  const [showHeader, setShowHeader] = React.useState(true);

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
      // Section 6: Footer section - hide video
      section6: { width: 0, height: 'auto' }
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
      const sectionIndex = scrollProgress * 5; // 0 to 5 (6 sections total)
      const currentSection = Math.floor(sectionIndex);
      const nextSection = Math.min(currentSection + 1, 5);
      const sectionProgress = sectionIndex - currentSection;

      // Interpolate between current and next position
      const currentPos = positions[currentSection];
      const nextPos = positions[nextSection];

      const newX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      const newY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;

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
      const sizeKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'];
      const currentSizeKey = sizeKeys[currentSection];
      const nextSizeKey = sizeKeys[nextSection];

      const currentSize = videoSizeConfig[currentSizeKey];
      const nextSize = videoSizeConfig[nextSizeKey];

      // Interpolate between current and next size
      const newWidth = currentSize.width + (nextSize.width - currentSize.width) * sectionProgress;

      // Update video position and size state
      setVideoPosition({ x: newX, y: newY, scale });
      setVideoSize({ width: newWidth, height: 'auto' });

      // Show header only during section 1 (first 20% of scroll)
      setShowHeader(scrollProgress < 0.2);

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
  }, []);


  const sections = [
    { 
      title: 'Section 1', 
      subtitle: 'Model at Center', 
      background: '#000000', 
      border: '2px solid #ffffff',
      hasHeader: true // Add header flag for section 1
    },
    { title: 'Section 2', subtitle: 'Model moves Right', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 3', subtitle: 'Model moves Down', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 4', subtitle: 'Model moves Left', background: '#000000', border: '2px solid #ffffff' },
    { title: 'Section 5', subtitle: 'Model moves Up', background: '#000000', border: '2px solid #ffffff' },
    { 
      title: 'Footer', 
      subtitle: 'Contact & Links', 
      background: '#0A0A0A', 
      border: '2px solid #ffffff',
      isFooter: true // Add footer flag for section 6
    }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Debug Info */}
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
        <div>Header: {showHeader ? '✓' : '✗'}</div>
        {error && <div style={{ color: '#ff6b6b' }}>Error: {error}</div>}
      </div>
      {/* Fixed Video */}
      <video
        ref={videoRef}
        src="/hero1.mp4"
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
        height: '80px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 15,
        transition: 'opacity 0.3s ease',
        opacity: showHeader ? 1 : 0,
        pointerEvents: showHeader ? 'auto' : 'none'
      }}>
        {/* Left Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}>
          <img 
            src="/kahuna-logo.svg" 
            alt="Kahuna Logo" 
            style={{
              height: '40px',
              width: 'auto',
              filter: 'brightness(0) invert(1)' // Make logo white
            }}
            onError={(e) => {
              // Fallback to final-logo.svg if kahuna-logo.svg fails
              e.target.src = '/final-logo.svg';
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
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'none',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = 'black';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
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
          scrollBehavior: 'smooth'
        }}
      >
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: section.isFooter ? 'flex-end' : 'left',
              background: section.background,
              border: section.border,
              boxSizing: 'border-box',
              paddingTop: section.hasHeader ? '80px' : '0', // Add top padding for header
              flexDirection: section.isFooter ? 'column' : 'row'
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
                padding: '4rem',
                boxSizing: 'border-box'
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
                <div style={{ marginBottom: '50px' }}>
                  <div style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '3.5rem',
                    fontWeight: '600',
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
                  marginBottom: '4rem'
                }}>
                  <div style={{ display: 'flex', gap: '120px' }}>
                    {/* Technology Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <h3 style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#AAAAAA',
                        marginBottom: '12px',
                        margin: '0 0 12px 0'
                      }}>TECHNOLOGY</h3>
                      <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', color: '#838485' }}>
                        <li><a href="/technology/frontline-productivity" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Frontline Productivity</a></li>
                        <li><a href="/technology/agentic-ai-impact" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Estimate Agentic AI Impact</a></li>
                      </ul>
                    </div>

                    {/* Company Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <h3 style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#AAAAAA',
                        marginBottom: '12px',
                        margin: '0 0 12px 0'
                      }}>COMPANY</h3>
                      <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', color: '#838485' }}>
                        <li><a href="/contact" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Contact us</a></li>
                        <li><a href="/careers" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left', display: 'block' }}>Careers</a></li>
                      </ul>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <a href="https://linkedin.com/company/kahuna-labs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#838485', textDecoration: 'none', transition: 'color 0.3s ease', textAlign: 'left' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: '#838485', borderRadius: '4px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', fontFamily: "'Inter', sans-serif" }}>in</span>
                        </div>
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>

                  {/* Kahuna Labs Logo */}
                  <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/final-logo.svg" alt="Kahuna Labs" style={{ width: '34px', height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                      <span style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '1rem', fontWeight: '400', color: '#FFFFFF' }}>Kahuna Labs</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Copyright Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '0.875rem', fontWeight: '400', color: '#414243' }}>
                    All rights reserved to Kahuna Labs. Copyright © 2025.
                  </div>
                  <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '0.875rem', fontWeight: '400', color: '#414243' }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
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
        ))}
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.875rem'
      }}>
        Scroll to see the model move through sections
      </div>

      {/* Debug Controls */}
      <div style={{
        position: 'fixed',
        top: '6rem',
        right: '2rem',
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
            setShowHeader(!showHeader);
            console.log('Header visibility toggled:', !showHeader);
          }}
          style={{
            padding: '0.5rem',
            backgroundColor: showHeader ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          {showHeader ? 'Hide Header' : 'Show Header'}
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
      </div>
    </div>
  );
}

export default ScrollSyncModel;
