import React from 'react';
import ArrowIcon from '../ArrowIcon/ArrowIcon';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon = null,
  showArrow = false,
  arrowPosition = 'right',
  className = '',
  onClick,
  ...props
}) => {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} onClick={onClick} {...props}>
      {icon && arrowPosition === 'left' && (
        <span className="button__icon button__icon--left">{icon}</span>
      )}
      {showArrow && arrowPosition === 'left' && (
        <ArrowIcon 
          size={14} 
          color={variant === 'secondary' ? '#0c0c0d' : '#fafafa'} 
        />
      )}
      <span className="button__text">{children}</span>
      {showArrow && arrowPosition === 'right' && (
        <ArrowIcon 
          size={14} 
          color={variant === 'secondary' ? '#0c0c0d' : '#fafafa'} 
        />
      )}
      {icon && arrowPosition === 'right' && (
        <span className="button__icon button__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default Button;

