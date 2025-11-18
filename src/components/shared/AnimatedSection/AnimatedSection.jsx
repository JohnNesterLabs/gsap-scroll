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
  const sectionRef = useRef(null);
  const observerRef = useRef(null);
  const timersRef = useRef({ timer1: null, timer2: null });

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

    // Only proceed with animation if we have both firstSet and secondSet
    if (animationState === "first" && secondSet && secondSet.length > 0) {
      timers.timer1 = setTimeout(() => {
        setAnimationState("transition");
      }, 1500);
    } else if (animationState === "transition" && secondSet && secondSet.length > 0) {
      timers.timer2 = setTimeout(() => {
        setAnimationState("second");
      }, 400);
    }
    // If no secondSet, stay in "first" state

    return () => {
      if (timers.timer1) clearTimeout(timers.timer1);
      if (timers.timer2) clearTimeout(timers.timer2);
    };
  }, [animationState, secondSet]);

  // GSAP animation for second set with proper delays
  useEffect(() => {
    if (animationState === "second" && secondSet && secondSet.length > 0) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const secondSetContainer = document.querySelector(`.section-${sectionNumber} .second-set`);
        if (secondSetContainer) {
          const secondSetLines = secondSetContainer.querySelectorAll('.text-line');
          if (secondSetLines.length > 0) {
            // Check if lines are already animated (have opacity > 0)
            const alreadyAnimated = Array.from(secondSetLines).some(line =>
              parseFloat(getComputedStyle(line).opacity) > 0
            );
            if (!alreadyAnimated) {
              // Set initial state - all lines hidden
              gsap.set(secondSetLines, { opacity: 0, y: 30 });
              // Animate each line with proper delays
              secondSetLines.forEach((line, index) => {
                const delay = index * 0.2;
                gsap.to(line, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  delay: delay
                });
              });
            } else {
              // Lines are already animated, just make sure they're visible
              gsap.set(secondSetLines, { opacity: 1, y: 0 });
            }
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animationState, sectionNumber, secondSet]);


  const gradientClass = "gradient-2";

  return (
    <section
      ref={sectionRef}
      className={`animated-section section-${sectionNumber} ${gradientClass} text-position-${textPosition}`}
      // className={`animated-section ${gradientClass}`}
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
            <div className={`text-set text-align-${textAlign} second-set`}>
              {secondSet.map((text, index) => {
                return (
                  <p
                    key={`second-${index}`}
                    className="text-line"
                    style={{
                      opacity: 0, // Start hidden, GSAP will animate
                      fontSize: fontSize,
                      fontWeight: fontWeight,
                    }}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnimatedSection;
