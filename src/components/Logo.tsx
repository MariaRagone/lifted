import React from 'react';
import logo from '../assets/daily-lift-logo.png'; // Adjust path if needed
import './Logo.css';

const Logo: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <div className="logo-container" style={{ width: size, height: size }}>
      <img src={logo} alt="Daily Lift Logo" className="logo-image" />
    </div>
  );
};

export default Logo;
