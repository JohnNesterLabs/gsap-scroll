// Utility functions for frame handling
import { CONFIG } from '../config/constants';

/**
 * Formats frame number with leading zeros
 * @param {number} frameNum - Frame number to format
 * @returns {string} Formatted frame number (e.g., "0001")
 */
export const formatFrameNumber = (frameNum) => {
  return frameNum.toString().padStart(4, '0');
};

/**
 * Gets the total number of frames based on device type
 * @param {boolean} isMobile - Whether device is mobile
 * @returns {number} Total frames
 */
export const getTotalFrames = (isMobile) => {
  return isMobile ? CONFIG.totalFramesMobile : CONFIG.totalFramesDesktop;
};

/**
 * Gets the folder path for frames based on device type
 * @param {boolean} isMobile - Whether device is mobile
 * @returns {string} Folder path
 */
export const getFolderPath = (isMobile) => {
  return isMobile ? CONFIG.folderPathMobile : CONFIG.folderPathDesktop;
};

/**
 * Gets the frame image source path
 * @param {number} frameNum - Frame number
 * @param {boolean} isMobile - Whether device is mobile
 * @returns {string} Frame image source path
 */
export const getFrameImageSrc = (frameNum, isMobile) => {
  const folderPath = getFolderPath(isMobile);
  return `${folderPath}${CONFIG.framePrefix}${formatFrameNumber(frameNum)}${CONFIG.frameSuffix}`;
};

/**
 * Checks if a frame is a pause frame
 * @param {number} frame - Frame number to check
 * @param {boolean} isMobile - Whether device is mobile
 * @returns {boolean} True if frame is a pause frame
 */
export const isPauseFrame = (frame, isMobile) => {
  const pauseFrames = isMobile ? CONFIG.pauseFramesMobile : CONFIG.pauseFramesDesktop;
  return pauseFrames.includes(frame);
};

/**
 * Detects if the device is mobile
 * @returns {boolean} True if device is mobile
 */
export const detectMobile = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

