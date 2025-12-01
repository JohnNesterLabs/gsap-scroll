import React from 'react';
import CustomerCard from './CustomerCard';
import './CustomersSection.css';

// SVG Icons for customer cards
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const HeadsetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const customers = [
  {
    id: 1,
    icon: <ShieldIcon />,
    description: 'A $7B data security and management leader',
  },
  {
    id: 2,
    icon: <HeadsetIcon />,
    description: 'A global leader in customer experience platforms',
  },
  {
    id: 3,
    icon: <CpuIcon />,
    description: 'A Fortune 100 Tech Giant',
  },
  {
    id: 4,
    icon: <GlobeIcon />,
    description: 'A global leader in industry-specific enterprise software',
  },
  {
    id: 5,
    icon: <DatabaseIcon />,
    description: 'A $1B+ Data Management Leader',
  },
];

const CustomersSection = () => {
  return (
    <section className="customers">
      {/* Gradient Background */}
      <div className="customers__background" />
      
      <div className="customers__container">
        {/* Title */}
        <div className="customers__header">
          <span className="customers__tag">Our Customers</span>
          <h2 className="customers__title">
            <span>You're in</span>
            <span>good company</span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="customers__grid">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              icon={customer.icon}
              description={customer.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomersSection;

