import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroScroll.css';

gsap.registerPlugin(ScrollTrigger);

const HeroScroll = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.hero-section');

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
    const videoHero = document.querySelector('.video-hero');
    if (videoHero) {
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
    }

    // Animations for additional sections (3-6)
    sections.forEach((section, index) => {
      if (index >= 2) { // Sections 3-6 (index 2-5)
        const sectionTitle = section.querySelector('.section-title');
        const sectionSubtitle = section.querySelector('.section-subtitle');
        const sectionButton = section.querySelector('.section-button');

        // Staggered animations for section content
        const elements = [sectionTitle, sectionSubtitle, sectionButton].filter(Boolean);
        
        elements.forEach((element, elemIndex) => {
          gsap.fromTo(element,
            {
              opacity: 0,
              y: 30,
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

        // Background color transition effect
        gsap.to(section, {
          backgroundColor: index === 2 ? '#2c3e50' : index === 3 ? '#8e44ad' : index === 4 ? '#e74c3c' : '#f39c12',
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
            Vast and intricate, <span className="highlight">products</span> never stop <span className="highlight">evolving.</span>
          </h1>
          <p className="hero-subtitle">
            Enterprise customers have an endless spectrum of realities
          </p>
          <button className="hero-button">LEARN MORE</button>
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

      {/* Section 3 - Innovation */}
      <section className="hero-section section-three">
        <div className="section-content">
          <h2 className="section-title">Innovation at Scale</h2>
          <p className="section-subtitle">
            Transforming enterprise solutions with cutting-edge technology and forward-thinking design
          </p>
          <button className="section-button">EXPLORE SOLUTIONS</button>
        </div>
      </section>

      {/* Section 4 - Technology */}
      <section className="hero-section section-four">
        <div className="section-content">
          <h2 className="section-title">Advanced Technology Stack</h2>
          <p className="section-subtitle">
            Built on modern frameworks and cloud-native architecture for maximum performance and reliability
          </p>
          <button className="section-button">VIEW TECH STACK</button>
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
    </div>
  );
};

export default HeroScroll;
