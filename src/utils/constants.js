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
export const TOTAL_SECTIONS = 7;

// Mobile device detection threshold
export const MOBILE_THRESHOLD = 768;

// PNG Sequence Configuration
export const PNG_SEQUENCE_CONFIG = {
  startSection: 4, // PNG sequence starts from section 4 and completes all 378 frames
  totalFrames: 378,
  framePrefix: "frame_",
  frameSuffix: ".png",
  folderPath: "/frames-journey/",
};

// Desktop WebP Sequence Configuration
export const DESKTOP_WEBP_SEQUENCE_CONFIG = {
  startSection: 4, // Desktop WebP sequence starts from section 4 and completes all 428 frames
  totalFrames: 428,
  framePrefix: "frame_",
  frameSuffix: ".webp",
  folderPath: "/frames-desktop-webp/",
};

// Scroll stop configuration constants
export const SCROLL_STOP_CONFIG = {
  stopFrame: 234, // Frame to stop at (frame_0234.png)
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
    section1: { width: 1520, height: "auto" },
    section2: { width: 1820, height: "auto" },
    section3: { width: 2020, height: "auto" },
    section4: { width: 800, height: "auto" },
    section5: { width: 2100, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  "mobile-large": {
    section1: { width: 700, height: "auto" },
    section2: { width: 400, height: "auto" },
    section3: { width: 500, height: "auto" },
    section4: { width: 380, height: "auto" },
    section5: { width: 380, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  tablet: {
    section1: { width: 800, height: "auto" },
    section2: { width: 800, height: "auto" },
    section3: { width: 1000, height: "auto" },
    section4: { width: 700, height: "auto" },
    section5: { width: 700, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  desktop: {
    section1: { width: 1700, height: "auto" },
    section2: { width: 1800, height: "auto" },
    section3: { width: 2500, height: "auto" },
    section4: { width: 1080, height: "auto" },
    section5: { width: 2150, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
  "large-desktop": {
    section1: { width: 2200, height: "auto" },
    section2: { width: 2300, height: "auto" },
    section3: { width: 3000, height: "auto" },
    section4: { width: 2380, height: "auto" },
    section5: { width: 3250, height: "auto" },
    section6: { width: 0, height: "auto" },
    section7: { width: 0, height: "auto" }, // Footer
  },
};

// Video position configurations for all viewports
export const VIDEO_POSITION_CONFIGS = {
  "mobile-small": [
    { x: 20, y: 90 }, // Section 1 - Center
    { x: 110, y: 70 }, // Section 2 - Center
    { x: 40, y: 50 }, // Section 3 - Center
    { x: 38, y: 50 }, // Section 4 - Center
    { x: 40, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  "mobile-large": [
    { x: 50, y: 50 }, // Section 1 - Center
    { x: 50, y: 50 }, // Section 2 - Center
    { x: 50, y: 50 }, // Section 3 - Center
    { x: 50, y: 50 }, // Section 4 - Center
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  tablet: [
    { x: 50, y: 60 }, // Section 1 - Center
    { x: 50, y: 50 }, // Section 2 - Center (aligned with text)
    { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
    { x: 50, y: 50 }, // Section 4 - Center
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  desktop: [
    { x: 45, y: 110 }, // Section 1 - Center
    { x: 90, y: 65 }, // Section 2 - Center (aligned with text)
    { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
    { x: 45, y: 50 }, // Section 4 - Center
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
  "large-desktop": [
    { x: 45, y: 110 }, // Section 1 - Center
    { x: 90, y: 65 }, // Section 2 - Center (aligned with text)
    { x: 50, y: 50 }, // Section 3 - Center (Meet Kahuna AI)
    { x: 45, y: 50 }, // Section 4 - Center
    { x: 50, y: 50 }, // Section 5 - Center
    { x: 50, y: 50 }, // Section 6 - Center
    { x: 50, y: 50 }, // Section 7 - Footer
  ],
};

// Video rotation configurations for all viewports
export const VIDEO_ROTATION_CONFIGS = {
  "mobile-small": [0, 0, 0, 0, 0, 0, 0], // All sections normal
  "mobile-large": [0, 0, 0, 0, 0, 0, 0], // All sections normal
  tablet: [0, 0, 0, 0, 0, 0, 0], // All sections normal
  desktop: [0, 0, 0, 0, 0, 0, 0], // All sections normal
  "large-desktop": [0, 0, 0, 0, 0, 0, 0], // All sections normal
};

// Text position configurations for all viewports
export const TEXT_POSITION_CONFIGS = {
  "mobile-small": [
    "top", // Section 1 - Text at center (mobile)
    "top", // Section 2 - Text at center (mobile)
    "center", // Section 3 - Text at center (mobile)
    "center", // Section 4 - Text at center (mobile)
    "center", // Section 5 - Text at center (mobile)
    "center", // Section 6 - Text at center (mobile)
  ],
  "mobile-large": [
    "center", // Section 1 - Text at center (mobile)
    "center", // Section 2 - Text at center (mobile)
    "center", // Section 3 - Text at center (mobile)
    "center", // Section 4 - Text at center (mobile)
    "center", // Section 5 - Text at center (mobile)
    "center", // Section 6 - Text at center (mobile)
  ],
  tablet: [
    "top", // Section 1 - Text at top
    "left", // Section 2 - Text at left
    "center", // Section 3 - Text at center
    "right", // Section 4 - Text at right
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
  desktop: [
    "top", // Section 1 - Text at top
    "left", // Section 2 - Text at left
    "center", // Section 3 - Text at center
    "right", // Section 4 - Text at right
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
  "large-desktop": [
    "top", // Section 1 - Text at top
    "left", // Section 2 - Text at left
    "center", // Section 3 - Text at center
    "right", // Section 4 - Text at right
    "bottom", // Section 5 - Text at bottom
    "top-left", // Section 6 - Text at top-left
  ],
};

// Text alignment configurations for all viewports
export const TEXT_ALIGN_CONFIGS = {
  "mobile-small": [
    "center", // Section 1 - Center aligned (mobile)
    "left", // Section 2 - Center aligned (mobile)
    "center", // Section 3 - Center aligned (mobile)
    "center", // Section 4 - Center aligned (mobile)
    "center", // Section 5 - Center aligned (mobile)
    "center", // Section 6 - Center aligned (mobile)
  ],
  "mobile-large": [
    "center", // Section 1 - Center aligned (mobile)
    "center", // Section 2 - Center aligned (mobile)
    "center", // Section 3 - Center aligned (mobile)
    "center", // Section 4 - Center aligned (mobile)
    "center", // Section 5 - Center aligned (mobile)
    "center", // Section 6 - Center aligned (mobile)
  ],
  tablet: [
    "center", // Section 1 - Center aligned
    "left", // Section 2 - Left aligned
    "center", // Section 3 - Center aligned
    "right", // Section 4 - Right aligned
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
  desktop: [
    "center", // Section 1 - Center aligned
    "left", // Section 2 - Left aligned
    "center", // Section 3 - Center aligned
    "center", // Section 4 - Center aligned
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
  "large-desktop": [
    "center", // Section 1 - Center aligned
    "left", // Section 2 - Left aligned
    "center", // Section 3 - Center aligned
    "center", // Section 4 - Center aligned
    "center", // Section 5 - Center aligned
    "left", // Section 6 - Left aligned
  ],
};

// Font size configurations for all viewports
export const FONT_SIZE_CONFIGS = {
  "mobile-small": [
    "26px", // Section 1
    "26px", // Section 2
    "36px", // Section 3
    "24px", // Section 4
    "24px", // Section 5
    "26px", // Section 6
  ],
  "mobile-large": [
    "32px", // Section 1
    "28px", // Section 2
    "36px", // Section 3
    "30px", // Section 4
    "32px", // Section 5
    "30px", // Section 6
  ],
  tablet: [
    "48px", // Section 1
    "32px", // Section 2
    "52px", // Section 3
    "40px", // Section 4
    "44px", // Section 5
    "40px", // Section 6
  ],
  desktop: [
    "60px", // Section 1
    "36px", // Section 2
    "60px", // Section 3
    "36px", // Section 4
    "36px", // Section 5
    "36px", // Section 6
  ],
  "large-desktop": [
    "72px", // Section 1
    "42px", // Section 2
    "76px", // Section 3
    "56px", // Section 4
    "60px", // Section 5
    "56px", // Section 6
  ],
};

// Font weight configurations for all viewports
export const FONT_WEIGHT_CONFIGS = {
  "mobile-small": [
    "500", // Section 1
    "500", // Section 2
    "500", // Section 3
    "500", // Section 4
    "500", // Section 5
    "500", // Section 6
  ],
  "mobile-large": [
    "500", // Section 1
    "500", // Section 2
    "600", // Section 3
    "500", // Section 4
    "500", // Section 5
    "500", // Section 6
  ],
  tablet: [
    "500", // Section 1
    "500", // Section 2
    "600", // Section 3
    "500", // Section 4
    "500", // Section 5
    "500", // Section 6
  ],
  desktop: [
    "500", // Section 1
    "500", // Section 2
    "600", // Section 3
    "500", // Section 4
    "500", // Section 5
    "500", // Section 6
  ],
  "large-desktop": [
    "500", // Section 1
    "500", // Section 2
    "600", // Section 3
    "500", // Section 4
    "500", // Section 5
    "500", // Section 6
  ],
};

// Text content configurations for section 1
export const SECTION1_TEXT_CONFIGS = {
  "mobile-small": {
    firstSet: ["Vast and intricate products never stop evolving."],
    secondSet: ["Enterprise customers have an endless spectrum of realities."]
  },
  "mobile-large": {
    firstSet: ["Vast and intricate products never stop evolving."],
    secondSet: ["Enterprise customers have an endless spectrum of realities."]
  },
  tablet: {
    firstSet: ["Vast and intricate,", "products never stop evolving."],
    secondSet: ["Enterprise customers have an", "endless spectrum of realities."]
  },
  desktop: {
    firstSet: ["Vast and intricate,", "products never stop evolving."],
    secondSet: ["Enterprise customers have an", "endless spectrum of realities."]
  },
  "large-desktop": {
    firstSet: ["Vast and intricate,", "products never stop evolving."],
    secondSet: ["Enterprise customers have an", "endless spectrum of realities."]
  },
};
