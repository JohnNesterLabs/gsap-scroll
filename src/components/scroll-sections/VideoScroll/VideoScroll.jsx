import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './VideoScroll.css';

gsap.registerPlugin(ScrollTrigger);

const VideoScroll = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.video-section');
    const videos = gsap.utils.toArray('.video-element');

    // Optional: set default ScrollTrigger options
    ScrollTrigger.defaults({
      toggleActions: "restart pause resume pause",
    });

    // Create scroll-based video animations
    videos.forEach((video, index) => {
      // Zoom in animation when scrolling into view
      gsap.fromTo(video, 
        {
          scale: 0.8,
          opacity: 0.7,
        },
        {
          scale: 1.2,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: video,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          }
        }
      );

      // Parallax effect - video moves slower than scroll
      gsap.to(video, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: video,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Rotation effect on scroll
      gsap.to(video, {
        rotation: 5,
        duration: 1,
        scrollTrigger: {
          trigger: video,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        }
      });
    });

    // Section background animations
    sections.forEach((section, index) => {
      gsap.fromTo(section,
        {
          backgroundColor: index % 2 === 0 ? '#000000' : '#1a1a1a',
        },
        {
          backgroundColor: index % 2 === 0 ? '#1a1a1a' : '#000000',
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          }
        }
      );
    });

    // Clean up when unmounting
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      <section className="video-section one">
        <h2 className="section-title">Video Scroll Section 1</h2>
        <p className="section-subtitle">Scroll to see video zoom and rotation effects</p>
        <div className="video-container">
          <video 
            className="video-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Video+1"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="section-info">
          <span className="number">1</span>
          <span className="slash slash1"></span>
          <span className="ten">5</span>
        </div>
      </section>
      
      <section className="video-section two">
        <h2 className="section-title">Video Scroll Section 2</h2>
        <p className="section-subtitle">Scroll to see video zoom and rotation effects</p>
        <div className="video-container">
          <video 
            className="video-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/800x600/4ecdc4/ffffff?text=Video+2"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="section-info">
          <span className="number">2</span>
          <span className="slash slash2"></span>
          <span className="ten">5</span>
        </div>
      </section>
      
      <section className="video-section three">
        <h2 className="section-title">Video Scroll Section 3</h2>
        <p className="section-subtitle">Scroll to see video zoom and rotation effects</p>
        <div className="video-container">
          <video 
            className="video-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/800x600/45b7d1/ffffff?text=Video+3"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="section-info">
          <span className="number">3</span>
          <span className="slash slash3"></span>
          <span className="ten">5</span>
        </div>
      </section>
      
      <section className="video-section four">
        <h2 className="section-title">Video Scroll Section 4</h2>
        <p className="section-subtitle">Scroll to see video zoom and rotation effects</p>
        <div className="video-container">
          <video 
            className="video-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/800x600/96ceb4/ffffff?text=Video+4"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="section-info">
          <span className="number">4</span>
          <span className="slash slash4"></span>
          <span className="ten">5</span>
        </div>
      </section>
      
      <section className="video-section last">
        <h2 className="section-title">Video Scroll Section 5</h2>
        <p className="section-subtitle">Scroll to see video zoom and rotation effects</p>
        <div className="video-container">
          <video 
            className="video-element"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://via.placeholder.com/800x600/ffeaa7/ffffff?text=Video+5"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="section-info">
          <span className="number">5</span>
          <span className="slash slash5"></span>
          <span className="ten">5</span>
        </div>
      </section>
    </div>
  );
};

export default VideoScroll;
