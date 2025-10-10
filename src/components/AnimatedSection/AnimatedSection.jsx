import { useEffect, useRef, useState } from "react";
import "./AnimatedSection.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnimatedSection = ({ 
  sectionNumber, 
  firstSet, 
  secondSet, 
  textPosition = 'center', // New prop for text positioning
  textAlign = 'center' // New prop for text alignment
}) => {
  const [animationState, setAnimationState] = useState("idle");
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
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

    if (animationState === "first") {
      timers.timer1 = setTimeout(() => {
        setAnimationState("transition");
      }, 3000);
    } else if (animationState === "transition") {
      timers.timer2 = setTimeout(() => {
        setAnimationState("second");
      }, 800);
    }

    return () => {
      if (timers.timer1) clearTimeout(timers.timer1);
      if (timers.timer2) clearTimeout(timers.timer2);
    };
  }, [animationState]);

  // Show scroll indicator when second set completes (only for section 1)
  useEffect(() => {
    if (sectionNumber === 1 && animationState === "second") {
      // Wait for the second set animation to complete (stagger delay * number of lines + duration)
      const secondSetAnimationDuration = (secondSet.length - 1) * 0.2 + 0.8; // 0.2s stagger + 0.8s duration
      const timer = setTimeout(() => {
        setShowScrollIndicator(true);
      }, secondSetAnimationDuration * 1000);
      return () => clearTimeout(timer);
    } else if (sectionNumber === 1 && animationState !== "second") {
      setShowScrollIndicator(false);
    }
  }, [animationState, sectionNumber, secondSet?.length]);
  // GSAP animations for scroll indicator
  useEffect(() => {
    if (showScrollIndicator && scrollIndicatorRef.current && arrowRef.current) {
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
        y: -10,
        duration: 1.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
      // Scroll trigger to fade out when scrolling away
      ScrollTrigger.create({
        trigger: sectionRef.current,
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
          if (trigger.trigger === sectionRef.current) {
            trigger.kill();
          }
        });
      };
    }
  }, [showScrollIndicator]);


  const gradientClass = sectionNumber === 1 ? "gradient-1" : "gradient-2";

  return (
    <section
      ref={sectionRef}
      className={`animated-section ${gradientClass}`}
    >
      <div className="section-container">
        <div className={`text-container text-position-${textPosition}`}>
          {/* First Set */}
          {(animationState === "first" || animationState === "transition") && (
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
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          )}

          {/* Second Set */}
          {animationState === "second" && (
            <div className={`text-set text-align-${textAlign} animate-slide-in`}>
              {secondSet?.map((text, index) => (
                <p
                  key={`second-${index}`}
                  className="text-line"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Section Number Indicator */}
        <div className="section-indicator">
          Section {sectionNumber}
        </div>

        {/* Scroll Indicator - Only for Section 1 */}
        {sectionNumber === 1 && showScrollIndicator && (
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
        )}

      </div>
    </section>
  );
};

export default AnimatedSection;
