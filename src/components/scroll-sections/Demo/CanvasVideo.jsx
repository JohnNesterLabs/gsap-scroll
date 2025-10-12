import React, { useEffect, useRef } from 'react';

const CanvasVideo = ({ 
  videoSrc, 
  style, 
  className,
  onLoad 
}) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Draw video frame to canvas
    const drawFrame = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Handle video events
    const handleLoadedData = () => {
      updateCanvasSize();
      drawFrame();
      if (onLoad) onLoad();
    };

    const handleResize = () => {
      updateCanvasSize();
    };

    // Event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    window.addEventListener('resize', handleResize);

    // Start drawing
    drawFrame();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener('loadeddata', handleLoadedData);
      window.removeEventListener('resize', handleResize);
    };
  }, [onLoad]);

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        webkit-playsinline="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0, // Hidden, only used for canvas rendering
          pointerEvents: 'none'
        }}
      />
      {/* Canvas that displays the video */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default CanvasVideo;
