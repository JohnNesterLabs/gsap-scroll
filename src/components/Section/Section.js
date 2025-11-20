import React from 'react';
import './Section.css';

const Section = ({ className, children, id, style }) => {
  return (
    <div className={`section ${className}`} id={id} style={style}>
      {children}
    </div>
  );
};

export default Section;

