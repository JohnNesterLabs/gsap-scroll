import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Common animation functions
export const createScrollAnimation = (element, options = {}) => {
  const {
    scale = { from: 0.8, to: 1.2 },
    opacity = { from: 0.7, to: 1 },
    rotation = 5,
    duration = 1,
    ease = "power2.out"
  } = options;

  return gsap.fromTo(element, 
    {
      scale: scale.from,
      opacity: opacity.from,
    },
    {
      scale: scale.to,
      opacity: opacity.to,
      rotation: rotation,
      duration: duration,
      ease: ease,
      scrollTrigger: {
        trigger: element,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    }
  );
};

export const createParallaxEffect = (element, yOffset = -100) => {
  return gsap.to(element, {
    y: yOffset,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
};

export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(st => st.kill());
};
