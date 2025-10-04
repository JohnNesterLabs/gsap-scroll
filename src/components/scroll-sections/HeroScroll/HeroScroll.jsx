import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HeroScroll.css";

gsap.registerPlugin(ScrollTrigger);

const HeroScroll = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".hero-section");
    const videoHero = document.querySelector(".video-hero");
    const combinedSection = document.querySelector(".combined-section");

    // Optional: set default ScrollTrigger options
    ScrollTrigger.defaults({
      toggleActions: "restart pause resume pause",
    });

    // Text animations for the first section
    const textElements = gsap.utils.toArray(
      ".hero-text, .hero-subtitle, .hero-button"
    );

    textElements.forEach((element, index) => {
      gsap.fromTo(
        element,
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
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
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
        zIndex: 10,
      });

      gsap.fromTo(
        videoHero,
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
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        }
      );

      // Parallax effect for video
      gsap.to(videoHero, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sections[1],
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Video animation to combined section
      if (combinedSection) {
        // Make video appear on top when scrolling to combined section
        ScrollTrigger.create({
          trigger: combinedSection,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            // Video becomes fixed and appears on top
            videoHero.classList.add("animating");
            gsap.set(videoHero, {
              zIndex: 10000,
              opacity: 1, // Ensure it's visible
            });
            console.log("Video should be visible now with z-index 10000");
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
            videoHero.classList.remove("animating");
            gsap.set(videoHero, {
              x: 0,
              y: 0,
              scale: 1,
              zIndex: 10,
            });
          },
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
            start: "top center",
            end: "bottom center",
            scrub: 1,
            onUpdate: () => {
              // Continuously ensure high z-index
              gsap.set(videoHero, { zIndex: 10000 });
            },
          },
        });
      }
    }

    // Animations for combined section
    if (combinedSection) {
      const combinedTitle = combinedSection.querySelector(".combined-title");

      gsap.fromTo(
        combinedTitle,
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
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Animations for remaining sections (5-12)
    sections.forEach((section, index) => {
      if (index >= 3) {
        // Sections 5-12 (index 3-10)
        const sectionTitle = section.querySelector(".section-title");
        const sectionSubtitle = section.querySelector(".section-subtitle");
        const sectionButton = section.querySelector(".section-button");

        // Video animation from right to center for these sections
        if (videoHero) {
          ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
              // For sections 9, 10, 11, and 12 (index 7, 8, 9, and 10), hide video completely
              const isSection9To12 =
                index === 7 || index === 8 || index === 9 || index === 10;

              if (isSection9To12) {
                // Hide video completely for sections 9, 10, 11 & 12
                gsap.to(videoHero, {
                  opacity: 0,
                  duration: 0.5,
                  ease: "power2.out",
                });

                // Also hide any text overlays from previous sections
                const allTextOverlays = document.querySelectorAll(
                  ".video-text-overlay"
                );
                allTextOverlays.forEach((overlay) => {
                  gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                  });
                });
              } else {
                // Video moves from right to center with same scale for other sections
                videoHero.classList.add("animating");

                // For sections 7 and 8 (index 5 and 6), use smaller scale to show full model
                const isSection7Or8 = index === 5 || index === 6;
                const videoScale = isSection7Or8 ? 0.4 : 1; // Smaller scale for sections 7 & 8
                const videoY = isSection7Or8 ? -window.innerHeight * 0.3 : -720; // Better vertical centering

                // Add class to video for sections 7 & 8 to change object-fit
                if (isSection7Or8) {
                  videoHero.classList.add("show-full-model");
                } else {
                  videoHero.classList.remove("show-full-model");
                }

                gsap.to(videoHero, {
                  x: 0, // Move to center horizontally
                  y: videoY, // Adjusted vertical position
                  scale: videoScale, // Smaller scale for sections 7 & 8
                  zIndex: 10000,
                  duration: 1,
                  ease: "power2.out",
                });
              }
            },
            onLeave: () => {
              // For sections 9, 10, 11, and 12 (index 7, 8, 9, and 10), video stays hidden
              const isSection9To12 =
                index === 7 || index === 8 || index === 9 || index === 10;

              if (isSection9To12) {
                // Show text overlays again when leaving sections 9, 10, 11 & 12
                const allTextOverlays = document.querySelectorAll(
                  ".video-text-overlay"
                );
                allTextOverlays.forEach((overlay) => {
                  gsap.to(overlay, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                  });
                });
              } else {
                // Remove show-full-model class when leaving sections 7 & 8
                const isSection7Or8 = index === 5 || index === 6;
                if (isSection7Or8) {
                  videoHero.classList.remove("show-full-model");
                }

                // Video stays in center for other sections
                gsap.set(videoHero, { zIndex: 10000 });
              }
            },
            onEnterBack: () => {
              // For sections 9, 10, 11, and 12 (index 7, 8, 9, and 10), keep video hidden
              const isSection9To12 =
                index === 7 || index === 8 || index === 9 || index === 10;

              if (isSection9To12) {
                // Hide text overlays when entering sections 9, 10, 11 & 12 from below
                const allTextOverlays = document.querySelectorAll(
                  ".video-text-overlay"
                );
                allTextOverlays.forEach((overlay) => {
                  gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                  });
                });
              } else {
                // Video comes back to center when scrolling back up for other sections
                gsap.set(videoHero, { zIndex: 10000 });
              }
            },
            onLeaveBack: () => {
              // For sections 9, 10, 11, and 12 (index 7, 8, 9, and 10), video stays hidden
              const isSection9To12 =
                index === 7 || index === 8 || index === 9 || index === 10;

              if (isSection9To12) {
                // Show text overlays when leaving sections 9, 10, 11 & 12 going back up
                const allTextOverlays = document.querySelectorAll(
                  ".video-text-overlay"
                );
                allTextOverlays.forEach((overlay) => {
                  gsap.to(overlay, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                  });
                });
              } else {
                // Remove show-full-model class when leaving sections 7 & 8
                const isSection7Or8 = index === 5 || index === 6;
                if (isSection7Or8) {
                  videoHero.classList.remove("show-full-model");
                }

                // Video goes back to right side when going back to combined section
                gsap.to(videoHero, {
                  x: window.innerWidth * 0.5, // Move back to right
                  y: -window.innerHeight * 0.3,
                  scale: 0.5, // Same scale
                  duration: 1,
                  ease: "power2.out",
                });
              }
            },
          });
        }

        // Staggered animations for section content
        const elements = [sectionTitle, sectionSubtitle, sectionButton].filter(
          Boolean
        );

        elements.forEach((element, elemIndex) => {
          gsap.fromTo(
            element,
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
                start: "top center",
                end: "bottom center",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        // Text overlay animation for sections 5 and 6
        if (index === 3 || index === 4) {
          // Sections 5 and 6 (index 3 and 4)
          const textOverlay = section.querySelector(".video-text-overlay");
          const overlayTitle = section.querySelector(".video-overlay-title");

          if (textOverlay && overlayTitle) {
            // Set initial state - text starts from left side
            gsap.set(overlayTitle, {
              x: -window.innerWidth,
              opacity: 0,
            });

            // Animate text from left to center
            gsap.to(overlayTitle, {
              x: 0,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top center",
                end: "bottom center",
                toggleActions: "play none none reverse",
              },
            });

            // Show overlay when section comes into view
            gsap.fromTo(
              textOverlay,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                duration: 0.8,
                scrollTrigger: {
                  trigger: section,
                  start: "top center",
                  end: "bottom center",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }

        // Text overlay animation for sections 7 and 8
        if (index === 5 || index === 6) {
          // Sections 7 and 8 (index 5 and 6)
          const textOverlay = section.querySelector(".video-text-overlay");
          const overlayTitle = section.querySelector(".video-overlay-title");
          const secureText = section.querySelector(".secure-text");

          if (textOverlay && overlayTitle) {
            // Set initial state - "Meet Kahuna AI" starts centered (same as sections 5,6 final position)
            gsap.set(overlayTitle, {
              x: 0,
              opacity: 1,
            });

            // Set initial state - "secure text" starts from right side
            if (secureText) {
              gsap.set(secureText, {
                x: window.innerWidth,
                opacity: 0,
              });
            }

            // Show overlay when section comes into view
            gsap.fromTo(
              textOverlay,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                duration: 0.8,
                scrollTrigger: {
                  trigger: section,
                  start: "top center",
                  end: "bottom center",
                  toggleActions: "play none none reverse",
                },
              }
            );

            // Animate "Meet Kahuna AI" from center to left (reverse of sections 5,6)
            gsap.to(overlayTitle, {
              x: -window.innerWidth * 0.25, // Move to left side (same element as sections 5,6)
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top center",
                end: "bottom center",
                toggleActions: "play none none reverse",
              },
            });

            // Animate "secure text" from right to center
            if (secureText) {
              gsap.to(secureText, {
                x: 0,
                opacity: 1,
                duration: 1.5,
                ease: "power2.out",
                delay: 0.3, // Slight delay after "Meet Kahuna AI" starts moving
                scrollTrigger: {
                  trigger: section,
                  start: "top center",
                  end: "bottom center",
                  toggleActions: "play none none reverse",
                },
              });
            }
          }
        }

        // Background color transition effect for each section
        const backgroundColors = [
          "#e74c3c", // Section 5 - Red
          "#f39c12", // Section 6 - Orange
          "#9b59b6", // Section 7 - Purple
          "#3498db", // Section 8 - Blue
          "#1abc9c", // Section 9 - Teal
          "#34495e", // Section 10 - Dark Blue
          "#e67e22", // Section 11 - Orange Red
          "#8e44ad", // Section 12 - Purple
        ];

        gsap.to(section, {
          backgroundColor: backgroundColors[index - 3] || "#34495e",
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        });
      }
    });

    // Footer scroll trigger removed since footer is now integrated into Section 12

    // Clean up when unmounting
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Text Hero Section */}
      <section className="hero-section text-hero">
        {/* Header */}
        <header className="hero-header">
          <div className="logo">
            <img
              src="/kahuna-logo.svg"
              alt="Kahuna Labs"
              className="logo-image"
            />
            {/* <span className="logo-text">Kahuna Labs</span> */}
          </div>
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
          <video className="hero-video" autoPlay loop muted playsInline>
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
            <h2 className="combined-title">
              The support landscape is boundless and shifting
            </h2>
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
            Collaborating with industry leaders to deliver exceptional value and
            drive digital transformation
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
            Join thousands of enterprises already transforming their operations
            with our solutions
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
            Pioneering the future with cutting-edge research and experimental
            technologies
          </p>
          <button className="section-button">EXPLORE LAB</button>
        </div>
        {/* Video Text Overlay for Section 7 */}
        <div className="video-text-overlay section-seven-overlay">
          <h2 className="video-overlay-title">Meet Kahuna AI</h2>
          <h2 className="secure-text">secure text</h2>
        </div>
      </section>

      {/* Section 8 - Global Reach */}
      <section className="hero-section section-eight">
        <div className="section-content">
          <h2 className="section-title">Global Reach</h2>
          <p className="section-subtitle">
            Serving clients across continents with localized expertise and 24/7
            support
          </p>
          <button className="section-button">VIEW LOCATIONS</button>
        </div>
        {/* Video Text Overlay for Section 8 */}
        <div className="video-text-overlay section-eight-overlay">
          <h2 className="video-overlay-title">Meet Kahuna AI</h2>
          <h2 className="secure-text">secure text</h2>
        </div>
      </section>

      {/* Section 9 - Success Stories */}
      <section className="hero-section section-nine">
        <div className="section-content">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">
            Discover how we've helped organizations achieve remarkable digital
            transformation
          </p>
          <button className="section-button">READ CASE STUDIES</button>
        </div>
      </section>

      {/* Section 10 - Future Vision */}
      <section className="hero-section section-ten">
        <div className="section-content">
          <h2 className="section-title">Future Vision</h2>
          <p className="section-subtitle">
            Shaping tomorrow's technology landscape with visionary solutions and
            sustainable innovation
          </p>
          <button className="section-button">LEARN MORE</button>
        </div>
      </section>

      {/* Section 11 - Innovation Hub */}
      <section className="hero-section section-eleven">
        <div className="section-content">
          <h2 className="section-title">Innovation Hub</h2>
          <p className="section-subtitle">
            Where cutting-edge technology meets real-world solutions to drive
            unprecedented growth and transformation
          </p>
          <button className="section-button">EXPLORE HUB</button>
        </div>
      </section>

      {/* Section 12 - Next Generation with Footer */}
      <section className="hero-section section-twelve">
        {/* Footer Content Integrated */}
        <footer className="footer">
          {/* Main Tagline Section */}
          <img src="/final-logo.svg" alt="Kahuna Labs" className="tagline-graphic" />
          <div className="footer-tagline">
            <div className="tagline-content">
              <h2 className="tagline-text">
                <span className="tagline-line">
                  Secure. Private. Comprehensive.
                </span>
                <span className="tagline-line">Enterprise Grade.</span>
              </h2>
            </div>
          </div>

          {/* Footer Content */}
          <div className="footer-content">
            <div className="footer-columns">
              {/* Technology Column */}
              <div className="footer-column technology-column">
                <h3 className="column-header">TECHNOLOGY</h3>
                <ul className="column-links">
                  <li>
                    <a
                      href="/technology/frontline-productivity"
                      className="column-link"
                    >
                      Frontline Productivity
                    </a>
                  </li>
                  <li>
                    <a
                      href="/technology/agentic-ai-impact"
                      className="column-link"
                    >
                      Estimate Agentic AI Impact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="footer-column company-column">
                <h3 className="column-header">COMPANY</h3>
                <ul className="column-links">
                  <li>
                    <a href="/contact" className="column-link">
                      Contact us
                    </a>
                  </li>
                  <li>
                    <a href="/careers" className="column-link">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-column company-column">
                <a
                  href="https://linkedin.com/company/kahuna-labs"
                  className="linkedin-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="linkedin-icon"></div>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Kahuna Labs Logo */}
            <div className="footer-logo">
              <div className="logo-container">
                <img
                  src="/final-logo.svg"
                  alt="Kahuna Labs"
                  className="logo-symbol"
                />
                <span className="logo-text">Kahuna Labs</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Line */}
          <div className="footer-bottom">
            <div className="copyright">
              All rights reserved to Kahuna Labs. Copyright © 2025.
            </div>
            <div className="attribution">Made by Nester Labs</div>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default HeroScroll;
