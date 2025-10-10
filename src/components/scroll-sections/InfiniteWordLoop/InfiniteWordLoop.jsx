import { useEffect, useRef, useState } from "react";
import "./InfiniteWordLoop.css";
const InfiniteWordLoop = ({ sectionNumber, words }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const sectionRef = useRef(null);
    const observerRef = useRef(null);
    const intervalRef = useRef(null);
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.5,
        };
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Start the word cycling when section comes into view
                    startWordCycling();
                } else {
                    // Stop cycling when section goes out of view
                    stopWordCycling();
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
            stopWordCycling();
        };
    }, []);
    const startWordCycling = () => {
        if (intervalRef.current) return; // Already running
        intervalRef.current = setInterval(() => {
            setIsAnimating(true);
            // After animation completes, change to next word
            setTimeout(() => {
                setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                setIsAnimating(false);
            }, 800); // Match animation duration
        }, 2000); // 2 seconds between word changes
    };
    const stopWordCycling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
  return (
    <section
      ref={sectionRef}
      className="infinite-word-loop-section"
    >
      <div className="word-loop-container">
        <div className="three-column-layout">
          {/* Left Side - Kahuna AI */}
          <div className="left-column">
            <div className="kahuna-ai-text">
              Kahuna AI
            </div>
          </div>
          {/* Center - Model will be positioned here by the video */}
          <div className="center-column">
            {/* This space is reserved for the video model */}
          </div>
          {/* Right Side - Cycling Words */}
          <div className="right-column">
            <div className="word-display-container">
              <div
                className={`word-text ${isAnimating ? 'slide-up' : 'slide-in'}`}
                key={currentWordIndex}
              >
                {words[currentWordIndex]}
              </div>
            </div>
          </div>
        </div>
        {/* Section Number Indicator */}
        <div className="word-section-indicator">
          <div className="word-section-number">
            Section {sectionNumber}
          </div>
        </div>
      </div>
    </section>
  );
};
export default InfiniteWordLoop;
