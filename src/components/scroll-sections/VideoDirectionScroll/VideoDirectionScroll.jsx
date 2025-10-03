import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './VideoDirectionScroll.css';

gsap.registerPlugin(ScrollTrigger);

const VideoDirectionScroll = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.video-direction-section');
    const videos = gsap.utils.toArray('.video-direction-element');

    // Optional: set default ScrollTrigger options
    ScrollTrigger.defaults({
      toggleActions: "restart pause resume pause",
    });

    // Create directional scroll animations for each video
    videos.forEach((video, index) => {
      const section = sections[index];
      
      // Create a timeline for complex directional animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: '+=200vh',
          scrub: 1,
          snap: {
            snapTo: [0, 0.25, 0.5, 0.75, 1], // 5 snap points for different directions
            duration: { min: 0.3, max: 0.8 },
            delay: 0.1,
            directional: false,
          }
        }
      });

      // Directional animations based on section index
      switch (index) {
        case 0: // First video - moves LEFT
          tl.to(video, {
            x: -200,
            duration: 0.5,
            ease: "power2.out"
          })
          .to(video, {
            x: -400,
            duration: 0.5,
            ease: "power2.in"
          });
          break;
          
        case 1: // Second video - moves TOP
          tl.to(video, {
            y: -200,
            duration: 0.5,
            ease: "power2.out"
          })
          .to(video, {
            y: -400,
            duration: 0.5,
            ease: "power2.in"
          });
          break;
          
        case 2: // Third video - moves RIGHT
          tl.to(video, {
            x: 200,
            duration: 0.5,
            ease: "power2.out"
          })
          .to(video, {
            x: 400,
            duration: 0.5,
            ease: "power2.in"
          });
          break;
          
        case 3: // Fourth video - moves BOTTOM
          tl.to(video, {
            y: 200,
            duration: 0.5,
            ease: "power2.out"
          })
          .to(video, {
            y: 400,
            duration: 0.5,
            ease: "power2.in"
          });
          break;
          
        case 4: // Fifth video - diagonal movement
          tl.to(video, {
            x: -150,
            y: -150,
            duration: 0.5,
            ease: "power2.out"
          })
          .to(video, {
            x: -300,
            y: -300,
            duration: 0.5,
            ease: "power2.in"
          });
          break;
          
        default:
          break;
      }

      // Add rotation and scale effects
      gsap.to(video, {
        rotation: index % 2 === 0 ? 10 : -10,
        scale: 1.1,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      });
    });

    // Section background color transitions
    sections.forEach((section, index) => {
      const colors = [
        '#ff6b6b', // Red
        '#4ecdc4', // Teal
        '#45b7d1', // Blue
        '#96ceb4', // Green
        '#ffeaa7'  // Yellow
      ];
      
      gsap.to(section, {
        backgroundColor: colors[index],
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        }
      });
    });

    // Clean up when unmounting
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      <section className="video-direction-section left-section">
        <h2 className="section-title">Video Scroll LEFT</h2>
        <p className="section-subtitle">Scroll to see video move LEFT → LEFT again</p>
        <div className="video-container">
          <video 
            className="video-direction-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/600x400/ff6b6b/ffffff?text=LEFT+Video"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="direction-indicator">
          <span className="direction-arrow">←</span>
          <span className="direction-text">LEFT</span>
        </div>
        <div className="section-info">
          <span className="number">1</span>
          <span className="slash slash1"></span>
          <span className="five">5</span>
        </div>
      </section>
      
      <section className="video-direction-section top-section">
        <h2 className="section-title">Video Scroll TOP</h2>
        <p className="section-subtitle">Scroll to see video move TOP → TOP again</p>
        <div className="video-container">
          <video 
            className="video-direction-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/600x400/4ecdc4/ffffff?text=TOP+Video"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="direction-indicator">
          <span className="direction-arrow">↑</span>
          <span className="direction-text">TOP</span>
        </div>
        <div className="section-info">
          <span className="number">2</span>
          <span className="slash slash2"></span>
          <span className="five">5</span>
        </div>
      </section>
      
      <section className="video-direction-section right-section">
        <h2 className="section-title">Video Scroll RIGHT</h2>
        <p className="section-subtitle">Scroll to see video move RIGHT → RIGHT again</p>
        <div className="video-container">
          <video 
            className="video-direction-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/600x400/45b7d1/ffffff?text=RIGHT+Video"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="direction-indicator">
          <span className="direction-arrow">→</span>
          <span className="direction-text">RIGHT</span>
        </div>
        <div className="section-info">
          <span className="number">3</span>
          <span className="slash slash3"></span>
          <span className="five">5</span>
        </div>
      </section>
      
      <section className="video-direction-section bottom-section">
        <h2 className="section-title">Video Scroll BOTTOM</h2>
        <p className="section-subtitle">Scroll to see video move BOTTOM → BOTTOM again</p>
        <div className="video-container">
          <video 
            className="video-direction-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/600x400/96ceb4/ffffff?text=BOTTOM+Video"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="direction-indicator">
          <span className="direction-arrow">↓</span>
          <span className="direction-text">BOTTOM</span>
        </div>
        <div className="section-info">
          <span className="number">4</span>
          <span className="slash slash4"></span>
          <span className="five">5</span>
        </div>
      </section>
      
      <section className="video-direction-section diagonal-section">
        <h2 className="section-title">Video Scroll DIAGONAL</h2>
        <p className="section-subtitle">Scroll to see video move DIAGONAL → DIAGONAL again</p>
        <div className="video-container">
          <video 
            className="video-direction-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/600x400/ffeaa7/ffffff?text=DIAGONAL+Video"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="direction-indicator">
          <span className="direction-arrow">↖</span>
          <span className="direction-text">DIAGONAL</span>
        </div>
        <div className="section-info">
          <span className="number">5</span>
          <span className="slash slash5"></span>
          <span className="five">5</span>
        </div>
      </section>
    </div>
  );
};

export default VideoDirectionScroll;
