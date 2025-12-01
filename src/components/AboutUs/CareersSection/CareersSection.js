import React from 'react';
import { ArrowIcon } from '../../shared';
import './CareersSection.css';

const MailIcon = ({ color = '#fafafa' }) => (
  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M1 3L7 7L13 3M1 1H13C13 1 13 1 13 1V10C13 10 13 10 13 10H1C1 10 1 10 1 10V1C1 1 1 1 1 1Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CareersSection = () => {
  return (
    <section className="careers">
      {/* Background */}
      <div className="careers__background" />

      {/* Content */}
      <div className="careers__content">
        <div className="careers__main">
          {/* Text Content */}
          <div className="careers__text-content">
            <div className="careers__header">
              <span className="careers__tag">Careers</span>
              <h2 className="careers__title">Build the next big thing</h2>
            </div>

            <div className="careers__body">
              <p className="careers__paragraph">
                <span>Solve the </span>
                <span>h</span>
                <span>ard </span>
                <span>pr</span>
                <span>oblems.</span>
                <span> The challenges we face are unique.</span>
              </p>
              <p className="careers__paragraph">&nbsp;</p>
              <p className="careers__paragraph">
                If you're passionate about transforming frontline productivity with AI, we want to talk to you.
              </p>
            </div>
          </div>

          {/* Hiring Info */}
          <div className="careers__hiring">
            <div className="careers__chip">
              <span className="careers__chip-dot" />
              <span className="careers__chip-text">Actively Hiring</span>
            </div>
            <p className="careers__roles">AI/ML Researchers & Engineers</p>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="careers__ctas">
          {/* Resume Card */}
          <div className="careers__cta-card">
            <p className="careers__cta-text">Send us your resume</p>
            <button className="careers__cta-button careers__cta-button--primary">
              <MailIcon color="#fafafa" />
              <span>careers@kahunalabs.ai</span>
            </button>
          </div>

          {/* Contact Card */}
          <div className="careers__cta-card">
            <p className="careers__cta-text">Contact us</p>
            <button className="careers__cta-button careers__cta-button--secondary">
              <MailIcon color="#0c0c0d" />
              <span>info@kahunalabs.ai</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;

