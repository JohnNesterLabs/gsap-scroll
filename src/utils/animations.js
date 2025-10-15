import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Inertia and dampening utility functions
export class InertiaController {
  constructor(options = {}) {
    this.damping = options.damping || 0.8; // Higher = more dampening
    this.stiffness = options.stiffness || 0.1; // Higher = more responsive
    this.mass = options.mass || 1; // Higher = heavier feel
    this.velocity = 0;
    this.target = 0;
    this.current = 0;
    this.isAnimating = false;
  }

  update() {
    if (!this.isAnimating) return;

    const force = (this.target - this.current) * this.stiffness;
    const acceleration = force / this.mass;
    this.velocity += acceleration;
    this.velocity *= this.damping;
    this.current += this.velocity;

    // Stop when velocity is very small
    if (Math.abs(this.velocity) < 0.001 && Math.abs(this.target - this.current) < 0.001) {
      this.current = this.target;
      this.velocity = 0;
      this.isAnimating = false;
    }
  }

  setTarget(value) {
    this.target = value;
    this.isAnimating = true;
  }

  getCurrent() {
    return this.current;
  }

  getVelocity() {
    return this.velocity;
  }
}

// Create smooth scroll with inertia effect
export const createInertiaScroll = (element, options = {}) => {
  const {
    damping = 0.85,
    stiffness = 0.15,
    mass = 1.2,
    property = 'y',
    range = [-100, 100],
    trigger = element
  } = options;

  const inertia = new InertiaController({ damping, stiffness, mass });
  let animationId;

  const updateAnimation = () => {
    inertia.update();
    gsap.set(element, { [property]: inertia.getCurrent() });

    if (inertia.isAnimating) {
      animationId = requestAnimationFrame(updateAnimation);
    }
  };

  return gsap.to(element, {
    [property]: range[1],
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const targetValue = gsap.utils.interpolate(range[0], range[1], progress);
        inertia.setTarget(targetValue);

        if (!inertia.isAnimating) {
          inertia.isAnimating = true;
          updateAnimation();
        }
      }
    }
  });
};

// Create heavy feel animation with dampening
export const createHeavyAnimation = (element, options = {}) => {
  const {
    damping = 0.9,
    stiffness = 0.08,
    mass = 2,
    properties = { x: 0, y: 0, scale: 1 },
    duration = 1,
    trigger = element
  } = options;

  const inertiaControllers = {};

  // Create inertia controller for each property
  Object.keys(properties).forEach(prop => {
    inertiaControllers[prop] = new InertiaController({ damping, stiffness, mass });
  });

  let animationId;

  const updateAnimation = () => {
    let isAnyAnimating = false;
    const currentValues = {};

    Object.keys(properties).forEach(prop => {
      inertiaControllers[prop].update();
      currentValues[prop] = inertiaControllers[prop].getCurrent();
      if (inertiaControllers[prop].isAnimating) {
        isAnyAnimating = true;
      }
    });

    gsap.set(element, currentValues);

    if (isAnyAnimating) {
      animationId = requestAnimationFrame(updateAnimation);
    }
  };

  return gsap.to(element, {
    ...properties,
    duration: duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: trigger,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        Object.keys(properties).forEach(prop => {
          const targetValue = gsap.utils.interpolate(0, properties[prop], progress);
          inertiaControllers[prop].setTarget(targetValue);
        });

        if (!Object.values(inertiaControllers).some(ctrl => ctrl.isAnimating)) {
          Object.values(inertiaControllers).forEach(ctrl => ctrl.isAnimating = true);
          updateAnimation();
        }
      }
    }
  });
};

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
