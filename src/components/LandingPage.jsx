import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onLoginClick, completedChallenges, totalChallenges }) => {
  return (
    <div className="landing-page">
      {/* Challenge Counter */}
      <div className="challenge-counter">
        {completedChallenges}/{totalChallenges}
      </div>
      
      <div className="landing-content">
        <h1>Welcome to Super tough CAPTCHA</h1>
        <p>Complete {totalChallenges} challenges to prove you are human</p>
        <button 
          className="login-button"
          onClick={onLoginClick}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
