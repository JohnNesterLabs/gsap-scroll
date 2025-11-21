// Configuration constants
export const CONFIG = {
  startSection: 1, // Frame animation starts at section 2 (0-indexed: section 2 = index 1)
  totalFramesDesktop: 189, // Total number of frames for desktop
  totalFramesMobile: 224, // Total number of frames for mobile
  framePrefix: 'frame_',
  frameSuffix: '.webp',
  folderPathDesktop: '/final-frames-desktop-webp/',
  folderPathMobile: '/frames-full-mobile/',
  framesPerSecond: 15,
  scrollThreshold: 100,
  pauseFramesDesktop: [65, 102, 127, 157], // Frames where animation pauses (desktop)
  pauseFramesMobile: [37, 102, 162, 224], // Frames where animation pauses (mobile)
  // Animation trigger offset (in viewport height units)
  // Positive values = start after section 2 begins (e.g., 0.2 = start when 20% of section 2 is visible)
  // Zero = start exactly when section 2 begins (at 1 * sectionHeight)
  // Negative values = start before section 2 begins (e.g., -0.2 = start 20% before section 2 would normally start)
  // Example: -0.3 means animation starts when scrollTop >= 0.7 * sectionHeight (30% before section 2)
  animationTriggerOffset:-1 // Start animation 20% before section 2 touches the viewport
};

