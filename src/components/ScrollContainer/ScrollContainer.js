import React from 'react';
import './ScrollContainer.css';

const ScrollContainer = ({ scrollContainerRef, children }) => {
  return (
    <div className="scroll-container" ref={scrollContainerRef}>
      {children}
    </div>
  );
};

export default ScrollContainer;

