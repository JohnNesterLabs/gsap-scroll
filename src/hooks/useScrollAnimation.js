import { useEffect, useRef } from 'react';
import { createScrollAnimation, createParallaxEffect, cleanupScrollTriggers } from '../utils/animations';

export const useScrollAnimation = (elements, options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animatedElements = Array.isArray(elements) ? elements : [elements];
    
    animatedElements.forEach((element, index) => {
      if (element) {
        // Create scroll animation
        createScrollAnimation(element, options);
        
        // Add parallax effect
        createParallaxEffect(element, options.parallaxOffset || -100);
      }
    });

    // Cleanup function
    return () => {
      cleanupScrollTriggers();
    };
  }, [elements, options]);

  return containerRef;
};
