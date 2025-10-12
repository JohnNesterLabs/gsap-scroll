import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const CanvasVideoPlayer = forwardRef(({ 
  videoSrc, 
  style, 
  className,
  onLoad,
  onError 
}, ref) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isLoadedRef = useRef(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.warn);
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    getCurrentTime: () => {
      return videoRef.current ? videoRef.current.currentTime : 0;
    },
    getDuration: () => {
      return videoRef.current ? videoRef.current.duration : 0;
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    let isPlaying = false;
    
    // Set canvas size to match container
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Set canvas size in CSS pixels
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr);
    };

    // Draw video frame to canvas
    const drawFrame = () => {
      if (video.readyState >= 2 && isPlaying) { // HAVE_CURRENT_DATA
        try {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
          
          // Calculate aspect ratio to maintain video proportions
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (videoAspect > canvasAspect) {
            // Video is wider than canvas
            drawHeight = canvas.height / (window.devicePixelRatio || 1);
            drawWidth = drawHeight * videoAspect;
            offsetX = (canvas.width / (window.devicePixelRatio || 1) - drawWidth) / 2;
          } else {
            // Video is taller than canvas
            drawWidth = canvas.width / (window.devicePixelRatio || 1);
            drawHeight = drawWidth / videoAspect;
            offsetY = (canvas.height / (window.devicePixelRatio || 1) - drawHeight) / 2;
          }
          
          // Draw video frame
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        } catch (error) {
          console.warn('Canvas drawing error:', error);
        }
      }
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      }
    };

    // Handle video events
    const handleLoadedData = () => {
      updateCanvasSize();
      isLoadedRef.current = true;
      if (onLoad) onLoad();
      console.log('Canvas video loaded successfully');
    };

    const handlePlay = () => {
      isPlaying = true;
      drawFrame();
    };

    const handlePause = () => {
      isPlaying = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleError = (e) => {
      console.error('Canvas video error:', e);
      if (onError) onError(e);
    };

    const handleResize = () => {
      updateCanvasSize();
    };

    // Set up video element
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.defaultMuted = true;
    video.controls = false;

    // Event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    window.addEventListener('resize', handleResize);

    // Initial setup
    updateCanvasSize();

    // Start playing
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Canvas video autoplay failed:", err);
        // Try again after user interaction for mobile Safari
        document.addEventListener('touchstart', () => {
          video.play().catch(console.warn);
        }, { once: true });
      });
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      window.removeEventListener('resize', handleResize);
    };
  }, [videoSrc, onLoad, onError]);

  return (
    <div 
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        ...style 
      }} 
      className={className}
    >
      {/* Hidden video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0, // Hidden, only used for canvas rendering
          pointerEvents: 'none',
          zIndex: -1
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
          pointerEvents: 'none',
          // Hardware acceleration
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
    </div>
  );
});

CanvasVideoPlayer.displayName = 'CanvasVideoPlayer';

export default CanvasVideoPlayer;
