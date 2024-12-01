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
    <span className="username">{username}</span>
    <span className="balance">${balance}</span>
  </div>
    </header>
  );
};

export default Header;
