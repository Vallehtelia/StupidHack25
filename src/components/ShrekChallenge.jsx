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
  const [conversationHistory, setConversationHistory] = useState([]);
  
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
        
        // Update conversation history for next interaction
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: response.response }
        ]);
        
        // Check if challenge is complete (Shrek approves entrance)
        if (response.approved) {
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
    try {
      // Call the Python script with user input and conversation history
      const response = await fetch('/api/shrek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userInput,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling Python script:', error);
      // Fallback to simulated response if API fails
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('User input:', userInput);
          
          const responses = [
            {
              response: "Hmm, what are you doing in my swamp? You better have a good reason!",
              approved: false,
              reason: "Need to hear more about their intentions"
            },
            {
              response: "That's interesting... but I'm still not convinced. My swamp is very precious to me.",
              approved: false,
              reason: "Still suspicious of their motives"
            },
            {
              response: "You're getting warmer, but what about the rent? And don't cause any trouble!",
              approved: false,
              reason: "Getting closer but needs more convincing"
            },
            {
              response: "You know what? You seem like a decent person. Maybe I can make an exception...",
              approved: false,
              reason: "Almost convinced but not quite there"
            },
            {
              response: "Alright, alright! You've convinced me. Welcome to my swamp! 🐸",
              approved: true,
              reason: "User has shown good character and respect"
            }
          ];
          
          const randomIndex = Math.floor(Math.random() * responses.length);
          const response = responses[randomIndex];
          
          resolve({
            success: true,
            response: response.response,
            approved: response.approved,
            reason: response.reason
          });
        }, 1000);
      });
    }
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
