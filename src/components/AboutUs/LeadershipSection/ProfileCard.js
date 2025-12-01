import React from 'react';
import { ArrowIcon } from '../../shared';
import './ProfileCard.css';

const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#74797b"/>
  </svg>
);

const ProfileCard = ({ image, name, role, linkedInUrl }) => {
  return (
    <div className="profile-card">
      <div className="profile-card__inner">
        {/* Image */}
        <div className="profile-card__image-container">
          <img 
            src={image} 
            alt={name} 
            className="profile-card__image"
          />
          <div className="profile-card__image-overlay" />
        </div>

        {/* Content */}
        <div className="profile-card__content">
          <div className="profile-card__info">
            {/* Text */}
            <div className="profile-card__text">
              <h3 className="profile-card__name">{name}</h3>
              <p className="profile-card__role">{role}</p>
            </div>

            {/* LinkedIn */}
            <a 
              href={linkedInUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="profile-card__linkedin"
              aria-label={`${name}'s LinkedIn`}
            >
              <LinkedInIcon />
            </a>

            {/* Divider */}
            <div className="profile-card__divider" />
          </div>

          {/* Read Bio Button */}
          <button className="profile-card__bio-button">
            <span>Read bio</span>
            <ArrowIcon size={14} color="#fafafa" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

