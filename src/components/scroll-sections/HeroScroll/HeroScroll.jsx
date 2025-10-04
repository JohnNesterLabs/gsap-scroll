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

    // Text animations for the first section - slide from top
    const logo = document.querySelector('.logo');
    const contactBtn = document.querySelector('.contact-btn');
    const heroLine1 = document.querySelector('.hero-line-1');
    const heroLine2 = document.querySelector('.hero-line-2');
    const heroLine3 = document.querySelector('.hero-line-3');
    const heroLine4 = document.querySelector('.hero-line-4');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Complete animation sequence
    if (logo && contactBtn && heroLine1 && heroLine2 && heroLine3 && heroLine4 && scrollIndicator) {
      // Create a timeline for the complete sequence
      const completeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sections[0],
          start: 'top center',
          end: 'bottom center',
          toggleActions: "play none none reverse"
        }
      });

      // Phase 1: Logo, button, and first two lines appear
      completeTimeline
        .fromTo(logo,
          {
            opacity: 0,
            y: -50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, 0.2)
        .fromTo(contactBtn,
          {
            opacity: 0,
            y: -50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, 0.2)
        .fromTo(heroLine1,
          {
            opacity: 0,
            y: -50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, 0.2)
        .fromTo(heroLine2,
          {
            opacity: 0,
            y: -50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, 0.2)
        .to(heroLine2, {
          duration: 0.1,
          ease: "power2.out",
          onComplete: () => {
            heroLine2.classList.add('strike-through');
          }
        }, 1.0)

        // Phase 2: First two lines slide up, zoom out and fade out
        .to([heroLine1, heroLine2], {
          opacity: 0,
          y: -50,
          scale: 0.8, // Zoom out effect
          duration: 0.8,
          ease: "power2.in"
        }, 3.0) // Start after 3 seconds

        // Phase 3: New lines appear from bottom and take exact same position
        .fromTo(heroLine3,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5, // Faster speed
            ease: "power2.out"
          }, 3.2) // Start slightly after first lines start fading
        .fromTo(heroLine4,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5, // Faster speed
            ease: "power2.out"
          }, 3.2) // Start at same time as line 3
        .to(heroLine4, {
          duration: 0.1,
          ease: "power2.out",
          onComplete: () => {
            heroLine4.classList.add('strike-through');
          }
        }, 4.3); // Start after new text appears
    }

    // Scroll indicator animation for section 2
    if (scrollIndicator) {
      gsap.fromTo(scrollIndicator, {
        opacity: 0,
        y: -20 // Slide from top
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 6.4, // Start 2 seconds after blue strike is complete (4.3 + 2 = 6.3, rounded to 6.4)
        ease: "power2.out"
      });
    }

    // Video hero animations for the second section - gif model slides slightly to top
    if (videoHero) {
      // Set initial state for video to slide from bottom
      gsap.set(videoHero, {
        x: 0,
        y: 50, // Start slightly below
        scale: 1,
        zIndex: 10,
        opacity: 0
      });

      // Animate video sliding slightly to top on page load
      gsap.to(videoHero, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        delay: 1.0, // Start after text animations
        ease: "power2.out"
      });

      // Additional scroll-triggered animation
      gsap.fromTo(videoHero,
        {
          y: 0,
          opacity: 1,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: sections[1],
            start: 'top center',
            end: 'bottom center',
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax effect for video
      gsap.to(videoHero, {
        y: -60,
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
          y: -window.innerHeight * 0.5, // Move up to align with combined section
          scale: 1, // Scale down to fit nicely on the right side
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
      const combinedLine1 = combinedSection.querySelector('.combined-line-1');
      const combinedLine2 = combinedSection.querySelector('.combined-line-2');
      const newTextContent = combinedSection.querySelector('.new-text-content');
      const newLine1 = combinedSection.querySelector('.new-line-1');
      const newLineSpacer = combinedSection.querySelector('.new-line-spacer');
      const newLine2 = combinedSection.querySelector('.new-line-2');
      const newLine3 = combinedSection.querySelector('.new-line-3');
      const newLine4 = combinedSection.querySelector('.new-line-4');

      // Debug: Check if elements exist
      console.log('New line elements found:', { newLine1, newLine2, newLine3, newLine4 });

      // Set initial state - text starts from left side
      gsap.set([combinedLine1, combinedLine2], {
        x: -window.innerWidth,
        opacity: 0
      });

      // Set initial state for new text - starts from below
      gsap.set([newLine1, newLine2, newLine3, newLine4], {
        y: 100,
        opacity: 0
      });

      // Create a timeline for the complete text transition
      const textTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: combinedSection,
          start: 'top center',
          end: 'bottom center',
          toggleActions: "play none none reverse"
        }
      });

      // Phase 1: Animate first line from left to center
      textTimeline.to(combinedLine1, {
        x: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      });

      // Phase 2: Animate second line from left to center with slight delay
      textTimeline.to(combinedLine2, {
        x: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      }, "-=1.2"); // Start slightly before first line finishes

      // Phase 3: After 1 second, zoom out and fade out current text
      textTimeline.to([combinedLine1, combinedLine2], {
        opacity: 0,
        y: -50,
        scale: 0.8,
        duration: 0.8,
        ease: "power2.in"
      }, "+=1");

      // Phase 4: New text slides in from below - each line with slight delay
      textTimeline.to(newLine1, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=0.1");

      textTimeline.to(newLine2, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");

      textTimeline.to(newLine3, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");

      textTimeline.to(newLine4, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");
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

              // For sections 7 and 8 (index 5 and 6), use smaller scale to show full model
              const isSection7Or8 = index === 5 || index === 6;
              const videoScale = isSection7Or8 ? 0.4 : 1; // Smaller scale for sections 7 & 8
              const videoY = isSection7Or8 ? -window.innerHeight * 0.3 : -720; // Better vertical centering

              // Add class to video for sections 7 & 8 to change object-fit
              if (isSection7Or8) {
                videoHero.classList.add('show-full-model');
              } else {
                videoHero.classList.remove('show-full-model');
              }

              gsap.to(videoHero, {
                x: 0, // Move to center horizontally
                y: videoY, // Adjusted vertical position
                scale: videoScale, // Smaller scale for sections 7 & 8
                zIndex: 10000,
                duration: 1,
                ease: "power2.out"
              });
            },
            onLeave: () => {
              // Remove show-full-model class when leaving sections 7 & 8
              const isSection7Or8 = index === 5 || index === 6;
              if (isSection7Or8) {
                videoHero.classList.remove('show-full-model');
              }

              // Video stays in center
              gsap.set(videoHero, { zIndex: 10000 });
            },
            onEnterBack: () => {
              // Video comes back to center when scrolling back up
              gsap.set(videoHero, { zIndex: 10000 });
            },
            onLeaveBack: () => {
              // Remove show-full-model class when leaving sections 7 & 8
              const isSection7Or8 = index === 5 || index === 6;
              if (isSection7Or8) {
                videoHero.classList.remove('show-full-model');
              }

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

        // Text overlay animation for sections 5 and 6
        if (index === 3 || index === 4) { // Sections 5 and 6 (index 3 and 4)
          const textOverlay = section.querySelector('.video-text-overlay');
          const overlayTitle = section.querySelector('.video-overlay-title');

          if (textOverlay && overlayTitle) {
            // Set initial state - text starts from left side
            gsap.set(overlayTitle, {
              x: -window.innerWidth,
              opacity: 0
            });

            // Animate text from left to center
            gsap.to(overlayTitle, {
              x: 0,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                toggleActions: "play none none reverse"
              }
            });

            // Show overlay when section comes into view
            gsap.fromTo(textOverlay,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                duration: 0.8,
                scrollTrigger: {
                  trigger: section,
                  start: 'top center',
                  end: 'bottom center',
                  toggleActions: "play none none reverse"
                }
              }
            );
          }
        }

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
          <div className="logo">
            <img src="/kahuna-logo.svg" alt="Kahuna Labs" className="logo-image" />
            {/* <span className="logo-text">Kahuna Labs</span> */}
          </div>
          <button className="contact-btn">Lets Talk</button>
        </header>

        {/* Main Content */}
        <div className="hero-content">
          <h1 className="hero-text">
            <span className="hero-line-1">Vast and intricate,</span>
            <span className="hero-line-2">products never stop evolving.</span>
            <span className="hero-line-3">Enterprise customers have an</span>
            <span className="hero-line-4">endless spectrum of realities</span>
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

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <span className="scroll-text">SCROLL</span>
          <img src="/Component 3.png" alt="Scroll Arrow" className="scroll-arrow-png" />
        </div>
      </section>

      {/* Combined Section 3,4 - Innovation & Technology */}
      <section className="hero-section combined-section">
        <div className="combined-content">
          <div className="text-content">
            <h2 className="combined-title">
              <span className="combined-line-1"> The support landscape is</span>
              <span className="combined-line-2">boundless and shifting</span>
            </h2>

            {/* New text content that will slide in from below */}
            <div className="new-text-content">
              <span className="new-line-1">You're lost</span>
              <span className="new-line-spacer"></span>
              <span className="new-line-2">Outdated, laborious</span>
              <span className="new-line-3">and fractional knowledge</span>
              <span className="new-line-4">cripple frontline actions.</span>

            </div>
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
        {/* Video Text Overlay for Section 5 */}
        <div className="video-text-overlay section-five-overlay">
          <h2 className="video-overlay-title">Meet Kahuna AI</h2>
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
        {/* Video Text Overlay for Section 6 */}
        <div className="video-text-overlay section-six-overlay">
          <h2 className="video-overlay-title">Meet Kahuna AI</h2>
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
