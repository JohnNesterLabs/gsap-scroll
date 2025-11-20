// Configuration constants
export const CONFIG = {
  startSection: 1, // Frame animation starts at section 2 (0-indexed: section 2 = index 1)
  totalFramesDesktop: 258, // Total number of frames for desktop
  totalFramesMobile: 224, // Total number of frames for mobile
  framePrefix: 'frame_',
  frameSuffix: '.webp',
  folderPathDesktop: '/frames-desktop-webp/',
  folderPathMobile: '/frames-full-mobile/',
  framesPerSecond: 20,
  scrollThreshold: 100,
  pauseFramesDesktop: [65, 136, 197, 258], // Frames where animation pauses (desktop)
  pauseFramesMobile: [37, 102, 162, 224] // Frames where animation pauses (mobile)
};

