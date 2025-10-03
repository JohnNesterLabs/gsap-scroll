import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroScroll.css';

gsap.registerPlugin(ScrollTrigger);

const HeroScroll = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.hero-section');
    const videoHero = document.querySelector('.video-hero');
    const combinedSection = document.querySelector('.combined-section');

    // Optional: set default ScrollTrigger options
    ScrollTrigger.defaults({
      toggleActions: "restart pause resume pause",
    });

    // Text animations for the first section
    const textElements = gsap.utils.toArray('.hero-text, .hero-subtitle, .hero-button');
    
    textElements.forEach((element, index) => {
      gsap.fromTo(element, 
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: sections[0],
            start: 'top center',
            end: 'bottom center',
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Video hero animations for the second section
    if (videoHero) {
      // Set initial state for normal video behavior
      gsap.set(videoHero, {
        x: 0,
        y: 0,
        scale: 1,
        zIndex: 10
      });

      gsap.fromTo(videoHero,
        {
          scale: 1,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          scrollTrigger: {
            trigger: sections[1],
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          }
        }
      );

      // Parallax effect for video
      gsap.to(videoHero, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: sections[1],
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Video animation to combined section
      if (combinedSection) {
        // Make video appear on top when scrolling to combined section
        ScrollTrigger.create({
          trigger: combinedSection,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            // Video becomes fixed and appears on top
            videoHero.classList.add('animating');
            gsap.set(videoHero, { 
              zIndex: 10000,
              opacity: 1 // Ensure it's visible
            });
            console.log('Video should be visible now with z-index 10000');
          },
          onLeave: () => {
            // Video goes behind when leaving
            gsap.set(videoHero, { zIndex: 1 });
          },
          onEnterBack: () => {
            // Video comes back on top when scrolling back up
            gsap.set(videoHero, { zIndex: 10000 });
          },
          onLeaveBack: () => {
            // Reset video to normal state when going back to hero section
            videoHero.classList.remove('animating');
            gsap.set(videoHero, { 
              x: 0, 
              y: 0, 
              scale: 1, 
              zIndex: 10 
            });
          }
        });

        // Smooth video movement animation from center to right side
        gsap.to(videoHero, {
          x: window.innerWidth * 0.5, // Move to right half of screen
          y: -window.innerHeight * 0.3, // Move up to align with combined section
          scale: 0.5, // Scale down to fit nicely on the right side
          zIndex: 10000, // Ensure high z-index
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: combinedSection,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            onUpdate: () => {
              // Continuously ensure high z-index
              gsap.set(videoHero, { zIndex: 10000 });
            }
          }
        });
      }
    }

    // Animations for combined section
    if (combinedSection) {
      const combinedTitle = combinedSection.querySelector('.combined-title');
      
      gsap.fromTo(combinedTitle,
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: combinedSection,
            start: 'top center',
            end: 'bottom center',
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Animations for remaining sections (5-10)
    sections.forEach((section, index) => {
      if (index >= 3) { // Sections 5-10 (index 3-8)
        const sectionTitle = section.querySelector('.section-title');
        const sectionSubtitle = section.querySelector('.section-subtitle');
        const sectionButton = section.querySelector('.section-button');

        // Video animation from right to center for these sections
        if (videoHero) {
          ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
              // Video moves from right to center with same scale
              videoHero.classList.add('animating');
              gsap.to(videoHero, {
                x: 0, // Move to center
                y: -window.innerHeight * 0.1, // Adjust vertical position
                scale: 0.5, // Keep same scale as right side
                zIndex: 10000,
                duration: 1,
                ease: "power2.out"
              });
            },
            onLeave: () => {
              // Video stays in center
              gsap.set(videoHero, { zIndex: 10000 });
            },
            onEnterBack: () => {
              // Video comes back to center when scrolling back up
              gsap.set(videoHero, { zIndex: 10000 });
            },
            onLeaveBack: () => {
              // Video goes back to right side when going back to combined section
              gsap.to(videoHero, {
                x: window.innerWidth * 0.5, // Move back to right
                y: -window.innerHeight * 0.3,
                scale: 0.5, // Same scale
                duration: 1,
                ease: "power2.out"
              });
            }
          });
        }

        // Staggered animations for section content
        const elements = [sectionTitle, sectionSubtitle, sectionButton].filter(Boolean);
        
        elements.forEach((element, elemIndex) => {
          gsap.fromTo(element,
            {
              opacity: 0,
              y: 0,
              scale: 0.9,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              delay: elemIndex * 0.3,
              scrollTrigger: {
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                toggleActions: "play none none reverse"
              }
            }
          );
        });

        // Background color transition effect for each section
        const backgroundColors = [
          '#e74c3c', // Section 5 - Red
          '#f39c12', // Section 6 - Orange
          '#9b59b6', // Section 7 - Purple
          '#3498db', // Section 8 - Blue
          '#1abc9c', // Section 9 - Teal
          '#34495e'  // Section 10 - Dark Blue
        ];
        
        gsap.to(section, {
          backgroundColor: backgroundColors[index - 3] || '#34495e',
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          }
        });
      }
    });

    // Clean up when unmounting
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Text Hero Section */}
      <section className="hero-section text-hero">
        {/* Header */}
        <header className="hero-header">
          <div className="logo">Kahuna Labs</div>
          <button className="contact-btn">CONTACT US</button>
        </header>

        {/* Main Content */}
        <div className="hero-content">
          <h1 className="hero-text">
            Enterprise customers have an endless spectrum of realities
          </h1>
          {/* <p className="hero-subtitle">
            Enterprise customers have an endless spectrum of realities
          </p> */}
          {/* <button className="hero-button">LEARN MORE</button> */}
        </div>
      </section>

      {/* Video Hero Section */}
      <section className="hero-section video-hero-section">
        <div className="video-hero">
          <video 
            className="hero-video"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/hero1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
      </section>

      {/* Combined Section 3,4 - Innovation & Technology */}
      <section className="hero-section combined-section">
        <div className="combined-content">
          <div className="text-content">
            <h2 className="combined-title">The support landscape is boundless and shifting</h2>
          </div>
          <div className="video-space">
            {/* Video will animate here from the hero section */}
          </div>
        </div>
      </section>

      {/* Section 5 - Partnership */}
      <section className="hero-section section-five">
        <div className="section-content">
          <h2 className="section-title">Strategic Partnerships</h2>
          <p className="section-subtitle">
            Collaborating with industry leaders to deliver exceptional value and drive digital transformation
          </p>
          <button className="section-button">BECOME A PARTNER</button>
        </div>
      </section>

      {/* Section 6 - Contact */}
      <section className="hero-section section-six">
        <div className="section-content">
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="section-subtitle">
            Join thousands of enterprises already transforming their operations with our solutions
          </p>
          <button className="section-button">START YOUR JOURNEY</button>
        </div>
      </section>

      {/* Section 7 - Innovation Lab */}
      <section className="hero-section section-seven">
        <div className="section-content">
          <h2 className="section-title">Innovation Lab</h2>
          <p className="section-subtitle">
            Pioneering the future with cutting-edge research and experimental technologies
          </p>
          <button className="section-button">EXPLORE LAB</button>
        </div>
      </section>

      {/* Section 8 - Global Reach */}
      <section className="hero-section section-eight">
        <div className="section-content">
          <h2 className="section-title">Global Reach</h2>
          <p className="section-subtitle">
            Serving clients across continents with localized expertise and 24/7 support
          </p>
          <button className="section-button">VIEW LOCATIONS</button>
        </div>
      </section>

      {/* Section 9 - Success Stories */}
      <section className="hero-section section-nine">
        <div className="section-content">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">
            Discover how we've helped organizations achieve remarkable digital transformation
          </p>
          <button className="section-button">READ CASE STUDIES</button>
        </div>
      </section>

      {/* Section 10 - Future Vision */}
      <section className="hero-section section-ten">
        <div className="section-content">
          <h2 className="section-title">Future Vision</h2>
          <p className="section-subtitle">
            Shaping tomorrow's technology landscape with visionary solutions and sustainable innovation
          </p>
          <button className="section-button">LEARN MORE</button>
        </div>
      </section>
    </div>
  );
};

export default HeroScroll;
