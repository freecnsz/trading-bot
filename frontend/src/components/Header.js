// src/components/Header.js
import React from 'react';
import './Header.css';

const Header = ({ username, balance }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Trading Bot</h1>
      </div>
      <div className="header-info">
    <span className="username">JohnDoe</span>
    <span className="balance">Balance: $1000</span>
  </div>
    </header>
  );
};

export default Header;
