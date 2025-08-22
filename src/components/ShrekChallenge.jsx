import React, { useState, useRef, useEffect } from 'react';
import './ShrekChallenge.css';
import shrekImage from '../assets/ScaryShrek.png';

const ShrekChallenge = ({ onSuccess, completedChallenges, totalChallenges }) => {
  const [messages, setMessages] = useState([
    {
      type: 'shrek',
      content: "What are you doing in my swamp?! You better have a good reason or you're not getting in!",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Call Python script with user input
      const response = await callPythonScript(userMessage);
      
      if (response.success) {
        // Add Shrek's response
        const shrekMessage = {
          type: 'shrek',
          content: response.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, shrekMessage]);
        
        // Check if challenge is complete (Shrek is convinced)
        if (response.challenge_complete) {
          setChallengeComplete(true);
          setTimeout(() => {
            onSuccess();
          }, 2000); // Give user time to read the final message
        }
      } else {
        // Handle error
        const errorMessage = {
          type: 'shrek',
          content: "Sorry, I'm having trouble understanding. Try again!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error calling Python script:', error);
      const errorMessage = {
        type: 'shrek',
        content: "Something went wrong with my swamp magic. Try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callPythonScript = async (userInput) => {
    // This will be replaced with actual Python script call
    // For now, simulate the response
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different responses based on user input
        // In the future, this will call the actual Python script
        console.log('User input:', userInput);
        
        const responses = [
          "Hmm, that's interesting... but I'm still not convinced.",
          "You're getting warmer, but my swamp is very precious to me.",
          "That's a good point, but what about the rent?",
          "You know what? You seem like a decent person. Maybe...",
          "Alright, alright! You've convinced me. Welcome to my swamp! 🐸"
        ];
        
        const randomIndex = Math.floor(Math.random() * responses.length);
        const response = responses[randomIndex];
        const isComplete = randomIndex === responses.length - 1;
        
        resolve({
          success: true,
          response: response,
          challenge_complete: isComplete
        });
      }, 1000);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="shrek-challenge-overlay">
      <div className="shrek-challenge-container">
        {/* Challenge Counter */}
        <div className="challenge-counter-overlay">
          {completedChallenges}/{totalChallenges}
        </div>
        
        {/* Shrek image in the middle */}
        <div className="shrek-container">
          <img 
            src={shrekImage} 
            alt="Scary Shrek" 
            className="shrek-image"
          />
          
          {/* Chat bubble above Shrek */}
          {messages.length > 0 && (
            <div className="shrek-chat-bubble">
              <p>{messages[messages.length - 1].type === 'shrek' ? messages[messages.length - 1].content : ''}</p>
            </div>
          )}
        </div>
        
        {/* Chat interface at bottom */}
        <div className="chat-interface">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`chat-message ${message.type === 'user' ? 'user-message' : 'shrek-message'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message shrek-message">
                <div className="message-content">
                  <span className="typing-indicator">Shrek is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Convince Shrek to let you into his swamp..."
              className="chat-input"
              rows="2"
              disabled={isLoading || challengeComplete}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isLoading || challengeComplete}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
        
        {/* Success message */}
        {challengeComplete && (
          <div className="success-overlay">
            <div className="success-message">
              <h2>🎉 Welcome to the Swamp! 🐸</h2>
              <p>Shrek has been convinced! You may enter his swamp.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShrekChallenge;
