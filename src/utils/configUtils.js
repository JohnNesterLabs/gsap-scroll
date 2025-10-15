// Configuration Utility Functions
// This file contains utility functions for getting responsive configurations

import {
  VIEWPORT_BREAKPOINTS,
  VIEWPORT_TYPES,
  MOBILE_THRESHOLD,
  SCROLL_STOP_CONFIG,
  VIDEO_SIZE_CONFIGS,
  VIDEO_POSITION_CONFIGS,
  VIDEO_ROTATION_CONFIGS,
  TEXT_POSITION_CONFIGS,
  TEXT_ALIGN_CONFIGS,
  FONT_SIZE_CONFIGS,
  FONT_WEIGHT_CONFIGS,
  SECTION1_TEXT_CONFIGS,
} from './constants';

/**
 * Get viewport type based on window width
 * @returns {string} Viewport type
 */
export const getViewportType = () => {
  const width = window.innerWidth;
  if (width <= VIEWPORT_BREAKPOINTS.MOBILE_SMALL) return VIEWPORT_TYPES.MOBILE_SMALL;
  if (width <= VIEWPORT_BREAKPOINTS.MOBILE_LARGE) return VIEWPORT_TYPES.MOBILE_LARGE;
  if (width <= VIEWPORT_BREAKPOINTS.TABLET) return VIEWPORT_TYPES.TABLET;
  if (width <= VIEWPORT_BREAKPOINTS.DESKTOP) return VIEWPORT_TYPES.DESKTOP;
  return VIEWPORT_TYPES.LARGE_DESKTOP;
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  const width = window.innerWidth;
  return width <= MOBILE_THRESHOLD;
};

/**
 * Get scroll stop configuration based on device type
 * @returns {object} Scroll stop configuration
 */
export const getScrollStopConfig = () => {
  const isMobile = isMobileDevice();
  return {
    stopFrame: SCROLL_STOP_CONFIG.stopFrame,
    timelineDuration: SCROLL_STOP_CONFIG.timelineDuration,
    timelinePosition: isMobile 
      ? SCROLL_STOP_CONFIG.mobile.timelinePosition 
      : SCROLL_STOP_CONFIG.desktop.timelinePosition,
    playButtonPosition: isMobile 
      ? SCROLL_STOP_CONFIG.mobile.playButtonPosition 
      : SCROLL_STOP_CONFIG.desktop.playButtonPosition,
  };
};

/**
 * Get video size configuration for current viewport
 * @returns {object} Video size configuration
 */
export const getVideoSizeConfig = () => {
  const viewport = getViewportType();
  return VIDEO_SIZE_CONFIGS[viewport] || VIDEO_SIZE_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get video position configuration for current viewport
 * @returns {Array} Video position configuration array
 */
export const getVideoPositionConfig = () => {
  const viewport = getViewportType();
  return VIDEO_POSITION_CONFIGS[viewport] || VIDEO_POSITION_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get video rotation configuration for current viewport
 * @returns {Array} Video rotation configuration array
 */
export const getVideoRotationConfig = () => {
  const viewport = getViewportType();
  return VIDEO_ROTATION_CONFIGS[viewport] || VIDEO_ROTATION_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get text position configuration for current viewport
 * @returns {Array} Text position configuration array
 */
export const getTextPositionConfig = () => {
  const viewport = getViewportType();
  return TEXT_POSITION_CONFIGS[viewport] || TEXT_POSITION_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get text alignment configuration for current viewport
 * @returns {Array} Text alignment configuration array
 */
export const getTextAlignConfig = () => {
  const viewport = getViewportType();
  return TEXT_ALIGN_CONFIGS[viewport] || TEXT_ALIGN_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get font size configuration for current viewport
 * @returns {Array} Font size configuration array
 */
export const getFontSizeConfig = () => {
  const viewport = getViewportType();
  return FONT_SIZE_CONFIGS[viewport] || FONT_SIZE_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get font weight configuration for current viewport
 * @returns {Array} Font weight configuration array
 */
export const getFontWeightConfig = () => {
  const viewport = getViewportType();
  return FONT_WEIGHT_CONFIGS[viewport] || FONT_WEIGHT_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};

/**
 * Get section 1 text configuration for current viewport
 * @returns {object} Section 1 text configuration
 */
export const getSection1TextConfig = () => {
  const viewport = getViewportType();
  return SECTION1_TEXT_CONFIGS[viewport] || SECTION1_TEXT_CONFIGS[VIEWPORT_TYPES.DESKTOP];
};
