import React from 'react';
import ProfileCard from './ProfileCard';
import './LeadershipSection.css';

// Leadership team data with placeholder images
const leadershipTeam = [
  {
    id: 1,
    name: 'Chaitanya Potluri',
    role: 'Co-Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=face',
    linkedInUrl: 'https://linkedin.com',
  },
  {
    id: 2,
    name: 'Sanjeev Gupta',
    role: 'CEO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&fit=crop&crop=face',
    linkedInUrl: 'https://linkedin.com',
  },
  {
    id: 3,
    name: 'Gurmeet Singh Manku',
    role: 'Chief AI Officer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop&crop=face',
    linkedInUrl: 'https://linkedin.com',
  },
  {
    id: 4,
    name: 'Hitesh Sharma',
    role: 'VP, Engineering',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&h=250&fit=crop&crop=face',
    linkedInUrl: 'https://linkedin.com',
  },
  {
    id: 5,
    name: 'John Ragsdale',
    role: 'SVP, Marketing',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&h=250&fit=crop&crop=face',
    linkedInUrl: 'https://linkedin.com',
  },
];

const LeadershipSection = () => {
  return (
    <section className="leadership">
      {/* Background Gradients */}
      <div className="leadership__bg-left" />
      <div className="leadership__bg-right" />

      {/* Content */}
      <div className="leadership__content">
        {/* Header */}
        <div className="leadership__header">
          <span className="leadership__tag">Our Leadership</span>
          <h2 className="leadership__title">
            Experienced leaders with diverse backgrounds
          </h2>
        </div>

        {/* Cards */}
        <div className="leadership__cards">
          {/* Row 1 */}
          <div className="leadership__row">
            {leadershipTeam.slice(0, 3).map((leader) => (
              <ProfileCard
                key={leader.id}
                name={leader.name}
                role={leader.role}
                image={leader.image}
                linkedInUrl={leader.linkedInUrl}
              />
            ))}
          </div>

          {/* Row 2 */}
          <div className="leadership__row leadership__row--center">
            {leadershipTeam.slice(3, 5).map((leader) => (
              <ProfileCard
                key={leader.id}
                name={leader.name}
                role={leader.role}
                image={leader.image}
                linkedInUrl={leader.linkedInUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;

