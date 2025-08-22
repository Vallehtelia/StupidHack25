import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import SuccessPage from './components/SuccessPage';
import BotPage from './components/BotPage';
import NokiaCaptchaModal from './components/NokiaCaptchaModal';
import './App.css';

function App() {
  const [captchaAttempts, setCaptchaAttempts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [totalChallenges] = useState(2);

  const handleCaptchaSuccess = () => {
    setIsModalOpen(false);
    const newCompleted = completedChallenges + 1;
    setCompletedChallenges(newCompleted);
    
    // Only redirect to success if both challenges are completed
    if (newCompleted >= totalChallenges) {
      setCaptchaAttempts(0);
    }
  };

  const handleCaptchaFailure = () => {
    const newAttempts = captchaAttempts + 1;
    setCaptchaAttempts(newAttempts);
    setIsModalOpen(false);
  };

  const openCaptcha = () => {
    setIsModalOpen(true);
  };

  const resetAttempts = () => {
    setCaptchaAttempts(0);
    setCompletedChallenges(0);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <LandingPage 
                  onLoginClick={openCaptcha} 
                  completedChallenges={completedChallenges}
                  totalChallenges={totalChallenges}
                />
                {isModalOpen && (
                  <NokiaCaptchaModal
                    onSuccess={handleCaptchaSuccess}
                    onFailure={handleCaptchaFailure}
                    onClose={() => setIsModalOpen(false)}
                  />
                )}
              </>
            } 
          />
          <Route 
            path="/success" 
            element={
              completedChallenges >= totalChallenges ? 
                <SuccessPage /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/bot" 
            element={
              captchaAttempts >= 3 ? 
                <BotPage onReset={resetAttempts} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
        
        {/* Redirect to bot page if 3 attempts reached */}
        {captchaAttempts >= 3 && <Navigate to="/bot" replace />}
        
        {/* Redirect to success page if both challenges completed */}
        {completedChallenges >= totalChallenges && <Navigate to="/success" replace />}
      </div>
    </Router>
  );
}

export default App;
