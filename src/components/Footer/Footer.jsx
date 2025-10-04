import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Main Tagline Section */}
      <div className="footer-tagline">
        <div className="tagline-content">
          <h2 className="tagline-text">
            <span className="tagline-line">Secure. Private. Comprehensive.</span>
            <span className="tagline-line">Enterprise Grade.</span>
          </h2>
          <div className="tagline-graphic"></div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="footer-content">
        <div className="footer-columns">
          {/* Technology Column */}
          <div className="footer-column technology-column">
            <h3 className="column-header">TECHNOLOGY</h3>
            <ul className="column-links">
              <li><a href="#" className="column-link">Frontline Productivity</a></li>
              <li><a href="#" className="column-link">Estimate Agentic AI Impact</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column company-column">
            <h3 className="column-header">COMPANY</h3>
            <ul className="column-links">
              <li><a href="#" className="column-link">Contact us</a></li>
              <li><a href="#" className="column-link">Careers</a></li>
              <li className="social-link">
                <a href="#" className="linkedin-link">
                  <div className="linkedin-icon"></div>
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Kahuna Labs Logo */}
        <div className="footer-logo">
          <div className="logo-symbol"></div>
          <span className="logo-text">Kahuna Labs</span>
        </div>
      </div>

      {/* Bottom Copyright Line */}
      <div className="footer-bottom">
        <div className="copyright">
          All rights reserved to Kahuna Labs. Copyright © 2025.
        </div>
        <div className="attribution">
          Made by Nester Labs
        </div>
      </div>
    </footer>
  );
};

export default Footer;
