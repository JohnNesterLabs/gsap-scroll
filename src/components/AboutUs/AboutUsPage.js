import React from 'react';
import { Navbar, Footer } from '../shared';
import HeroSection from './HeroSection/HeroSection';
import CustomersSection from './CustomersSection/CustomersSection';
import LeadershipSection from './LeadershipSection/LeadershipSection';
import InvestorsSection from './InvestorsSection/InvestorsSection';
import CareersSection from './CareersSection/CareersSection';
import './AboutUsPage.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="about-us-page__main">
        {/* Hero Section - Position: 0-900px */}
        <HeroSection />

        {/* Our Customers Section - Position: 900-1696px */}
        <CustomersSection />

        {/* Our Leadership Section - Position: 1696-3076px */}
        <LeadershipSection />

        {/* Our Investors Section - Position: 3076-3640px */}
        <InvestorsSection />

        {/* Careers Section - Position: 3640-4456px */}
        <CareersSection />

        {/* Footer - Position: 4456-5244px */}
        <Footer />
      </main>
    </div>
  );
};

export default AboutUsPage;

