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
            markers: true,
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
          duration: 1,
          scrollTrigger: {
            trigger: sections[1],
            start: "top center",
            end: "bottom center",
            // scrub: 1,
            markers: true,
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
          markers: true,
        },
      });

      // Video animation to combined section
      if (combinedSection) {
        // Make video appear on top when scrolling to combined section
        ScrollTrigger.create({
          trigger: combinedSection,
          start: "top center",
          end: "bottom center",
          markers: true,
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
            markers: true,
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
          // x: -50,
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
            markers: true,
          },
        }
      );
    }

    // Animation for combined section 5-6 - Move model from right to center
    const combinedSection56 = document.querySelector(".section-five-six");

    if (videoHero && combinedSection56) {
      // Combined Section 5-6: Move model from right side to center
      ScrollTrigger.create({
        trigger: combinedSection56,
        start: "top center",
        end: "bottom center",
        markers: true,
        scrub: 1,
        onEnter: () => {
          // Forward scroll: Move from right to center
          gsap.to(videoHero, {
            x: 0, // Move back to center horizontally
            y: 0, // Center vertically
            scale: 1, // Normal scale
            zIndex: 10000,
            duration: 1,
            ease: "power2.out"
          });
        },
        onLeaveBack: () => {
          // Reverse scroll: Move from center back to right
          gsap.to(videoHero, {
            x: window.innerWidth * 0.5, // Move back to right side
            y: -window.innerHeight * 0.5, // Move up to align with combined section
            scale: 1, // Normal scale
            zIndex: 10000,
            duration: 1,
            ease: "power2.out"
          });
        }
      });
    }


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
          <img 
            className="hero-video" 
            src="/new-model.png" 
            alt="3D Model"
          />
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

      {/* Combined Section 5-6 - Partnership & Contact */}
      <section className="hero-section section-five-six">
        <div className="section-content">
          <h2 className="section-title">Strategic Partnerships & Ready to Get Started?</h2>
          <p className="section-subtitle">
            Collaborating with industry leaders to deliver exceptional value and
            drive digital transformation. Join thousands of enterprises already transforming their operations
            with our solutions.
          </p>
          <div className="button-group">
            <button className="section-button">BECOME A PARTNER</button>
            <button className="section-button">START YOUR JOURNEY</button>
          </div>
        </div>
        {/* Video Text Overlay for Combined Section 5-6 */}
        <div className="video-text-overlay section-five-six-overlay">
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
