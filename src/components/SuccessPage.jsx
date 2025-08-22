import React from 'react';
import { Link } from 'react-router-dom';
import './SuccessPage.css';

const SuccessPage = () => {
  return (
    <div className="success-page">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Access granted!</h1>
        <p>You are human.</p>
        <p className="success-message">
          Congratulations! You've successfully completed the Nokia 3310 Snake CAPTCHA.
          Your human status has been verified.
        </p>
        <Link to="/" className="back-button">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
