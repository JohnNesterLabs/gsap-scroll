// Demo Configuration Constants
// This file contains all the configuration constants used in the Demo component

// Viewport breakpoints
export const VIEWPORT_BREAKPOINTS = {
  MOBILE_SMALL: 480,
  MOBILE_LARGE: 767,
  TABLET: 1023,
  DESKTOP: 1924,
};

// Viewport types
export const VIEWPORT_TYPES = {
  MOBILE_SMALL: 'mobile-small',
  MOBILE_LARGE: 'mobile-large',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'large-desktop',
};

// Total sections in the demo
export const TOTAL_SECTIONS = 2;

// Mobile device detection threshold
export const MOBILE_THRESHOLD = 768;

// Scroll smoothing and damping configuration
export const SCROLL_SMOOTHING_CONFIG = {
  // Damping factor controls the "friction" applied to scrolling
  // Higher values (0.15-0.20) = more friction, faster deceleration, more responsive
  // Lower values (0.05-0.10) = less friction, smoother momentum, more cinematic
  // Recommended range: 0.08 - 0.15
  dampingFactor: 0.2,
  
  // Frame sequence sensitivity - controls smoothness of frame transitions
  // This acts as interpolation damping for frame changes (independent of scroll distance)
  // Lower values (0.2-0.4) = smoother, slower frame transitions, more cinematic
  // Higher values (0.6-0.9) = snappier, faster frame transitions, more responsive
  // Note: All frames remain reachable regardless of this value
  // Recommended range: 0.3 - 0.7
  frameSequenceSensitivity: 0.1,
};

// Auto-play frame sequence configuration
export const AUTOPLAY_CONFIG = {
  // Frames per second for auto-play animation
  // Higher values (40-60) = faster, more fluid animation
  // Lower values (20-30) = slower, more deliberate animation
  // Recommended: 30 for balanced performance and smoothness
  framesPerSecond: 15,
  
  // Scroll threshold to exit CTA buffer zone
  // Amount of scroll delta needed to move past the CTA zone
  // Higher values (150-300) = requires more scrolling to exit
  // Lower values (50-100) = exits quickly with light scrolling
  // Recommended: 100 for balanced control
  scrollThreshold: 100,
};

// PNG Sequence Configuration
export const PNG_SEQUENCE_CONFIG = {
  startSection: 0, // PNG sequence starts from section 0 (previously section 4, after removing sections 1-3)
  totalFrames: 378,
  framePrefix: "frame_",
  frameSuffix: ".png",
  folderPath: "/frames-journey/",
};

// Desktop WebP Sequence Configuration
export const DESKTOP_WEBP_SEQUENCE_CONFIG = {
  startSection: 0, // Desktop WebP sequence starts from section 0 (previously section 4, after removing sections 1-3)
  totalFrames: 134,
  framePrefix: "frame_",
  frameSuffix: ".webp",
  folderPath: "/frame-desktop/",
};

// Scroll stop configuration constants
export const SCROLL_STOP_CONFIG = {
  stopFrame: 65, // Frame to stop at (frame_0065.webp) - Desktop pause at frame 65
  timelineDuration: 5000, // 5 seconds in milliseconds
  
  // Mobile timeline and play button positions
  mobile: {
    timelinePosition: {
      top: "92%", // Adjusted for mobile
      left: "50%", // Centered on mobile
    },
    playButtonPosition: {
      top: "58%", // Higher on mobile for better touch access
      left: "80%", // Centered on mobile
    },
  },
  
  // Desktop timeline and play button positions
  desktop: {
    timelinePosition: {
      top: "80%", // '50%' = center, '30%' = upper, '70%' = lower
      left: "77.5%", // '50%' = center, '20%' = left, '80%' = right
    },
    playButtonPosition: {
      top: "29%", // '60%' = below timeline, '40%' = above timeline
      left: "47%", // '50%' = center, '20%' = left, '80%' = right
    },
  },
};

// Video size configurations for all viewports
export const VIDEO_SIZE_CONFIGS = {
  "mobile-small": {
    section5: { width: 2100, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  "mobile-large": {
    section5: { width: 380, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  tablet: {
    section5: { width: 700, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  desktop: {
    section5: { width: 2150, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  "large-desktop": {
    section5: { width: 3250, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
};

// Video position configurations for all viewports
export const VIDEO_POSITION_CONFIGS = {
  "mobile-small": [
    { x: 40, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  "mobile-large": [
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  tablet: [
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  desktop: [
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  "large-desktop": [
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
};

// Video rotation configurations for all viewports
export const VIDEO_ROTATION_CONFIGS = {
  "mobile-small": [0, 0, 0], // All sections normal
  "mobile-large": [0, 0, 0], // All sections normal
  tablet: [0, 0, 0], // All sections normal
  desktop: [0, 0, 0], // All sections normal
  "large-desktop": [0, 0, 0], // All sections normal
};

// Text position configurations for all viewports
export const TEXT_POSITION_CONFIGS = {
  "mobile-small": [
    "center", // Section 5 - Text at center (mobile)
    "center", // Section 6 - Text at center (mobile)
  ],
  "mobile-large": [
    "center", // Section 5 - Text at center (mobile)
    "center", // Section 6 - Text at center (mobile)
  ],
  tablet: [
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
  desktop: [
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
  "large-desktop": [
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
};

// Text alignment configurations for all viewports
export const TEXT_ALIGN_CONFIGS = {
  "mobile-small": [
    "center", // Section 5 - Center aligned (mobile)
    "center", // Section 6 - Center aligned (mobile)
  ],
  "mobile-large": [
    "center", // Section 5 - Center aligned (mobile)
    "center", // Section 6 - Center aligned (mobile)
  ],
  tablet: [
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
  desktop: [
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
  "large-desktop": [
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
};

// Font size configurations for all viewports
export const FONT_SIZE_CONFIGS = {
  "mobile-small": [
    "24px", // Section 5
    "26px", // Section 6
  ],
  "mobile-large": [
    "32px", // Section 5
    "30px", // Section 6
  ],
  tablet: [
    "44px", // Section 5
    "40px", // Section 6
  ],
  desktop: [
    "36px", // Section 5
    "36px", // Section 6
  ],
  "large-desktop": [
    "60px", // Section 5
    "56px", // Section 6
  ],
};

// Font weight configurations for all viewports
export const FONT_WEIGHT_CONFIGS = {
  "mobile-small": [
    "500", // Section 5
    "500", // Section 6
  ],
  "mobile-large": [
    "500", // Section 5
    "500", // Section 6
  ],
  tablet: [
    "500", // Section 5
    "500", // Section 6
  ],
  desktop: [
    "500", // Section 5
    "500", // Section 6
  ],
  "large-desktop": [
    "500", // Section 5
    "500", // Section 6
  ],
};

