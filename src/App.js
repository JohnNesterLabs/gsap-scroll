import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import FrameSequence from './components/FrameSequence';

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const scrollContainerRef = useRef(null);

  // Get active section based on scroll position
  const getActiveSection = () => {
    if (!scrollContainerRef.current) return 0;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const sectionHeight = window.innerHeight;
    // Use floor to get the current section (more accurate)
    const sectionIndex = Math.floor(scrollTop / sectionHeight + 0.5);
    return Math.min(Math.max(sectionIndex, 0), 3); // Clamp between 0 and 3
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const newSection = getActiveSection();
      if (newSection !== activeSection) {
        setActiveSection(newSection);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeSection]);

  return (
    <div className="App">
      <div className="scroll-container" ref={scrollContainerRef} id="scrollContainer">
        <div className="section section-1">
          <div>Section 1</div>
        </div>
        <div className="section section-2">
          <div>Section 2</div>
        </div>
        <div className="section section-3" id="frameSection">
          <div>Section 3 - Frame Animation</div>
        </div>
        <div className="section section-4">
          <div>Section 4 - Footer</div>
        </div>
      </div>

      <FrameSequence activeSection={activeSection} />

      {/* Debug Info */}
      <div className="debug-info" id="debugInfo">
        <div>Active Section: <span id="activeSection">{activeSection}</span></div>
      </div>
    </div>
  );
}

export default App;
