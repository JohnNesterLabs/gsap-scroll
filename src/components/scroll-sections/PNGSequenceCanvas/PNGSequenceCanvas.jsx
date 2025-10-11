import React, { useRef, useEffect, useCallback } from 'react';
import './PNGSequenceCanvas.css';

const PNGSequenceCanvas = ({ 
  startSection = 4,
  totalFrames = 328,
  framePrefix = 'frame_',
  frameSuffix = '.png',
  folderPath = '/frames-journey/',
  activeSection,
  sectionProgress
}) => {
  const canvasRef = useRef(null);
  const frameImagesRef = useRef({});
  const pendingRequestsRef = useRef(new Map());

  // Preload frame images with request management
  const preloadFrame = useCallback((frameNumber) => {
    // Return cached image if already loaded
    if (frameImagesRef.current[frameNumber] && frameImagesRef.current[frameNumber].complete) {
      return frameImagesRef.current[frameNumber];
    }

    // Cancel any pending request for this frame
    if (pendingRequestsRef.current.has(frameNumber)) {
      const pendingRequest = pendingRequestsRef.current.get(frameNumber);
      if (pendingRequest.abort) {
        pendingRequest.abort();
      }
      pendingRequestsRef.current.delete(frameNumber);
    }

    // Create new image element
    const img = new Image();
    const imageSrc = `${folderPath}${framePrefix}${String(frameNumber).padStart(4, '0')}${frameSuffix}`;
    
    // Create abort controller for this request
    const controller = new AbortController();
    pendingRequestsRef.current.set(frameNumber, controller);

    // Set up image loading
    img.onload = () => {
      pendingRequestsRef.current.delete(frameNumber);
    };
    
    img.onerror = () => {
      pendingRequestsRef.current.delete(frameNumber);
      console.warn(`Failed to load frame ${frameNumber}`);
    };

    // Handle abort signal
    controller.signal.addEventListener('abort', () => {
      img.src = '';
      pendingRequestsRef.current.delete(frameNumber);
    });

    // Start loading
    img.src = imageSrc;
    frameImagesRef.current[frameNumber] = img;
    
    return img;
  }, [folderPath, framePrefix, frameSuffix]);

  // Cleanup function for pending requests
  const cleanupPendingRequests = () => {
    pendingRequestsRef.current.forEach((controller) => {
      if (controller.abort) {
        controller.abort();
      }
    });
    pendingRequestsRef.current.clear();
  };

  // Render frame on canvas
  const renderFrame = useCallback((frameNumber) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = preloadFrame(frameNumber);

    const drawImageToFullScreen = () => {
      // Set canvas size to full viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to completely fill screen (crop if necessary)
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight;
      
      if (imgAspect > canvasAspect) {
        // Image is wider - crop sides to fill height
        drawHeight = canvas.height;
        drawWidth = canvas.width;
        
        // Calculate source crop area to maintain aspect ratio
        sourceHeight = img.height;
        sourceWidth = img.height * canvasAspect;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image is taller - crop top/bottom to fill width
        drawWidth = canvas.width;
        drawHeight = canvas.height;
        
        // Calculate source crop area to maintain aspect ratio
        sourceWidth = img.width;
        sourceHeight = img.width / canvasAspect;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      // Draw image scaled and cropped to fill entire screen
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle (crop area)
        0, 0, drawWidth, drawHeight                   // Destination rectangle (full screen)
      );
    };

    img.onload = () => {
      drawImageToFullScreen();
    };

    // If image is already loaded, draw it immediately
    if (img.complete) {
      drawImageToFullScreen();
    }
  }, [preloadFrame]);

  // Calculate frame based on section progress
  useEffect(() => {
    if (activeSection >= startSection) {
      // Calculate frame based on section progress
      const sectionOffset = activeSection - startSection;
      const progressInSection = sectionProgress;
      
      // Total progress across all sections from start section
      const totalProgress = sectionOffset + progressInSection;
      
      // Map progress to frame range (0 to totalFrames-1)
      const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
      const clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
      
      renderFrame(clampedFrame);
    }
  }, [activeSection, sectionProgress, startSection, totalFrames, renderFrame]);

  // Preload key frames for better performance
  useEffect(() => {
    preloadFrame(1);
    preloadFrame(Math.floor(totalFrames / 2));
    preloadFrame(totalFrames);
  }, [totalFrames, preloadFrame]);

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      cleanupPendingRequests();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (activeSection >= startSection) {
        // Re-render current frame with new canvas size
        const sectionOffset = activeSection - startSection;
        const progressInSection = sectionProgress;
        const totalProgress = sectionOffset + progressInSection;
        const frameIndex = Math.floor(totalProgress * (totalFrames - 1));
        const clampedFrame = Math.max(1, Math.min(totalFrames, frameIndex + 1));
        renderFrame(clampedFrame);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSection, sectionProgress, startSection, totalFrames, renderFrame]);

  // Don't render if not in the active section range
  if (activeSection < startSection) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="png-sequence-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 15,
        pointerEvents: 'none',
        opacity: 1,
        transition: 'opacity 0.1s ease'
      }}
    />
  );
};

export default PNGSequenceCanvas;
