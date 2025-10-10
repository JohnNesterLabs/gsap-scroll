import { useEffect, useRef, useState } from "react";
import "./AnimatedSection.css";

const AnimatedSection = ({ sectionNumber, firstSet, secondSet }) => {
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

  const gradientClass = sectionNumber === 1 ? "gradient-1" : "gradient-2";

  return (
    <section
      ref={sectionRef}
      className={`animated-section ${gradientClass}`}
    >
      <div className="section-container">
        <div className="text-container">
          {/* First Set */}
          {(animationState === "first" || animationState === "transition") && (
            <div
              className={`text-set ${
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
            <div className="text-set animate-slide-in">
              {secondSet.map((text, index) => (
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
      </div>
    </section>
  );
};

export default AnimatedSection;
