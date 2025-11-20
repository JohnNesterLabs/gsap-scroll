import React from 'react';
import './VideoIcon.css';

const VideoIcon = ({ onClick }) => {
  return (
    <div className="video-icon-container" onClick={onClick}>
      <svg 
        className="video-play-icon" 
        viewBox="0 0 24 24" 
        fill="white" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
    </div>
  );
};

export default VideoIcon;

