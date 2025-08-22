import React from 'react';
import { Link } from 'react-router-dom';
import './BotPage.css';

const BotPage = ({ onReset }) => {
  const handleTryAgain = () => {
    onReset();
  };

  return (
    <div className="bot-page">
      <div className="bot-content">
        <div className="bot-icon">🤖</div>
        <h1>Nice try, you bot!</h1>
        <p>You've failed the CAPTCHA 3 times.</p>
        <p className="bot-message">
          Your robotic nature has been exposed. 
          Only humans can master the Nokia 3310 Snake game.
        </p>
        <button onClick={handleTryAgain} className="retry-button">
          Try Again (Human)
        </button>
      </div>
    </div>
  );
};

export default BotPage;
