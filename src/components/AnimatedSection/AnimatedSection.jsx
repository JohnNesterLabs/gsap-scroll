import { useEffect, useRef, useState } from "react";
import "./AnimatedSection.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnimatedSection = ({ 
  sectionNumber, 
  firstSet = [], // Default to empty array
  secondSet = [], // Default to empty array
  textPosition = 'center', // New prop for text positioning
  textAlign = 'center', // New prop for text alignment
  fontSize = '60px', // New prop for font size
  fontWeight = '500' // New prop for font weight
}) => {
  const [animationState, setAnimationState] = useState("idle");
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);
  const timersRef = useRef({ timer1: null, timer2: null });
  const scrollIndicatorRef = useRef(null);
  const arrowRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const timers = timersRef.current; // Capture ref for cleanup

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Reset to first state when entering the section
          // This ensures animations always start from the beginning
          setAnimationState("first");
          if (sectionNumber === 1) {
            setHasScrolled(false);
          }
        } else {
          // When leaving the section, clear all timers and reset to idle
          if (timers.timer1) {
            clearTimeout(timers.timer1);
            timers.timer1 = null;
          }
          if (timers.timer2) {
            clearTimeout(timers.timer2);
            timers.timer2 = null;
          }
          setAnimationState("idle");
        }
      });
    }, options);

    if (sectionRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clear any pending timers on unmount
      if (timers.timer1) clearTimeout(timers.timer1);
      if (timers.timer2) clearTimeout(timers.timer2);
    };
  }, []);

  useEffect(() => {
    const timers = timersRef.current; // Capture ref for cleanup
    
    // Clear any existing timers before starting new ones
    if (timers.timer1) clearTimeout(timers.timer1);
    if (timers.timer2) clearTimeout(timers.timer2);

    // Only proceed with animation if we have both firstSet and secondSet
    if (animationState === "first" && secondSet && secondSet.length > 0) {
      timers.timer1 = setTimeout(() => {
        setAnimationState("transition");
      }, 3000);
    } else if (animationState === "transition" && secondSet && secondSet.length > 0) {
      timers.timer2 = setTimeout(() => {
        setAnimationState("second");
      }, 800);
    }
    // If no secondSet, stay in "first" state

    return () => {
      if (timers.timer1) clearTimeout(timers.timer1);
      if (timers.timer2) clearTimeout(timers.timer2);
    };
  }, [animationState, secondSet]);

  // Show scroll indicator when second set completes (only for section 1)
  useEffect(() => {
    if (sectionNumber === 1 && animationState === "second" && secondSet && secondSet.length > 0) {
      // Wait for the second set animation to complete (stagger delay * number of lines + duration)
      const secondSetAnimationDuration = (secondSet.length - 1) * 0.2 + 0.8; // 0.2s stagger + 0.8s duration
      const timer = setTimeout(() => {
        setShowScrollIndicator(true);
      }, secondSetAnimationDuration * 1000);
      return () => clearTimeout(timer);
    } else if (sectionNumber === 1 && animationState === "first" && (!secondSet || secondSet.length === 0)) {
      // If no secondSet, show scroll indicator after firstSet completes
      const firstSetAnimationDuration = (firstSet.length - 1) * 0.2 + 0.8; // 0.2s stagger + 0.8s duration
      const timer = setTimeout(() => {
        setShowScrollIndicator(true);
      }, (firstSetAnimationDuration + 2) * 1000); // Add 2s delay after firstSet
      return () => clearTimeout(timer);
    } else if (sectionNumber === 1 && animationState !== "second" && animationState !== "first") {
      setShowScrollIndicator(false);
    }
  }, [animationState, sectionNumber, secondSet, firstSet]);
  // GSAP animations for scroll indicator
  useEffect(() => {
    if (showScrollIndicator && scrollIndicatorRef.current && arrowRef.current) {
      const section = sectionRef.current; // Capture ref for cleanup
      
      // Set initial state
      gsap.set([scrollIndicatorRef.current, arrowRef.current], { opacity: 0, y: 20 });
      // Fade in animation
      const tl = gsap.timeline();
      tl.to([scrollIndicatorRef.current, arrowRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
      // Floating animation for arrow
      gsap.to(arrowRef.current, {
        y: -4,
        duration: 1.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
      // Scroll trigger to fade out when scrolling away
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        onLeave: () => {
          gsap.to([scrollIndicatorRef.current, arrowRef.current], {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in"
          });
        },
        onEnterBack: () => {
          // Don't show again once user has scrolled away
        }
      });
      return () => {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.trigger === section) {
            trigger.kill();
          }
        });
      };
    }
  }, [showScrollIndicator]);

  // Hide scroll indicator when user starts scrolling
  useEffect(() => {
    if (sectionNumber === 1 && showScrollIndicator) {
      const handleScroll = () => {
        if (!hasScrolled) {
          setHasScrolled(true);
          setShowScrollIndicator(false);
        }
      };
      // Add scroll listener to the main scroll container
      const scrollContainer = document.querySelector('.demo-scroll-container') || window;
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [sectionNumber, showScrollIndicator, hasScrolled]);

  const gradientClass = sectionNumber === 1 ? "gradient-1" : "gradient-2";

  return (
    <section
      ref={sectionRef}
      className={`animated-section ${gradientClass}`}
    >
      <div className="section-container">
        <div className={`text-container text-position-${textPosition}`}>
          {/* First Set */}
          {(animationState === "first" || animationState === "transition") && firstSet && firstSet.length > 0 && (
            <div
              className={`text-set text-align-${textAlign} ${
                animationState === "transition" ? "animate-slide-up" : "animate-fade-in"
              }`}
            >
              {firstSet.map((text, index) => (
                <p
                  key={`first-${index}`}
                  className="text-line"
                  style={{
                    animationDelay:
                      animationState === "first" ? `${index * 0.2}s` : "0s",
                    fontSize: fontSize,
                    fontWeight: fontWeight,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          )}

          {/* Second Set */}
          {animationState === "second" && secondSet && secondSet.length > 0 && (
            <div className={`text-set text-align-${textAlign} animate-slide-in`}>
              {secondSet.map((text, index) => (
                <p
                  key={`second-${index}`}
                  className="text-line"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    fontSize: fontSize,
                    fontWeight: fontWeight,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Scroll Indicator - Only for Section 1 */}
        {sectionNumber === 1 && showScrollIndicator && !hasScrolled && (
          <div className="scroll-indicator-wrapper">
          <div className="scroll-indicator-container">
            <div ref={scrollIndicatorRef} className="scroll-text">
              SCROLL
            </div>
            <img
              ref={arrowRef}
              src="/Component 3 (1).png"
              alt="Scroll Arrow"
              className="scroll-arrow"
            />
          </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default AnimatedSection;
