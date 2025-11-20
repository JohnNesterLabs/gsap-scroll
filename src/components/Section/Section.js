import React from 'react';
import './Section.css';

const Section = ({ className, children, id }) => {
  return (
    <div className={`section ${className}`} id={id}>
      {children}
    </div>
  );
};

export default Section;

