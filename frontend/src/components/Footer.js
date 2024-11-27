import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Akdeniz University Trading Bot App. All Rights Reserved.</p>
        <p>Developed by Muhammded Fatih Çınar and Özgür Cansız</p>
      </div>
    </footer>
  );
};

export default Footer;
