import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Large Logo Watermark */}
      <div className="footer__watermark">
        <svg width="286" height="317" viewBox="0 0 286 317" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M143 0L286 82V235L143 317L0 235V82L143 0Z" fill="url(#footerLogoGradient)" fillOpacity="0.1"/>
          <defs>
            <linearGradient id="footerLogoGradient" x1="0" y1="0" x2="286" y2="317" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0632f9"/>
              <stop offset="1" stopColor="#00a3ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="footer__container">
        <div className="footer__content">
          {/* Title */}
          <h2 className="footer__title">
            Secure. Private. Comprehensive. Enterprise Grade.
          </h2>

          {/* Feature Card */}
          <div className="footer__feature-card">
            <p className="footer__feature-text">
              Recommendations at Every Ticket Progression
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="footer__nav">
            <div className="footer__columns">
              {/* Company Column */}
              <div className="footer__column">
                <h3 className="footer__column-title">COMPANY</h3>
                <ul className="footer__links">
                  <li><a href="#contact" className="footer__link">Contact us</a></li>
                  <li><a href="#careers" className="footer__link">Careers</a></li>
                </ul>
              </div>

              {/* Technology Column */}
              <div className="footer__column">
                <h3 className="footer__column-title">TECHNOLOGY</h3>
                <ul className="footer__links">
                  <li><a href="#complexity" className="footer__link">How Complex is Your Support?</a></li>
                  <li><a href="#blog" className="footer__link">Blog</a></li>
                </ul>
              </div>

              {/* LinkedIn */}
              <div className="footer__linkedin">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#74797b"/>
                </svg>
                <span className="footer__linkedin-text">LinkedIn</span>
              </div>
            </div>

            {/* Footer Logo */}
            <div className="footer__logo">
              <svg width="35" height="39" viewBox="0 0 35 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 0L35 10V29L17.5 39L0 29V10L17.5 0Z" fill="url(#footerSmallLogoGradient)"/>
                <defs>
                  <linearGradient id="footerSmallLogoGradient" x1="0" y1="0" x2="35" y2="39" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0632f9"/>
                    <stop offset="1" stopColor="#00a3ff"/>
                  </linearGradient>
                </defs>
              </svg>
              <svg width="155" height="20" viewBox="0 0 155 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="15" fill="#fafafa" fontSize="16" fontWeight="500" fontFamily="DM Sans, sans-serif">Kahuna Labs</text>
              </svg>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="footer__bottom">
            <div className="footer__legal">
              <p>Kahuna AI and its components are trademarks of Kahuna Labs.</p>
              <p>The proprietary technology of Kahuna AI is protected by multiple issued and pending U.S. and international patents owned by Kahuna Labs.</p>
            </div>
            <p className="footer__rights">All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

