import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="demo-section demo-footer">
      <div className="footer-container">
        {/* Main Tagline Section */}
        <img
          src="/final-logo.svg"
          alt="Kahuna Labs"
          className="footer-logo-bg"
        />
        <div className="footer-tagline">
          <div className="footer-tagline-text">
            <div className="footer-tagline-line">
              Secure. Private. Comprehensive. Enterprise Grade.
            </div>
            {/* <div className="footer-tagline-line">Enterprise Grade.</div> */}
          </div>
        </div>

        {/* Footer Content */}
        <div className="footer-content">
          <div className="footer-links">
            {/* Technology Column */}
            <div className="footer-column">
              <h3 className="footer-column-title">TECHNOLOGY</h3>
              <ul className="footer-links-list">
                {/* <li>
                  <a
                    href="/technology/frontline-productivity"
                    className="footer-link"
                  >
                    Frontline Productivity
                  </a>
                </li> */}
                <li>
                  <a
                    href="https://form.jotform.com/251278392049160"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    How Complex is Your Support?
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="footer-column">
              <h3 className="footer-column-title">COMPANY</h3>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="mailto:info@kahunalabs.ai"
                    className="footer-link"
                  >
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:careers@kahunalabs.ai"
                    className="footer-link"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <a
                href="https://linkedin.com/company/kahuna-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-linkedin"
              >
                <img
                  src="/LinkedIn-Icon.png"
                  alt="LinkedIn"
                  className="footer-linkedin-icon"
                />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Kahuna Labs Logo */}
          <div className="footer-logo-section">
            <div className="footer-logo-container">
              <img src="/kahuna-logo-3.svg" alt="Kahuna Labs" />
            </div>
          </div>
        </div>

        {/* Bottom Copyright Line */}
        <div className="footer-copyright">
          <div className="footer-copyright-text">
            <div>
              <p>
                Kahuna AI and its components are trademarks of Kahuna Labs.
              </p>
              <p>
                The proprietary technology of Kahuna AI is protected by
                multiple issued and pending U.S. and international patents
                owned by Kahuna Labs.
              </p>
            </div>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
